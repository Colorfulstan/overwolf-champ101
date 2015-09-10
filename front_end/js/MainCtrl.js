"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');
var SettingsModel = require('SettingsModel');

/**
 * An Object containing the "Main" view. (main.html / main.js)
 * Represents the Main crossing point for the components of the app
 * as it initiates and manages the controllers.
 * @inheritDoc WindowCtrl
 */
var MainCtrl = WindowCtrl.extend({
	defaults: {
		name: 'Main'
		, matchBtn: '.btn-match'
		, hideHomeCB: '#hideHome'
		, settingsTmpl: '#settings-tmpl'
	},
	gameStarted: function (result) {
		return result.gameInfo !== null &&
			result.gameInfo.title == "League of Legends" &&
			result.gameChanged;
		// gamechanged indiziert das Game gestartet wurde
	},
	gameFinished: function (result) {
		return result.gameInfo !== null &&
			result.gameInfo.title == "League of Legends" &&
			result.runningChanged;
		// runningchanged indiziert, dass Game beendet wurde
	}
}, { // Instance
	init: function () {
		WindowCtrl.prototype.init.apply(this, arguments);

		debugger;
		this.element.find('#content').append(
			can.view(this.options.settingsTmpl, new SettingsModel())
		);

		steal.dev.log('MainCtrl initialized :', this);
	}
	, start: function (isSummonerSet) {
		var self = this;
		$.when(this.constructor.open('Main')).then(function (ow_window) {
			self.ow_window = ow_window;
		});

		if (!isSummonerSet) {
			this.constructor.openSettings();
		}
	},
	'{matchBtn} mousedown': function (el, ev) {
		steal.dev.log('WindowCtrl: open match');
		this.constructor.openMatch();
	}
});
module.exports = MainCtrl;