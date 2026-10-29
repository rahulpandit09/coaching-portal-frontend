import React from "react";
import { ChevronDown } from "lucide-react";

export function SelectWithOther({
  label,
  value,
  options,
  customValue,
  onChange,
  onCustomChange,
  placeholder = "Specify other value…",
  placeholderOption,
  required,
}: {
  label: string;
  value: string;
  options: string[];
  customValue: string;
  onChange: (val: string) => void;
  onCustomChange: (val: string) => void;
  placeholder?: string;
  placeholderOption?: string;
  required?: boolean;
}) {
  const isOther = value === "Other…" || value === "Other";

  return (
    <div className="min-w-0 space-y-1">
      <label className="block text-[11px] font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      <div className="relative mt-1 w-full min-w-0">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`dms-input h-9 w-full min-w-0 appearance-none truncate !pl-3 !pr-10 text-xs ${
            !value
              ? "font-normal text-muted-foreground"
              : "font-medium text-foreground"
          }`}
        >
          {placeholderOption && (
            <option value="">{placeholderOption}</option>
          )}

          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      {isOther && (
        <div className="animate-in slide-in-from-top-1 pt-1 duration-150 fade-in">
          <input
            type="text"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={placeholder}
            className="dms-input h-8 w-full min-w-0 border-primary/50 bg-primary/5 px-2.5 text-xs"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

export function Field({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="block min-w-0 text-xs font-medium">
      {label}

      <div className="relative mt-1 w-full min-w-0">
        <select
          defaultValue={value}
          className="dms-input h-9 w-full min-w-0 appearance-none truncate !pr-10 text-xs"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </label>
  );
}
