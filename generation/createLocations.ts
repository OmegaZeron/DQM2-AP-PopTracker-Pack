import { vars, writeToFile, has, hexStr } from "./utils.ts"

class Location {
	name!: string;
	chest_unopened_img?: string;
	chest_opened_img?: string;
	access_rules?: string[]|string[][];
	visibility_rules?: string[];
	children?: Location[];
	sections?: Section[];
	map_locations?: MapLocations[]
}
class Section {
	id?: number;
	name?: string;
	access_rules?: string[]|string[][];
	visibility_rules?: string[];
	ref?: string;
	
	refs?: RefData[];
	fallback?: string[];
	preferFallback?: boolean
}
class RefData {
	ref!: string;
	name!: string;
}
class MapLocations {
	map!: string;
	x!: number;
	y!: number;
	restrict_visibility_rules?: string[]
}

let allLocations: Location[]
let locMapping: {id: number, path: string}[] = []
let outFiles: {locations: Location[], path: string}[]
let refMap: Record<string, Location>

function replacer(key: string, value: any) {
	return ["id", "fallback", "preferFallback", "refs"].includes(key) ? undefined : value
}
function outputFile(path: string, locs: Location[]) {
	let output = JSON.stringify(locs, replacer, '\t')
	output = output.replace(/\{\n\s+(.+)\n\s+\}/g, "{$1}")
					.replace(/\[\n\t+\{\}\n\t+\]/gm, "[{}]")
					.replace(/\[\s+(((?:[^\[\]\{\}])|"\[|\]"|"\{|\}")+?)\s+\]/g, (_, capture: string) => `[${capture.replace(/\s+/g, " ")}]`)

	writeToFile(`locations/${path}`, output)
}

function getSectionData(data: Location, current: string): {id: number, path: string}[] {
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

function replaceRefs(locations: Location[]) {
	for (let location of locations) {
		if (location.sections) {
			for (let section of location.sections) {
				if (section.refs) {
					for (let data of section.refs) {
						if (!refMap[data.ref]) {
							throw new Error(`Section ${section.name}: refMap has no key ${data.ref}\n${JSON.stringify(refMap)}`);
						}
						refMap[data.ref].sections?.push({name: data.name, ref: locMapping.find(loc => loc.id == section.id)?.path})
					}
				}
			}
		}
		if (location.children) {
			replaceRefs(location.children)
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
}

function createRefMap(location: Location, current: string = "") {
	if (location.sections != null) {
		// don't actually care about the sections, just need to make sure it exists
		refMap[`${current}/${location.name}`] = location
	}
	if (location.children) {
		for (let child of location.children) {
			createRefMap(child, `${current}${(current == "" ? "" : "/")}${location.name}`)
		}
	}
}

function addLocs(locations: Location[], path: string) {
	if (!locations) {
		console.warn("addLocs: data is null")
		return
	}
	if (locations.length <= 0) {
		console.warn("addLocs: data is empty")
		return
	}

	for (let location of locations) {
		createRefMap(location)
	}

	outFiles.push({locations, path})

	allLocations.push(...locations)
}

export default function createLocations() {
	allLocations = []
	outFiles = []
	refMap = {}

	addLocs(greatlog(), "greatlog.jsonc")
	addLocs(oasis(), "oasis.jsonc")
	addLocs(pirate(), "pirate.jsonc")
	addLocs(ice(), "ice.jsonc")
	addLocs(sky(), "sky.jsonc")
	addLocs(limbo(), "limbo.jsonc")

	createLocMapping()
	
	let locImport = ""
	for (let file of outFiles) {
		outputFile(file.path, file.locations)
		locImport += `Tracker:AddLocations("locations/${file.path}")\n`
	}
	writeToFile("scripts/locations.lua", locImport)
}

function greatlog() {
	let locs: Location[] = [
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
							sections: [{
								id: 0x003,
								refs: [{name: "Vase 1", ref: "GreatLog/Stable"}]}
							],
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
							sections: [{
								id: 0x004,
								refs: [{name: "Vase 2", ref: "GreatLog/Stable"}]}
							],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 942,
									y: 600
								}
							]
						},
					],
					sections: [],
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
					sections: [{
						id: 0x009,
						refs: [{name: "Rare Key Shelf", ref: "GreatLog/Rare Key Collector"}]
					}],
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
					sections: [{
						id: 0x00A,
						refs: [{name: "Vase", ref: "GreatLog/Key Shop"}]
					}],
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
							sections: [{id: 0x005, refs: [{name: "Arena - Vase", ref: "GreatLog/Arena/Housing"}]}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 662,
									y: 392
								}
							]
						},
						{
							name: "Arena - Tournament",
							sections: [
								{name: "Kid's Class", id: 0x013, refs: [{name: "Arena - Kid's Class", ref: "GreatLog/Arena/Housing"}]},
								{name: "C Class", id: 0x014, refs: [{name: "Arena - C Class", ref: "GreatLog/Arena/Housing"}]},
								{
									name: "B Class",
									id: 0x015,
									access_rules: [vars.Worlds.PirateDone],
									refs: [{name: "Arena - B Class", ref: "GreatLog/Arena/Housing"}]
								},
								{
									name: "A Class",
									id: 0x016,
									access_rules: [vars.Worlds.IceDone],
									refs: [{name: "Arena - A Class", ref: "GreatLog/Arena/Housing"}]
								},
								{
									name: "S Class",
									id: 0x017,
									access_rules: [vars.Worlds.SkyDone],
									refs: [{name: "Arena - S Class", ref: "GreatLog/Arena/Housing"}]
								},
							],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 854,
									y: 168
								}
							]
						},
						{
							name: "Housing - Vase",
							sections: [{id: 0x008, refs: [{name: "Housing - Vase", ref: "GreatLog/Arena/Housing"}]}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 790,
									y: 104
								}
							]
						},
						{
							name: "Housing - Old Man Vase",
							sections: [{id: 0x006, refs: [{name: "Housing - Old Man Vase", ref: "GreatLog/Arena/Housing"}]}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 886,
									y: 72
								}
							]
						},
					]
				},
				{
					name: "Kameha's Room", // add refs for these?
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
							access_rules: [[vars.Items.SkyShield, vars.Worlds.SkyDone]],
							sections: [{id: 0x011, refs: [{name: "Chest 1", ref: "GreatLog/Treetop"}]}],
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
							access_rules: [[vars.Items.SkyShield, vars.Worlds.SkyDone]],
							sections: [{id: 0x012, refs: [{name: "Chest 2", ref: "GreatLog/Treetop"}]}],
							map_locations: [
								{
									map: vars.MapNames.GreatLog,
									x: 1064,
									y: 936
								}
							]
						},
					],
					sections: [],
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
					sections: [],
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
					sections: [],
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
					sections: [],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 200,
							y: 488
						}
					]
				},
				{
					name: "Oasis",
					sections: [],
					map_locations:
					[
						{
							map: vars.MapNames.GreatLog,
							x: 112,
							y: 766
						}
					]
				},
				{
					name: "Pirate",
					sections: [],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 146,
							y: 766
						}
					]
				},
				{
					name: "Ice",
					sections: [],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 178,
							y: 766
						}
					]
				},
				{
					name: "Sky",
					sections: [],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 211,
							y: 766
						}
					]
				},
				{
					name: "Limbo",
					sections: [],
					map_locations: [
						{
							map: vars.MapNames.GreatLog,
							x: 244,
							y: 766
						}
					]
				},
			],
		}
	]

	return locs
}

function oasis() {
	let locs: Location[] = [
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
							sections: [{
								id: 0x100,
								refs: [
									{name: "Vase", ref: "Oasis/Kalka"},
									{name: "Kalka - Vase", ref: "GreatLog/Oasis"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Kalka,
									x: 216,
									y: 200
								}
							]
						}
					],
					sections: [],
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
							sections: [{
								id: 0x101,
								refs: [
									{name: "Vase", ref: "Oasis/Asiya"},
									{name: "Asiya - Vase", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x102,
								refs: [
									{name: "Prisoner", ref: "Oasis/Asiya"},
									{name: "Asiya - Prisoner", ref: "GreatLog/Oasis"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Asiya,
									x: 360,
									y: 184
								}
							]
						}
					],
					sections: [],
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
							sections: [{
								id: 0x10C,
								refs: [
									{name: "Canal - Entrance Vase", ref: "Oasis/Kalka"},
									{name: "Canal - Entrance Vase", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x103,
								refs: [
									{name: "Canal - Northwest Vase 1", ref: "Oasis/Kalka"},
									{name: "Canal - Northwest Vase 1", ref: "Oasis/Asiya"},
									{name: "Canal - Northwest Vase 1", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x104,
								refs: [
									{name: "Canal - Northwest Vase 2", ref: "Oasis/Kalka"},
									{name: "Canal - Northwest Vase 2", ref: "Oasis/Asiya"},
									{name: "Canal - Northwest Vase 2", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x105,
								refs: [
									{name: "Canal - Northeast Vase 1", ref: "Oasis/Kalka"},
									{name: "Canal - Northeast Vase 1", ref: "Oasis/Asiya"},
									{name: "Canal - Northeast Vase 1", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x106,
								refs: [
									{name: "Canal - Northeast Vase 2", ref: "Oasis/Kalka"},
									{name: "Canal - Northeast Vase 2", ref: "Oasis/Asiya"},
									{name: "Canal - Northeast Vase 2", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x107,
								refs: [
									{name: "Canal - Chest Above Boss", ref: "Oasis/Kalka"},
									{name: "Canal - Chest Above Boss", ref: "Oasis/Asiya"},
									{name: "Canal - Chest Above Boss", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x108,
								refs: [
									{name: "Canal - East of Boss", ref: "Oasis/Kalka"},
									{name: "Canal - East of Boss", ref: "Oasis/Asiya"},
									{name: "Canal - East of Boss", ref: "GreatLog/Oasis"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 424,
									y: 344
								}
							]
						},
						{
							name: "Boss Defeated",
							sections: [{
								id: 0x10B,
								name: "Biino",
								refs: [
									{name: "Canal - Boss Defeated", ref: "Oasis/Kalka"},
									{name: "Canal - Boss Defeated", ref: "Oasis/Asiya"},
									{name: "Canal - Boss Defeated", ref: "GreatLog/Oasis"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 218,
									y: 392
								}
							]
						},
						{
							name: "Southwest Chest 1",
							access_rules: [vars.Items.TidalBell],
							sections: [{
								id: 0x109,
								refs: [
									{name: "Canal - Southwest Chest 1", ref: "Oasis/Kalka"},
									{name: "Canal - Southwest Chest 1", ref: "Oasis/Asiya"},
									{name: "Canal - Southwest Chest 1", ref: "GreatLog/Oasis"},
								]
							}],
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
							sections: [{
								id: 0x10A,
								refs: [
									{name: "Canal - Southwest Chest 2", ref: "Oasis/Kalka"},
									{name: "Canal - Southwest Chest 2", ref: "Oasis/Asiya"},
									{name: "Canal - Southwest Chest 2", ref: "GreatLog/Oasis"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Canal,
									x: 88,
									y: 552
								}
							]
						},
					]
				},
				{
					name: "Boss Defeated",
					access_rules: [vars.Items.WaterCall],
					sections: [{
						id: 0x10D,
						name: "CurseLamp",
						refs: [{name: "Mirage Lake - Boss Defeated", ref: "GreatLog/Oasis"}]
					}],
					map_locations: [
						{
							map: vars.MapNames.Oasis,
							x: 880,
							y: 792
						}
					]
				},
			],
			sections: [],
			map_locations: [
				{
					map: vars.MapNames.GreatLog,
					x: 112,
					y: 766
				}
			]
		}
	]

	return locs
}

function pirate() {
	let locs: Location[] = [
		{
			name: "Pirate",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [[vars.Items.PirateKey], [/*vars.Settings.RandomizeKeysOff, */vars.Worlds.OasisDone]],
			children: [
				{
					name: "Yold",
					children: [
						{
							name: "Barrel",
							sections: [{
								id: 0x200,
								refs: [
									{name: "Barrel", ref: "Pirate/Yold"},
									{name: "Yold - Barrel", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Yold,
									x: 136,
									y: 168
								}
							]
						}
					],
					sections: [],
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
							sections: [{
								id: 0x201,
								refs: [
									{name: "Dance", ref: "Pirate/Polona"},
									{name: "Polona - Dance", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Polona,
									x: 216,
									y: 184
								}
							]
						}
					],
					sections: [],
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
							access_rules: [vars.Items.TidalBell],
							sections: [{
								id: 0x202,
								refs: [
									{name: "Mermaid Queen", ref: "Pirate/Polona"},
									{name: "Mermaid Queen", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x203,
								refs: [
									{name: "Barrel", ref: "Pirate/Port Ritz"},
									{name: "Port Ritz - Barrel", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.PortRitz,
									x: 200,
									y: 120
								}
							]
						}
					],
					sections: [],
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
							name: "Northwest Chest",
							access_rules: [vars.Items.TidalBell],
							sections: [{
								id: 0x205,
								refs: [
									{name: "Northwest Chest", ref: "Pirate/West Cape Cave"},
									{name: "West Cape Cave - Northwest Chest", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x206,
								refs: [
									{name: "North Chest", ref: "Pirate/West Cape Cave"},
									{name: "West Cape Cave - North Chest", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x207,
								refs: [
									{name: "Northeast Chest 1", ref: "Pirate/West Cape Cave"},
									{name: "West Cape Cave - Northeast Chest 1", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x208,
								refs: [
									{name: "Northeast Chest 2", ref: "Pirate/West Cape Cave"},
									{name: "West Cape Cave - Northeast Chest 2", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x209,
								refs: [
									{name: "Northeast Chest 3", ref: "Pirate/West Cape Cave"},
									{name: "West Cape Cave - Northeast Chest 3", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x20A,
								refs: [
									{name: "Middle Chest", ref: "Pirate/West Cape Cave"},
									{name: "West Cape Cave - Middle Chest", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 376,
									y: 472
								}
							]
						},
						{
							name: "Boss Defeated",
							sections: [{
								id: 0x204,
								name: "Squiz",
								refs: [
									{name: "Boss Defeated", ref: "Pirate/West Cape Cave"},
									{name: "West Cape Cave - Boss Defeated", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.WestCape,
									x: 552,
									y: 488
								}
							]
						},
					],
					sections: [],
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
							sections: [{
								id: 0x210,
								name: "1F",
								refs: [
									{name: "1F Northeast Barrel", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 1F Northeast Barrel", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x20F,
								name: "1F",
								refs: [
									{name: "1F Middle Barrel", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 1F Middle Barrel", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x217,
								name: "1F",
								refs: [
									{name: "1F South Vase", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 1F South Vase", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x20D,
								name: "1F",
								refs: [
									{name: "1F Flooded Vase 1", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 1F Flooded Vase 1", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x20E,
								name: "1F",
								refs: [
									{name: "1F Flooded Vase 2", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 1F Flooded Vase 2", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x214,
								name: "2F",
								refs: [
									{name: "2F Center Chest", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 2F Center Chest", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x211,
								name: "2F",
								refs: [
									{name: "2F Hidden Chest 1", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 2F Hidden Chest 1", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x212,
								name: "2F",
								refs: [
									{name: "2F Hidden Chest 2", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 2F Hidden Chest 2", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x213,
								name: "2F",
								refs: [
									{name: "2F Hidden Chest 3", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - 2F Hidden Chest 3", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x215,
								name: "Deck",
								refs: [
									{name: "Deck West Barrel", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - Deck West Barrel", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x216,
								name: "Deck",
								refs: [
									{name: "Deck East Barrel", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - Deck East Barrel", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x20B,
								name: "CaptDead",
								refs: [
									{name: "Boss Defeated", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - Boss Defeated", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x20C,
								name: "Captain's Quarters",
								refs: [
									{name: "Captain's Quarters Chest", ref: "Pirate/Ghost Ship"},
									{name: "Ghost Ship - Captain's Quarters Chest", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.GhostShip,
									x: 424,
									y: 24
								}
							]
						},
					],
					sections: [],
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
							sections: [{
								id: 0x218,
								name: "2F",
								refs: [
									{name: "Chest", ref: "Pirate/Lighthouse"},
									{name: "Lighthouse - Chest", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.Lighthouse,
									x: 264,
									y: 200
								}
							]
						}
					],
					sections: [],
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
					access_rules: [[vars.Items.TidalBell, vars.Items.MoonRock]],
					children: [
						{
							name: "Chest 1",
							sections: [{
								id: 0x21A,
								name: "B2F",
								refs: [
									{name: "Chest 1", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - Chest 1", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x21B,
								name: "B2F",
								refs: [
									{name: "Chest 2", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - Chest 2", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x21C,
								name: "B2F",
								refs: [
									{name: "South Chest 1", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - South Chest 1", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x21D,
								name: "B2F",
								refs: [
									{name: "South Chest 2", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - South Chest 2", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x21E,
								name: "B2F",
								refs: [
									{name: "South Chest 3", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - South Chest 3", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x21F,
								name: "B3F",
								refs: [
									{name: "Lava Chest 1", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - Lava Chest 1", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x220,
								name: "B3F",
								refs: [
									{name: "Lava Chest 2", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - Lava Chest 2", ref: "GreatLog/Pirate"},
								]
							}],
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
							sections: [{
								id: 0x219,
								name: "B3F",
								refs: [
									{name: "Har Mirror", ref: "Pirate/Volcano Cave"},
									{name: "Volcano Cave - Har Mirror", ref: "GreatLog/Pirate"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.VolcanoB3F,
									x: 232,
									y: 488
								}
							]
						},
					],
					sections: [],
					map_locations: [
						{
							map: vars.MapNames.Pirate,
							x: 872,
							y: 504
						}
					]
				},
			],
			sections: [],
			map_locations: [
				{
					map: vars.MapNames.GreatLog,
					x: 146,
					y: 766
				}
			]
		}
	]

	return locs
}

function ice() {
	let locs: Location[] = [
		{
			name: "Ice",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [[vars.Items.IceKey], [/*vars.Settings.RandomizeKeysOff, */vars.Worlds.PirateDone]],
			children: [
				{
					name: "Ice North",
					children: [
						{
							name: "Norden",
							children: [
								{
									name: "Vase",
									sections: [{
										id: 0x301,
										refs: [
											{name: "Vase", ref: "Ice/Ice North/Norden"},
											{name: "Norden - Vase", ref: "GreatLog/Ice"},
										]
									}],
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
									access_rules: [[vars.Items.HarMirror, vars.Items.Crest]], // mirror needed to beat BombCrag
									sections: [{
										id: 0x300,
										name: "AgDevil",
										refs: [
											{name: "Boss Defeated", ref: "Ice/Ice North/Norden"},
											{name: "Norden - Boss Defeated", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.Norden,
											x: 72,
											y: 72
										}
									]
								},
							],
							sections: [],
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
									sections: [{
										id: 0x302,
										refs: [
											{name: "Chest", ref: "Ice/Ice North/Spirit's Spring"},
											{name: "Spirit's Spring - Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									access_rules: [[vars.Items.HarMirror, vars.Items.Crest, vars.Items.YunaSoul, vars.Items.SleepHerb]],
									sections: [{
										id: 0x303,
										name: "GoatHorn and the ArcDemons",
										refs: [
											{name: "Boss Defeated", ref: "Ice/Ice North/Spirit's Spring"},
											{name: "Spirit's Spring - Boss Defeated", ref: "GreatLog/Ice"},
										]
									}],
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
									access_rules: [[vars.Items.HarMirror, vars.Items.Crest, vars.Items.YunaSoul, vars.Items.SleepHerb]],
									sections: [{
										id: 0x304,
										refs: [
											{name: "Sky Shield", ref: "Ice/Ice North/Spirit's Spring"},
											{name: "Spirit's Spring - Sky Shield", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.Spirit,
											x: 72,
											y: 72
										}
									]
								},
							],
							sections: [],
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
							sections: [{
								id: 0x305,
								refs: [
									{name: "Chest", ref: "Ice/Gold Mine"},
									{name: "Gold Mine - Chest", ref: "GreatLog/Ice"},
								]
							}],
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
							sections: [{
								id: 0x306,
								name: "BombCrag",
								refs: [
									{name: "Boss Defeated", ref: "Ice/Gold Mine"},
									{name: "Gold Mine - Boss Defeated", ref: "GreatLog/Ice"},
								]
							}],
							map_locations: [
								{
									map: vars.MapNames.GoldMine,
									x: 232,
									y: 24
								}
							]
						},
					],
					sections: [],
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
					access_rules: [[vars.Items.Crest, vars.Items.HarMirror]],
					children: [
						{
							name: "Weston",
							children: [
								{
									name: "Barrel",
									sections: [{
										id: 0x307,
										refs: [
											{name: "Barrel", ref: "Ice/Ice South/Weston"},
											{name: "Weston - Barrel", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.Weston,
											x: 152,
											y: 232
										}
									]
								},
							],
							sections: [],
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
									sections: [{
										id: 0x308,
										name: "Puppetor",
										refs: [
											{name: "Boss Defeated", ref: "Ice/Ice South/Westania Castle"},
											{name: "Westania Castle - Boss Defeated", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.WestaniaCastle,
											x: 104,
											y: 200
										}
									]
								}
							],
							sections: [],
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
									sections: [{
										id: 0x309,
										refs: [
											{name: "Yuna's Soul", ref: "Ice/Ice South/Southern Forest"},
											{name: "Southern Forest - Yuna's Soul", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.SouthForest,
											x: 408,
											y: 504
										}
									]
								}
							],
							sections: [],
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
									sections: [{
										id: 0x30A,
										name: "GoatHorn",
										refs: [
											{name: "Boss Defeated", ref: "Ice/Ice South/Estria"},
											{name: "Estria - Boss Defeated", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.Estria,
											x: 552,
											y: 56
										}
									]
								}
							],
							sections: [],
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
									sections: [{
										id: 0x30B,
										refs: [
											{name: "Sleep Herb", ref: "Ice/Ice South/Eastern Mountain"},
											{name: "Eastern Mountain - Sleep Herb", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x30C,
										refs: [
											{name: "Chest", ref: "Ice/Ice South/Eastern Mountain"},
											{name: "Eastern Mountain - Chest", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.EastMountain,
											x: 280,
											y: 184
										}
									]
								},
							],
							sections: [],
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
							access_rules: [[vars.Items.TidalBell, vars.Items.SkyShield, vars.Worlds.IceDone]],
							children: [
								{
									name: "1F Right Chest",
									sections: [{
										id: 0x30D,
										refs: [
											{name: "1F Right Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 1F Right Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x30E,
										refs: [
											{name: "1F Left Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 1F Left Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x30F,
										refs: [
											{name: "2F Left Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 2F Left Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x310,
										refs: [
											{name: "2F Right Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 2F Right Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x311,
										refs: [
											{name: "4F Left Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 4F Left Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x312,
										refs: [
											{name: "4F Right Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 4F Right Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x313,
										refs: [
											{name: "5F Left Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 5F Left Chest", ref: "GreatLog/Ice"},
										]
									}],
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
									sections: [{
										id: 0x314,
										refs: [
											{name: "5F Right Chest", ref: "Ice/Ice South/Lake Tower"},
											{name: "Lake Tower - 5F Right Chest", ref: "GreatLog/Ice"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.LakeTower5,
											x: 104,
											y: 120
										}
									]
								},
							],
							sections: [],
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
			],
			sections: [],
			map_locations: [
				{
					map: vars.MapNames.GreatLog,
					x: 178,
					y: 766
				}
			]
		}
	]

	return locs
}

function sky() {
	let locs: Location[] = [
		{
			name: "Sky",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [[vars.Items.SkyKey], [/* vars.Settings.RandomizeKeysOff,  */vars.Worlds.IceDone]],
			children: [
				{
					name: "Shrine Island",
					children: [
						{
							name: "Fhunt",
							children: [
								{
									name: "Gravestone",
									sections: [{
										id: 0x400,
										refs: [
											{name: "Fhunt - Gravestone", ref: "Sky/Shrine Island/Fhunt"},
											{name: "Fhunt - Gravestone", ref: "GreatLog/Sky"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.Fhunt,
											x: 41,
											y: 361
										}
									]
								}
							],
							sections: [],
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
									sections: [{
										id: 0x401,
										refs: [
											{name: "Sage Tower - 1F Chest", ref: "Sky/Shrine Island/Fhunt"},
											{name: "Sage Tower - 1F Chest", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x402,
										refs: [
											{name: "Sage Tower - 4F Chest 1", ref: "Sky/Shrine Island/Fhunt"},
											{name: "Sage Tower - 4F Chest 1", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x403,
										refs: [
											{name: "Sage Tower - 4F Chest 2", ref: "Sky/Shrine Island/Fhunt"},
											{name: "Sage Tower - 4F Chest 2", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x404,
										refs: [
											{name: "Boss Defeated", ref: "Sky/Main Area/Mad Condor's Nest"},
											{name: "Mad Condor's Nest - Boss Defeated", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x405,
										refs: [
											{name: "Chest", ref: "Sky/Main Area/Mad Condor's Nest"},
											{name: "Mad Condor's Nest - Chest", ref: "GreatLog/Sky"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.CondorNest,
											x: 72,
											y: 24
										}
									]
								}
							],
							sections: [],
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
									sections: [{
										id: 0x406,
										refs: [
											{name: "East Chest", ref: "Sky/Main Area/Small Cave"},
											{name: "Small Cave - East Chest", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x408,
										name: "Metabble",
										refs: [
											{name: "Boss Defeated", ref: "Sky/Main Area/Small Cave"},
											{name: "Small Cave - Boss Defeated", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x407,
										refs: [
											{name: "West Chest", ref: "Sky/Main Area/Small Cave"},
											{name: "Small Cave - West Chest", ref: "GreatLog/Sky"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.SmallCave2,
											x: 104,
											y: 312
										}
									]
								},
							],
							sections: [],
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
									sections: [{
										id: 0x409,
										refs: [
											{name: "Chest", ref: "Sky/Main Area/Wind Tower"},
											{name: "Wind Tower - Chest", ref: "GreatLog/Sky"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.WindTower1,
											x: 248,
											y: 40
										}
									]
								},
							],
							sections: [],
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
									sections: [{
										id: 0x40A,
										name: "Niterich",
										refs: [
											{name: "Boss Defeated", ref: "Sky/Main Area/Graveyard"},
											{name: "Graveyard - Boss Defeated", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x40B,
										refs: [
											{name: "Chest", ref: "Sky/Main Area/Graveyard"},
											{name: "Graveyard - Chest", ref: "GreatLog/Sky"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.Graveyard3,
											x: 232,
											y: 40
										}
									]
								},
							],
							sections: [],
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
									sections: [{
										id: 0x40D,
										refs: [
											{name: "Vase", ref: "Sky/Main Area/Hitano"},
											{name: "Hitano - Vase", ref: "GreatLog/Sky"},
										]
									}],
									map_locations: [
										{
											map: vars.MapNames.Hitano,
											x: 120,
											y: 200
										}
									]
								},
							],
							sections: [],
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
									sections: [{
										id: 0x40E,
										refs: [
											{name: "1F Chest", ref: "Sky/Main Area/Demon Castle"},
											{name: "Demon Castle - 1F Chest", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x40F,
										refs: [
											{name: "B2F Chest", ref: "Sky/Main Area/Demon Castle"},
											{name: "Demon Castle - B2F Chest", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x410,
										refs: [
											{name: "B4F Chest", ref: "Sky/Main Area/Demon Castle"},
											{name: "Demon Castle - B4F Chest", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x411,
										refs: [
											{name: "B6F Chest", ref: "Sky/Main Area/Demon Castle"},
											{name: "Demon Castle - B6F Chest", ref: "GreatLog/Sky"},
										]
									}],
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
									sections: [{
										id: 0x412,
										name: "Mudou",
										refs: [
											{name: "Boss Defeated", ref: "Sky/Main Area/Demon Castle"},
											{name: "Demon Castle - Boss Defeated", ref: "GreatLog/Sky"},
										]
									}],
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
								// 	sections: [{
								// 		id: 0x413,
								// 		refs: [
								// 			{name: "Boss Gift", ref: "Sky/Main Area/Demon Castle"},
								// 			{name: "Demon Castle - Boss Gift", ref: "GreatLog/Sky"},
								// 		]
								// 	}],
								// 	map_locations: [
								// 		{
								// 			map: vars.MapNames.DemonCastle2,
								// 			x: 392,
								// 			y: 72
								// 		}
								// 	]
								// },
							],
							sections: [],
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
			],
			sections: [],
			map_locations: [
				{
					map: vars.MapNames.GreatLog,
					x: 211,
					y: 766
				}
			]
		}
	]

	return locs
}

function limbo() {
	let locs: Location[] = [
		{
			name: "Limbo",
			chest_unopened_img: "images/chest_closed.png",
			chest_opened_img: "images/chest_open.png",
			access_rules: [[vars.Items.LimboKey], [/* vars.Settings.RandomizeKeysOff,  */vars.Worlds.SkyDone]],
			children: [
				{
					name: "Boss Defeated",
					access_rules: [[vars.Items.TidalBell, vars.Items.HarMirror, vars.Items.SkyShield]],
					sections: [{
						id: 0x500,
						name: "Darck",
						refs: [
							{name: "Darck Defeated", ref: "GreatLog/Limbo"},
						]
					}],
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