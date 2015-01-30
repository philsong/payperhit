var bitcore = require('bitcore');
var assert = require('assert');
var fs = require('fs');
var request = require('request');
var channel = require('bitcore-channel');

var providerKey = new bitcore.PublicKey(fs.readFileSync('server.public.key').toString());

var fundingKey = new PrivateKey(fs.readFileSync('funding.key').toString());
var refundKey = new PrivateKey(fs.readFileSync('refund.key').toString());
var commitmentKey = new PrivateKey(fs.readFileSync('commitment.key').toString());

var refund = JSON.parse(fs.readFileSync('unsigned.refund.transaction'));

request.post({
  url: 'http://localhost:5050/_pph/setup', 
  body: {
    publicKey: providerKey.toString(),
    refund: refund
  },
  json: true
}, function(err, meta, body) {
  if (err) {
    console.log('error: ', err);
  } else {
    // TODO: Check that public key matches for signature
    // TODO: Check that signature is correct
    var transaction = new channel.Transactions.Refund(body.refund);
    console.log('Id: ', transaction.id);
    console.log('Raw: ', transaction.serialize());
    console.log('Payment Address: ', body.paymentAddress);
    fs.writeFileSync('signed.refund.transaction', transaction.toJSON());
    fs.writeFileSync('payment.address', body.paymentAddress);
  }
});

