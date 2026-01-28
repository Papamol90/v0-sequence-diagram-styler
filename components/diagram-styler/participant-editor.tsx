"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

export interface ParticipantInfo {
  id: string
  name: string
  description: string
  role: string
  notes: string
}

export type CustomParticipants = Record<string, ParticipantInfo>

interface ParticipantEditorProps {
  participants: string[]
  customParticipants: CustomParticipants
  onParticipantsChange: (participants: CustomParticipants) => void
}

export function parseParticipantsFromMermaid(code: string): string[] {
  const participants: string[] = []
  const lines = code.split('\n')
  const seenParticipants = new Set<string>()
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Match explicit participant declarations
    const participantMatch = trimmed.match(/^participant\s+(.+?)(?:\s+as\s+.+)?$/)
    const actorMatch = trimmed.match(/^actor\s+(.+?)(?:\s+as\s+.+)?$/)
    
    if (participantMatch) {
      const name = participantMatch[1].trim()
      if (!seenParticipants.has(name)) {
        seenParticipants.add(name)
        participants.push(name)
      }
    } else if (actorMatch) {
      const name = actorMatch[1].trim()
      if (!seenParticipants.has(name)) {
        seenParticipants.add(name)
        participants.push(name)
      }
    }
    
    // Also extract participants from message patterns
    const messageMatch = trimmed.match(/^(.+?)\s*(->>|-->>|->|-->)\s*(.+?):\s*(.+)$/)
    if (messageMatch) {
      const [, from, , to] = messageMatch
      const fromName = from.trim()
      const toName = to.trim()
      
      if (!seenParticipants.has(fromName)) {
        seenParticipants.add(fromName)
        participants.push(fromName)
      }
      if (!seenParticipants.has(toName)) {
        seenParticipants.add(toName)
        participants.push(toName)
      }
    }
  }
  
  return participants
}

export function ParticipantEditor({ participants, customParticipants, onParticipantsChange }: ParticipantEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ParticipantInfo>>({})

  const configuredCount = Object.keys(customParticipants).filter(
    key => customParticipants[key]?.description || customParticipants[key]?.role || customParticipants[key]?.notes
  ).length

  const handleEditClick = (participantName: string) => {
    const existing = customParticipants[participantName]
    setEditingParticipant(participantName)
    setEditForm({
      description: existing?.description || "",
      role: existing?.role || "",
      notes: existing?.notes || "",
    })
  }

  const handleSaveEdit = () => {
    if (!editingParticipant) return
    
    onParticipantsChange({
      ...customParticipants,
      [editingParticipant]: {
        id: editingParticipant,
        name: editingParticipant,
        description: editForm.description || "",
        role: editForm.role || "",
        notes: editForm.notes || "",
      }
    })
    setEditingParticipant(null)
    setEditForm({})
  }

  const handleClearParticipant = (participantName: string) => {
    const newParticipants = { ...customParticipants }
    delete newParticipants[participantName]
    onParticipantsChange(newParticipants)
  }

  const handleClearAll = () => {
    onParticipantsChange({})
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-transparent"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
        </svg>
        Components
        {configuredCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
            {configuredCount}
          </span>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
              Component Details
            </SheetTitle>
            <SheetDescription>
              Add descriptions and details for each participant/component in your diagram.
            </SheetDescription>
          </SheetHeader>

          <div className="py-4 space-y-4">
            {/* Header with Clear All */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {participants.length} components found
              </p>
              {configuredCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs">
                  Clear All
                </Button>
              )}
            </div>

            {/* Participant List or Edit Form */}
            {editingParticipant ? (
              <div className="space-y-4 p-4 rounded-lg border border-primary bg-primary/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{editingParticipant}</h4>
                  <Button variant="ghost" size="sm" onClick={() => setEditingParticipant(null)}>
                    Cancel
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="edit-role" className="block text-xs font-medium text-muted-foreground mb-1">
                      Role / Type
                    </label>
                    <input
                      id="edit-role"
                      type="text"
                      value={editForm.role || ""}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      placeholder="e.g., API Gateway, Database, Service..."
                      className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-xs font-medium text-muted-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="What does this component do?"
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-notes" className="block text-xs font-medium text-muted-foreground mb-1">
                      Notes / Additional Info
                    </label>
                    <textarea
                      id="edit-notes"
                      value={editForm.notes || ""}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Any additional notes, considerations, or technical details..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingParticipant(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No participants found in the diagram. Add a sequence diagram to see components here.
                  </p>
                ) : (
                  participants.map((participant) => {
                    const info = customParticipants[participant]
                    const hasInfo = info?.description || info?.role || info?.notes
                    
                    return (
                      <div
                        key={participant}
                        className={`p-3 rounded-lg border transition-colors ${
                          hasInfo
                            ? "border-primary/50 bg-primary/5"
                            : "border-border bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground truncate">
                                {participant}
                              </h4>
                              {hasInfo && (
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            {info?.role && (
                              <p className="text-xs text-primary mt-0.5">{info.role}</p>
                            )}
                            {info?.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {info.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(participant)}
                              className="h-8 w-8 p-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="sr-only">Edit</span>
                            </Button>
                            {hasInfo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClearParticipant(participant)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="sr-only">Clear</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
