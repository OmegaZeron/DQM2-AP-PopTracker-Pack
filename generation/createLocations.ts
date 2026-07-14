import { vars, writeToFile, has, and, hexStr } from "./utils.ts"

class Parent {
	name!: string;
	chest_unopened_img?: string;
	chest_opened_img?: string;
	access_rules?: string[];
	visibility_rules?: string[];
	children?: Location[]|Parent[];
	sections?: Section[];
	map_locations?: MapLocations[]
}
class Location {
	name!: string;
	access_rules?: string[];
	visibility_rules?: string[];
	sections!: Section[];
	map_locations?: MapLocations[];
}
class Section {
	id?: number;
	name?: string;
	access_rules?: string[];
	visibility_rules?: string[];
	ref?: string|number;

	fallback?: string[];
	preferFallback?: boolean
}
class MapLocations {
	map!: string;
	x!: number;
	y!: number;
	restrict_visibility_rules?: string[]
}

let allLocations: Parent[]
let locMapping: {id: number, path: string}[] = []
let outFiles: {parents: Parent[], path: string}[]

function replacer(key: string, value: any) {
	return ["id", "fallback", "preferFallback"].includes(key) ? undefined : value
}
function outputFile(path: string, locs: Parent[]) {
	let output = JSON.stringify(locs, replacer, '\t')
	output = output.replace(/\[\n\s+(".+")\n\s+\]/g, "[$1]").replace(/\{\n\s+(.+)\n\s+\}/g, "{$1}").replace(/\[\n\t+\{\}\n\t+\]/gm, "[{}]")

	writeToFile(`locations/${path}`, output)
}

function getSectionData(data: Parent, current: string): {id: number, path: string}[] {
	let final: {id: number, path: string}[] = []
	if (data.sections) {
		for (let section of data.sections) {
			if (section.id) {
				final.push({id: section.id, path: `${current}/${section.name || ""}`})
			}
		}
	}
	if (data.children) {
		for (let child of data.children) {
			final.push(...getSectionData(child, `${current}/${child.name}`))
		}
	}

	return final
}

function parseRules(rules: string[]): string[] {
	let final = []
	for (let rule of rules) {
		let reconstructed = []
		let parts = rule.split(", ")
		for (let part of parts) {
			let num = Number(part)
			let loc = locMapping.find(data => num == data.id)
			if (!Number.isNaN(num) && loc) {
				reconstructed.push(`@${loc.path}`)
			}
			else {
				reconstructed.push(part)
			}
		}
		final.push(reconstructed.join(", "))
	}
	return final
}

function replaceRefs(parents: Parent[]) {
	for (let data of parents) {
		if (data.access_rules) {
			data.access_rules = parseRules(data.access_rules)
		}
		if (data.sections) {
			for (let section of data.sections) {
				if (section.access_rules) {
					section.access_rules = parseRules(section.access_rules)
				}
				if (section.ref && typeof(section.ref) == "number") {
					section.ref = locMapping.find(data => section.ref == data.id)?.path
				}
			}
		}
		if (data.children) {
			replaceRefs(data.children)
		}
	}
}

function createLocMapping() {
	// get all location mapping data into an array
	for (let world of allLocations) {
		locMapping.push(...getSectionData(world, world.name))
	}
	// now that all locations are created, replace all refs
	replaceRefs(allLocations)

	locMapping.sort((a, b) => a.id - b.id)
	
	let output = "LOCATION_MAPPING = {\n"
	for (let section of locMapping) {
		// output += section.path
		output += `\t[${hexStr(section.id)}] = {"@${section.path}"},\n`
	}
	output += "}"

	writeToFile("scripts/autotracking/location_mapping.lua", output)
	// console.log(output)
}

function addLocs(parents: Parent[], path: string) {
	if (!parents) {
		console.warn("addLocs: data is null")
		return
	}
	if (parents.length <= 0) {
		console.warn("addLocs: data is empty")
		return
	}

	outFiles.push({parents, path})

	allLocations.push(...parents)
}

export default function createLocations() {
	allLocations = []
	outFiles = []

	addLocs(greatlog(), "greatlog.jsonc")
	addLocs(oasis(), "oasis.jsonc")
	addLocs(pirate(), "pirate.jsonc")
	addLocs(ice(), "ice.jsonc")
	addLocs(sky(), "sky.jsonc")
	addLocs(limbo(), "limbo.jsonc")

	createLocMapping()
	
	for (let file of outFiles) {
		outputFile(file.path, file.parents)
	}
}

function greatlog() {
	let locs: Parent[] = [
		{
			name: "GreatLog",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			children: [
				{
					name: "Stable",
					access_rules: [vars.Worlds.IceDone],
					children: [
						{
							name: "Stable - Vase 1",
							sections: [{id: 0x003}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 914,
									y: 600
								}
							]
						},
						{
							name: "Stable - Vase 2",
							sections: [{id: 0x004}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 942,
									y: 600
								}
							]
						},
					],
					sections: [
						{name: "Vase 1", ref: 0x003},
						{name: "Vase 2", ref: 0x004},
					],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 744,
							y: 632
						}
					]
				},
				{
					name: "Rare Key Shelf",
					access_rules: [vars.Worlds.IceDone],
					sections: [{id: 0x009}],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 536,
							y: 8
						}
					]
				},
				{
					name: "Key Shop Vase",
					access_rules: [vars.Worlds.OasisDone],
					sections: [{id: 0x00A}],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 600,
							y: 184
						}
					]
				},
				{
					name: "Arena",
					access_rules: [vars.Worlds.OasisDone],
					children: [
						{
							name: "Arena - Vase",
							sections: [{id: 0x005}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 662,
									y: 392
								}
							]
						},
						{
							name: "Housing - Vase",
							sections: [{id: 0x008}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 790,
									y: 248
								}
							]
						},
						{
							name: "Housing - Old Man Vase",
							sections: [{id: 0x006}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 886,
									y: 216
								}
							]
						},
					]
				},
				{
					name: "Kameha's Room",
					access_rules: [vars.Worlds.SkyDone],
					children: [
						{
							name: "Kameha's Room - Chest 1",
							sections: [{id: 0x00E}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 456,
									y: 200
								}
							]
						},
						{
							name: "Kameha's Room - Chest 2",
							sections: [{id: 0x00F}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 456,
									y: 248
								}
							]
						},
					]
				},
				{
					name: "Treetop",
					access_rules: [vars.Worlds.IceDone],
					children: [
						{
							name: "Treetop - Vase",
							sections: [{id: 0x010}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 56,
									y: 72
								}
							]
						},
						{
							name: "Treetop - Chest 1",
							access_rules: [and(vars.Items.SkyShield, vars.Worlds.SkyDone)],
							sections: [{id: 0x011}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 1016,
									y: 936
								}
							]
						},
						{
							name: "Treetop - Chest 2",
							access_rules: [and(vars.Items.SkyShield, vars.Worlds.SkyDone)],
							sections: [{id: 0x012}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 1064,
									y: 936
								}
							]
						},
					],
					sections: [
						{name: "Chest 1", ref: 0x11},
						{name: "Chest 2", ref: 0x12},
					],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 392,
							y: 56
						}
					]
				},

				{
					name: "Key Shop",
					sections: [
						{name: "Vase", ref: 0x00A},
					],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 216,
							y: 360
						}
					]
				},
				{
					name: "Rare Key Collector",
					sections: [
						{name: "Rare Key Shelf", ref: 0x009},
					],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 88,
							y: 232
						}
					]
				},
				{
					name: "Arena/Housing",
					sections: [
						{name: "Arena - Vase", ref: 0x05},
						{name: "Housing - Vase", ref: 0x08},
						{name: "Housing - Old Man Vase", ref: 0x06},
					],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 200,
							y: 488
						}
					]
				},
			],
		}
	]

	return locs
}

function oasis() {
	let locs: Parent[] = [
		{
			name: "Oasis",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			// access_rules: [vars.Items.OasisKey, vars.Settings.RandomizeKeysOff],
			children: [
				{
					name: "Kalka",
					children: [
						{
							name: "Vase",
							sections: [{id: 0x100}],
							map_locations: [
								{
									map: vars.MapNames.Kalka,
									x: 216,
									y: 200
								}
							]
						}
					],
					sections: [
						{name: "Vase", ref: 0x100},
						{name: "Canal - Entrance Vase", ref: 0x10C},
						{name: "Canal - Northwest Vase 1", ref: 0x103},
						{name: "Canal - Northwest Vase 2", ref: 0x104},
						{name: "Canal - Northeast Vase 1", ref: 0x105},
						{name: "Canal - Northeast Vase 2", ref: 0x106},
						{name: "Canal - Chest Above Boss", ref: 0x107},
						{name: "Canal - East of Boss", ref: 0x108},
						{name: "Canal - Boss Defeated", ref: 0x10B},
						{name: "Canal - Southwest Chest 1", ref: 0x109},
						{name: "Canal - Southwest Chest 2", ref: 0x10A}
					],
					map_locations: [
						{
							map: vars.MapNames.Oasis,
							x: 400,
							y: 216
						}
					]
				},
				{
					name: "Asiya",
					children: [
						{
							name: "Vase",
							sections: [{id: 0x101}],
							map_locations: [
								{
									map: vars.MapNames.Asiya,
									x: 280,
									y: 536
								}
							]
						},
						{
							name: "Prisoner",
							sections: [{id: 0x102}],
							map_locations: [
								{
									map: vars.MapNames.Asiya,
									x: 360,
									y: 184
								}
							]
						}
					],
					sections: [
						{name: "Vase", ref: 0x101},
						{name: "Prisoner", ref: 0x102}
					],
					map_locations: [
						{
							map: vars.MapNames.Oasis,
							x: 400,
							y: 792
						}
					]
				},
				{
					name: "Canal",
					children: [
						{
							name: "Entrance Vase",
							sections: [{id: 0x10C}],
							map_locations: [
								{
									map: vars.MapNames.Kalka,
									x: 296,
									y: 104
								}
							]
						},
						{
							name: "Northwest Vase 1",
							sections: [{id: 0x103}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 24,
									y: 248
								}
							]
						},
						{
							name: "Northwest Vase 2",
							sections: [{id: 0x104}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 40,
									y: 264
								}
							]
						},
						{
							name: "Northeast Vase 1",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x105}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 296,
									y: 56
								}
							]
						},
						{
							name: "Northeast Vase 2",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x106}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 424,
									y: 200
								}
							]
						},
						{
							name: "Chest Above Boss",
							sections: [{id: 0x107}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 200,
									y: 330
								}
							]
						},
						{
							name: "East of Boss",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x108}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 424,
									y: 344
								}
							]
						},
						{
							name: "Southwest Chest 1",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x109}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 56,
									y: 552
								}
							]
						},
						{
							name: "Southwest Chest 2",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x10A}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 88,
									y: 552
								}
							]
						},
						{
							name: "Boss Defeated",
							sections: [{id: 0x10B, name: "Biino"}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 218,
									y: 392
								}
							]
						}
					]
				},
				{
					name: "Boss Defeated",
					access_rules: [vars.Items.WaterCall],
					sections: [{id: 0x10D, name: "CurseLamp"}],
					map_locations: [
						{
							map: vars.MapNames.Oasis,
							x: 880,
							y: 792
						}
					]
				},
			]
		}
	]

	return locs
}

function pirate() {
	let locs: Parent[] = [
		{
			name: "Pirate",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [vars.Items.PirateKey, and(/*vars.Settings.RandomizeKeysOff, */vars.Worlds.OasisDone)],
			children: [
				{
					name: "Yold",
					children: [
						{
							name: "Barrel",
							sections: [{id: 0x200}],
							map_locations: [
								{
									map: vars.MapNames.Yold,
									x: 136,
									y: 168
								}
							]
						}
					],
					sections: [
						{name: "Barrel", ref: 0x200}
					],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 880,
							y: 936
						}
					]
				},
				{
					name: "Polona",
					children: [
						{
							name: "Dance",
							sections: [{id: 0x201}],
							map_locations: [
								{
									map: vars.MapNames.Polona,
									x: 264,
									y: 152
								}
							]
						}
					],
					sections: [
						{name: "Dance", ref: 0x201},
						{name: "Mermaid Queen", ref: 0x202},
					],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 400,
							y: 648
						}
					]
				},
				{
					name: "Mermaid's Cave",
					children: [
						{
							name: "Mermaid Queen",
							sections: [{id: 0x202}],
							map_locations: [
								{
									map: vars.MapNames.Polona,
									x: 72,
									y: 40
								}
							]
						}
					],
				},
				{
					name: "Port Ritz",
					children: [
						{
							name: "Barrel",
							sections: [{id: 0x203}],
							map_locations: [
								{
									map: vars.MapNames.PortRitz,
									x: 200,
									y: 120
								}
							]
						}
					],
					sections: [
						{name: "Barrel", ref: 0x203}
					],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 720,
							y: 360
						}
					]
				},
				{
					name: "West Cape Cave",
					children: [
						{
							name: "Boss Defeated",
							sections: [{id: 0x204, name: "Squiz"}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 552,
									y: 488
								}
							]
						},
						{
							name: "Northwest Chest",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x205}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 88,
									y: 88
								}
							]
						},
						{
							name: "North Chest",
							sections: [{id: 0x206}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 232,
									y: 72
								}
							]
						},
						{
							name: "Northeast Chest 1",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x207}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 600,
									y: 56
								}
							]
						},
						{
							name: "Northeast Chest 2",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x208}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 600,
									y: 88
								}
							]
						},
						{
							name: "Northeast Chest 3",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x209}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 600,
									y: 120
								}
							]
						},
						{
							name: "Middle Chest",
							access_rules: [vars.Items.TidalBell],
							sections: [{id: 0x20A}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 376,
									y: 472
								}
							]
						},
					],
					sections: [
						{name: "Northwest Chest", ref: 0x205},
						{name: "North Chest", ref: 0x206},
						{name: "Northeast Chest 1", ref: 0x207},
						{name: "Northeast Chest 2", ref: 0x208},
						{name: "Northeast Chest 3", ref: 0x209},
						{name: "Middle Chest", ref: 0x20A},
						{name: "Boss Defeated", ref: 0x204},
					],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 72,
							y: 504
						}
					]
				},
				{
					name: "Ghost Ship",
					access_rules: [vars.Items.TidalBell],
					children: [
						{
							name: "Northeast Barrel",
							sections: [{id: 0x210, name: "1F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 456,
									y: 456
								}
							]
						},
						{
							name: "Middle Barrel",
							sections: [{id: 0x20F, name: "1F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 248,
									y: 504
								}
							]
						},
						{
							name: "South Vase",
							sections: [{id: 0x217, name: "1F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 200,
									y: 552
								}
							]
						},
						{
							name: "Flooded Vase 1",
							sections: [{id: 0x20D, name: "1F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 104,
									y: 504
								}
							]
						},
						{
							name: "Flooded Vase 2",
							sections: [{id: 0x20E, name: "1F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 120,
									y: 504
								}
							]
						},
						{
							name: "Center Chest",
							sections: [{id: 0x214, name: "2F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 248,
									y: 360
								}
							]
						},
						{
							name: "Hidden Chest 1",
							sections: [{id: 0x211, name: "2F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 72,
									y: 312
								}
							]
						},
						{
							name: "Hidden Chest 2",
							sections: [{id: 0x212, name: "2F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 88,
									y: 312
								}
							]
						},
						{
							name: "Hidden Chest 3",
							sections: [{id: 0x213, name: "2F"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 104,
									y: 312
								}
							]
						},
						{
							name: "West Barrel",
							sections: [{id: 0x215, name: "Deck"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 200,
									y: 184
								}
							]
						},
						{
							name: "East Barrel",
							sections: [{id: 0x216, name: "Deck"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 312,
									y: 184
								}
							]
						},
						{
							name: "Boss Defeated",
							sections: [{id: 0x20B, name: "CaptDead"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 424,
									y: 40
								}
							]
						},
						{
							name: "Chest",
							sections: [{id: 0x20C, name: "Captain's Quarters"}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 424,
									y: 24
								}
							]
						},
					],
					sections: [
						{name: "1F Northeast Barrel", ref: 0x210},
						{name: "1F Middle Barrel", ref: 0x20F},
						{name: "1F South Vase", ref: 0x217},
						{name: "1F Flooded Vase 1", ref: 0x20D},
						{name: "1F Flooded Vase 2", ref: 0x20E},
						{name: "2F Center Chest", ref: 0x214},
						{name: "2F Hidden Chest 1", ref: 0x211},
						{name: "2F Hidden Chest 2", ref: 0x212},
						{name: "2F Hidden Chest 3", ref: 0x213},
						{name: "Deck West Barrel", ref: 0x215},
						{name: "Deck East Barrel", ref: 0x216},
						{name: "Boss Defeated", ref: 0x20B},
						{name: "Captain's Quarters Chest", ref: 0x20C},
					],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 868,
							y: 796
						}
					]
				},
				{
					name: "Lighthouse",
					children: [
						{
							name: "Chest",
							sections: [{id: 0x218, name: "2F"}],
							map_locations: [
								{
									map: vars.MapNames.Lighthouse,
									x: 264,
									y: 200
								}
							]
						}
					],
					sections: [
						{name: "Chest", ref: 0x218}
					],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 1032,
							y: 360
						}
					]
				},
				{
					name: "Volcano Cave",
					access_rules: [and(vars.Items.TidalBell, vars.Items.MoonRock)],
					children: [
						{
							name: "Chest 1",
							sections: [{id: 0x21A, name: "B2F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB2F,
									x: 504,
									y: 56
								}
							]
						},
						{
							name: "Chest 2",
							sections: [{id: 0x21B, name: "B2F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB2F,
									x: 584,
									y: 56
								}
							]
						},
						{
							name: "South Chest 1",
							access_rules: [vars.Items.SkyShield],
							sections: [{id: 0x21C, name: "B2F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB2F,
									x: 520,
									y: 376
								}
							]
						},
						{
							name: "South Chest 2",
							access_rules: [vars.Items.SkyShield],
							sections: [{id: 0x21D, name: "B2F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB2F,
									x: 552,
									y: 376
								}
							]
						},
						{
							name: "South Chest 3",
							access_rules: [vars.Items.SkyShield],
							sections: [{id: 0x21E, name: "B2F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB2F,
									x: 584,
									y: 376
								}
							]
						},
						{
							name: "Lava Chest 1",
							sections: [{id: 0x21F, name: "B3F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB3F,
									x: 72,
									y: 88
								}
							]
						},
						{
							name: "Lava Chest 2",
							sections: [{id: 0x220, name: "B3F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB3F,
									x: 88,
									y: 88
								}
							]
						},
						{
							name: "Har Mirror",
							sections: [{id: 0x219, name: "B3F"}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB3F,
									x: 232,
									y: 488
								}
							]
						},
					],
					sections: [
						{name: "Chest 1", ref: 0x21A},
						{name: "Chest 2", ref: 0x21B},
						{name: "South Chest 1", ref: 0x21C},
						{name: "South Chest 2", ref: 0x21D},
						{name: "South Chest 3", ref: 0x21E},
					],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 872,
							y: 504
						}
					]
				},
			]
		}
	]

	return locs
}

function ice() {
	let locs: Parent[] = [
		{
			name: "Ice",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [vars.Items.IceKey, and(/*vars.Settings.RandomizeKeysOff, */vars.Worlds.PirateDone)],
			children: [
				{
					name: "Ice North",
					children: [
						{
							name: "Norden",
							children: [
								{
									name: "Vase",
									sections: [{id: 0x301}],
									map_locations: [
										{
											map: vars.MapNames.Norden,
											x: 40,
											y: 552
										}
									]
								},
								{
									name: "Boss Defeated",
									access_rules: [vars.Items.HarMirror], // requirement to beat BombCrag
									sections: [{id: 0x300, name: "AgDevil"}],
									map_locations: [
										{
											map: vars.MapNames.Norden,
											x: 72,
											y: 72
										}
									]
								},
							],
							sections: [
								{name: "Vase", ref: 0x301},
								{name: "Boss Defeated", ref: 0x300},
							],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 1360,
									y: 360
								}
							]
						},
						{
							name: "Spirit's Spring",
							children: [
								{
									name: "Chest",
									sections: [{id: 0x302}],
									map_locations: [
										{
											map: vars.MapNames.Spirit,
											x: 40,
											y: 552
										}
									]
								},
								{
									name: "Boss Defeated",
									access_rules: [and(vars.Items.HarMirror, vars.Items.Crest, vars.Items.YunaSoul, vars.Items.SleepHerb)],
									sections: [{id: 0x303, name: "GoatHorn and the ArcDemons"}],
									map_locations: [
										{
											map: vars.MapNames.Spirit,
											x: 72,
											y: 72
										}
									]
								},
								{
									name: "Sky Shield",
									access_rules: [and(vars.Items.HarMirror, vars.Items.Crest, vars.Items.YunaSoul, vars.Items.SleepHerb)],
									sections: [{id: 0x304}],
									map_locations: [
										{
											map: vars.MapNames.Spirit,
											x: 72,
											y: 72
										}
									]
								},
							],
							sections: [
								{name: "Chest", ref: 0x302},
								{name: "Boss Defeated", ref: 0x303},
								{name: "Sky Shield", ref: 0x304},
							],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 880,
									y: 72
								}
							]
						},
					]
				},
				{
					name: "Gold Mine",
					access_rules: [vars.Items.HarMirror], // both items here require it
					children: [
						{
							name: "Chest",
							sections: [{id: 0x305}],
							map_locations: [
								{
									map: vars.MapNames.GoldMine,
									x: 668,
									y: 488
								}
							]
						},
						{
							name: "Boss Defeated",
							sections: [{id: 0x306, name: "BombCrag"}],
							map_locations: [
								{
									map: vars.MapNames.GoldMine,
									x: 232,
									y: 24
								}
							]
						},
					],
					sections: [
						{name: "Chest", ref: 0x305},
						{name: "Boss Defeated", ref: 0x306}
					],
					map_locations: [
						{
							map: vars.MapNames.Ice,
							x: 728,
							y: 936
						}
					]
				},
				{
					name: "Ice South",
					access_rules: [and(vars.Items.Crest, vars.Items.HarMirror)],
					children: [
						{
							name: "Weston",
							children: [
								{
									name: "Barrel",
									sections: [{id: 0x307}],
									map_locations: [
										{
											map: vars.MapNames.Weston,
											x: 152,
											y: 232
										}
									]
								},
							],
							sections: [{name: "Barrel", ref: 0x307},],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 720,
									y: 1224
								}
							]
						},
						{
							name: "Westania Castle",
							children: [
								{
									name: "Boss Defeated",
									access_rules: [vars.Items.YunaSoul],
									sections: [{id: 0x308, name: "Puppetor"}],
									map_locations: [
										{
											map: vars.MapNames.WestaniaCastle,
											x: 104,
											y: 200
										}
									]
								}
							],
							sections: [{name: "Boss Defeated", ref: 0x308}],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 400,
									y: 1368
								}
							]
						},
						{
							name: "Southern Forest",
							children: [
								{
									name: "Yuna's Soul",
									sections: [{id: 0x309}],
									map_locations: [
										{
											map: vars.MapNames.SouthForest,
											x: 408,
											y: 504
										}
									]
								}
							],
							sections: [{name: "Yuna's Soul", ref: 0x309}],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 880,
									y: 1496
								}
							]
						},
						{
							name: "Estria",
							children: [
								{
									name: "Boss Defeated",
									access_rules: [vars.Items.SleepHerb],
									sections: [{id: 0x30A, name: "GoatHorn"}],
									map_locations: [
										{
											map: vars.MapNames.Estria,
											x: 552,
											y: 56
										}
									]
								}
							],
							sections: [{name: "Boss Defeated", ref: 0x30A}],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 1520,
									y: 1368
								}
							]
						},
						{
							name: "Eastern Mountain",
							children: [
								{
									name: "Sleep Herb",
									sections: [{id: 0x30B}],
									map_locations: [
										{
											map: vars.MapNames.EastMountain,
											x: 216,
											y: 56
										}
									]
								},
								{
									name: "Chest",
									sections: [{id: 0x30C}],
									map_locations: [
										{
											map: vars.MapNames.EastMountain,
											x: 280,
											y: 184
										}
									]
								},
							],
							sections: [
								{name: "Sleep Herb", ref: 0x30B},
								{name: "Chest", ref: 0x30C}
							],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 1672,
									y: 792
								}
							]
						},
						{
							name: "Lake Tower",
							access_rules: [and(vars.Items.TidalBell, vars.Items.SkyShield, vars.Worlds.IceDone)],
							children: [
								{
									name: "1F Right Chest",
									sections: [{id: 0x30D}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower1,
											x: 184,
											y: 120
										}
									]
								},
								{
									name: "1F Left Chest",
									sections: [{id: 0x30E}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower1,
											x: 136,
											y: 168
										}
									]
								},
								{
									name: "2F Left Chest",
									sections: [{id: 0x30F}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower2,
											x: 24,
											y: 72
										}
									]
								},
								{
									name: "2F Right Chest",
									sections: [{id: 0x310}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower2,
											x: 72,
											y: 88
										}
									]
								},
								{
									name: "4F Left Chest",
									sections: [{id: 0x311}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower4,
											x: 24,
											y: 72
										}
									]
								},
								{
									name: "4F Right Chest",
									sections: [{id: 0x312}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower4,
											x: 56,
											y: 72
										}
									]
								},
								{
									name: "5F Left Chest",
									sections: [{id: 0x313}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower5,
											x: 56,
											y: 120
										}
									]
								},
								{
									name: "5F Right Chest",
									sections: [{id: 0x314}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower5,
											x: 104,
											y: 120
										}
									]
								},
							],
							sections: [
								{name: "1F Right Chest", ref: 0x30D},
								{name: "1F Left Chest", ref: 0x30E},
								{name: "2F Left Chest", ref: 0x30F},
								{name: "2F Right Chest", ref: 0x310},
								{name: "4F Left Chest", ref: 0x311},
								{name: "4F Right Chest", ref: 0x312},
								{name: "5F Left Chest", ref: 0x313},
								{name: "5F Right Chest", ref: 0x314},
							],
							map_locations: [
								{
									map: vars.MapNames.Ice,
									x: 1352,
									y: 1080
								}
							]
						},
					]
				}
			]
		}
	]

	return locs
}

function sky() {
	let locs: Parent[] = [
		{
			name: "Sky",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [vars.Items.SkyKey, and(/* vars.Settings.RandomizeKeysOff,  */vars.Worlds.IceDone)],
			children: [
				{
					name: "Shrine Island",
					children: [
						{
							name: "Fhunt",
							children: [
								{
									name: "Gravestone",
									sections: [{id: 0x400}],
									map_locations: [
										{
											map: vars.MapNames.Fhunt,
											x: 41,
											y: 361
										}
									]
								}
							],
							sections: [
								{name: "Fhunt - Gravestone", ref: 0x400},
								{name: "Sage Tower - 1F Chest", ref: 0x401},
								{name: "Sage Tower - 4F Chest 1", ref: 0x402},
								{name: "Sage Tower - 4F Chest 2", ref: 0x403},
							],
							map_locations: [
								{
									map: vars.MapNames.Sky,
									x: 1832,
									y: 216
								}
							]
						},
						{
							name: "Sage Tower",
							children: [
								{
									name: "1F Chest",
									sections: [{id: 0x401}],
									map_locations: [
										{
											map: vars.MapNames.SageTower,
											x: 136,
											y: 472
										}
									]
								},
								{
									name: "4F Chest 1",
									sections: [{id: 0x402}],
									map_locations: [
										{
											map: vars.MapNames.SageTower,
											x: 376,
											y: 88
										}
									]
								},
								{
									name: "4F Chest 2",
									sections: [{id: 0x403}],
									map_locations: [
										{
											map: vars.MapNames.SageTower,
											x: 456,
											y: 104
										}
									]
								}
							]
						},
					]
				},
				{
					name: "Main Area",
					access_rules: [vars.Items.ChangeStaff],
					children: [
						{
							name: "Mad Condor's Nest",
							children: [
								{
									name: "Boss Defeated",
									sections: [{id: 0x404}],
									map_locations: [
										{
											map: vars.MapNames.CondorNest,
											x: 72,
											y: 40
										}
									]
								},
								{
									name: "Chest",
									sections: [{id: 0x405}],
									map_locations: [
										{
											map: vars.MapNames.CondorNest,
											x: 72,
											y: 24
										}
									]
								}
							],
							sections: [
								{name: "Boss Defeated", ref: 0x404},
								{name: "Chest", ref: 0x405}
							],
							map_locations: [
								{
									map: vars.MapNames.Sky,
									x: 72,
									y: 648
								}
							]
						},
						{
							name: "Small Cave",
							access_rules: [vars.Items.SkyShield, vars.Items.HarMirror],
							children: [
								{
									name: "East Chest",
									sections: [{id: 0x406}],
									map_locations: [
										{
											map: vars.MapNames.SmallCave1,
											x: 408,
											y: 360
										}
									]
								},
								{
									name: "Boss Defeated",
									sections: [{id: 0x407, name: "Metabble"}],
									map_locations: [
										{
											map: vars.MapNames.SmallCave2,
											x: 72,
											y: 342
										}
									]
								},
								{
									name: "West Chest",
									sections: [{id: 0x408}],
									map_locations: [
										{
											map: vars.MapNames.SmallCave2,
											x: 104,
											y: 312
										}
									]
								},
							],
							sections: [
								{name: "East Chest", ref: 0x406},
								{name: "Boss Defeated", ref: 0x407},
								{name: "West Chest", ref: 0x408},
							],
							map_locations: [
								{
									map: vars.MapNames.Sky,
									x: 872,
									y: 1656
								}
							]
						},
						{
							name: "Wind Tower",
							access_rules: [vars.Items.SkyShield],
							children: [
								{
									name: "Chest",
									sections: [{id: 0x409}],
									map_locations: [
										{
											map: vars.MapNames.WindTower1,
											x: 248,
											y: 40
										}
									]
								},
							],
							sections: [
								{name: "Chest", ref: 0x409}
							],
							map_locations: [
								{
									map: vars.MapNames.Sky,
									x: 232,
									y: 1656
								}
							]
						},
						{
							name: "Graveyard",
							access_rules: [vars.Items.SkyShield],
							children: [
								{
									name: "Boss Defeated",
									sections: [{id: 0x40A, name: "Niterich"}],
									map_locations: [
										{
											map: vars.MapNames.Graveyard3,
											x: 232,
											y: 56
										}
									]
								},
								{
									name: "Chest",
									sections: [{id: 0x40B}],
									map_locations: [
										{
											map: vars.MapNames.Graveyard3,
											x: 232,
											y: 40
										}
									]
								},
							],
							sections: [
								{name: "Boss Defeated", ref: 0x40A},
								{name: "Chest", ref: 0x40B}
							],
							map_locations: [
								{
									map: vars.MapNames.Sky,
									x: 1840,
									y: 1512
								}
							]
						},
						{
							name: "Hitano",
							children: [
								{
									name: "Vase",
									access_rules: [has(vars.Items.HeavenSet, 3)],
									sections: [{id: 0x40D}],
									map_locations: [
										{
											map: vars.MapNames.Hitano,
											x: 120,
											y: 200
										}
									]
								},
							],
							sections: [
								{name: "Vase", ref: 0x40D}
							],
							map_locations: [
								{
									map: vars.MapNames.Sky,
									x: 880,
									y: 1368
								}
							]
						},
						{
							name: "Demon Castle",
							access_rules: [has(vars.Items.HeavenSet, 3)],
							children: [
								{
									name: "1F Chest",
									sections: [{id: 0x40E}],
									map_locations: [
										{
											map: vars.MapNames.DemonCastle1,
											x: 392,
											y: 72
										}
									]
								},
								{
									name: "B2F Chest",
									sections: [{id: 0x40F}],
									map_locations: [
										{
											map: vars.MapNames.DemonCastle2,
											x: 72,
											y: 72
										}
									]
								},
								{
									name: "B4F Chest",
									sections: [{id: 0x410}],
									map_locations: [
										{
											map: vars.MapNames.DemonCastle2,
											x: 184,
											y: 392
										}
									]
								},
								{
									name: "B6F Chest",
									sections: [{id: 0x411}],
									map_locations: [
										{
											map: vars.MapNames.DemonCastle2,
											x: 296,
											y: 552
										}
									]
								},
								{
									name: "Boss Defeated",
									sections: [{id: 0x412, name: "Mudou"}],
									map_locations: [
										{
											map: vars.MapNames.DemonCastle2,
											x: 400,
											y: 176
										}
									]
								},
								// {
								// 	name: "Boss Gift",
								// 	sections: [{id: 0x413}],
								// 	map_locations: [
								// 		{
								// 			map: vars.MapNames.DemonCastle2,
								// 			x: 392,
								// 			y: 72
								// 		}
								// 	]
								// },
							],
							sections: [
								{name: "1F Chest", ref: 0x40E},
								{name: "B2F Chest", ref: 0x40F},
								{name: "B4F Chest", ref: 0x410},
								{name: "B6F Chest", ref: 0x411},
								{name: "Boss Defeated", ref: 0x412},
								// {name: "Boss Gift", ref: 0x413},
							],
							map_locations: [
								{
									map: vars.MapNames.Sky,
									x: 720,
									y: 216
								}
							]
						},
					]
				}
			]
		}
	]

	return locs
}

function limbo() {
	let locs: Parent[] = [
		{
			name: "Limbo",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [vars.Items.LimboKey, and(/* vars.Settings.RandomizeKeysOff,  */vars.Worlds.SkyDone)],
			children: [
				{
					name: "Boss Defeated",
					access_rules: [and(vars.Items.TidalBell, vars.Items.HarMirror, vars.Items.SkyShield)],
					sections: [{id: 0x500, name: "Darck"}],
					map_locations: [
						{
							map: vars.MapNames.Limbo,
							x: 240,
							y: 216
						}
					]
				}
			]
		}
	]

	return locs
}


// @ts-ignore
if (import.meta.main) {
	createLocations()
}