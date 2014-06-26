/* jshint node: true */
'use strict';
var net = require('net');

var sockets = [];
var server = net.createServer(function (thisSocket) {

	thisSocket.write('Welcome to Node Chat!\n');

	sockets.push(thisSocket);

	thisSocket.on('data', function (data) {
		// Send message to all sockets except sender.
		sockets.forEach(function (socket) {
			if (socket !== thisSocket) {
				socket.write(data);
			}
		});
	});

	// Remove this socket from queue if disconnected.
	thisSocket.on('end', function () {
		sockets.splice(sockets.indexOf(thisSocket), 1);
	});

});

server.listen(1337);
console.log('Chat TCP server running on port 1337');
