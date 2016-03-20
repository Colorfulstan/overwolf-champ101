<?php
header("Access-Control-Allow-Origin: *");

include_once './vendor/autoload.php';
include_once './dataFiltering.php';

use LeagueWrap\Api;
$platformID = "";
if (isset($_REQUEST['server'])){
	$platformID = $_REQUEST['server'];
} else {
	$platformID = 'garena';
	// TODO: other regions that are not provided by RIOT Servers will count as 'garena' too (China / Korea)
}
include_once 'riot-api-key.php'; // own file with RIOT API key stored to $RIOT_API_KEY variable
$api = new Api($RIOT_API_KEY);            // Load up the API



// TODO: remove jp condition when implemented by RIOT (https://developer.riotgames.com/discussion/announcements/show/9iYdLpZZ)
if (strtolower($platformID) !== 'garena' && strtolower($platformID) !== 'jp'){
	$api->setRegion(mapPlatformIDToRegion($platformID));
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
$appData['server'] = $platformID; // TODO: rename achordingly when next patch in development


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

function mapPlatformIDToRegion($platformID){
	$region = $platformID;
	switch (strtolower($platformID)){
		case 'br1':
			$region = 'BR';
			break;
		case 'eun1':
			$region = 'EUNE';
			break;
		case 'euw1':
			$region = 'EUW';
			break;
		case 'la1':
			$region = 'LAN';
			break;
		case 'la2':
			$region = 'LAS';
			break;
		case 'na1':
			$region = 'NA';
			break;
		case 'oc1':
			$region = 'OCE';
			break;
		case 'tr1':
			$region = 'TR';
			break;
		case 'pbe1':
			$region = 'PBE';
			break;
	}
	return $region;
}