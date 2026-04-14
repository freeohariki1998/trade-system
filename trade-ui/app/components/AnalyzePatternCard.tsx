import PatternCard, { Pattern } from "./PatternCard";

export function AnalyzePatternCard({
    pattern,
    type,
}: {
    pattern: Pattern;
    type: "win" | "lose";
}) {
    return (
        <PatternCard
            title={type === "win" ? "勝ちパターン" : "負けパターン"}
            pattern={pattern}
        />
    );
}
