<?php
header("Access-Control-Allow-Origin: *");

include_once './vendor/autoload.php';
include_once './dataFiltering.php';

use LeagueWrap\Api;
$server = "";
if (isset($_REQUEST['server'])){
	$server = $_REQUEST['server'];
} else {
	$server = 'garena';
	// TODO: other regions that are not provided by RIOT Servers will count as 'garena' too (China / Korea)
}
include_once 'riot-api-key.php'; // own file with RIOT API key stored to $RIOT_API_KEY variable
$api = new Api($RIOT_API_KEY);            // Load up the API

// TODO: remove jp condition when implemented by RIOT (https://developer.riotgames.com/discussion/announcements/show/9iYdLpZZ)
if (strtolower($server) !== 'garena' && strtolower($server) !== 'jp'){
	$api->setRegion($server);
} else {
	$api->setRegion('na'); // TODO: This might lead to differences in data if garena servers are not up to date
}

$allChamps = $api->staticData()->getChampions(['allytips', 'enemytips', 'image', 'spells', 'passive'])
				 ->raw()['data'];

/** lower case without spaces */
$allChampsByName = array();
foreach ($allChamps as $champ){
	$allChampsByName[normalizeChampName($champ['name'])] = $champ;
}

$championNames = explode(',',$_REQUEST['championNames']);

/** same as we get it from front-end */
$champions = array();
foreach ($championNames as $name){
	$champions[$name] = $allChampsByName[normalizeChampName($name)];
}

// TODO: reactivate when caching is implemented get own endpoint for this
//include_once('championgg.php');
//$champions = gg_addDamageType($champions);
//$champions = gg_addStats($champions);
//$champions = gg_addItemsets($champions);
//$champions = gg_addSkillOrders($champions);
//if (isset($_REQUEST['ownChamp'])){
//	$ownChamp = normalizeChampName($_REQUEST['ownChamp']);
//	$champions = gg_addMatchupData($champions,$ownChamp);
//}

// TODO: dirty fix since monkeyking is wukong
if (isset($champions['MonkeyKing'])){
	$champions['Wukong'] = $champions['MonkeyKing'];
	unset($champions['MonkeyKing']);
}

$appData['champsByKey'] = $champions;
$appData['version'] = $api->staticData()->getRealm()->get('v');
$appData['server'] = $server;


header('Content-type: application/json');
echo json_encode($appData);

function normalizeChampName($name){
	$nameClean = $name;

	// strip out all non-alphanumeric characters + whitespace
	$nameClean = preg_replace('/[^A-Za-z0-9]/', '', $nameClean);
	// convert the string to all lowercase
	$nameClean = strtolower($nameClean);

	return $nameClean;
}