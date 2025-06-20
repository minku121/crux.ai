"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { MonacoEditor } from "@/components/monaco-editor"
import { WebContainerPreview } from "./webcontainer-preview"
import { Terminal } from "@/components/terminal"
import { Code, TerminalIcon, Maximize2, Minimize2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeEditorProps {
  files: Record<string, { content: string; language: string }>
  activeFile: string | null
  onFileChange: (path: string, content: string) => void
}

export function CodeEditor({ files, activeFile, onFileChange }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState("code")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewStatus, setPreviewStatus] = useState<"idle" | "booting" | "installing" | "running" | "error">("idle")
  const [webContainerLogs, setWebContainerLogs] = useState<string[]>([])

  if (!activeFile || !files[activeFile]) {
    return (
      <div className="h-full flex items-center justify-center bg-background/30 backdrop-blur-sm">
        <div className="text-center text-muted-foreground">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a file to start editing</p>
        </div>
      </div>
    )
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getPreviewStatusColor = (status: typeof previewStatus) => {
    switch (status) {
      case "idle":
        return "bg-gray-500"
      case "booting":
        return "bg-blue-500"
      case "installing":
        return "bg-yellow-500"
      case "running":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="border-b border-border/50 bg-background/50">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="text-sm font-medium">{activeFile}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="h-8 bg-transparent border-0 p-0">
                    <TabsTrigger
                      value="code"
                      className="h-8 px-3 text-xs data-[state=active]:bg-background/80 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                    >
                      <Code className="h-3 w-3 mr-1" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger
                      value="preview"
                      className="h-8 px-3 text-xs data-[state=active]:bg-background/80 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      Live Preview
                      <div className={`w-2 h-2 rounded-full ${getPreviewStatusColor(previewStatus)}`} />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleFullscreen}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="code" className="h-full m-0">
                <MonacoEditor
                  value={files[activeFile].content}
                  language={files[activeFile].language}
                  onChange={(value) => onFileChange(activeFile, value)}
                />
              </TabsContent>
              <TabsContent value="preview" className="h-full m-0">
                <WebContainerPreview files={files} onStatusChange={setPreviewStatus} onLogsChange={setWebContainerLogs} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background/30 backdrop-blur-sm">
      <div className="border-b border-border/50 bg-background/50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">{activeFile}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="h-8 bg-transparent border-0 p-0">
                <TabsTrigger
                  value="code"
                  className="h-8 px-3 text-xs data-[state=active]:bg-background/80 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Code className="h-3 w-3 mr-1" />
                  Code
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="h-8 px-3 text-xs data-[state=active]:bg-background/80 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  Live Preview
                  <div className={`w-2 h-2 rounded-full ${getPreviewStatusColor(previewStatus)}`} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={70} minSize={30}>
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="code" className="h-full m-0">
              <MonacoEditor
                value={files[activeFile].content}
                language={files[activeFile].language}
                onChange={(value) => onFileChange(activeFile, value)}
              />
            </TabsContent>
            <TabsContent value="preview" className="h-full m-0">
              <WebContainerPreview files={files} onStatusChange={setPreviewStatus} onLogsChange={setWebContainerLogs} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full border-t border-border/50">
            <div className="h-8 bg-background/50 border-b border-border/50 flex items-center px-3">
              <TerminalIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Terminal</span>
            </div>
            <Terminal webContainerLogs={webContainerLogs} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
