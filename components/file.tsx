"use client";

import { useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";
import { RefreshCw, TerminalIcon, Play, Square, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebContainerPreviewProps {
  files: Record<string, { content: string; language: string }>;
  onStatusChange?: (status: Status) => void;
}

type Status = "idle" | "booting" | "installing" | "running" | "error";

let webContainerPromise: Promise<WebContainer> | null = null;

export function WebContainerPreview({ files, onStatusChange }: WebContainerPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  const webContainerRef = useRef<WebContainer | null>(null);
  const processRef = useRef<any>(null);

  const addLog = (msg: string) => setLogs((prev) => [...prev.slice(-99), msg]);

  const convertToFileTree = (files: Record<string, { content: string }>) => {
    const tree: any = {};
    for (const [path, { content }] of Object.entries(files)) {
      const parts = path.split("/");
      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = { file: { contents: content } };
        } else {
          current[part] = current[part] || { directory: {} };
          current = current[part].directory;
        }
      }
    }
    return tree;
  };

  const updateStatus = (newStatus: Status) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const startPreview = async () => {
    try {
      updateStatus("booting");
      setLogs([]);
      setError(null);
      addLog("🚀 Booting WebContainer...");

      if (!webContainerRef.current) {
        if (!webContainerPromise) webContainerPromise = WebContainer.boot();
        webContainerRef.current = await webContainerPromise;
        webContainerRef.current.on("error", (err) => {
          updateStatus("error");
          setError(err.message);
        });
      }

      const wc = webContainerRef.current;
      const fileTree = convertToFileTree(files);
      await wc.mount(fileTree);
      addLog("📁 Files mounted");

      updateStatus("installing");
      addLog("📦 Installing dependencies...");
      const install = await wc.spawn("npm", ["install"]);
      install.output.pipeTo(new WritableStream({ write: (data) => addLog(`📦 ${data}`) }));
      if ((await install.exit) !== 0) throw new Error("npm install failed");

      updateStatus("running");
      addLog("🚀 Starting Vite dev server...");
      processRef.current = await wc.spawn("npm", ["run", "dev", "--", "--host"]);
      processRef.current.output.pipeTo(new WritableStream({ write: (data) => addLog(`📄 ${data}`) }));

      wc.on("server-ready", (_port, serverUrl) => {
        addLog(`✅ Server ready at ${serverUrl}`);
        setUrl(serverUrl);
      });

      processRef.current.exit.then((code: number) => {
        if (code !== 0) updateStatus("error");
      });
    } catch (err: any) {
      updateStatus("error");
      setError(err.message || String(err));
    }
  };

  const stopPreview = async () => {
    if (processRef.current) {
      await processRef.current.kill();
      processRef.current = null;
    }
    setUrl(null);
    updateStatus("idle");
  };

  const restartPreview = async () => {
    await stopPreview();
    setTimeout(() => startPreview(), 300);
  };

  useEffect(() => {
    if (Object.keys(files).length > 0 && status === "idle") startPreview();
  }, [files]);

  const statusLabel = {
    idle: "Idle",
    booting: "Booting",
    installing: "Installing",
    running: "Running",
    error: "Error",
  }[status];

  const statusColor = {
    idle: "bg-gray-500",
    booting: "bg-blue-500",
    installing: "bg-yellow-500",
    running: "bg-green-500",
    error: "bg-red-500",
  }[status];

  return (
    <div className="h-full flex flex-col bg-background/20">
      <div className="h-10 border-b px-3 bg-background/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={`text-white border-0 text-xs ${statusColor}`}>{statusLabel}</Badge>
          <Badge variant="secondary" className="text-xs">VITE</Badge>
          <span className="text-sm font-medium">Live Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowLogs(!showLogs)}>
            <TerminalIcon className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={restartPreview}>
            <RefreshCw className={`h-3 w-3 ${status === "installing" ? "animate-spin" : ""}`} />
          </Button>
          {status === "running" ? (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={stopPreview}>
              <Square className="h-3 w-3" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={startPreview}>
              <Play className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex">
        <div className={`${showLogs ? "w-2/3" : "w-full"} bg-white`}>
          {url ? (
            <iframe
              src={url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {status === "booting" || status === "installing" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : status === "error" ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : (
                <Play className="h-6 w-6 opacity-50" />
              )}
              <p className="text-sm ml-2">{statusLabel}...</p>
            </div>
          )}
        </div>

        {showLogs && (
          <div className="w-1/3 border-l bg-black text-green-400 text-xs font-mono">
            <div className="h-6 flex items-center px-2 border-b">
              <TerminalIcon className="h-3 w-3 mr-1" />
              Console
            </div>
            <ScrollArea className="h-[calc(100%-1.5rem)] p-2">
              {logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">{log}</div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
