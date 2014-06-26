/* jshint node: true */
'use strict';
var net = require('net');

var sockets = [];
var server = net.createServer(function (thisSocket) {

	thisSocket.write('Welcome to Node Chat! What\'s your name?\n');

	sockets.push(thisSocket);

	var name;
	function welcome(data) {
		name = data.toString().replace(/(\r\n|\n|\r)/gm, '');
		thisSocket.write('Welcome, ' + name + '!\n\n');
		console.log(name + ' has joined the chat.');

		thisSocket.removeListener('data', welcome);
		thisSocket.on('data', function (data) {
			var message = name + '> ' + data;
			console.log(message);
			sockets.forEach(function (socket) {
				if (socket !== thisSocket) {
					socket.write(message);
				}
			});
		});
	}
	thisSocket.on('data', welcome);

	thisSocket.on('end', function () {
		sockets.splice(sockets.indexOf(thisSocket), 1);
	});

});

server.listen(1337);
console.log('Chat TCP server running on port 1337');
