/** @jsx React.DOM */
'use strict';

var Sidebar = React.createClass({
	displayName: 'Sidebar',
	propTypes: {
		user: React.PropTypes.object.isRequired,

		selectedCourse: React.PropTypes.object,
		selectedFilter: React.PropTypes.array,
		selectedFolder: React.PropTypes.string,
		selectedOption: React.PropTypes.string,

		handleSelectCourse: React.PropTypes.func.isRequired,
		handleSelectFilter: React.PropTypes.func.isRequired,
		handleSelectFolder: React.PropTypes.func.isRequired,
		handleSelectOption: React.PropTypes.func.isRequired
	},
	render: function () {
		var user = this.props.user,

			selectedCourse = this.props.selectedCourse,
			selectedFilter = this.props.selectedFilter,
			selectedFolder = this.props.selectedFolder,
			selectedOption = this.props.selectedOption,

			handleSelectCourse = this.props.handleSelectCourse,
			handleSelectFilter = this.props.handleSelectFilter,
			handleSelectFolder = this.props.handleSelectFolder,
			handleSelectOption = this.props.handleSelectOption,
			
			selectCourse = function (course) {
				return function () {
					handleSelectCourse(course);
				}
			},
			selectFilter = function (filter) {
				return function () {
					handleSelectFilter(filter);
				}
			},
			selectFolder = function (folder) {
				return function () {
					handleSelectFolder(folder);
				}
			},
			selectOption = function (option) {
				return function () {
					handleSelectOption(option);
				}
			};
		return (
			React.DOM.div({id: "sidebar"}, 
				React.DOM.div({id: "account-info", className: "section"}, user.name), 

				React.DOM.div({id: "courses", className: "section"}, 
					React.DOM.h2(null, "Courses"), 
					user.networks.map(function (network) {
						var classes = 'course clickable';
						if (network.id === selectedCourse.id)
							classes += ' selected';

						return React.DOM.div({key: network.id, className: classes, onClick: selectCourse(network)}, 
							React.DOM.div({className: "course-num"}, network.course_number), 
							React.DOM.div({className: "course-name"}, network.name)
							);
					})
				), 

				React.DOM.div({id: "filters", className: "section"}, 
					React.DOM.h2(null, "Filters"), 
					P.FILTERS.map(function (filter) {
						var classes = 'filter clickable';
						if (filter[1] === selectedFilter[1])
							classes += ' selected';

						return React.DOM.div({key: filter[1], className: classes, onClick: selectFilter(filter)}, filter[0]);
					})
				), 

				React.DOM.div({id: "folders", className: "section"}, 
					React.DOM.h2(null, "Folders"), 
					React.DOM.div({className: "folder clickable" + (selectedFolder === '' ? ' selected' : ''), onClick: selectFolder('')}, "Show All"), 
					selectedCourse.folders.map(function (folder) {
						var classes = 'folder clickable';
						if (folder === selectedFolder)
							classes += ' selected';

						return React.DOM.div({key: folder, className: classes, onClick: selectFolder(folder)}, folder)
					})
				), 

				React.DOM.div({id: "options", className: "section"}, 
					React.DOM.h2(null, "Options")
				)
			));
	}
});