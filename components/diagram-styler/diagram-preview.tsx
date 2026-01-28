"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import type { ColorTheme } from "./color-designer"

interface DiagramPreviewProps {
  code: string
  isPresentationMode: boolean
  onNodeClick: (nodeId: string, nodeType: "participant" | "message") => void
  isPlaying: boolean
  currentStep: number
  currentTooltip: string | null
  dotProgress: number
  colorTheme: ColorTheme
}

export function DiagramPreview({ code, isPresentationMode, onNodeClick, isPlaying, currentStep, currentTooltip, dotProgress, colorTheme }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        primaryColor: colorTheme.primary,
        primaryTextColor: colorTheme.actorText,
        primaryBorderColor: colorTheme.primary,
        secondaryColor: colorTheme.secondary,
        secondaryTextColor: colorTheme.actorText,
        secondaryBorderColor: colorTheme.secondary,
        tertiaryColor: colorTheme.background,
        lineColor: colorTheme.lineColor,
        textColor: colorTheme.text,
        actorBkg: colorTheme.actorBackground,
        actorBorder: colorTheme.primary,
        actorTextColor: colorTheme.actorText,
        actorLineColor: colorTheme.lineColor + "60",
        signalColor: colorTheme.lineColor,
        signalTextColor: colorTheme.text,
        labelBoxBkgColor: colorTheme.background,
        labelBoxBorderColor: colorTheme.primary,
        labelTextColor: colorTheme.text,
        loopTextColor: colorTheme.secondary,
        noteBkgColor: colorTheme.noteBackground,
        noteBorderColor: colorTheme.noteBorder,
        noteTextColor: colorTheme.text,
        activationBkgColor: colorTheme.primary + "20",
        activationBorderColor: colorTheme.primary,
        sequenceNumberColor: colorTheme.actorText,
      },
      sequence: {
        actorMargin: 80,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 40,
        mirrorActors: true,
        bottomMarginAdj: 10,
        useMaxWidth: false,
        rightAngles: false,
        showSequenceNumbers: false,
        actorFontSize: 14,
        actorFontWeight: 600,
        noteFontSize: 12,
        messageFontSize: 13,
      },
    })
  }, [colorTheme])

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code.trim()) {
        setError(null)
        return
      }

      try {
        const cleanCode = code.trim()
        const { svg } = await mermaid.render(`mermaid-${key}`, cleanCode)
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          setError(null)

          // Scroll to top-left after rendering
          if (wrapperRef.current) {
            wrapperRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" })
          }

          // Add click handlers to SVG elements
          const svgElement = containerRef.current.querySelector("svg")
          if (svgElement) {
            // Allow SVG to maintain its natural size for horizontal scrolling
            svgElement.style.minWidth = "fit-content"
            svgElement.style.height = "auto"
            svgElement.style.display = "block"

            // Handle participant clicks
            const actors = svgElement.querySelectorAll(".actor")
            actors.forEach((actor) => {
              actor.style.cursor = "pointer"
              actor.addEventListener("click", (e) => {
                e.stopPropagation()
                const text = actor.querySelector("text")?.textContent || "Unknown"
                onNodeClick(text, "participant")
              })
            })

            // Handle message line clicks
            const messages = svgElement.querySelectorAll(".messageLine0, .messageLine1")
            messages.forEach((msg, index) => {
              msg.style.cursor = "pointer"
              msg.addEventListener("click", (e) => {
                e.stopPropagation()
                onNodeClick(`Message ${index + 1}`, "message")
              })
            })

            // Handle message text clicks
            const messageTexts = svgElement.querySelectorAll(".messageText")
            messageTexts.forEach((msgText) => {
              msgText.style.cursor = "pointer"
              msgText.addEventListener("click", (e) => {
                e.stopPropagation()
                const text = msgText.textContent || "Unknown Message"
                onNodeClick(text, "message")
              })
            })
          }
        }
        
        setKey((k) => k + 1)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to render diagram")
      }
    }

    const timeoutId = setTimeout(renderDiagram, 300)
    return () => clearTimeout(timeoutId)
  }, [code, onNodeClick, colorTheme])

  // Animation effect for highlighting current step
  useEffect(() => {
    if (!containerRef.current || !isPlaying) return

    const svgElement = containerRef.current.querySelector("svg")
    if (!svgElement) return

    // Reset all message lines and texts
    const allMessages = svgElement.querySelectorAll(".messageLine0, .messageLine1")
    const allTexts = svgElement.querySelectorAll(".messageText")
    
    allMessages.forEach((msg, index) => {
      const element = msg as SVGElement
      if (index < currentStep) {
        element.style.opacity = "0.4"
        element.style.strokeWidth = "1"
        element.style.filter = ""
      } else if (index === currentStep) {
        element.style.opacity = "1"
        element.style.strokeWidth = "3"
        element.style.filter = `drop-shadow(0 0 12px ${colorTheme.primary})`
      } else {
        element.style.opacity = "0.2"
        element.style.strokeWidth = "1"
        element.style.filter = ""
      }
    })

    allTexts.forEach((txt, index) => {
      const element = txt as SVGElement
      if (index < currentStep) {
        element.style.opacity = "0.4"
        element.style.filter = ""
      } else if (index === currentStep) {
        element.style.opacity = "1"
        element.style.fontWeight = "700"
        element.style.filter = `drop-shadow(0 0 6px ${colorTheme.primary})`
      } else {
        element.style.opacity = "0.2"
        element.style.filter = ""
      }
    })

    // Add animated dot on current message line
    const currentLine = allMessages[currentStep] as SVGLineElement | SVGPathElement | undefined
    const currentText = allTexts[currentStep] as SVGTextElement | undefined
    
    if (currentLine) {
      // Remove existing dots and tooltips
      const existingDots = svgElement.querySelectorAll(".animated-dot, .animated-tooltip")
      existingDots.forEach(el => el.remove())

      // Get line coordinates
      if (currentLine.tagName === "line") {
        const x1 = parseFloat(currentLine.getAttribute("x1") || "0")
        const y1 = parseFloat(currentLine.getAttribute("y1") || "0")
        const x2 = parseFloat(currentLine.getAttribute("x2") || "0")
        const y2 = parseFloat(currentLine.getAttribute("y2") || "0")
        
        // Calculate current dot position based on dotProgress (0-100)
        const progress = Math.min(dotProgress / 100, 1)
        const currentX = x1 + (x2 - x1) * progress
        const currentY = y1 + (y2 - y1) * progress
        
        // Create dot with glow effect
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        dot.setAttribute("r", "10")
        dot.setAttribute("fill", colorTheme.primary)
        dot.setAttribute("class", "animated-dot")
        dot.setAttribute("cx", String(currentX))
        dot.setAttribute("cy", String(currentY))
        dot.style.filter = `drop-shadow(0 0 16px ${colorTheme.primary}) drop-shadow(0 0 8px ${colorTheme.primary})`
        
        // Add a trail effect
        const trail = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        trail.setAttribute("r", "6")
        trail.setAttribute("fill", colorTheme.primary)
        trail.setAttribute("class", "animated-dot")
        trail.setAttribute("cx", String(x1 + (x2 - x1) * Math.max(0, progress - 0.1)))
        trail.setAttribute("cy", String(y1 + (y2 - y1) * Math.max(0, progress - 0.1)))
        trail.style.opacity = "0.4"
        trail.style.filter = `drop-shadow(0 0 8px ${colorTheme.primary})`
        
        svgElement.appendChild(trail)
        svgElement.appendChild(dot)
        
        // Create tooltip inside the SVG - positioned further above the message line
        if (currentTooltip && currentText) {
          const tooltipGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
          tooltipGroup.setAttribute("class", "animated-tooltip")
          
          // Position tooltip well above the message line (60px instead of 40px)
          const centerX = (x1 + x2) / 2
          const tooltipY = y1 - 65
          
          // Background rectangle - SOLID fill, no transparency
          const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
          const textWidth = Math.min(currentTooltip.length * 7, 320)
          bgRect.setAttribute("x", String(centerX - textWidth / 2 - 16))
          bgRect.setAttribute("y", String(tooltipY - 18))
          bgRect.setAttribute("width", String(textWidth + 32))
          bgRect.setAttribute("height", "36")
          bgRect.setAttribute("rx", "8")
          bgRect.setAttribute("fill", colorTheme.actorBackground)
          bgRect.setAttribute("stroke", colorTheme.primary)
          bgRect.setAttribute("stroke-width", "2")
          bgRect.style.filter = `drop-shadow(0 4px 12px rgba(0,0,0,0.4))`
          
          // Tooltip text
          const tooltipText = document.createElementNS("http://www.w3.org/2000/svg", "text")
          tooltipText.setAttribute("x", String(centerX))
          tooltipText.setAttribute("y", String(tooltipY + 5))
          tooltipText.setAttribute("text-anchor", "middle")
          tooltipText.setAttribute("fill", colorTheme.actorText)
          tooltipText.setAttribute("font-size", "13")
          tooltipText.setAttribute("font-weight", "600")
          tooltipText.setAttribute("font-family", "system-ui, sans-serif")
          tooltipText.textContent = currentTooltip.length > 50 ? currentTooltip.substring(0, 50) + "..." : currentTooltip
          
          // Arrow pointing down - SOLID fill
          const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
          arrow.setAttribute("points", `${centerX - 8},${tooltipY + 18} ${centerX + 8},${tooltipY + 18} ${centerX},${tooltipY + 28}`)
          arrow.setAttribute("fill", colorTheme.actorBackground)
          arrow.setAttribute("stroke", colorTheme.primary)
          arrow.setAttribute("stroke-width", "2")
          
          tooltipGroup.appendChild(bgRect)
          tooltipGroup.appendChild(arrow)
          tooltipGroup.appendChild(tooltipText)
          svgElement.appendChild(tooltipGroup)
        }
      }
    }
  }, [isPlaying, currentStep, dotProgress, currentTooltip, colorTheme])

  // Reset diagram styles when animation stops
  useEffect(() => {
    if (isPlaying) return
    
    const svgElement = containerRef.current?.querySelector("svg")
    if (!svgElement) return

    // Remove all animation elements
    const existingDots = svgElement.querySelectorAll(".animated-dot, .animated-tooltip")
    existingDots.forEach(el => el.remove())
    
    // Reset all message lines
    const allMessages = svgElement.querySelectorAll(".messageLine0, .messageLine1")
    allMessages.forEach((msg) => {
      const element = msg as SVGElement
      element.style.opacity = "1"
      element.style.strokeWidth = "1"
      element.style.filter = ""
    })
    
    // Reset all message texts
    const allTexts = svgElement.querySelectorAll(".messageText")
    allTexts.forEach((txt) => {
      const element = txt as SVGElement
      element.style.opacity = "1"
      element.style.fontWeight = ""
      element.style.filter = ""
    })
  }, [isPlaying])

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full rounded-lg border border-border overflow-auto shadow-sm transition-all duration-500 ${
        isPresentationMode ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""
      }`}
      style={{ backgroundColor: colorTheme.background }}
    >
      {error ? (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
              <svg
                className="w-6 h-6 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {error}
            </p>
          </div>
        </div>
      ) : !code.trim() ? (
        <div className="flex items-center justify-center h-full p-8">
          <p className="text-muted-foreground text-sm">
            Enter Mermaid code to see the diagram preview
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`p-8 min-h-full min-w-fit ${
            isPresentationMode ? "animate-pulse-subtle" : ""
          }`}
          style={{
            ["--presentation-animation" as string]: isPresentationMode ? "running" : "paused",
          }}
        />
      )}
      
      {isPresentationMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/20" />
        </div>
      )}

      {/* Step indicator */}
      {isPlaying && (
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
            Step {currentStep + 1}
          </div>
        </div>
      )}
    </div>
  )
}
