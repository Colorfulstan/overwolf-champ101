function Matchloader(_summonerId, _server) {

    this.loadMatch = function ($champsDiv, $blueSideDiv, $purpleSideDiv) {
        var self = this;
        var $div;

        $champsDiv.addClass('loading');

        jQuery.get(RIOT_ADAPTER_URL
            , {summonerId: _summonerId, server: _server}
            , function (data) {
                if (Settings.isDebugging()) console.log("gameData:", data);

                Matchloader.data = data;
                self.loadChampPortraits($blueSideDiv, data.blue, 'blue');
                self.loadChampPortraits($purpleSideDiv, data.purple, 'purple');
                if (Settings.isDebugging()) console.log('blue side: ', $blueSideDiv, 'purple side: ', $purpleSideDiv);

                Matchloader.loaded = true;
                $champsDiv.removeClass('loading');

            }).fail(function (data, status, jqXHR) {
                console.log(data);
                Error.matchNotFound(data.responseText);
                if (window.confirm("Do you want to check your settings?")) { // TODO: andere Lösung über anzeige im match div
                    WindowController.openSettings();
                }
                Matchloader.loaded = false;
            });
    };

    this.loadChampPortraits = function ($divContainer, data, team) {

        $divContainer.empty();
        // iterate over data
        for (var i = 0; i < data.length; i++) {
            // generate html for each champ found there
            var champ = data[i].champ;

            var $portraitImg = $('<img class="portrait" src="'+ DDRAGON_IMG_URL + 'champion/' + champ.image.full + '">');
            //var $portraitImg = $('<div class="portrait">');


            $portraitImg.attr('data-team-index', i);
            $portraitImg.attr('data-team', team);
            $portraitImg.attr('data-champ-name', champ.name);
            //$portraitImg.attr('data-tooltip-top', CHAMPIONS_PANEL_HEIGHT + 'px');

            //$portraitImg.css('background-image', 'url("' + 'http://ddragon.leagueoflegends.com/cdn/5.16.1/img/sprite/' + champ.image.sprite + '")');
            // TODO: cache sprites locally
            //$portraitImg.css('background-position', '-' + champ.image.x + 'px' + ' ' + '-' + champ.image.y + 'px');

            $portraitImg.hover(Utility.portraitMouseIn, Utility.hideTooltip);
            $portraitImg.click(Matchloader.portraitClick);

            $divContainer.append($portraitImg);
        }
    }
}

Matchloader.loaded = false;
Matchloader.data = {};

Matchloader.portraitClick = function () {
    if (Settings.isDebugging()) console.log('clicked: ', this);
    var $this = $(this);
    PanelManager.addChampion($this.attr('data-team'), $this.attr('data-team-index'));
};