'use strict';

$.ajax({
	url: '../../ex_data/get_my_feed.json'
}).done(function (data) {
	var cards = JSON.parse(data).result.feed;

	function selectCard (id) {
		P.getContent(id, 'hzblglzimpi7az');
	}

	React.renderComponent(Scaffold({
		courses: [{id: 'hzblglzimpi7az'}],
		cards: {hzblglzimpi7az: cards},
		handleSelectCard: selectCard
	}), document.body);
});