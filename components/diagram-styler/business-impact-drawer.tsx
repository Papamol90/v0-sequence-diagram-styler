"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { CustomParticipants, ParticipantInfo } from "./participant-editor"
import type { CustomTooltips } from "./tooltip-editor"

interface BusinessImpactDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedNode: {
    id: string
    type: "participant" | "message"
  } | null
  customParticipants: CustomParticipants
  customTooltips: CustomTooltips
  onParticipantUpdate: (name: string, info: ParticipantInfo) => void
  onTooltipUpdate: (id: string, tooltip: string) => void
}

export function BusinessImpactDrawer({ 
  isOpen, 
  onClose, 
  selectedNode,
  customParticipants,
  customTooltips,
  onParticipantUpdate,
  onTooltipUpdate
}: BusinessImpactDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<{
    description: string
    role: string
    notes: string
  }>({ description: "", role: "", notes: "" })

  if (!selectedNode) return null

  const isParticipant = selectedNode.type === "participant"
  const participantInfo = isParticipant ? customParticipants[selectedNode.id] : null
  const messageTooltip = !isParticipant ? customTooltips[selectedNode.id] : null

  const hasContent = isParticipant 
    ? (participantInfo?.description || participantInfo?.role || participantInfo?.notes)
    : !!messageTooltip

  const handleStartEdit = () => {
    if (isParticipant) {
      setEditForm({
        description: participantInfo?.description || "",
        role: participantInfo?.role || "",
        notes: participantInfo?.notes || "",
      })
    } else {
      setEditForm({
        description: messageTooltip || "",
        role: "",
        notes: "",
      })
    }
    setIsEditing(true)
  }

  const handleSave = () => {
    if (isParticipant) {
      onParticipantUpdate(selectedNode.id, {
        id: selectedNode.id,
        name: selectedNode.id,
        description: editForm.description,
        role: editForm.role,
        notes: editForm.notes,
      })
    } else {
      onTooltipUpdate(selectedNode.id, editForm.description)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({ description: "", role: "", notes: "" })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              {isParticipant ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg">{selectedNode.id}</SheetTitle>
              <SheetDescription className="text-sm">
                {isParticipant ? "Component / Participant" : "Message / Flow"}
              </SheetDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-2 bg-transparent">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="py-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              {isParticipant && (
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-foreground mb-1.5">
                    Role / Type
                  </label>
                  <input
                    id="edit-role"
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    placeholder="e.g., API Gateway, Database, Microservice..."
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-foreground mb-1.5">
                  {isParticipant ? "Description" : "Tooltip / Description"}
                </label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder={isParticipant 
                    ? "Describe what this component does..." 
                    : "Describe this message/flow step..."}
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              
              {isParticipant && (
                <div>
                  <label htmlFor="edit-notes" className="block text-sm font-medium text-foreground mb-1.5">
                    Notes / Technical Details
                  </label>
                  <textarea
                    id="edit-notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Any additional technical notes, considerations, or implementation details..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : hasContent ? (
            // View Mode with Content
            <div className="space-y-6">
              {isParticipant ? (
                <>
                  {participantInfo?.role && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Role / Type</h3>
                      <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 border border-border">
                        {participantInfo.role}
                      </p>
                    </div>
                  )}
                  
                  {participantInfo?.description && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                      <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 border border-border whitespace-pre-wrap">
                        {participantInfo.description}
                      </p>
                    </div>
                  )}
                  
                  {participantInfo?.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                      <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 border border-border whitespace-pre-wrap">
                        {participantInfo.notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 border border-border whitespace-pre-wrap">
                    {messageTooltip}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No details yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-[280px] mx-auto">
                Add a description and details for this {isParticipant ? "component" : "message"} to make your diagram more informative.
              </p>
              <Button onClick={handleStartEdit} className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Details
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
