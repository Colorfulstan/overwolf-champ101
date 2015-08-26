'use strict';
function PanelManager() { }


PanelManager.togglePanels = function () {
    $('#panel-container').slideToggle(ANIMATION_SLIDE_SPEED);
};

PanelManager.toggleParticipants = function () {
    $('#participants-container').slideToggle(ANIMATION_SLIDE_SPEED);
};

PanelManager.addChampion = function (team, index) {

    var participant = Matchloader.data[team][index];

    var $champSelect = $('<div class="champ-select col-xs-3">')
        .append(
        $('#match-participants').children().clone() // blue / purple team divs
            .removeClass('col-xs-6').addClass('col-xs-12')
            .each(function () {
            // this = team-container currently iterated
                var $champImgs = $(this).children();
                $champImgs.click(function () {
                // when clicked, the containing Panel should switch to that clicked champion

                // this = clicked image
                var $this = $(this);
                var $panel = $this.closest('.participant-panel');
                    // TODO: testen
                PanelManager.replaceChampion($panel, $this.attr('data-team'), $this.attr('data-team-index'));
            });
        })
    );

    var $participantsContainer = $('#participants-container');

    var $championPortrait = $($champSelect.find('[data-champ-name="'+ participant.champ.name +'"]')[0])
        .hover(Utility.portraitMouseIn, Utility.hideTooltip);
    var $summonerSpellsDiv = Utility.buildSummonerSpellsDiv(participant.summonerSpells, participant.champ.passive);
    var $championSpellsDiv = Utility.buildChampionSpellsDiv(participant.champ);
    var $panelControlDiv = Utility.buildPanelControlDiv;

    var $participantPanel = $('<div class="participant-panel panel">');

    $participantPanel
        .append($championPortrait)
        .append($summonerSpellsDiv)
        .append($championSpellsDiv)
        //.append($champSelect) // TODO: rework?
        .append($panelControlDiv)
        .appendTo($participantsContainer)
    ;

    var numOfPanels = $participantsContainer.children().length;

    //var tooltipTopPx = PARTICIPANTS_OFFSET_TOP + PARTICIPANT_PANEL_HEIGHT*numOfPanels;
    //$participantPanel.attr('data-tooltip-top', tooltipTopPx);
    if (numOfPanels == 2) {
        PanelManager.addCloseAllBtn();
    }



};

PanelManager.replaceChampion = function ($panel, team, index) {
    // replace everything within the panel besides the champ-select!?
    // TODO: maybe remove
    if (Settings.isDebugging()) console.log('PanelManager.replaceChampion called', $panel);
    // switch image from champ-select with portrait (but put old portrait into right team!)

    // replace summoners

    // replace spells
};



PanelManager.addCloseAllBtn = function(){
    var $closeAllBtn = $('<div id="close-all-btn" class="btn close table-cell">').click(PanelManager.closeAll);
    $('#participants-container').prepend($closeAllBtn);
};

PanelManager.removeCloseAllBtn = function(){
    $('#close-all-btn').remove();
};

PanelManager.closeAll = function(){
    $('#participants-container').children().remove();
};

PanelManager.closePanel = function ($participantPanel) {
    if ($participantPanel.siblings('.participant-panel').length < 2){
        PanelManager.removeCloseAllBtn();
    }
    $participantPanel.remove();
};

