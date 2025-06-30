# Contributing to Crux.ai

Thank you for considering contributing to Crux.ai! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous to others, and avoid any form of harassment or discriminatory behavior.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one.

When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead**
- **Include screenshots if possible**
- **Include details about your environment**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful to most users**

### Pull Requests

- Fill in the required template
- Follow the style guidelines
- Write meaningful commit messages
- Update documentation as needed
- Include tests when adding new features
- Ensure the test suite passes
- Make sure your code lints

## Development Process

### Setting Up Development Environment

1. Fork the repository
2. Clone your fork locally
   ```bash
   git clone https://github.com/yourusername/crux.ai.git
   cd crux.ai
   ```
3. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```
4. Create a branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Environment Variables

Copy the `.env.example` file to `.env.local` and update the values as needed:

```bash
cp .env.example .env.local
```

### Style Guidelines

#### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow the existing code style in the project
- Use ES6+ features when appropriate
- Use async/await instead of callbacks or promises when possible

#### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the component design patterns established in the project
- Use CSS modules for component-specific styles

#### Testing

- Write tests for all new features
- Ensure all tests pass before submitting a pull request
- Aim for good test coverage

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

Example: `feat: add user authentication system`

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update the documentation with details of any changes
3. The PR will be merged once you have the sign-off of at least one maintainer

## Additional Resources

- [GitHub Help](https://help.github.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [WebContainer API Documentation](https://webcontainers.io/)

Thank you for contributing to Crux.ai!