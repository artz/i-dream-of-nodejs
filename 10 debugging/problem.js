
var obj = {
	foo: true,
	bar: false
};
var string = 'twine';

function doIt(local) {
	debugger;
	local.foo();
}

doIt(obj);
