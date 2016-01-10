"use strict";
import Settings from 'SettingsProvider';
import 'global';

var debug = false;

const TRACKER_ID = 'UA-71618029-2';
const appInstallerId = 'com.overwolf';
var appName, appVersion;
var isReady = $.Deferred();

function setAppOptionsFromManifest(manifest) {
	appName = manifest.meta.name;
	appVersion = manifest.meta.version;
}

function addScript(i, s, o, g, r, a, m) {
	var def = $.Deferred();
	i['GoogleAnalyticsObject'] = r;
	i[r] = i[r] || function () { (i[r].q = i[r].q || []).push(arguments) }, i[r].l = 1 * new Date();
	a = s.createElement(o), m = s.getElementsByTagName(o)[0];
	a.async = 1;
	a.src = g;
	m.parentNode.insertBefore(a, m);
	ga(function () { def.resolve(); });
	return def.promise();
}

function createTracker() {
	ga('create', TRACKER_ID, 'none');
	ga('set', 'appName', appName);
	ga('set', 'appVersion', appVersion);
	ga('set', 'appInstallerId', appInstallerId);
	ga('set', 'checkProtocolTask', function () { /* nothing */ });
	return $.Deferred().resolve().promise();
}

function setReady() {
	isReady.resolve(true);
	isReady = null;
}

export default {
	CUSTOM_DIMENSIONS: {
		HOTKEY: 'dimension1',
		CHAMP: 'dimension2',
		DATA: 'dimension3',
		DATA_PLACEHOLDERS: 'dimension4',
		LOL_PATCH: 'dimension5'
	},
	VALUES: {
		RANDOM_SUMMONER: 1,
		SPECIFIC_SUMMONER: 5
	},
	initRan: false,
	init: function () {
		if (typeof window.ga === 'undefined') {
			var src = (debug) ? 'http://www.google-analytics.com/analytics_debug.js' : 'http://www.google-analytics.com/analytics.js';
			addScript(window, document, 'script', src, 'ga');
		}
		Settings.getClassObj().getManifest()
			.done(setAppOptionsFromManifest)
			.then(createTracker)
			.then(setReady)
			.fail(function () {console.error('something went wrong with google analytics initialisation', arguments)});
		this.initRan = true;
	},
	/** can be used to check if analytics has been added to the html page yet */
	isReady: isReady.promise(),
	/** Runs a function when analytics finished loading.
	 * All calls to ga() should be delegated to this function to prevent undefined errors.
	 * @param cb the function to run when analytics is ready */
	runWhenReady: function (cb) {
		if (this.initRan === false) {throw new Error('analytics is not initialised. run .init() before sending data!')}
		$.when(this.isReady).then(cb);
	},

	/**
	 * Sends a hit. Use this for rare hitTypes or to test things.
	 * Otherwise you might want to use the convenience methods.
	 *
	 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
	 * @param {string} type 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'
	 * @param {object} fields additional fields
	 */
	hit: function (type, fields) {
		this.runWhenReady(function () {
			ga('send', type, fields);
		});
	},

	/** Send a screenview hit
	 * @param {string} screenName
	 * @param {object} [fields] additional fields to send with the screenview */
	screenview: function (screenName, fields) {
		if (typeof screenName !== 'string') { throw new Error('Mandatory parameter screenName has to be a string');}
		fields = fields || {};

		fields.screenName = screenName;
		this.runWhenReady(function () {
			ga('send', 'screenview', fields);
		})
	},
	/** Send an event hit.
	 * Can be called with 2,3 or 4 parameters. When called with 3 parameters,
	 * type of the 3rd parameter determines if its paramter "label" or "fields".
	 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#events
	 * @param {string} category
	 * @param {string} action
	 * @param {string} [label]
	 * @param {object} [fields] */
	event: function (category, action, label, fields) {
		fields = fields || {};

		if (typeof category !== 'string') {throw new Error('Mandatory parameter category has to be a string')}
		if (typeof action !== 'string') {throw new Error('Mandatory parameter action has to be a string')}
		if (label !== undefined) {
			if (typeof label === 'object') {
				fields = label;
			} else if (typeof label !== 'string') {
				throw new Error('Optional parameter label has to be a string');
			} else {
				fields.eventLabel = label;
			}
		}
		fields.eventCategory = category;
		fields.eventAction = action;

		this.runWhenReady(function () {
			ga('send', 'event', fields);
		})
	},

	/** Sends an exception
	 * @param {string} description
	 * @param {boolean} isFatal
	 * @param fields
	 */
	exception: function (description, isFatal, fields) {
		// TODO: make parameter optional

		fields = fields || {};
		fields.exDescription = description;
		fields.exFatal = isFatal;

		this.runWhenReady(function () {
			ga('send', 'exception', fields);
		});
	},
	/**
	 * Sends an exception hit for missing Tooltip-values within Riots static data
	 * @param champ
	 * @param ability
	 * @param dataSurrogates
	 * @param dataPlaceHolders
	 */
	c101_exceptionTooltip: function (champ, ability, dataPlaceHolders, dataSurrogates) {
		var fields = {};
		fields[this.CUSTOM_DIMENSIONS.CHAMP] = champ;
		fields[this.CUSTOM_DIMENSIONS.DATA] = dataSurrogates;
		fields[this.CUSTOM_DIMENSIONS.DATA_PLACEHOLDERS] = dataPlaceHolders;
		fields[this.CUSTOM_DIMENSIONS.LOL_PATCH] = LOL_PATCH;
		this.exception('Tooltip is missing data | ability: ' + ability, false, fields)
	}
};