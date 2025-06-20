"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/components/theme-provider"

interface SimpleCodeEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
}

export function SimpleCodeEditor({ value, language, onChange }: SimpleCodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    const editor: any = null

    const loadEditor = async () => {
      try {
        // Use dynamic import for Monaco Editor
        const monaco = await import("@monaco-editor/react")
        const MonacoEditor = monaco.default

        if (editorRef.current) {
          // Clear the container
          editorRef.current.innerHTML = ""

          // Create a new div for the editor
          const editorContainer = document.createElement("div")
          editorContainer.style.height = "100%"
          editorContainer.style.width = "100%"
          editorRef.current.appendChild(editorContainer)

          // Import React and render the editor
          const React = await import("react")
          const ReactDOM = await import("react-dom/client")

          const root = ReactDOM.createRoot(editorContainer)

          root.render(
            React.createElement(MonacoEditor, {
              height: "100%",
              language: language === "tsx" ? "typescript" : language,
              value: value,
              theme: theme === "dark" || theme === "glassy" ? "vs-dark" : "vs-light",
              onChange: (val: string | undefined) => onChange(val || ""),
              options: {
                fontSize: 14,
                fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                lineNumbers: "on",
                renderWhitespace: "selection",
                smoothScrolling: true,
                cursorBlinking: "smooth",
              },
            }),
          )
        }
      } catch (error) {
        console.warn("Monaco Editor failed to load, falling back to textarea")
        // Fallback to simple textarea
        if (editorRef.current) {
          editorRef.current.innerHTML = `
            <textarea 
              style="
                width: 100%; 
                height: 100%; 
                border: none; 
                outline: none; 
                resize: none; 
                font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
                font-size: 14px;
                padding: 16px;
                background: ${theme === "dark" || theme === "glassy" ? "#1e1e1e" : "#ffffff"};
                color: ${theme === "dark" || theme === "glassy" ? "#d4d4d4" : "#000000"};
              "
              spellcheck="false"
            >${value}</textarea>
          `

          const textarea = editorRef.current.querySelector("textarea")
          if (textarea) {
            textarea.addEventListener("input", (e) => {
              onChange((e.target as HTMLTextAreaElement).value)
            })
          }
        }
      }
    }

    loadEditor()

    return () => {
      if (editor) {
        try {
          editor.dispose()
        } catch (e) {
          // Ignore disposal errors
        }
      }
    }
  }, [mounted, language, theme])

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background/30">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    )
  }

  return <div ref={editorRef} className="h-full w-full" />
}
