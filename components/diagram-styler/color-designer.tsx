"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface ColorTheme {
  primary: string
  secondary: string
  background: string
  text: string
  actorBackground: string
  actorText: string
  lineColor: string
  noteBackground: string
  noteBorder: string
}

export const DEFAULT_THEME: ColorTheme = {
  primary: "#0ea5e9",
  secondary: "#a855f7",
  background: "#1e1e2e",
  text: "#e2e8f0",
  actorBackground: "#0ea5e9",
  actorText: "#ffffff",
  lineColor: "#0ea5e9",
  noteBackground: "#1e1e2e",
  noteBorder: "#a855f7",
}

export const PRESET_THEMES: { name: string; theme: ColorTheme }[] = [
  {
    name: "Cyber (Default)",
    theme: DEFAULT_THEME,
  },
  {
    name: "Ocean",
    theme: {
      primary: "#06b6d4",
      secondary: "#0284c7",
      background: "#0f172a",
      text: "#f1f5f9",
      actorBackground: "#06b6d4",
      actorText: "#ffffff",
      lineColor: "#06b6d4",
      noteBackground: "#0f172a",
      noteBorder: "#0284c7",
    },
  },
  {
    name: "Forest",
    theme: {
      primary: "#22c55e",
      secondary: "#16a34a",
      background: "#14532d",
      text: "#f0fdf4",
      actorBackground: "#22c55e",
      actorText: "#ffffff",
      lineColor: "#22c55e",
      noteBackground: "#14532d",
      noteBorder: "#16a34a",
    },
  },
  {
    name: "Sunset",
    theme: {
      primary: "#f97316",
      secondary: "#ea580c",
      background: "#1c1917",
      text: "#fafaf9",
      actorBackground: "#f97316",
      actorText: "#ffffff",
      lineColor: "#f97316",
      noteBackground: "#1c1917",
      noteBorder: "#ea580c",
    },
  },
  {
    name: "Rose",
    theme: {
      primary: "#f43f5e",
      secondary: "#e11d48",
      background: "#1f1f1f",
      text: "#fecdd3",
      actorBackground: "#f43f5e",
      actorText: "#ffffff",
      lineColor: "#f43f5e",
      noteBackground: "#1f1f1f",
      noteBorder: "#e11d48",
    },
  },
  {
    name: "Monochrome",
    theme: {
      primary: "#a1a1aa",
      secondary: "#71717a",
      background: "#18181b",
      text: "#fafafa",
      actorBackground: "#52525b",
      actorText: "#ffffff",
      lineColor: "#a1a1aa",
      noteBackground: "#27272a",
      noteBorder: "#71717a",
    },
  },
  {
    name: "Light Mode",
    theme: {
      primary: "#2563eb",
      secondary: "#7c3aed",
      background: "#ffffff",
      text: "#1e293b",
      actorBackground: "#2563eb",
      actorText: "#ffffff",
      lineColor: "#2563eb",
      noteBackground: "#f8fafc",
      noteBorder: "#7c3aed",
    },
  },
]

interface ColorDesignerProps {
  theme: ColorTheme
  onThemeChange: (theme: ColorTheme) => void
}

function ColorInput({ 
  label, 
  value, 
  onChange 
}: { 
  label: string
  value: string
  onChange: (value: string) => void 
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-md border border-border shadow-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs font-mono rounded bg-muted border border-border text-foreground"
        />
      </div>
    </div>
  )
}

export function ColorDesigner({ theme, onThemeChange }: ColorDesignerProps) {
  const updateColor = (key: keyof ColorTheme, value: string) => {
    onThemeChange({ ...theme, [key]: value })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Design
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Color Designer</SheetTitle>
          <SheetDescription>
            Customize the diagram colors to match your brand or preference
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Preset Themes */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Preset Themes</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onThemeChange(preset.theme)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all hover:border-primary ${
                    JSON.stringify(theme) === JSON.stringify(preset.theme)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex -space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-background"
                      style={{ backgroundColor: preset.theme.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-background"
                      style={{ backgroundColor: preset.theme.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-background"
                      style={{ backgroundColor: preset.theme.background }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Custom Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Custom Colors</Label>
            
            <div className="space-y-3">
              <ColorInput
                label="Primary"
                value={theme.primary}
                onChange={(v) => updateColor("primary", v)}
              />
              <ColorInput
                label="Secondary"
                value={theme.secondary}
                onChange={(v) => updateColor("secondary", v)}
              />
              <ColorInput
                label="Background"
                value={theme.background}
                onChange={(v) => updateColor("background", v)}
              />
              <ColorInput
                label="Text"
                value={theme.text}
                onChange={(v) => updateColor("text", v)}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Advanced Colors */}
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer flex items-center justify-between py-2 text-foreground">
              Advanced Colors
              <svg 
                className="w-4 h-4 transition-transform group-open:rotate-180" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-3 space-y-3">
              <ColorInput
                label="Actor Background"
                value={theme.actorBackground}
                onChange={(v) => updateColor("actorBackground", v)}
              />
              <ColorInput
                label="Actor Text"
                value={theme.actorText}
                onChange={(v) => updateColor("actorText", v)}
              />
              <ColorInput
                label="Line Color"
                value={theme.lineColor}
                onChange={(v) => updateColor("lineColor", v)}
              />
              <ColorInput
                label="Note Background"
                value={theme.noteBackground}
                onChange={(v) => updateColor("noteBackground", v)}
              />
              <ColorInput
                label="Note Border"
                value={theme.noteBorder}
                onChange={(v) => updateColor("noteBorder", v)}
              />
            </div>
          </details>

          {/* Reset Button */}
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onThemeChange(DEFAULT_THEME)}
              className="w-full bg-transparent"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
