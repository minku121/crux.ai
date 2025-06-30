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
    Object.entries(files).forEach(([path, { content, language }]) => {
      // Accept any file path, but only if language is 'shell' or path is '__shell__' or ends with '.sh'
      if (language === 'shell' || path.startsWith('__shell__') || path.endsWith('.sh')) {
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            // Split by spaces, but handle quoted args
            const cmd = trimmed.match(/(?:[^"\s]+|"[^"]*")+/g) || [];
            shellCommands.push(cmd.map(s => s.replace(/(^\"|\"$)/g, '')));
          }
        });
      }
    });
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

      // Extract shell commands from AI response
      const shellCommands = extractShellCommands(mergedFiles);
      if (shellCommands.length === 0) throw new Error("No shell command found in AI response to run the app.");
      addLog(`🟢 Extracted shell commands:`);
      shellCommands.forEach(cmdArr => addLog(`$ ${cmdArr.join(' ')}`));
      console.log('Extracted shell commands:', shellCommands);

      updateStatus("installing");
      // Run all but the last shell command (assume last is the dev server)
      for (let i = 0; i < shellCommands.length - 1; i++) {
        const cmd = shellCommands[i];
        addLog(`🔧 Running: ${cmd.join(' ')}`);
        const proc = await wc.spawn(cmd[0], cmd.slice(1));
        proc.output.pipeTo(new WritableStream({ write: (data) => addLog(`📦 ${data}`) }));
        const code = await proc.exit;
        if (code !== 0) throw new Error(`${cmd.join(' ')} failed with code ${code}`);
        addLog(`✅ ${cmd.join(' ')} finished`);
      }

      updateStatus("running");
      // Run the last shell command as the dev server
      const devCmd = shellCommands[shellCommands.length - 1];
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

  useEffect(() => {
    if (Object.keys(mergedFiles).length > 0 && status === "idle") {
      startPreview();
    }
    return () => {
      if (processRef.current) {
        processRef.current.kill();
        processRef.current = null;
      }
    };
  }, [mergedFiles]);

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
