var app = require('express')();
var payperhit = require('./middleware');
var payperhit_levelup = require('./backend');

var pph = payperhit({
  backend: payperhit_levelup('./.payperhit'),
  paymentAddress: 'mjs48NFDC9A7GLoboj9s6YsAm4mAumeuVd'
});

// Setup payment channel support
pph.setup(app);

var SATOSHIS = 1;
app.get('/read', pph.charge(1 * SATOSHIS), function(req, res) {
    res.end('Did I just pay 1 satoshi to read this?');
});
app.put('/write', pph.charge(10 * SATOSHIS), function(req, res) {
    res.end('You just payed 10 satoshis to post here');
});

app.listen(5050);
console.log('Express server started on port %s', 5050);
