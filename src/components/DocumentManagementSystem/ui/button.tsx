import * as React from "react";
import { cn } from "@/utils/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap gap-1.5 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FBF]/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variants = {
      default:
        "bg-[#1E6FBF] text-white border border-[#1E6FBF] hover:bg-[#185D9E] hover:border-[#185D9E]",

      destructive:
        "bg-[#DC3545] text-white border border-[#DC3545] hover:bg-[#BB2D3B] hover:border-[#BB2D3B]",

      outline:
        "border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#94A3B8] hover:text-[#1E6FBF]",

      secondary:
        "border border-[#E2E8F0] bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0]",

      ghost:
        "border border-transparent bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B]",

      link:
        "border border-transparent bg-transparent p-0 text-[#1E6FBF] underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-9 px-3.5 text-xs",
      sm: "h-8 px-3 text-[11px]",
      lg: "h-10 px-5 text-sm",
      icon: "size-8 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };