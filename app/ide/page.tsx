"use client"

import { useState, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { AIChat } from "@/components/ai-chat"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Code2, User, LogOut, Settings, Save, Play, Share, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function IDEPage() {
  const [activeFile, setActiveFile] = useState<string | null>("src/App.tsx")
  const [files, setFiles] = useState({
    "src/App.tsx": {
      content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello World</h1>
        <p>Welcome to your IDE!</p>
        <p>Start building something amazing!</p>
      </header>
    </div>
  );
}

export default App;`,
      language: "typescript",
    },
    "src/App.css": {
      content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.App-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.App-header p {
  font-size: 1.2rem;
  margin: 0.5rem 0;
}`,
      language: "css",
    },
    "package.json": {
      content: `{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "description": "A project created with Modern IDE",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}`,
      language: "json",
    },
    "README.md": {
      content: `# My Awesome Project

This project was created using Modern IDE.

## Getting Started

1. Install dependencies: \`npm install\`
2. Start the development server: \`npm start\`
3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Features

- Modern React setup
- Hot reload development
- Built with Modern IDE

Happy coding! 🚀`,
      language: "markdown",
    },
  })

  const [isLoadingProject, setIsLoadingProject] = useState(false)
  const { toast } = useToast()

  // Enhanced data retrieval with IndexedDB support
  const getProjectData = async (keyPrefix: string): Promise<any> => {
    try {
      const method = sessionStorage.getItem(`${keyPrefix}_method`)

      if (method === "indexedDB") {
        return await getDataFromIndexedDB(keyPrefix)
      } else {
        return getDataFromSessionStorage(keyPrefix)
      }
    } catch (error) {
      console.error("Failed to retrieve project data:", error)
      return null
    }
  }

  const getDataFromSessionStorage = (keyPrefix: string): any => {
    try {
      const chunkCount = Number.parseInt(sessionStorage.getItem(`${keyPrefix}_chunks`) || "0")
      if (chunkCount === 0) return null

      let jsonString = ""
      for (let i = 0; i < chunkCount; i++) {
        const chunk = sessionStorage.getItem(`${keyPrefix}_chunk_${i}`)
        if (chunk === null) return null
        jsonString += chunk
      }

      return JSON.parse(jsonString)
    } catch (error) {
      console.error("Failed to retrieve from sessionStorage:", error)
      return null
    }
  }

  const getDataFromIndexedDB = (keyPrefix: string): Promise<any> => {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open("ModernIDE", 1)

        request.onerror = () => {
          console.error("IndexedDB failed to open")
          resolve(null)
        }

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(["projects"], "readonly")
          const store = transaction.objectStore("projects")
          const getRequest = store.get(keyPrefix)

          getRequest.onsuccess = () => {
            const result = getRequest.result
            resolve(result ? result.data : null)
          }

          getRequest.onerror = () => {
            console.error("IndexedDB get failed")
            resolve(null)
          }
        }
      } catch (error) {
        console.error("IndexedDB error:", error)
        resolve(null)
      }
    })
  }

  // Enhanced cleanup function
  const clearProjectData = async (keyPrefix: string): Promise<void> => {
    try {
      const method = sessionStorage.getItem(`${keyPrefix}_method`)

      if (method === "indexedDB") {
        await clearIndexedDBData(keyPrefix)
      }

      // Always clear sessionStorage
      clearSessionStorageData(keyPrefix)
    } catch (error) {
      console.error("Failed to clear project data:", error)
    }
  }

  const clearSessionStorageData = (keyPrefix: string): void => {
    try {
      const chunkCount = Number.parseInt(sessionStorage.getItem(`${keyPrefix}_chunks`) || "0")
      sessionStorage.removeItem(`${keyPrefix}_chunks`)
      sessionStorage.removeItem(`${keyPrefix}_method`)

      for (let i = 0; i < Math.max(chunkCount, 100); i++) {
        sessionStorage.removeItem(`${keyPrefix}_chunk_${i}`)
      }
    } catch (error) {
      console.error("Failed to clear sessionStorage:", error)
    }
  }

  const clearIndexedDBData = (keyPrefix: string): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open("ModernIDE", 1)

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(["projects"], "readwrite")
          const store = transaction.objectStore("projects")

          const deleteRequest = store.delete(keyPrefix)
          deleteRequest.onsuccess = () => resolve()
          deleteRequest.onerror = () => resolve()
        }

        request.onerror = () => resolve()
      } catch (error) {
        console.error("IndexedDB cleanup error:", error)
        resolve()
      }
    })
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const source = searchParams.get("source")

    if (source === "upload") {
      setIsLoadingProject(true)

      // Load uploaded project with enhanced retrieval
      getProjectData("uploadedProject").then((projectFiles) => {
        if (projectFiles && Object.keys(projectFiles).length > 0) {
          try {
            setFiles(projectFiles)

            // Set the first file as active
            const firstFile = Object.keys(projectFiles)[0]
            if (firstFile) {
              setActiveFile(firstFile)
            }

            // Clear the storage after loading
            clearProjectData("uploadedProject")

            toast({
              title: "Project Loaded Successfully",
              description: `Loaded ${Object.keys(projectFiles).length} files`,
            })
          } catch (error) {
            console.error("Error loading uploaded project:", error)
            toast({
              title: "Error Loading Project",
              description: "Failed to load uploaded project. Using default template.",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "No Project Data",
            description: "No uploaded project found. Using default template.",
            variant: "destructive",
          })
        }

        setIsLoadingProject(false)
      })
    }
  }, [])

  const getLanguageFromPath = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript"
      case "js":
      case "jsx":
        return "javascript"
      case "css":
        return "css"
      case "json":
        return "json"
      case "html":
        return "html"
      case "md":
        return "markdown"
      default:
        return "typescript"
    }
  }

  const handleFileRename = (oldPath: string, newPath: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev }
      const fileData = newFiles[oldPath]
      if (fileData) {
        newFiles[newPath] = fileData
        delete newFiles[oldPath]

        if (activeFile === oldPath) {
          setActiveFile(newPath)
        }
      }
      return newFiles
    })
  }

  const handleFolderCreate = (path: string) => {
    const placeholderPath = `${path}/.folder`
    setFiles((prev) => ({
      ...prev,
      [placeholderPath]: { content: "", language: "text" },
    }))
  }

  const handleFolderDelete = (folderPath: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev }

      const filesToDelete = Object.keys(newFiles).filter(
        (filePath) => filePath.startsWith(folderPath + "/") || filePath === folderPath,
      )

      filesToDelete.forEach((filePath) => {
        delete newFiles[filePath]

        if (activeFile === filePath) {
          const remainingFiles = Object.keys(newFiles).filter((f) => !filesToDelete.includes(f))
          setActiveFile(remainingFiles[0] || null)
        }
      })

      return newFiles
    })
  }

  return (
    <div className="h-screen w-full bg-background text-foreground font-mono">
      {/* Header */}
      <div className="h-12 border-b border-border/50 flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/get-started" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Modern IDE</span>
          </Link>

          {isLoadingProject ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading project...
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">John Doe</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-3rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <FileExplorer
              files={files}
              activeFile={activeFile}
              onFileSelect={setActiveFile}
              onFileCreate={(path, content) => {
                const language = getLanguageFromPath(path)
                setFiles((prev) => ({
                  ...prev,
                  [path]: { content, language },
                }))
              }}
              onFileDelete={(path) => {
                setFiles((prev) => {
                  const newFiles = { ...prev }
                  delete newFiles[path]
                  return newFiles
                })
                if (activeFile === path) {
                  const remainingFiles = Object.keys(files).filter((f) => f !== path)
                  setActiveFile(remainingFiles[0] || null)
                }
              }}
              onFileRename={handleFileRename}
              onFolderCreate={handleFolderCreate}
              onFolderDelete={handleFolderDelete}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code Editor & Preview */}
          <ResizablePanel defaultSize={55} minSize={30}>
            <CodeEditor
              files={files}
              activeFile={activeFile}
              onFileChange={(path, content) => {
                setFiles((prev) => ({
                  ...prev,
                  [path]: { ...prev[path], content },
                }))
              }}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* AI Chat */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <AIChat />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
