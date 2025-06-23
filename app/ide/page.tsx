'use client';

import React, { useState, useEffect } from 'react';
import { FileExplorer } from '@/components/file-explorer';
import { CodeEditor } from '@/components/code-editor';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AIChat } from '@/components/ai-chat';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
// Parser function to extract files/folders
const parseAIResponse = (response: string) => {
  const folderRegex = /<Folder fname="([^"]+)">([\s\S]*?)<\/Folder>/g;
  const fileRegex = /<File filename="([^"]+)" content="([\s\S]*?)" ?\/?>/g;

  const decode = (html: string) =>
    html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');

  const folders: any[] = [];
  const files: any[] = [];

  // Parse folders
  let match;
  while ((match = folderRegex.exec(response))) {
    const folderName = match[1];
    const content = match[2];
    const children: any[] = [];

    let fileMatch;
    while ((fileMatch = fileRegex.exec(content))) {
      children.push({
        type: 'file',
        name: fileMatch[1],
        content: decode(fileMatch[2]),
      });
    }

    folders.push({
      type: 'folder',
      name: folderName,
      children,
    });
  }

  // Top-level files
  let fileMatch;
  while ((fileMatch = fileRegex.exec(response))) {
    files.push({
      type: 'file',
      name: fileMatch[1],
      content: decode(fileMatch[2]),
    });
  }

  return [...folders, ...files];
};

export default function GenerateProject() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [files, setFiles] = useState<Record<string, { content: string; language: string }>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await res.json();

      if (data.result) {
        const parsed = parseAIResponse(data.result);
        
        // Convert the parsed array to the format expected by FileExplorer and CodeEditor
        const fileMap: Record<string, { content: string; language: string }> = {};
        
        // Process folders and files
        const processItems = (items: any[], parentPath = '') => {
          items.forEach(item => {
            if (item.type === 'file') {
              const path = parentPath ? `${parentPath}/${item.name}` : item.name;
              fileMap[path] = {
                content: item.content,
                language: getLanguageFromFile(item.name)
              };
            } else if (item.type === 'folder' && item.children) {
              const folderPath = parentPath ? `${parentPath}/${item.name}` : item.name;
              processItems(item.children, folderPath);
            }
          });
        };
        
        processItems(parsed);
        setFiles(fileMap);

        // Select first file to show in editor
        const firstFilePath = Object.keys(fileMap)[0];
        if (firstFilePath) setActiveFile(firstFilePath);
      } else {
        alert('No result received');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (path: string) => {
    setActiveFile(path);
  };

  const handleFileChange = (path: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [path]: {
        ...prev[path],
        content
      }
    }));
  };

  const handleFileCreate = (path: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [path]: {
        content,
        language: getLanguageFromFile(path)
      }
    }));
  };

  const handleFileDelete = (path: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[path];
      return newFiles;
    });
    
    if (activeFile === path) {
      const remainingFiles = Object.keys(files);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
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
    // Create a placeholder file to make the folder exist
    // This ensures the folder appears in the file explorer
    setFiles(prev => {
      // Check if folder already exists implicitly through file paths
      const folderExists = Object.keys(prev).some(filePath => 
        filePath.startsWith(`${path}/`) || filePath === path
      );
      
      if (folderExists) {
        return prev; // Folder already exists
      }
      
      return {
        ...prev,
        [`${path}/.folder`]: {
          content: '// This is a placeholder file to represent a folder',
          language: 'plaintext'
        }
      };
    });
  };

  const handleFolderDelete = (path: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      Object.keys(newFiles).forEach(filePath => {
        if (filePath.startsWith(path + '/')) {
          delete newFiles[filePath];
        }
      });
      return newFiles;
    });
    
    if (activeFile && activeFile.startsWith(path + '/')) {
      const remainingFiles = Object.keys(files);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
    }
  };

  const handleDownloadZip = async () => {
    if (Object.keys(files).length === 0) {
      alert('No files to download');
      return;
    }

    try {
      const zip = new JSZip();
      
      // Add all files to the zip
      Object.entries(files).forEach(([path, { content }]) => {
        // Create folders if needed
        const pathParts = path.split('/');
        const fileName = pathParts.pop();
        const folderPath = pathParts.join('/');
        
        if (folderPath) {
          // Add file to its folder
          let folder = zip;
          const folders = folderPath.split('/');
          
          folders.forEach(f => {
            folder = folder.folder(f) || folder;
          });
          
          folder.file(fileName as string, content);
        } else {
          // Add file to root
          zip.file(path, content);
        }
      });
      
      // Generate the zip file
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      // Download the zip file
      saveAs(zipContent, 'project-files.zip');
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('Error creating zip file');
    }
  };

  const handleGenerateFromAI = (content: string) => {
    try {
      const parsed = parseAIResponse(content);
      
      // Convert the parsed array to the format expected by FileExplorer and CodeEditor
      const fileMap: Record<string, { content: string; language: string }> = {};
      
      // Process folders and files
      const processItems = (items: any[], parentPath = '') => {
        items.forEach(item => {
          if (item.type === 'file') {
            const path = parentPath ? `${parentPath}/${item.name}` : item.name;
            fileMap[path] = {
              content: item.content,
              language: getLanguageFromFile(item.name)
            };
          } else if (item.type === 'folder' && item.children) {
            const folderPath = parentPath ? `${parentPath}/${item.name}` : item.name;
            processItems(item.children, folderPath);
          }
        });
      };
      
      processItems(parsed);
      setFiles(fileMap);

      // Select first file to show in editor
      const firstFilePath = Object.keys(fileMap)[0];
      if (firstFilePath) setActiveFile(firstFilePath);
    } catch (err: any) {
      console.error(err);
      alert('Error parsing AI response: ' + err.message);
    }
  };

  return (
   <div className="flex flex-col h-screen">
      {/* Header with download button */}
      <div className="p-4 border-b flex justify-end">
        <Button
          onClick={handleDownloadZip}
          disabled={Object.keys(files).length === 0}
          variant="outline"
          title="Download all files as ZIP"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      
      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* File Explorer */}
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
        
        {/* Code Editor */}
        <ResizablePanel defaultSize={55}>
          <CodeEditor
            files={files}
            activeFile={activeFile}
            onFileChange={handleFileChange}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* AI Chat */}
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
