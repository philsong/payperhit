var fs = require('fs');
var request = require('request');

request({
  method: 'POST',
  url: 'http://localhost:5050/_pph/init'
}, function(error, meta, body) {
  console.log('Received public key: ' + body);
  fs.writeFileSync('server.public.key', body);
});
