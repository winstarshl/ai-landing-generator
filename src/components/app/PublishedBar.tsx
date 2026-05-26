"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Plus, Wand } from "lucide-react";

export function PublishedBar() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable; no-op */
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-900/90 text-white backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-2.5">
        <span className="flex items-center gap-1.5 text-xs text-zinc-300">
          <Wand className="h-3.5 w-3.5" /> Made with LandingForge
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" /> New page
          </Link>
        </div>
      </div>
    </div>
  );
}
