var D = (function (D, undefined) {

	D.log = function (data) {
		console.log(data);
	}

	D.truncateFeed = function () {
		Store.getFeeds().then(function (feeds) {
			feeds.hzblglzimpi7az.feed.splice(0, 15);
			Store.setFeed('hzblglzimpi7az', feeds.hzblglzimpi7az);
		});
	}

	return D;

})(D || {});