import { FileCheck2 } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";

export function VersionRow({
  revision,
  date,
  current,
  isOldest,
  onOpen,
}: {
  revision: string;
  date: string;
  current?: boolean;
  isOldest?: boolean;
  onOpen?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-card p-2">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`size-2 rounded-full shrink-0 ${current ? "bg-primary" : isOldest ? "bg-amber-500" : "bg-border"
            }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground">{revision}</p>
            {current && <span className="text-[9.5px] font-bold text-primary">Current</span>}
            {isOldest && (
              <span className="text-[9.5px] font-bold text-amber-700 dark:text-amber-400">
                Oldest Baseline
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-muted-foreground mr-1">PDF</span>
        {onOpen && (
          <Button
            size="sm"
            variant={isOldest ? "default" : "outline"}
            onClick={onOpen}
            className={`h-6 gap-1 px-2 text-[10.5px] cursor-pointer ${isOldest ? "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" : ""
              }`}
          >
            <FileCheck2 className="size-3" /> {isOldest ? "Open Oldest" : "Open"}
          </Button>
        )}
      </div>
    </div>
  );
}
