import { vars, writeToFile } from "./utils.ts"

export default function createLayouts() {
	createItemGrids()
	createTrackerLayouts()
}

function createItemGrids() {
	let grids = {
		keys: {
			type: "itemgrid",
			item_size: 48,
			rows: [
				[vars.Items.OasisKey, vars.Items.PirateKey, vars.Items.IceKey]
			]
		},
		keyItems: {
			type: "itemgrid",
			h_alignment: "left",
			rows: [
				[vars.Items.WaterCall, vars.Items.TidalBell, vars.Items.MoonRock],
				[vars.Items.HarMirror, vars.Items.Crest, vars.Items.YunaSoul],
				[vars.Items.SleepHerb, vars.Items.SkyShield]
			]
		},
		itemGrid: {
			type: "dock",
			dock: "left",
			content: [
				{
					type: "group",
					dock: "top",
					header: "Keys",
					content: {
						type: "layout",
						key: "keys"
					}
				},
				{
					type: "group",
					dock: "top",
					header: "Key Items",
					content: {
						type: "layout",
						key: "keyItems"
					}
				},
			]
		},
		settings: {
			type: "itemgrid",
			item_size: "160, 80",
			rows: [
				[vars.Settings.GameVersion, vars.Settings.Character]
			]
		}	
	}

	writeToFile("layouts/item_grids.jsonc", JSON.stringify(grids, null, "\t").replace(/\n?^(?:\t+)?("\??(?:\w+)?",?)$\n?/gm, "$1").replace(/"\t+\]/g, `"]`).replace(/","/g, `", "`))
}

function createTrackerLayouts() {
	let layout = {
		tracker_default: {
			type: "dock",
			content: [
				{
					type: "layout",
					key: "itemGrid",
					dock: "left"
				},
				{
					type: "group",
					v_alignment: "stretch",
					header: "Maps",
					content: {
						type: "tabbed",
						tabs: [
							{
								title: "GreatLog",
								content: {
									type: "map",
									maps: [vars.MapNames.GreatLog]
								}
							},
							{
								title: "Oasis",
								content: {
									type: "tabbed",
									tabs: [
										{
											title: "Overworld",
											content: {
												type: "map",
												maps: [vars.MapNames.Oasis]
											}
										},
										{
											title: "Kalka",
											content: {
												type: "map",
												maps: [vars.MapNames.Kalka]
											}
										},
										{
											title: "Asiya",
											content: {
												type: "map",
												maps: [vars.MapNames.Asiya]
											}
										},
										{
											title: "Canal",
											content: {
												type: "map",
												maps: [vars.MapNames.Canal]
											}
										},
									]
								}
							},
							{
								title: "Pirate",
								content: {
									type: "tabbed",
									tabs: [
										{
											title: "Overworld",
											content: {
												type: "map",
												maps: [vars.MapNames.Pirate]
											}
										},
										{
											title: "Yold",
											content: {
												type: "map",
												maps: [vars.MapNames.Yold]
											}
										},
										{
											title: "Polona",
											content: {
												type: "map",
												maps: [vars.MapNames.Polona]
											}
										},
										{
											title: "Port Ritz",
											content: {
												type: "map",
												maps: [vars.MapNames.PortRitz]
											}
										},
										{
											title: "West Cape Cave",
											content: {
												type: "map",
												maps: [vars.MapNames.WestCape]
											}
										},
										{
											title: "Ghost Ship",
											content: {
												type: "map",
												maps: [vars.MapNames.GhostShip]
											}
										},
										{
											title: "Lighthouse",
											content: {
												type: "map",
												maps: [vars.MapNames.Lighthouse]
											}
										},
										{
											title: "Volcano Cave",
											content: {
												type: "tabbed",
												tabs: [
													{
														title: "B1F",
														content: {
															type: "map",
															maps: [vars.MapNames.VolcanoB1F]
														}
													},
													{
														title: "B2F",
														content: {
															type: "map",
															maps: [vars.MapNames.VolcanoB2F]
														}
													},
													{
														title: "B3F",
														content: {
															type: "map",
															maps: [vars.MapNames.VolcanoB3F]
														}
													}
												]
											}
										}
									]
								}
							},
							{
								title: "Ice",
								content: {
									type: "tabbed",
									tabs: [
										{
											title: "Overworld",
											content: {
												type: "map",
												maps: [vars.MapNames.Ice]
											}
										},
										{
											title: "Norden",
											content: {
												type: "map",
												maps: [vars.MapNames.Norden]
											}
										},
										{
											title: "Gold Mine",
											content: {
												type: "map",
												maps: [vars.MapNames.GoldMine]
											}
										},
										{
											title: "Weston",
											content: {
												type: "map",
												maps: [vars.MapNames.Weston]
											}
										},
										{
											title: "Westania Castle",
											content: {
												type: "map",
												maps: [vars.MapNames.WestaniaCastle]
											}
										},
										// {
										// 	title: "Southern Forest",
										// 	content: {
										// 		type: "map",
										// 		maps: [vars.MapNames.SouthForest]
										// 	}
										// },
										{
											title: "Eastria",
											content: {
												type: "map",
												maps: [vars.MapNames.Eastria]
											}
										},
										// {
										// 	title: "Nofor",
										// 	content: {
										// 		type: "map",
										// 		maps: [vars.MapNames.Nofor]
										// 	}
										// },
										// {
										// 	title: "Eastern Mountain",
										// 	content: {
										// 		type: "map",
										// 		maps: [vars.MapNames.EastMountain]
										// 	}
										// },
									]
								}
							},
						]
					}
				}
			]
		},
		settings_popup: {
			type: "container",
			background: "#212121",
			content: {
				type: "dock",
				content: [
					{
						type: "group",
						header: "settings",
						content: {
							type: "layout",
							key: "settings"
						}	
					}
				]
			}
		}
	}

	writeToFile("layouts/tracker_layouts.jsonc", JSON.stringify(layout, null, "\t").replace(/\n?^(?:\t+)?("\??(?:\w+)?",?)$\n?/gm, "$1").replace(/"\t+\]/g, `"]`).replace(/","/g, `", "`))
}

// @ts-ignore
if (import.meta.main) {
	createLayouts()
}