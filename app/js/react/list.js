/** @jsx React.DOM */
'use strict';

var ListItem = React.createClass({
	displayName: 'ListItem',
	propTypes: {
		card: React.PropTypes.object.isRequired,
		selectedCard: React.PropTypes.string,
		handleSelectCard: React.PropTypes.func.isRequired,
	},
	boldify: function (text) {
		return text.replace(/___bold_start___/g, '<b>').replace(/___bold_end___/g, '</b>');
	},
	render: function () {
		var card = this.props.card,
			classes = ['item', card.type],
			unresolved_div = null,
			unviewed_div = null,
			s_div = null,
			i_div = null,
			followup_div = null,
			note_div = null,
			handleSelectCard = this.props.handleSelectCard,
			selectThis = function () {
				handleSelectCard(card);
			};

		if (this.props.selectedCard === card.id)
			classes.push('selected');

		// TODO: verify that these data actually mean what I think they mean
		if (card.no_answer)
			classes.push('no-answer');
		if (card.is_new)
			classes.push('new');
		if (card.no_answer_followup)
			followup_div = React.createElement("div", {className: "unresolved-count"}, card.no_answer_followup);
		if (card.main_version !== card.version)
			unviewed_div = React.createElement("div", {className: "unviewed-count"}, card.main_version - (card.version || 0));
		if (card.has_s)
			s_div = (card.tag_endorse_prof ?
				React.createElement("div", {className: "has-student-answer"}, React.createElement("i", {className: "endorsed fa fa-check"}), "S") :
				React.createElement("div", {className: "has-student-answer"}, "S"));
		if (card.has_i)
			i_div = React.createElement("div", {className: "has-instructor-answer"}, "I");
		if (card.type === 'note')
			note_div = React.createElement("div", {className: "is-note fa fa-bars"});

		return (
			React.createElement("div", {className: classes.join(' '), onClick: selectThis}, 
				React.createElement("div", {className: "header"}, 
					React.createElement(Content, {className: "title", html: card.subject, forceRich: true}), 
					React.createElement("div", {className: "time"}, Dates.shortRel(card.log[0].t))
				), 
				React.createElement("div", {className: "content"}, 
					React.createElement(Content, {className: "message", html: this.boldify(card.content_snipet), forceRich: true}), 
					React.createElement("div", {className: "meta"}, 
						unresolved_div, 
						unviewed_div, 
						followup_div, 
						s_div, 
						i_div, 
						note_div
					)
				)
			))
	}
});

var Bucket = React.createClass({
	displayName: 'Bucket',
	propTypes: {
		bucket: React.PropTypes.object.isRequired,
		selectedCard: React.PropTypes.string,
		handleSelectCard: React.PropTypes.func.isRequired
	},

	getInitialState: function () {
		return {
			collapsed: this.props.bucket.name.indexOf('Week') !== -1
		}
	},

	toggleCollapsed: function () {
		this.setState({
			collapsed: !this.state.collapsed
		});
	},

	render: function () {
		var bucket = this.props.bucket,
			selectedCard = this.props.selectedCard,
			handleSelectCard = this.props.handleSelectCard,
			collapsed = this.state.collapsed,
			classes, iconClasses;
		if (collapsed) {
			classes = "bucket collapsed";
			iconClasses = "fa fa-caret-right";
		} else {
			classes = "bucket";
			iconClasses = "fa fa-caret-down";
		}

		return (
			React.createElement("div", {className: classes}, 
				React.createElement("h2", {onClick: this.toggleCollapsed}, React.createElement("i", {className: iconClasses}), bucket.name), 
				collapsed ? null : bucket.cards.map(function (card) {
					var classes = ['item', card.type];
					return React.createElement(ListItem, {key: card.id, 
					                 card: card, 
					                 selectedCard: selectedCard, 
					                 handleSelectCard: handleSelectCard})
				})
			))
	}
})

var List = React.createClass({
	displayName: 'List',
	propTypes: {
		cards: React.PropTypes.array.isRequired,
		selectedCard: React.PropTypes.string,
		handleSelectCard: React.PropTypes.func.isRequired,
		handleLoadMore: React.PropTypes.func.isRequired,
		handleSearch: React.PropTypes.func.isRequired,
		handleUnsearch: React.PropTypes.func.isRequired
	},
	getInitialState: function () {
		return {
			searchQuery: ''
		}
	},

	putCardsInBuckets: function (cards) {
		var buckets = [];
		cards.forEach(function (card) {
			if (buckets[card.bucket_order]) {
				buckets[card.bucket_order].cards.push(card);
			} else {
				buckets[card.bucket_order] = {
					cards: [card],
					name: card.bucket_name
				};
			}
		});
		return buckets;
	},

	handleSearchInput: function (e) {
		if (e.key === "Enter")
			this.props.handleSearch(this.state.searchQuery);
	},
	handleSearchChange: function (e) {
		this.setState({
			searchQuery: e.target.value
		});
	},
	handleUnsearch: function () {
		this.setState({
			searchQuery: ''
		});
		this.props.handleUnsearch();
	},

	isSameList: function (oldList, newList) {
		if (oldList.length > newList.length)
			return false;

		for (var i = 0, len = oldList.length; i < len; i++)
			if (oldList[i].id !== newList[i].id)
				return false;

		return true;
	},
	componentDidUpdate: function (prevProps, prevState) {
		if (!this.isSameList(prevProps.cards, this.props.cards))
			this.refs.scrollRoot.getDOMNode().scrollTop = 0;
	},

	render: function () {
		var buckets = this.putCardsInBuckets(this.props.cards),
			selectedCard = this.props.selectedCard,
			handleSelectCard = this.props.handleSelectCard,
			handleLoadMore = this.props.handleLoadMore,
			loadMore = function () { handleLoadMore(false) },
			loadAll = function () { handleLoadMore(true) };

		return (
			React.createElement("div", {id: "list"}, 

				React.createElement("div", {id: "search"}, 
					React.createElement("i", {className: "fa fa-search"}), 
					React.createElement("input", {type: "text", id: "search-box", placeholder: "Search", 
						value: this.state.searchQuery, onKeyPress: this.handleSearchInput, onChange: this.handleSearchChange}), 
					this.state.searchQuery.length ? React.createElement("i", {className: "fa fa-close", onClick: this.handleUnsearch}) : null
				), 

				React.createElement("div", {id: "list-scroll", ref: "scrollRoot"}, 
					buckets.map(function (bucket) {
						if (!bucket) return null;
						return (
							React.createElement(Bucket, {key: bucket.name, 
							        bucket: bucket, 
							        selectedCard: selectedCard, 
							        handleSelectCard: handleSelectCard}));
					}), 
					React.createElement("div", {className: "load-actions"}, 
						React.createElement("div", {className: "load-150", onClick: loadMore}, "Load more"), 
						React.createElement("div", {className: "load-all", onClick: loadAll}, "Load all")
					)
				)

			))
	}
});