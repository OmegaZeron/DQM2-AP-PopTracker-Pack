import { writeToFile, varDefinitions } from "./utils.ts"

export default function createVars() {
	let output = ""
	for (let [itemType, list] of Object.entries(varDefinitions)) {
		output += `-- ${itemType}\n\n`
		for (let [name, val] of Object.entries(list)) {
			output += `${name} = "${val}"\n`
		}
		output += "\n"
	}
	writeToFile("scripts/generated_definitions.lua", output)
}

// @ts-ignore
if (import.meta.main) {
	createVars()
}