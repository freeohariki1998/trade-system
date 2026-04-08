import "dotenv/config"; //環境変数の読み込みショートカット
import express from "express";
import chatRouter from "./routes/chat";
import summarizePdfRouter from "./routes/summarizePdf";

const app = express();
app.use(express.json());
app.use("/api/chat", chatRouter);
app.use("/api/summarize-pdf", summarizePdfRouter);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
