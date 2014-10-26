/*
 * Created by xsznix on 20/10/14.
 */
'use strict';

chrome.app.runtime.onLaunched.addListener(function () {
	chrome.app.window.create('app/index.html', {
		bounds: {
			width: 1000,
			height: 600
		}
	});
});