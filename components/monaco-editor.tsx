"use client"

import { useRef, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import Editor from "@monaco-editor/react"

interface MonacoEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
}

export function MonacoEditor({ value, language, onChange }: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      typescript: "typescript",
      javascript: "javascript",
      tsx: "typescript",
      jsx: "javascript",
      css: "css",
      scss: "scss",
      less: "less",
      json: "json",
      html: "html",
      xml: "xml",
      markdown: "markdown",
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "csharp",
      php: "php",
      go: "go",
      rust: "rust",
      sql: "sql",
      yaml: "yaml",
      dockerfile: "dockerfile",
    }
    return languageMap[lang] || "typescript"
  }

  const getEditorTheme = (): string => {
    // Use light theme for light variants, dark theme for dark variants and standard dark
    return theme === "light" || theme.includes("-light") ? "vs" : "vs-dark"
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure TypeScript/JavaScript language features
    if (monaco.languages.typescript) {
      // TypeScript compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
        allowJs: true,
        typeRoots: ["node_modules/@types"],
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      })

      // JavaScript compiler options
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        allowJs: true,
        checkJs: false,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
      })

      // Add React type definitions
      const reactTypes = `
declare module 'react' {
  export interface Component<P = {}, S = {}> {}
  export interface ComponentClass<P = {}> {}
  export interface FunctionComponent<P = {}> {
    (props: P): JSX.Element | null;
  }
  export interface ReactElement<P = any> {
    type: any;
    props: P;
    key: string | number | null;
  }
  export interface JSX {
    Element: ReactElement;
    IntrinsicElements: {
      [K in keyof HTMLElementTagNameMap]: any;
    };
  }
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useContext<T>(context: any): T;
  export function useReducer<R extends (state: any, action: any) => any>(
    reducer: R,
    initialState: Parameters<R>[0]
  ): [Parameters<R>[0], (action: Parameters<R>[1]) => void];
  export const Fragment: any;
  export default React;
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
`

      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        reactTypes,
        "file:///node_modules/@types/react/index.d.ts",
      )

      // Enable all diagnostics
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false,
      })

      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false,
      })
    }

    setIsLoading(false)
  }

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "")
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={value}
        theme={getEditorTheme()}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="h-full w-full flex items-center justify-center bg-background/30">
            <div className="text-muted-foreground">Loading Monaco Editor...</div>
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: "JetBrains Mono, Consolas, 'Courier New', monospace",
          fontLigatures: true,
          lineHeight: 1.6,
          letterSpacing: 0.5,
          minimap: {
            enabled: false,
          },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          wordWrap: "on",
          wordWrapColumn: 120,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          renderLineHighlight: "gutter",
          renderWhitespace: "selection",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          cursorWidth: 2,
          // IntelliSense and suggestions
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: "on",
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
          quickSuggestionsDelay: 100,
          suggestSelection: "first",
          wordBasedSuggestions: "matchingDocuments",
          // Parameter hints
          parameterHints: {
            enabled: true,
            cycle: true,
          },
          // Auto formatting
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
          // Code folding
          folding: true,
          foldingStrategy: "indentation",
          foldingHighlight: true,
          showFoldingControls: "mouseover",
          // Bracket matching
          matchBrackets: "always",
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoClosingDelete: "always",
          autoSurround: "languageDefined",
          // Selection and multi-cursor
          multiCursorModifier: "ctrlCmd",
          multiCursorMergeOverlapping: true,
          selectionHighlight: true,
          occurrencesHighlight: "singleFile",
          // Context menu and interactions
          contextmenu: true,
          mouseWheelZoom: true,
          links: true,
          colorDecorators: true,
          // Accessibility
          accessibilitySupport: "auto",
          // Performance
          renderValidationDecorations: "on",
          renderControlCharacters: false,
          renderIndentGuides: true,
          highlightActiveIndentGuide: true,
          // Find and replace
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: "never",
            seedSearchStringFromSelection: "always",
          },
          // Hover
          hover: {
            enabled: true,
            delay: 300,
            sticky: true,
          },
          // Lightbulb (code actions)
          lightbulb: {
            enabled: "on",
          },
          // Code lens
          codeLens: true,
          // Bracket pair colorization
          bracketPairColorization: {
            enabled: true,
            independentColorPoolPerBracketType: true,
          },
          // Guides
          guides: {
            bracketPairs: true,
            bracketPairsHorizontal: true,
            highlightActiveBracketPair: true,
            indentation: true,
            highlightActiveIndentation: true,
          },
        }}
      />
    </div>
  )
}
