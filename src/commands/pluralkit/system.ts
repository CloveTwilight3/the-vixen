import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';
import { PKSystem } from '../../integrations/pluralkit';

export const PKSystemCommand: CommandType = {
  name: 'pksystem',
  description: 'Get information about a PluralKit system',
  aliases: ['pks', 'system'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]) {
    // Get the target system ID or user
    const targetId = args[0] || message.author.id;
    
    // Show a "processing" message
    const reply = await message.reply('Fetching system information...');
    
    try {
      // Fetch system info from PluralKit API
      const system = await message.client.pluralKitService.getSystem(targetId);
      
      if (!system) {
        return reply.edit(`No PluralKit system found for ${targetId === message.author.id ? 'you' : targetId}.`);
      }
      
      // Create an embed with system info
      const embed = createSystemEmbed(system);
      
      // Edit the reply with the embed
      await reply.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Error executing pksystem command:', error);
      await reply.edit('There was an error fetching system information.');
    }
  }
};

/**
 * Create an embed for system information
 * @param system The PluralKit system
 * @returns Discord embed
 */
function createSystemEmbed(system: PKSystem): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(system.name)
    .setDescription(system.description || 'No description')
    .setColor(system.color ? `#${system.color}` : '#7856ff')
    .addFields(
      { name: 'ID', value: system.id, inline: true },
      { name: 'Members', value: system.member_count?.toString() || 'Unknown', inline: true }
    )
    .setFooter({ text: 'PluralKit System' })
    .setTimestamp(new Date(system.created));
  
  // Add system tag if available
  if (system.tag) {
    embed.addFields({ name: 'Tag', value: system.tag, inline: true });
  }
  
  // Add avatar if available
  if (system.avatar_url) {
    embed.setThumbnail(system.avatar_url);
  }
  
  return embed;
}