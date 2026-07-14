import { vars, writeToFile } from "./utils.ts"

export default function createLayouts() {
	createItemGrids()
	createTrackerLayouts()
}

function textItem(text: string, code: string) {
	return {
		type: "dock",
		content: [
			{dock: "top", type: "text", h_alignment: "center", text},
			{dock: "top", type: "itemgrid", item_size: 64, rows: [[code]]}
		]
	}
}

function createItemGrids() {
	let grids = {
		keys: {
			type: "itemgrid",
			h_alignment: "left",
			item_size: 48,
			rows: [
				[vars.Worlds.OasisDone, vars.Worlds.PirateDone, vars.Worlds.IceDone],
				[vars.Worlds.SkyDone, vars.Worlds.LimboDone]
			]
		},
		keyItems: {
			type: "itemgrid",
			item_size: 48,
			h_alignment: "left",
			rows: [
				[vars.Items.WaterCall, vars.Items.TidalBell, vars.Items.MoonRock],
				[vars.Items.HarMirror, vars.Items.Crest, vars.Items.YunaSoul],
				[vars.Items.SleepHerb, vars.Items.SkyShield, vars.Items.ChangeStaff],
				[vars.Items.HeavenSet], // change this to one consumable item?
				
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
			type: "array",
			orientation: "horizontal",
			content: [
				textItem("Goal", vars.Settings.GoalSetting),
				textItem("Character", vars.Settings.Character),
				textItem("Autotab", vars.Settings.AutoTab),
			]
		}	
	}

	writeToFile("layouts/item_grids.jsonc", JSON.stringify(grids, null, "\t").replace(/\n?^(?:\t+)?("\??(?:\w+)?",?)$\n?/gm, "$1").replace(/"\t+\]/g, `"]`).replace(/","/g, `", "`))
}

function createTrackerLayouts() {
	let layout = {
		tracker_default: {
			type: "dock",
			background: "#212121",
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
										{
											title: "Southern Forest",
											content: {
												type: "map",
												maps: [vars.MapNames.SouthForest]
											}
										},
										{
											title: "Estria",
											content: {
												type: "map",
												maps: [vars.MapNames.Estria]
											}
										},
										// {
										// 	title: "Nofor",
										// 	content: {
										// 		type: "map",
										// 		maps: [vars.MapNames.Nofor]
										// 	}
										// },
										{
											title: "Eastern Mountain",
											content: {
												type: "map",
												maps: [vars.MapNames.EastMountain]
											}
										},
										{
											title: "Lake Tower",
											content: {
												type: "tabbed",
												tabs: [
													{
														title: "1F",
														content: {
															type: "map",
															maps: [vars.MapNames.LakeTower1]
														}
													},
													{
														title: "2F",
														content: {
															type: "map",
															maps: [vars.MapNames.LakeTower2]
														}
													},
													{
														title: "3F",
														content: {
															type: "map",
															maps: [vars.MapNames.LakeTower3]
														}
													},
													{
														title: "4F",
														content: {
															type: "map",
															maps: [vars.MapNames.LakeTower4]
														}
													},
													{
														title: "5F",
														content: {
															type: "map",
															maps: [vars.MapNames.LakeTower5]
														}
													}
												]
											}
										},
									]
								}
							},
							{
								title: "Sky",
								content: {
									type: "tabbed",
									tabs: [
										{
											title: "Overworld",
											content: {
												type: "map",
												maps: [vars.MapNames.Sky]
											}
										},
										{
											title: "Fhunt",
											content: {
												type: "map",
												maps: [vars.MapNames.Fhunt]
											}
										},
										{
											title: "Sage Tower",
											content: {
												type: "map",
												maps: [vars.MapNames.SageTower]
											}
										},
										{
											title: "Mad Condor's Nest",
											content: {
												type: "map",
												maps: [vars.MapNames.CondorNest]
											}
										},
										{
											title: "Small Cave",
											content: {
												type: "tabbed",
												tabs: [
													{
														title: "1F",
														content: {
															type: "map",
															maps: [vars.MapNames.SmallCave1]
														}
													},
													{
														title: "B1F",
														content: {
															type: "map",
															maps: [vars.MapNames.SmallCave2]
														}
													}
												]
											}
										},
										{
											title: "Wind Tower",
											content: {
												type: "tabbed",
												tabs: [
													{
														title: "1F",
														content: {
															type: "map",
															maps: [vars.MapNames.WindTower1]
														}
													},
													{
														title: "2F",
														content: {
															type: "map",
															maps: [vars.MapNames.WindTower2]
														}
													},
													{
														title: "3F",
														content: {
															type: "map",
															maps: [vars.MapNames.WindTower3]
														}
													},
													{
														title: "4F",
														content: {
															type: "map",
															maps: [vars.MapNames.WindTower4]
														}
													}
												]
											}
										},
										{
											title: "Graveyard",
											content: {
												type: "tabbed",
												tabs: [
													{
														title: "1F",
														content: {
															type: "map",
															maps: [vars.MapNames.Graveyard1]
														}
													},
													{
														title: "B1F",
														content: {
															type: "map",
															maps: [vars.MapNames.Graveyard2]
														}
													},
													{
														title: "Courtyard",
														content: {
															type: "map",
															maps: [vars.MapNames.Graveyard3]
														}
													}
												]
											}
										},
										{
											title: "Hitano",
											content: {
												type: "map",
												maps: [vars.MapNames.Hitano]
											}
										},
										{
											title: "Demon Castle",
											content: {
												type: "tabbed",
												tabs: [
													{
														title: "1F - B1F",
														content: {
															type: "map",
															maps: [vars.MapNames.DemonCastle1]
														}
													},
													{
														title: "B2F - B7F",
														content: {
															type: "map",
															maps: [vars.MapNames.DemonCastle2]
														}
													}
												]
											}
										},
									]
								}
							},
							{
								title: "Limbo",
								content: {
									type: "map",
									maps: [vars.MapNames.Limbo]
								}
							},
						]
					}
				}
			]
		},
		tracker_broadcast: {
			type: "layout",
			key: "itemGrid",
			dock: "left"
		},
		settings_popup: {
			type: "container",
			background: "#212121",
			content: {
				type: "group",
				header: "Settings",
				content: {
					type: "layout",
					key: "settings"
				}
			}
		}
	}

	writeToFile("layouts/tracker_layouts.jsonc", JSON.stringify(layout, null, "\t").replace(/\n?^(?:\t+)?("\??(?:\w+)?",?)$\n?/gm, "$1").replace(/"\t+\]/g, `"]`).replace(/","/g, `", "`))
}

// @ts-ignore
if (import.meta.main) {
	createLayouts()
}