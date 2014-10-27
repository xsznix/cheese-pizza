var Store = function (Store, undefined) {

	var s = chrome.storage.local,
		DEFAULT_STATE = {
			login: 0
		};

	function get (key, preprocess) {
		return new Promise(function (resolve, reject) {
			chrome.storage.local.get(key, function (value) {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					(preprocess || resolve)(value[key], resolve, reject);
				}
			});
		});
	}

	function set (key, value, preprocess) {
		return new Promise(function (resolve, reject) {
			var obj = {};
			obj[key] = value;
			chrome.storage.local.set(obj, function () {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve();
				}
			});
		});
	}

	function clone (obj) {
		if (obj == null || typeof obj !== 'object') return obj;
		var newObj = obj.constructor();
		for (var k in obj)
			if (Object.prototype.hasOwnProperty.call(obj, k))
				newObj[k] = obj[k];
		return newObj;
	}

	function objKeys (obj) {
		if (obj == null || typeof obj !== 'object') return null;
		var keys = [];
		for (var k in obj)
			if (Object.prototype.hasOwnProperty.call(obj, k))
				keys.push(k);
		return keys;
	}

	Store.getLoginState = function () {
		return get('state', function (state, resolve, reject) {
			state = state || DEFAULT_STATE;
			resolve(state.login);
		});
	}
	Store.setLoginState = function (loginState) {
		return get('state', function (state, resolve, reject) {
			state = state || clone(DEFAULT_STATE);
			state.login = loginState;
			set('state', state).then(resolve, reject);
		});
	}

	Store.getFeeds = function () {
		return get('feeds', function (value, resolve, reject) {
			resolve(value || null);
		});
	}
	Store.getFeed = function (nid) {
		return get('feeds', function (feeds, resolve, reject) {
			if (!feeds) {
				resolve(null);
				return;
			}
			var f = feeds[nid];
			if (f) resolve(f);
			else resolve(null);
		});
	}
	Store.setFeed = function (nid, feed) {
		return get('feeds', function (feeds, resolve, reject) {
			if (!feeds) feeds = {};
			feeds[nid] = feed;
			set('feeds', feeds).then(resolve, reject);
		});
	}

	Store.getContent = function (cid, nid) {
		return get('content', function (content, resolve, reject) {
			if (!content) {
				resolve(null);
				return;
			}
			var c = content[nid][cid];
			if (c) resolve(c);
			else resolve(null);
		});
	}
	Store.setContent = function (cid, nid, c) {
		return get('content', function (content, resolve, reject) {
			if (!content) content = {};
			if (!content[nid]) content[nid] = {};
			content[nid][cid] = c;
			set('content', content).then(resolve, reject);
		});
	}

	Store.getSelf = function () {
		return get('self');
	}
	Store.setSelf = function (self) {
		return set('self', self);
	}

	Store.getUsers = function (userIds, course) {
		return get('users', function (users, resolve, reject) {
			if (userIds && userIds.length) {
				// to get O(1) search time
				var userHash = {}
				userIds.forEach(function (id) {
					userHash[id] = true;
				});

				for (var k in users)
					if (Object.prototype.hasOwnProperty.call(users, k))
						if (!Object.prototype.hasOwnProperty.call(userHash, k))
							delete users[k];
						else
							delete userHash[k];
			}

			resolve({found: users || {}, notFound: objKeys(userHash) || {}});
		})
	}
	Store.setUsers = function (newUsers, course) {
		return get('users', function (users, resolve, reject) {
			if (!users) users = {};
			for (var k in newUsers)
				if (Object.prototype.hasOwnProperty.call(newUsers, k))
					users[k] = newUsers[k];
			return set('users', users);
		})
	}

	return Store;

}(Store || {});