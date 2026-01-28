"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { CodeEditor, type SyntaxMode } from "@/components/diagram-styler/code-editor"
import { DiagramPreview } from "@/components/diagram-styler/diagram-preview"
import { BusinessImpactDrawer } from "@/components/diagram-styler/business-impact-drawer"
import { Toolbar } from "@/components/diagram-styler/toolbar"
import { DEFAULT_THEME, type ColorTheme } from "@/components/diagram-styler/color-designer"
import { convertPlantUmlToMermaid, PLANTUML_EXAMPLE } from "@/lib/plantuml-to-mermaid"
import { parseMessagesFromMermaid, type CustomTooltips, type MessageStep } from "@/components/diagram-styler/tooltip-editor"
import { parseParticipantsFromMermaid, type CustomParticipants, type ParticipantInfo } from "@/components/diagram-styler/participant-editor"
import { parseFromUrl, type SaveData } from "@/lib/save-load"

const DEFAULT_DIAGRAM = `sequenceDiagram
    participant Client
    participant API Gateway
    participant Auth Service
    participant Database
    participant Cache

    Client->>API Gateway: POST /api/login
    API Gateway->>Auth Service: Validate credentials
    Auth Service->>Database: Query user record
    Database-->>Auth Service: User data
    Auth Service->>Cache: Store session token
    Cache-->>Auth Service: Confirmation
    Auth Service-->>API Gateway: JWT Token
    API Gateway-->>Client: 200 OK + Token

    Note over Client,Cache: Authentication Flow Complete

    Client->>API Gateway: GET /api/data (with JWT)
    API Gateway->>Auth Service: Verify token
    Auth Service->>Cache: Check session
    Cache-->>Auth Service: Session valid
    Auth Service-->>API Gateway: Token verified
    API Gateway->>Database: Fetch data
    Database-->>API Gateway: Data response
    API Gateway-->>Client: 200 OK + Data`

export default function Home() {
  const [code, setCode] = useState(DEFAULT_DIAGRAM)
  const [syntaxMode, setSyntaxMode] = useState<SyntaxMode>("mermaid")
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [selectedNode, setSelectedNode] = useState<{
    id: string
    type: "participant" | "message"
  } | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(DEFAULT_THEME)
  const [customTooltips, setCustomTooltips] = useState<CustomTooltips>({})
  const [customParticipants, setCustomParticipants] = useState<CustomParticipants>({})
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentTooltip, setCurrentTooltip] = useState<string | null>(null)
  const [speed, setSpeed] = useState(1)
  const [dotProgress, setDotProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Load from URL on mount
  useEffect(() => {
    const urlData = parseFromUrl()
    if (urlData) {
      setCode(urlData.code)
      setSyntaxMode(urlData.syntaxMode)
      if (urlData.colorTheme) setColorTheme(urlData.colorTheme)
      if (urlData.customTooltips) setCustomTooltips(urlData.customTooltips)
      if (urlData.customParticipants) setCustomParticipants(urlData.customParticipants)
      // Clear URL params after loading
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Convert PlantUML to Mermaid if needed
  const mermaidCode = useMemo(() => {
    if (syntaxMode === "plantuml") {
      return convertPlantUmlToMermaid(code)
    }
    return code
  }, [code, syntaxMode])

  // Parse messages from mermaid code for tooltip editor
  const parsedMessages = useMemo(() => {
    return parseMessagesFromMermaid(mermaidCode)
  }, [mermaidCode])

  // Parse participants from mermaid code
  const parsedParticipants = useMemo(() => {
    return parseParticipantsFromMermaid(mermaidCode)
  }, [mermaidCode])

  // Handle syntax mode change
  const handleSyntaxModeChange = useCallback((mode: SyntaxMode) => {
    setSyntaxMode(mode)
    // Switch example code when mode changes
    if (mode === "plantuml") {
      setCode(PLANTUML_EXAMPLE)
    } else {
      setCode(DEFAULT_DIAGRAM)
    }
  }, [])

  // Parse message steps from code - use custom tooltips if available
  const getMessageSteps = useCallback(() => {
    return parsedMessages.map((msg, index) => {
      const defaultDescription = msg.isResponse 
        ? `${msg.from} antwortet an ${msg.to}: ${msg.message}`
        : `${msg.from} sendet an ${msg.to}: ${msg.message}`
      
      return {
        text: msg.message,
        description: customTooltips[msg.id] || defaultDescription
      }
    })
  }, [parsedMessages, customTooltips])

  // Animate the dot along the line using requestAnimationFrame
  const animateDot = useCallback((timestamp: number, steps: { text: string; description: string }[], stepRef: { current: number }, progressRef: { current: number }) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    
    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    
    // Progress per frame: speed affects how fast the dot moves (base: 4.5 seconds per step at 1x)
    const baseStepDuration = 4500 / speed
    const progressIncrement = (deltaTime / baseStepDuration) * 100
    
    progressRef.current += progressIncrement
    setDotProgress(progressRef.current)
    
    if (progressRef.current >= 100) {
      // Move to next step
      progressRef.current = 0
      stepRef.current++
      
      if (stepRef.current >= steps.length) {
        stepRef.current = 0 // Loop back to start
      }
      
      setCurrentStep(stepRef.current)
      setCurrentTooltip(steps[stepRef.current]?.description || null)
      setDotProgress(0)
    }
    
    animationRef.current = requestAnimationFrame((ts) => animateDot(ts, steps, stepRef, progressRef))
  }, [speed])

  // Play animation
  const handlePlay = useCallback(() => {
    const steps = getMessageSteps()
    if (steps.length === 0) return
    
    setIsPlaying(true)
    setIsPaused(false)
    setCurrentStep(0)
    setDotProgress(0)
    setCurrentTooltip(steps[0]?.description || null)
    
    lastTimeRef.current = 0
    const stepRef = { current: 0 }
    const progressRef = { current: 0 }
    
    animationRef.current = requestAnimationFrame((ts) => animateDot(ts, steps, stepRef, progressRef))
  }, [getMessageSteps, animateDot])

  // Pause animation
  const handlePause = useCallback(() => {
    if (isPaused) {
      // Resume
      setIsPaused(false)
      const steps = getMessageSteps()
      lastTimeRef.current = 0
      const stepRef = { current: currentStep }
      const progressRef = { current: dotProgress }
      animationRef.current = requestAnimationFrame((ts) => animateDot(ts, steps, stepRef, progressRef))
    } else {
      // Pause
      setIsPaused(true)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isPaused, currentStep, dotProgress, getMessageSteps, animateDot])

  // Stop animation
  const handleStop = useCallback(() => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(0)
    setDotProgress(0)
    setCurrentTooltip(null)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleNodeClick = useCallback((nodeId: string, nodeType: "participant" | "message") => {
    setSelectedNode({ id: nodeId, type: nodeType })
    setIsDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const handleParticipantUpdate = useCallback((name: string, info: ParticipantInfo) => {
    setCustomParticipants(prev => ({
      ...prev,
      [name]: info
    }))
  }, [])

  const handleTooltipUpdate = useCallback((id: string, tooltip: string) => {
    setCustomTooltips(prev => ({
      ...prev,
      [id]: tooltip
    }))
  }, [])

  const handleTogglePresentationMode = useCallback(() => {
    setIsPresentationMode((prev) => !prev)
  }, [])

  // Current save data
  const saveData: SaveData = useMemo(() => ({
    code,
    syntaxMode,
    colorTheme,
    customTooltips,
    customParticipants
  }), [code, syntaxMode, colorTheme, customTooltips, customParticipants])

  // Load data from file or URL
  const handleLoadData = useCallback((data: SaveData) => {
    setCode(data.code)
    setSyntaxMode(data.syntaxMode)
    if (data.colorTheme) setColorTheme(data.colorTheme)
    if (data.customTooltips) setCustomTooltips(data.customTooltips)
    if (data.customParticipants) setCustomParticipants(data.customParticipants)
  }, [])

  const handleReset = useCallback(() => {
    handleStop()
    setCode(DEFAULT_DIAGRAM)
    setIsPresentationMode(false)
    setSelectedNode(null)
    setIsDrawerOpen(false)
  }, [handleStop])

  return (
    <div className={`flex flex-col h-screen bg-background transition-all duration-500 ${
      isPresentationMode ? "bg-muted/30" : ""
    }`}>
      <Toolbar
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={handleTogglePresentationMode}
        onReset={handleReset}
        isPlaying={isPlaying}
        isPaused={isPaused}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        speed={speed}
        onSpeedChange={setSpeed}
        colorTheme={colorTheme}
        onColorThemeChange={setColorTheme}
        messages={parsedMessages}
        customTooltips={customTooltips}
        onCustomTooltipsChange={setCustomTooltips}
        participants={parsedParticipants}
        customParticipants={customParticipants}
        onCustomParticipantsChange={setCustomParticipants}
        saveData={saveData}
        onLoadData={handleLoadData}
      />

      <main className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Code Editor Panel */}
        <div className={`transition-all duration-500 flex-shrink-0 min-h-0 ${
          isPresentationMode ? "w-0 opacity-0 overflow-hidden" : "w-1/2"
        }`}>
          <div className="h-full flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-primary/20" />
              <h2 className="text-sm font-medium text-muted-foreground">
                {syntaxMode === "mermaid" ? "Mermaid Code" : "PlantUML Code"}
              </h2>
              {syntaxMode === "plantuml" && (
                <span className="text-xs text-primary px-1.5 py-0.5 rounded bg-primary/10">
                  Auto-converts to Mermaid
                </span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <CodeEditor 
                value={code} 
                onChange={setCode} 
                syntaxMode={syntaxMode}
                onSyntaxModeChange={handleSyntaxModeChange}
              />
            </div>
          </div>
        </div>

        {/* Diagram Preview Panel */}
        <div className={`transition-all duration-500 flex-1 min-w-0 min-h-0 ${
          isPresentationMode ? "" : ""
        }`}>
          <div className="h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <h2 className="text-sm font-medium text-muted-foreground">
                  Live Preview
                </h2>
              </div>
              {isPresentationMode && (
                <span className="text-xs text-primary font-medium px-2 py-1 rounded-full bg-primary/10">
                  Presentation Mode
                </span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <DiagramPreview
                code={mermaidCode}
                isPresentationMode={isPresentationMode}
                onNodeClick={handleNodeClick}
                isPlaying={isPlaying}
                currentStep={currentStep}
                currentTooltip={currentTooltip}
                dotProgress={dotProgress}
                colorTheme={colorTheme}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Hint text */}
      <footer className="px-6 py-3 border-t border-border bg-card">
        <p className="text-xs text-muted-foreground text-center">
          Click on any participant or message in the diagram to view business impact details
        </p>
      </footer>

      {/* Business Impact Drawer */}
      <BusinessImpactDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedNode={selectedNode}
        customParticipants={customParticipants}
        customTooltips={customTooltips}
        onParticipantUpdate={handleParticipantUpdate}
        onTooltipUpdate={handleTooltipUpdate}
      />
    </div>
  )
}
