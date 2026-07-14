// @ts-ignore
import fs from 'fs'

export function imgPath(base: string, name: string) {
	return `images/${base}/${name}.png`
}

export function writeToFile(file: string, content: string) {
	fs.writeFile(file, content, (err: any) => {
		if (err) {
			console.error(`Error writing to file ${file}: ${err}`)
			return
		}
		console.log(`Successfully wrote to file ${file}`)
	})
}
export function readFromFile(file: string, callback: {(data: any): void}) {
	fs.readFile(file, "utf8", (err: any, data: string) => {
		if (err) {
			console.error(err)
			callback(null)
			return
		}
		callback(JSON.parse(data))
	})
}

export function has(item: string, count: number = 1) {
	return `${item}${(count > 1 ? `:${count}` : '')}`
}

export function and(...args: (string | string[])[]) {
	return args.flat().join(", ")
}

export function hexStr(num: number) {
	return "0x" + num.toString(16).toUpperCase().padStart(3, '0')
}

export const vars = Object.freeze({
	Items: {
		TinyMedal: "TinyMedal",
		// key items
		WaterCall: "WaterCall",
		MoonRock: "MoonRock",
		Crest: "Crest",
		YunaSoul: "YunaSoul",
		SleepHerb: "SleepHerb",
		ChangeStaff: "ChangeStaff",
		// "plugs"
		TidalBell: "TidalBell",
		HarMirror: "HarMirror",
		SkyShield: "SkyShield",
		// misc
		HeavenHelmet: "HeavenHelmet",
		HeavenSword: "HeavenSword",
		HeavenArmor: "HeavenArmor",
		HeavenSet: "HeavenItems",
		WizStone: "WizStone",
		PrettyRing: "PrettyRing",
		// magic keys
		OasisKey: "OasisKey",
		PirateKey: "PirateKey",
		IceKey: "IceKey",
		SkyKey: "SkyKey",
		LimboKey: "LimboKey",
		ElfKey: "ElfKey",
		LonelyKey: "LonelyKey",
		TravelKey: "TravelKey",
		BrawnKey: "BrawnKey",
		BaffleKey: "BaffleKey",
		SoulKey: "SoulKey"
	},
	Worlds: {
		OasisDone: "OasisComplete",
		PirateDone: "PirateComplete",
		IceDone: "IceComplete",
		SkyDone: "SkyComplete",
		LimboDone: "LimboComplete",
	},
	Settings: {
		Character: "Character",
		PlayerCobi: "Cobi",
		PlayerTara: "Tara",
		GoalSetting: "GoalSetting",
		GoalDarck: "GoalDarck",
		RandomizeKeys: "RandomizeKeys",
		RandomizeKeysOn: "RandomizeKeysOn",
		RandomizeKeysOff: "RandomizeKeysOff",
		AutoTab: "AutoTab",
		AutoTabOn: "AutoTabOn",
		AutoTabPanZoom: "AutoTabPanZoom",
		AutoTabOff: "AutoTabOff",
	},
	MapNames: {
		GreatLog: "greatlog",
		Oasis: "oasis",
		Kalka: "kalka",
		Canal: "canal",
		Asiya: "asiya",
		Pirate: "pirate",
		Yold: "yold",
		Polona: "polona",
		PortRitz: "ritz",
		WestCape: "west_cape",
		GhostShip: "ghost_ship",
		Lighthouse: "lighthouse",
		VolcanoB1F: "volcano1",
		VolcanoB2F: "volcano2",
		VolcanoB3F: "volcano3",
		Ice: "ice",
		Norden: "norden",
		Spirit: "spirit",
		GoldMine: "gold_mine",
		Weston: "weston",
		WestaniaCastle: "westania_castle",
		SouthForest: "southern_forest",
		Estria: "estria",
		Nofor: "nofor",
		EastMountain: "east_mountain",
		LakeTower1: "lake_tower1",
		LakeTower2: "lake_tower2",
		LakeTower3: "lake_tower3",
		LakeTower4: "lake_tower4",
		LakeTower5: "lake_tower5",
		Sky: "sky",
		Fhunt: "fhunt",
		SageTower: "sage_tower",
		CondorNest: "condor_nest",
		SmallCave1: "small_cave1",
		SmallCave2: "small_cave2",
		WindTower1: "wind_tower1",
		WindTower2: "wind_tower2",
		WindTower3: "wind_tower3",
		WindTower4: "wind_tower4",
		Graveyard1: "graveyard1",
		Graveyard2: "graveyard2",
		Graveyard3: "graveyard3",
		Hitano: "hitano",
		DemonCastle1: "demon_castle1",
		DemonCastle2: "demon_castle2",
		Limbo: "limbo",
	}
})

export const varDefinitions = Object.freeze({
	Items: vars.Items,
	Worlds: vars.Worlds,
	Settings: vars.Settings,
	MapNames: vars.MapNames
})