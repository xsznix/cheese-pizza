'use strict';

var P = (function (P, undefined) {

	var API_METHOD_PREFIX = 'https://piazza.com/logic/api?method=',
		AID_PREFIX = '&aid=',
		URL_LOGIN = 'https://piazza.com/class',
		API_LOGOUT = 'user.logout',
		API_FEED = 'network.get_my_feed',
		API_FILTER_FEED = 'network.filter_feed',
		API_SEARCH = 'network.search',
		API_CONTENT = 'content.get',
		API_USER_STATUS = 'user.status',
		API_GET_USERS = 'network.get_users',
		API_FEEDBACK = 'content.add_feedback',
		API_UNFEEDBACK = 'content.remove_feedback',
		API_FAVORITE = 'content.mark_favorite',
		API_UNFAVORITE = 'content.mark_unfavorite';

	function aid () {
		return (new Date()).getTime().toString(36) +
			Math.round(Math.random() * 1679616).toString(36);
	}

	function sid (q) {
		q = (new Date()).getTime().toString() + q;
		var hash = 0, i, len = q.length;
		if (len === 0) return hash;
		for (i = 0; i < len; i++)
			hash = ((hash << 5) - hash) + q.charCodeAt(i) | 0;
		return hash;
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
		limit = limit || P.DEFAULT_NUM_FEED_ITEMS;
		sort = sort || 'updated';

		return apiCall(API_FEED, {
			nid: course,
			offset: offset,
			limit: limit,
			sort: sort
		});
	}

	P.search = function (course, query) {
		return apiCall(API_SEARCH, {
			nid: course,
			query: query,
			sid: sid(query)
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

	P.thankAnswer = function (cid) {
		return apiCall(API_FEEDBACK, {
			cid: cid,
			type: 'tag_endorse'
		});
	}

	P.unthankAnswer = function (cid) {
		return apiCall(API_UNFEEDBACK, {
			cid: cid,
			type: 'tag_endorse'
		})
	}

	P.thankQuestion = function (cid) {
		return apiCall(API_FEEDBACK, {
			cid: cid,
			type: 'tag_good'
		});
	}

	P.unthankQuestion = function (cid) {
		return apiCall(API_UNFEEDBACK, {
			cid: cid,
			type: 'tag_good'
		});
	}

	P.favorite = function (cid) {
		return apiCall(API_FAVORITE, {
			cid: cid
		});
	}

	P.unfavorite = function (cid) {
		return apiCall(API_UNFAVORITE, {
			cid: cid
		});
	}

	P.getArchived = function (nid, sort) {
		return apiCall(API_FILTER_FEED, {
			nid: nid,
			sort: sort || 'updated',
			hidden: 1
		});
	}

	P.getFollowing = function (nid, sort) {
		return apiCall(API_FILTER_FEED, {
			nid: nid,
			sort: sort || 'updated',
			following: 1
		});
	}

	P.FILTERS = [
		['None', ''],
		['Student', 'student'],
		['Instructor', 'instructor'],
		['Question', 'question'],
		['Note', 'note'],
		['Poll', 'poll'],
		['Unread', 'unread'],
		['Unresolved', 'unresolved'],
		['Updated', 'updated'],
		['Following', 'following'],
		['Archived', 'archived']];

	P.DEFAULT_NUM_FEED_ITEMS = 150;

	return P;

})(P || {});