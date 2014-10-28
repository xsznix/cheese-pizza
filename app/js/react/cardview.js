/** @jsx React.DOM */
'use strict';

var OpCard = React.createClass({
	displayName: 'OpCard',
	propTypes: {
		card: React.PropTypes.object.isRequired
	},
	render: function () {
		var card = this.props.card,
			classes = 'card op ' + card.type,
			q = card.history[0];
		return (
			React.DOM.div({className: classes}, 
				React.DOM.h2(null, q.subject), 
				React.DOM.div({className: "author"}, Dates.longRel(q.created), " by ", q.anon === 'no' ? q.uid : q.anon), 
				React.DOM.div({className: "content", dangerouslySetInnerHTML: {__html: q.content}}), 
				React.DOM.hr(null), 
				React.DOM.div({className: "meta"}, 
					React.DOM.a({href: "#", className: "edit"}, "Edit"), 
					React.DOM.a({href: "#", className: "thank"}, "Thank"), 
					React.DOM.a({href: "#", className: "follow"}, "Follow"), 
					React.DOM.a({href: "#", className: "star"}, "Star"), 
					React.DOM.div({className: "separator"}), 
					React.DOM.div({className: "views"}, React.DOM.i({className: "fa fa-eye"}), card.unique_views), 
					React.DOM.div({className: "likes"}, React.DOM.i({className: "fa fa-thumbs-up"}), card.tag_good.length)
				)
			));
	}
});

var AnswerCard = React.createClass({
	displayName: 'AnswerCard',
	propTypes: {
		card: React.PropTypes.object.isRequired
	},
	render: function () {
		var card = this.props.card,
			classes = 'card answer ' + card.type,
			title = card.type === 's_answer' ? 'The students\' answer' : 'The instructors\' answer', 
			a = card.history[0];

		return (
			React.DOM.div({className: classes}, 
				React.DOM.h2(null, title), 
				React.DOM.div({className: "author"}, Dates.longRel(a.created), " by ", a.anon === 'no' ? a.uid : a.anon), 
				React.DOM.div({className: "content", dangerouslySetInnerHTML: {__html: a.content}})
			))
	}
});

var FollowupThread = React.createClass({
	displayName: 'FollowupThread',
	propTypes: {
		thread: React.PropTypes.object.isRequired
	},
	render: function () {
		var thread = this.props.thread,
			feedback = thread.children;

		return (
			React.DOM.div({className: "thread"}, 
				React.DOM.div({className: "content", dangerouslySetInnerHTML: {__html: thread.subject}}), 
				feedback.map(function (data) {
					React.DOM.div({className: "feedback", dangerouslySetInnerHTML: {__html: thread.subject}})
				})
			))
	}
});

var FollowupCard = React.createClass({
	displayName: 'FollowupCard',
	propTypes: {
		threads: React.PropTypes.array.isRequired
	},
	render: function () {
		var threads = this.props.threads;

		return (
			React.DOM.div({className: "card followup"}, 
				React.DOM.h2(null, "Follow-up discussions"), 
				threads.map(function (thread) {
					return FollowupThread({key: thread.id, thread: thread});
				})
			))
	}
});

var CardView = React.createClass({
	displayName: 'CardView',
	sortChildren: function (children) {
		var sorted = {s_ans: null, i_ans: null, followups: []};
		children.forEach(function (child) {
			if (child.type === 's_answer')
				sorted.s_ans = child;
			else if (child.type === 'i_answer')
				sorted.i_ans = child;
			else if (child.type === 'followup')
				sorted.followups.push(child);
		});
		return sorted;
	},
	render: function () {
		if (this.props.card == null) return React.DOM.div({id: "card-view"});

		var card = this.props.card,
			children = this.sortChildren(card.children),
			s_ansCard = null,
			i_ansCard = null,
			followupCard = null;

		if (children.s_ans)
			s_ansCard = AnswerCard({card: children.s_ans});
		if (children.i_ans)
			i_ansCard = AnswerCard({card: children.i_ans});
		if (children.followups.length)
			followupCard = FollowupCard({threads: children.followups});

		return (
			React.DOM.div({id: "card-view"}, 
				OpCard({card: card}), 
				s_ansCard, 
				i_ansCard, 
				followupCard
			));
	}
});