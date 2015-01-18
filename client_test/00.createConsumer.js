var channel = require('bitcore-channel');
var fs = require('fs');
var bitcore = require('bitcore');

var refundKey = new bitcore.PrivateKey(bitcore.Networks.testnet);
var fundingKey = new bitcore.PrivateKey(bitcore.Networks.testnet);
var commitmentKey = new bitcore.PrivateKey(bitcore.Networks.testnet);

console.log('Refund key: ' + refundKey.toString());
fs.writeFileSync('refund.key', refundKey.toString());
console.log('Funding key: ' + fundingKey.toString());
fs.writeFileSync('funding.key', fundingKey.toString());
console.log('Commitment key: ' + commitmentKey.toString());
fs.writeFileSync('commitment.key', commitmentKey.toString());
