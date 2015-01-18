var app = require('express')();
var payperhit = require('./middleware');
var payperhit_levelup = require('./backend');

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
