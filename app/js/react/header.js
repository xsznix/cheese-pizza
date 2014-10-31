/** @jsx React.DOM */
'use strict';

var Header = React.createClass({
	displayName: 'Header',
	propTypes: {
		course: React.PropTypes.object.isRequired,
		doRefresh: React.PropTypes.func.isRequired,
		doLogout: React.PropTypes.func.isRequired
	},
	handleRefreshClick: function (event) {
		this.props.doRefresh(this.props.course.id);
	},
	render: function () {
		return (
			React.createElement("div", {id: "header"}, 
				React.createElement("div", {id: "app-title"}, "Cheese Pizza"), 
				React.createElement("div", {id: "header-actions"}, 
					React.createElement("a", {href: "#", onClick: this.handleRefreshClick}, "Refresh"), 
					React.createElement("a", {href: "#", onClick: this.props.doLogout}, "Logout")
				)
			));
	}
});