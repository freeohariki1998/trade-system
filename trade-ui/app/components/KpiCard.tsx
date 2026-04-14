export function KpiCard({
    label,
    value,
    unit,
}: {
    label: string;
    value: string | number;
    unit?: string;
}) {
    return (
        <div className="p-4  shadow rounded border text-center">
            <div className="text-gray-500 text-sm">{label}</div>
            <div className="text-2xl font-bold">
                {value}
                {unit && <span className="text-lg ml-1">{unit}</span>}
            </div>
        </div>
    );
}
