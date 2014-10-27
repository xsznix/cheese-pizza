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
			errorDiv = <p id="error" className="info">{this.state.error}</p>;

		return (
			<div className="login-wrapper">
				<form className="login" onSubmit={this.handleLogin}>
					<h2>Welcome to Cheese Pizza!</h2>
					<p className="info">Please enter your Piazza credentials below.</p>
					{errorDiv}
					<input type="text" ref="email"
						value={this.state.email}
						onChange={this.handleEmailChange}
						placeholder="Email" />
					<input type="password" ref="password"
						value={this.state.password}
						onChange={this.handlePasswordChange}
						placeholder="Password" />
					<input type="submit" ref="submit" />
					<p className="info">Cheese Pizza and its developers are not affiliated with Piazza.</p>
					<p className="info">&copy; {new Date().getFullYear()}</p>
				</form>
			</div>)
	}
});