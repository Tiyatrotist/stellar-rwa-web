"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  /** Optional visible label; when omitted only the icon shows. */
  label?: string;
  className?: string;
}

/** True when the modern async Clipboard API is usable (HTTPS/localhost only). */
function canUseClipboardApi(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.writeText &&
    typeof window !== "undefined" &&
    window.isSecureContext !== false
  );
}

/**
 * Legacy fallback for insecure contexts / browsers without the Clipboard
 * API: select an off-screen textarea's contents and use execCommand. Both
 * are deprecated but remain the only synchronous copy path available.
 */
function legacyCopy(value: string): boolean {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

type CopyStatus = "idle" | "copied" | "failed";

/** Copies `value` to the clipboard and briefly confirms, with a fallback path. */
export function CopyButton({ value, label, className = "" }: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function copy() {
    let ok = false;
    try {
      if (canUseClipboardApi()) {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else {
        ok = legacyCopy(value);
      }
    } catch {
      ok = legacyCopy(value);
    }
    setStatus(ok ? "copied" : "failed");
    setTimeout(() => setStatus("idle"), 1400);
  }

  const copied = status === "copied";
  const failed = status === "failed";
  const copyTarget = label ?? value;
  const title = copied ? "Copied" : failed ? "Copy failed — select and copy manually" : "Copy";

  return (
    <button
      type="button"
      onClick={copy}
      title={title}
      aria-label={
        copied ? `${copyTarget} copied` : failed ? `Copy ${copyTarget} failed` : `Copy ${copyTarget}`
      }
      className={`inline-flex items-center gap-1.5 transition-colors ${
        failed ? "text-red-400/70" : "text-base-100/50 hover:text-brand-400"
      } ${className}`}
    >
      {copied ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : failed ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
      {label && (
        <span className="text-xs font-medium">
          {copied ? "Copied" : failed ? "Failed" : label}
        </span>
      )}
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? `${copyTarget} copied` : failed ? `Failed to copy ${copyTarget}` : ""}
      </span>
    </button>
  );
}
