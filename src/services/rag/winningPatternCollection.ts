import { getCollection } from "./chroma";

export async function getWinningPatternCollection() {
    return await getCollection("winning_patterns");
}
