/** @jsx React.DOM */
'use strict';

var LoginForm = React.createClass({
	displayName: 'LoginForm',
	propTypes: {
		email: React.PropTypes.string,
		password: React.PropTypes.string,
		finishLogin: React.PropTypes.func.isRequired
	},
	getInitialState: function () {
		return {
			email: this.props.email || '',
			password: this.props.password || '',
			error: null,
			busy: false
		}
	},
	handleLogin: function () {
		this.setState({ error: null, busy: true });
		var email = this.state.email,
			password = this.state.password;

		P.login(email, password).then(this.props.finishLogin, this.handleLoginFailure);

		return false;
	},
	handleLoginFailure: function (e) {
		this.setState({ error: e.message, busy: false });
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
		var errorDiv = null;
		if (this.state.error)
			errorDiv = React.createElement("p", {id: "error", className: "info"}, this.state.error);

		return (
			React.createElement("div", {className: "login-wrapper"}, 
				React.createElement("form", {className: "login", onSubmit: this.handleLogin}, 
					React.createElement("h2", null, "Welcome to Cheese Pizza!"), 
					React.createElement("p", {className: "info"}, "Please enter your Piazza credentials below."), 
					errorDiv, 
					React.createElement("input", {type: "text", ref: "email", 
						value: this.state.email, 
						onChange: this.handleEmailChange, 
						placeholder: "Email"}), 
					React.createElement("input", {type: "password", ref: "password", 
						value: this.state.password, 
						onChange: this.handlePasswordChange, 
						placeholder: "Password"}), 
					React.createElement("input", {type: "submit", ref: "submit"}), 
					React.createElement("p", {className: "info"}, "Cheese Pizza and its developers are not affiliated with Piazza."), 
					React.createElement("p", {className: "info"}, "© ", new Date().getFullYear())
				)
			))
	}
});