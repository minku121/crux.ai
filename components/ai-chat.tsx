'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, FileDown, Folder, File as FileIcon, Info, StickyNote } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { basePrompt as reactBasePrompt } from '@/prompts/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onGenerateFiles: (files: Record<string, { content: string; language: string }>) => void;
}

// Improved parser for <boltArtifact> and <boltAction> XML structure
const parseBoltArtifact = (xml: string): { path: string; content: string }[] => {
  // Extract the 'text' property if the response is a JSON object
  let raw = xml;
  try {
    const parsed = JSON.parse(xml);
    if (parsed && typeof parsed.text === 'string') {
      raw = parsed.text;
    }
  } catch (e) {
    // Not JSON, treat as raw string
  }

  // Remove code block markers and trim
  const cleaned = raw.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim();

  // Extract all <boltAction type="file" filePath="...">...</boltAction> blocks
  const fileRegex = /<boltAction[^>]*type="file"[^>]*filePath="([^"]+)"[^>]*>([\s\S]*?)<\/boltAction>/g;
  const files: { path: string; content: string }[] = [];
  let match;
  while ((match = fileRegex.exec(cleaned)) !== null) {
    const [, path, content] = match;
    files.push({ path: path.trim(), content: content.trim() });
  }
  
  // Extract all <boltAction type="shell">...</boltAction> blocks
  const shellRegex = /<boltAction[^>]*type="shell"[^>]*>([\s\S]*?)<\/boltAction>/g;
  let shellMatch;
  let shellCommands = '';
  while ((shellMatch = shellRegex.exec(cleaned)) !== null) {
    const [, command] = shellMatch;
    shellCommands += command.trim() + '\n';
  }
  
  // If shell commands were found, add them as a special file
  if (shellCommands.trim()) {
    files.push({ path: '__shell__.sh', content: shellCommands.trim() });
  }
  
  return files;
};

// Helper to merge two file maps (AI files override starter files, but all unique files are kept)
function mergeFiles(
  starter: Record<string, { content: string; language: string }>,
  ai: Record<string, { content: string; language: string }>
): Record<string, { content: string; language: string }> {
  return { ...starter, ...ai };
}

export function AIChat({ onGenerateFiles }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Set<string>>(new Set());
  const [starterFiles, setStarterFiles] = useState<Record<string, { content: string; language: string }>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });

      const data = await res.json();
      // Show the raw JSON response from the backend
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: JSON.stringify(data, null, 2),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Something went wrong';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFiles = (messageId: string) => {
    if (generatedFiles.has(messageId)) return;

    const message = messages.find((m) => m.id === messageId);
    if (!message || message.role !== 'assistant') return;

    // Use the new parser for boltArtifact XML
    const files = parseBoltArtifact(message.content);
    console.log('[2] Parsed files:', files);

    if (files.length === 0) {
      console.warn('[3] No files parsed.');
      onGenerateFiles({});
      return;
    }

    const extMap: Record<string, string> = {
      tsx: 'tsx', ts: 'typescript', js: 'javascript', jsx: 'jsx',
      json: 'json', html: 'html', css: 'css', md: 'markdown',
      env: 'env', txt: 'text',
    };

    const result: Record<string, { content: string; language: string }> = {};
    for (const { path, content } of files) {
      const ext = path.split('.').pop() || 'txt';
      result[path] = {
        content,
        language: extMap[ext] || 'text',
      };
    }

    console.log('[4] Final files:', result);
    onGenerateFiles(result);
    setGeneratedFiles(prev => new Set([...prev, messageId]));
  };

  // Auto-generate files from the latest assistant message, merging with starter files at response time
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;
    if (generatedFiles.has(lastMsg.id)) return;

    // Parse AI response files
    const aiFiles = parseBoltArtifact(lastMsg.content);
    if (aiFiles.length === 0) return;
    const extMap: Record<string, string> = {
      tsx: 'tsx', ts: 'typescript', js: 'javascript', jsx: 'jsx',
      json: 'json', html: 'html', css: 'css', md: 'markdown',
      env: 'env', txt: 'text',
    };
    const aiResult: Record<string, { content: string; language: string }> = {};
    for (const { path, content } of aiFiles) {
      const ext = path.split('.').pop() || 'txt';
      aiResult[path] = {
        content,
        language: extMap[ext] || 'text',
      };
    }

    // Parse starter files from reactBasePrompt at response time
    const starterFilesArr = parseBoltArtifact(reactBasePrompt);
    const starterResult: Record<string, { content: string; language: string }> = {};
    for (const { path, content } of starterFilesArr) {
      const ext = path.split('.').pop() || 'txt';
      starterResult[path] = {
        content,
        language: extMap[ext] || 'text',
      };
    }

    // Merge starter and AI files (AI files override starter files)
    const merged = mergeFiles(starterResult, aiResult);
    onGenerateFiles(merged);
    setGeneratedFiles(prev => new Set([...prev, lastMsg.id]));
  }, [messages, generatedFiles, onGenerateFiles]);

  return (
    <div className="flex flex-col h-full border-l">
      <div className="p-3 border-b">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col p-3 rounded-lg max-w-[80%]',
                  message.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="whitespace-pre-wrap break-words space-y-1">
                  {message.content}
                </div>

                <div className="mt-2 text-xs opacity-70 flex justify-between items-center">
                  <span>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => handleGenerateFiles(message.id)}
                      disabled={generatedFiles.has(message.id)}
                    >
                      <FileDown className="h-3 w-3 mr-1" />
                      {generatedFiles.has(message.id) ? 'Generated' : 'Generate Files'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
