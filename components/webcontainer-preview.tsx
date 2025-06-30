"use client";

import { useState, useEffect, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import {
  RefreshCw,
  Maximize2,
  Play,
  Square,
  TerminalIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

let webContainerPromise: Promise<WebContainer> | null = null;

interface WebContainerPreviewProps {
  files: Record<string, { content: string; language: string }>;
  shellCommands?: string[][];
  onStatusChange?: (status: "idle" | "booting" | "installing" | "running" | "error") => void;
  onLogsChange?: (logs: string[]) => void;
}

type AppType = "next" | "vite" | "html" | null;
type PreviewStatus = "idle" | "booting" | "installing" | "running" | "error";

export function WebContainerPreview({ files, shellCommands: propShellCommands, onStatusChange, onLogsChange }: WebContainerPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [isUpdatingFiles, setIsUpdatingFiles] = useState(false);
  const [appType, setAppType] = useState<AppType>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const webContainerRef = useRef<WebContainer | null>(null);
  const processRef = useRef<any>(null);

  const addLog = (msg: string) => {
    const formattedLog = `${new Date().toLocaleTimeString()}: ${msg}`;
    const updatedLogs = [...logs.slice(-99), formattedLog];
    setLogs(updatedLogs);
    onLogsChange?.(updatedLogs);
    console.log(msg);
  };

  const updateStatus = (newStatus: PreviewStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const convertToFileTree = (filesObj: Record<string, { content: string; language: string }>) => {
    const tree: any = {};
    Object.entries(filesObj).forEach(([path, { content }]) => {
      if (path.includes("node_modules/")) return;
      if (content.startsWith('// Binary file:') && !path.endsWith('.ico')) {
        addLog(`Skipping binary file: ${path}`);
        return;
      }
      const parts = path.split("/");
      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        if (isFile) {
          current[part] = { file: { contents: content } };
        } else {
          current[part] = current[part] || { directory: {} };
          current = current[part].directory;
        }
      }
    });
    return tree;
  };

  const detectAppType = (files: Record<string, { content: string; language: string }>): AppType => {
    try {
      const pkgPath = Object.keys(files).find((p) => p.endsWith("package.json"));
      if (pkgPath) {
        const pkg = JSON.parse(files[pkgPath].content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps?.next) return "next";
        if (deps?.vite) return "vite";
      }
      if (Object.keys(files).some((p) => p.endsWith(".html"))) return "html";
      return null;
    } catch (err) {
      console.error("App type detection failed:", err);
      return null;
    }
  };

  // Helper to extract shell commands from AI response (boltAction type="shell")
  function extractShellCommands(files: Record<string, { content: string; language: string }>): string[][] {
    const shellCommands: string[][] = [];
    
    // Process shell command files
    Object.entries(files).forEach(([path, { content, language }]) => {
      // Accept any file path, but only if language is 'shell' or path is '__shell__' or ends with '.sh'
      if (language === 'shell' || path.startsWith('__shell__') || path.endsWith('.sh')) {
        // Split content by lines and process each line
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          // Skip empty lines and comments
          if (trimmed && !trimmed.startsWith('#')) {
            try {
              // Improved regex to handle quoted arguments with both single and double quotes
              // This handles: normal args, "double quoted args", and 'single quoted args'
              const cmdRegex = /(?:[^\s'"]+|"[^"]*"|'[^']*')+/g;
              const matches = trimmed.match(cmdRegex) || [];
              
              // Process each argument to remove quotes properly
              const processedArgs = matches.map(arg => {
                // Remove surrounding quotes (both single and double)
                if ((arg.startsWith('"') && arg.endsWith('"')) || 
                    (arg.startsWith('\'') && arg.endsWith('\'')))
                  return arg.slice(1, -1);
                return arg;
              });
              
              // Only add non-empty commands
              if (processedArgs.length > 0) {
                shellCommands.push(processedArgs);
              }
            } catch (e) {
              // If parsing fails, try a simpler approach as fallback
              console.warn('Command parsing error, using fallback:', e);
              const simpleSplit = trimmed.split(/\s+/);
              shellCommands.push(simpleSplit);
            }
          }
        });
      }
    });
    
    // Add default npm install if no commands were found but package.json exists
    if (shellCommands.length === 0 && Object.keys(files).some(path => path.endsWith('package.json'))) {
      addLog('📦 No shell commands found but package.json exists. Adding default npm install.');
      shellCommands.push(['npm', 'install', '--no-fund', '--no-audit', '--loglevel=error']);
      shellCommands.push(['npm', 'run', 'dev']);
    }
    
    // Log the extracted commands for debugging
    if (shellCommands.length > 0) {
      addLog(`📋 Extracted ${shellCommands.length} shell commands:`);
      shellCommands.forEach(cmd => addLog(`  $ ${cmd.join(' ')}`));
    } else {
      addLog('⚠️ No shell commands extracted from AI response');
    }
    
    return shellCommands;
  }

  // Merge starter files and AI files
  const [mergedFiles, setMergedFiles] = useState(files);
  useEffect(() => {
    // Merge logic: AI files override starter files, but keep all unique files
    setMergedFiles(prev => ({ ...prev, ...files }));
  }, [files]);

  const needsInstallation = (type: AppType): boolean => type !== "html";

  const startPreview = async () => {
    try {
      if (processRef.current) {
        try {
          await processRef.current.kill();
          addLog("💀 Killed previous server process");
        } catch (err) {
          addLog(`⚠️ Failed to kill previous process: ${err}`);
        }
        processRef.current = null;
      }

      setError(null);
      setLogs([]);
      updateStatus("booting");
      addLog("🚀 Starting WebContainer...");

      if (!webContainerRef.current) {
        if (!webContainerPromise) {
          webContainerPromise = WebContainer.boot();
        }
        webContainerRef.current = await webContainerPromise;

        webContainerRef.current.on("error", (err) => {
          console.error("WebContainer runtime error:", err);
          addLog(`⚠️ Container Error: ${err.message}`);
          updateStatus("error");
        });

        addLog("✅ WebContainer booted");
      }

      const wc = webContainerRef.current;
      const detected = detectAppType(mergedFiles);
      setAppType(detected);
      addLog(`🔍 Detected app type: ${detected || "unknown"}`);

      if (!detected) throw new Error("Unsupported app type. Only Next.js, Vite, or HTML supported.");

      const tree = convertToFileTree(mergedFiles);
      await wc.mount(tree);
      addLog("📁 Files mounted");

      // Use propShellCommands if provided, otherwise extract from AI response
      const commandsToExecute = propShellCommands && propShellCommands.length > 0 
        ? propShellCommands
        : extractShellCommands(mergedFiles);

      if (commandsToExecute.length === 0) throw new Error("No shell command found to run the app.");
      addLog(`🟢 Commands to execute:`);
      commandsToExecute.forEach(cmdArr => addLog(`$ ${cmdArr.join(' ')}`));
      console.log('Commands to execute:', commandsToExecute);

      updateStatus("installing");
      // Run all but the last shell command (assume last is the dev server)
      for (let i = 0; i < commandsToExecute.length - 1; i++) {
        const cmd = commandsToExecute[i];
        addLog(`🔧 Running: ${cmd.join(' ')}`);
        
        try {
          // Special handling for npm install commands
          if (cmd[0] === 'npm' && (cmd[1] === 'install' || cmd[1] === 'i')) {
            // Add a more reliable flag for npm install
            const npmArgs = [...cmd.slice(1)];
            // Replace --yes with --no-fund --no-audit --loglevel=error for more reliable installs
            const hasYesFlag = npmArgs.includes('--yes') || npmArgs.includes('-y');
            if (hasYesFlag) {
              npmArgs.splice(npmArgs.indexOf(hasYesFlag ? '--yes' : '-y'), 1);
              if (!npmArgs.includes('--no-fund')) npmArgs.push('--no-fund');
              if (!npmArgs.includes('--no-audit')) npmArgs.push('--no-audit');
              if (!npmArgs.includes('--loglevel=error')) npmArgs.push('--loglevel=error');
            }
            
            addLog(`📦 Modified npm command: npm ${npmArgs.join(' ')}`);
            const proc = await wc.spawn('npm', npmArgs);
            proc.output.pipeTo(new WritableStream({ write: (data) => addLog(`📦 ${data}`) }));
            const code = await proc.exit;
            if (code !== 0) {
              addLog(`⚠️ npm install failed. Trying with additional flags...`);
              // Try again with more conservative flags
              const retryProc = await wc.spawn('npm', ['install', '--no-fund', '--no-audit', '--loglevel=error']);
              retryProc.output.pipeTo(new WritableStream({ write: (data) => addLog(`📦 ${data}`) }));
              const retryCode = await retryProc.exit;
              if (retryCode !== 0) {
                throw new Error(`npm install failed with code ${retryCode}. Try using a simpler package.json or check for compatibility issues.`);
              }
              addLog(`✅ npm install succeeded with fallback options`);
            } else {
              addLog(`✅ ${cmd.join(' ')} finished`);
            }
          } else {
            // Standard command execution for non-npm-install commands
            const proc = await wc.spawn(cmd[0], cmd.slice(1));
            proc.output.pipeTo(new WritableStream({ write: (data) => addLog(`📦 ${data}`) }));
            const code = await proc.exit;
            if (code !== 0) throw new Error(`${cmd.join(' ')} failed with code ${code}`);
            addLog(`✅ ${cmd.join(' ')} finished`);
          }
        } catch (cmdError) {
          // Provide more helpful error messages for common issues
          let errorMsg = cmdError instanceof Error ? cmdError.message : String(cmdError);
          
          if (cmd[0] === 'npm') {
            errorMsg += '\n\nPossible solutions:\n';
            errorMsg += '- Try using a simpler package.json with fewer dependencies\n';
            errorMsg += '- Check for package version compatibility issues\n';
            errorMsg += '- WebContainer has limited resources, consider reducing the project size\n';
            errorMsg += '- Some npm packages may not be compatible with the WebContainer environment';
          }
          
          throw new Error(errorMsg);
        }
      }

      updateStatus("running");
      // Run the last shell command as the dev server
      const devCmd = commandsToExecute[commandsToExecute.length - 1];
      addLog(`🚀 Starting dev server: ${devCmd.join(' ')}`);
      processRef.current = await wc.spawn(devCmd[0], devCmd.slice(1), {
        env: { NODE_ENV: "development" },
      });
      processRef.current.output.pipeTo(
        new WritableStream({ write: (data) => addLog(`📄 ${data}`) })
      );
      wc.on("server-ready", (port, serverUrl) => {
        const finalUrl = serverUrl.startsWith("http") ? serverUrl : `http://${serverUrl}`;
        setUrl(finalUrl);
        addLog(`✅ Server ready on ${finalUrl}`);
      });
      await processRef.current.exit;

    } catch (err: any) {
      const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      setError(msg);
      addLog(`❌ Error: ${msg}`);
      updateStatus("error");
    }
  };

  // Track if files have been mounted initially
  const [initialMountDone, setInitialMountDone] = useState(false);
  // Track previous files to detect changes
  const prevFilesRef = useRef(mergedFiles);

  // Handle file updates without restarting the container
  const updateMountedFiles = async () => {
    if (!webContainerRef.current || status === "idle" || status === "error") return;
    
    setIsUpdatingFiles(true);
    
    try {
      // Find changed or new files
      const currentFiles = mergedFiles;
      const prevFiles = prevFilesRef.current;
      const changedFiles = {};
      let dependencyChanged = false;
      
      // Identify changed or new files
      Object.entries(currentFiles).forEach(([path, { content }]) => {
        if (!prevFiles[path] || prevFiles[path].content !== content) {
          (changedFiles as Record<string, string>)[path] = content;
          
          // Check if package.json was modified
          if (path.endsWith('package.json')) {
            try {
              const prevPkg = prevFiles[path] ? JSON.parse(prevFiles[path].content) : {};
              const currentPkg = JSON.parse(content as string);
              
              // Compare dependencies and devDependencies
              const prevDeps = { ...prevPkg.dependencies, ...prevPkg.devDependencies };
              const currentDeps = { ...currentPkg.dependencies, ...currentPkg.devDependencies };
              
              // Check if dependencies were added, removed, or versions changed
              const allDepKeys = new Set([...Object.keys(prevDeps), ...Object.keys(currentDeps)]);
              
              for (const key of allDepKeys) {
                if (prevDeps[key] !== currentDeps[key]) {
                  dependencyChanged = true;
                  addLog(`📦 Dependency change detected: ${key}`);
                  break;
                }
              }
            } catch (err:any) {
              addLog(`⚠️ Error parsing package.json: ${err.message}`);
            }
          }
        }
      });
      
      if (Object.keys(changedFiles).length === 0) return;
      
      addLog(`🔄 Updating ${Object.keys(changedFiles).length} changed files...`);
      
      // Update files in the container
      for (const [path, content] of Object.entries(changedFiles)) {
        try {
          // Skip binary files
          if (typeof content === 'string' && content.startsWith('// Binary file:')) {
            addLog(`⏩ Skipping binary file update: ${path}`);
            continue;
          }
          
          // Create directory structure if needed
          const dirPath = path.split('/').slice(0, -1).join('/');
          if (dirPath) {
            await webContainerRef.current.fs.mkdir(dirPath, { recursive: true });
          }
          
          // Write the file
          await webContainerRef.current.fs.writeFile(path, content as string);
          addLog(`✅ Updated file: ${path}`);
        } catch (err:any) {
          addLog(`❌ Failed to update file ${path}: ${err.message}`);
        }
      }
      
      // Store current files as previous for next comparison
      prevFilesRef.current = currentFiles;
      
      // If dependencies changed, restart the preview
      if (dependencyChanged) {
        addLog(`🔄 Dependencies changed. Restarting preview...`);
        startPreview();
      } else if (url) {
        // If the server is already running and no dependency changes, we don't need to restart it
        addLog(`🔄 Files updated. Refresh the preview if needed.`);
      }
    } catch (err:any) {
      addLog(`❌ Error updating files: ${err.message}`);
    } finally {
      setIsUpdatingFiles(false);
    }
  };

  useEffect(() => {
    // Initial mount and boot
    if (Object.keys(mergedFiles).length > 0 && status === "idle" && !initialMountDone) {
      startPreview();
      setInitialMountDone(true);
    } 
    // Update files without restarting if already mounted
    else if (initialMountDone && webContainerRef.current) {
      updateMountedFiles();
    }
    
    return () => {
      // Only kill the process on component unmount, not on file changes
      if (processRef.current && !initialMountDone) {
        processRef.current.kill();
        processRef.current = null;
      }
    };
  }, [mergedFiles, propShellCommands, status, initialMountDone]);

  return (
    <div className={`h-full flex flex-col bg-background/20 ${isFullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}>
      <div className="h-10 border-b border-border/50 flex items-center justify-between px-3 bg-background/30">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-white border-0 text-xs`}>{status}</Badge>
          {appType && <Badge variant="secondary" className="text-xs">{appType.toUpperCase()}</Badge>}
          <span className="text-sm font-medium">Live Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen((prev) => !prev)}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => initialMountDone ? updateMountedFiles() : startPreview()}
            title={initialMountDone ? "Update files without restarting" : "Start preview"}
            disabled={isUpdatingFiles}
          >
            <RefreshCw className={`w-4 h-4 ${isUpdatingFiles ? 'animate-spin' : ''}`} />
            <span className="sr-only">{initialMountDone ? "Update Files" : "Start Preview"}</span>
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex-1 flex">
        <div className={`w-full bg-white`}>
          {url ? (
            <iframe
              src={url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                {status === "booting" && <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />}
                {status === "installing" && <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />}
                {status === "error" && <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />}
                {status === "idle" && <Play className="h-6 w-6 mx-auto mb-2 opacity-50" />}
                <p className="text-sm">
                  {status === "idle" ? "Click play to start" : `${status}...`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
