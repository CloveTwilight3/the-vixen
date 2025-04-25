# Docker Setup for The Vixen Discord Bot

This guide explains how to run The Vixen Discord bot using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Getting Started

1. **Set up environment variables**

   Copy the example environment file and edit it with your Discord credentials:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your Discord token, client ID, and other required settings.

2. **Build and start the Docker container**

   Use Docker Compose to build and start the container:

   ```bash
   docker-compose up -d
   ```

   The `-d` flag runs the container in detached mode, meaning it will continue running in the background.

3. **Check the logs**

   To view the bot's logs:

   ```bash
   docker-compose logs -f
   ```

   Press `Ctrl+C` to exit the log view.

4. **Stop the bot**

   To stop the container:

   ```bash
   docker-compose down
   ```

## Data Persistence

The bot's data is stored in the `./data` directory, which is mounted as a volume in the container. This ensures that your data persists even if the container is removed.

## Updating the Bot

When you want to update the bot with new code:

1. Pull the latest changes:

   ```bash
   git pull
   ```

2. Rebuild and restart the container:

   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Troubleshooting

- **Bot doesn't start**: Check the logs with `docker-compose logs -f` to see any error messages.
- **Configuration issues**: Make sure your `.env` file contains all the necessary variables and valid values.
- **Permission errors**: If you encounter permission errors with the data directory, make sure the directory has the appropriate permissions.

For more detailed help, check the project's main README or open an issue on GitHub.
