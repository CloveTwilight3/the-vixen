import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';
import { PKMember, PKSwitch } from '../../integrations/pluralkit';

export const PKSwitchCommand: CommandType = {
  name: 'pkswitch',
  description: 'Register a switch or view current fronters',
  aliases: ['switch', 'front'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]) {
    // Get command subtype
    const subcommand = args[0]?.toLowerCase();
    
    if (subcommand === 'register' || subcommand === 'out' || subcommand === 'new') {
      // Handle registering a new switch
      return registerSwitch(message, args.slice(1));
    } else {
      // Default behavior: show current fronters
      return showCurrentFronters(message, args);
    }
  }
};

/**
 * Show the current fronters for a system
 * @param message Discord message
 * @param args Command arguments
 */
async function showCurrentFronters(message: Message, args: string[]): Promise<void> {
  // Get the target system ID or user
  const targetId = args[0] || message.author.id;
  
  // Show a "processing" message
  const reply = await message.reply('Fetching current fronters...');
  
  try {
    // First, get the system
    const system = await message.client.pluralKitService.getSystem(targetId);
    
    if (!system) {
      return reply.edit(`No PluralKit system found for ${targetId === message.author.id ? 'you' : targetId}.`);
    }
    
    // Then get current fronters
    const fronters = await message.client.pluralKitService.getCurrentFronters(system.id);
    
    if (!fronters || fronters.members.length === 0) {
      return reply.edit(`No fronters currently registered for system "${system.name}".`);
    }
    
    // Get detailed member information for each fronter
    const memberDetails: PKMember[] = [];
    for (const memberId of fronters.members) {
      const member = await message.client.pluralKitService.getMember(memberId);
      if (member) {
        memberDetails.push(member);
      }
    }
    
    // Create an embed with fronter info
    const embed = createFronterEmbed(system.name, fronters, memberDetails);
    
    // Edit the reply with the embed
    await reply.edit({ content: null, embeds: [embed] });
  } catch (error) {
    console.error('Error fetching fronters:', error);
    await reply.edit('There was an error fetching fronter information.');
  }
}

/**
 * Register a new switch
 * @param message Discord message
 * @param args Command arguments (member IDs)
 */
async function registerSwitch(message: Message, args: string[]): Promise<void> {
  // Check if member IDs were provided
  if (args.length === 0) {
    return message.reply('Please provide at least one member ID to register a switch.');
  }
  
  // Show a "processing" message
  const reply = await message.reply('Registering switch...');
  
  try {
    // First, get the user's system
    const system = await message.client.pluralKitService.getSystem(message.author.id);
    
    if (!system) {
      return reply.edit('You don\'t have a PluralKit system associated with your Discord account.');
    }
    
    // Register the switch
    const memberIds = args;
    const switchResult = await message.client.pluralKitService.registerSwitch(system.id, memberIds);
    
    if (!switchResult) {
      return reply.edit('Failed to register switch. Please check the member IDs and try again.');
    }
    
    // Get detailed member information for each fronter
    const memberDetails: PKMember[] = [];
    for (const memberId of switchResult.members) {
      const member = await message.client.pluralKitService.getMember(memberId);
      if (member) {
        memberDetails.push(member);
      }
    }
    
    // Create an embed with the new switch info
    const embed = createFronterEmbed(system.name, switchResult, memberDetails, true);
    
    // Edit the reply with the embed
    await reply.edit({ content: 'Switch registered successfully!', embeds: [embed] });
  } catch (error) {
    console.error('Error registering switch:', error);
    await reply.edit('There was an error registering the switch.');
  }
}

/**
 * Create an embed for fronter information
 * @param systemName Name of the system
 * @param switchInfo Switch information
 * @param members Detailed member information
 * @param isNewSwitch Whether this is a newly registered switch
 * @returns Discord embed
 */
function createFronterEmbed(
  systemName: string, 
  switchInfo: PKSwitch, 
  members: PKMember[],
  isNewSwitch = false
): EmbedBuilder {
  const switchTime = new Date(switchInfo.timestamp);
  const timeAgo = getTimeAgo(switchTime);
  
  const embed = new EmbedBuilder()
    .setTitle(`Current Fronters for ${systemName}`)
    .setColor('#7856ff')
    .setFooter({ text: isNewSwitch ? 'Switch registered' : 'Switch occurred' })
    .setTimestamp(switchTime);
  
  // Add fronter list
  if (members.length > 0) {
    const membersList = members.map(m => {
      const name = m.display_name || m.name;
      return `**${name}** (ID: \`${m.id}\`)`;
    }).join('\n');
    
    embed.setDescription(membersList);
    embed.addFields({ name: 'Switch Time', value: `${timeAgo} ago`, inline: true });
  } else {
    embed.setDescription('No member details available.');
  }
  
  return embed;
}

/**
 * Get a human-readable time ago string
 * @param date The date to calculate from
 * @returns Human-readable time ago
 */
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  
  return Math.floor(seconds) + ' seconds';
}