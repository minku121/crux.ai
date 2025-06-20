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
  onStatusChange?: (status: "idle" | "booting" | "installing" | "running" | "error") => void;
  onLogsChange?: (logs: string[]) => void;
}

type AppType = "next" | "vite" | "html" | null;
type PreviewStatus = "idle" | "booting" | "installing" | "running" | "error";

export function WebContainerPreview({ files, onStatusChange, onLogsChange }: WebContainerPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [appType, setAppType] = useState<AppType>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const webContainerRef = useRef<WebContainer | null>(null);
  const processRef = useRef<any>(null);
  const prevFilesRef = useRef<Record<string, { content: string; language: string }>>();

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

  const getDevCommand = (type: AppType, port?: string): string[] => {
    switch (type) {
      case "next":
        return ["npm", "run", "dev", "--", "-p", port || "3000"];
      case "vite":
        return ["npm", "run", "dev"];
      case "html":
        return ["npx", "serve", ".", "-p", port || "3001", "--listen", "0.0.0.0"];
      default:
        return ["npm", "run", "dev"];
    }
  };

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
      const detected = detectAppType(files);
      setAppType(detected);
      addLog(`🔍 Detected app type: ${detected || "unknown"}`);

      if (!detected) throw new Error("Unsupported app type. Only Next.js, Vite, or HTML supported.");

      const tree = convertToFileTree(files);
      await wc.mount(tree);
      addLog("📁 Files mounted");
      // Store files right after mounting for future diffs
      prevFilesRef.current = JSON.parse(JSON.stringify(files));


      if (needsInstallation(detected)) {
        updateStatus("installing");
        addLog("📦 Installing dependencies...");
        const install = await wc.spawn("npm", ["install"]);
        install.output.pipeTo(new WritableStream({ write: (data) => addLog(`📦 ${data}`) }));
        const code = await install.exit;
        if (code !== 0) throw new Error(`npm install failed with code ${code}`);
        addLog("✅ Dependencies installed");
      }

      updateStatus("running");

      let attempt = 0;
      const maxAttempts = 5;
      let success = false;

      while (!success && attempt < maxAttempts) {
        const randomPort = `${3000 + Math.floor(Math.random() * 1000)}`;
        const cmd = getDevCommand(detected, randomPort);
        addLog(`🚀 Attempt ${attempt + 1}: Running dev server on port ${randomPort} with ${cmd.join(" ")}`);

        try {
          processRef.current = await wc.spawn(cmd[0], cmd.slice(1), {
            env: { NODE_ENV: "development", PORT: randomPort },
          });

          processRef.current.output.pipeTo(
            new WritableStream({ write: (data) => addLog(`📄 ${data}`) })
          );

          wc.on("server-ready", (port, serverUrl) => {
            const finalUrl = serverUrl.startsWith("http") ? serverUrl : `http://${serverUrl}`;
            setUrl(finalUrl);
            addLog(`✅ Server ready on ${finalUrl}`);
            success = true;
          });

          await processRef.current.exit.then((code: number) => {
            if (code !== 0 && !success) {
              addLog(`❌ Server exited with code ${code}`);
              attempt++;
            }
          });

          if (!success) throw new Error("Port conflict or server failed");

        } catch (err:any) {
          addLog(`⚠️ Retrying with new port due to error: ${err.message}`);
          attempt++;
        }
      }

      if (!success) throw new Error("Unable to start server after multiple attempts");

    } catch (err: any) {
      const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      setError(msg);
      addLog(`❌ Error: ${msg}`);
      updateStatus("error");
    }
  };

  useEffect(() => {
    const handleFileChanges = async () => {
      if (Object.keys(files).length === 0) {
        addLog("ℹ️ No files provided yet. Waiting for files to load preview.");
        return;
      }

      const wcInstance = webContainerRef.current;
      const currentStatus = status; // Capture current status for stable comparison

      if (!wcInstance || currentStatus === "idle" || currentStatus === "error" || !prevFilesRef.current) {
        addLog(`🔄 Initializing or status is ${currentStatus}. Attempting full preview start...`);
        await startPreview(); // startPreview will set prevFilesRef on successful mount
        return;
      }

      // Container is running (or at least not idle/error and booted), check for file changes
      if (currentStatus === "booting" || currentStatus === "installing") {
        addLog(`ℹ️ Preview status is ${currentStatus}. Waiting for it to become 'running' before live updates.`);
        return;
      }

      let packageJsonChanged = false;
      const filesToWrite: Array<{ path: string; content: string }> = [];
      const currentFilePaths = Object.keys(files);
      const previousFilePaths = prevFilesRef.current ? Object.keys(prevFilesRef.current) : [];

      // Check for changed or added files
      for (const filePath of currentFilePaths) {
        if (!prevFilesRef.current || !prevFilesRef.current[filePath] || files[filePath].content !== prevFilesRef.current[filePath]?.content) {
          // Check if the file content is actually different from the stored previous version
          if (files[filePath].content !== prevFilesRef.current[filePath]?.content) {
             filesToWrite.push({ path: filePath, content: files[filePath].content });
             addLog(`➕ Detected change/addition: ${filePath}`);
          } else if (!prevFilesRef.current[filePath]) {
            // File is new
            filesToWrite.push({ path: filePath, content: files[filePath].content });
            addLog(`➕ Detected new file: ${filePath}`);
          }

          if (filePath.endsWith("package.json")) {
            packageJsonChanged = true;
          }
        }
      }

      // Check for deleted files
      const deletedFiles = previousFilePaths.filter(path => !currentFilePaths.includes(path));
      if (deletedFiles.length > 0) {
          addLog(`🗑️ Detected ${deletedFiles.length} deleted file(s): ${deletedFiles.join(", ")}. Restarting preview for accuracy.`);
          await startPreview();
          return;
      }

      if (packageJsonChanged) {
        addLog("📄 package.json changed, restarting preview...");
        await startPreview();
      } else if (filesToWrite.length > 0) {
        addLog(`✍️ Writing ${filesToWrite.length} changed file(s) to container...`);
        for (const file of filesToWrite) {
          if (file.content.startsWith('// Binary file:') && !file.path.endsWith('.ico')) {
              addLog(`Skipping write for placeholder binary file: ${file.path}`);
              continue;
          }
          try {
            await wcInstance.fs.writeFile(file.path, file.content);
            addLog(`  - ${file.path} written`);
          } catch (e: any) {
            addLog(`❌ Error writing file ${file.path} to WebContainer: ${e.message}`);
            // Optionally, trigger a full restart if a write fails
            // await startPreview();
            // return;
          }
        }
        prevFilesRef.current = JSON.parse(JSON.stringify(files));
        addLog("✅ Files updated in container. Dev server should handle HMR/reload.");
      } else {
          // addLog("ℹ️ No significant file changes detected for live update.");
      }
    };

    handleFileChanges();

    // Original cleanup logic (ensure it's appropriate for the new structure)
    // This cleanup runs when `files` changes or component unmounts.
    // If `startPreview` is called, it handles its own process killing.
    // This top-level cleanup might be redundant if `startPreview` is robust.
    // However, it can serve as a fallback if the component unmounts unexpectedly.
    return () => {
      // This cleanup might be too aggressive if `files` causes frequent re-runs
      // and `startPreview` itself is managing processes.
      // Consider if `processRef.current?.kill()` is only needed on *unmount*.
      // For now, keeping it as it implies that a change in `files` that doesn't lead to
      // `startPreview` (e.g. only live writes) might still want to kill an old process
      // if some logic error occurred. But ideally, `startPreview` handles this.
      // if (processRef.current) {
      //   addLog("🧹 useEffect[files] cleanup: Killing process (if any).");
      //   processRef.current.kill();
      //   processRef.current = null;
      // }
    };
  }, [files, status]); // Depend on status to re-evaluate when status changes (e.g. from installing to running)


  // Separate useEffect for component unmount cleanup
  useEffect(() => {
    return () => {
      if (processRef.current) {
        addLog("🧹 Component unmount: Killing process (if any).");
        processRef.current.kill();
        processRef.current = null;
      }
      // WebContainer instance is managed by a shared promise,
      // so it's not disposed here. Consider lifecycle if this component
      // were the sole owner.
    }
  }, []);

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
          <Button variant="ghost" size="sm" onClick={startPreview}>
            <RefreshCw className="w-4 h-4" />
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
