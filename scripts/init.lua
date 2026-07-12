require("scripts.utils")
require("scripts.generated_definitions")
require("scripts.definitions")
require("scripts.autotracking")
require("scripts.locations")

Tracker:AddItems("items/items.jsonc")

Tracker:AddItems("items/pack_settings.jsonc")
Tracker:AddMaps("maps/maps.jsonc")

Tracker:AddLayouts("layouts/item_grids.jsonc")
Tracker:AddLayouts("layouts/tracker_layouts.jsonc")
-- Tracker:AddLayouts("layouts/broadcast.jsonc")

require("scripts.autotracking.manual_override")
CreateLuaManualLocationStorage(ManualStorageCode)
ScriptHost:AddOnLocationSectionChangedHandler("manual location handler", ManualLocationHandler)
ScriptHost:AddWatchForCode("manual item handler", "*", ManualItemHandler)
