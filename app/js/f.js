'use strict';

var F = (function (F, undefined) {

	/**
	 * Perform an operation on each key/value pair in obj.
	 */
	F.eachKey = function (obj, fn) {
		for (var k in obj)
			if (Object.prototype.hasOwnProperty.call(obj, k))
				fn(k, obj[k]);
	}

	/**
	 * Creates an object out of an array using the value of the keyName property
	 * of each element in the array as the key for a key/value pair.
	 */
	F.keyify = function (arr, keyName) {
		var obj = {};
		arr.forEach(function (item) {
			obj[item[keyName]] = item;
		});
		return obj;
	}

	/**
	 * Creates an object out of an array, using the value of each element in the
	 * array as keys, with values initialized to `val`.
	 */
	F.keyEach = function (arr, val) {
		var obj = {};
		arr.forEach(function (item) {
			obj[item] = val;
		});
		return obj;
	}

	/**
	 * Creates a new object with all of the properties of both objects. If the
	 * input objects both have a property, the property value from the second
	 * object will be used.
	 */
	F.mergeObjs = function (a, b) {
		var obj = {};
		F.eachKey(a, function (k, v) {
			obj[k] = v;
		});
		F.eachKey(b, function (k, v) {
			obj[k] = v;
		});
		return obj;
	}

	/**
	 * Creates a new object with all of the properties of the first object, but
	 * with the values of the corresponding properties in the second object if
	 * they exist.
	 */
	F.updateProps = function (a, b) {
		var obj = {};
		F.eachKey(a, function (k, v) {
			if (b.hasOwnProperty(k))
				obj[k] = b[k];
			else
				obj[k] = v;
		});
		return obj;
	}

	/**
	 * Returns an array of all of the keys of an object.
	 */
	F.keys = function (obj) {
		if (obj === null || typeof obj !== 'object')
			return null;
		var keys = [];
		F.eachKey(obj, function (k, v) {
			keys.push(k);
		});
		return keys;
	}

	/**
	 * Creates a shallow copy of an object.
	 */
	F.clone = function (obj) {
		if (obj === null || typeof obj !== 'object')
			return obj;
		var newObj = obj.constructor();
		F.eachKey(obj, function (k, v) {
			newObj[k] = v;
		});
		return newObj;
	}

	/**
	 * Returns the unique elements of an array.
	 */
	F.uniq = function (arr) {
		var hash = {};
		return arr.filter(function (e) {
			if (hash[e])
				return false;
			else
				return hash[e] = true;
		});
	}

	return F;

})(F || {});