require("scripts.autotracking.item_mapping")
require("scripts.autotracking.location_mapping")

local CUR_INDEX = -1
local SLOT_DATA = {}
local WORLD_VERSION <const> = "20"
local IGNORE_VERSION = false
local ALL_LOCATIONS = {}
local IS_MANUAL_CLICK = true
local DEFAULT_SEED <const> = "default"
local ROOM_SEED = DEFAULT_SEED
local IsHighlightUpdate = false

function PreOnClear()
	PLAYER_ID = Archipelago.PlayerNumber or -1
	TEAM_NUMBER = Archipelago.TeamNumber or 0

	if Archipelago.PlayerNumber > -1 then
		if #ALL_LOCATIONS > 0 then
			ALL_LOCATIONS = {}
		end
		for _, value in pairs(Archipelago.MissingLocations) do
			table.insert(ALL_LOCATIONS, #ALL_LOCATIONS + 1, value)
		end

		for _, value in pairs(Archipelago.CheckedLocations) do
			table.insert(ALL_LOCATIONS, #ALL_LOCATIONS + 1, value)
		end
	end

	local manualStorageItem = Tracker:FindObjectForCode(ManualStorageCode).ItemState --[[@as ManualTrackerState]]
	local seedBase = (Archipelago.Seed or #ALL_LOCATIONS).."_"..Archipelago.TeamNumber.."_"..Archipelago.PlayerNumber
	if manualStorageItem and (ROOM_SEED == DEFAULT_SEED or ROOM_SEED ~= seedBase) then
		ROOM_SEED = seedBase
		if #manualStorageItem.ManualLocations > 10 then
			manualStorageItem.ManualLocations[manualStorageItem.ManualLocationsOrder[1]] = nil
			table.remove(manualStorageItem.ManualLocationsOrder, 1)
		end
		if manualStorageItem.ManualLocations[ROOM_SEED] == nil then
			manualStorageItem.ManualLocations[ROOM_SEED] = {locations = {}, items = {}}
			table.insert(manualStorageItem.ManualLocationsOrder, ROOM_SEED)
		end
	end
end

function OnClear(slot_data)
	print(string.format("called OnClear, slot_data:\n%s", DumpTable(slot_data)))

	SLOT_DATA = slot_data

	-- reset manual items
	for code, itemData in pairs(ManualItemFilter) do
		if itemData.reset then
			local obj = Tracker:FindObjectForCode(code) --[[@as JsonItem]]
			if obj then
				if itemData.type == "toggle" then
					obj.Active = false
				elseif itemData.type == "progressive" then
					obj.CurrentStage = 0
				elseif itemData.type == "consumable" then
					obj.AcquiredCount = 0
				end
			end
		end
	end

	IS_MANUAL_CLICK = false
	if Tracker:FindObjectForCode(ManualStorageCode) == nil then
		CreateLuaManualLocationStorage(ManualStorageCode)
	end
	local manualStorageItem = Tracker:FindObjectForCode(ManualStorageCode).ItemState --[[@as ManualTrackerState]]

	PreOnClear()

	CUR_INDEX = -1
	-- reset locations
	for _, location_array in pairs(LOCATION_MAPPING) do
		for _, location in pairs(location_array) do
			local obj = Tracker:FindObjectForCode(location)
			if obj then
				if location:sub(1, 1) == "@" then
					---@cast obj LocationSection
					if manualStorageItem and manualStorageItem.ManualLocations[ROOM_SEED] and manualStorageItem.ManualLocations[ROOM_SEED].locations[obj.FullID] then
						obj.AvailableChestCount = manualStorageItem.ManualLocations[ROOM_SEED].locations[obj.FullID]
					else
						obj.AvailableChestCount = obj.ChestCount
					end
				else
					---@cast obj JsonItem
					obj.Active = false
				end
			end
		end
	end
	-- reset items
	for _, itemData in pairs(ITEM_MAPPING) do
		if itemData[1] and itemData[2] then
			if AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
				print(string.format("onClear: clearing item %s of type %s", itemData[1], itemData[2]))
			end
			local item = Tracker:FindObjectForCode(itemData[1])
			if item then
				if itemData[2] == "toggle" then
					item.Active = false
				elseif itemData[2] == "progressive" or itemData[2] == "progressive_set" then
					item.CurrentStage = 0
				elseif itemData[2] == "consumable" then
					item.AcquiredCount = 0
				elseif AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
					print(string.format("onClear: unknown item type %s for code %s", itemData[2], itemData[1]))
				end
			elseif AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
				print(string.format("onClear: could not find object for code %s", itemData[1]))
			end
		end
	end

	if Archipelago.PlayerNumber > -1 then
		local slotInfo = TEAM_NUMBER.."_"..PLAYER_ID
		HintsID = "_read_hints_"..slotInfo
		DataStoreID = "DQM2_"..slotInfo
		ClientStatusID = "_read_client_status_"..slotInfo

		Archipelago:SetNotify({HintsID, DataStoreID, ClientStatusID})
		Archipelago:Get({HintsID, DataStoreID, ClientStatusID})
	end

	-- set manual items
	if manualStorageItem then
		for code, data in pairs(manualStorageItem.ManualLocations[ROOM_SEED].items) do
			local item = Tracker:FindObjectForCode(code) --[[@as JsonItem]]
			if data["type"] == "progressive" then
				item.CurrentStage = data["CurrentStage"]
			elseif data["type"] == "toggle" then
				item.Active = data["Active"]
			end
		end
	end

	-- auto tab and set the season for the starting location
	CurrentTab = nil

	IS_MANUAL_CLICK = true
end

-- called when an item gets collected
---@param index integer
---@param itemID integer
---@param itemName string
---@param playerNumber integer
function OnItem(index, itemID, itemName, playerNumber)
	if AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
		print(string.format("called onItem: %s, %s, %s, %s, %s", index, itemID, itemName, playerNumber, CUR_INDEX))
	end
	if not AUTOTRACKER_ENABLE_ITEM_TRACKING then
		return
	end
	if index <= CUR_INDEX then
		return
	end
	SetAsStale()
	CUR_INDEX = index
	local itemData = ITEM_MAPPING[itemID]
	if not itemData then
		if AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
			print(string.format("onItem: could not find item mapping for id %s", itemID))
		end
		return
	end
	if AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
		print(string.format("onItem: code: %s, type %s", itemData[1], itemData[2]))
	end
	if not itemData[1] then
		return
	end
	local item = Tracker:FindObjectForCode(itemData[1]) --[[@as JsonItem|LuaItem]]
	if item then
		if itemData[2] == "toggle" then
			item.Active = true
		elseif itemData[2] == "progressive" then
			local inc = 1
			if itemData[3] then
				inc = itemData[3]
			end
			item.CurrentStage = item.CurrentStage + inc
		elseif itemData[2] == "consumable" then
			local mult = 1
			if itemData[3] then
				mult = itemData[3]
			end
			item.AcquiredCount = item.AcquiredCount + (item.Increment * mult)
		elseif itemData[2] == "progressive_set" then
			if item.CurrentStage < itemData[3] then
				item.CurrentStage = itemData[3]
			end
		elseif AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
			print(string.format("onItem: unknown item type %s for code %s", itemData[2], itemData[1]))
		end
	elseif AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
		print(string.format("onItem: could not find object for code %s", itemData[1]))
	end
end

-- called when a location gets cleared
---@param locationID integer
---@param locationName string
function OnLocation(locationID, locationName)
	IS_MANUAL_CLICK = false
	SetAsStale()
	local location_array = LOCATION_MAPPING[locationID]
	if not location_array or not location_array[1] then
		print(string.format("onLocation: could not find location mapping for id %s", locationID))
		return
	end

	for _, location in pairs(location_array) do
		local obj = Tracker:FindObjectForCode(location)
		-- print(location, obj)
		if obj then
			if location:sub(1, 1) == "@" then
				---@cast obj LocationSection
				obj.AvailableChestCount = obj.AvailableChestCount - 1
			else
				---@cast obj JsonItem
				obj.Active = true
			end
			UpdateHints(locationID, Highlight.None)
		else
			print(string.format("onLocation: could not find object for code %s", location))
		end
	end

	IS_MANUAL_CLICK = true
end

function OnNotify(key, value, old_value)
	if AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
		print(string.format("called onNotify: %s, %s, %s", key, DumpTable(value), old_value))
	end

	if value == nil or value == old_value then
		return
	end

	if key == HintsID and Highlight then
		for _, hint in ipairs(value) do
			if hint.finding_player == Archipelago.PlayerNumber then
				UpdateHints(hint.location, PriorityToHighlight[hint.status])
			end
		end
	elseif key == DataStoreID then
		-- TODO figure out how this works for subsequent messages
		local mapID = value["Map ID"]
		local mapX = value["Map X"]
		local mapY = value["Map Y"]
		-- local playerX = value["Player X"]
		-- local playerY = value["Player Y"]

		-- TODO move these into a table or something
		local oasis = value["Desert World Complete"]
		local pirate = value["Pirate World Complete"]
		local ice = value["Ice World Complete"]
		local sky = value["Sky World Complete"]
		local limbo = value["Limbo World Complete"]
		local elf = value["Elf World Complete"]
		local lonely = value["Lonely World Complete"]
		local traveler = value["Traveler World Complete"]
		local brawn = value["Brawn World Complete"]
		local baffle = value["Baffle World Complete"]
		local soul = value["Soul World Complete"]
	elseif key == ClientStatusID then
		-- TODO clear goal location
	end
end

function OnNotifyLaunch(key, value)
	if AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
		print(string.format("called onNotifyLaunch: %s, %s", key, DumpTable(value)))
	end
	OnNotify(key, value)
end

-- called when a location is hinted or the status of a hint is changed
---@param locationID integer
---@param status highlight
function UpdateHints(locationID, status)
	if not Highlight then
		return
	end
	local locations = LOCATION_MAPPING[locationID]
	-- print("Hint", DumpTable(locations), status)
	for _, location in ipairs(locations) do
		local section = Tracker:FindObjectForCode(location) --[[@as LocationSection]]
		if section then
			IsHighlightUpdate = true
			section.Highlight = status
		else
			print(string.format("No object found for code: %s", location))
		end
	end
end

-- called when a bounce message is received 
function OnBounce(json)
	if AUTOTRACKER_ENABLE_DEBUG_LOGGING_AP then
		print(string.format("called onBounce: %s", DumpTable(json)))
	end
end

---@param location LocationSection
function ManualLocationHandler(location)
	if IsHighlightUpdate then
		IsHighlightUpdate = false
		return
	end
	if IS_MANUAL_CLICK then
		local manualStorageItem = Tracker:FindObjectForCode(ManualStorageCode).ItemState --[[@as ManualTrackerState]]

		if Archipelago.PlayerNumber == -1 and ROOM_SEED ~= DEFAULT_SEED then
			-- seed is from previous connection
			ROOM_SEED = DEFAULT_SEED
			manualStorageItem.ManualLocations[ROOM_SEED] = {locations = {}, items = {}}
		end
		local fullID = location.FullID
		if not manualStorageItem.ManualLocations[ROOM_SEED] then
			manualStorageItem.ManualLocations[ROOM_SEED] = {locations = {}, items = {}}
		end
		if location.AvailableChestCount < location.ChestCount then
			-- add to list
			manualStorageItem.ManualLocations[ROOM_SEED].locations[fullID] = location.AvailableChestCount
			location.Highlight = Highlight.None
		else
			-- remove from list of set back to max chest count
			manualStorageItem.ManualLocations[ROOM_SEED].locations[fullID] = nil
			-- re-grab hints since it was cleared earlier
			Archipelago:Get({HintsID})
		end
	end
end

---@param codes string
function ManualItemHandler(codes)
	local code = codes:split(", ")[1]
	if not ManualItemFilter[code] then return end

	local manualStorageItem = Tracker:FindObjectForCode(ManualStorageCode).ItemState --[[@as ManualTrackerState]]
	local item = Tracker:FindObjectForCode(code) --[[@as JsonItem]]
	if not manualStorageItem or not item then return end

	if ManualItemFilter[code].type == "progressive" then
		manualStorageItem.ManualLocations[ROOM_SEED].items[code] = {type = "progressive", CurrentStage = item.CurrentStage}
	elseif ManualItemFilter[code].type == "toggle" then
		manualStorageItem.ManualLocations[ROOM_SEED].items[code] = {type = "toggle", Active = item.Active}
	end
end

Archipelago:AddClearHandler("clear handler", OnClear)
if AUTOTRACKER_ENABLE_ITEM_TRACKING then
	Archipelago:AddItemHandler("item handler", OnItem)
end
if AUTOTRACKER_ENABLE_LOCATION_TRACKING then
	Archipelago:AddLocationHandler("location handler", OnLocation)
end
Archipelago:AddSetReplyHandler("notify handler", OnNotify)
Archipelago:AddRetrievedHandler("notify launch handler", OnNotifyLaunch)
-- Archipelago:AddBouncedHandler("bounce handler", OnBounce)

