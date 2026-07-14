-- Classes

---@class ManualItemFilter
---@field type string
---@field reset? boolean

---@class AutoTabPosData
---@field mapName string
---@field zoom string
---@field x integer
---@field y integer

---@class AutoTabData
---@field tab string[]
---@field [string] AutoTabPosData

-- Helpers

UpdateItem = "update_item"
ManualStorageCode = "manual_location_storage"
---@type table<string, ManualItemFilter>
ManualItemFilter = {}

---@type table<integer, AutoTabData>
AutoTabData = {
	[3] = {tab = {"GreatLog"}}, -- magic door
	[5] = {tab = {"GreatLog"}}, -- warubou
	[6] = {tab = {"GreatLog"}}, -- home
	[32] = {tab = {"Oasis", "Overworld"}},
	[33] = {tab = {"Oasis", "Kalka"}},
	[36] = {tab = {"Oasis", "Asiya"}},
	[41] = {tab = {"Oasis", "Overworld"}}, -- magic door
	[43] = {tab = {"Oasis", "Canal"}},
	[48] = {tab = {"Pirate", "Overworld"}},
	[49] = {tab = {"Pirate", "Yold"}},
	[50] = {tab = {"Pirate", "Port Ritz"}},
	[53] = {tab = {"Pirate", "West Cape Cave"}},
	[54] = {tab = {"Pirate", "Ghost Ship"}},
	[56] = {tab = {"Pirate", "Volcano Cave", "B1F"}},
	[57] = {tab = {"Pirate", "Volcano Cave", "B2F"}},
	[58] = {tab = {"Pirate", "Volcano Cave", "B3F"}},
	[60] = {tab = {"Pirate", "Polona"}},
	[62] = {tab = {"Pirate", "Lighthouse"}},
	[69] = {tab = {"Pirate", "Overworld"}}, -- magic door
	[72] = {
		tab = {"Ice", "Overworld"},
		["11,4"] = {mapName = Ice, zoom = "2", x = 1444, y = 508}, -- magic door
		["7,1"] = {mapName = Ice, zoom = "2", x = 1164, y = 340}, -- ~norden
		["7,3"] = {mapName = Ice, zoom = "2", x = 1032, y = 618}, -- north tunnel
		["4,6"] = {mapName = Ice, zoom = "2", x = 728, y = 936}, -- gold mine
		["2,9"] = {mapName = Ice, zoom = "2", x = 772, y = 1180}, -- westania castle
		["4,8"] = {mapName = Ice, zoom = "2", x = 772, y = 1180}, -- weston
	},
	[74] = {tab = {"Ice", "Norden"}},
	-- [79] = {tab = {"Ice", "Nofor"}},
	[82] = {tab = {"Ice", "Gold Mine"}},
	[88] = {tab = {"Ice", "Weston"}},
	[90] = {tab = {"Ice", "Westania Castle"}},
	[93] = {tab = {"Ice", "Southern Forest"}},
	[94] = {tab = {"Ice", "Eastria"}},
	[98] = {tab = {"Ice", "Eastern Mountain"}},
	[99] = {tab = {"Ice", "Lake Tower", "1F"}},
	[100] = {tab = {"Ice", "Lake Tower", "2F"}},
	[101] = {tab = {"Ice", "Lake Tower", "3F"}},
	[102] = {tab = {"Ice", "Lake Tower", "4F"}},
	[103] = {tab = {"Ice", "Lake Tower", "5F"}},
	[104] = {tab = {"Ice", "Overworld"}}, -- magic door
	[112] = {tab = {"Sky", "Overworld"}},
	[113] = {tab = {"Sky", "Fhunt"}},
	[115] = {tab = {"Sky", "Sage Tower"}},
	-- [120] = {tab = {"Sky", "Pei"}},
	[122] = {tab = {"Sky", "Mad Condor's Nest"}},
	[124] = {tab = {"Sky", "Hitano"}},
	[129] = {tab = {"Sky", "Small Cave", "1F"}},
	[130] = {tab = {"Sky", "Small Cave", "1F"}},
	[131] = {tab = {"Sky", "Small Cave", "B1F"}},
	[133] = {tab = {"Sky", "Wind Tower", "1F"}},
	[134] = {tab = {"Sky", "Wind Tower", "2F"}},
	[135] = {tab = {"Sky", "Wind Tower", "3F"}},
	[136] = {tab = {"Sky", "Wind Tower", "4F"}},
	[138] = {tab = {"Sky", "Graveyard", "1F"}},
	[139] = {tab = {"Sky", "Graveyard", "1F"}},
	[140] = {tab = {"Sky", "Graveyard", "B1F"}},
	[141] = {tab = {"Sky", "Graveyard", "1F"}},
	[142] = {tab = {"Sky", "Graveyard", "Courtyard"}},
	[143] = {tab = {"Sky", "Graveyard", "B1F"}},
	[144] = {tab = {"Sky", "Graveyard", "B1F"}},
	[146] = {tab = {"Sky", "Overworld"}},
	[147] = {tab = {"Sky", "Demon Castle", "1F - B1F"}},
	[148] = {tab = {"Sky", "Demon Castle", "1F - B1F"}},
	[149] = {tab = {"Sky", "Demon Castle", "1F - B1F"}},
	[150] = {tab = {"Sky", "Demon Castle", "B2F - B7F"}},
	[157] = {tab = {"Sky", "Overworld"}}, -- magic door
	[160] = {tab = {"Limbo"}},
	[164] = {tab = {"Limbo"}}, -- magic door
}
---@type table<string, string>
CompletionData = {
	["Desert World Complete"] = OasisDone,
	["Pirate World Complete"] = PirateDone,
	["Ice World Complete"] = IceDone,
	["Sky World Complete"] = SkyDone,
	["Limbo World Complete"] = LimboDone,
	-- ["Elf World Complete"] = "",
	-- ["Lonely World Complete"] = "",
	-- ["Traveler World Complete"] = "",
	-- ["Brawn World Complete"] = "",
	-- ["Baffle World Complete"] = "",
	-- ["Soul World Complete"] = "",
}

PriorityToHighlight = {
	[0] = Highlight.Unspecified,
	[10] = Highlight.NoPriority,
	[20] = Highlight.Avoid,
	[30] = Highlight.Priority,
	[40] = Highlight.None -- found
}