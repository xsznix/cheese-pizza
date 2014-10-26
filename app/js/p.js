var P = (function (P, undefined) {

	var API_METHOD_PREFIX = 'https://piazza.com/logic/api?method=',
		AID_PREFIX = '&aid=',
		URL_LOGIN = 'https://piazza.com/class',
		API_FEED = 'network.get_my_feed',
		API_CONTENT = 'content.get',
		API_USER_STATUS = 'user.status';

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
				data: JSON.stringify(data)
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
			}).done(resolve).fail(reject);
		});
	}

	P.getFeed = function (course, offset, limit, sort) {
		offset = offset || 0;
		limit = limit || 150;
		sort = sort || 'updated';

		return apiCall(API_FEED, {
			method: API_FEED,
			params: {
				nid: course,
				offset: offset,
				limit: limit,
				sort: sort
			}
		});
	}

	P.getContent = function (contentId, course) {
		return apiCall(API_CONTENT, {
			method: API_CONTENT,
			params: {
				cid: contentId,
				nid: course
			}
		});
	}

	P.getUser = function () {
		return apiCall(API_USER_STATUS, {
			method: API_USER_STATUS,
			params: {}
		});
	}

	return P;

})(P || {});