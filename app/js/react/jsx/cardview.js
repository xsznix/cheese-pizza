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
			<div className={classes}>
				<h2>{q.subject}</h2>
				<div className="author">{q.created} by {q.anon === 'no' ? q.uid : q.anon}</div>
				<div className="content" dangerouslySetInnerHTML={{__html: q.content}} />
				<hr />
				<div className="meta">
					<a href="#" className="edit">Edit</a>
					<a href="#" className="thank">Thank</a>
					<a href="#" className="follow">Follow</a>
					<a href="#" className="star">Star</a>
					<div className="separator" />
					<div className="views"><i className="fa fa-eye" />{card.unique_views}</div>
					<div className="likes"><i className="fa fa-thumbs-up" />{card.upvote_ids ? card.upvote_ids.length : 0}</div>
				</div>
			</div>);
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
			<div className={classes}>
				<h2>{title}</h2>
				<div className="author">{a.created} by {a.anon === 'no' ? a.uid : a.anon}</div>
				<div className="content" dangerouslySetInnerHTML={{__html: a.content}} />
			</div>)
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
			<div className="thread">
				<div className="content" dangerouslySetInnerHTML={{__html: thread.subject}} />
				{feedback.map(function (data) {
					<div className="feedback" dangerouslySetInnerHTML={{__html: thread.subject}} />
				})}
			</div>)
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
			<div className="card followup">
				<h2>Follow-up discussions</h2>
				{threads.map(function (thread) {
					return <FollowupThread key={thread.id} thread={thread} />;
				})}
			</div>)
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
		if (this.props.card == null) return <div id="card-view"></div>;

		var card = this.props.card,
			children = this.sortChildren(card.children),
			s_ansCard = null,
			i_ansCard = null,
			followupCard = null;

		if (children.s_ans)
			s_ansCard = <AnswerCard card={children.s_ans} />;
		if (children.i_ans)
			i_ansCard = <AnswerCard card={children.i_ans} />;
		if (children.followups.length)
			followupCard = <FollowupCard threads={children.followups} />;

		return (
			<div id="card-view">
				<OpCard card={card} />
				{s_ansCard}
				{i_ansCard}
				{followupCard}
			</div>);
	}
});