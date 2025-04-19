import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';
import { PKMember } from '../../integrations/pluralkit';

export const PKMemberCommand: CommandType = {
  name: 'pkmember',
  description: 'Get information about a PluralKit system member',
  aliases: ['pkm', 'member'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]) {
    // Check if a member ID was provided
    if (!args[0]) {
      return message.reply('Please provide a member ID or use `!pksystem` to view your system first.');
    }
    
    const memberId = args[0];
    
    // Show a "processing" message
    const reply = await message.reply('Fetching member information...');
    
    try {
      // Fetch member info from PluralKit API
      const member = await message.client.pluralKitService.getMember(memberId);
      
      if (!member) {
        return reply.edit(`No PluralKit member found with ID "${memberId}".`);
      }
      
      // Create an embed with member info
      const embed = createMemberEmbed(member);
      
      // Edit the reply with the embed
      await reply.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Error executing pkmember command:', error);
      await reply.edit('There was an error fetching member information.');
    }
  }
};

/**
 * Create an embed for member information
 * @param member The PluralKit member
 * @returns Discord embed
 */
function createMemberEmbed(member: PKMember): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(member.name + (member.display_name ? ` (${member.display_name})` : ''))
    .setDescription(member.description || 'No description')
    .setColor(member.color ? `#${member.color}` : '#7856ff')
    .addFields(
      { name: 'ID', value: member.id, inline: true }
    )
    .setFooter({ text: 'PluralKit Member' });
  
  // Add birthday if available
  if (member.birthday) {
    embed.addFields({ name: 'Birthday', value: member.birthday, inline: true });
  }
  
  // Add pronouns if available
  if (member.pronouns) {
    embed.addFields({ name: 'Pronouns', value: member.pronouns, inline: true });
  }
  
  // Add created date if available
  if (member.created) {
    embed.setTimestamp(new Date(member.created));
  }
  
  // Add proxy tags if available
  if (member.prefix || member.suffix) {
    const proxyTags = `${member.prefix || ''}text${member.suffix || ''}`;
    embed.addFields({ name: 'Proxy Tags', value: `\`${proxyTags}\``, inline: true });
  }
  
  // Add avatar if available
  if (member.avatar_url) {
    embed.setThumbnail(member.avatar_url);
  }
  
  return embed;
}