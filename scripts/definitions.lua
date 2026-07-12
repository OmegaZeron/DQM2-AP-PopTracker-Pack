-- Items


-- Locations

StartLocation = Region.New("StartLocation")

-- Classes

---@class ManualItemFilter
---@field type string
---@field reset? boolean

-- Helpers

UpdateItem = "update_item"
ManualStorageCode = "manual_location_storage"
---@type table<string, ManualItemFilter>
ManualItemFilter = {}

---@type table<integer, string[]>
AutoTabData = {
	[3] = {"GreatLog"}, -- magic door
	[5] = {"GreatLog"}, -- warubou
	[6] = {"GreatLog"}, -- home
	[32] = {"Oasis", "Overworld"},
	[33] = {"Oasis", "Kalka"},
	[36] = {"Oasis", "Asiya"},
	[41] = {"Oasis", "Overworld"}, -- magic door
	[43] = {"Oasis", "Canal"},
	[48] = {"Pirate", "Overworld"},
	[49] = {"Pirate", "Yold"},
	[50] = {"Pirate", "Port Ritz"},
	[53] = {"Pirate", "West Cape Cave"},
	[54] = {"Pirate", "Ghost Ship"},
	[56] = {"Pirate", "Volcano Cave", "B1F"},
	[57] = {"Pirate", "Volcano Cave", "B2F"},
	[58] = {"Pirate", "Volcano Cave", "B3F"},
	[60] = {"Pirate", "Polona"},
	[62] = {"Pirate", "Lighthouse"},
	[69] = {"Pirate", "Overworld"}, -- magic door
	[72] = {"Ice", "Overworld"},
	[104] = {"Ice", "Overworld"}, -- magic door
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