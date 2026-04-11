import "dotenv/config"; //環境変数の読み込みショートカット
import express from "express";
import chatRouter from "./routes/chat";
import summarizePdfRouter from "./routes/summarizePdf";
import askRouter from "./routes/ask";
import analyzeRouter from "./routes//trades/analyze";
import ragUpsert from "./routes/rag/upsert";
import ragSearch from "./routes/rag/search";
import generateWinningPatterns from "./routes/rag/generateWinningPatterns";
import generateLosingPatterns from "./routes/rag/generateLosingPatterns";

const app = express();
app.use(express.json());
app.use("/api/chat", chatRouter);
app.use("/api/summarize-pdf", summarizePdfRouter);
app.use("/api/ask", askRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/rag/upsert", ragUpsert);
app.use("/api/rag/search", ragSearch);
app.use("/api/rag/generate-winning-patterns", generateWinningPatterns);
app.use("/api/rag/generate-losing-patterns", generateLosingPatterns);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
