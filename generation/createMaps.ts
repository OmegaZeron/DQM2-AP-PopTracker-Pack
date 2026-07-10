import { vars, writeToFile } from "./utils.ts";

function img(path: string) {
	return `images/maps/${path}.png`
}
export default function createMaps() {
	let maps = [
		{
			name: vars.MapNames.GreatLog,
			location_size: 24,
			location_border_thickness: 2,
			img: img(vars.MapNames.GreatLog)
		},
		{
			name: vars.MapNames.Oasis,
			location_size: 26,
			location_border_thickness: 2,
			img: img(vars.MapNames.Oasis)
		},
		{
			name: vars.MapNames.Kalka,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.Kalka)
		},
		{
			name: vars.MapNames.Asiya,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.Asiya)
		},
		{
			name: vars.MapNames.Canal,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.Canal)
		},
		{
			name: vars.MapNames.Pirate,
			location_size: 32,
			location_border_thickness: 4,
			img: img(vars.MapNames.Pirate)
		},
		{
			name: vars.MapNames.Yold,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.Yold)
		},
		{
			name: vars.MapNames.Polona,
			location_size: 18,
			location_border_thickness: 2,
			img: img(vars.MapNames.Polona)
		},
		{
			name: vars.MapNames.PortRitz,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.PortRitz)
		},
		{
			name: vars.MapNames.WestCape,
			location_size: 16,
			location_border_thickness: 2,
			img: img(vars.MapNames.WestCape)
		},
		{
			name: vars.MapNames.GhostShip,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.GhostShip)
		},
		{
			name: vars.MapNames.Lighthouse,
			location_size: 22,
			location_border_thickness: 2,
			img: img(vars.MapNames.Lighthouse)
		},
		{
			name: vars.MapNames.VolcanoB1F,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.VolcanoB1F)
		},
		{
			name: vars.MapNames.VolcanoB2F,
			location_size: 16,
			location_border_thickness: 2,
			img: img(vars.MapNames.VolcanoB2F)
		},
		{
			name: vars.MapNames.VolcanoB3F,
			location_size: 16,
			location_border_thickness: 2,
			img: img(vars.MapNames.VolcanoB3F)
		},
		{
			name: vars.MapNames.Ice,
			location_size: 48,
			location_border_thickness: 4,
			img: img(vars.MapNames.Ice)
		},
		{
			name: vars.MapNames.Norden,
			location_size: 16,
			location_border_thickness: 1,
			img: img(vars.MapNames.Norden)
		},
		{
			name: vars.MapNames.GoldMine,
			location_size: 22,
			location_border_thickness: 2,
			img: img(vars.MapNames.GoldMine)
		},
		{
			name: vars.MapNames.Weston,
			location_size: 12,
			location_border_thickness: 1,
			img: img(vars.MapNames.Weston)
		},
		{
			name: vars.MapNames.WestaniaCastle,
			location_size: 12,
			location_border_thickness: 1,
			img: img(vars.MapNames.WestaniaCastle)
		},
		{
			name: vars.MapNames.SouthForest,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.SouthForest)
		},
		{
			name: vars.MapNames.Eastria,
			location_size: 16,
			location_border_thickness: 2,
			img: img(vars.MapNames.Eastria)
		},
		{
			// no point?
			name: vars.MapNames.Nofor,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.Nofor)
		},
		{
			name: vars.MapNames.EastMountain,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.EastMountain)
		},
		{
			name: vars.MapNames.LakeTower1,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.LakeTower1)
		},
		{
			name: vars.MapNames.LakeTower2,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.LakeTower2)
		},
		{
			name: vars.MapNames.LakeTower3,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.LakeTower3)
		},
		{
			name: vars.MapNames.LakeTower4,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.LakeTower4)
		},
		{
			name: vars.MapNames.LakeTower5,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.LakeTower5)
		},
		{
			name: vars.MapNames.Sky,
			location_size: 48,
			location_border_thickness: 4,
			img: img(vars.MapNames.Sky)
		},
		{
			name: vars.MapNames.Fhunt,
			location_size: 10,
			location_border_thickness: 1,
			img: img(vars.MapNames.Fhunt)
		},
		{
			name: vars.MapNames.SageTower,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.SageTower)
		},
		{
			name: vars.MapNames.CondorNest,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.CondorNest)
		},
		{
			name: vars.MapNames.SmallCave1,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.SmallCave1)
		},
		{
			name: vars.MapNames.SmallCave2,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.SmallCave2)
		},
		{
			name: vars.MapNames.WindTower1,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.WindTower1)
		},
		{
			name: vars.MapNames.WindTower2,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.WindTower2)
		},
		{
			name: vars.MapNames.WindTower3,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.WindTower3)
		},
		{
			name: vars.MapNames.WindTower4,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.WindTower4)
		},
		{
			name: vars.MapNames.Graveyard1,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.Graveyard1)
		},
		{
			name: vars.MapNames.Graveyard2,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.Graveyard2)
		},
		{
			name: vars.MapNames.Graveyard3,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.Graveyard3)
		},
		{
			name: vars.MapNames.Hitano,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.Hitano)
		},
		{
			name: vars.MapNames.DemonCastle1,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.DemonCastle1)
		},
		{
			name: vars.MapNames.DemonCastle2,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.DemonCastle2)
		},
		{
			name: vars.MapNames.Limbo,
			location_size: 14,
			location_border_thickness: 1,
			img: img(vars.MapNames.Limbo)
		},
	]

	writeToFile("maps/maps.jsonc", JSON.stringify(maps, null, "\t"))
}

// @ts-ignore
if (import.meta.main) {
	createMaps()
}