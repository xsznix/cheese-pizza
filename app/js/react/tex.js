/** @jsx React.DOM */
'use strict';

// Adapted from https://github.com/Khan/react-components/blob/9984740ada44d6485a61496b7dd1cde5d367e64a/js/tex.jsx

/**
 * For math rendered using KaTex and/or MathJax. Use me like <TeX>2x + 3</TeX>.
 */

(function () {
	var pendingScripts = [];
	var needsProcess = false;
	var timeout = null;

	function process(script, callback) {
		pendingScripts.push(script);
		if (!needsProcess) {
			needsProcess = true;
			timeout = setTimeout(doProcess, 0, callback);
		}
	}

	function doProcess(callback) {
		MathJax.Hub.Queue(function() {
			var oldElementScripts = MathJax.Hub.elementScripts;
			MathJax.Hub.elementScripts = function(element) {
				var scripts = pendingScripts;
				pendingScripts = [];
				needsProcess = false;
				return scripts;
			};

			try {
				return MathJax.Hub.Process(null, callback);
			} catch (e) {
				// IE8 requires `catch` in order to use `finally`
				throw e;
			} finally {
				MathJax.Hub.elementScripts = oldElementScripts;
			}
		});
	}

	window.TeX = React.createClass({displayName: 'TeX',
		getDefaultProps: function() {
			return {
				// Called after math is rendered or re-rendered
				onRender: function() {},
				onClick: null
			};
		},

		render: function() {
			return React.createElement("span", {
					style: this.props.style, 
					onClick: this.props.onClick}, 
				React.createElement("span", {ref: "mathjax"})
			); // <span ref="katex" />
		},

		componentDidMount: function() {
			var text = this.props.content;
			var onRender = this.props.onRender;

			// try {
			// 	var katexHolder = this.refs.katex.getDOMNode();
			// 	katex.render(text, katexHolder);
			// 	onRender();
			// 	return;
			// } catch (e) {
			// 	/* jshint -W103 */
			// 	if (e.__proto__ !== katex.ParseError.prototype) {
			// 	/* jshint +W103 */
			// 		throw e;
			// 	}
			// }

			this.setScriptText(text);
			process(this.script, onRender);
		},

		componentDidUpdate: function(prevProps, prevState) {
			var oldText = prevProps.children;
			var newText = this.props.children;
			var onRender = this.props.onRender;

			if (oldText !== newText) {
				// try {
				// 	var katexHolder = this.refs.katex.getDOMNode();
				// 	katex.render(newText, katexHolder);
				// 	if (this.script) {
				// 		var jax = MathJax.Hub.getJaxFor(this.script);
				// 		if (jax) {
				// 			jax.Remove();
				// 		}
				// 	}
				// 	onRender();
				// 	return;
				// } catch (e) {
				// 	/* jshint -W103 */
				// 	if (e.__proto__ !== katex.ParseError.prototype) {
				// 	/* jshint +W103 */
				// 		throw e;
				// 	}
				// }

				// $(this.refs.katex.getDOMNode()).empty();

				if (this.script) {
					var component = this;
					MathJax.Hub.Queue(function() {
						var jax = MathJax.Hub.getJaxFor(component.script);
						if (jax) {
							return jax.Text(newText, onRender);
						} else {
							component.setScriptText(newText);
							process(component.script, onRender);
						}
					});
				} else {
					this.setScriptText(newText);
					process(this.script, onRender);
				}
			}
		},

		setScriptText: function(text) {
			if (!this.script) {
				this.script = document.createElement("script");
				this.script.type = "math/tex";
				this.refs.mathjax.getDOMNode().appendChild(this.script);
			}
			if ("text" in this.script) {
				// IE8, etc
				this.script.text = text;
			} else {
				this.script.textContent = text;
			}
		},

		componentWillUnmount: function() {
			if (this.script) {
				var jax = MathJax.Hub.getJaxFor(this.script);
				if (jax) {
					jax.Remove();
				}
			}
		}
	});
})();
