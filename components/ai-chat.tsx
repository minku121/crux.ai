'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, FileDown, Folder, File as FileIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  originalContent?: string; // Store the original response for file generation
  timestamp: Date;
};

interface AIChatProps {
  onGenerateFiles: (content: string) => void;
}

export function AIChat({ onGenerateFiles }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
        }),
      });

      const data = await res.json();

      if (data.result) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: formatAIResponse(data.result),
          originalContent: data.result,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('No result received');
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Something went wrong'}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Parse AI response to extract folder and file structure
  const parseAIResponse = (response: string) => {
    const folderRegex = /<Folder fname="([^"]+)">/g;
    const fileRegex = /<File filename="([^"]+)"/g;
    
    const folders: string[] = [];
    const files: string[] = [];
    
    // Extract folders
    let folderMatch;
    while ((folderMatch = folderRegex.exec(response))) {
      folders.push(folderMatch[1]);
    }
    
    // Extract files
    let fileMatch;
    while ((fileMatch = fileRegex.exec(response))) {
      files.push(fileMatch[1]);
    }
    
    return { folders, files };
  };

  // Format the AI response to show a simplified structure
  const formatAIResponse = (content: string) => {
    // Check if the content contains folder/file structure
    if (content.includes('<Folder') || content.includes('<File')) {
      const { folders, files } = parseAIResponse(content);
      
      let formattedResponse = '';
      
      // Add explanation
      formattedResponse += 'I can create the following project structure for you:\n\n';
      
      // Add folders
      if (folders.length > 0) {
        formattedResponse += 'Folders:\n';
        folders.forEach(folder => {
          formattedResponse += `- ${folder}\n`;
        });
        formattedResponse += '\n';
      }
      
      // Add files
      if (files.length > 0) {
        formattedResponse += 'Files:\n';
        files.forEach(file => {
          formattedResponse += `- ${file}\n`;
        });
      }
      
      formattedResponse += '\nClick "Generate Files" to create these files and folders.';
      
      return formattedResponse;
    }
    
    // If no folder/file structure, return the original content
    return content;
  };

  const handleGenerateFiles = (messageId: string) => {
    if (generatedFiles.has(messageId)) return;
    
    // Find the message
    const message = messages.find(m => m.id === messageId);
    if (!message || message.role !== 'assistant') return;
    
    // Call the callback with the original content if available, otherwise use the displayed content
    onGenerateFiles(message.originalContent || message.content);
    
    // Mark this message as having generated files
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
                <div className="whitespace-pre-wrap break-words">
                  {message.role === 'assistant' && message.content.includes('Folders:') ? (
                    <div className="space-y-2">
                      {message.content.split('\n').map((line, index) => {
                        if (line.startsWith('- ') && message.content.includes('Folders:') && message.content.includes('Files:')) {
                          const isFolder = index < message.content.indexOf('Files:') / 2;
                          return (
                            <div key={index} className="flex items-center gap-1">
                              {isFolder ? 
                                <Folder className="h-3 w-3 text-blue-500" /> : 
                                <FileIcon className="h-3 w-3 text-green-500" />
                              }
                              <span>{line.substring(2)}</span>
                            </div>
                          );
                        }
                        return <div key={index}>{line}</div>;
                      })}
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                <div className="mt-2 text-xs opacity-70 flex justify-between items-center">
                  <span>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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