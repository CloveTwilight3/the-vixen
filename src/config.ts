import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration interface
interface BotConfig {
  // Discord bot settings
  token: string;
  clientId: string;
  prefix: string;
  devGuildId?: string;
  registerCommands: boolean;
  
  // Feature flags
  enablePluralKit: boolean;
  
  // API endpoints
  pluralKitApi: string;
  
  // Admin settings
  ownerIds: string[];
  
  // Data settings
  dataPath: string;
}

// Configuration with default values
export const config: BotConfig = {
  // Discord bot settings
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  prefix: process.env.COMMAND_PREFIX || '!',
  devGuildId: process.env.DEV_GUILD_ID,
  registerCommands: process.env.REGISTER_COMMANDS === 'true',
  
  // Feature flags
  enablePluralKit: process.env.ENABLE_PLURALKIT === 'true',
  
  // API endpoints
  pluralKitApi: process.env.PLURALKIT_API || 'https://api.pluralkit.me/v2',
  
  // Admin settings
  ownerIds: (process.env.OWNER_IDS || '').split(',').filter(id => id.length > 0),
  
  // Data settings
  dataPath: process.env.DATA_PATH || './data'
};

// Validate required config
if (!config.token) {
  throw new Error('Discord token is required! Please set DISCORD_TOKEN in your .env file');
}

if (!config.clientId) {
  throw new Error('Client ID is required! Please set CLIENT_ID in your .env file');
}

export default config;