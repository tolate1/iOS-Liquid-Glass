"use client";

import { useState } from "react";
import { GlassSearch, GlassToolbar } from "@ios-liquid-glass/web/react";

const files = ["Handoff.md", "Layout-notes.txt"];

export function FileFilter() {
  const [query, setQuery] = useState("");
  return (
    <>
      <GlassToolbar aria-label="File actions">
        <GlassSearch aria-label="Filter files" value={query} onChange={(event) => setQuery(event.target.value)} />
      </GlassToolbar>
      <ul>
        {files.filter((file) => file.toLowerCase().includes(query.toLowerCase())).map((file) => <li key={file}>{file}</li>)}
      </ul>
    </>
  );
}
