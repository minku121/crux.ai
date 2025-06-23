/**
 * File and folder operation schema definitions
 * These types define the structure for file operations in the IDE
 */

// File structure as used in the IDE
export interface FileData {
  content: string;
  language: string;
}

// File system representation
export interface FileSystem {
  [path: string]: FileData;
}

// File operation types
export type FileOperation = 
  | CreateFileOperation
  | UpdateFileOperation
  | DeleteFileOperation
  | RenameFileOperation
  | CreateFolderOperation
  | DeleteFolderOperation;

// Create a new file
export interface CreateFileOperation {
  type: 'createFile';
  path: string;
  content: string;
  language?: string;
}

// Update an existing file
export interface UpdateFileOperation {
  type: 'updateFile';
  path: string;
  content: string;
}

// Delete a file
export interface DeleteFileOperation {
  type: 'deleteFile';
  path: string;
}

// Rename a file
export interface RenameFileOperation {
  type: 'renameFile';
  oldPath: string;
  newPath: string;
}

// Create a folder
export interface CreateFolderOperation {
  type: 'createFolder';
  path: string;
}

// Delete a folder
export interface DeleteFolderOperation {
  type: 'deleteFolder';
  path: string;
}

// Response from the AI assistant
export interface AIAssistantResponse {
  response: string;
  fileChanges?: Record<string, FileData>;
  operations?: FileOperation[];
}