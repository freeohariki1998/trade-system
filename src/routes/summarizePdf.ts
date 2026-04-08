import { Router } from "express";
import { client } from "../lib/openai";
import fs from "fs";
import multer from "multer"
import { PDFParse } from "pdf-parse";
const router = Router();
const upload = multer({ dest: "uploads/" }); // 一時保存先
// AIを呼び出すAPI
// 参考サイト:https://developers.openai.com/api/docs/guides/text
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const file =  req.file?.path;
        if (!file) {
            return res.status(400).json({ error: "アップロードするファイルがない" });
        }

        // PDF → テキスト抽出
        const dataBuffer = fs.readFileSync(file);
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        const text = pdfData.text;

        // テキスト → 分解
        const  chunks = chunkText(text);
        
        // 分解したテキストを要約して格納
        const summaries = [];

        for (const chunk of chunks){
            const summary = await client.responses.create({
                model: "gpt-4.1-mini",
                input: `次のテキストを要約してください:\n${chunk}`
            })
            summaries.push(summary.output_text);
        }
        // すべての要約をまとめて最終要約
        const finalSummary = await client.responses.create({
            model: "gpt-4.1-mini",
            input: `以下は PDF の各部分の要約です。これらを統合して、全体の要約を作ってください。\n${summaries.join("\n")}`
          });

        // fileupload処理
        // const uploaded = await client.files.create({
        //     file: fs.createReadStream(file),
        //     purpose: "user_data",
        // });
        // res.json({ fileId: uploaded.id });
        res.json({ content: finalSummary.output_text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "何かしらのエラーが発生" });
    }
});


// テキストを指定のサイズに分解する
const chunkText = (text: string, size = 1000) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += size){
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

export default router;
