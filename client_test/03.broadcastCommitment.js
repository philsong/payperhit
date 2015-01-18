'use strict';

var assert = require('assert');
var fs = require('fs');
var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');
var PrivateKey = bitcore.PrivateKey;
var PublicKey = bitcore.PublicKey;
var channel = require('bitcore-channel');
var Consumer = channel.Consumer;
var Commitment = channel.Transactions.Commitment;

var fundingKey = new PrivateKey(fs.readFileSync('funding.key').toString());
var refundKey = new PrivateKey(fs.readFileSync('refund.key').toString());
var commitmentKey = new PrivateKey(fs.readFileSync('commitment.key').toString());

var providerKey = new PublicKey(fs.readFileSync('server.public.key').toString());

var consumer = new Consumer({
  fundingKey: fundingKey,
  refundKey: refundKey,
  refundAddress: refundKey.toAddress(),
  commitmentKey: commitmentKey,
  providerPublicKey: providerKey,
  providerAddress: providerKey.toAddress()
});

var commitment = JSON.parse(fs.readFileSync('commitment.transaction').toString());
consumer.commitmentTx = new Commitment(commitment);
assert(consumer.commitmentTx.isFullySigned());

var refund = JSON.parse(fs.readFileSync('signed.refund.transaction'));

try {
  consumer.validateRefund(refund);
  console.log('Refund signature is valid. Broadcasting...');
  var insight = new explorers.Insight();

  /*
  insight.broadcast(consumer.commitmentTx, function(err, txid) {
    if (err) {
      console.log('Error broadcasting');
    } else {
      console.log('Commitment transaction broadcasted as', txid);
    }
  });
  */
} catch (err) {
  console.log('Error, refund is not fully signed');
  throw err;
}

