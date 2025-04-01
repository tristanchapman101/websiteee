"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Camera, Send, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  imageUrl?: string
}

interface Screenshot {
  id: string
  url: string
  timestamp: number
  title: string
}

export default function AIBrowserAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "I'm your AI browser assistant. I can help you understand and interact with web content. Share a screenshot, and I'll assist you.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load screenshots from localStorage
  useEffect(() => {
    const savedScreenshots = localStorage.getItem("dashboard_screenshots")
    if (savedScreenshots) {
      try {
        setScreenshots(JSON.parse(savedScreenshots))
      } catch (e) {
        console.error("Failed to parse saved screenshots", e)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() && !selectedScreenshot) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      imageUrl: selectedScreenshot || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSelectedScreenshot(null)
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can see you're viewing a webpage. What specific information are you looking for?",
        "Based on the content you shared, this appears to be about technology. Would you like me to explain any specific part?",
        "I notice there's a form on this page. Would you like help filling it out?",
        "This looks like an article about science. Would you like a summary of the key points?",
        "I can see this is a shopping website. Would you like recommendations on what to buy?",
        "This appears to be a tutorial. Would you like me to explain any steps in more detail?",
        "I can see you're looking at a website. Is there anything specific you'd like to know about it?",
        "This webpage contains information about products. Would you like me to compare them for you?",
        "I notice this is a news article. Would you like me to summarize the main points?",
        "This appears to be a social media page. Would you like tips on how to use it effectively?",
      ]

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex-1 overflow-y-auto rounded border p-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[80%] items-start rounded-lg px-4 py-2 ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <div className="mr-2 mt-1">
                {message.role === "user" ? <Camera className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div>
                {message.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={message.imageUrl || "/placeholder.svg"}
                      alt="Shared screenshot"
                      className="max-h-[200px] rounded border"
                    />
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="flex max-w-[80%] items-center rounded-lg bg-muted px-4 py-2">
              <Bot className="mr-2 h-4 w-4" />
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {screenshots.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium">Select a screenshot to share:</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className={`cursor-pointer rounded border p-1 ${
                  selectedScreenshot === screenshot.url ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedScreenshot(screenshot.url)}
              >
                <img
                  src={screenshot.url || "/placeholder.svg"}
                  alt={screenshot.title}
                  className="h-16 w-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedScreenshot && (
        <div className="mb-4">
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Selected screenshot:</p>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedScreenshot(null)}>
                  ✕
                </Button>
              </div>
              <img
                src={selectedScreenshot || "/placeholder.svg"}
                alt="Selected screenshot"
                className="mt-1 max-h-[100px] rounded border"
              />
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the web content..."
          className="min-h-[80px] flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <Button type="submit" disabled={isLoading || (!input.trim() && !selectedScreenshot)}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

