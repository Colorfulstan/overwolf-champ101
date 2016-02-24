"use strict";
import can from 'can';
import Routes from 'Routes';
import analytics from 'analytics';

/**
 * @see OverviewCtrl.init
 */
var OverviewCtrl = can.Control.extend('OverviewCtrl', {
	defaults: {
		overviewTmpl: 'templates/match-overview.mustache'
	}
}, {
	/**
	 *
	 * @param el
	 * @param {MatchModel} options.match
	 */
	init: function (el, options) {
		this.renderView(options.match.team_100, options.match.team_200);
	},
	renderView: function (team100, team200) {
		steal.dev.log("rendering view for OverviewCtrl");

		team100 = correctSpritePosition(team100);
		team200 = correctSpritePosition(team200);

		this.element.html(
			can.view(this.options.overviewTmpl, {
				blue: team100, // TODO: change here too to 100/200 ?
				red: team200
			})
		);


		// NOTE: correction for black "border" when using sprite in match overview
		function correctSpritePosition(teamArray) {
			for (var i = 0; i < teamArray.length; i++) {
				var image = teamArray[i].champ.image;
				image.x += 2;
				image.y += 2;
			}
			return teamArray;
		}
	},
	'.portrait mouseenter': function ($el, ev) {
		//steal.dev.log('.portrait mouseenter');
		var $panel = $el.closest('.panel');
		var name = $el.attr('title');
		Routes.setRouteData({
			route: Routes.tooltipChampion,
			champ: name,
			overview: true,
			y: $panel.offset().top + $panel.height(),
			x: $panel.offset().left
		}, true);
		analytics.screenview('Champ-Summary-' + name);
	},
	'.portrait mouseout': function ($el, ev) {
		//steal.dev.log('.portrait mouseout');
		Routes.setRoute(Routes.tooltipHide);
	},
	'.portrait click': function ($el, ev) {
		//steal.dev.log('.portrait click');
		Routes.setRouteData({route: Routes.panelChampion, champ: $el.attr('title')});
		$el.removeClass('addable');
		analytics.screenview('Champ-Panel-' + $el.attr('title'));
	},
	'.show-team.team_100 click': function ($el, ev) {
		Routes.setRouteData({team: 'team_100', route: Routes.panelTeam});
		ev.stopPropagation();
		$('.team.blue').find('.portrait').removeClass('addable');
		$('.show-team.blue').removeClass('addable');
		analytics.screenview('Champ-Panel-Team-blue');
	},
	'.show-team.team_200 click': function ($el, ev) {
		Routes.setRouteData({team: 'team_200', route: Routes.panelTeam});
		ev.stopPropagation();
		$('.show-team.red').removeClass('addable');
		$('.team.red').find('.portrait').removeClass('addable');
		analytics.screenview('Champ-Panel-Team-red');
	}
});
export default OverviewCtrl;
