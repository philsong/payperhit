'use strict';

var assert = require('assert');
var request = require('request');
var fs = require('fs');
var bitcore = require('bitcore');
var channel = require('bitcore-channel');
var PrivateKey = bitcore.PrivateKey;
var Consumer = channel.Consumer;
var Commitment = channel.Transactions.Commitment;

var providerKey = new bitcore.PublicKey(fs.readFileSync('server.public.key').toString());
var fundingKey = new PrivateKey(fs.readFileSync('funding.key').toString());
var refundKey = new PrivateKey(fs.readFileSync('refund.key').toString());
var commitmentKey = new PrivateKey(fs.readFileSync('commitment.key').toString());

var consumer = new Consumer({
  fundingKey: fundingKey,
  refundKey: refundKey,
  refundAddress: refundKey.toAddress(),
  commitmentKey: commitmentKey,
  providerPublicKey: providerKey,
  providerAddress: providerKey.toAddress(),
  network: bitcore.Networks.testnet
});

var commitment = JSON.parse(fs.readFileSync('commitment.transaction'));
consumer.commitmentTx = new Commitment(commitment);

var refund = JSON.parse(fs.readFileSync('signed.refund.transaction'));
consumer.validateRefund(refund);
consumer.incrementPaymentBy(0);

var body = {
  publicKey: providerKey.toString(),
  commitment: consumer.commitmentTx.toObject(),
  payment: consumer.paymentTx.toObject()
};

request.get({
  url: 'http://localhost:5050/read',
  headers: {
    'x-pph-public-key': providerKey.toString()
  }
}, function(err, meta, body) {
  console.log(arguments);
});
