import { 
  Client, 
  GatewayIntentBits, 
  Collection, 
  Events, 
  Partials,
  Interaction,
  CommandInteraction,
  Message,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';
import { config } from './config';
import { registerCommands, CommandType } from './commands';
import { loadPathfinderData } from './data';
import { DiceService } from './services/dice';
import { PluralKitService } from './integrations/pluralkit';

// Extend the Client type to include commands
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, CommandType>;
    diceService: DiceService;
    pluralKitService: PluralKitService;
  }
}

// Create the client instance
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel, // Required for DM support
    Partials.Message
  ]
});

/**
 * Initialize the Discord bot
 * @returns The initialized client
 */
export async function initBot(): Promise<Client> {
  console.log('Initializing bot...');
  
  try {
    // Initialize services
    console.log('Initializing services...');
    client.diceService = new DiceService();
    client.pluralKitService = new PluralKitService(config.pluralKitApi);
    
    // Load Pathfinder data
    console.log('Loading Pathfinder data...');
    await loadPathfinderData();
    
    // Initialize commands collection
    client.commands = new Collection();
    
    // Register all commands
    console.log('Registering commands...');
    const commands = await registerCommands(client);
    
    // Set up event handlers
    setupEventHandlers();
    
    // Register slash commands with Discord API
    if (config.registerCommands) {
      await registerSlashCommands(commands);
    }
    
    // Login to Discord
    console.log('Logging in to Discord...');
    await client.login(config.token);
    console.log(`Bot initialized successfully as ${client.user?.tag}`);
    
    return client;
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    throw error;
  }
}

/**
 * Set up Discord event handlers
 */
function setupEventHandlers(): void {
  // Ready event - fired when the bot successfully connects to Discord
  client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    
    // Set the bot's presence
    client.user?.setActivity({
      name: `Pathfinder 2E | ${config.prefix}help`,
      type: 0 // Playing
    });
  });
  
  // Interaction event - handle slash commands
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    
    handleCommandInteraction(interaction as CommandInteraction);
  });
  
  // Message event - handle prefix commands and PluralKit integration
  client.on(Events.MessageCreate, async (message: Message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Handle PluralKit proxying if enabled
    if (config.enablePluralKit) {
      await client.pluralKitService.handleMessage(message);
    }
    
    // Handle prefixed commands
    if (message.content.startsWith(config.prefix)) {
      const args = message.content.slice(config.prefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      
      if (!commandName) return;
      
      const command = client.commands.get(commandName) || 
                     client.commands.find(cmd => cmd.aliases?.includes(commandName));
      
      if (!command) return;
      
      // Only process regular commands via slash commands except PluralKit commands
      // which should work with the prefix
      if (!command.isPluralKitCommand) {
        await message.reply(`Please use slash commands for standard bot features. Try using /${commandName} instead of ${config.prefix}${commandName}`);
        return;
      }
      
      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        await message.reply('There was an error executing that command!');
      }
    }
  });
  
  // Error event - handle uncaught errors
  client.on(Events.Error, (error) => {
    console.error('Discord client error:', error);
  });
}

/**
 * Handle a slash command interaction
 * @param interaction The command interaction
 */
async function handleCommandInteraction(interaction: CommandInteraction): Promise<void> {
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`Command not found: ${interaction.commandName}`);
    return;
  }
  
  try {
    // Check if executeInteraction method exists before calling it
    if (command.executeInteraction) {
      await command.executeInteraction(interaction);
    } else {
      await interaction.reply({ 
        content: 'This command does not support slash commands yet.', 
        ephemeral: true 
      });
    }
  } catch (error) {
    console.error(`Error executing slash command ${interaction.commandName}:`, error);
    
    // Only try to respond if the interaction hasn't been acknowledged
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'There was an error executing this command!',
          ephemeral: true
        });
      } else if (interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error executing this command!',
          ephemeral: true
        });
      }
    } catch (responseError) {
      console.error('Failed to send error response:', responseError);
    }
  }
}

/**
 * Register slash commands with Discord API
 * @param commands The commands to register
 */
async function registerSlashCommands(commands: CommandType[]): Promise<void> {
  try {
    console.log('Registering slash commands with Discord API...');
    
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    const slashCommands = commands
      .filter(cmd => cmd.slashCommand)
      .map(cmd => cmd.slashCommand?.toJSON());
    
    if (config.devGuildId) {
      // Register commands to a specific guild (faster for development)
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.devGuildId),
        { body: slashCommands }
      );
      console.log(`Successfully registered ${slashCommands.length} application commands to guild ${config.devGuildId}`);
    } else {
      // Register global commands (can take up to an hour to propagate)
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: slashCommands }
      );
      console.log(`Successfully registered ${slashCommands.length} global application commands`);
    }
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
}