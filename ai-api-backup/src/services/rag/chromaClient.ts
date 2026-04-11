import { getCollection } from "./chroma";

export async function getTradeCollection() {
    return await getCollection("trades");
}
