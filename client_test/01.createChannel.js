'use strict';

var bitcore = require('bitcore');
var fs = require('fs');
var PrivateKey = bitcore.PrivateKey;
var PublicKey = bitcore.PublicKey;
var Network = bitcore.Networks;
var channel = require('bitcore-channel');
var Consumer = channel.Consumer;
var explorers = require('bitcore-explorers');

var fundingKey = new PrivateKey(fs.readFileSync('funding.key').toString());
var refundKey = new PrivateKey(fs.readFileSync('refund.key').toString());
var commitmentKey = new PrivateKey(fs.readFileSync('commitment.key').toString());

var providerKey = new PublicKey(fs.readFileSync('server.public.key').toString());

console.log(fundingKey, refundKey, commitmentKey, providerKey);

var consumer = new Consumer({
  fundingKey: fundingKey,
  refundKey: refundKey,
  refundAddress: refundKey.toAddress(),
  commitmentKey: commitmentKey,
  providerPublicKey: providerKey,
  providerAddress: providerKey.toAddress()
});

var insight = new explorers.Insight();

console.log('Checking balance in ' + consumer.fundingAddress.toString());
insight.getUnspentUtxos(consumer.fundingAddress, function(err, utxos) {
  consumer.processFunding(utxos);
  consumer.commitmentTx._updateChangeOutput();
  fs.writeFileSync('unsigned.refund.transaction', consumer.setupRefund().toJSON());
  console.log('Refund transaction, partial', consumer.refundTx.serialize());
  fs.writeFileSync('commitment.transaction', consumer.commitmentTx.toJSON());
  console.log('Commitment Transaction', consumer.commitmentTx.toString());
});
