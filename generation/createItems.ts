import { vars, imgPath, writeToFile, hexStr } from './utils.ts';

class Stage {
	name: string;
	img: string;
	codes: string[];
	imgPath: string;

	constructor(name: string, img: string, codes: string[], imgPath: string = "items") {
		this.name = name;
		this.img = img;
		this.codes = codes;
		this.imgPath = imgPath;
	}
}

function generic(id: number, name: string, type: string, mapCode: string, img: string, codes: string[]) {
	return {
		id,
		name,
		type,
		mapCode,
		img: imgPath("items", img),
		codes: codes.join(", ")
	}
}
function progressive(id: number, name: string, mapCode: string, stageData: Stage[], loop: boolean = false, allow_disabled: boolean = true, inherit_codes: boolean = true) {
	let item = {
		id,
		name,
		mapCode,
		type: "progressive",
		allow_disabled: allow_disabled ? undefined : allow_disabled,
		loop: loop ? loop : undefined,
		stages: [] as any[]
	}
	for (let stage of stageData) {
		let data = {
			name: stage.name,
			img: imgPath(stage.imgPath, stage.img),
			codes: stage.codes.join(", "),
			inherit_codes: inherit_codes ? undefined : inherit_codes
		}
		if (!inherit_codes) {
			data.codes = `${mapCode}, ${data.codes}`
		}
		item.stages.push(data)
	}
	return item;
}
function consumable(id: number, name: string, mapCode: string, max_quantity: number, codes: string[]) {
	return {
		id,
		name,
		type: "consumable",
		mapCode,
		img: imgPath("items", codes[0]),
		max_quantity,
		codes: codes.join(", ")
	}
}

const itemData = [
	consumable(0x2C, "Tiny Medal", vars.Items.TinyMedal, 0, [vars.Items.TinyMedal]),

	generic(0x30, "Water Call", "toggle", vars.Items.WaterCall, vars.Items.WaterCall, [vars.Items.WaterCall]),
	generic(0x31, "Moon Rock", "toggle", vars.Items.MoonRock, vars.Items.MoonRock, [vars.Items.MoonRock]),
	generic(0x32, "Crest", "toggle", vars.Items.Crest, vars.Items.Crest, [vars.Items.Crest]),
	generic(0x33, "Yuna Soul", "toggle", vars.Items.YunaSoul, vars.Items.YunaSoul, [vars.Items.YunaSoul]),
	generic(0x34, "Sleep Herb", "toggle", vars.Items.SleepHerb, vars.Items.SleepHerb, [vars.Items.SleepHerb]),
	generic(0x35, "Change Staff", "toggle", vars.Items.ChangeStaff, vars.Items.ChangeStaff, [vars.Items.ChangeStaff]),
	generic(0x36, "Tidal Bell", "toggle", vars.Items.TidalBell, vars.Items.TidalBell, [vars.Items.TidalBell]),
	generic(0x37, "Har Mirror", "toggle", vars.Items.HarMirror, vars.Items.HarMirror, [vars.Items.HarMirror]),
	generic(0x38, "Sky Shield", "toggle", vars.Items.SkyShield, vars.Items.SkyShield, [vars.Items.SkyShield]),

	generic(0x82, "Oasis Key", "static", vars.Items.OasisKey, vars.Items.OasisKey, [vars.Items.OasisKey]),
	generic(0x83, "Pirate Key", "toggle", vars.Items.PirateKey, vars.Items.PirateKey, [vars.Items.PirateKey]),
	generic(0x84, "Ice Key", "toggle", vars.Items.IceKey, vars.Items.IceKey, [vars.Items.IceKey]),
	generic(0x85, "Sky Key", "toggle", vars.Items.SkyKey, vars.Items.SkyKey, [vars.Items.SkyKey]),
	generic(0x86, "Limbo Key", "toggle", vars.Items.LimboKey, vars.Items.LimboKey, [vars.Items.LimboKey]),
]

const settingsData = [
	progressive(-1, "Game Version", vars.Settings.GameVersion, [
		new Stage("Cobi's Journey", vars.Settings.VersionCobi, [vars.Settings.VersionCobi], "settings"),
		new Stage("Tara's Adventure", vars.Settings.VersionTara, [vars.Settings.VersionTara], "settings")
	], true, false, false),
	progressive(-1, "Character", vars.Settings.Character, [
		new Stage("Cobi", vars.Settings.PlayerCobi, [vars.Settings.PlayerCobi], "settings"),
		new Stage("Tara", vars.Settings.PlayerTara, [vars.Settings.PlayerTara], "settings")
	], true, false, false),
	progressive(-1, "Goal", vars.Settings.GoalSetting, [
		new Stage("Cobi", vars.Settings.GoalDarck, [vars.Settings.GoalDarck], "settings"),
	], true, false, false),
]

export default function createItems() {
	itemData.sort((a, b) => a.id - b.id)
	let output = "ITEM_MAPPING = {\n"
	for (let item of itemData) {
		output += `\t[${hexStr(item.id)}] = {"${item.mapCode}", "${item.type}"},\n`
	}
	output += "}"
	writeToFile("items/items.jsonc", JSON.stringify(itemData, (k, v) => k == "id" || k == "mapCode" ? undefined : v, '\t'))
	writeToFile("scripts/autotracking/item_mapping.lua", output)
	writeToFile("items/pack_settings.jsonc", JSON.stringify(settingsData, (k, v) => k == "id" || k == "mapCode" ? undefined : v, '\t'))
}

// @ts-ignore
if (import.meta.main) {
	createItems()
}