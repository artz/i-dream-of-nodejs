// http://nodejs.org/
var http = require('http');

http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	setTimeout(function () {
		res.end('Hello World\n');
	}, 1000)
}).listen(1339);

console.log('Benchmark HTTP server running on port 1339');
