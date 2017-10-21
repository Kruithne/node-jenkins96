/*
 * Jenkins96 Hashing Algorithm
 * Originally created by Robert John Jenkins Junior
 * Implemented in JavaScript for Node by Kruithne <kruithne@gmail.com>
 *
 * https://en.wikipedia.org/wiki/Jenkins_hash_function
 */

const Long = require('long');
const int32 = require('int32');

const _extract = function(arr, index) {
	let val = 0;
	let start = index * 4;
	for (let i = start + 4; i > start; i--)
		val = (val * 256) + (arr[i - 1] || 0);

	return val;
};

const _restrict = function(val) {
	if (val < 0)
		val += 0x100000000;

	return val;
};

const _rotate = (a, b) => {
	return _restrict(_restrict(int32.shiftLeft(a, b)) | _restrict(int32.shiftRightUnsigned(a, 32 - b)));
};

module.exports = function(input) {
	let bytes = [];
	if (typeof input === 'string') {
		// Marshal string to byte-array.
		let p = 0;
		for (let i = 0; i < input.length; i++) {
			let v = input.charCodeAt(i);
			if (v < 128) {
				bytes[p++] = v;
			} else if (v < 2048) {
				bytes[p++] = (v >> 6) | 192;
				bytes[p++] = (v & 63) | 128;
			} else if (((v & 0xFC00) === 0xD800) && (i + 1) < input.length && ((input.charCodeAt(i + 1) & 0xFC00) === 0xDC00)) {
				v = 0x10000 + ((v & 0x03FF) << 10) + (input.charCodeAt(++i) & 0x03FF);
				bytes[p++] = (v >> 18) | 240;
				bytes[p++] = ((v >> 12) & 63) | 128;
				bytes[p++] = ((v >> 6) & 63) | 128;
				bytes[p++] = (v & 63) | 128;
			} else {
				bytes[p++] = (v >> 12) | 224;
				bytes[p++] = ((v >> 6) & 63) | 128;
				bytes[p++] = (v & 63) | 128;
			}
		}
	} else if (input instanceof Buffer) {
		// Copy buffer into array.
		for (let x = 0; x < input.length; x++) {
			bytes[x] = input.readUInt8(x);
		}
	} else if (Array.isArray(input)) {
		bytes = input;
	} else {
		throw new Error('Hash input was not of expected String|Buffer|Array');
	}

	let length = input.length;
	let a = 0xDEADBEEF + length;
	let b = a;
	let c = a;

	if (length === 0) {
		let hash = new Long(c, 0, true);
		hash = hash.shiftLeft(32);
		hash = hash.or(b);
		return hash.toString();
	}

	length = (length + (12 - length % 12) % 12);

	for (let j = 0; j < length - 12; j += 12) {
		a = _restrict(int32.add(a, _extract(bytes, j / 4)));
		b = _restrict(int32.add(b, _extract(bytes, j / 4 + 1)));
		c = _restrict(int32.add(c, _extract(bytes, j / 4 + 2)));

		a -= c; a ^= _rotate(c, 4); c += b;
		b -= a; b ^= _rotate(a, 6); a += c;
		c -= b; c ^= _rotate(b, 8); b += a;
		a -= c; a ^= _rotate(c, 16); c += b;
		b -= a; b ^= _rotate(a, 19); a += c;
		c -= b; c ^= _rotate(b, 4); b += a;

		a = _restrict(a);
		b = _restrict(b);
		c = _restrict(c);
	}

	let y = length - 12;
	a = _restrict(int32.add(a, _extract(bytes, y / 4)));
	b = _restrict(int32.add(b, _extract(bytes, y / 4 + 1)));
	c = _restrict(int32.add(c, _extract(bytes, y / 4 + 2)));

	c ^= b;	c = _restrict(c - _rotate(b, 14));
	a ^= c; a = _restrict(a - _rotate(c, 11));
	b ^= a; b = _restrict(b - _rotate(a, 25));
	c ^= b; c = _restrict(c - _rotate(b, 16));
	a ^= c; a = _restrict(a - _rotate(c, 4));
	b ^= a; b = _restrict(b - _rotate(a, 14));
	c ^= b; c = _restrict(c - _rotate(b, 24));

	let hash = new Long(c, 0, true);
	hash = hash.shiftLeft(32);
	hash = hash.or(b);
	return hash.toString();
};