/** @jsx React.DOM */
'use strict';

var Sidebar = React.createClass({
	displayName: 'Sidebar',
	propTypes: {
		courses: React.PropTypes.array.isRequired,

		selectedCourse: React.PropTypes.string,
		selectedFilter: React.PropTypes.string,
		selectedFolder: React.PropTypes.string,
		selectedOption: React.PropTypes.string,

		handleSelectCourse: React.PropTypes.func.isRequired,
		handleSelectFilter: React.PropTypes.func.isRequired,
		handleSelectFolder: React.PropTypes.func.isRequired,
		handleSelectOption: React.PropTypes.func.isRequired
	},
	render: function () {
		console.warn('unimplemented');
		return (React.DOM.div(null));
	}
});