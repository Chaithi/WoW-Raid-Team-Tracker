/* ******************************************************
 *            Raid Team Character Audit Tool			*
 * Modified from code written by /u/forgot_my__password *
 * Author: Robert Thayer - http://www.gamergadgets.net  *
 * Last updated 07/29/2016 for patch 7.0.3				*
 * Pulls character armory data and displays in Google  	*
 * Spreadsheets to allow for easy tracking of a raid 	*
 * team for progression through an expansion.			*
 ********************************************************/

var APIKEY = "";
// Generate an API key for your application at https://dev.battle.net/
 
function Character(name, realm) {
	this.name = name;
	this.realm = realm;
	//Check that name and realm are filled
	if(!name) {	return ""; }
    if(!realm) { return "";	}
	this.info = getInfoFromAPI(name, realm);
	if (this.info.guild.name) {
		this.guild = this.info.guild.name;
	} else {
		this.guild = "";
	}
	this.level = this.info.level;
	this.averageItemLevel = this.info.items.averageItemLevelEquipped;
	// Equipment item levels
	this.ilvlHead = getItemLevel(this.info.items.head);
	this.ilvlNeck = getItemLevel(this.info.items.neck);
	this.ilvlShoulder = getItemLevel(this.info.items.shoulder);
	this.ilvlBack = getItemLevel(this.info.items.back);
	this.ilvlChest = getItemLevel(this.info.items.chest);
	this.ilvlWrist = getItemLevel(this.info.items.wrist);
	this.ilvlHands = getItemLevel(this.info.items.hands);
	this.ilvlWaist = getItemLevel(this.info.items.waist);
	this.ilvlLegs = getItemLevel(this.info.items.legs);
	this.ilvlFeet = getItemLevel(this.info.items.feet);
	this.ilvlFinger1 = getItemLevel(this.info.items.finger1);
	this.ilvlFinger2 = getItemLevel(this.info.items.finger2);
	this.ilvlTrinket1 = getItemLevel(this.info.items.trinket1);
	this.ilvlTrinket2 = getItemLevel(this.info.items.trinket2);
	this.ilvlMainHand = getItemLevel(this.info.items.mainHand);
	this.ilvlOffHand = getItemLevel(this.info.items.offHand);
	// Check if item is tier
	this.headIsTier = tierCheck(this.info.items.head);
	this.shoulderIsTier = tierCheck(this.info.items.shoulder);
	this.backIsTier = tierCheck(this.info.items.back);
	this.chestIsTier = tierCheck(this.info.items.chest);
	this.handsIsTier = tierCheck(this.info.items.hands);
	this.legsIsTier = tierCheck(this.info.items.legs);
	// Count number of tier items
	this.tierCount = 0;
	if (this.headIsTier) { this.tierCount++; }
	if (this.shoulderIsTier) { this.tierCount++; }
	if (this.backIsTier) { this.tierCount++; }
	if (this.chestIsTier) { this.tierCount++; }
	if (this.handsIsTier) { this.tierCount++; }
	if (this.legsIsTier) { this.tierCount++; }
	
	// Check enchants
	this.neckEnchant = enchantCheck(this.info.items.neck);
	this.ring1Enchant = enchantCheck(this.info.items.finger1);
	this.ring2Enchant = enchantCheck(this.info.items.finger2);
	this.backEnchant = enchantCheck(this.info.items.back);
	
	// Progression Stats
	this.emeraldNightmareNormalKills = 0;
	this.emeraldNightmareHeroicKills = 0;
	this.emeraldNightmareMythicKills = 0;
	this.nightholdNormalKills = 0;
	this.nightholdHeroicKills = 0;
	this.nightholdMythicKills = 0;
	
	//Professions
	if (!this.info.professions.primary[0]) {
		this.primaryProfession = "None";
		this.primaryProfessionLevel = 0;
		this.secondPrimaryProfession = "None";
		this.secondPrimaryProfessionLevel = 0;
	} else {
		this.primaryProfession = this.info.professions.primary[0].name;
		this.primaryProfessionLevel = this.info.professions.primary[0].rank;
	} 
	if (!this.info.professions.primary[1]) {
		this.secondPrimaryProfession = "None";
		this.secondPrimaryProfessionLevel = 0;
	} else {
		this.secondPrimaryProfession = this.info.professions.primary[1].name;
		this.secondPrimaryProfessionLevel = this.info.professions.primary[1].rank;
	}
	
	this.progressionCheck = function() {
		// Emerald Nightmare
		for (i= 0; i < 7; i++)
		{
			if(this.info.progression.raids[35].bosses[i].normalKills != 0)
			{
			  this.emeraldNightmareNormalKills+=this.info.progression.raids[35].bosses[i].normalKills;
			}
			if(this.info.progression.raids[35].bosses[i].heroicKills != 0)
			{
			  this.emeraldNightmareHeroicKills+=this.info.progression.raids[35].bosses[i].heroicKills;
			}
			if(this.info.progression.raids[35].bosses[i].mythicKills != 0)
			{
			  this.emeraldNightmareMythicKills+=this.info.progression.raids[35].bosses[i].mythicKills;
			}  
		}
		// Nighthold
		for (i= 0; i < 10; i++)
		{
			if(this.info.progression.raids[36].bosses[i].normalKills != 0)
			{
				this.nightholdNormalKills+=this.info.progression.raids[36].bosses[i].normalKills;
			}
			if(this.info.progression.raids[36].bosses[i].heroicKills != 0)
			{
				this.nightholdHeroicKills+=this.info.progression.raids[36].bosses[i].heroicKills;
			}
			if(this.info.progression.raids[36].bosses[i].mythicKills != 0)
			{
				this.nightholdMythicKills+=this.info.progression.raids[36].bosses[i].mythicKills;
			}  
		}
	}
    this.getCharacterInfo = [
		this.guild, this.level, this.primaryProfessionLevel, this.primaryProfession,
		this.secondPrimaryProfessionLevel, this.secondPrimaryProfession, this.averageItemLevel,
		this.ilvlHead, this.ilvlNeck, this.ilvlShoulder, this.ilvlBack, this.ilvlChest,
		this.ilvlWrist, this.ilvlHands, this.ilvlWaist, this.ilvlLegs, this.ilvlFeet,
		this.ilvlFinger1, this.ilvlFinger2, this.ilvlTrinket1, this.ilvlTrinket2,
		this.ilvlMainHand, this.ilvlOffHand, this.tierCount, this.headIsTier, this.shoulderIsTier,
		this.backIsTier, this.chestIsTier, this.handsIsTier, this.legsIsTier,
		this.neckEnchant, this.backEnchant, this.ring1Enchant, this.ring2Enchant,
		this.emeraldNightmareNormalKills, this.emeraldNightmareHeroicKills, this.emeraldNightmareMythicKills,
		this.nightholdNormalKills, this.nightholdHeroicKills, this.nightholdMythicKills
    ];
}
 
function getInfoFromAPI(name, realm) {
	var json,
		info;
		try {
			json = UrlFetchApp.fetch("https://us.api.battle.net/wow/character/"+realm+"/"+name+"?fields=items,statistics,progression,professions,guild&locale=en_US&apikey=" + APIKEY),
			info = JSON.parse(json.getContentText());
		} catch(e) {
			return e;
		}
	return info;
}

function getItemLevel(gear) {
	if (gear) {
		return gear.itemLevel;
	} else {
		return 0;
	}
}
	
// Checks if an item is part of the current tier.
// Tier 19
function tierCheck(item) {
	if (item.name.indexOf("of Enveloped Dissonance") > -1) { // Monk
		return true;
	} else if (item.name.indexOf("Doomblade") > -1) { // Rogue
		return true;
	} else if (item.name.indexOf("of the Astral Warden") > -1) { // Druid
		return true;
	} else if (item.name.indexOf("of Everburning Knowledge") > -1) { // Mage
		return true;
	} else if (item.name.indexOf("Dreadwyrm") > -1) { // Death Knight
		return true;
	} else if (item.name.indexOf("of the Obsidian Aspect") > -1) { // Warrior
		return true;
	} else if (item.name.indexOf("Eagletalon") > -1) { // Hunter
		return true;
	} else if (item.name.indexOf("of Bound Elements") > -1) { // Shaman
		return true;
	} else if (item.name.indexOf("of the Highlord") > -1) { // Paladin
		return true;
	} else if (item.name.indexOf("of Azj'Aqir") > -1) { // Warlock
		return true;
	} else if (item.name.indexOf("of Second Sight") > -1) { // Demon Hunter
		return true;
	} else if (item.name.indexOf("Purifier's") > -1) { // Priest
		return true;
	} else {
		return false;
	}
}

function enchantCheck(item) {
	var binding = [5435, 5436, 5434, 5427, 5428, 5429, 5430], // Binding of X enchants
		word = [5432, 5433, 5431, 5423, 5424, 5425, 5426], // Word of X enchants
		mark = [5891, 5437, 5438, 5889, 5439, 5890]; // Mark of X enchants
	if (!item.tooltipParams) {
		return "None";
	}
	if (mark.indexOf(item.tooltipParams["enchant"]) > -1) {
		return "Mark";
	} else {
		return "None";
	}
	if (binding.indexOf(item.tooltipParams["enchant"]) > -1) {
		return "Binding";
	} else if (word.indexOf(item.tooltipParams["enchant"]) > -1) {
		return "Word";
	} else {
		return "None";
	}
}
 
function pull(name, realm) {
	var char = new Character(name, realm);
	return char.getCharacterInfo;
}
