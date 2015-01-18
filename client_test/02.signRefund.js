var bitcore = require('bitcore');
var assert = require('assert');
var fs = require('fs');
var request = require('request');

var providerKey = new bitcore.PublicKey(fs.readFileSync('server.public.key').toString());

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
    console.log('Transaction signed correctly');
    var transaction = bitcore.Transaction(body.refund.transaction);
    console.log('Id: ', transaction.id);
    console.log('Raw: ', transaction.serialize());
    console.log('Payment Address: ', body.paymentaddress);
    fs.writeFileSync('signed.refund.transaction', JSON.stringify(body.refund));
    fs.writeFileSync('payment.address', body.paymentAddress);
  }
});

