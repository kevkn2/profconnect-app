import { forwardRef } from "react";
import { inputBaseClassName } from "./Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = "", ...props }, ref) => (
        <textarea ref={ref} className={`${inputBaseClassName} ${className}`} {...props} />
    ),
);

Textarea.displayName = "Textarea";

export default Textarea;
