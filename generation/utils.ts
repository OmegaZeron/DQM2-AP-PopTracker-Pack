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
		HeavenArmor: "HeavenArmor",
		HeavenSword: "HeavenSword",
		WizStone: "WizStone",
		PrettyRing: "PrettyRing",
		// magic keys
		GreatLogKey: "GreatLogKey",
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
	Settings: {
		GameVersion: "GameVersion",
		VersionCobi: "CobisJourney",
		VersionTara: "TarasAdventure",
		Character: "Character",
		PlayerCobi: "Cobi",
		PlayerTara: "Tara",
		GoalSetting: "GoalSetting",
		GoalDarck: "GoalDarck",
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
		SouthForest: "south_forest",
		Eastria: "eastria",
		EastMountain: "east_mountain"
	}
})