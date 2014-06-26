// http://nodejs.org/
var net = require('net');

var server = net.createServer(function (socket) {
  socket.write('Echo server\r\n');
  socket.pipe(socket);
});

server.listen(1337);
console.log('TCP server running on port 1337');
