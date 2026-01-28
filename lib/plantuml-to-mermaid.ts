/**
 * Converts PlantUML sequence diagram syntax to Mermaid syntax
 */

export function convertPlantUmlToMermaid(plantUml: string): string {
  let lines = plantUml.split('\n')
  const mermaidLines: string[] = ['sequenceDiagram']
  
  // Track participants for proper ordering
  const participants: string[] = []
  const actors: string[] = []
  
  for (let line of lines) {
    let trimmed = line.trim()
    
    // Skip PlantUML markers
    if (trimmed.startsWith('@startuml') || trimmed.startsWith('@enduml')) {
      continue
    }
    
    // Skip empty lines
    if (!trimmed) {
      continue
    }
    
    // Skip skinparam and other styling
    if (trimmed.startsWith('skinparam') || trimmed.startsWith('hide ') || trimmed.startsWith('show ')) {
      continue
    }
    
    // Handle title
    if (trimmed.startsWith('title ')) {
      // Mermaid doesn't have title in sequence diagrams, skip
      continue
    }
    
    // Handle participant declarations
    if (trimmed.startsWith('participant ')) {
      const match = trimmed.match(/^participant\s+"?([^"]+)"?\s*(?:as\s+(\w+))?/)
      if (match) {
        const name = match[2] || match[1]
        const displayName = match[1]
        if (match[2]) {
          mermaidLines.push(`    participant ${match[2]} as ${displayName}`)
        } else {
          mermaidLines.push(`    participant ${displayName.replace(/\s+/g, ' ')}`)
        }
        participants.push(name)
      }
      continue
    }
    
    // Handle actor declarations
    if (trimmed.startsWith('actor ')) {
      const match = trimmed.match(/^actor\s+"?([^"]+)"?\s*(?:as\s+(\w+))?/)
      if (match) {
        const name = match[2] || match[1]
        const displayName = match[1]
        if (match[2]) {
          mermaidLines.push(`    actor ${match[2]} as ${displayName}`)
        } else {
          mermaidLines.push(`    actor ${displayName.replace(/\s+/g, ' ')}`)
        }
        actors.push(name)
      }
      continue
    }
    
    // Handle notes
    const noteMatch = trimmed.match(/^note\s+(left|right|over)\s*(?:of\s+)?(\w+)?(?:\s*,\s*(\w+))?\s*:\s*(.+)$/i)
    if (noteMatch) {
      const [, position, participant1, participant2, text] = noteMatch
      if (position.toLowerCase() === 'over' && participant1) {
        if (participant2) {
          mermaidLines.push(`    Note over ${participant1},${participant2}: ${text}`)
        } else {
          mermaidLines.push(`    Note over ${participant1}: ${text}`)
        }
      } else if (participant1) {
        mermaidLines.push(`    Note ${position} of ${participant1}: ${text}`)
      }
      continue
    }
    
    // Handle multi-line notes (start)
    if (trimmed.match(/^note\s+(left|right|over)/i) && !trimmed.includes(':')) {
      // Multi-line note - Mermaid doesn't support these well, skip for now
      continue
    }
    
    // Handle end note
    if (trimmed === 'end note') {
      continue
    }
    
    // Handle alt/else/end
    if (trimmed.startsWith('alt ')) {
      mermaidLines.push(`    alt ${trimmed.substring(4)}`)
      continue
    }
    if (trimmed.startsWith('else ')) {
      mermaidLines.push(`    else ${trimmed.substring(5)}`)
      continue
    }
    if (trimmed === 'else') {
      mermaidLines.push('    else')
      continue
    }
    if (trimmed === 'end') {
      mermaidLines.push('    end')
      continue
    }
    
    // Handle loop
    if (trimmed.startsWith('loop ')) {
      mermaidLines.push(`    loop ${trimmed.substring(5)}`)
      continue
    }
    
    // Handle opt (optional)
    if (trimmed.startsWith('opt ')) {
      mermaidLines.push(`    opt ${trimmed.substring(4)}`)
      continue
    }
    
    // Handle par (parallel)
    if (trimmed.startsWith('par ')) {
      mermaidLines.push(`    par ${trimmed.substring(4)}`)
      continue
    }
    
    // Handle critical
    if (trimmed.startsWith('critical ')) {
      mermaidLines.push(`    critical ${trimmed.substring(9)}`)
      continue
    }
    
    // Handle break
    if (trimmed.startsWith('break ')) {
      mermaidLines.push(`    break ${trimmed.substring(6)}`)
      continue
    }
    
    // Handle activate/deactivate
    if (trimmed.startsWith('activate ')) {
      mermaidLines.push(`    activate ${trimmed.substring(9)}`)
      continue
    }
    if (trimmed.startsWith('deactivate ')) {
      mermaidLines.push(`    deactivate ${trimmed.substring(11)}`)
      continue
    }
    
    // Handle messages - this is the core conversion
    // PlantUML: A -> B : message
    // PlantUML: A --> B : message (dashed)
    // PlantUML: A ->> B : message (async)
    // PlantUML: A <-- B : message (return)
    
    const messagePatterns = [
      // Synchronous: -> or ->>
      /^(.+?)\s*->>?\s*(.+?)\s*:\s*(.*)$/,
      // Dashed/Response: --> or -->>
      /^(.+?)\s*-->>?\s*(.+?)\s*:\s*(.*)$/,
      // Return arrow: <-- or <<--
      /^(.+?)\s*<<?--\s*(.+?)\s*:\s*(.*)$/,
      // Return arrow: <- or <<-
      /^(.+?)\s*<<?-\s*(.+?)\s*:\s*(.*)$/,
    ]
    
    let matched = false
    
    // Check for dashed arrows first (more specific)
    const dashedMatch = trimmed.match(/^(.+?)\s*(-->>?|<<--?)\s*(.+?)\s*:\s*(.*)$/)
    if (dashedMatch) {
      let [, from, arrow, to, message] = dashedMatch
      from = from.trim()
      to = to.trim()
      message = message.trim()
      
      // Determine direction and convert arrow
      if (arrow.includes('<<')) {
        // Reverse direction: A <<-- B becomes B -->> A in Mermaid
        mermaidLines.push(`    ${to}-->>${from}: ${message}`)
      } else {
        mermaidLines.push(`    ${from}-->>${to}: ${message}`)
      }
      matched = true
    }
    
    // Check for solid arrows
    if (!matched) {
      const solidMatch = trimmed.match(/^(.+?)\s*(->>?|<<-?)\s*(.+?)\s*:\s*(.*)$/)
      if (solidMatch) {
        let [, from, arrow, to, message] = solidMatch
        from = from.trim()
        to = to.trim()
        message = message.trim()
        
        // Determine direction and convert arrow
        if (arrow.includes('<<')) {
          // Reverse direction
          mermaidLines.push(`    ${to}->>${from}: ${message}`)
        } else {
          mermaidLines.push(`    ${from}->>${to}: ${message}`)
        }
        matched = true
      }
    }
    
    // If no pattern matched, try a more lenient approach
    if (!matched) {
      const lenientMatch = trimmed.match(/^(.+?)\s*(<<?--?>>?|--?>>?|<<--?)\s*(.+?)\s*:\s*(.*)$/)
      if (lenientMatch) {
        let [, from, arrow, to, message] = lenientMatch
        from = from.trim()
        to = to.trim()
        message = message.trim()
        
        const isDashed = arrow.includes('--')
        const isReturn = arrow.startsWith('<')
        
        if (isReturn) {
          // Swap from and to
          const temp = from
          from = to
          to = temp
        }
        
        const mermaidArrow = isDashed ? '-->>' : '->>'
        mermaidLines.push(`    ${from}${mermaidArrow}${to}: ${message}`)
      }
    }
  }
  
  return mermaidLines.join('\n')
}

/**
 * Detects if the input is PlantUML syntax
 */
export function isPlantUml(code: string): boolean {
  const trimmed = code.trim().toLowerCase()
  return trimmed.startsWith('@startuml') || 
         trimmed.includes('->') && !trimmed.includes('->>') ||
         (trimmed.includes('participant') && !trimmed.includes('sequencediagram'))
}

/**
 * Example PlantUML code for the editor
 */
export const PLANTUML_EXAMPLE = `@startuml
participant Client
participant "API Gateway" as API
participant "Auth Service" as Auth
participant Database
participant Cache

Client -> API : POST /api/login
API -> Auth : Validate credentials
Auth -> Database : Query user record
Database --> Auth : User data
Auth -> Cache : Store session token
Cache --> Auth : Confirmation
Auth --> API : JWT Token
API --> Client : 200 OK + Token

note over Client,Cache : Authentication Flow Complete

Client -> API : GET /api/data (with JWT)
API -> Auth : Verify token
Auth -> Cache : Check session
Cache --> Auth : Session valid
Auth --> API : Token verified
API -> Database : Fetch data
Database --> API : Data response
API --> Client : 200 OK + Data
@enduml`
