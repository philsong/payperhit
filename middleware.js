var bitcore = require('bitcore');
var bodyParser = require('body-parser');

var $ = function(check, message) {
  if (!check) {
    throw new Error('Invalid state: ' + message);
  }
};

function payperhit(opts) {
  var self = this;

  $(opts.backend, 'Must provide a backend');

  /**
   * @type {PPHBackend}
   * @desc The database provider to store state about payment channels
   */
  this.backend = opts.backend;

  /**
   * @type {bitcore.Address}
   * @desc The address where all payments will go. If set to null, a private key
   * will be created for each refund signed
   */
  this.paymentAddress = new bitcore.Address(opts.paymentAddress);

  /**
   * Parses headers and retrieves information about any payment updates in the
   * headers of the request
   */
  var PUBLIC_KEY_HEADER = 'X-PPH-PUBLIC-KEY';
  var PAYMENT_UPDATE = 'X-PPH-PAYMENT';
  var middleware = function(req, res, next) {
    var setUsedBalance = function() {
      backend.getUsedBalance(req.headers.get(PUBLIC_KEY_HEADER), function(err, balance) {
        if (err) {
          return res.end('Internal error when retrieving payment channel status');
        }
        req.pph.usedBalance = balance;
        next();
      });
    };
    req.pph = req.pph || {};
    if (!req.headers.get(PUBLIC_KEY_HEADER)) {
      return res.end('Must specify the payment channel public key with ' + PUBLIC_KEY_HEADER);
    }
    backend.getProvider(req.headers.get(PUBLIC_KEY_HEADER), function(err, provider) {
      req.pph.provider = provider;
      req.pph.currentAmount = provider.currentAmount;
      if (req.headers.get(PAYMENT_UPDATE)) {
        try {
          provider.validatePayment(JSON.parse(req.headers.get(PAYMENT_UPDATE)));
          backend.updateLastPayment(publicKey, provider.currentAmount, function(err) {
            if (err) {
              console.log(err);
              return res.end('Internal error');
            }
            req.pph.currentAmount = provider.currentAmount;
            setUsedBalance();
          });
        } catch (error) {
          console.log(error);
          return res.end('Invalid payment received');
        }
      } else {
        setUsedBalance();
      }
    });
  };

  middleware.requests = {};

  /**
   * Default route: "/_pph/init"
   * Returns a public key so a payment channel can be initiated
   */
  middleware.requests.init = function(req, res) {
    self.backend.createPrivateKey(function(err, privateKey) {
      response.end(privateKey.publicKey.toString());
    });
  };

  /**
   * Default route: "/_pph/setup"
   * Receives a public key and a refund transaction to be signed.
   */
  middleware.requests.setup = function(req, res) {
    if (!req.body) {
      return res.end('Must provide a json body for this request');
    }

    var publicKey = req.body.publicKey;
    var refund = req.body.refund;

    if (!publicKey) {
      return res.end('Must provide a `publicKey` param in the json body');
    }
    if (!refund) {
      return res.end('Must provide a `refund` param in the json body');
    }

    backend.getPrivateKey(publicKey, function(err, privateKey) {
      if (err) {
        console.log(err);
        return res.end('Unable to retrieve information about that public key');
      }

      var provider = channel.Provider({
        key: privateKey
      });

      var response = {};
      try {
        response.refund = provider.signRefund(refund).toJSON();
      } catch (error) {
        console.log(error);
        return res.end('Internal error on refund signing');
      }

      if (self.paymentAddress) {
        response.paymentAddress = self.paymentAddress;
        return res.end(response);
      } else {
        backend.createPaymentAddressFor(publicKey, function(err, paymentAddress) {
          if (error) {
            console.log(error);
            return res.end('Internal error on refund signing');
          }
          response.paymentAddress = paymentAddress;
          return res.end(response);
        });
      }
    });
  };

  /**
   * Default route: "/_pph/start"
   * Receives a first payment transaction
   */
  middleware.requests.start = function(callback) {
    if (!req.body) {
      return res.end('Must provide a json body for this request');
    }

    var publicKey = req.body.publicKey;
    var paymentTx = req.body.payment;

    if (!publicKey) {
      return res.end('Must provide a `publicKey` param in the json body');
    }
    if (!paymentTx) {
      return res.end('Must provide a `payment` param in the json body');
    }
    var provider = channel.Provider({});
    async.waterfall([
      function(callback) {
        backend.getPrivateKey(publicKey, function(err, privateKey) {
          if (err) {
            console.log(err);
            return callback('Unable to retrieve information about that public key');
          }
          provider.key = privateKey;
          return callback();
        });
      },
      function(callback) {
        if (self.paymentAddress) {
          provider.paymentAddress = self.paymentAddress;
          return callback();
        } else {
          backend.getPaymentKeyFor(publicKey, function(err, paymentKey) {
            if (err) {
              console.log(err);
              return callback(err);
            }
            provider.paymentAddress = paymentKey.toAddress();
            return callback();
          });
        }
      },
      function(callback) {
        try {
          provider.validPayment(paymentTx);
          return backend.savePaymentTransaction(provider.paymentTx, callback);
        } catch (e) {
          console.log(e);
          return callback('Invalid payment');
        }
      }
    ], function(err) {
      if (err) {
        return res.end('Bad request or internal error');
      }
      return res.end(JSON.stringify({success: true}));
    });
  };

  /**
   * Default route: "/_pph/end"
   * Closes up the payment channel
   */
  middleware.requests.end = function(callback) {
    // TODO
  };

  /**
   * Decrements the balance for the payment channel, fails if not enough funds.
   */
  middleware.charge = function(amount) {
    return function(req, res, next) {
      middleware(req, res, function(req, res) {
        var available = req.pph.currentAmount - req.pph.usedBalance;
        if (available < amount) {
          res.statusCode(402);
          return res.end('Insufficient funds: available ' + available + ', need ' + amount);
        }
        next();
      });
    };
  };

  middleware.setup = function(app) {
    var jsonParser = bodyParser.json();

    app.use(middleware);

    // Setup the endpoint that returns a new public key ("session id?")
    app.post('/_pph/init', middleware.requests.init);

    // Sign the refund transaction
    app.post('/_pph/setup', jsonParser, middleware.requests.setup);

    // Takes the commitment transaction and first payment
    app.post('/_pph/start', jsonParser, middleware.requests.start);

    // Finishes the payment channel cleanly
    app.post('/_pph/end', jsonParser, middleware.requests.end);
  };

  return middleware;
}

module.exports = payperhit;
