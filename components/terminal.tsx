"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface TerminalProps {
  webContainerLogs?: string[];
}

export function Terminal({ webContainerLogs = [] }: TerminalProps) {
  const [history, setHistory] = useState<Array<{ command: string; output: string; type: "success" | "error" }>>([    { command: "npm start", output: "Development server started on http://localhost:3000", type: "success" },
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>(["npm start", "npm run build", "git status"])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const executeCommand = (command: string) => {
    if (!command.trim()) return

    let output = ""
    let type: "success" | "error" = "success"

    // Simple command simulation
    switch (command.toLowerCase().trim()) {
      case "help":
        output = "Available commands: help, clear, ls, pwd, npm start, npm run build, git status"
        break
      case "clear":
        setHistory([])
        setCurrentCommand("")
        return
      case "ls":
        output = "src/  public/  package.json  README.md"
        break
      case "pwd":
        output = "/workspace/my-app"
        break
      case "npm start":
        output = "Starting development server...\nServer running on http://localhost:3000"
        break
      case "npm run build":
        output = "Building for production...\nBuild completed successfully!"
        break
      case "git status":
        output =
          "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean"
        break
      default:
        output = `Command not found: ${command}`
        type = "error"
    }

    setHistory((prev) => [...prev, { command, output, type }])
    setCommandHistory((prev) => [command, ...prev.filter((cmd) => cmd !== command)].slice(0, 50))
    setCurrentCommand("")
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentCommand)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand("")
      }
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])
  
  // Effect to handle WebContainer logs
  useEffect(() => {
    if (webContainerLogs.length > 0) {
      // Get the last log entry that hasn't been added to history yet
      const lastLog = webContainerLogs[webContainerLogs.length - 1];
      
      // Check if this log is already in history to avoid duplicates
      const logExists = history.some(entry => 
        entry.command === "[WebContainer]" && entry.output === lastLog
      );
      
      if (!logExists) {
        setHistory(prev => [...prev, { 
          command: "[WebContainer]", 
          output: lastLog,
          type: lastLog.includes("Error") || lastLog.includes("❌") ? "error" : "success" 
        }]);
      }
    }
  }, [webContainerLogs, history])

  return (
    <div
      className="h-full bg-black/90 text-green-400 font-mono text-sm p-3 overflow-auto"
      ref={terminalRef}
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((entry, index) => (
        <div key={index} className="mb-2">
          <div className="flex items-center text-blue-400">
            <span className="text-green-400">user@ide</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~/workspace</span>
            <span className="text-white">$ </span>
            <span className="text-white">{entry.command}</span>
          </div>
          <div className={`whitespace-pre-wrap ${entry.type === "error" ? "text-red-400" : "text-gray-300"}`}>
            {entry.output}
          </div>
        </div>
      ))}

      <div className="flex items-center">
        <span className="text-green-400">user@ide</span>
        <span className="text-white">:</span>
        <span className="text-blue-400">~/workspace</span>
        <span className="text-white">$ </span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-0 outline-0 text-white caret-green-400"
          autoFocus
        />
      </div>
    </div>
  )
}
