"use strict";
steal(
	'can'
	, 'Routes.js'
	, function (can
		, /**Routes*/ Routes) {

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
				spellTmpl: 'templates/tooltip-spell.mustache',
				championTmpl: 'templates/tooltip-champ.mustache',
				videoTmpl: 'templates/video.mustache',

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
			 * @return {*}
			 */
			tooltipValued: function (string, effect, vars) {
				var ttNew = string;
				var pattern;


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

				// TODO: include this explanation within collection-thread in riot dev forum
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

						// {{ fX }} was not found within the vars array, the achording index within effects / effectsburn will be used.
						// sometimes this is used instead of {{ eX }} (eg Sona)
						pattern = new RegExp('{{ f' + i + ' }}', 'g');
						ttNew = ttNew.replace(pattern, '<span class="effect-f-values">' + effectString + '</span>');
					}
				}

				return ttNew;
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
					delete this.options.videoPlayer;
				}
				this.element.hide();
			},
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
						var champ = this.options.match.participantsByChamp[routeData.champ].champ;
						this.element.html(can.view(this.options.championTmpl, champ));
						break;
				}
				this.element.css('top', routeData.y + 'px');
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

					$('#spell-video-container').html(
						can.view(this.options.videoTmpl, spell)
					);

					var videoTag = $('video').get(0);

					//$(videoTag).on('ready', function () {
					videojs(videoTag, {controlBar: {fullscreenToggle: false}}, function () {
						// sets up the videojs Player to work after it got inserted into the page by templatingFullscreenToggle
						var player = this;
						self.options.videoPlayer = this;
						//player.on('ended', function() {
						//	player.load();
						//});
						player.on('error', function (event) {
							// TODO: maybe better error handling!?
							steal.dev.log('Video got an Error', event, 'networkstate:', player.networkState);
							$('#videoPlayer').remove();
						});
					});
				}
			},
			// Routing Handlers
			'{tooltipChampionRoute} route': function (routeData) {
				//steal.dev.log('tooltip route for champ triggered', routeData);
				if (routeData.champ) {
					this.showTooltip('champ', routeData);
				} else { this.hideTooltip(); }
			},
			'{tooltipHideRoute} route': function () {
				this.hideTooltip();
			},
			'{tooltipSpellRoute} route': function (routeData) {
				//steal.dev.log('tooltip route for spell triggered', routeData);
				if (routeData.champ !== null && routeData.index !== null) {
					this.showTooltip('spell', routeData);
				} else { this.hideTooltip(); }
			}
		});

		return TooltipCtrl;
	});