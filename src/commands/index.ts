import { Client, Collection, Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PingCommand } from './ping';
import { HelpCommand } from './help';
import { PluralKitCommands } from './pluralkit';

// Define the structure of a command
export interface CommandType {
  name: string;
  description: string;
  aliases?: string[];
  slashCommand?: SlashCommandBuilder;
  isPluralKitCommand?: boolean; // Flag for PluralKit commands
  execute: (message: Message, args: string[]) => Promise<void>;
  executeInteraction?: (interaction: CommandInteraction) => Promise<void>;
}

/**
 * Register all commands with the client
 * @param client Discord.js client
 * @returns Array of registered commands
 */
export async function registerCommands(client: Client): Promise<CommandType[]> {
  // Create arrays for different command types
  const commands: CommandType[] = [];
  const slashCommands: CommandType[] = [];
  const pluralKitCommands: CommandType[] = [];
  
  // Import regular commands
  // Standard commands use slash commands (/)
  slashCommands.push(PingCommand);
  slashCommands.push(HelpCommand);
  
  // Import PluralKit commands
  // PluralKit commands only use prefix (!)
  pluralKitCommands.push(...PluralKitCommands);
  
  // Combine all commands
  commands.push(...slashCommands, ...pluralKitCommands);
  
  // Register each command in the client's commands collection
  commands.forEach(command => {
    client.commands.set(command.name, command);
  });
  
  console.log(`Registered ${slashCommands.length} standard commands`);
  console.log(`Registered ${pluralKitCommands.length} PluralKit commands`);
  
  return commands;
}