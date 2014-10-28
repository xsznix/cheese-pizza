/** @jsx React.DOM */
'use strict';

var Header = React.createClass({
	displayName: 'Header',
	propTypes: {
		course: React.PropTypes.object.isRequired,
		doRefresh: React.PropTypes.func.isRequired
	},
	handleRefreshClick: function (event) {
		this.props.doRefresh(this.props.course.id);
	},
	render: function () {
		return (
			React.DOM.div({id: "header"}, 
				React.DOM.div({id: "app-title"}, "Cheese Pizza"), 
				React.DOM.div({id: "header-actions"}, 
					React.DOM.a({href: "#", onClick: this.handleRefreshClick}, "Refresh")
				)
			));
	}
});