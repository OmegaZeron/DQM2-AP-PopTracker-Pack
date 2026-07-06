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
PriorityToHighlight = {
	[0] = Highlight.Unspecified,
	[10] = Highlight.NoPriority,
	[20] = Highlight.Avoid,
	[30] = Highlight.Priority,
	[40] = Highlight.None -- found
}