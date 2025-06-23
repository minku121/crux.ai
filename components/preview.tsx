"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewProps {
  files: Record<string, { content: string; language: string }>
}

export function Preview({ files }: PreviewProps) {
  const [previewContent, setPreviewContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const generatePreview = () => {
    setIsLoading(true)

    // Try to find the main entry point
    const possibleEntryPoints = [
      "src/App.tsx",
      "src/App.jsx",
      "src/index.tsx",
      "src/index.jsx",
      "App.tsx",
      "App.jsx",
      "index.html",
      "public/index.html",
    ]

    let mainFile = null
    let htmlFile = null

    // Find the main component file
    for (const entryPoint of possibleEntryPoints) {
      if (files[entryPoint]) {
        if (entryPoint.endsWith(".html")) {
          htmlFile = files[entryPoint]
        } else {
          mainFile = files[entryPoint]
        }
        break
      }
    }

    // If we have an HTML file, use it directly
    if (htmlFile) {
      let htmlContent = htmlFile.content

      // Inject CSS if available
      const cssFiles = Object.keys(files).filter((path) => path.endsWith(".css"))
      if (cssFiles.length > 0) {
        const cssContent = cssFiles.map((path) => files[path].content).join("\n")
        htmlContent = htmlContent.replace("</head>", `<style>${cssContent}</style></head>`)
      }

      setPreviewContent(htmlContent)
      setTimeout(() => setIsLoading(false), 500)
      return
    }

    // Handle React components
    if (mainFile) {
      const cssFiles = Object.keys(files).filter((path) => path.endsWith(".css") || path.endsWith(".scss"))

      let cssContent = ""
      if (cssFiles.length > 0) {
        cssContent = cssFiles.map((path) => files[path].content).join("\n")
      }

      // Extract JSX content (improved regex)
      const jsxMatch = mainFile.content.match(/return\s*\{\s*([\s\S]*?)\s*\}\s*;?\s*}/)

      if (jsxMatch) {
        let jsx = jsxMatch[1].trim()

        // Better JSX to HTML conversion
        jsx = jsx
          .replace(/className=/g, "class=")
          .replace(/\{[^}]*\}/g, (match) => {
            // Handle simple variable references
            if (match.includes("props.") || match.includes("state.")) {
              return '"dynamic-content"'
            }
            // Handle string literals
            if (match.includes("'") || match.includes('"')) {
              return match.replace(/[{}]/g, "")
            }
            return '""'
          })
          .replace(/<(\w+)([^>]*?)\/>/g, "<$1$2></$1>") // Self-closing tags
          .replace(/\s+/g, " ") // Clean up whitespace

        const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <style>
              ${cssContent}
              body { 
                margin: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
              }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            ${jsx}
          </body>
        </html>
      `

        setPreviewContent(html)
      } else {
        // Fallback for non-React files
        setPreviewContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                padding: 20px; 
                background: #f5f5f5;
              }
              .preview-message {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="preview-message">
              <h2>Preview Not Available</h2>
              <p>This file type doesn't support live preview.</p>
              <p>Supported: HTML, React components with JSX</p>
            </div>
          </body>
        </html>
      `)
      }
    } else {
      // No preview available
      setPreviewContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              padding: 20px; 
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .preview-message {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
          </style>
        </head>
        <body>
          <div class="preview-message">
            <h2>🚀 Upload Your Project</h2>
            <p>Upload a project folder to see live preview of your application.</p>
            <p><strong>Supported:</strong> React, HTML, CSS projects</p>
          </div>
        </body>
      </html>
    `)
    }

    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    generatePreview()
  }, [files])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="h-10 border-b border-border/50 flex items-center justify-between px-3 bg-background/30">
            <span className="text-sm font-medium">Preview</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={generatePreview} disabled={isLoading}>
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleFullscreen}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-white">
            {previewContent ? (
              <iframe srcDoc={previewContent} className="w-full h-full border-0" sandbox="allow-scripts" />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Preview will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background/20">
      <div className="h-10 border-b border-border/50 flex items-center justify-between px-3 bg-background/30">
        <span className="text-sm font-medium">Preview</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={generatePreview} disabled={isLoading}>
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-white">
        {previewContent ? (
          <iframe srcDoc={previewContent} className="w-full h-full border-0" sandbox="allow-scripts" />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Preview will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
