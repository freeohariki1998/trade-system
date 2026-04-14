export function parseAnalysis(text: string) {
    const sections: Record<string, string> = {};
    //  正規表現の枠 : / ... /g
    // (\d+) : \d は「数字」 \d+ は「数字が1文字以上」
    // \. : . を “ただのドット” として扱うために \.
    // \s* :  空白（スペース・改行・タブ）を 0 回以上
    // ([\s\S]+?) : [\s\S] は「空白 or 非空白」＝全ての文字 +? は最短一致
    // (?=\n\d+\.|$) : 次の「改行 + 数字 + .」の直前まで  または $（文末）まで
    const regex = /(\d+)\.\s*([\s\S]+?)(?=\n\d+\.|$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const index = match[1];
        const content = match[2].trim();
        sections[index] = content;
    }

    return sections;
}
