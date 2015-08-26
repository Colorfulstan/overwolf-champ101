'use strict';
function Utility() {
}

Utility.buildChampTooltip = function (champData, offsetTop) {
    var $tooltipContainer = $('#tooltip-container').empty();
    $tooltipContainer.removeClass('hidden');


    var $allyTipsUl = $('<ul class="champ-ally-tips">');
    var allyTipsArr = champData.allytips;
    for (var i = 0; i < allyTipsArr.length; i++) {
        $allyTipsUl.append(
            $('<li>' + allyTipsArr[i] + '</li>')
        )
    }

    var $enemyTipsUl = $('<ul class="champ-enemy-tips">');
    var enemyTipsArr = champData.allytips;
    for (var i = 0; i < enemyTipsArr.length; i++) {
        $enemyTipsUl.append(
            $('<li>' + enemyTipsArr[i] + '</li>')
        )
    }

    $tooltipContainer.append(
        $('<h2 class="champ-name">').text(champData.name)
        , $('<h3 class="champ-title">').text(champData.title)
        , $('<h4>Ally Tips</h4>')
        , $allyTipsUl
        , $('<h4>Enemy Tips</h4>')
        , $enemyTipsUl
    );

    $tooltipContainer.css('top', offsetTop + 'px');
};
Utility.buildSpellTooltip = function (spellData, offsetTop) {
    var $tooltipContainer = $('#tooltip-container').empty();
    $tooltipContainer.removeClass('hidden');

    $tooltipContainer.append(
        $('<h2 class="spell-name">').text(spellData.name)
        , $('<p class="spell-description">').html(spellData.description)
    );

    $tooltipContainer.css('top', offsetTop + 'px');
};

Utility.buildSummonerSpellsDiv = function (summonerSpellsArray, passive) {
    var $summonerSpell1Img = $('<img class="summoner-spell" src="' + DDRAGON_IMG_URL + 'spell/' + summonerSpellsArray[0].image.full + '">')
        .attr('data-spell-index', 0)
        .hover(Utility.summonerSpellMouseIn, Utility.hideTooltip);

    var $summonerSpell2Img = $('<img class="summoner-spell" src="' + DDRAGON_IMG_URL + 'spell/' + summonerSpellsArray[1].image.full + '">')
        .attr('data-spell-index', 1)
        .hover(Utility.summonerSpellMouseIn, Utility.hideTooltip);

    var $passiveImg = $('<img class="passive" src="' + DDRAGON_IMG_URL + 'passive/' + passive.image.full + '">')
        .hover(Utility.passiveMouseIn, Utility.hideTooltip);

    return $('<div class="summoner-spells col-xs-1">')
        .append($summonerSpell1Img)
        .append($summonerSpell2Img)
        .append($passiveImg)
        ;
};

Utility.buildChampionSpellsDiv = function (champ) {
    var $div = $('<div class="champ-spells col-xs-5">');

    for (var i = 0; i < champ.spells.length; i++){
        $div.append(
            $('<img class="champion-spell" src="' + DDRAGON_IMG_URL + 'spell/' + champ.spells[i].image.full + '">')
                .attr('data-spell-index', i)
                .hover(Utility.spellMouseIn, Utility.hideTooltip)
        );
    }

    return $div;
};

Utility.buildPanelControlDiv = function () {
    var $closeBtn = $('<div class="panel btn close">X</div>')
        .click(function () {
            PanelManager.closePanel($(this).closest('.participant-panel'));
        });

    return $('<div class="panel-control col-xs-1">').append($closeBtn);
};

Utility.hideTooltip = function () {
    $('#tooltip-container').addClass('hidden');
};

Utility.portraitMouseIn = function () {

    var $this = $(this);
    var team = $this.attr('data-team');
    var champData = Matchloader.data[team][$this.attr('data-team-index')].champ;

    var $parentPanel = $this.closest('.panel');
    Utility.buildChampTooltip(champData, $parentPanel.offset().top+ $parentPanel.height());
};

Utility.summonerSpellMouseIn = function(){

    var $this = $(this);
    var $parentPanel = $this.closest('.panel');
    var $portrait = $parentPanel.find('.portrait'); // the portrait within the panel will contain the team / champ indizes
    var team = $portrait.attr('data-team');
    var teamData = Matchloader.data[team];
    var summonerData = teamData[$portrait.attr('data-team-index')];
    var spellData = summonerData.summonerSpells[$this.attr('data-spell-index')];

    Utility.buildSpellTooltip(spellData, $parentPanel.offset().top+ $parentPanel.height());
};

Utility.spellMouseIn = function(){

    var $this = $(this);
    var $parentPanel = $this.closest('.panel');
    var $portrait = $parentPanel.find('.portrait'); // the portrait within the panel will contain the team / champ indizes
    var team = $portrait.attr('data-team');
    var teamData = Matchloader.data[team];
    var summonerData = teamData[$portrait.attr('data-team-index')];
    var spellData = summonerData.champ.spells[$this.attr('data-spell-index')];

    Utility.buildSpellTooltip(spellData, $parentPanel.offset().top+ $parentPanel.height());
};

Utility.passiveMouseIn = function(){

    var $this = $(this);
    var $parentPanel = $this.closest('.panel');
    var $portrait = $parentPanel.find('.portrait'); // the portrait within the panel will contain the team / champ indizes
    var team = $portrait.attr('data-team');
    var spellData = Matchloader.data[team][$portrait.attr('data-team-index')].champ.passive;

    Utility.buildSpellTooltip(spellData, $parentPanel.offset().top+ $parentPanel.height());
};