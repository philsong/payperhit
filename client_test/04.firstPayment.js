'use strict';

var assert = require('assert');
var fs = require('fs');
var bitcore = require('bitcore');
var PrivateKey = bitcore.PrivateKey;
var Consumer = require('../lib/Consumer');
var Commitment = require('../lib/transactions/Commitment');

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

var commitment = JSON.parse(fs.readFileSync('commitment.log'));
consumer.commitmentTx = new Commitment(commitment);

var refund = JSON.parse(fs.readFileSync('signed.refund.log'));
consumer.validateRefund(refund);
consumer.incrementPaymentBy(0);


