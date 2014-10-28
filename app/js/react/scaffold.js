/** @jsx React.DOM */
'use strict';

var Scaffold = React.createClass({
	displayName: 'Scaffold',
	propTypes: {
		user: React.PropTypes.object.isRequired,
		feeds: React.PropTypes.object.isRequired,

		doRefresh: React.PropTypes.func.isRequired
	},
	getInitialState: function () {
		var activeCourse = this.props.user.networks[0];
		return {
			selectedCourse: activeCourse,
			selectedFilter: P.FILTERS[0],
			selectedFolder: '',
			selectedCard: '',
			selectedOption: '',
			filteredCards: this.props.feeds[activeCourse.id].feed,
			selectedCardData: null
		}
	},
	componentWillReceiveProps: function (props) {
		this.setState({
			filteredCards: this.filterCards(undefined, undefined, undefined, props)
		});
	},

	filterCards: function (course, filter, folder, props) {
		var props = props != undefined ? props : this.props,
			user = props.user,
			cards = props.feeds[course != undefined ? course.id : this.state.selectedCourse.id].feed,
			selectedFilter = filter != undefined ? filter[1] : this.state.selectedFilter[1],
			selectedFolder = folder != undefined ? folder : this.state.selectedFolder;

		// apply filter
		if (selectedFilter === '') {} // noop; break
		else if (selectedFilter === 'student')
			cards = cards.filter(function (card) {
				return card.tags.indexOf('student') !== -1;
			});
		else if (selectedFilter === 'instructor')
			cards = cards.filter(function (card) {
				return card.tags.indexOf('instructor-note') !== -1 ||
				       card.tags.indexOf('instructor-question') !== -1;
			});
		else if (selectedFilter === 'question' || selectedFilter === 'note' || selectedFilter === 'poll')
			cards = cards.filter(function (card) {
				return selectedFilter === card.type;
			});
		else if (selectedFilter === 'unread')
			cards = cards.filter(function (card) {
				return card.is_new;
			});
		else if (selectedFilter === 'unresolved')
			cards = cards.filter(function (card) {
				return !!card.no_answer_followup;
			});
		else if (selectedFilter === 'updated')
			cards = cards.filter(function (card) {
				return !!card.view_adjust;
			});
		else if (selectedFilter === 'following')
			cards = cards.filter(function (card) {
				return true; // TODO
			});
		else if (selectedFilter === 'archived')
			cards = cards.filter(function (card) {
				return false; // TODO
			});

		// apply folder
		if (selectedFolder !== '')
			cards = cards.filter(function (card) {
				return card.folders.indexOf(selectedFolder) !== -1;
			});

		return cards;
	},

	// event handlers
	handleSelectCourse: function (course) {
		this.setState({
			selectedCourse: course,
			filteredCards: this.filterCards(course)
		});
	},
	handleSelectFilter: function (filter) {
		this.setState({
			selectedFilter: filter,
			filteredCards: this.filterCards(undefined, filter)
		});
	},
	handleSelectFolder: function (folder) {
		this.setState({
			selectedFolder: folder,
			filteredCards: this.filterCards(undefined, undefined, folder)
		});
	},
	handleSelectOption: function (option) {
		this.setState({
			selectedOption: option
		});
	},
	handleSelectCard: function (id) {
		var setState = this.setState.bind(this), _this = this;
		setState({
			selectedCard: id
		});
		P.getContent(id, this.state.activeCourse).then(function (result) {
			if (_this.state.selectedCard === id)
				setState({
					selectedCardData: result
				});
		});
	},

	render: function () {
		return (
			React.DOM.div({id: "wrapper"}, 
				Header({course: this.state.selectedCourse, 
				        doRefresh: this.props.doRefresh}), 
				React.DOM.div({id: "content"}, 
					Sidebar({user: this.props.user, 
					         selectedCourse: this.state.selectedCourse, 
					         selectedFilter: this.state.selectedFilter, 
					         selectedFolder: this.state.selectedFolder, 
					         selectedOption: this.state.selectedOption, 
					         handleSelectCourse: this.handleSelectCourse, 
					         handleSelectFilter: this.handleSelectFilter, 
					         handleSelectFolder: this.handleSelectFolder, 
					         handleSelectOption: this.handleSelectOption}), 
					List({cards: this.state.filteredCards, 
					      selectedCard: this.state.selectedCard, 
					      handleSelectCard: this.handleSelectCard}), 
					CardView({card: this.state.selectedCardData})
				)
			)
		)
	}
});