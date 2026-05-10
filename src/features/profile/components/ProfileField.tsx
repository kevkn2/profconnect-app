export interface ProfileFieldProps {
    label: string;
    value: string;
    className?: string;
}

export function ProfileField({ label, value, className = "" }: ProfileFieldProps) {
    return (
        <div className={className}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 break-words text-sm text-gray-900">{value || "—"}</dd>
        </div>
    );
}