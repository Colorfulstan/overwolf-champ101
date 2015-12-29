"use strict";
steal(
	'can'
	, 'Routes.js'
	, 'analytics.js'
	, function (can
		, /**Routes*/ Routes
		, analytics) {

		/**
		 * Controls the tooltip-container
		 * To show a tooltip use can.route.attr()
		 * with respective route, name and y attributes
		 *
		 * @class
		 * @constructor {@link TooltipCtrl.init}
		 * @example
		 * <b>Champion Tooltip:</b>
		 * <pre>
		 * can.route.attr({
			route: 'tooltip/champ/:name',
			name: $el.attr('title'),
			y: $el.offset().y + $el.height()
		});
		 *
		 *can.route.attr({
			route: 'tooltip/champ/:name',
			name: null
		});</pre>
		 * <b>Spell Tooltip:</b>
		 * <pre>
		 * can.route.attr({
 			route: 'tooltip/spell/:champ/:index',
 			name: $el.attr('title'),
 			y: $el.offset().y + $el.height()
 	});</pre>
		 *
		 */
		var TooltipCtrl = can.Control.extend('TooltipCtrl',
			/**
			 * @lends {TooltipCtrl}
			 */
			{
				defaults: {
					spellTmpl: 'templates/tooltip/spell.mustache',
					championTmpl: 'templates/tooltip/champ.mustache',
					championSummaryTmpl: 'templates/tooltip/champ-summary.mustache',
					videoTmpl: 'templates/parts/video.mustache',

					// handled Routes
					tooltipChampionRoute: Routes.tooltipChampion,
					tooltipHideRoute: Routes.tooltipHide,
					tooltipSpellRoute: Routes.tooltipSpell
				},

				/**
				 * TODO: is this the right place for this?
				 * @param string
				 * @param effect
				 * @param vars
				 * @param champId to whom this ability belongs
				 * @param name of the ability
				 * @return {Array} [0] = tooltip with values, [1] = object with placeholders as keys and inserted Strings as values <br>
				 *     keys were not correctly replacable and given values (if present) were used instead as a "best guess" for what data-point would be appropriate.
				 */
				tooltipValued: function (string, effect, vars, champId, name) {
					var ttNew = string;
					var pattern;

					var missingPlaceHolders = {};
					var allPlaceHolders = ttNew.match(/{{ (\w\d) }}/g);

					var uniquePlaceHolders = (allPlaceHolders) ? allPlaceHolders.filter(function (itm, i, a) {
						return i == a.indexOf(itm);
					}) : [];
					allPlaceHolders = null;

					/**
					 * builds a string from an array - x / y / z / ... / or a single value if all values are the same.
					 * @param valuesArr
					 * @return {string}
					 */
					function buildValueString(valuesArr) {
						var max = valuesArr.length - 1;
						var allTheSame = (valuesArr[0] == valuesArr[max]);
						var k = 0;
						if (allTheSame) k = max; // don't include doubling values
						var string = "";
						for (k; k <= max; k++) {
							string += valuesArr[k] + ' / ';
						}
						string = string.substring(0, string.length - 2);
						return string;
					}

					/* vars (represent scaling-values)
					 * {{ aX }} are always within the vars Array.
					 * sometimes {{ fX }} are found there too, sometimes {{ fX }} refers to the effects / effectsBurn Array
					 * so we first check the certain keys within vars and replace them.
					 * After that, we replace the {{ eX }} variables since those are unambiguosly within the effects / effectsBurn Array.
					 * If after that still {{ fX }} remain, they will be replaced through the effects / effectsBurn Array.
					 */
					if (vars) {
						for (var j = 0; j < vars.length; j++) {
							var valueString = "";
							var link = vars[j].link;
							if (vars[j].coeff) {
								valueString = buildValueString(vars[j].coeff);
							}
							if (link == "@ignore") {
								valueString = "";
								link = ""
							} // Value has no Meaning but might still be included!

							pattern = new RegExp('{{ ' + vars[j].key + ' }}', 'g');
							ttNew = ttNew.replace(pattern, '<span class="scaling-values">' + valueString + link + '</span>');

							if (ttNew.indexOf(pattern.source) >= 0) {
								missingPlaceHolders[pattern.source] = "null";
								debugger;
							}
							var indexVar = uniquePlaceHolders.indexOf(pattern.source);
							if (indexVar >= 0) uniquePlaceHolders.splice(indexVar, 1);
						}
					}

					// effects
					if (effect) {
						for (var i = 1; i < effect.length; i++) {
							// {{ eX }} always referring to the effect / effectBurn Array
							pattern = new RegExp('{{ e' + i + ' }}', 'g');

							var effectValues = effect[i];
							if (effectValues == null) { continue }
							var effectString = buildValueString(effectValues);
							ttNew = ttNew.replace(pattern, '<span class="effect-e-values">' + effectString + '</span>');

							if (ttNew.indexOf(pattern.source) >= 0) {
								missingPlaceHolders[pattern.source] = "null";
								debugger;
							}
							var indexEX = uniquePlaceHolders.indexOf(pattern.source);
							if (indexEX >= 0) uniquePlaceHolders.splice(indexEX, 1);

							// {{ fX }} was not found within the vars array, the achording index within effects / effectsburn will be used.
							// sometimes this is used instead of {{ eX }} (eg Sona)
							pattern = new RegExp('{{ f' + i + ' }}', 'g');

							if (ttNew.indexOf(pattern.source) >= 0) {
								missingPlaceHolders[pattern.source] = effectString;
								debugger;
							}

							ttNew = ttNew.replace(pattern, '<span class="effect-f-values">' + effectString + '</span>');

							var indexFX = uniquePlaceHolders.indexOf(pattern.source);
							if (indexFX >= 0) uniquePlaceHolders.splice(indexFX, 1);

						}
					}

					for (var i = 0; i < uniquePlaceHolders.length; i++) {
						missingPlaceHolders[uniquePlaceHolders[i]] = "null";
					}

					uniquePlaceHolders = Object.keys(missingPlaceHolders);

					var placeHolderValues = uniquePlaceHolders.map(function (key) {
						return missingPlaceHolders[key];
					});

					if (uniquePlaceHolders.length > 0) {
						debugger;
						analytics.c101_exceptionTooltip(champId, name, uniquePlaceHolders, placeHolderValues);
					}
					debugger;

					uniquePlaceHolders = null;
					placeHolderValues = null;
					missingPlaceHolders = null;
					return ttNew;
				}
				,
				/**
				 * Replaces the placeholder within the ressource-string of a spell with the acchording
				 * value and returns the new String
				 * @param string e.g. { x } Mana
				 * @param effectArr Array with the effect-values for the champ as given from Rriot API
				 * @param costBurn The costburn for the spell
				 * @param [varsArr]
				 */
				ressourceValued: function (string, effectBurnArr, costBurn, varsArr, champId, name) {
					var pattern;
					var newString = string;

					pattern = new RegExp('{{ e(.) }}', 'g');
					newString = newString.replace(pattern, function (a, b) {
						var i = parseInt(b);
						return effectBurnArr[i];
					});

					pattern = new RegExp('{{ a(.) }}', 'g');
					newString = newString.replace(pattern, function (a, b) {
						var i = parseInt(b);
						return varsArr[i];
					});

					pattern = new RegExp('{{ cost }}', 'g');
					newString = newString.replace(pattern, costBurn);
					if (newString.indexOf('@') >= 0 || newString.indexOf('.' >= 0)){
						analytics.c101_exceptionTooltip(champId, name, 'null', [costBurn, varsArr, effectBurnArr]);
					}
					return newString;
				}
			}, {
				/**
				 *
				 * @constructs TooltipCtrl
				 * @param element
				 * @param options
				 * @param {MatchModel } options.match
				 * @param {* } options.videoPlayer will be set later
				 */
				init: function (element, options) {
					/** The videojs instance to load videos in */
					options.videoPlayer = null;
				},


				hideTooltip: function () {

					this.element.children().remove();

					if (this.options.videoPlayer) {
						this.options.videoPlayer.dispose();
						this.options.videoPlayer = null;
					}
					this.element.hide();
				},
				///**
				// * Renders the given template within this.element.
				// * If the given Model contains a viewFragment, that will be used.
				// * Otherwise the rendered view will be stored as viewFragment
				// * @param template
				// * @param data
				// * @param [data.viewFragment] the prerendered DocumentFragment for this tooltip
				// */
				//renderAndStoreView: function (template, model) {
				//	var view = model.attr('viewFragment');
				//	if (!view) {
				//		view = can.view(template, model);
				//		model.attr('viewFragment', view);
				//	}
				//	this.element.html(view);
				//},
				/**
				 * shows a Tooltip
				 * @param type {String} - 'spell' || 'champ'
				 * @param routeData {Object}
				 * @param routeData.champ {String}
				 * @param [routeData.index] {number} index of the spell within the spell array of a given champ
				 * @param [routeData.type] {String} indicator for spell-type. Can be 'ability' || 'summoner'
				 * @param routeData.y {number} - The y position from top of the screen for the tooltip
				 */
				showTooltip: function (type, routeData) {

					switch (type) {
						case 'spell':
							var spell;
							if (routeData.type == 'ability') {
								spell = this.options.match.participantsByChamp[routeData.champ].champ.spells[routeData.index];
							}
							if (routeData.type == 'passive') {
								spell = this.options.match.participantsByChamp[routeData.champ].champ.passive;
							}
							if (routeData.type == 'summoner') {
								spell = this.options.match.participantsByChamp[routeData.champ].summonerSpells[routeData.index];
							}
							this.element.html(can.view(this.options.spellTmpl, spell));
							this.initVideo(spell);
							break;
						case 'champ':
							var removedSpells = [];
							var champ = this.options.match.participantsByChamp[routeData.champ].champ;
							var champTooltipView;
							if (routeData.overview) {
								// NOTE: since elise and nidalee have 7 skills and they are not combined to 4 data-objects
								// a workaround has to do that (for now just dismiss the skills after the fourth (ult)
								// to not break the summary table
								if (champ.name === 'Elise' || champ.name === 'Nidalee') { // TODO: look for better solution (in Backend)
									removedSpells = champ.spells.splice(4); // passive + qwer = 5 skills
									// TODO: for now spells after ult just disappear
								}
								champTooltipView = can.view(this.options.championSummaryTmpl, champ);
							} else {
								champTooltipView = can.view(this.options.championTmpl, champ);
							}
							this.element.html(champTooltipView);
							break;
					}
					this.element.css('top', routeData.y + 'px');
					if (typeof routeData.x !== 'undefined') {
						this.element.css('left', routeData.x + 'px');
					}

					// set the colors given through classes like 'colorFFFFFF' and remove the class (within spans)
					this.element.find('span').each(function (index, item) {
						var cssClass = this.className;
						if (cssClass && cssClass.indexOf('color') == 0) {
							this.style.color = '#' + cssClass.substr(5);
							$(this).removeClass(cssClass);
						}
					});

					this.element.show();
				},
				initVideo: function (spell) {
					var self = this;
					if (spell.videoAvailable()) {

						$('#spell-video-container').prepend(
							can.view(this.options.videoTmpl, spell)
						);

						var videoTag = $('video').get(0);

						//$(videoTag).on('ready', function () {
						videojs(videoTag, {controls: false, controlBar: {fullscreenToggle: false}}, function () {
							// sets up the videojs Player to work after it got inserted into the page by templatingFullscreenToggle
							var player = this;
							self.options.videoPlayer = this;
							player.on('ended', function () {
								player.play();
							});
							player.on('error', function (event) {
								// TODO: maybe better error handling!?
								steal.dev.log('Video got an Error', event, 'networkstate:', player.networkState);
								$('#videoPlayer').remove();
								$('.video--not-available').css('display', 'block');

								var fields = {};
								fields[analytics.CUSTOM_DIMENSIONS.DATA] = 'ability: ' + spell;
								analytics.exception('Video is not available', false, fields);
							});
						});
					}
				},
				playPauseVideo: function (startPlaying) {
					var self = this;
					var player = self.options.videoPlayer;
					if (startPlaying == 1) {
						steal.dev.log('starting video');
						player.addClass('vjs-fluid');
						player.play();
					} else {
						steal.dev.log('pausing video');
						player.pause();
						player.removeClass('vjs-fluid');
					}
				},
				// Routing Handlers
				'{tooltipChampionRoute} route': function (routeData) {
					//steal.dev.log('tooltip route for champ triggered', routeData);
					if (routeData.champ) {
						this.showTooltip('champ', routeData);
					} else { this.hideTooltip(); }
				}
				,
				'{tooltipHideRoute} route': function () {
					this.hideTooltip();
				}
				,
				'{tooltipSpellRoute} route': function (routeData) {
					steal.dev.log('tooltip route for spell triggered in TooltipCtrl', routeData);
					if (routeData.champ !== null && routeData.index !== null) {
						this.showTooltip('spell', routeData);
						if (typeof routeData.video !== 'undefined') {
							this.playPauseVideo(routeData.video);
						}
					} else { this.hideTooltip(); }
				}
			})
			;

		return TooltipCtrl;
	}
)
;