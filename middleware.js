
var $ = function(check, message) {
  if (!check) {
    throw new Error('Invalid state: ' + message);
  }
};

function levelup(opts) {
}

function payperhit(opts) {
  var self = this;

  $(opts.backend, 'Must provide a backend');

  /**
   * @type {PPHBackend}
   * @desc The database provider to store state about payment channels
   */
  this.backend = opts.backend;

  /**
   * Parses headers and retrieves information about any payment updates in the
   * headers of the request
   */
  var middleware = function(req, res, next) {
  };

  /**
   * Default route: "/_pph/init"
   * Returns a public key so a payment channel can be initiated
   */
  middleware.init = function(req, res) {
    self.backend.createPrivKey(function(err, privateKey) {
      response.end(privateKey.publicKey.toString());
    });
  };

  /**
   * Default route: "/_pph/setup"
   * Receives a public key and a refund transaction to be signed.
   */
  middleware.setup = function(callback) {
  };

  /**
   * Default route: "/_pph/start"
   * Receives a commitment transaction
   */
  middleware.start = function(callback) {
  };

  /**
   * Default route: "/_pph/end"
   * Closes up the payment channel
   */
  middleware.end = function(callback) {
  };

  /**
   * Decrements the balance for the payment channel, fails if not enough funds.
   */
  middleware.charge = function(req, res, next) {
  };

  return middleware;
}
