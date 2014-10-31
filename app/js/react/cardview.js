/** @jsx React.DOM */
'use strict';

var OpCard = React.createClass({
	displayName: 'OpCard',
	propTypes: {
		card: React.PropTypes.object.isRequired,
		getName: React.PropTypes.func.isRequired
	},
	render: function () {
		var card = this.props.card,
			name = this.props.getName,
			classes = 'card op ' + card.type,
			q = card.history[0];
		return (
			React.createElement("div", {className: classes}, 
				React.createElement("h2", null, q.subject), 
				React.createElement("div", {className: "author"}, Dates.longRel(q.created), " by ", name(q)), 
				React.createElement(Content, {className: "content", html: q.content}), 
				React.createElement("hr", null), 
				React.createElement("div", {className: "meta"}, 
					React.createElement("a", {href: "#", className: "edit"}, "Edit"), 
					React.createElement("a", {href: "#", className: "thank"}, "Thank"), 
					React.createElement("a", {href: "#", className: "follow"}, "Follow"), 
					React.createElement("a", {href: "#", className: "star"}, "Star"), 
					React.createElement("div", {className: "separator"}), 
					React.createElement("div", {className: "views"}, React.createElement("i", {className: "fa fa-eye"}), card.unique_views), 
					React.createElement("div", {className: "likes"}, React.createElement("i", {className: "fa fa-thumbs-up"}), card.tag_good.length)
				)
			));
	}
});

var AnswerCard = React.createClass({
	displayName: 'AnswerCard',
	propTypes: {
		card: React.PropTypes.object.isRequired,
		getName: React.PropTypes.func.isRequired
	},
	instructorEndorsers: function () {
		return this.props.card.tag_endorse.filter(function (endorser) {
			return endorser.admin;
		});
	},
	render: function () {
		var card = this.props.card,
			name = this.props.getName,
			classes = 'card answer ' + card.type,
			title = card.type === 's_answer' ? 'The students\' answer' : 'The instructors\' answer', 
			a = card.history[0],
			is_s_ans = card.type === 's_answer',
			i_end = [];

		if (is_s_ans)
			i_end = this.instructorEndorsers();

		return (
			React.createElement("div", {className: classes}, 
				React.createElement("h2", null, title), 
				React.createElement("div", {className: "author"}, Dates.longRel(a.created), " by ", name(a)), 
				React.createElement(Content, {className: "content", html: a.content}), 
				React.createElement("hr", null), 
				React.createElement("div", {className: "meta"}, 
					is_s_ans ? React.createElement("a", {href: "#", className: "edit"}, "Edit") : null, 
					React.createElement("a", {href: "#", className: "thank"}, "Thank"), 
					React.createElement("div", {className: "separator"}), 
					React.createElement("div", {className: "likes"}, React.createElement("i", {className: "fa fa-thumbs-up"}), card.tag_endorse.length), 
					i_end.length ? React.createElement("div", {className: "endorsements"}, React.createElement("i", {className: "fa fa-check"}), i_end.length) : null
				)
			))
	}
});

var FollowupThread = React.createClass({
	displayName: 'FollowupThread',
	propTypes: {
		thread: React.PropTypes.object.isRequired,
		getName: React.PropTypes.func.isRequired
	},
	render: function () {
		var thread = this.props.thread,
			feedback = thread.children,
			name = this.props.getName,
			classes = "thread";

		if (thread.no_answer)
			classes += " unresolved";

		return (
			React.createElement("div", {className: classes}, 
				React.createElement("div", {className: "meta"}, 
					React.createElement("span", {className: "author"}, name(thread)), 
					React.createElement("span", {className: "time"}, Dates.longRel(thread.created))
				), 
				React.createElement(Content, {className: "content", html: thread.subject}), 
				feedback.map(function (data) {
					return (
						React.createElement("div", {key: data.id, className: "feedback"}, 
							React.createElement("div", {className: "meta"}, 
								React.createElement("span", {className: "author"}, name(data)), 
								React.createElement("span", {className: "time"}, Dates.longRel(data.created))
							), 
							React.createElement(Content, {className: "content", html: data.subject})
						));
				})
			))
	}
});

var FollowupCard = React.createClass({
	displayName: 'FollowupCard',
	propTypes: {
		threads: React.PropTypes.array.isRequired,
		getName: React.PropTypes.func.isRequired
	},
	render: function () {
		var threads = this.props.threads, getName = this.props.getName;

		return (
			React.createElement("div", {className: "card followup"}, 
				React.createElement("h2", null, "Follow-up discussions"), 
				threads.map(function (thread) {
					return React.createElement(FollowupThread, {key: thread.id, thread: thread, getName: getName});
				})
			))
	}
});

var CardView = React.createClass({
	displayName: 'CardView',
	propTypes: {
		card: React.PropTypes.object,
		names: React.PropTypes.object.isRequired,

		doLoadNames: React.PropTypes.func.isRequired,
		doMarkAsRead: React.PropTypes.func.isRequired
	},
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
	getAllUids: function () {
		var card = this.props.card,
			uids = [];
		card.history.forEach(addIfHasUid);
		card.children && card.children.forEach(function (child) {
			addIfHasUid(child);
			child.history && child.history.forEach(addIfHasUid);
			child.children && child.children.forEach(addIfHasUid);
		});

		function addIfHasUid (obj) {
			if (obj.uid) uids.push(obj.uid);
		}

		return F.uniq(uids);
	},
	getAllUnloadedUids: function () {
		var uids = this.getAllUids(),
			loaded = this.props.names;

		return uids.filter(function (uid) {
			return !loaded.hasOwnProperty(uid);
		});
	},
	safeGetName: function (u) {
		if (u.anon === 'no')
			return this.props.names[u.uid] ? this.props.names[u.uid].name : '...';
		else if (u.anon === 'stud')
			return 'Anonymous (to students)';
		else
			return 'Anonymous';
	},
	componentDidUpdate: function (prevProps) {
		// scroll to top on card load
		if (this.props.card && (this.props.card !== prevProps.card))
			this.refs.card.getDOMNode().scrollTop = 0;
	},
	render: function () {
		if (this.props.card == null) return React.createElement("div", {id: "card-view"});

		// load names from Piazza if necessary
		var unloadedUids = this.getAllUnloadedUids();
		if (unloadedUids.length)
			this.props.doLoadNames(unloadedUids);

		var card = this.props.card,
			children = this.sortChildren(card.children),
			s_ansCard = null,
			i_ansCard = null,
			followupCard = null;

		if (children.s_ans)
			s_ansCard = React.createElement(AnswerCard, {card: children.s_ans, getName: this.safeGetName});
		if (children.i_ans)
			i_ansCard = React.createElement(AnswerCard, {card: children.i_ans, getName: this.safeGetName});
		if (children.followups.length)
			followupCard = React.createElement(FollowupCard, {threads: children.followups, getName: this.safeGetName});

		return (
			React.createElement("div", {id: "card-view", ref: "card"}, 
				React.createElement(OpCard, {card: card, getName: this.safeGetName}), 
				s_ansCard, 
				i_ansCard, 
				followupCard
			));
	}
});