var bitcore = require('bitcore');
var channel = require('bitcore-channel');
var async = require('async');
var leveldb = require('level');

function LevelUpBackend(opts) {
  if (!(this instanceof LevelUpBackend)) {
    return new LevelUpBackend(opts);
  }
  this.db = leveldb(opts);
}

var PUBKEY_TO_PRIVKEY = 'pubkey-';
var PUBKEY_TO_PAYMENT_PRIVATE_KEY  = 'paymentkey-';
var PUBKEY_TO_PAYMENT = 'transaction-';
var PUBKEY_TO_BALANCE = 'balance-';

LevelUpBackend.Errors = {
  DBERROR: 'Unexpected Error when operating with database'
};

LevelUpBackend.prototype.createPrivateKey = function(callback) {
  var privateKey = new bitcore.PrivateKey();
  var key = PUBKEY_TO_PRIVKEY + privateKey.publicKey.toString();
  this.db.put(key, privateKey.toString(), function(err) {
    if (err) {
      console.log(err);
      return callback(LevelUpBackend.Errors.DBERROR);
    }
    return callback(null, privateKey);
  });
};

LevelUpBackend.prototype.getPrivateKey = function(publicKey, callback) {
  var key = PUBKEY_TO_PRIVKEY + publicKey;
  this.db.get(key, function(err, result) {
    if (err) {
      console.log(err);
      return callback(LevelUpBackend.Errors.DBERROR);
    }
    return callback(null, new bitcore.PrivateKey(result));
  });
};

LevelUpBackend.prototype.createPaymentAddressFor = function(publicKey, callback) {
  var key = PUBKEY_TO_PAYMENT_PRIVATE_KEY + publicKey;
  var privateKey = new bitcore.PrivateKey();
  var address = privateKey.toAddress();
  this.db.put(key, privateKey.toString(), function(err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback(null, address);
  });
};

LevelUpBackend.prototype.getPaymentKeyFor = function(publicKey, callback) {
  var key = PUBKEY_TO_PAYMENT_PRIVATE_KEY + publicKey;
  this.db.get(key, function(err, data) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    var privateKey = new bitcore.PrivateKey(data);
    return callback(null, privateKey);
  });
};

LevelUpBackend.prototype.getLastPaymentTransaction = function(publicKey, callback) {
  var key = PUBKEY_TO_PAYMENT + publicKey;
  this.db.get(key, function(err, data) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback(err, new channel.Transaction.Payment(data));
  });
};

LevelUpBackend.prototype.savePaymentTransaction = function(publicKey, transaction, callback) {
  var key = PUBKEY_TO_PAYMENT + publicKey;
  this.db.put(key, transaction.toJSON(), function(err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback();
  });
};

LevelUpBackend.prototype.getUsedBalance = function(publicKey, callback) {
  var key = PUBKEY_TO_BALANCE + publicKey;
  this.db.get(key, function(err, data) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback(err, data);
  });
};

LevelUpBackend.prototype.saveUsedBalance = function(publicKey, balance, callback) {
  var key = PUBKEY_TO_BALANCE + publicKey;
  this.db.put(key, balance, function(err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback();
  });
};

LevelUpBackend.prototype.getProvider = function(publicKey, paymentAddress, callback) {
  async.parallel([
    function(callback) {
      getPrivateKey(publicKey, callback);
    },
    function(callback) {
      getPaymentKeyFor(publicKey, function(err, paymentKey) {
        // Ignore errors (there may not be any payment key)
        return callback(null, paymentKey);
      });
    },
    function(callback) {
      getLastPaymentTransaction(publicKey, callback);
    }
  ], function(err, results) {
    if (err) {
      return callback(err);
    }
    var provider = new channel.Provider({
      key: results[0],
      paymentAddress: results[1] ? results[1].toAddress() : paymentAddress,
      currentAmount: results[2].currentAmount
    });
    provider.paymentTx = results[2];
    return callback(null, provider);
  });
};

module.exports = LevelUpBackend;
