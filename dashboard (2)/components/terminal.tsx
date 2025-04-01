"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface CommandOutput {
  command: string
  output: string
  isError: boolean
}

export default function Terminal() {
  const [command, setCommand] = useState("")
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      command: "",
      output: 'Welcome to the Web Terminal. Type "help" for available commands.',
      isError: false,
    },
  ])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Focus input when terminal is clicked
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus()
    }

    const terminal = terminalRef.current
    if (terminal) {
      terminal.addEventListener("click", handleClick)
    }

    return () => {
      if (terminal) {
        terminal.removeEventListener("click", handleClick)
      }
    }
  }, [])

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim()

    if (!trimmedCmd) return

    let output = ""
    let isError = false

    // Command history
    const commandHistory = history.filter((item) => item.command).map((item) => item.command)

    try {
      if (trimmedCmd === "help") {
        output = `
Available commands:
  help - Show this help message
  clear - Clear the terminal
  echo [text] - Display text
  date - Show current date and time
  calc [expression] - Calculate a simple math expression
  history - Show command history
  about - About this terminal
`
      } else if (trimmedCmd === "clear") {
        setHistory([])
        return
      } else if (trimmedCmd === "date") {
        output = new Date().toString()
      } else if (trimmedCmd === "history") {
        output = commandHistory.join("\n")
      } else if (trimmedCmd === "about") {
        output = "Web Terminal v1.0 - A simulated terminal for web browsers"
      } else if (trimmedCmd.startsWith("echo ")) {
        output = trimmedCmd.substring(5)
      } else if (trimmedCmd.startsWith("calc ")) {
        const expression = trimmedCmd.substring(5)
        // Using Function constructor to evaluate math expressions
        // This is safer than eval() but still limited to simple math
        const result = new Function(`return ${expression}`)()
        output = result.toString()
      } else {
        output = `Command not found: ${trimmedCmd}. Type "help" for available commands.`
        isError = true
      }
    } catch (error) {
      output = `Error: ${error instanceof Error ? error.message : String(error)}`
      isError = true
    }

    setHistory([...history, { command: trimmedCmd, output, isError }])
    setCommand("")
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(command)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()

      const commandHistory = history.filter((item) => item.command).map((item) => item.command)

      if (commandHistory.length === 0) return

      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex

      setHistoryIndex(newIndex)
      setCommand(commandHistory[commandHistory.length - 1 - newIndex] || "")
    } else if (e.key === "ArrowDown") {
      e.preventDefault()

      if (historyIndex <= 0) {
        setHistoryIndex(-1)
        setCommand("")
        return
      }

      const commandHistory = history.filter((item) => item.command).map((item) => item.command)

      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCommand(commandHistory[commandHistory.length - 1 - newIndex] || "")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto rounded border bg-black p-4 font-mono text-sm text-green-400"
      >
        {history.map((item, index) => (
          <div key={index} className="mb-1">
            {item.command && (
              <div className="flex">
                <span className="mr-2 text-blue-400">$</span>
                <span>{item.command}</span>
              </div>
            )}
            <div className={`ml-4 whitespace-pre-wrap ${item.isError ? "text-red-400" : ""}`}>{item.output}</div>
          </div>
        ))}
        <div className="flex items-center">
          <span className="mr-2 text-blue-400">$</span>
          <Input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 bg-transparent p-0 text-green-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}

