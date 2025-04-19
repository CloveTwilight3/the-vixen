import { Message } from 'discord.js';
// For Node.js with CommonJS modules (not ESM), use this import style:
const fetch = require('node-fetch');

// PluralKit system type
export interface PKSystem {
  id: string;
  name: string;
  description?: string;
  tag?: string;
  avatar_url?: string;  // API returns snake_case
  created: string;
  privacy?: Record<string, string>;
  color?: string;
  member_count?: number;  // The API returns member_count, not members
}

// PluralKit member type
export interface PKMember {
  id: string;
  name: string;
  display_name?: string;  // API returns snake_case
  description?: string;
  color?: string;
  avatar_url?: string;  // API returns snake_case
  birthday?: string;
  pronouns?: string;
  created?: string;
  keep_proxy?: boolean;  // API returns snake_case
  prefix?: string;
  suffix?: string;
  privacy?: Record<string, string>;
}

// PluralKit switch type
export interface PKSwitch {
  id: string;
  timestamp: string;
  members: string[];
}

// Service for interacting with the PluralKit API
export class PluralKitService {
  private apiUrl: string;
  
  // Track proxied messages to avoid re-processing
  private proxiedMessages = new Set<string>();
  
  /**
   * Create a new PluralKitService
   * @param apiUrl The base URL for the PluralKit API
   */
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    console.log('PluralKit service initialized with API:', apiUrl);
  }
  
  /**
   * Handle a Discord message for PluralKit proxying
   * @param message The Discord message
   */
  public async handleMessage(message: Message): Promise<void> {
    // In a full implementation, this would look for proxy tags
    // and coordinate with PluralKit API, but that's beyond our scope
    // For now, just silently return
    return;
  }
  
  /**
   * Get information about a PluralKit system by ID or user ID
   * @param idOrUser The system ID or Discord user ID
   * @returns System information
   */
  public async getSystem(idOrUser: string): Promise<PKSystem | null> {
    try {
      // Check if it's a Discord user mention/ID
      if (idOrUser.match(/^<@!?\d+>$/) || idOrUser.match(/^\d+$/)) {
        const userId = idOrUser.replace(/[<@!>]/g, '');
        const response = await fetch(`${this.apiUrl}/systems/discord/${userId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json() as PKSystem;
      }
      
      // Otherwise treat as a system ID
      const response = await fetch(`${this.apiUrl}/systems/${idOrUser}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as PKSystem;
    } catch (error) {
      console.error('Error fetching system:', error);
      return null;
    }
  }
  
  /**
   * Get all members of a system
   * @param systemId The system ID
   * @returns Array of members
   */
  public async getSystemMembers(systemId: string): Promise<PKMember[]> {
    try {
      const response = await fetch(`${this.apiUrl}/systems/${systemId}/members`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as PKMember[];
    } catch (error) {
      console.error('Error fetching system members:', error);
      return [];
    }
  }
  
  /**
   * Get information about a specific member
   * @param memberId The member ID
   * @returns Member information
   */
  public async getMember(memberId: string): Promise<PKMember | null> {
    try {
      const response = await fetch(`${this.apiUrl}/members/${memberId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as PKMember;
    } catch (error) {
      console.error('Error fetching member:', error);
      return null;
    }
  }
  
  /**
   * Get the current fronters for a system
   * @param systemId The system ID
   * @returns Current switch information
   */
  public async getCurrentFronters(systemId: string): Promise<PKSwitch | null> {
    try {
      const response = await fetch(`${this.apiUrl}/systems/${systemId}/fronters`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as PKSwitch;
    } catch (error) {
      console.error('Error fetching current fronters:', error);
      return null;
    }
  }
  
  /**
   * Get recent switches for a system
   * @param systemId The system ID
   * @param limit Number of switches to return (default: 10)
   * @returns Array of switches
   */
  public async getSwitches(systemId: string, limit = 10): Promise<PKSwitch[]> {
    try {
      const response = await fetch(`${this.apiUrl}/systems/${systemId}/switches?limit=${limit}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as PKSwitch[];
    } catch (error) {
      console.error('Error fetching switches:', error);
      return [];
    }
  }
  
  /**
   * Register a new switch
   * @param systemId The system ID
   * @param memberIds Array of member IDs that are fronting
   * @returns The new switch information
   */
  public async registerSwitch(systemId: string, memberIds: string[]): Promise<PKSwitch | null> {
    try {
      const response = await fetch(`${this.apiUrl}/systems/${systemId}/switches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          members: memberIds
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as PKSwitch;
    } catch (error) {
      console.error('Error registering switch:', error);
      return null;
    }
  }
}