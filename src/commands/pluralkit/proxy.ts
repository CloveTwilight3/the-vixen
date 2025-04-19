import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';

export const PKProxyCommand: CommandType = {
  name: 'pkproxy',
  description: 'Get information about proxying or toggle proxying',
  aliases: ['proxy'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]) {
    // Create an embed with proxy information
    const embed = new EmbedBuilder()
      .setTitle('PluralKit Proxying')
      .setDescription('Proxying allows system members to send messages with their own name and avatar.')
      .setColor('#7856ff')
      .addFields(
        { 
          name: 'How Proxying Works', 
          value: 'When you send a message with proxy tags, PluralKit will delete your message and ' +
                 'resend it with the member\'s name and avatar.', 
          inline: false 
        },
        { 
          name: 'Example Proxy Tags', 
          value: '`Name:` or `[Name]` or `{Name}` or custom tags', 
          inline: false 
        },
        { 
          name: 'Setting Proxy Tags', 
          value: 'Use the official PluralKit bot to set proxy tags for your members: `pk;member <id> proxy [tags]`',
          inline: false 
        },
        {
          name: 'Getting Started',
          value: 'Register a system with the official PluralKit bot using `pk;system new` and add members using `pk;member new`',
          inline: false
        }
      )
      .setFooter({ text: 'More information: https://pluralkit.me/guide' });
    
    await message.reply({ embeds: [embed] });
  }
};