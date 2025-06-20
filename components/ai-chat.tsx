"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI coding assistant. I can help you with code reviews, debugging, explanations, and suggestions. What would you like to work on?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(
      () => {
        const responses = [
          "I can help you with that! Let me analyze your code and provide some suggestions.",
          "That's a great question! Here's what I think about your approach...",
          "I notice you're working on a React component. Here are some best practices you might consider:",
          "Let me help you debug that issue. Can you show me the specific error you're encountering?",
          "That's an interesting implementation! Here's how you could optimize it further:",
        ]

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responses[Math.floor(Math.random() * responses.length)],
          role: "assistant",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="h-full flex flex-col bg-background/30 backdrop-blur-sm border-l border-border/50">
      <div className="p-3 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-purple-500" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-purple-500" />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/50 bg-background/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code..."
            className="flex-1 bg-background/50 backdrop-blur-sm"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="sm" className="px-3">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
