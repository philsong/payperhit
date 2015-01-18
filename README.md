Pay Per Hit
===========

Add micropayments to your web api

Getting Started
---------------

```sh
npm install payperhit payperhit-levelup express
```

```javascript
var app = require('express')();
var payperhit = require('payperhit');
var payperhit_levelup = require('payperhit-levelup');

var pph = payperhit({
  backend: payperhit_levelup('~/.payperhit'),
  paymentAddress: '1DhueLdyeocpeDfUbX4EH1keCwMXYp5386'
});

// Setup payment channel support
pph.setup(app);

var SATOSHIS = 1;
app.get('/value/<key>', pph.charge(1 * SATOSHIS), function(req, res) {
    res.end('Did I just pay 1 satoshi to read this?');
});
app.put('/value/<key>', pph.charge(10 * SATOSHIS), function(req, res) {
    res.end('You just payed 10 satoshis to post here');
});
```

pph.setup(app) is shortcut for:
```javascript
app.use(pph);
app.post('/_pph/init',  pph.init);  // Setup the endpoint that returns a new public key ("session id?")
app.post('/_pph/setup', pph.setup); // Sign the refund transaction
app.post('/_pph/start', pph.start); // Takes the commitment transaction and first payment
app.post('/_pph/end',   pph.end);   // Finishes the payment channel cleanly
```
