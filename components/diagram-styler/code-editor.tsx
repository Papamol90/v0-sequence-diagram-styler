"use client"

import { useRef, useEffect } from "react"

export type SyntaxMode = "mermaid" | "plantuml"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  syntaxMode: SyntaxMode
  onSyntaxModeChange: (mode: SyntaxMode) => void
}

export function CodeEditor({ value, onChange, syntaxMode, onSyntaxModeChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const lines = value.split("\n")
  const lineCount = lines.length

  useEffect(() => {
    const textarea = textareaRef.current
    const lineNumbers = lineNumbersRef.current
    if (!textarea || !lineNumbers) return

    const syncScroll = () => {
      lineNumbers.scrollTop = textarea.scrollTop
    }

    textarea.addEventListener("scroll", syncScroll)
    return () => textarea.removeEventListener("scroll", syncScroll)
  }, [])

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      {/* Syntax Mode Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <span className="text-xs text-muted-foreground">Syntax:</span>
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted">
          <button
            type="button"
            onClick={() => onSyntaxModeChange("mermaid")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              syntaxMode === "mermaid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mermaid
          </button>
          <button
            type="button"
            onClick={() => onSyntaxModeChange("plantuml")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              syntaxMode === "plantuml"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            PlantUML
          </button>
        </div>
        {syntaxMode === "plantuml" && (
          <span className="text-xs text-primary">Auto-Convert</span>
        )}
        {syntaxMode === "mermaid" && <span className="w-16" />}
      </div>
      
      {/* Editor */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="flex flex-col py-4 px-3 bg-muted text-muted-foreground text-right font-mono text-sm select-none overflow-y-auto border-r border-border scrollbar-none"
          aria-hidden="true"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i + 1} className="leading-6 h-6 flex-shrink-0">
              {i + 1}
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-4 font-mono text-sm leading-6 bg-card text-foreground resize-none focus:outline-none placeholder:text-muted-foreground overflow-auto"
          spellCheck={false}
          placeholder={syntaxMode === "mermaid" 
            ? "Enter your Mermaid sequence diagram code..." 
            : "Enter your PlantUML sequence diagram code (will be auto-converted)..."}
          aria-label={`${syntaxMode === "mermaid" ? "Mermaid" : "PlantUML"} diagram code editor`}
        />
      </div>
    </div>
  )
}
