# Docker Setup for Crux.ai

This document provides instructions for running the Crux.ai application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Building and Running with Docker Compose

The easiest way to run the application is using Docker Compose:

1. Set up environment variables:
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   # Especially add your API keys if needed
   ```

2. Build and run the container:
   ```bash
   # Build and start the container
   docker-compose up -d --build
   
   # View logs
   docker-compose logs -f
   
   # Stop the container
   docker-compose down
   ```

The application will be available at http://localhost:3000

## Building and Running with Docker

Alternatively, you can use Docker commands directly:

```bash
# Build the Docker image
docker build -t crux-ai .

# Run the container
docker run -p 3000:3000 -d --name crux-ai-container crux-ai

# View logs
docker logs -f crux-ai-container

# Stop the container
docker stop crux-ai-container

# Remove the container
docker rm crux-ai-container
```

## Docker Configuration

The Docker setup includes:

1. **Multi-stage build** for optimized image size
2. **Alpine-based Node.js** for a smaller footprint
3. **Non-root user** for better security
4. **Health checks** to ensure the application is running properly
5. **Resource limits** to prevent container from using too much resources
6. **CORS headers** configured for WebContainer compatibility

## Customizing the Configuration

You can customize the Docker configuration by:

1. Modifying the `Dockerfile` for build-time configurations
2. Adjusting the `docker-compose.yml` for runtime settings
3. Updating environment variables in the `docker-compose.yml` file

## Troubleshooting

### Common Issues

1. **Port conflicts**: If port 3000 is already in use, change the port mapping in `docker-compose.yml`:
   ```yaml
   ports:
     - "8080:3000"  # Maps container port 3000 to host port 8080
   ```

2. **Build failures**: Check Docker logs for detailed error messages:
   ```bash
   docker-compose logs -f
   ```

3. **WebContainer issues**: Ensure the CORS headers are properly set in both Next.js config and Docker setup.