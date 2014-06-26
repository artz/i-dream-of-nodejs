// http://nodejs.org/
var http = require('http');

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337);

console.log('HTTP server running on port 1337');
