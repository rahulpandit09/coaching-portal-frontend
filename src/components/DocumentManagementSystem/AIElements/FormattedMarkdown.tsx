import React from "react";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, zero-dependency Markdown renderer tailored for Navi AI responses:
 * - ### Headings / ## Headings
 * - Bullet lists (- item or * item)
 * - Numbered lists (1. item)
 * - Bold text (**text**)
 * - Inline code (`code`)
 * - Blockquotes (> quote)
 * - Horizontal rules (---)
 */
export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type;
    const listIndex = renderedElements.length;
    renderedElements.push(
      <ListTag
        key={`list-${listIndex}`}
        className={`my-1.5 space-y-1 pl-4 text-xs ${
          currentList.type === "ul" ? "list-disc marker:text-[#1E6FBF]" : "list-decimal marker:text-[#1E6FBF]"
        }`}
      >
        {currentList.items.map((item, idx) => (
          <li key={idx} className="leading-5">
            {formatInlineText(item)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  const formatInlineText = (text: string): React.ReactNode => {
    // Match inline formatting: **bold**, `code`, etc.
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-blue-700"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    // Horizontal rule
    if (line === "---" || line === "***") {
      flushList();
      renderedElements.push(<hr key={index} className="my-2 border-slate-200" />);
      return;
    }

    // Heading 3: ### Title
    if (line.startsWith("### ")) {
      flushList();
      renderedElements.push(
        <h4 key={index} className="mt-2.5 mb-1 text-xs font-bold text-slate-900 tracking-tight">
          {formatInlineText(line.slice(4))}
        </h4>
      );
      return;
    }

    // Heading 2: ## Title
    if (line.startsWith("## ")) {
      flushList();
      renderedElements.push(
        <h3 key={index} className="mt-3 mb-1.5 text-sm font-bold text-slate-900">
          {formatInlineText(line.slice(3))}
        </h3>
      );
      return;
    }

    // Heading 1: # Title
    if (line.startsWith("# ")) {
      flushList();
      renderedElements.push(
        <h2 key={index} className="mt-3.5 mb-1.5 text-sm font-extrabold text-slate-900">
          {formatInlineText(line.slice(2))}
        </h2>
      );
      return;
    }

    // Blockquote: > text
    if (line.startsWith("> ")) {
      flushList();
      renderedElements.push(
        <blockquote
          key={index}
          className="my-1.5 border-l-2 border-[#1E6FBF] bg-blue-50/50 py-1 pl-2.5 text-[11px] italic text-slate-600"
        >
          {formatInlineText(line.slice(2))}
        </blockquote>
      );
      return;
    }

    // Bullet List Item: - item or * item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(line.slice(2));
      return;
    }

    // Numbered List Item: 1. item
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      return;
    }

    // Empty line
    if (!line) {
      flushList();
      return;
    }

    // Regular paragraph
    flushList();
    renderedElements.push(
      <p key={index} className="my-1 text-xs leading-5 text-slate-700">
        {formatInlineText(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-0.5 text-xs ${className}`}>{renderedElements}</div>;
}

export default FormattedMarkdown;
