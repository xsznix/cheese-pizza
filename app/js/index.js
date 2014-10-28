'use strict';

// $.ajax({
// 	url: '../../ex_data/get_my_feed.json'
// }).done(function (feed) {
// 	$.ajax({
// 		url: '../../ex_data/user_status.json'
// 	}).done(function (stat) {
// 		var cards = JSON.parse(feed).result,
// 			user = JSON.parse(stat).result;

// 		function selectCard (id) {
// 			P.getContent(id, 'hzblglzimpi7az');
// 		}

// 		React.renderComponent(Scaffold({
// 			user: user,
// 			feeds: {hzblglzimpi7az: cards},
// 			handleSelectCard: selectCard
// 		}), document.body);
// 	});
// });

Store.getLoginState().then(function (state) {
	if (state === 0)
		renderLogin();
	else if (state === 1)
		renderDashboard();

	function renderLogin() {
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

	function renderDashboard() {
		Store.getSelf().then(function (self) {
			Store.getFeeds().then(function (feeds) {
				React.renderComponent(Scaffold({
					user: self,
					feeds: feeds,
					doRefresh: doRefresh
				}), document.body);
			});
		});
	}

	function doRefresh(nid) {
		P.getFeed(nid).then(function (feed) {
			Store.setFeed(nid, feed).then(renderDashboard);
		});
	}
});