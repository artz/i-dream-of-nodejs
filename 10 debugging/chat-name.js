/* jshint node: true */
'use strict';
var net = require('net');
var fs = require('fs');

var sockets = [];
var server = net.createServer(function (thisSocket) {

	thisSocket.write('Welcome to Node Chat!\nWhat\'s your name?\n');

	sockets.push(thisSocket);

	function welcome(data) {

		var name = data.toString().replace(/(\r\n|\n|\r)/gm, '');

		// Save name on the socket.
		thisSocket.name = name;
		console.log(name + ' has joined the chat.');

		thisSocket.write('Welcome, ' + name + '!\n\n');
		thisSocket.removeListener('data', welcome);
		thisSocket.on('data', function (data) {
			var message = name + '> ' + data;
			// console.log(message);
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

var chalk = require('chalk');
function nuke(name) {
	name && console.log('Targeting ' + name + '...');

	sockets.forEach(function (socket) {
		if (name && socket.name !== name) {
			return;
		}
		console.log('Nuking ' + socket.name + '...');
		socket.write(chalk.red('Nuclear launch detected!\n'));
		var seconds = 5;
		socket.write(chalk.red(seconds + '\n'));
		var timer = setInterval(function () {
			seconds -= 1;
			if (seconds === 0) {
				clearInterval(timer);
				var bomb = fs.readFile('./nuke.txt', function (err, data) {
					socket.write(data.toString());
					socket.end(chalk.red('You\'ve been nuked!\n'));
					console.log(chalk.red(socket.name + ' has been nuked!'));
				});
			} else {
				socket.write(chalk.red(seconds + '\n'));
			}
		}, 1000);
	});
}

// http://nodejs.org/api/repl.html
var repl = require('repl').start({ prompt: 'node-chat> '});
repl.context.sockets = sockets;
repl.context.nuke = nuke;
