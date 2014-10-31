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
			<div id="sidebar">
				<div id="account-info" className="section">{user.name}</div>

				<div id="courses" className="section">
					<h2>Courses</h2>
					{coursesToShow.map(function (network) {
						var classes = 'course clickable';
						if (network.id === selectedCourse.id)
							classes += ' selected';
						if (network.status !== 'active')
							classes += ' inactive';

						return <div key={network.id} className={classes} onClick={selectCourse(network)}>
							<div className="course-num">{network.course_number}</div>
							<div className="course-name">{network.name}</div>
							</div>;
					})}
					<div id="inactive-toggle" className={toggleClasses} onClick={showInactive}>
						{toggleText}
					</div>
				</div>

				<div id="filters" className="section">
					<h2>Filters</h2>
					{P.FILTERS.map(function (filter) {
						var classes = 'filter clickable';
						if (filter[1] === selectedFilter[1])
							classes += ' selected';

						return <div key={filter[1]} className={classes} onClick={selectFilter(filter)}>{filter[0]}</div>;
					})}
				</div>

				<div id="folders" className="section">
					<h2>Folders</h2>
					<div className={"folder clickable" + (selectedFolder === '' ? ' selected' : '')} onClick={selectFolder('')}>Show All</div>
					{selectedCourse.folders ? selectedCourse.folders.map(function (folder) {
						var classes = 'folder clickable';
						if (folder === selectedFolder)
							classes += ' selected';

						return <div key={folder} className={classes} onClick={selectFolder(folder)}>{folder}</div>
					}) : null}
				</div>

				<div id="options" className="section">
					<h2>Options</h2>
				</div>
			</div>);
	}
});