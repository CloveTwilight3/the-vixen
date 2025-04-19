import { Message, CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CommandType } from './index';
import { config } from '../config';

export const HelpCommand: CommandType = {
  name: 'help',
  description: 'Shows information about commands',
  aliases: ['commands', 'h'],
  
  // Define slash command
  slashCommand: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows information about commands'),
  
  // Handler for prefix-based command (!help)
  async execute(message: Message, args: string[]) {
    const embed = createHelpEmbed(message.client.commands);
    await message.reply({ embeds: [embed] });
  },
  
  // Handler for slash command (/help)
  async executeInteraction(interaction: CommandInteraction) {
    const embed = createHelpEmbed(interaction.client.commands);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

/**
 * Create the help embed with command information
 * @param commands Command collection
 * @returns Discord embed with help information
 */
function createHelpEmbed(commands: any) {
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Bot Commands')
    .setDescription('Here are the available commands:')
    .setFooter({ text: 'Use /command or !command (for PluralKit commands)' });
  
  // Standard commands section
  let standardCommands = '';
  commands.forEach((cmd: CommandType) => {
    if (!cmd.isPluralKitCommand) {
      standardCommands += `**/${cmd.name}** - ${cmd.description}\n`;
    }
  });
  
  // PluralKit commands section
  let pluralKitCommands = '';
  commands.forEach((cmd: CommandType) => {
    if (cmd.isPluralKitCommand) {
      pluralKitCommands += `**${config.prefix}${cmd.name}** - ${cmd.description}\n`;
    }
  });
  
  // Add fields
  if (standardCommands) {
    embed.addFields({ name: 'Standard Commands (use /)', value: standardCommands });
  }
  
  if (pluralKitCommands) {
    embed.addFields({ name: 'PluralKit Commands (use !)', value: pluralKitCommands });
  }
  
  return embed;
}