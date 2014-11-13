/** @jsx React.DOM */
'use strict';

(function () {
	function listNames (names) {
		switch (names.length) {
			case 1:
				return names[0];
			case 2:
				return names.join(' and ');
			default:
				// magic
				return names.splice(0, names.length - 1).join(', ') + ', and ' + names[0];
		}
	}

	function approves (arr) {
		var names = arr.map(function (a) { return a.name; });
		return listNames(names) + (arr.length === 1 ? ' approves.' : ' approve.');
	}

	function instEndorsers (arr) {
		return arr.filter(function (endorser) {
			return endorser.admin;
		});
	}

	function getAuthorData (history) {
		var seen = {}, hasStudAnon = false, hasFullAnon = false;

		// array reversal is destructive in JS, so make a copy of the array
		return Array.apply(null, history).reverse().filter(function (item) {
			if (item.anon === 'no') {
				if (seen[item.uid])
					return false;
				else
					return seen[item.uid] = true;
			} else if (item.anon === 'stud') {
				if (hasStudAnon)
					return false;
				else
					return hasStudAnon = true;
			} else {
				if (hasFullAnon)
					return false;
				else
					return hasFullAnon = true;
			}
		});
	}

	function userIsInArray (uid, arr) {
		for (var i = 0, len = arr.length; i < len; i++)
			if (arr[i].id === uid)
				return true;

		return false;
	}

	window.OpCard = React.createClass({
		displayName: 'OpCard',
		propTypes: {
			user: React.PropTypes.object.isRequired,
			card: React.PropTypes.object.isRequired,
			getName: React.PropTypes.func.isRequired,
			getNames: React.PropTypes.func.isRequired
		},
		getInitialState: function () {
			return {
				numThanks: this.props.card.tag_good.length,
				userThanked: userIsInArray(this.props.user.id, this.props.card.tag_good)
			}
		},

		thank: function () {
			var setState = this.setState.bind(this),
				currNumThanks = this.state.numThanks;
			P.thankQuestion(this.props.card.id).then(function (result) {
				if (result === 'OK')
					setState({
						numThanks: currNumThanks + 1,
						userThanked: true
					});
			});
		},
		unthank: function () {
			var setState = this.setState.bind(this),
				currNumThanks = this.state.numThanks;
			P.unthankQuestion(this.props.card.id).then(function (result) {
				if (result === 'OK')
					setState({
						numThanks: currNumThanks - 1,
						userThanked: false
					});
			});
		},
		toggleThanks: function () {
			if (this.state.userThanked)
				this.unthank();
			else
				this.thank();
		},

		render: function () {
			var card = this.props.card,
				names = this.props.getNames,
				classes = 'card op ' + card.type,
				q = card.history[0],
				goodDiv = null,
				i_end = instEndorsers(card.tag_good),
				thankText = this.state.userThanked ? 'Unthank' : 'Thank',
				likesClasses = 'likes';

			if (i_end.length)
				goodDiv = React.createElement("div", {className: "approve"}, approves(i_end));
			if (this.state.userThanked)
				likesClasses += ' self-endorsed';

			return (
				React.createElement("div", {className: classes}, 
					React.createElement("h2", {dangerouslySetInnerHTML: {__html: q.subject}}), 
					React.createElement("div", {className: "author"}, Dates.longRel(q.created), " by ", listNames(names(getAuthorData(card.history)))), 
					React.createElement(Content, {className: "content", html: q.content}), 
					goodDiv, 
					React.createElement("hr", null), 
					React.createElement("div", {className: "meta"}, 
						React.createElement("a", {href: "#", className: "edit"}, "Edit"), 
						React.createElement("a", {href: "#", className: "thank", onClick: this.toggleThanks}, thankText), 
						React.createElement("a", {href: "#", className: "follow"}, "Follow"), 
						React.createElement("a", {href: "#", className: "star"}, "Star"), 
						React.createElement("div", {className: "separator"}), 
						React.createElement("div", {className: "views"}, React.createElement("i", {className: "fa fa-eye"}), card.unique_views), 
						React.createElement("div", {className: likesClasses}, React.createElement("i", {className: "fa fa-thumbs-up"}), this.state.numThanks)
					)
				));
		}
	});

	window.AnswerCard = React.createClass({
		displayName: 'AnswerCard',
		propTypes: {
			card: React.PropTypes.object.isRequired,
			getName: React.PropTypes.func.isRequired,
			getNames: React.PropTypes.func.isRequired
		},
		getInitialState: function () {
			return {
				numThanks: this.props.card.tag_endorse.length,
				userThanked: userIsInArray(this.props.user.id, this.props.card.tag_endorse)
			}
		},

		thank: function () {
			var setState = this.setState.bind(this),
				currNumThanks = this.state.numThanks;
			P.thankAnswer(this.props.card.id).then(function (result) {
				if (result === 'OK')
					setState({
						numThanks: currNumThanks + 1,
						userThanked: true
					});
			});
		},
		unthank: function () {
			var setState = this.setState.bind(this),
				currNumThanks = this.state.numThanks;
			P.unthankAnswer(this.props.card.id).then(function (result) {
				if (result === 'OK')
					setState({
						numThanks: currNumThanks - 1,
						userThanked: false
					});
			});
		},
		toggleThanks: function () {
			if (this.state.userThanked)
				this.unthank();
			else
				this.thank();
		},
		
		render: function () {
			var card = this.props.card,
				names = this.props.getNames,
				classes = 'card answer ' + card.type,
				title = card.type === 's_answer' ? 'The students\' answer' : 'The instructors\' answer', 
				a = card.history[0],
				is_s_ans = card.type === 's_answer',
				i_end = [],
				editDiv = null,
				goodDiv = null,
				thankText = this.state.userThanked ? 'Unthank' : 'Thank',
				likesClasses = 'likes';

			if (is_s_ans) {
				i_end = instEndorsers(card.tag_endorse);
				editDiv = React.createElement("a", {href: "#", className: "edit"}, "Edit");
				if (i_end.length) {
					goodDiv = React.createElement("div", {className: "approve"}, approves(i_end))
				}
			}

			if (this.state.userThanked)
				likesClasses += ' self-endorsed';

			return (
				React.createElement("div", {className: classes}, 
					React.createElement("h2", null, title), 
					React.createElement("div", {className: "author"}, Dates.longRel(a.created), " by ", listNames(names(getAuthorData(card.history)))), 
					React.createElement(Content, {className: "content", html: a.content}), 
					goodDiv, 
					React.createElement("hr", null), 
					React.createElement("div", {className: "meta"}, 
						editDiv, 
						React.createElement("a", {href: "#", className: "thank", onClick: this.toggleThanks}, thankText), 
						React.createElement("div", {className: "separator"}), 
						React.createElement("div", {className: likesClasses}, React.createElement("i", {className: "fa fa-thumbs-up"}), this.state.numThanks)
					)
				))
		}
	});

	window.FollowupThread = React.createClass({
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

	window.FollowupCard = React.createClass({
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

	window.CardView = React.createClass({
		displayName: 'CardView',
		propTypes: {
			user: React.PropTypes.object.isRequired,
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
		safeGetNames: function (data) {
			var len = data.length, result = [];
			for (var i = 0; i < len; i++) // avoid Arary.map being weird with scoping
				result.push(this.safeGetName(data[i]));
			return result;
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

			var user = this.props.user,
				card = this.props.card,
				children = this.sortChildren(card.children),
				s_ansCard = null,
				i_ansCard = null,
				followupCard = null;

			if (children.s_ans)
				s_ansCard = React.createElement(AnswerCard, {user: user, card: children.s_ans, getName: this.safeGetName, getNames: this.safeGetNames});
			if (children.i_ans)
				i_ansCard = React.createElement(AnswerCard, {user: user, card: children.i_ans, getName: this.safeGetName, getNames: this.safeGetNames});
			if (children.followups.length)
				followupCard = React.createElement(FollowupCard, {threads: children.followups, getName: this.safeGetName});

			return (
				React.createElement("div", {id: "card-view", ref: "card"}, 
					React.createElement(OpCard, {user: user, card: card, getName: this.safeGetName, getNames: this.safeGetNames}), 
					s_ansCard, 
					i_ansCard, 
					followupCard
				));
		}
	});	
})();
