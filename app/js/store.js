'use strict';

// TODO: cache everything in memory to speed up store access
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

	Store.getLoginState = function () {
		return get('state', function (state, resolve, reject) {
			state = state || DEFAULT_STATE;
			resolve(state.login);
		});
	}
	Store.setLoginState = function (loginState) {
		return get('state', function (state, resolve, reject) {
			state = state || F.clone(DEFAULT_STATE);
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
	Store.setFeedItem = function (nid, cid, content) {
		return get('feeds', function (feeds, resolve, reject) {
			if (!feeds) reject(new Error('No feed found.'));
			else if (!feeds[nid]) reject(new Error('The specified course does not have a feed.'));
			else {
				var feed = feeds[nid].feed, len = feed.length;
				for (var i = 0; i < len; i++) {
					if (feed[i].id === cid) {
						feed[i] = content;
						Store.setFeed(nid, feeds[nid]).then(resolve, reject)
						break;
					}
				}
			}
		})
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

	Store.getAllUsers = function () {
		return get('users');
	}
	Store.getUsers = function (userIds, course) {
		return get('users', function (users, resolve, reject) {
			var courseUsers = users ? F.clone(users[course]) : null;

			if (courseUsers && userIds && userIds.length) {
				// initially, we haven't found any users in the stored users
				var notFoundHash = {}
				userIds.forEach(function (id) {
					notFoundHash[id] = true;
				});

				// now. we can find users in the hash
				F.eachKey(courseUsers, function (k, v) {
					if (Object.prototype.hasOwnProperty.call(notFoundHash, k))
						delete notFoundHash[k];
					else
						delete courseUsers[k];
				})
			}

			resolve({found: courseUsers || null, notFound: F.keys(notFoundHash) || userIds});
		})
	}
	Store.setUsers = function (newUsers, course) {
		return get('users', function (users, resolve, reject) {
			if (!users) users = {};
			if (!users[course]) users[course] = {};
			F.eachKey(newUsers, function (k, v) {
				users[course][k] = v;
			});
			set('users', users).then(resolve, reject);
		})
	}

	Store.logout = function () {
		return new Promise(function (resolve, reject) {
			chrome.storage.local.clear(confirm);

			function confirm () {
				if (chrome.runtime.lastError)
					reject(chrome.runtime.lastError);
				else
					resolve();
			}
		});
	}

	return Store;

}(Store || {});