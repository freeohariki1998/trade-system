const BASE_URL = "http://localhost:3001";

export async function chat(message: string) {
    const data = await post("/api/chat", { message });
    return data.content;
}
export async function ask(question: string) {
    const data = await post("/api/ask", { question });
    return data.answer;
}
export async function uploadPdf(file: File) {
    return postFile("/api/summarize-pdf", file)
}
export async function generateWinningPatterns() {
    return post("/api/rag/generate-winning-patterns", {});
}

export async function generateLosingPatterns() {
    return post("/api/rag/generate-losing-patterns", {});
}
export async function analyzeTrades() {
    return post("/api/analyze", {});
}
export async function fetchTrades() {
    return get("/api/list");
}

async function post(path: string, body: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`)
    }
    return res.json();
}

async function get(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
}


async function postFile(path: string, file: File) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        body: form
    });
    if (!res.ok) {
        throw new Error("PDF upload failed")
    }
    return res.json();
}