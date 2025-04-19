import { Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandType } from './index';

export const PingCommand: CommandType = {
  name: 'ping',
  description: 'Replies with Pong!',
  aliases: ['latency'],
  // Remove this line if you want ping to be slash command only
  // isPluralKitCommand: true, 
  
  // Define slash command
  slashCommand: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  
  // Handler for prefix-based command (!ping)
  async execute(message: Message, args: string[]) {
    const sent = await message.reply('Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    
    await sent.edit(`Pong! Latency is ${latency}ms. API Latency is ${Math.round(message.client.ws.ping)}ms`);
  },
  
  // Handler for slash command (/ping)
  async executeInteraction(interaction: CommandInteraction) {
    await interaction.reply('Pinging...');
    
    // Calculate latency
    const latency = Date.now() - interaction.createdTimestamp;
    
    // No need for deferReply - just edit the reply directly
    await interaction.editReply(`Pong! Latency is ${latency}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
  }
};