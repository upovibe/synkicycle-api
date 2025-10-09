import OpenAI from 'openai';
import { config } from '@config/env';

interface User {
  _id: string;
  uuid: string;
  username?: string;
  name?: string;
  email: string;
  profession?: string;
  bio?: string;
  interests?: string[];
  avatar?: string;
  verified: boolean;
  createdAt: string;
}

interface MatchSuggestion {
  userId: string;
  matchScore: number;
  reason: string;
  connectionType: 'professional' | 'social' | 'both';
}

interface MatchResult {
  user: User;
  matchScore: number;
  reason: string;
  connectionType: 'professional' | 'social' | 'both';
}

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  /**
   * Generate user matches based on profile analysis
   * @param currentUser - The user requesting matches
   * @param potentialMatches - Array of other users to analyze
   * @returns Array of match suggestions with reasons
   */
  async generateUserMatches(
    currentUser: User,
    potentialMatches: User[]
  ): Promise<MatchResult[]> {
    try {
      if (!config.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Prepare current user profile for analysis
      const currentUserProfile = this.formatUserProfile(currentUser);
      
      // Prepare potential matches for analysis
      const matchesProfile = potentialMatches.map(user => ({
        id: user._id,
        name: user.name || user.username || 'Anonymous',
        username: user.username,
        profession: user.profession,
        bio: user.bio,
        interests: user.interests,
        email: user.email, // For internal reference only
      }));

      const prompt = `
You are an AI networking assistant. Analyze the following user profile and suggest the best professional and social connections from the list of potential matches.

CURRENT USER PROFILE:
${currentUserProfile}

POTENTIAL MATCHES:
${JSON.stringify(matchesProfile, null, 2)}

Please analyze each potential match and provide:
1. A match score (0-100) based on compatibility
2. A brief, personalized reason for the connection (1-2 sentences)
3. The type of connection (professional, social, or both)

Consider factors like:
- Shared interests and hobbies
- Complementary professional skills
- Similar career levels or goals
- Geographic proximity (if available)
- Mutual networking opportunities

Return your analysis as a JSON array with this structure:
[
  {
    "userId": "user_id_here",
    "matchScore": 85,
    "reason": "Personalized reason for connection",
    "connectionType": "professional"
  }
]

Only include matches with a score of 60 or higher. Limit to the top 5 matches.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert networking assistant that helps professionals find meaningful connections. Always provide helpful, personalized match suggestions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      // Parse AI response
      let matchSuggestions;
      try {
        matchSuggestions = JSON.parse(aiResponse);
      } catch {
        console.error('Failed to parse AI response:', aiResponse);
        throw new Error('Invalid AI response format');
      }

      // Map AI suggestions back to actual user objects
      const results = matchSuggestions.map((suggestion: MatchSuggestion) => {
        const matchedUser = potentialMatches.find(user => 
          user._id.toString() === suggestion.userId
        );
        
        if (!matchedUser) {
          return null;
        }

        return {
          user: {
            id: matchedUser._id,
            uuid: matchedUser.uuid,
            username: matchedUser.username,
            name: matchedUser.name,
            email: matchedUser.email,
            profession: matchedUser.profession,
            bio: matchedUser.bio,
            interests: matchedUser.interests,
            avatar: matchedUser.avatar,
            verified: matchedUser.verified,
            createdAt: matchedUser.createdAt,
          },
          matchScore: suggestion.matchScore,
          reason: suggestion.reason,
          connectionType: suggestion.connectionType,
        };
      }).filter(Boolean);

      return results;
    } catch (error) {
      console.error('AI matching error:', error);
      throw new Error('Failed to generate AI matches');
    }
  }

  /**
   * Format user profile for AI analysis
   */
  private formatUserProfile(user: User): string {
    const profile = [];
    
    if (user.name) profile.push(`Name: ${user.name}`);
    if (user.username) profile.push(`Username: @${user.username}`);
    if (user.profession) profile.push(`Profession: ${user.profession}`);
    if (user.bio) profile.push(`Bio: ${user.bio}`);
    if (user.interests && user.interests.length > 0) {
      profile.push(`Interests: ${user.interests.join(', ')}`);
    }
    
    return profile.join('\n');
  }

  /**
   * Generate a personalized connection message
   */
  async generateConnectionMessage(
    currentUser: User,
    targetUser: User,
    connectionType: 'professional' | 'social' | 'both'
  ): Promise<string> {
    try {
      const prompt = `
Generate a personalized connection message for a networking platform.

CURRENT USER:
- Name: ${currentUser.name || currentUser.username}
- Profession: ${currentUser.profession || 'Not specified'}
- Bio: ${currentUser.bio || 'Not provided'}

TARGET USER:
- Name: ${targetUser.name || targetUser.username}
- Profession: ${targetUser.profession || 'Not specified'}
- Bio: ${targetUser.bio || 'Not provided'}

CONNECTION TYPE: ${connectionType}

Create a professional, friendly message (2-3 sentences) that:
1. Introduces the sender
2. Mentions a specific reason for connecting
3. Suggests a next step or conversation starter

Keep it natural and avoid being too formal or salesy.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional networking assistant. Generate warm, authentic connection messages that help people build meaningful professional relationships.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || 'Hi! I\'d love to connect and learn more about your work.';
    } catch (error) {
      console.error('Connection message generation error:', error);
      return 'Hi! I\'d love to connect and learn more about your work.';
    }
  }
}

export default new AIService();
