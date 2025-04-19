import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';
import { config } from '../../config';

export const PKHelpCommand: CommandType = {
  name: 'pkhelp',
  description: 'View all PluralKit commands',
  aliases: ['pluralkithelp', 'pkh'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]) {
    // Create an embed with all PluralKit commands
    const embed = new EmbedBuilder()
      .setTitle('PluralKit Commands')
      .setDescription('Here are all the available PluralKit commands:')
      .setColor('#7856ff')
      .addFields(
        {
          name: `${config.prefix}pksystem [system_id or @user]`,
          value: 'View information about a PluralKit system',
          inline: false
        },
        {
          name: `${config.prefix}pkmember <member_id>`,
          value: 'View information about a specific system member',
          inline: false
        },
        {
          name: `${config.prefix}pkswitch [system_id or @user]`,
          value: 'View current fronters for a system',
          inline: false
        },
        {
          name: `${config.prefix}pkswitch register <member_id1> [member_id2...]`,
          value: 'Register a new switch with the specified member(s)',
          inline: false
        },
        {
          name: `${config.prefix}pkproxy`,
          value: 'Get information about message proxying',
          inline: false
        },
        {
          name: `${config.prefix}pkhelp`,
          value: 'View this help message',
          inline: false
        }
      )
      .setFooter({ text: 'For PluralKit API integration by The Vixen' });
    
    await message.reply({ embeds: [embed] });
  }
};