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
			<div id="header">
				<div id="app-title">Cheese Pizza</div>
				<div id="header-actions">
					<a href="#" onClick={this.handleRefreshClick}>Refresh</a>
				</div>
			</div>);
	}
});