/** @jsx React.DOM */
'use strict';

var Scaffold = React.createClass({
	displayName: 'Scaffold',
	propTypes: {
		courses: React.PropTypes.array.isRequired,
		cards: React.PropTypes.object.isRequired
	},
	getInitialState: function () {
		var activeCourse = this.props.courses[0];
		return {
			selectedCourse: activeCourse.id,
			selectedFilter: '',
			selectedFolder: '',
			selectedCard: '',
			selectedOption: '',
			filteredCards: this.props.cards[activeCourse.id],
			selectedCardData: null
		}
	},

	handleSelectCourse: function (event) {
		this.setState({
			selectedCourse: event.target.value
		});
	},
	handleSelectFilter: function (event) {
		this.setState({
			selectedFilter: event.target.value
		});
	},
	handleSelectFolder: function (event) {
		this.setState({
			selectedFolder: event.target.value
		});
	},
	handleSelectOption: function (event) {
		this.setState({
			selectedOption: event.target.value
		});
	},
	handleSelectCard: function (id) {
		var setState = this.setState.bind(this);
		setState({
			selectedCard: id
		});
		P.getContent(id, this.state.activeCourse).then(function (result) {
			setState({
				selectedCardData: result
			});
		});
	},

	render: function () {
		return (
			React.DOM.div({id: "wrapper"}, 
				Header(null), 
				React.DOM.div({id: "content"}, 
					Sidebar({courses: this.props.courses, 
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