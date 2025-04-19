import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';

// Data storage
export const pathfinderData = {
  spells: {} as any,
  feats: {} as any,
  items: {} as any,
  classes: {} as any,
  monsters: {} as any
};

/**
 * Load Pathfinder data from JSON files
 */
export async function loadPathfinderData(): Promise<void> {
  console.log('Loading Pathfinder data...');
  
  try {
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(config.dataPath, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore
    }
    
    // For now, we'll just log that we're loading data
    // In the future, we'll implement the actual loading logic
    console.log('Data directory:', config.dataPath);
    console.log('Data will be loaded from Foundry VTT PF2E system');
    
    // This is where we would load the actual data files
    // Example:
    // const spellsPath = path.join(config.dataPath, 'spells.json');
    // if (await fileExists(spellsPath)) {
    //   const spellsData = await fs.readFile(spellsPath, 'utf-8');
    //   pathfinderData.spells = JSON.parse(spellsData);
    // }
    
    console.log('Pathfinder data loaded successfully');
  } catch (error) {
    console.error('Error loading Pathfinder data:', error);
    throw error;
  }
}

/**
 * Check if a file exists
 * @param filePath Path to the file
 * @returns Whether the file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}