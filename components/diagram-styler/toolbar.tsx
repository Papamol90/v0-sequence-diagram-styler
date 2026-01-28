"use client"

import { Button } from "@/components/ui/button"
import { ColorDesigner, type ColorTheme } from "./color-designer"
import { TooltipEditor, type MessageStep, type CustomTooltips } from "./tooltip-editor"
import { ParticipantEditor, type CustomParticipants } from "./participant-editor"
import { SaveLoadMenu } from "./save-load-menu"
import type { SaveData } from "@/lib/save-load"

interface ToolbarProps {
  isPresentationMode: boolean
  onTogglePresentationMode: () => void
  onReset: () => void
  isPlaying: boolean
  isPaused: boolean
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  speed: number
  onSpeedChange: (speed: number) => void
  colorTheme: ColorTheme
  onColorThemeChange: (theme: ColorTheme) => void
  messages: MessageStep[]
  customTooltips: CustomTooltips
  onCustomTooltipsChange: (tooltips: CustomTooltips) => void
  participants: string[]
  customParticipants: CustomParticipants
  onCustomParticipantsChange: (participants: CustomParticipants) => void
  saveData: SaveData
  onLoadData: (data: SaveData) => void
}

export function Toolbar({ isPresentationMode, onTogglePresentationMode, onReset, isPlaying, isPaused, onPlay, onPause, onStop, speed, onSpeedChange, colorTheme, onColorThemeChange, messages, customTooltips, onCustomTooltipsChange, participants, customParticipants, onCustomParticipantsChange, saveData, onLoadData }: ToolbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
          <svg
            className="w-5 h-5 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 blur-md -z-10" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Sequence Diagram Styler
          </h1>
          <p className="text-xs text-muted-foreground">
            Interactive Mermaid.js visualizer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Speed Control */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <button
            type="button"
            onClick={() => onSpeedChange(Math.max(0.25, Math.round((speed - 0.25) * 100) / 100))}
            className="w-6 h-6 flex items-center justify-center rounded bg-background hover:bg-accent text-foreground text-sm font-medium"
            aria-label="Decrease speed"
          >
            -
          </button>
          <span className="text-sm font-medium text-foreground w-12 text-center">{speed.toFixed(2).replace(/\.?0+$/, '')}x</span>
          <button
            type="button"
            onClick={() => onSpeedChange(Math.min(3, Math.round((speed + 0.25) * 100) / 100))}
            className="w-6 h-6 flex items-center justify-center rounded bg-background hover:bg-accent text-foreground text-sm font-medium"
            aria-label="Increase speed"
          >
            +
          </button>
        </div>

        {/* Play/Pause/Stop Controls */}
        {!isPlaying ? (
          <Button
            variant="default"
            size="sm"
            onClick={onPlay}
            className="gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant={isPaused ? "outline" : "default"}
              size="sm"
              onClick={onPause}
              className="gap-2"
            >
              {isPaused ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              className="gap-2 bg-transparent"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6h12v12H6z" />
              </svg>
              Stop
            </Button>
          </div>
        )}
        <Button
          variant={isPresentationMode ? "default" : "outline"}
          size="sm"
          onClick={onTogglePresentationMode}
          className="gap-2"
        >
          {isPresentationMode ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit Presentation
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              Presentation Mode
            </>
          )}
        </Button>
        <TooltipEditor 
          messages={messages}
          customTooltips={customTooltips}
          onTooltipsChange={onCustomTooltipsChange}
        />
        <ParticipantEditor
          participants={participants}
          customParticipants={customParticipants}
          onParticipantsChange={onCustomParticipantsChange}
        />
        <ColorDesigner theme={colorTheme} onThemeChange={onColorThemeChange} />
        <SaveLoadMenu saveData={saveData} onLoad={onLoadData} />
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2 bg-transparent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </Button>
      </div>
    </header>
  )
}
