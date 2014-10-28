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
			<div className={classes}>
				<h2>{q.subject}</h2>
				<div className="author">{Dates.longRel(q.created)} by {q.anon === 'no' ? name(q.uid) : q.anon}</div>
				<div className="content" dangerouslySetInnerHTML={{__html: q.content}} />
				<hr />
				<div className="meta">
					<a href="#" className="edit">Edit</a>
					<a href="#" className="thank">Thank</a>
					<a href="#" className="follow">Follow</a>
					<a href="#" className="star">Star</a>
					<div className="separator" />
					<div className="views"><i className="fa fa-eye" />{card.unique_views}</div>
					<div className="likes"><i className="fa fa-thumbs-up" />{card.tag_good.length}</div>
				</div>
			</div>);
	}
});

var AnswerCard = React.createClass({
	displayName: 'AnswerCard',
	propTypes: {
		card: React.PropTypes.object.isRequired,
		getName: React.PropTypes.func.isRequired
	},
	render: function () {
		var card = this.props.card,
			name = this.props.getName,
			classes = 'card answer ' + card.type,
			title = card.type === 's_answer' ? 'The students\' answer' : 'The instructors\' answer', 
			a = card.history[0];

		return (
			<div className={classes}>
				<h2>{title}</h2>
				<div className="author">{Dates.longRel(a.created)} by {a.anon === 'no' ? name(a.uid) : 'Anonymous'}</div>
				<div className="content" dangerouslySetInnerHTML={{__html: a.content}} />
			</div>)
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
			feedback = thread.children;

		return (
			<div className="thread">
				<div className="content" dangerouslySetInnerHTML={{__html: thread.subject}} />
				{feedback.map(function (data) {
					return <div className="feedback content" dangerouslySetInnerHTML={{__html: data.subject}} />;
				})}
			</div>)
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
			<div className="card followup">
				<h2>Follow-up discussions</h2>
				{threads.map(function (thread) {
					return <FollowupThread key={thread.id} thread={thread} getName={getName} />;
				})}
			</div>)
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
	safeGetName: function (uid) {
		return this.props.names[uid] ? this.props.names[uid].name : '...';
	},
	render: function () {
		if (this.props.card == null) return <div id="card-view"></div>;

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
			s_ansCard = <AnswerCard card={children.s_ans} getName={this.safeGetName} />;
		if (children.i_ans)
			i_ansCard = <AnswerCard card={children.i_ans} getName={this.safeGetName} />;
		if (children.followups.length)
			followupCard = <FollowupCard threads={children.followups} getName={this.safeGetName} />;

		return (
			<div id="card-view">
				<OpCard card={card} getName={this.safeGetName} />
				{s_ansCard}
				{i_ansCard}
				{followupCard}
			</div>);
	}
});