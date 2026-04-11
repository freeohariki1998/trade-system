import { getCollection } from "./chroma";

export async function getLosingPatternCollection() {
    return await getCollection("losing_patterns");
}
