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
			showInactiveCourses: !lastNetworkIsActive,

			searchMode: false,

			activeFeed: this.props.feeds[lastNetwork].feed,
			numItemsLoaded: P.DEFAULT_NUM_FEED_ITEMS
		}
	},
	componentWillReceiveProps: function (props) {
		if (!this.state.searchMode) {
			var newFeed = props.feeds[this.state.selectedCourse.id].feed;
			this.setState({
				filteredCards: this.filterCards({feed: newFeed}),
				activeFeed: newFeed,
				numItemsLoaded: newFeed.length
			});
		}
	},

	filterCards: function (options) {
		var props, user, courseId, feed, filter, folder;

		// read options
		if (options.props == undefined)
			props = this.props;
		else
			props = options.props;

		if (options.user == undefined)
			user = props.user;
		else
			user = options.user;

		if (options.feed)
			feed = options.feed;
		else if (options.course)
			if (props.feeds[options.course.id])
				feed = props.feeds[options.course.id].feed;
			else
				feed = [];
		else
			feed = this.state.activeFeed;

		if (options.filter == undefined)
			filter = this.state.selectedFilter[1];
		else
			filter = options.filter[1];

		if (options.folder == undefined)
			folder = this.state.selectedFolder;
		else
			folder = options.folder;

		// apply filter
		if (filter === '' || !feed.length) {} // noop; break
		else if (filter === 'student')
			feed = feed.filter(function (card) {
				return card.tags.indexOf('student') !== -1;
			});
		else if (filter === 'instructor')
			feed = feed.filter(function (card) {
				return card.tags.indexOf('instructor-note') !== -1 ||
				       card.tags.indexOf('instructor-question') !== -1;
			});
		else if (filter === 'question' || filter === 'note' || filter === 'poll')
			feed = feed.filter(function (card) {
				return filter === card.type;
			});
		else if (filter === 'unread')
			feed = feed.filter(function (card) {
				return card.is_new;
			});
		else if (filter === 'unresolved')
			feed = feed.filter(function (card) {
				return !!card.no_answer_followup;
			});
		else if (filter === 'updated')
			feed = feed.filter(function (card) {
				return card.main_version !== card.version;
			});
		else if (filter === 'following')
			feed = feed.filter(function (card) {
				return true; // TODO
			});
		else if (filter === 'archived')
			feed = feed.filter(function (card) {
				return false; // TODO
			});

		// apply folder
		if (folder !== '')
			feed = feed.filter(function (card) {
				return card.folders.indexOf(folder) !== -1;
			});

		return feed;
	},

	// event handlers
	handleSelectCourse: function (course) {
		var refresh = this.props.doRefresh,
			newFeed = this.props.feeds[course.id].feed;
		this.setState({
			selectedCourse: course,
			filteredCards: this.filterCards({course: course}),
			selectedCard: '', // unshow card, to avoid course ambiguity problems
			selectedCardData: null,
			activeFeed: newFeed,
			numItemsLoaded: newFeed.length
		}, function () {
			refresh(course.id);
		});
	},
	handleSelectFilter: function (filter) {
		this.setState({
			selectedFilter: filter,
			filteredCards: this.filterCards({filter: filter})
		});
	},
	handleSelectFolder: function (folder) {
		this.setState({
			selectedFolder: folder,
			filteredCards: this.filterCards({folder: folder})
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
	handleLoadMore: function (loadAll) {
		var setState = this.setState.bind(this),
			_this = this,
			currNid = this.state.selectedCourse.id,
			numToLoad = (loadAll ? 1000000 : this.state.numItemsLoaded + P.DEFAULT_NUM_FEED_ITEMS);

		P.getFeed(currNid, 0, numToLoad).then(function (result) {
			if (_this.state.selectedCourse.id === currNid) {
				setState({
					activeFeed: result.feed,
					numItemsLoaded: numToLoad,
					filteredCards: _this.filterCards({feed: result.feed})
				});
			}
		});
	},
	handleSearch: function (query) {
		var setState = this.setState.bind(this),
			_this = this,
			currNid = this.state.selectedCourse.id;

		P.search(currNid, query).then(function (result) {
			if (_this.state.selectedCourse.id === currNid) {
				setState({
					filteredCards: result,
					activeFeed: result,
					numItemsLoaded: 0,
					searchMode: true
				});
			}
		});
	},
	handleUnsearch: function (query) {
		var newFeed = this.props.feeds[this.state.selectedCourse.id].feed;
		this.setState({
			filteredCards: newFeed,
			activeFeed: newFeed,
			numItemsLoaded: newFeed.length,
			searchMode: false
		});
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
					      handleSelectCard: this.handleSelectCard, 
					      handleLoadMore: this.handleLoadMore, 
					      handleSearch: this.handleSearch, 
					      handleUnsearch: this.handleUnsearch}), 
					React.createElement(CardView, {card: this.state.selectedCardData, 
					          names: namesInCourse, 
					          doLoadNames: this.handleLoadNames, 
					          doMarkAsRead: this.props.doMarkAsRead})
				)
			)
		)
	}
});