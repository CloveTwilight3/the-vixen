import { Client, Collection, Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';

// Define the structure of a command
export interface CommandType {
  name: string;
  description: string;
  aliases?: string[];
  slashCommand?: SlashCommandBuilder;
  execute: (message: Message, args: string[]) => Promise<void>;
  executeInteraction?: (interaction: CommandInteraction) => Promise<void>;
}

/**
 * Register all commands with the client
 * @param client Discord.js client
 * @returns Array of registered commands
 */
export async function registerCommands(client: Client): Promise<CommandType[]> {
  // This is a placeholder function that will later register all commands
  // For now, it just returns an empty array
  const commands: CommandType[] = [];
  
  // Later, we'll import all command modules and add them to the collection
  // For example:
  // import { SpellCommand } from './spell';
  // commands.push(SpellCommand);
  
  // Register each command in the client's commands collection
  commands.forEach(command => {
    client.commands.set(command.name, command);
  });
  
  console.log(`Registered ${commands.length} commands`);
  return commands;
}