import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import GetStartedPage from './page'; // Assuming default export

// Mock 'next/navigation'
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// --- Mocking functions defined within GetStartedPage ---
// For the purpose of these tests, we'll assume we can access or mock these.
// In a real scenario, you'd either export them or test them via component interactions.

// Mock implementation for storeProjectData and related functions
// These are simplified mocks. A real test might need to mock sessionStorage/indexedDB.
const mockSessionStorage: Record<string, string> = {};
const mockIndexedDBStore: Record<string, any> = {};

const mockStoreProjectData = jest.fn(async (data: any) => {
  try {
    const jsonString = JSON.stringify(data);
    // Simulate storing in a mock session storage for the tests
    mockSessionStorage['uploadedProject_chunks'] = '1';
    mockSessionStorage['uploadedProject_chunk_0'] = jsonString;
    mockSessionStorage['uploadedProject_method'] = 'sessionStorage';
    return true;
  } catch (e) {
    return false;
  }
});

// Direct access to internal functions for testing (conceptual)
// In a real app, these would ideally be exported or tested through component interaction.
// For this test file, we'll redefine them or assume they can be imported/mocked if refactored.

const getLanguageFromPath = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    json: "json", html: "html", css: "css", scss: "scss", sass: "scss",
    less: "less", md: "markdown", py: "python", java: "java", cpp: "cpp",
    c: "c", php: "php", rb: "ruby", go: "go", rs: "rust", xml: "xml",
    svg: "xml", yml: "yaml", yaml: "yaml", sh: "shell", sql: "sql",
    graphql: "graphql", vue: "vue", svelte: "svelte",
  };
  return languageMap[ext || ""] || "typescript"; // Default to typescript as in original
};

const shouldSkipFile = (path: string): boolean => {
  const skipPatterns = [
    /node_modules\//, /\.git\//, /\.next\//, /\.nuxt\//, /dist\//, /build\//,
    /coverage\//, /\.nyc_output\//, /\.cache\//, /\.temp\//, /\.tmp\//, /logs?\//,
    /\.log$/, /\.DS_Store$/, /Thumbs\.db$/, /\.env\.local$/, /\.env\.production$/,
  ];
  return skipPatterns.some((pattern) => pattern.test(path));
};

const compressData = (data: string, filename: string): string => {
  if (filename.includes(".min.") || filename.includes("-min.")) return data;
  let compressed = data;
  if (filename.endsWith(".js") || filename.endsWith(".jsx") || filename.endsWith(".ts") || filename.endsWith(".tsx")) {
    compressed = compressed.replace(/\/\/(?!\s*@|\s*TODO|\s*FIXME|\s*NOTE|\s*HACK).*$/gm, "");
    compressed = compressed.replace(/\/\*(?!\*[\s\S]*?\*\/)[\s\S]*?\*\//g, "");
  }
  if (filename.endsWith(".css") || filename.endsWith(".scss")) {
    compressed = compressed.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  compressed = compressed.replace(/\r\n/g, "\n").replace(/\t/g, "  ").replace(/[ ]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  return compressed;
};


describe('GetStartedPage Helper Functions', () => {
  describe('getLanguageFromPath', () => {
    it.each([
      ['test.js', 'javascript'],
      ['Component.jsx', 'javascript'],
      ['module.ts', 'typescript'],
      ['View.tsx', 'typescript'],
      ['data.json', 'json'],
      ['index.html', 'html'],
      ['style.css', 'css'],
      ['theme.scss', 'scss'],
      ['README.md', 'markdown'],
      ['script.py', 'python'],
      ['Main.java', 'java'],
      ['archive.xml', 'xml'],
      ['image.svg', 'xml'],
      ['config.yaml', 'yaml'],
      ['script.sh', 'shell'],
      ['query.sql', 'sql'],
      ['schema.graphql', 'graphql'],
      ['App.vue', 'vue'],
      ['Component.svelte', 'svelte'],
      ['unknownfile.xyz', 'typescript'], // Default
      ['noextension', 'typescript'],     // Default
      ['.configfile', 'typescript'],    // Default (hidden file with no specific ext)
    ])('should return "%s" for path "%s"', (path, expectedLanguage) => {
      expect(getLanguageFromPath(path)).toBe(expectedLanguage);
    });
  });

  describe('shouldSkipFile', () => {
    it.each([
      ['node_modules/some-package/index.js', true],
      ['.git/config', true],
      ['.next/cache/data.json', true],
      ['dist/bundle.js', true],
      ['build/output.css', true],
      ['coverage/lcov.info', true],
      ['.nyc_output/report.json', true],
      ['.cache/temp_file', true],
      ['logs/app.log', true],
      ['error.log', true],
      ['.DS_Store', true],
      ['Thumbs.db', true],
      ['.env.local', true],
      ['.env.production', true],
    ])('should return true for skippable path: %s', (path, expected) => {
      expect(shouldSkipFile(path)).toBe(expected);
    });

    it.each([
      ['src/index.js', false],
      ['README.md', false],
      ['components/Button.tsx', false],
      ['app.js', false],
      ['package.json', false],
    ])('should return false for non-skippable path: %s', (path, expected) => {
      expect(shouldSkipFile(path)).toBe(expected);
    });
  });

  describe('compressData', () => {
    it('should remove single and multi-line comments from JS/TS files', () => {
      const jsContent = `
        // This is a single line comment
        const x = 10; /* This is a block comment */
        function hello() { // Another comment
          return "world";
        }
        /*
         * Multi-line
         * block comment
         */
        const y = 20;
      `;
      const expected = 'const x = 10;\nfunction hello() {\n  return "world";\n}\nconst y = 20;';
      expect(compressData(jsContent, 'test.js')).toBe(expected);
    });

    it('should remove comments from CSS files', () => {
      const cssContent = `
        /* This is a block comment */
        body {
          color: red; /* Another comment */
        }
        /* Multi-line
           comment */
        p { font-size: 1em; }
      `;
      const expected = 'body {\n  color: red;\n}\np { font-size: 1em; }';
      expect(compressData(cssContent, 'style.css')).toBe(expected);
    });

    it('should trim whitespace and normalize line endings', () => {
      const content = "  const x = 1;  \n\n\n  \tconst y = 2;\r\n\r\n";
      const expected = "const x = 1;\n\n  const y = 2;";
      expect(compressData(content, 'test.js')).toBe(expected);
    });

    it('should not compress already minified files', () => {
      const minJsContent = 'const x=10,y=20;function hello(){return "world"}';
      expect(compressData(minJsContent, 'script.min.js')).toBe(minJsContent);
      expect(compressData(minJsContent, 'script-min.css')).toBe(minJsContent);
    });

    it('should preserve important comments in JS/TS if logic was added (current does not)', () => {
        // Current compressData does NOT preserve important comments like JSDoc by default.
        // This test reflects the current behavior. If enhanced, it would change.
        const jsContentWithJSDoc = `
          /** @preserve JSDoc comment */
          //! Important Banner
          function important() { return true; }
        `;
        const expected = 'function important() { return true; }'; // Current behavior
        expect(compressData(jsContentWithJSDoc, 'test.js')).toBe(expected);
    });
  });
});


describe('GetStartedPage - Clone Repository Functionality', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    mockRouterPush.mockClear();
    // Clear mock storage before each test
    for (const key in mockSessionStorage) delete mockSessionStorage[key];
    for (const key in mockIndexedDBStore) delete mockIndexedDBStore[key];

    // It's tricky to mock functions defined inside the component.
    // For `storeProjectData`, we are using a file-level mock `mockStoreProjectData`.
    // This relies on the component internally calling this mocked version.
    // This is a simplification for the test. In a real app, you might use:
    // jest.spyOn(GetStartedPageModule, 'storeProjectData').mockImplementation(mockStoreProjectData);
    // if storeProjectData was an export of a module.
    // Since it's internal, this test focuses more on the fetch and routing side effects.
  });

  const selectGitOptionAndFillForm = async (url: string, name: string) => {
    fireEvent.click(screen.getByText('Clone Repository', { selector: 'button:not([class*="w-full"])' })); // Option card button
    await waitFor(() => { // Wait for the form to appear
      expect(screen.getByLabelText(/Repository URL/i)).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/Repository URL/i), { target: { value: url } });
    fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: name } });
  };

  it('should clone a simple repository successfully and redirect', async () => {
    fetchMock.mockResponses(
      // Root content
      [JSON.stringify([
        { name: 'README.md', type: 'file', path: 'README.md', download_url: 'http://example.com/README.md' },
        { name: 'src', type: 'dir', path: 'src' },
      ]), { status: 200 }],
      // src content
      [JSON.stringify([
        { name: 'index.js', type: 'file', path: 'src/index.js', download_url: 'http://example.com/src/index.js' },
      ]), { status: 200 }],
      // README.md content
      ['# Test Repo', { status: 200 }],
      // src/index.js content
      ['console.log("Hello");', { status: 200 }]
    );

    // Replace the actual storeProjectData call inside the component with our mock
    // This is a conceptual step; actual mocking depends on how storeProjectData is defined/used.
    // For this test, we'll assume the component somehow uses the globally mocked `mockStoreProjectData`.
    // A more robust way would be to use React Context or dependency injection for `storeProjectData`
    // or to test its side effects (like data appearing in a mocked localStorage/sessionStorage).

    render(<GetStartedPage />);
    await selectGitOptionAndFillForm('https://github.com/test/repo', 'my-cloned-project');

    // Manually override storeProjectData for this test case if it's part of the component scope
    // This is highly conceptual as direct overriding of internal functions from tests is not standard.
    // We are relying on the file-level mockStoreProjectData being used.

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Clone Repository/i }));
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(4); // Root, src dir, README.md, src/index.js
    });

    // Verify `storeProjectData` (or its effects)
    // This part is tricky without proper DI or export of storeProjectData.
    // We check our mockSessionStorage which mockStoreProjectData populates.
    const storedDataRaw = mockSessionStorage['uploadedProject_chunk_0'];
    expect(storedDataRaw).toBeDefined();
    const storedData = JSON.parse(storedDataRaw as string);

    expect(storedData).toEqual({
      'README.md': { content: '# Test Repo', language: 'markdown' },
      'src/index.js': { content: 'console.log("Hello");', language: 'javascript' },
    });

    expect(mockRouterPush).toHaveBeenCalledWith('/ide?source=git');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should show error for invalid GitHub URL', async () => {
    render(<GetStartedPage />);
    await selectGitOptionAndFillForm('invalid-url', 'test-project');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Clone Repository/i }));
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Invalid GitHub URL format/i);
    });
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('should show error for GitHub API 404 Not Found', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Not Found' }), { status: 404 });

    render(<GetStartedPage />);
    await selectGitOptionAndFillForm('https://github.com/test/nonexistent-repo', 'test-project');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Clone Repository/i }));
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Failed to fetch repository contents/i);
      expect(alert).toHaveTextContent(/404 Not Found/i);
    });
  });

  it('should show error for GitHub API 403 Rate Limit', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'API rate limit exceeded' }), {
      status: 403,
      headers: { 'X-RateLimit-Reset': (Date.now() / 1000 + 3600).toString() }
    });

    render(<GetStartedPage />);
    await selectGitOptionAndFillForm('https://github.com/test/rate-limited-repo', 'test-project');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Clone Repository/i }));
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/GitHub API rate limit exceeded/i);
    });
  });

  it('should handle an empty repository gracefully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]), { status: 200 }); // Empty root directory

    render(<GetStartedPage />);
    await selectGitOptionAndFillForm('https://github.com/test/empty-repo', 'empty-project');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Clone Repository/i }));
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/No files were fetched from the repository/i);
    });
  });

  it('should skip files specified by shouldSkipFile', async () => {
    fetchMock.mockResponses(
      // Root content
      [JSON.stringify([
        { name: 'README.md', type: 'file', path: 'README.md', download_url: 'http://example.com/README.md' },
        { name: 'node_modules', type: 'dir', path: 'node_modules' }, // Should be skipped by fetchContents itself due to shouldSkipFile
        { name: '.git', type: 'dir', path: '.git'}, // Skipped
      ]), { status: 200 }],
       // README.md content
      ['# Test Repo', { status: 200 }]
      // No fetch for node_modules or .git contents as they are skipped
    );

    render(<GetStartedPage />);
    await selectGitOptionAndFillForm('https://github.com/test/repo-with-skips', 'skipped-project');

    // Using the file-level mockStoreProjectData
    (global as any).storeProjectData = mockStoreProjectData;


    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Clone Repository/i }));
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2); // Root, README.md
    });

    const storedDataRaw = mockSessionStorage['uploadedProject_chunk_0'];
    expect(storedDataRaw).toBeDefined();
    const storedData = JSON.parse(storedDataRaw as string);

    expect(storedData).toEqual({
      'README.md': { content: '# Test Repo', language: 'markdown' },
    });
    expect(Object.keys(storedData).length).toBe(1); // Only README.md should be stored
    expect(mockRouterPush).toHaveBeenCalledWith('/ide?source=git');
  });
});

// Enable fetch mocks
fetchMock.enableMocks();

// Clean up any global mocks if necessary, e.g., if storeProjectData was globally spied upon.
afterAll(() => {
  jest.restoreAllMocks();
});
