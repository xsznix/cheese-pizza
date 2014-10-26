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
			<form className="login" onsubmit={this.handleLogin}>
				<h2>Welcome to Cheese Pizza!</h2>
				<p className="sub">Please enter your Piazza credentials below.</p>
				<input type="text" ref="email"
					value={this.state.email}
					onchange={this.handleEmailChange} />
				<input type="password" ref="password"
					value={this.state.password}
					onchange={this.handlePasswordChange} />
				<input type="submit" ref="submit" />
			</form>)
	}
});