const jenkins64 = require('./jenkins96');
const assert = require('assert');

const hashCheck = (input, expected, message) => {
	let hash = jenkins64(input);
	assert.ok(hash === expected, message + ' does not hash correctly.');
	console.info('TEST: %s hashed correctly. (%s == %s)', message, hash, expected);
};

hashCheck('', '16045690984833335023', 'Zero-length string');
hashCheck('Hello!', '12046145359613883305', 'Basic string');
hashCheck('The lazy dog barked.', '17415560073356018853', 'Long string');
hashCheck('The lazy dog actually went to McDonalds because it was faster than messing with a fence.', '9747676289601232079', 'Really long string');
hashCheck([0x41, 0x72, 0x72, 0x61, 0x79], '10224901713986766132', 'Array input');