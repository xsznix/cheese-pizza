/** @jsx React.DOM */
'use strict';

var Sidebar = React.createClass({
	displayName: 'Sidebar',
	propTypes: {
		user: React.PropTypes.object.isRequired,

		activeCourses: React.PropTypes.array.isRequired,
		inactiveCourses: React.PropTypes.array.isRequired,
		showInactiveCourses: React.PropTypes.bool.isRequired,

		selectedCourse: React.PropTypes.object,
		selectedFilter: React.PropTypes.array,
		selectedFolder: React.PropTypes.string,
		selectedOption: React.PropTypes.string,

		handleSelectCourse: React.PropTypes.func.isRequired,
		handleSelectFilter: React.PropTypes.func.isRequired,
		handleSelectFolder: React.PropTypes.func.isRequired,
		handleSelectOption: React.PropTypes.func.isRequired,
		handleToggleShowInactiveCourses: React.PropTypes.func.isRequired
	},
	render: function () {
		var user = this.props.user,

			activeCourses = this.props.activeCourses,
			inactiveCourses = this.props.inactiveCourses,
			showInactiveCourses = this.props.showInactiveCourses,

			coursesToShow = showInactiveCourses ?
				activeCourses.concat(inactiveCourses) : activeCourses,

			selectedCourse = this.props.selectedCourse,
			selectedFilter = this.props.selectedFilter,
			selectedFolder = this.props.selectedFolder,
			selectedOption = this.props.selectedOption,

			handleSelectCourse = this.props.handleSelectCourse,
			handleSelectFilter = this.props.handleSelectFilter,
			handleSelectFolder = this.props.handleSelectFolder,
			handleSelectOption = this.props.handleSelectOption,
			handleToggleShowInactive = this.props.handleToggleShowInactiveCourses,
			
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
			},
			showInactive = function () {
				handleToggleShowInactive(!showInactiveCourses);
			};

		// classes for "Show inactive courses" toggle
		var toggleClasses = 'clickable toggle',
			toggleText;
		if (this.props.showInactiveCourses) {
			toggleClasses += ' on';
			toggleText = 'Hide inactive';
		} else {
			toggleClasses += ' off';
			toggleText = 'Show inactive';
		}

		return (
			React.createElement("div", {id: "sidebar"}, 
				React.createElement("div", {id: "account-info", className: "section"}, user.name), 

				React.createElement("div", {id: "courses", className: "section"}, 
					React.createElement("h2", null, "Courses"), 
					coursesToShow.map(function (network) {
						var classes = 'course clickable';
						if (network.id === selectedCourse.id)
							classes += ' selected';
						if (network.status !== 'active')
							classes += ' inactive';

						return React.createElement("div", {key: network.id, className: classes, onClick: selectCourse(network)}, 
							React.createElement("div", {className: "course-num"}, network.course_number), 
							React.createElement("div", {className: "course-name"}, network.name)
							);
					}), 
					React.createElement("div", {id: "inactive-toggle", className: toggleClasses, onClick: showInactive}, 
						toggleText
					)
				), 

				React.createElement("div", {id: "filters", className: "section"}, 
					React.createElement("h2", null, "Filters"), 
					P.FILTERS.map(function (filter) {
						var classes = 'filter clickable';
						if (filter[1] === selectedFilter[1])
							classes += ' selected';

						return React.createElement("div", {key: filter[1], className: classes, onClick: selectFilter(filter)}, filter[0]);
					})
				), 

				React.createElement("div", {id: "folders", className: "section"}, 
					React.createElement("h2", null, "Folders"), 
					React.createElement("div", {className: "folder clickable" + (selectedFolder === '' ? ' selected' : ''), onClick: selectFolder('')}, "Show All"), 
					selectedCourse.folders ? selectedCourse.folders.map(function (folder) {
						var classes = 'folder clickable';
						if (folder === selectedFolder)
							classes += ' selected';

						return React.createElement("div", {key: folder, className: classes, onClick: selectFolder(folder)}, folder)
					}) : null
				), 

				React.createElement("div", {id: "options", className: "section"}, 
					React.createElement("h2", null, "Options")
				)
			));
	}
});