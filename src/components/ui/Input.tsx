import { forwardRef } from "react";

const inputBaseClassName =
    "mt-1 block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", ...props }, ref) => (
        <input ref={ref} className={`${inputBaseClassName} ${className}`} {...props} />
    ),
);

Input.displayName = "Input";

export default Input;
export { inputBaseClassName };
