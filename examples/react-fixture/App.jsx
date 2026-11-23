import React, { useState } from "react";
import { GlassProvider, GlassToolbar, GlassSurface, GlassButton, GlassSearch } from "@ios-liquid-glass/web/react";

const files = ["Handoff.md", "Layout-notes.txt", "Checklist.md"];

export function App() {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  return (
    <GlassProvider theme={dark ? "neutral-dark" : "neutral-light"}>
      <main>
        <h1>File index</h1>
        <GlassToolbar aria-label="File actions">
          <GlassSearch aria-label="Filter files" value={query} onChange={(event) => setQuery(event.target.value)} />
          <GlassButton onClick={() => setDark(!dark)}>Change theme</GlassButton>
        </GlassToolbar>
        <GlassSurface surfaceRole="content">
          <ul>
            {files.filter((file) => file.toLowerCase().includes(query.toLowerCase()))
              .map((file) => <li key={file}>{file}</li>)}
          </ul>
        </GlassSurface>
      </main>
    </GlassProvider>
  );
}
