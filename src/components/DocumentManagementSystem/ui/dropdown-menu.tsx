import * as React from "react";
import { cn } from "@/utils/utils";

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextType>({
  open: false,
  setOpen: () => {},
});

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left" ref={ref}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}> = ({ children, asChild, className }) => {
  const { setOpen } = React.useContext(DropdownContext);

  const handleTriggerClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
      onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
      className?: string;
    }>;

    return React.cloneElement(child, {
      onPointerDown: (e: any) => {
        e.stopPropagation();
        child.props.onPointerDown?.(e);
      },
      onClick: (e: any) => {
        e.stopPropagation();
        child.props.onClick?.(e);
        setOpen((prev) => !prev);
      },
      className: cn(child.props.className, className),
    });
  }

  return (
    <button
      type="button"
      onClick={handleTriggerClick}
      className={cn(
        "inline-flex items-center cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<{
  children: React.ReactNode;
  align?: "left" | "right" | "start" | "end" | "center";
  sideOffset?: number;
  className?: string;
}> = ({
  children,
  align = "right",
  sideOffset = 4,
  className,
}) => {
  const { open } = React.useContext(DropdownContext);

  if (!open) return null;

  const alignClass =
    align === "end" || align === "right"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";

  return (
    <div
      className={cn(
        "absolute z-[9999] min-w-[9rem] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-slate-950 shadow-lg animate-in fade-in-80",
        alignClass,
        className
      )}
      style={{
        marginTop: `${sideOffset}px`,
      }}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className, disabled }) => {
  const { setOpen } = React.useContext(DropdownContext);
  return (
    <div
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
        setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800", className)} />
);
