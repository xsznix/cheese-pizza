/** @jsx React.DOM */
'use strict';

var Scaffold = React.createClass({
	displayName: 'Scaffold',
	propTypes: {
		user: React.PropTypes.object.isRequired,
		feeds: React.PropTypes.object.isRequired,
		names: React.PropTypes.object.isRequired,

		doRefresh: React.PropTypes.func.isRequired,
		doLoadNames: React.PropTypes.func.isRequired,
		doMarkAsRead: React.PropTypes.func.isRequired,
		doLogout: React.PropTypes.func.isRequired
	},
	getInitialState: function () {
		var lastNetwork = this.props.user.last_network;
		var activeCourses = [], inactiveCourses = [],
			lastNetworkIsActive, selectedCourse;

		// filter networks by activeness and find the last network
		 this.props.user.networks.forEach(function (n) {
		 	var active = n.status === 'active';

			if (active) activeCourses.push(n);
			else inactiveCourses.push(n);

			if (n.id === lastNetwork) {
				selectedCourse = n;
				lastNetworkIsActive = active;
			}
		});

		return {
			selectedCourse: selectedCourse,
			selectedFilter: P.FILTERS[0],
			selectedFolder: '',
			selectedCard: '',
			selectedOption: '',
			filteredCards: this.props.feeds[lastNetwork].feed,
			selectedCardData: null,
			activeCourses: activeCourses,
			inactiveCourses: inactiveCourses,
			showInactiveCourses: !lastNetworkIsActive
		}
	},
	componentWillReceiveProps: function (props) {
		this.setState({
			filteredCards: this.filterCards(undefined, undefined, undefined, props),
		});
	},

	filterCards: function (course, filter, folder, props) {
		var props = props != undefined ? props : this.props;
		var user = props.user;
		var courseId = course != undefined ? course.id : this.state.selectedCourse.id;
		var cards = props.feeds[courseId] ? props.feeds[courseId].feed : [];
		var selectedFilter = filter != undefined ? filter[1] : this.state.selectedFilter[1];
		var selectedFolder = folder != undefined ? folder : this.state.selectedFolder;

		// apply filter
		if (selectedFilter === '' || !cards.length) {} // noop; break
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
				return card.main_version !== card.version;
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
		var refresh = this.props.doRefresh;
		this.setState({
			selectedCourse: course,
			filteredCards: this.filterCards(course),
			selectedCard: '', // unshow card, to avoid course ambiguity problems
			selectedCardData: null
		}, function () {
			refresh(course.id);
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
	handleSelectCard: function (card) {
		var setState = this.setState.bind(this), _this = this;

		setState({
			selectedCard: card.id
		});

		P.getContent(card.id, this.state.activeCourse).then(function (result) {
			if (_this.state.selectedCard === card.id)
				setState({
					selectedCardData: result
				});
			_this.props.doMarkAsRead(result, card, _this.state.selectedCourse.id, _this);
		});
	},
	handleToggleShowInactiveCourses: function (show) {
		this.setState({
			showInactiveCourses: show
		});
	},
	handleLoadNames: function (uids) {
		this.props.doLoadNames(uids, this.state.selectedCourse.id);
	},

	render: function () {
		var namesInCourse = this.props.names[this.state.selectedCourse.id] || {};

		return (
			React.createElement("div", {id: "wrapper"}, 
				React.createElement(Header, {course: this.state.selectedCourse, 
				        doRefresh: this.props.doRefresh, 
				        doLogout: this.props.doLogout}), 
				React.createElement("div", {id: "content"}, 
					React.createElement(Sidebar, {user: this.props.user, 
					         activeCourses: this.state.activeCourses, 
					         inactiveCourses: this.state.inactiveCourses, 
					         showInactiveCourses: this.state.showInactiveCourses, 
					         selectedCourse: this.state.selectedCourse, 
					         selectedFilter: this.state.selectedFilter, 
					         selectedFolder: this.state.selectedFolder, 
					         selectedOption: this.state.selectedOption, 
					         handleSelectCourse: this.handleSelectCourse, 
					         handleSelectFilter: this.handleSelectFilter, 
					         handleSelectFolder: this.handleSelectFolder, 
					         handleSelectOption: this.handleSelectOption, 
					         handleToggleShowInactiveCourses: this.handleToggleShowInactiveCourses}), 
					React.createElement(List, {cards: this.state.filteredCards, 
					      selectedCard: this.state.selectedCard, 
					      handleSelectCard: this.handleSelectCard}), 
					React.createElement(CardView, {card: this.state.selectedCardData, 
					          names: namesInCourse, 
					          doLoadNames: this.handleLoadNames, 
					          doMarkAsRead: this.props.doMarkAsRead})
				)
			)
		)
	}
});