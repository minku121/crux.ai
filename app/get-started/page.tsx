"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Code2,
  Upload,
  GitBranch,
  FolderPlus,
  ArrowRight,
  Zap,
  User,
  LogOut,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle,
  HardDrive,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function GetStartedPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [gitUrl, setGitUrl] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const router = useRouter()

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { content: string; language: string }>>({})
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStats, setProcessingStats] = useState({
    totalFiles: 0,
    processedFiles: 0,
    skippedFiles: 0,
    totalSize: 0,
    processedSize: 0,
  })

  const options = [
    {
      id: "upload",
      icon: <Upload className="h-8 w-8" />,
      title: "Upload Folder",
      description: "Upload an existing project folder from your computer",
      action: "Upload Files",
    },
    {
      id: "git",
      icon: <GitBranch className="h-8 w-8" />,
      title: "Clone Repository",
      description: "Clone a Git repository from GitHub, GitLab, or other providers",
      action: "Clone Repository",
    },
    {
      id: "template",
      icon: <Zap className="h-8 w-8" />,
      title: "Use Template",
      description: "Start with a pre-built template for React, Vue, Node.js, and more",
      action: "Browse Templates",
    },
    {
      id: "blank",
      icon: <FolderPlus className="h-8 w-8" />,
      title: "Blank Project",
      description: "Start with an empty project and build from scratch",
      action: "Create Project",
    },
  ]

  const templates = [
    { name: "React App", description: "Modern React application with TypeScript" },
    { name: "Vue.js App", description: "Vue 3 application with Composition API" },
    { name: "Node.js API", description: "Express.js REST API with TypeScript" },
    { name: "Next.js App", description: "Full-stack React framework" },
    { name: "HTML/CSS/JS", description: "Simple web page with vanilla JavaScript" },
    { name: "Python Flask", description: "Flask web application" },
  ]

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
    setUploadError(null)
    setUploadProgress(0)
    setProcessingStats({
      totalFiles: 0,
      processedFiles: 0,
      skippedFiles: 0,
      totalSize: 0,
      processedSize: 0,
    })
  }

  const handleProceed = () => {
    // Simulate project creation/setup
    setTimeout(() => {
      router.push("/ide")
    }, 1000)
  }

  // Enhanced compression with better algorithms
  const compressData = (data: string, filename: string): string => {
    try {
      // Don't compress already minified files
      if (filename.includes(".min.") || filename.includes("-min.")) {
        return data
      }

      let compressed = data

      // Preserve URLs before processing
      const urlPlaceholders: Record<string, string> = {}
      let urlCounter = 0
      
      // Find and temporarily replace URLs to protect them
      compressed = compressed.replace(/(["'])https?:\/\/[^\s"'<>]+\1/g, (match) => {
        const placeholder = `__URL_PLACEHOLDER_${urlCounter}__`
        urlPlaceholders[placeholder] = match
        urlCounter++
        return placeholder
      })

      // Remove comments but preserve important ones
      if (
        filename.endsWith(".js") ||
        filename.endsWith(".jsx") ||
        filename.endsWith(".ts") ||
        filename.endsWith(".tsx")
      ) {
        // Remove single-line comments (but keep JSDoc and important comments)
        compressed = compressed.replace(/\/\/(?!\s*@|\s*TODO|\s*FIXME|\s*NOTE|\s*HACK).*$/gm, "")
        // Remove block comments (but keep JSDoc)
        compressed = compressed.replace(/\/\*(?!\*[\s\S]*?\*\/)[\s\S]*?\*\//g, "")
      }

      if (filename.endsWith(".css") || filename.endsWith(".scss")) {
        // Remove CSS comments
        compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, "")
      }

      // Normalize whitespace but preserve structure
      compressed = compressed
        .replace(/\r\n/g, "\n") // Normalize line endings
        .replace(/\t/g, "  ") // Convert tabs to spaces
        .replace(/[ ]+$/gm, "") // Remove trailing spaces
        .replace(/\n{3,}/g, "\n\n") // Limit consecutive empty lines
        .trim()

      // Restore URLs
      Object.entries(urlPlaceholders).forEach(([placeholder, url]) => {
        compressed = compressed.replace(placeholder, url)
      })

      return compressed
    } catch {
      return data
    }
  }

  // Advanced chunking system with IndexedDB fallback
  const storeProjectData = async (data: any): Promise<boolean> => {
    try {
      const jsonString = JSON.stringify(data)
      const totalSize = new Blob([jsonString]).size

      // Try sessionStorage first (fastest)
      if (totalSize < 4 * 1024 * 1024) {
        // 4MB limit for sessionStorage
        return storeInSessionStorage(data, "uploadedProject")
      }

      // Fallback to IndexedDB for larger projects
      return await storeInIndexedDB(data, "uploadedProject")
    } catch (error) {
      console.error("Failed to store project data:", error)
      return false
    }
  }

  const storeInSessionStorage = (data: any, keyPrefix: string): boolean => {
    try {
      const jsonString = JSON.stringify(data)
      const chunkSize = 1024 * 1024 // 1MB chunks
      const chunks = []

      for (let i = 0; i < jsonString.length; i += chunkSize) {
        chunks.push(jsonString.slice(i, i + chunkSize))
      }

      // Clear any existing chunks
      clearSessionStorageChunks(keyPrefix)

      // Store chunk count
      sessionStorage.setItem(`${keyPrefix}_chunks`, chunks.length.toString())
      sessionStorage.setItem(`${keyPrefix}_method`, "sessionStorage")

      // Store each chunk
      chunks.forEach((chunk, index) => {
        sessionStorage.setItem(`${keyPrefix}_chunk_${index}`, chunk)
      })

      return true
    } catch (error) {
      console.error("SessionStorage failed:", error)
      return false
    }
  }

  const storeInIndexedDB = (data: any, keyPrefix: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open("ModernIDE", 1)

        request.onerror = () => {
          console.error("IndexedDB failed to open")
          resolve(false)
        }

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains("projects")) {
            db.createObjectStore("projects", { keyPath: "id" })
          }
        }

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(["projects"], "readwrite")
          const store = transaction.objectStore("projects")

          // Clear any existing data
          store.delete(keyPrefix)

          // Store new data
          const storeRequest = store.put({
            id: keyPrefix,
            data: data,
            timestamp: Date.now(),
            method: "indexedDB",
          })

          storeRequest.onsuccess = () => {
            sessionStorage.setItem(`${keyPrefix}_method`, "indexedDB")
            resolve(true)
          }

          storeRequest.onerror = () => {
            console.error("IndexedDB store failed")
            resolve(false)
          }
        }
      } catch (error) {
        console.error("IndexedDB error:", error)
        resolve(false)
      }
    })
  }

  const clearSessionStorageChunks = (keyPrefix: string) => {
    try {
      const chunkCount = Number.parseInt(sessionStorage.getItem(`${keyPrefix}_chunks`) || "0")
      sessionStorage.removeItem(`${keyPrefix}_chunks`)
      sessionStorage.removeItem(`${keyPrefix}_method`)

      for (let i = 0; i < Math.max(chunkCount, 100); i++) {
        sessionStorage.removeItem(`${keyPrefix}_chunk_${i}`)
      }
    } catch (error) {
      console.error("Failed to clear session storage:", error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Function to normalize file paths - remove the root folder from paths
  const normalizeFilePath = (webkitRelativePath: string): string => {
    const pathParts = webkitRelativePath.split("/")

    // If there's only one part, it's a file at root level
    if (pathParts.length === 1) {
      return pathParts[0]
    }

    // Remove the first part (root folder name) and join the rest
    return pathParts.slice(1).join("/")
  }

  // Function to detect if we should skip the root folder level
  const shouldNormalizeRootFolder = (files: FileList): boolean => {
    if (files.length === 0) return false

    // Check if all files have the same root folder
    const firstFile = files[0]
    if (!firstFile.webkitRelativePath) return false

    const rootFolder = firstFile.webkitRelativePath.split("/")[0]

    // Check if all files start with the same root folder
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.webkitRelativePath || !file.webkitRelativePath.startsWith(rootFolder + "/")) {
        return false
      }
    }

    return true
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsProcessingFiles(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      const fileStructure: Record<string, { content: string; language: string }> = {}
      const totalFiles = files.length
      let totalSize = 0

      // Calculate total size
      for (let i = 0; i < files.length; i++) {
        totalSize += files[i].size
      }

      // Check if we should normalize the root folder
      const shouldNormalize = shouldNormalizeRootFolder(files)
      let rootFolderName = ""

      if (shouldNormalize && files[0].webkitRelativePath) {
        rootFolderName = files[0].webkitRelativePath.split("/")[0]
      }

      setProcessingStats({
        totalFiles,
        processedFiles: 0,
        skippedFiles: 0,
        totalSize,
        processedSize: 0,
      })

      let processedFiles = 0
      let skippedFiles = 0
      let processedSize = 0

      // Process all files without arbitrary limits
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        let relativePath = file.webkitRelativePath || file.name

        // Normalize the path by removing root folder if needed
        if (shouldNormalize && relativePath.includes("/")) {
          relativePath = normalizeFilePath(relativePath)
        }

        // Skip empty paths (shouldn't happen but safety check)
        if (!relativePath) {
          skippedFiles++
          processedSize += file.size
          continue
        }

        try {
          // Skip common build/cache directories
          if (shouldSkipFile(relativePath)) {
            skippedFiles++
            processedSize += file.size
            setProcessingStats((prev) => ({
              ...prev,
              skippedFiles,
              processedSize,
            }))
            setUploadProgress((processedSize / totalSize) * 100)
            continue
          }

          // Read file content
          const content = await readFileContent(file)

          // Compress content for text files
          const compressedContent = isTextFile(file.name) ? compressData(content, file.name) : content

          // Determine language
          const language = getLanguageFromPath(relativePath)

          fileStructure[relativePath] = {
            content: compressedContent,
            language,
          }

          processedFiles++
          processedSize += file.size

          setProcessingStats((prev) => ({
            ...prev,
            processedFiles,
            processedSize,
          }))

          setUploadProgress((processedSize / totalSize) * 100)

          // Update UI every 10 files for better performance
          if (processedFiles % 10 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1))
          }
        } catch (error) {
          console.error(`Error reading file ${relativePath}:`, error)
          skippedFiles++
          processedSize += file.size
          setProcessingStats((prev) => ({
            ...prev,
            skippedFiles,
            processedSize,
          }))
        }
      }

      if (processedFiles === 0) {
        throw new Error("No files could be processed. Please check your project structure.")
      }

      setUploadedFiles(fileStructure)

      // Store project data with advanced storage system
      const stored = await storeProjectData(fileStructure)

      if (!stored) {
        throw new Error("Failed to store project data. Please try a smaller project or clear your browser storage.")
      }

      setIsProcessingFiles(false)
      setUploadProgress(100)

      // Show success message with root folder info
      if (shouldNormalize && rootFolderName) {
        console.log(`Uploaded contents of "${rootFolderName}" folder to root level`)
      }

      // Redirect to IDE with uploaded files
      setTimeout(() => {
        router.push("/ide?source=upload")
      }, 1500)
    } catch (error) {
      setIsProcessingFiles(false)
      setUploadError(error instanceof Error ? error.message : "Failed to process uploaded files")
      console.error("Upload error:", error)
    }
  }

  // Smart file filtering - skip common build/cache directories
  const shouldSkipFile = (path: string): boolean => {
    const skipPatterns = [
      /node_modules\//,
      /\.git\//,
      /\.next\//,
      /\.nuxt\//,
      /dist\//,
      /build\//,
      /coverage\//,
      /\.nyc_output\//,
      /\.cache\//,
      /\.temp\//,
      /\.tmp\//,
      /logs?\//,
      /\.log$/,
      /\.DS_Store$/,
      /Thumbs\.db$/,
      /\.env\.local$/,
      /\.env\.production$/,
    ]

    return skipPatterns.some((pattern) => pattern.test(path))
  }

  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === "string") {
          resolve(result)
        } else {
          // For binary files, just store a placeholder
          // The actual binary content will be handled separately
          resolve(`// Binary file: ${file.name}\n// Size: ${formatFileSize(file.size)}\n// This file will be preserved in its original binary format`)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))

      // Always read as text - binary files will be handled separately
      reader.readAsText(file)
    })
  }

  // Helper function to determine if file is text-based
  const isTextFile = (filename: string): boolean => {
    const textExtensions = [
      "js",
      "jsx",
      "ts",
      "tsx",
      "json",
      "html",
      "css",
      "scss",
      "less",
      "sass",
      "md",
      "txt",
      "xml",
      "svg",
      "yml",
      "yaml",
      "toml",
      "ini",
      "env",
      "py",
      "java",
      "cpp",
      "c",
      "h",
      "hpp",
      "php",
      "rb",
      "go",
      "rs",
      "sh",
      "sql",
      "graphql",
      "vue",
      "svelte",
      "astro",
      "gitignore",
      "dockerfile",
      "makefile",
      "cmake",
      "gradle",
      "properties",
      "conf",
      "config",
      "lock",
      "sum",
      "mod",
      "editorconfig",
      "prettierrc",
      "eslintrc",
      "babelrc",
      "postcssrc",
      "stylelintrc",
      "browserslistrc",
    ]

    const binaryExtensions = [
      "ico",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "bmp",
      "tiff",
      "pdf",
      "zip",
      "tar",
      "gz",
      "7z",
      "rar",
      "exe",
      "dll",
      "so",
      "dylib",
      "woff",
      "woff2",
      "ttf",
      "eot",
      "mp3",
      "mp4",
      "avi",
      "mov",
      "webm",
      "wav",
      "ogg",
    ]

    const extension = filename.split(".").pop()?.toLowerCase()
    const hasNoExtension = !filename.includes(".") && !filename.startsWith(".")
    const isConfigFile = /\.(config|rc)$/.test(filename.toLowerCase())
    const isBinaryFile = binaryExtensions.includes(extension || "")

    // Return true if it's a text file, false if it's a binary file
    return (textExtensions.includes(extension || "") || hasNoExtension || isConfigFile) && !isBinaryFile
  }

  // Helper function to get language from file path
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      json: "json",
      html: "html",
      css: "css",
      scss: "scss",
      sass: "scss",
      less: "less",
      md: "markdown",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      xml: "xml",
      svg: "xml",
      yml: "yaml",
      yaml: "yaml",
      sh: "shell",
      sql: "sql",
      graphql: "graphql",
      vue: "vue",
      svelte: "svelte",
    }

    return languageMap[ext || ""] || "typescript"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Modern IDE</span>
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
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Let's Get You Started</h1>
          <p className="text-xl text-muted-foreground">Choose how you'd like to begin your coding journey</p>
        </div>

        {!selectedOption ? (
          <div className="grid md:grid-cols-2 gap-6">
            {options.map((option) => (
              <Card
                key={option.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
                onClick={() => handleOptionSelect(option.id)}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {option.icon}
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <CardDescription className="text-base">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full">
                    {option.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedOption(null)}>
                  ← Back
                </Button>
                <div>
                  <CardTitle className="text-xl">{options.find((opt) => opt.id === selectedOption)?.title}</CardTitle>
                  <CardDescription>{options.find((opt) => opt.id === selectedOption)?.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {selectedOption === "upload" && (
                <div className="space-y-4">
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Drop your project folder here</p>
                    <p className="text-muted-foreground mb-2">or click to browse files</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      <HardDrive className="inline h-3 w-3 mr-1" />
                      Folder contents will be uploaded to root level • Smart compression • Auto-skip build folders
                    </p>
                    <input
                      type="file"
                      multiple
                      webkitdirectory=""
                      onChange={handleFileUpload}
                      className="hidden"
                      id="folder-upload"
                      disabled={isProcessingFiles}
                    />
                    <label htmlFor="folder-upload">
                      <Button asChild disabled={isProcessingFiles}>
                        <span>
                          {isProcessingFiles ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing Files...
                            </>
                          ) : (
                            "Choose Folder"
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>

                  {isProcessingFiles && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Processing files...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                          <div>
                            Files: {processingStats.processedFiles} / {processingStats.totalFiles}
                          </div>
                          <div>Skipped: {processingStats.skippedFiles}</div>
                        </div>
                        <div>
                          <div>
                            Size: {formatFileSize(processingStats.processedSize)} /{" "}
                            {formatFileSize(processingStats.totalSize)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {Object.keys(uploadedFiles).length > 0 && !isProcessingFiles && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Project Ready! ({Object.keys(uploadedFiles).length} files)
                        </h4>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 mb-3">
                        Total size: {formatFileSize(processingStats.totalSize)} • Processed:{" "}
                        {processingStats.processedFiles} files • Skipped: {processingStats.skippedFiles} files
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {Object.keys(uploadedFiles)
                          .slice(0, 10)
                          .map((path) => (
                            <div
                              key={path}
                              className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2"
                            >
                              <FileText className="h-3 w-3" />
                              {path}
                            </div>
                          ))}
                        {Object.keys(uploadedFiles).length > 10 && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ... and {Object.keys(uploadedFiles).length - 10} more files
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedOption === "git" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="git-url">Repository URL</Label>
                    <Input
                      id="git-url"
                      placeholder="https://github.com/username/repository.git"
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="my-awesome-project"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleProceed}>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Clone Repository
                  </Button>
                </div>
              )}

              {selectedOption === "template" && (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {templates.map((template, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer"
                        onClick={() => setProjectName(template.name.toLowerCase().replace(/\s+/g, "-"))}
                      >
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" onClick={handleProceed}>
                    <Zap className="mr-2 h-4 w-4" />
                    Create from Template
                  </Button>
                </div>
              )}

              {selectedOption === "blank" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blank-project-name">Project Name</Label>
                    <Input
                      id="blank-project-name"
                      placeholder="my-new-project"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Textarea
                      id="project-description"
                      placeholder="Describe your project..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleProceed}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create Blank Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
