'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, FileDown, Folder, File as FileIcon, Info, StickyNote } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  onGenerateFiles: (files: Record<string, { content: string; language: string }>) => void;
}

const parseXmlWithRegex = (xml: string): { path: string; content: string }[] => {
  const cleanXml = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, c) => c.trim());

  const files: { path: string; content: string }[] = [];
  const dirStack: string[] = [];

  const lines = cleanXml
    .split(/(?=<\/?DirectoryBlock)|(?=<(?:CodeBlock|ConfigBlock|DocBlock))/g)
    .map(l => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const dirOpen = line.match(/^<DirectoryBlock[^>]*name="([^"]+)"[^>]*>/);
    if (dirOpen) {
      dirStack.push(dirOpen[1]);
      continue;
    }

    const dirClose = line.match(/^<\/DirectoryBlock>/);
    if (dirClose) {
      dirStack.pop();
      continue;
    }

    const fileMatch = line.match(/<(CodeBlock|ConfigBlock|DocBlock)[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/);
    if (fileMatch) {
      const [, , name, content] = fileMatch;
      const fullPath = [...dirStack, name].join('/');
      files.push({ path: fullPath, content: content.trim() });
    }
  }

  // ⛳ Add `.gitkeep` for any folder not included in files
  const declaredFolders = new Set<string>();
  let tempStack: string[] = [];

  for (const line of lines) {
    const folderMatch = line.match(/^<DirectoryBlock[^>]*name="([^"]+)"[^>]*>/);
    if (folderMatch) {
      tempStack.push(folderMatch[1]);
      const path = tempStack.join('/');
      declaredFolders.add(path);
    } else if (line.match(/^<\/DirectoryBlock>/)) {
      tempStack.pop();
    }
  }

  const fileFolderSet = new Set(
    files.map(f => f.path.split('/').slice(0, -1).join('/'))
  );

  for (const folderPath of declaredFolders) {
    if (!fileFolderSet.has(folderPath)) {
      files.push({ path: `${folderPath}/.gitkeep`, content: '' });
    }
  }

  return files;
};




export function AIChat({ onGenerateFiles }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Set<string>>(new Set());
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
      console.log('[1] AI API response:', data.result);

      if (data.result) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.result,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No result received');
      }
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

    const files = parseXmlWithRegex(message.content);
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
