import {
  Archive,
  BookOpen,
  Database,
  FileCheck2,
  FileText,
  Folder,
  type LucideIcon,
  LayoutList,
  MapPin,
  Rows3,
  ShieldCheck,
} from "lucide-react"

const FOLDER_AVAILABLE_ICONS = [
  { key: "Folder", label: "General Folder", icon: Folder },
  { key: "ShieldCheck", label: "Standards & Compliance", icon: ShieldCheck },
  { key: "Database", label: "Integrated System", icon: Database },
  { key: "FileText", label: "Policies & Docs", icon: FileText },
  { key: "Rows3", label: "Procedures & Flow", icon: Rows3 },
  { key: "BookOpen", label: "Manuals & Books", icon: BookOpen },
  { key: "MapPin", label: "Drawings & Route", icon: MapPin },
  { key: "LayoutList", label: "Schematics & P&ID", icon: LayoutList },
  { key: "FileCheck2", label: "Permits & Forms", icon: FileCheck2 },
  { key: "Archive", label: "Archive Records", icon: Archive },
]

const FOLDER_ICON_MAP: Record<string, LucideIcon> = {
  Folder,
  ShieldCheck,
  Database,
  FileText,
  Rows3,
  BookOpen,
  MapPin,
  LayoutList,
  FileCheck2,
  Archive,
}

const columns = [
  "Document no.",
  "Document title",
  "Department",
  "Location",
  "Revision",
  "Status",
  "Owner",
  "Updated",
]

function formatNow() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date())
    .replace(",", " ·")
}

export {
  FOLDER_AVAILABLE_ICONS,
  FOLDER_ICON_MAP,
  columns,
  formatNow,
}

