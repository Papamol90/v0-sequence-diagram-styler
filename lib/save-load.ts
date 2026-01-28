"use client"

import { type ColorTheme, DEFAULT_THEME } from "@/components/diagram-styler/color-designer"
import type { CustomTooltips } from "@/components/diagram-styler/tooltip-editor"
import type { CustomParticipants } from "@/components/diagram-styler/participant-editor"
import type { SyntaxMode } from "@/components/diagram-styler/code-editor"

export interface DiagramConfig {
  version: string
  name: string
  createdAt: string
  updatedAt: string
  syntaxMode: SyntaxMode
  code: string
  colorTheme: ColorTheme
  customTooltips: CustomTooltips
  customParticipants: CustomParticipants
}

export interface SaveData {
  code: string
  syntaxMode: SyntaxMode
  colorTheme: ColorTheme
  customTooltips: CustomTooltips
  customParticipants: CustomParticipants
}

// Generate a default config name from the code
function generateConfigName(code: string): string {
  const lines = code.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    // Look for title in mermaid
    if (trimmed.startsWith('title')) {
      return trimmed.replace('title', '').trim()
    }
    // Look for first participant
    const participantMatch = trimmed.match(/participant\s+(\w+)/)
    if (participantMatch) {
      return `Diagram - ${participantMatch[1]}`
    }
  }
  return `Diagram - ${new Date().toLocaleDateString()}`
}

// Export to JSON file
export function exportToJson(data: SaveData, customName?: string): void {
  const config: DiagramConfig = {
    version: "1.0",
    name: customName || generateConfigName(data.code),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  }

  const json = JSON.stringify(config, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement("a")
  a.href = url
  a.download = `${config.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Import from JSON file
export function importFromJson(file: File): Promise<SaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const config = JSON.parse(text) as DiagramConfig
        
        // Validate required fields
        if (!config.code) {
          throw new Error("Invalid config: missing code")
        }
        
        resolve({
          code: config.code,
          syntaxMode: config.syntaxMode || "mermaid",
          colorTheme: config.colorTheme,
          customTooltips: config.customTooltips || {},
          customParticipants: config.customParticipants || {}
        })
      } catch (err) {
        reject(new Error("Invalid JSON file"))
      }
    }
    
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// Simple LZW compression for shorter URLs
function lzwCompress(str: string): number[] {
  const dict: Map<string, number> = new Map()
  let dictSize = 256
  for (let i = 0; i < 256; i++) {
    dict.set(String.fromCharCode(i), i)
  }
  
  let w = ""
  const result: number[] = []
  
  for (const c of str) {
    const wc = w + c
    if (dict.has(wc)) {
      w = wc
    } else {
      result.push(dict.get(w)!)
      dict.set(wc, dictSize++)
      w = c
    }
  }
  
  if (w) {
    result.push(dict.get(w)!)
  }
  
  return result
}

function lzwDecompress(compressed: number[]): string {
  const dict: Map<number, string> = new Map()
  let dictSize = 256
  for (let i = 0; i < 256; i++) {
    dict.set(i, String.fromCharCode(i))
  }
  
  let w = String.fromCharCode(compressed[0])
  let result = w
  
  for (let i = 1; i < compressed.length; i++) {
    const k = compressed[i]
    let entry: string
    
    if (dict.has(k)) {
      entry = dict.get(k)!
    } else if (k === dictSize) {
      entry = w + w[0]
    } else {
      throw new Error("Invalid compressed data")
    }
    
    result += entry
    dict.set(dictSize++, w + entry[0])
    w = entry
  }
  
  return result
}

// Convert number array to base64-safe string
function numbersToBase64(nums: number[]): string {
  // Pack numbers into bytes (using variable-length encoding for efficiency)
  const bytes: number[] = []
  for (const num of nums) {
    if (num < 128) {
      bytes.push(num)
    } else if (num < 16384) {
      bytes.push((num >> 7) | 0x80)
      bytes.push(num & 0x7f)
    } else {
      bytes.push((num >> 14) | 0x80)
      bytes.push(((num >> 7) & 0x7f) | 0x80)
      bytes.push(num & 0x7f)
    }
  }
  
  const binary = String.fromCharCode(...bytes)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Convert base64-safe string back to number array
function base64ToNumbers(str: string): number[] {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  
  const binary = atob(base64)
  const bytes = Array.from(binary, c => c.charCodeAt(0))
  
  const nums: number[] = []
  let i = 0
  while (i < bytes.length) {
    let num = 0
    let shift = 0
    while (bytes[i] & 0x80) {
      num |= (bytes[i] & 0x7f) << (7 * shift)
      shift++
      i++
    }
    num |= bytes[i] << (7 * shift)
    nums.push(num)
    i++
  }
  
  return nums
}

// Compress string using LZW + base64 for URL
function compressForUrl(str: string): string {
  try {
    const compressed = lzwCompress(str)
    return numbersToBase64(compressed)
  } catch {
    // Fallback to simple base64
    try {
      const encoded = btoa(unescape(encodeURIComponent(str)))
      return 'b' + encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    } catch {
      return ''
    }
  }
}

// Decompress string from URL
function decompressFromUrl(str: string): string {
  try {
    // Check for fallback format
    if (str.startsWith('b')) {
      let base64 = str.slice(1).replace(/-/g, '+').replace(/_/g, '/')
      while (base64.length % 4) {
        base64 += '='
      }
      return decodeURIComponent(escape(atob(base64)))
    }
    
    const compressed = base64ToNumbers(str)
    return lzwDecompress(compressed)
  } catch {
    return ''
  }
}

// Mermaid code shortcuts for compression
const CODE_SHORTCUTS: [string, string][] = [
  ['sequenceDiagram', '~SD'],
  ['participant', '~P'],
  ['actor', '~A'],
  ['activate', '~+'],
  ['deactivate', '~-'],
  ['Note left of', '~NL'],
  ['Note right of', '~NR'],
  ['Note over', '~NO'],
  ['loop', '~LP'],
  ['alt', '~AL'],
  ['else', '~EL'],
  ['opt', '~OP'],
  ['par', '~PA'],
  ['and', '~AN'],
  ['rect', '~RC'],
  ['end', '~EN'],
  ['->>>', '~3'],
  ['-->>>', '~4'],
  ['->>', '~1'],
  ['-->>',  '~2'],
  ['->', '~5'],
  ['-->', '~6'],
]

function compressCode(code: string): string {
  let result = code
  // Remove extra whitespace but keep structure
  result = result.split('\n').map(line => line.trim()).filter(line => line).join('\n')
  // Apply shortcuts
  for (const [full, short] of CODE_SHORTCUTS) {
    result = result.split(full).join(short)
  }
  return result
}

function decompressCode(code: string): string {
  let result = code
  // Reverse shortcuts (apply in reverse order)
  for (let i = CODE_SHORTCUTS.length - 1; i >= 0; i--) {
    const [full, short] = CODE_SHORTCUTS[i]
    result = result.split(short).join(full)
  }
  // Restore newlines with proper formatting
  return result
}

// Check if theme equals default
function isDefaultTheme(theme: ColorTheme | undefined): boolean {
  if (!theme) return true
  return JSON.stringify(theme) === JSON.stringify(DEFAULT_THEME)
}

// Generate shareable URL
export function generateShareUrl(data: SaveData): string {
  // Compress the code with shortcuts
  const compressedCode = compressCode(data.code)
  
  // Only include non-empty/non-default values to minimize URL size
  const minimalData: Record<string, unknown> = {
    c: compressedCode,
  }
  
  // Only add optional fields if they have content
  if (data.syntaxMode !== "mermaid") {
    minimalData.s = data.syntaxMode
  }
  // Only include color theme if it differs from default
  if (data.colorTheme && !isDefaultTheme(data.colorTheme)) {
    minimalData.t = data.colorTheme
  }
  if (data.customTooltips && Object.keys(data.customTooltips).length > 0) {
    minimalData.tt = data.customTooltips
  }
  if (data.customParticipants && Object.keys(data.customParticipants).length > 0) {
    minimalData.p = data.customParticipants
  }
  
  const compressed = compressForUrl(JSON.stringify(minimalData))
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
  
  return `${baseUrl}?d=${compressed}`
}

// Parse data from URL
export function parseFromUrl(): SaveData | null {
  if (typeof window === 'undefined') return null
  
  const params = new URLSearchParams(window.location.search)
  const compressed = params.get('d')
  
  if (!compressed) return null
  
  try {
    const json = decompressFromUrl(compressed)
    const minimalData = JSON.parse(json)
    
    // Decompress the code shortcuts
    const code = decompressCode(minimalData.c || '')
    
    return {
      code,
      syntaxMode: minimalData.s || 'mermaid',
      colorTheme: minimalData.t || DEFAULT_THEME,
      customTooltips: minimalData.tt || {},
      customParticipants: minimalData.p || {}
    }
  } catch {
    return null
  }
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      document.body.removeChild(textarea)
      return false
    }
  }
}
