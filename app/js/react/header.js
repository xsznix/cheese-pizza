/** @jsx React.DOM */
'use strict';

var Header = React.createClass({
	displayName: 'Header',
	render: function () {
		return (
			React.DOM.div({id: "header"}, 
				React.DOM.div({id: "app-title"}, "Cheese Pizza")
			));
	}
});