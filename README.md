# Crux.ai

Crux.ai is a modern web-based IDE with AI-powered coding assistance, featuring a WebContainer-based preview system for instant code execution.

## Features

- **Live Code Preview**: Run your code directly in the browser using WebContainer technology
- **AI-Powered Assistance**: Get intelligent code suggestions and help
- **Modern UI**: Built with Next.js and Tailwind CSS for a responsive experience
- **Monaco Editor**: Professional code editing experience

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Modern web browser (Chrome, Firefox, Edge)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/crux.ai.git
   cd crux.ai
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API keys and configuration.

4. Start the development server
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Setup

For Docker-based deployment and development, please refer to [README.docker.md](README.docker.md). We've added comprehensive Docker support with:

- Multi-stage build process for optimized images
- Docker Compose configuration for easy deployment
- Environment variable management
- Health checks and resource limits

## Environment Variables

Crux.ai requires several environment variables to function properly. Copy the `.env.example` file to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Key environment variables include:

- `NEXT_PUBLIC_APP_URL`: Your application URL
- `NEXT_PUBLIC_ENABLE_WEBCONTAINER`: Enable WebContainer functionality
- `GEMINI_API_KEY`: Your Google Gemini API key (if using Gemini)

See `.env.example` for all available options.

## Project Structure

```
├── app/                # Next.js app directory
├── components/         # React components
│   ├── ui/             # UI components
│   └── ...             # Feature components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and libraries
├── public/             # Static assets
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Contributing

We welcome contributions to Crux.ai! For detailed guidelines on how to contribute, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file.

Here's a quick overview of the process:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style Guidelines

- Follow the existing code style
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Include comments for complex logic
- Add tests for new features

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the version numbers in package.json following [SemVer](http://semver.org/)
3. The PR will be merged once it receives approval from maintainers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [WebContainer API](https://webcontainers.io/) - For browser-based code execution
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [shadcn/ui](https://ui.shadcn.com/) - UI components