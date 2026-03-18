import Spinner from "./Spinner";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    type = "button",
    loading = false,
    disabled = false,
    fullWidth = true,
    className = "",
    ...props
}) => {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`
        group relative flex items-center justify-center
        ${fullWidth ? "w-full" : "w-auto"}
        rounded-md border border-transparent
        bg-blue-600 px-4 py-2
        text-sm font-medium text-white
        hover:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;