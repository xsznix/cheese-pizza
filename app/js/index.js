'use strict';

var LoginFormFactory = React.createFactory(LoginForm),
	ScaffoldFactory = React.createFactory(Scaffold),
	scaffoldContainer = document.querySelector('div#root');

function renderLogin () {
	React.render(LoginFormFactory({
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
	}), scaffoldContainer);
}

function renderDashboard () {
	Store.getSelf().then(function (self) {
		Store.getFeeds().then(function (feeds) {
			Store.getAllUsers().then(function (users) {
				React.render(React.createElement(Scaffold, {
					user: self,
					feeds: feeds,
					names: users || {},
					doRefresh: doRefresh,
					doLoadNames: doLoadNames,
					doMarkAsRead: doMarkAsRead
				}), scaffoldContainer);
			})
		});
	});
}

function doRefresh (nid) {
	P.getSelf().then(function (self) {
		Store.setSelf(self).then(function () {
			P.getFeed(nid).then(function (feed) {
				Store.setFeed(nid, feed).then(renderDashboard);
			});
		});
	});
}

var loadingNames = {};
/**
 * Loads the names of the users in `uid` by user ID from the course `nid`.
 * To avoid loading the same name twice because of successive calls to this
 * function, we keep track of all of the uids that have names loading in the
 * variable `loadingNames`, removing them once either the request is complete
 * or the request has failed.
 */
function doLoadNames (uids, nid) {
	Store.getUsers(uids, nid).then(function (users) {
		// don't do anything if everything is in Store already
		if (users.notFound && users.notFound.length)
			var namesToLoad = users.notFound.filter(function (uid) {
				return !loadingNames[uid];
			});
			users.notFound.forEach(function (uid) {
				loadingNames[uid] = true;
			});
			// don't send the request if we don't want to load any names
			if (namesToLoad.length)
				P.getUsers(namesToLoad, nid).then(function (newUsers) {
					var newUserHash = F.keyify(newUsers, 'id');
					Store.setUsers(newUserHash, nid).then(function () {
						renderDashboard();
						newUsers.forEach(function (user) {
							delete loadingNames[user.id];
						});
					});
				}, function (e) {
					console.err(e);
					namesToLoad.forEach(function (uid) {
						delete loadingNames[uid];
					});
				});
	});
}

function doMarkAsRead (newContent, listItemContent, nid, rootComponent) {
	var newListItemContent = F.clone(listItemContent);
	newListItemContent.version = listItemContent.main_version;
	newListItemContent.is_new = false;
	Store.setFeedItem(nid, newContent.id, newListItemContent).then(renderDashboard);
}

Store.getLoginState().then(function (state) {
	if (state === 0)
		renderLogin();
	else if (state === 1)
		renderDashboard();
});