/* jshint node: true */
'use strict';

// https://github.com/mikeal/request
var request = require('request');

// http://thesaurus.altervista.org/
var key = '3DTDPVUqQE4fnwBbKwAf';
var url = 'http://thesaurus.altervista.org/thesaurus/v1';

// Command line utilities with node.js
// http://shapeshed.com/command-line-utilities-with-nodejs/
module.exports = function (word, callback) {
	if (word) {
		request(url, {
			qs: {
				key: key,
				language: 'en_US',
				word: word,
				output: 'json'
			}
		}, function (err, response, body) {
			var results = [];
			if (err) {
				if (callback) {
					callback(err);
				}
			} else {
				body = JSON.parse(body);
				if (body.error) {
					if (callback) {
						callback(null, results);
					}
				} else {
					results = body.response.map(function (item) {
						item = item.list;
						var antonyms = [];

						// Create new set of synonyms and remove descriptions.
						var synonyms = item.synonyms.split('|').map(function (item, index) {
							if (item.indexOf(' (antonym)') !== -1) {
								antonyms.push(index);
							}
							return item.replace(' (similar term)', '').replace(' (related term)', '');
						});

						// Remove antonyms from result set.
						antonyms.forEach(function (index) {
							synonyms.splice(index, 1);
						});
						return {
							synonyms: synonyms,
							category: item.category
						};
					});
					if (callback) {
						callback(null, results);
					}
				}
			}
		});
	}
};
