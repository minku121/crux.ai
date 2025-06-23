"use client"

import { useState } from "react"
import * as ReactDOM from "react-dom/client"
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  FileText,
  Edit2,
  FolderPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FileExplorerProps {
  files: Record<string, { content: string; language: string }>
  activeFile: string | null
  onFileSelect: (path: string) => void
  onFileCreate: (path: string, content: string) => void
  onFileDelete: (path: string) => void
  onFileRename: (oldPath: string, newPath: string) => void
  onFolderCreate: (path: string) => void
  onFolderDelete: (path: string) => void
}

export function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFolderCreate,
  onFolderDelete,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]))
  const [newFileName, setNewFileName] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [creatingInPath, setCreatingInPath] = useState<string>("")
  const [creationType, setCreationType] = useState<"file" | "folder" | null>(null)
  const [renamingItem, setRenamingItem] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null)
  const { toast } = useToast()

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const startCreating = (type: "file" | "folder", parentPath = "") => {
    setCreationType(type)
    setCreatingInPath(parentPath)
    if (type === "file") {
      setNewFileName("")
    } else {
      setNewFolderName("")
    }

    // Expand the parent folder if creating inside it
    if (parentPath) {
      setExpandedFolders((prev) => new Set([...prev, parentPath]))
    }
  }

  const handleContextMenu = (e: React.MouseEvent, path: string, isFolder: boolean) => {
    e.preventDefault()
    
    const menu = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-full h-full absolute top-0 left-0"></div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem onClick={() => startCreating("file", isFolder ? path : path.split('/').slice(0, -1).join('/'))}>
            <File className="mr-2 h-4 w-4" />
            New File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startCreating("folder", isFolder ? path : path.split('/').slice(0, -1).join('/'))}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startRename(path)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600" 
            onClick={() => isFolder ? setDeletingFolder(path) : onFileDelete(path)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    // Show context menu at cursor position
    const { clientX: x, clientY: y } = e
    const contextMenu = document.createElement('div')
    contextMenu.style.position = 'absolute'
    contextMenu.style.left = `${x}px`
    contextMenu.style.top = `${y}px`
    contextMenu.style.zIndex = '9999'
    document.body.appendChild(contextMenu)
    
    // Render menu and remove after selection
    const root = ReactDOM.createRoot(contextMenu)
    root.render(menu)
    
    const removeMenu = () => {
      root.unmount()
      document.body.removeChild(contextMenu)
      document.removeEventListener('click', removeMenu)
    }
    
    document.addEventListener('click', removeMenu)
  }

  const createFile = () => {
    if (!newFileName.trim()) return

    const path = creatingInPath ? `${creatingInPath}/${newFileName}` : newFileName

    if (files[path]) {
      toast({
        title: "File exists",
        description: "A file with this name already exists.",
        variant: "destructive",
      })
      return
    }

    const getLanguageFromExtension = (filename: string) => {
      const ext = filename.split(".").pop()?.toLowerCase()
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
        default:
          return "typescript"
      }
    }

    const language = getLanguageFromExtension(newFileName)
    onFileCreate(path, "// New file\n")
    setNewFileName("")
    setCreationType(null)
    setCreatingInPath("")
    toast({
      title: "File created",
      description: `Created ${newFileName}`,
    })
  }

  const createFolder = () => {
    if (!newFolderName.trim()) return

    const path = creatingInPath ? `${creatingInPath}/${newFolderName}` : newFolderName

    // Check if folder already exists
    const folderExists = Object.keys(files).some((filePath) => filePath.startsWith(path + "/") || filePath === path)

    if (folderExists) {
      toast({
        title: "Folder exists",
        description: "A folder with this name already exists.",
        variant: "destructive",
      })
      return
    }

    onFolderCreate(path)
    setExpandedFolders((prev) => new Set([...prev, path]))
    setNewFolderName("")
    setCreationType(null)
    setCreatingInPath("")
    toast({
      title: "Folder created",
      description: `Created folder ${newFolderName}`,
    })
  }

  const startRename = (path: string) => {
    setRenamingItem(path)
    const fileName = path.split("/").pop() || ""
    setRenameValue(fileName)
  }

  const confirmRename = () => {
    if (!renamingItem || !renameValue.trim()) return

    const pathParts = renamingItem.split("/")
    pathParts[pathParts.length - 1] = renameValue.trim()
    const newPath = pathParts.join("/")

    if (newPath === renamingItem) {
      setRenamingItem(null)
      setRenameValue("")
      return
    }

    if (files[newPath]) {
      toast({
        title: "Name conflict",
        description: "A file with this name already exists.",
        variant: "destructive",
      })
      return
    }

    onFileRename(renamingItem, newPath)
    setRenamingItem(null)
    setRenameValue("")
    toast({
      title: "Renamed",
      description: `Renamed to ${renameValue}`,
    })
  }

  const cancelRename = () => {
    setRenamingItem(null)
    setRenameValue("")
  }

  const cancelCreating = () => {
    setCreationType(null)
    setCreatingInPath("")
    setNewFileName("")
    setNewFolderName("")
  }

  const handleFolderDelete = (folderPath: string) => {
    setDeletingFolder(folderPath)
  }

  const confirmFolderDelete = () => {
    if (!deletingFolder) return

    // Get all files in the folder
    const filesInFolder = Object.keys(files).filter((filePath) => filePath.startsWith(deletingFolder + "/"))
    const folderName = deletingFolder.split("/").pop()

    onFolderDelete(deletingFolder)
    setDeletingFolder(null)

    toast({
      title: "Folder deleted",
      description: `Deleted folder "${folderName}" and ${filesInFolder.length} file(s)`,
    })
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()
    switch (ext) {
      case "tsx":
      case "ts":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "jsx":
      case "js":
        return <FileText className="h-4 w-4 text-yellow-500" />
      case "css":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "json":
        return <FileText className="h-4 w-4 text-green-500" />
      case "html":
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const fileTree = Object.keys(files).reduce((acc, path) => {
    const parts = path.split("/")
    let current = acc

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    current[parts[parts.length - 1]] = null
    return acc
  }, {} as any)

  const renderTree = (tree: any, path = "", level = 0) => {
    const entries = Object.entries(tree)
    const result: JSX.Element[] = []

    entries.forEach(([name, children]) => {
      // Skip .folder placeholder files
      if (name === ".folder") return

      const fullPath = path ? `${path}/${name}` : name
      const isFolder = children !== null
      const isExpanded = expandedFolders.has(fullPath)
      const isActive = activeFile === fullPath
      const isRenaming = renamingItem === fullPath

      result.push(
        <div key={fullPath}>
          <div
            className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent/50 rounded-sm transition-colors group ${
              isActive ? "bg-accent text-accent-foreground" : ""
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {isFolder ? (
              <>
                <div onClick={() => toggleFolder(fullPath)} className="flex items-center gap-1">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-4" />
                {getFileIcon(name)}
              </>
            )}

            {isRenaming ? (
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="h-6 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename()
                  if (e.key === "Escape") cancelRename()
                }}
                onBlur={confirmRename}
                autoFocus
              />
            ) : (
              <>
                <span
                  className="flex-1 truncate"
                  onClick={() => {
                    if (isFolder) {
                      toggleFolder(fullPath)
                    } else {
                      onFileSelect(fullPath)
                    }
                  }}
                >
                  {name}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  {isFolder && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => startCreating("file", fullPath)}>
                          <FileText className="mr-2 h-4 w-4" />
                          New File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startCreating("folder", fullPath)}>
                          <FolderPlus className="mr-2 h-4 w-4" />
                          New Folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      startRename(fullPath)
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isFolder) {
                        handleFolderDelete(fullPath)
                      } else {
                        onFileDelete(fullPath)
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
          {isFolder && isExpanded && children && renderTree(children, fullPath, level + 1)}

          {/* Render creation inputs inside the folder */}
          {isFolder && isExpanded && creatingInPath === fullPath && (
            <div style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }} className="px-2 py-1">
              {creationType === "file" ? (
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.tsx"
                  className="h-6 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createFile()
                    if (e.key === "Escape") cancelCreating()
                  }}
                  autoFocus
                />
              ) : (
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="folder-name"
                  className="h-6 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createFolder()
                    if (e.key === "Escape") cancelCreating()
                  }}
                  autoFocus
                />
              )}
            </div>
          )}
        </div>,
      )
    })

    // Render creation inputs at root level
    if (level === 0 && creatingInPath === "" && creationType) {
      result.push(
        <div key="creating-root" className="px-2 py-1" style={{ paddingLeft: "8px" }}>
          {creationType === "file" ? (
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.tsx"
              className="h-6 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") createFile()
                if (e.key === "Escape") cancelCreating()
              }}
              autoFocus
            />
          ) : (
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="folder-name"
              className="h-6 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder()
                if (e.key === "Escape") cancelCreating()
              }}
              autoFocus
            />
          )}
        </div>,
      )
    }

    return result
  }

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm border-r border-border/50">
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Explorer</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => startCreating("file", "")}>
                <FileText className="mr-2 h-4 w-4" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startCreating("folder", "")}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-1">{renderTree(fileTree)}</div>

      {/* Folder Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFolder} onOpenChange={() => setDeletingFolder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder "{deletingFolder?.split("/").pop()}" and all its contents? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFolderDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
