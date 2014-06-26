var foo = require('./foo');
var bar = require('./foo/bar');
var baz = require('./baz');
var qux = require('./qux');

console.log('foo:', foo);
console.log('bar.tend:', bar.tend);
console.log('bar.hop:', bar.hop);
console.log('baz(\'zoop\'):', baz('zoop'));
console.log('qux.name:', qux.name);
console.log('qux.constructor.name:', qux.constructor.name);

// var markdown = require('markdown').markdown;
// console.log(markdown.toHTML( "#Hello *World*!"));
