/** @jsx React.DOM */
'use strict';

var LoginForm = React.createClass({
	displayName: 'LoginForm',
	propTypes: {
		email: React.PropTypes.string,
		password: React.PropTypes.string
	},
	getInitialState: function () {
		return {
			email: this.props.email || '',
			password: this.props.password || ''
		}
	},
	handleLogin: function () {
		console.warn('unimplemented');
	},
	handleEmailChange: function (event) {
		this.setState({
			email: event.target.value
		});
	},
	handlePasswordChange: function (event) {
		this.setState({
			password: event.target.value
		});
	},
	render: function () {
		return (
			React.DOM.form({className: "login", onsubmit: this.handleLogin}, 
				React.DOM.h2(null, "Welcome to Cheese Pizza!"), 
				React.DOM.p({className: "sub"}, "Please enter your Piazza credentials below."), 
				React.DOM.input({type: "text", ref: "email", 
					value: this.state.email, 
					onchange: this.handleEmailChange}), 
				React.DOM.input({type: "password", ref: "password", 
					value: this.state.password, 
					onchange: this.handlePasswordChange}), 
				React.DOM.input({type: "submit", ref: "submit"})
			))
	}
});