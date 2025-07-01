'use client';

import React, { useState } from 'react';
import { FileExplorer } from '@/components/file-explorer';
import { CodeEditor } from '@/components/code-editor';
import { Button } from '@/components/ui/button';
import { Download, Code2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AIChat } from '@/components/ai-chat';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { motion } from "framer-motion";


const parseAIResponse = (response: string) => {
  const decode = (html: string) =>
    html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');

  const extractContentInsideViteApp = (xml: string): string => {
    const match = xml.match(/<ViteReactApp[^>]*>([\s\S]*?)<\/ViteReactApp>/);
    if (!match) return xml;
    return match[1];
  };

  const parseDirectory = (content: string, parentPath = ''): any[] => {
    const result: any[] = [];

    const directoryRegex = /<DirectoryBlock name="([^"]+)"[^>]*>([\s\S]*?)<\/DirectoryBlock>/g;
    let dirMatch;
    while ((dirMatch = directoryRegex.exec(content))) {
      const folderName = dirMatch[1];
      const folderContent = dirMatch[2];
      const children = parseDirectory(folderContent, parentPath ? `${parentPath}/${folderName}` : folderName);

      result.push({
        type: 'folder',
        name: folderName,
        children
      });
    }

    const codeBlockRegex = /<CodeBlock name="([^"]+)" language="([^"]+)"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/CodeBlock>/g;
    let codeMatch;
    while ((codeMatch = codeBlockRegex.exec(content))) {
      const filename = codeMatch[1];
      const language = codeMatch[2];
      const fileContent = decode(codeMatch[3]);

      result.push({
        type: 'file',
        name: filename,
        content: fileContent,
        language
      });
    }

    return result;
  };

  const inner = extractContentInsideViteApp(response);
  const parsed = parseDirectory(inner);

  return parsed;
};

export default function GenerateProject() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<Record<string, { content: string; language: string }>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const handleGenerateFromAI = (responseFiles: Record<string, { content: string; language: string }>) => {
    if (!responseFiles || Object.keys(responseFiles).length === 0) {
      console.warn('[handleGenerateFromAI] No files generated from AI');
      return;
    }

    setFiles(responseFiles);
    const first = Object.keys(responseFiles)[0];
    if (first) {
      setActiveFile(first);
    }
  };

  const handleDownloadZip = async () => {
    if (Object.keys(files).length === 0) {
      alert('No files to download');
      return;
    }

    try {
      const zip = new JSZip();

      Object.entries(files).forEach(([path, { content }]) => {
        const pathParts = path.split('/');
        const fileName = pathParts.pop()!;
        const folderPath = pathParts.join('/');
        let folder = zip;

        if (folderPath) {
          folderPath.split('/').forEach(p => {
            folder = folder.folder(p) || folder;
          });
        }

        folder.file(fileName, content);
      });

      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, 'project-files.zip');
    } catch (err) {
      console.error('Zip error:', err);
      alert('Error creating zip');
    }
  };

  const handleFileSelect = (path: string) => setActiveFile(path);
  const handleFileChange = (path: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [path]: { ...prev[path], content }
    }));
  };
  const handleFileCreate = (path: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [path]: { content, language: getLanguageFromFile(path) }
    }));
  };
  const handleFileDelete = (path: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[path];
      return newFiles;
    });

    if (activeFile === path) {
      const remaining = Object.keys(files);
      setActiveFile(remaining.length > 0 ? remaining[0] : null);
    }
  };
  const handleFileRename = (oldPath: string, newPath: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      newFiles[newPath] = newFiles[oldPath];
      delete newFiles[oldPath];
      return newFiles;
    });

    if (activeFile === oldPath) {
      setActiveFile(newPath);
    }
  };
  const handleFolderCreate = (path: string) => {
    const folderExists = Object.keys(files).some(file => file.startsWith(`${path}/`));
    if (!folderExists) {
      setFiles(prev => ({
        ...prev,
        [`${path}/.folder`]: {
          content: '// folder placeholder',
          language: 'plaintext'
        }
      }));
    }
  };
  const handleFolderDelete = (path: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      for (const key of Object.keys(newFiles)) {
        if (key.startsWith(`${path}/`)) delete newFiles[key];
      }
      return newFiles;
    });

    if (activeFile?.startsWith(`${path}/`)) {
      const remaining = Object.keys(files);
      setActiveFile(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
    

    
      <motion.div 
        className="p-4 border-b flex justify-between items-center fixed top-0 left-0 right-0 z-50 bg-background"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"
            whileHover={{ rotate: 5 }}
          >
            <Code2 className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          <motion.span 
            className="font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Crux.ai
          </motion.span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleDownloadZip} disabled={!Object.keys(files).length} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="h-16"></div> {/* Spacer for fixed header */}

      {/* Body */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FileExplorer
            files={files}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            onFolderCreate={handleFolderCreate}
            onFolderDelete={handleFolderDelete}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55}>
          <CodeEditor
            files={files}
            activeFile={activeFile}
            onFileChange={handleFileChange}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={20}>
          <AIChat onGenerateFiles={handleGenerateFromAI} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function getLanguageFromFile(filename: string): string {
  if (filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.md')) return 'markdown';
  return 'plaintext';
}
