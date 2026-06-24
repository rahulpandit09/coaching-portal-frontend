import * as LucideIcons from "lucide-react"
import { HelpCircle, LucideProps } from "lucide-react"
import React from "react"

export const getIconComponent = (iconName?: string) => {
  if (!iconName) return HelpCircle

  // Convert e.g. "file-text" → "FileText"
  const formattedName = iconName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")

  const Icon =
    (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[
      formattedName
    ]

  return Icon || HelpCircle
}
