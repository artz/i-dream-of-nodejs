/* jshint node: true */
'use strict';
var net = require('net');

var sockets = [];
var question = 'What\'s your favorite programming language?';
var answers = [
	'Python',
	'Java',
	'C++',
	'Ruby',
	'JavaScript',
	'C#',
	'C',
	'PHP',
	'Perl',
	'Go',
	'Scala'
];
var total = 0;
var results = [];

var server = net.createServer(function (thisSocket) {

	// Save this socket to the sockets queue.
	sockets.push(thisSocket);

	thisSocket.write('Welcome to Node Polls!\n\n' + question + '\n');

	// Display the choices.
	answers.forEach(function (answer, index) {
		thisSocket.write('[' + index + '] ' + answer + '\n');
	});

	thisSocket.write('\nType your answer: ');

	var answered;
	thisSocket.on('data', function (data) {

		// Convert received data to an Integer.
		var answer = parseInt(data);

		// Validate the number is indeed a number and within range.
		if (!answered && !Number.isNaN(answer) && answer >= 0 && answer < answers.length) {

			answered = true;
			total += 1;
			results[answer] = results[answer] ? results[answer] + 1 : 1;

			thisSocket.write('\nAnswer [' + answer + '] accepted!  Streaming results...\n\n');

			// Construct the results output.
			var message = answers.map(function (val, index) {
				var result = results[index] || 0;
				return '[' + index + '] ' + val + ': ' +
					result + '/' + total + ' (' + parseInt(result/total * 100) + '%)';
			}).join('\n') + '\n\n';

			// Send updated results to all sockets (telnet clients).
			sockets.forEach(function (socket) {
				socket.write(message);
			});

			// Log all results at the server.
			console.log(message);

		} else if (!answered) {
			thisSocket.write('NOPE. Try again: ');
		}

	});

	// Remove this socket from queue if disconnected.
	thisSocket.on('end', function () {
		sockets.splice(sockets.indexOf(thisSocket), 1);
	});

});

server.listen(1338);
console.log('Poll TCP server running on port 1338.');
