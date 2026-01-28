"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface MessageStep {
  id: string
  from: string
  to: string
  message: string
  isResponse: boolean
}

export interface CustomTooltips {
  [messageId: string]: string
}

interface TooltipEditorProps {
  messages: MessageStep[]
  customTooltips: CustomTooltips
  onTooltipsChange: (tooltips: CustomTooltips) => void
}

export function TooltipEditor({ messages, customTooltips, onTooltipsChange }: TooltipEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleStartEdit = (messageId: string) => {
    setEditingId(messageId)
    setEditValue(customTooltips[messageId] || "")
  }

  const handleSaveEdit = (messageId: string) => {
    if (editValue.trim()) {
      onTooltipsChange({
        ...customTooltips,
        [messageId]: editValue.trim()
      })
    } else {
      // Remove tooltip if empty
      const newTooltips = { ...customTooltips }
      delete newTooltips[messageId]
      onTooltipsChange(newTooltips)
    }
    setEditingId(null)
    setEditValue("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue("")
  }

  const handleClearAll = () => {
    onTooltipsChange({})
  }

  const tooltipCount = Object.keys(customTooltips).length

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Tooltips
          {tooltipCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {tooltipCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[450px] sm:w-[550px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Tooltip Editor</SheetTitle>
              <SheetDescription>
                Fuege benutzerdefinierte Beschreibungen zu den Animationsschritten hinzu
              </SheetDescription>
            </div>
            {tooltipCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-destructive hover:text-destructive">
                Alle loeschen
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Keine Messages im Diagramm gefunden.</p>
              <p className="text-xs mt-1">Fuege Messages im Code-Editor hinzu.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.isResponse ? "Antwort" : "Request"}
                      </span>
                    </div>
                    
                    {/* Message flow */}
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="font-medium text-foreground truncate">{msg.from}</span>
                      <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {msg.isResponse ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} strokeDasharray="4 2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        )}
                      </svg>
                      <span className="font-medium text-foreground truncate">{msg.to}</span>
                    </div>
                    
                    {/* Original message */}
                    <p className="text-xs text-muted-foreground mb-2 truncate" title={msg.message}>
                      {msg.message}
                    </p>

                    {/* Tooltip editing */}
                    {editingId === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Beschreibung fuer diesen Schritt eingeben..."
                          className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(msg.id)}>
                            Speichern
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        {customTooltips[msg.id] ? (
                          <div className="flex-1 p-2 rounded bg-primary/10 border border-primary/20">
                            <p className="text-sm text-foreground">{customTooltips[msg.id]}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            Kein Custom-Tooltip (Standard wird verwendet)
                          </p>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(msg.id)}
                          className="flex-shrink-0"
                        >
                          {customTooltips[msg.id] ? "Bearbeiten" : "Hinzufuegen"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {messages.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Tipp: Custom-Tooltips werden waehrend der Animation anstelle der automatisch generierten Beschreibungen angezeigt.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Helper function to parse messages from Mermaid code
export function parseMessagesFromMermaid(code: string): MessageStep[] {
  const lines = code.split('\n')
  const messages: MessageStep[] = []
  let index = 0
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Match message patterns like "Client->>API Gateway: POST /api/login"
    const messageMatch = trimmed.match(/^([\w\s]+)->>([^:]+):\s*(.+)$/)
    const responseMatch = trimmed.match(/^([\w\s]+)-->>([^:]+):\s*(.+)$/)
    
    if (messageMatch) {
      const [, from, to, message] = messageMatch
      messages.push({
        id: `msg-${index}`,
        from: from.trim(),
        to: to.trim(),
        message: message.trim(),
        isResponse: false
      })
      index++
    } else if (responseMatch) {
      const [, from, to, message] = responseMatch
      messages.push({
        id: `msg-${index}`,
        from: from.trim(),
        to: to.trim(),
        message: message.trim(),
        isResponse: true
      })
      index++
    }
  }
  
  return messages
}
