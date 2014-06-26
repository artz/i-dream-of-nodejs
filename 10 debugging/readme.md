# Debugging

## Node Debugger
* [http://nodejs.org/api/debugger.html](http://nodejs.org/api/debugger.html)

```
node debug problem.js

debug> c
< doing it
break in problem.js:12
 10 function doit(local) {
 11 	console.log('doing it');
 12 	debugger;
 13 	console.log(local.foo());
 14 }

debug> repl
Press Ctrl + C to leave debug repl
> local
{ foo: true, bar: false }
```

## Node Inspector
* [https://github.com/node-inspector/node-inspector](https://github.com/node-inspector/node-inspector)

```
node-debug problem.js
```
