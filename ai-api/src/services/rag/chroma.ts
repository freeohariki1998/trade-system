// src/services/rag/chroma.ts
import { ChromaClient, EmbeddingFunction } from "chromadb";
import { client } from "../../lib/openai";

const EMBEDDING_MODEL = "text-embedding-3-small" as const;

// テキスト→ベクトルに変換する関数
const openAiEmbedding: EmbeddingFunction = {
    name: `openai-${EMBEDDING_MODEL}`,
    async generate(texts: string[]) {
        const res = await client.embeddings.create({
            model: EMBEDDING_MODEL,
            input: texts,
        });
        const ordered = [...res.data].sort((a, b) => a.index - b.index);
        return ordered.map((d) => d.embedding);
    },
};

// Chroma(ベクトルDB)に接続
export const chroma = new ChromaClient();

// nameコレクションテーブルを作成 or 取得
// OpenAIのembeddingを使ってベクトル化する設定する
export async function getCollection(name: string) {
    return await chroma.getOrCreateCollection({
        name,
        embeddingFunction: openAiEmbedding,
    });
}


export async function resetCollection(name: string) {
    const collections = await chroma.listCollections();
    const exists = collections.some(c => c.name === name);

    if (exists) {
        await chroma.deleteCollection({ name });
    }
    return await getCollection(name);
}
