import { config } from './config';
import { initBot } from './bot';

// Display startup message
console.log('Starting The Vixen - Pathfinder 2E Discord Bot');
console.log('----------------------------------------------');

// Check for required configuration
if (!config.token) {
  console.error('Error: Discord token is not configured');
  console.error('Please check your .env file and set DISCORD_TOKEN');
  process.exit(1);
}

// Initialize the bot
initBot()
  .then(() => {
    console.log('Bot initialization completed successfully');
  })
  .catch(error => {
    console.error('Bot initialization failed:', error);
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});