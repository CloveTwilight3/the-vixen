#!/bin/bash
# Script to deploy The Vixen bot with TypeScript fixes

echo "Applying TypeScript fixes..."

# Create directories if they don't exist
mkdir -p src/commands/pluralkit

# Apply member.ts fix
cat > src/commands/pluralkit/member.ts << 'EOL'
import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';
import { PKMember } from '../../integrations/pluralkit';

export const PKMemberCommand: CommandType = {
  name: 'pkmember',
  description: 'Get information about a PluralKit system member',
  aliases: ['pkm', 'member'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]): Promise<void> {
    // Check if a member ID was provided
    if (!args[0]) {
      await message.reply('Please provide a member ID or use `!pksystem` to view your system first.');
      return;
    }
    
    const memberId = args[0];
    
    // Show a "processing" message
    const reply = await message.reply('Fetching member information...');
    
    try {
      // Fetch member info from PluralKit API
      const member = await message.client.pluralKitService.getMember(memberId);
      
      if (!member) {
        await reply.edit(`No PluralKit member found with ID "${memberId}".`);
        return;
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
EOL

# Apply system.ts fix
cat > src/commands/pluralkit/system.ts << 'EOL'
import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';
import { PKSystem } from '../../integrations/pluralkit';

export const PKSystemCommand: CommandType = {
  name: 'pksystem',
  description: 'Get information about a PluralKit system',
  aliases: ['pks', 'system'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]): Promise<void> {
    // Get the target system ID or user
    const targetId = args[0] || message.author.id;
    
    // Show a "processing" message
    const reply = await message.reply('Fetching system information...');
    
    try {
      // Fetch system info from PluralKit API
      const system = await message.client.pluralKitService.getSystem(targetId);
      
      if (!system) {
        await reply.edit(`No PluralKit system found for ${targetId === message.author.id ? 'you' : targetId}.`);
        return;
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
EOL

# Apply switch.ts fix
cat > src/commands/pluralkit/switch.ts << 'EOL'
import { Message, EmbedBuilder } from 'discord.js';
import { CommandType } from '../index';
import { PKMember, PKSwitch } from '../../integrations/pluralkit';

export const PKSwitchCommand: CommandType = {
  name: 'pkswitch',
  description: 'Register a switch or view current fronters',
  aliases: ['switch', 'front'],
  isPluralKitCommand: true,
  
  async execute(message: Message, args: string[]): Promise<void> {
    // Get command subtype
    const subcommand = args[0]?.toLowerCase();
    
    if (subcommand === 'register' || subcommand === 'out' || subcommand === 'new') {
      // Handle registering a new switch
      await registerSwitch(message, args.slice(1));
      return;
    } else {
      // Default behavior: show current fronters
      await showCurrentFronters(message, args);
      return;
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
      await reply.edit(`No PluralKit system found for ${targetId === message.author.id ? 'you' : targetId}.`);
      return;
    }
    
    // Then get current fronters
    const fronters = await message.client.pluralKitService.getCurrentFronters(system.id);
    
    if (!fronters || fronters.members.length === 0) {
      await reply.edit(`No fronters currently registered for system "${system.name}".`);
      return;
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
    await message.reply('Please provide at least one member ID to register a switch.');
    return;
  }
  
  // Show a "processing" message
  const reply = await message.reply('Registering switch...');
  
  try {
    // First, get the user's system
    const system = await message.client.pluralKitService.getSystem(message.author.id);
    
    if (!system) {
      await reply.edit('You don\'t have a PluralKit system associated with your Discord account.');
      return;
    }
    
    // Register the switch
    const memberIds = args;
    const switchResult = await message.client.pluralKitService.registerSwitch(system.id, memberIds);
    
    if (!switchResult) {
      await reply.edit('Failed to register switch. Please check the member IDs and try again.');
      return;
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
EOL

# Update Dockerfile to use Node 20
cat > Dockerfile << 'EOL'
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install Python (needed for the run-bot.py script)
RUN apk add --update python3

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p data

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on (if your bot uses HTTP)
# EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
EOL

echo "TypeScript fixes applied and Dockerfile updated to use Node.js 20"
echo "You can now build the Docker container with: docker-compose up -d --build"

# Make the script executable
chmod +x deploy.sh
