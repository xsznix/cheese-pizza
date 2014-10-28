'use strict';

Store.getLoginState().then(function (state) {
	if (state === 0)
		renderLogin();
	else if (state === 1)
		renderDashboard();

	function renderLogin () {
		React.renderComponent(LoginForm({
			finishLogin: function () {
				Store.setLoginState(1).then(function () {
					P.getSelf().then(function (self) {
						Store.setSelf(self).then(function () {
							P.getFeed(self.last_network).then(function (feed) {
								Store.setFeed(self.last_network, feed).then(renderDashboard)
							});
						})
					});
				});
			}
		}), document.body);
	}

	function renderDashboard () {
		Store.getSelf().then(function (self) {
			Store.getFeeds().then(function (feeds) {
				Store.getAllUsers().then(function (users) {
					React.renderComponent(Scaffold({
						user: self,
						feeds: feeds,
						names: users || {},
						doRefresh: doRefresh,
						doLoadNames: doLoadNames,
						doMarkAsRead: function () {} // TODO
					}), document.body);
				})
			});
		});
	}

	function doRefresh (nid) {
		P.getFeed(nid).then(function (feed) {
			Store.setFeed(nid, feed).then(renderDashboard);
		});
	}

	function doLoadNames (uids, nid) {
		Store.getUsers(uids, nid).then(function (users) {
			if (users.notFound && users.notFound.length)
				P.getUsers(users.notFound, nid).then(function (newUsers) {
					var newUserHash = F.keyify(newUsers, 'id');
					Store.setUsers(newUserHash, nid).then(renderDashboard);
				});
		});
	}
});