const BASE_URL = "http://localhost:3001";

export async function chat(message: string) {
    return post("/api/chat", { message });
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

    const data = await res.json();
    return data.content as string;
}