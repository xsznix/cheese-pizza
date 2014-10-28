'use strict';

var P = (function (P, undefined) {

	var API_METHOD_PREFIX = 'https://piazza.com/logic/api?method=',
		AID_PREFIX = '&aid=',
		URL_LOGIN = 'https://piazza.com/class',
		API_LOGOUT = 'user.logout',
		API_FEED = 'network.get_my_feed',
		API_CONTENT = 'content.get',
		API_USER_STATUS = 'user.status',
		API_GET_USERS = 'network.get_users';

	function aid () {
		return (new Date()).getTime().toString(36) +
			Math.round(Math.random() * 1679616).toString(36);
	}

	function api (method) {
		return API_METHOD_PREFIX + method + AID_PREFIX + aid();
	}

	function validateJSON (resolve, reject) {
		return function (data) {
			var json = JSON.parse(data);
			if (json.error) reject(new Error(json.error));
			else resolve(json.result);
		}
	}
	
	function apiCall (method, data) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: api(method),
				type: 'POST',
				data: JSON.stringify({
					method: method,
					params: data
				})
			}).done(validateJSON(resolve, reject)).fail(reject);
		});
	}

	P.login = function (email, password) {
		return new Promise(function (resolve, reject) {
			$.ajax({
				url: URL_LOGIN,
				type: 'POST',
				data: {
					from: '/signup',
					email: email,
					password: password,
					remember: 'on'
				}
			}).done(verifyLogin).fail(reject);

			function verifyLogin(data) {
				var $error = $('.modal-error-message.is-visible', data);
				if ($error.length)
					reject(new Error($error.text().trim()));
				else
					resolve();
			}
		});
	}

	P.logout = function () {
		return apiCall(API_LOGOUT, {});
	}

	P.getFeed = function (course, offset, limit, sort) {
		offset = offset || 0;
		limit = limit || 150;
		sort = sort || 'updated';

		return apiCall(API_FEED, {
			nid: course,
			offset: offset,
			limit: limit,
			sort: sort
		});
	}

	P.getContent = function (contentId, course) {
		return apiCall(API_CONTENT, {
			cid: contentId,
			nid: course
		});
	}

	P.getSelf = function () {
		return apiCall(API_USER_STATUS, {});
	}

	P.getUsers = function (userIds, course) {
		return apiCall(API_GET_USERS, {
			ids: userIds,
			nid: course
		});
	}

	P.FILTERS = [
		['None', ''],
		['Starred', 'starred'],
		['Student', 'student'],
		['Instructor', 'instructor'],
		['Question', 'question'],
		['Note', 'note'],
		['Poll', 'poll'],
		['Unread', 'unread'],
		['Unresolved', 'unresolved'],
		['Updated', 'updated'],
		['Following', 'following'],
		['Archived', 'archived']]

	return P;

})(P || {});