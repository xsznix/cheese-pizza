/** @jsx React.DOM */
'use strict';

var Code = React.createClass({
	displayName: 'Code',
	propTypes: {
		data: React.PropTypes.string.isRequired
	},

	highlight: function () {
		var node = this.refs.main.getDOMNode();
		window.setTimeout(function () {
			hljs.highlightBlock(node);	
		}, 0);
	},

	componentDidMount: function () {
		this.highlight();
	},
	componentDidUpdate: function () {
		this.highlight();
	},

	render: function () {
		return (
			<pre className="code" ref="main">
				{this.props.data}
			</pre>);
	}
});

var Content = React.createClass({
	displayName: 'Content',
	propTypes: {
		className: React.PropTypes.string,
		html: React.PropTypes.string.isRequired
	},

	attrsToReactAttrs: function (node) {
		var obj = {};

		// add target="_blank" to  links
		if (node.tagName === 'A')
			obj.target = '_blank';

		Array.prototype.slice.call(node.attributes).forEach(function (attr) {
			var key = attr.nodeName;

			if (key === 'class')
				key = 'className';
			else if (key === 'for')
				key = 'htmlFor';
			else if (key.substr(0, 2) === 'on') // delete event handlers
				return;
			else if (key === 'style') // crappily parse styles into object
				return obj.style = F.keyify(attr.value.split(';').map(function (sty) {
					var vals = sty.split(':');
					return {
						k: vals[0].trim(),
						v: vals[1].trim()
					}
				}), 'k', function (item) { return item.v; });

			obj[key] = attr.value;
		});

		return obj;
	},

	prepareTextNode: function (node) {
		// Math is rendered between double dollar signs, like this: $$a+b$$
		// If we split the text on '$$', then the math will be in every odd-
		// indexed split.
		var splits = node.nodeValue.split('$$');
		if (splits.length === 1)
			return splits[0];
		else
			return React.DOM.span({},
				node.nodeValue.split('$$').map(function (text, i) {
					if (i % 2) {
						return <TeX content={text} />
					} else {
						return text;
					}
				}));
	},
	prepareNode: function (node, i, arr, isTopLevel) {
		if (node.nodeType === 3) // text
			return this.prepareTextNode(node);
		else if (node.nodeType === 8) // comment
			return null;

		var tag = node.tagName.toLowerCase(), attrs, children;

		if (tag === 'pre') {
			return <Code data={node.innerText} />
		} else {
			attrs = this.attrsToReactAttrs(node);
			if (isTopLevel)
				attrs.key = (+new Date()) + "$" + i; // never reuse elements
			children = Array.prototype.slice.call(node.childNodes).map(this.prepareNode);
			return React.createElement(tag, attrs, children);
		}
	},
	makeContent: function () {
		var html = $.parseHTML(this.props.html);
		if (html.length === 1 && html[0].nodeType === 3 && !this.props.forceRich)
			return <pre className="plaintext">{this.prepareTextNode(html[0])}</pre>

		var output = [];
		for (var i = 0, len = html.length; i < len; i++) {
			output.push(this.prepareNode(html[i], i, html, true));
		}

		return output;
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		return nextProps.html !== this.props.html;
		// Don't check className. It should never change after mounting.
	},

	render: function () {
		return (
			<div className={this.props.className || ''} ref="main">
				{this.makeContent()}
			</div>);
	}
});