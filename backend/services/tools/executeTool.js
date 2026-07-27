import { executeSearch } from "./searchTool.js";

export async function executeTool(
    step,
    context
){

    switch(step.type){

        case "search":

            return await executeSearch(
                step.query
            );

        case "reason":

            return "";

        case "respond":

            return "";

        default:

            return "";

    }

}