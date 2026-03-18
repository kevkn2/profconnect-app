export interface SpinnerProps {
    size?: number; // px
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
    size = 20,
    className = "",
}) => {
    return (
        <svg
            className={`animate-spin ${className}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
            />

            <path
                className="opacity-75"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
    );
};

export default Spinner;