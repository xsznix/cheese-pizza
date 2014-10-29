/** @jsx React.DOM */
'use strict';

var ListItem = React.createClass({
	displayName: 'ListItem',
	propTypes: {
		card: React.PropTypes.object.isRequired,
		selectedCard: React.PropTypes.string,
		handleSelectCard: React.PropTypes.func.isRequired
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
			followup_div = React.DOM.div({className: "unresolved-count"}, card.no_answer_followup);
		if (card.main_version !== card.version)
			unviewed_div = React.DOM.div({className: "unviewed-count"}, card.main_version - (card.version || 0));
		if (card.has_s)
			s_div = React.DOM.div({className: "has-student-answer"}, "S");
		if (card.has_i)
			i_div = React.DOM.div({className: "has-instructor-answer"}, "I");
		if (card.type === 'note')
			note_div = React.DOM.div({className: "is-note fa fa-bars"});

		return (
			React.DOM.div({className: classes.join(' '), onClick: selectThis}, 
				React.DOM.div({className: "header"}, 
					React.DOM.div({className: "title"}, card.subject), 
					React.DOM.div({className: "time"}, Dates.shortRel(card.log[0].t))
				), 
				React.DOM.div({className: "content"}, 
					React.DOM.div({className: "message", dangerouslySetInnerHTML: {__html: card.content_snipet}}), 
					React.DOM.div({className: "meta"}, 
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
	render: function () {
		var bucket = this.props.bucket,
			selectedCard = this.props.selectedCard,
			handleSelectCard = this.props.handleSelectCard;

		return (
			React.DOM.div({className: "bucket"}, 
				React.DOM.h2(null, bucket.name), 
				bucket.cards.map(function (card) {
					var classes = ['item', card.type];
					return ListItem({key: card.id, 
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
		handleSelectCard: React.PropTypes.func.isRequired
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

	render: function () {
		var buckets = this.putCardsInBuckets(this.props.cards),
			selectedCard = this.props.selectedCard,
			handleSelectCard = this.props.handleSelectCard;

		return (
			React.DOM.div({id: "list"}, 

				React.DOM.div({id: "search"}, 
					React.DOM.span({className: "fa fa-search"}), 
					React.DOM.input({type: "text", id: "search-box", placeholder: "Search"})
				), 

				React.DOM.div({id: "list-scroll"}, 
					buckets.map(function (bucket) {
						if (!bucket) return null;
						return (
							Bucket({key: bucket.name, 
							        bucket: bucket, 
							        selectedCard: selectedCard, 
							        handleSelectCard: handleSelectCard}));
					})
				)

			))
	}
});