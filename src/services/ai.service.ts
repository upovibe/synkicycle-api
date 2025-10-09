import OpenAI from 'openai';
import { config } from '@config/env';
import { IUser } from '@models/User';

interface MatchSuggestion {
  userId: string;
  matchScore: number;
  reason: string;
  connectionType: 'professional' | 'social' | 'both';
}

interface MatchUser {
  id: string;
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

export interface MatchResult {
  user: MatchUser;
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
    currentUser: IUser,
    potentialMatches: IUser[],
    retries = 2
  ): Promise<MatchResult[]> {
    try {
      if (!config.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Prepare current user profile for analysis
      const currentUserProfile = this.formatUserProfile(currentUser);

        // Prepare potential matches for analysis
        const matchesProfile = potentialMatches.map((user) => ({
          id: user._id.toString(),
          name: user.name || user.username || 'Anonymous',
          username: user.username,
          profession: user.profession,
          bio: user.bio,
          interests: user.interests,
          email: user.email, // For internal reference only
        }));

      const prompt = `
Analyze the current user's profile and suggest the best professional and social connections from the potential matches.

CURRENT USER PROFILE:
${currentUserProfile}

POTENTIAL MATCHES:
${JSON.stringify(matchesProfile, null, 2)}

Provide match analysis considering:
- Shared interests and hobbies
- Complementary professional skills
- Similar career levels or goals
- Mutual networking opportunities

Return a JSON object with a "matches" array. Each match should have:
- userId: the user's id from potential matches
- matchScore: compatibility score (0-100)
- reason: brief personalized reason (1-2 sentences)
- connectionType: "professional", "social", or "both"

Only include matches with score 60+. Limit to top 5 matches.

Example response format:
{
  "matches": [
    {
      "userId": "user_id_here",
      "matchScore": 85,
      "reason": "Personalized reason here",
      "connectionType": "professional"
    }
  ]
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106', // Use newer model that supports JSON mode
        messages: [
          {
            role: 'system',
            content:
              'You are an expert networking assistant that helps professionals find meaningful connections. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' }, // Force JSON response
        max_tokens: 1500,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      // Parse AI response (JSON mode ensures valid JSON)
      let matchSuggestions;
      try {
        const parsed = JSON.parse(aiResponse);

        // Extract matches array from response object
        matchSuggestions = parsed.matches || parsed;

        // Ensure it's an array
        if (!Array.isArray(matchSuggestions)) {
          throw new Error('Expected matches array from AI');
        }
      } catch {
        throw new Error('Invalid AI response format');
      }

      // Map AI suggestions back to actual user objects
      const results: MatchResult[] = matchSuggestions
        .filter(
          (suggestion: MatchSuggestion) =>
            suggestion &&
            suggestion.userId &&
            suggestion.matchScore &&
            suggestion.reason &&
            suggestion.connectionType
        )
        .map((suggestion: MatchSuggestion) => {
          const matchedUser = potentialMatches.find(
            (user) => user._id.toString() === suggestion.userId
          );

          if (!matchedUser) {
            return null;
          }

          return {
            user: {
              id: matchedUser._id.toString(),
              uuid: matchedUser.uuid,
              username: matchedUser.username,
              name: matchedUser.name,
              email: matchedUser.email,
              profession: matchedUser.profession,
              bio: matchedUser.bio,
              interests: matchedUser.interests,
              avatar: matchedUser.avatar,
              verified: matchedUser.verified,
              createdAt: matchedUser.createdAt.toISOString(),
            },
            matchScore: suggestion.matchScore,
            reason: suggestion.reason,
            connectionType: suggestion.connectionType,
          } as MatchResult;
        })
        .filter((match): match is MatchResult => match !== null);

      return results;
    } catch (error) {
      const err = error as {
        code?: string;
        status?: number;
        message?: string;
        response?: { data?: { error?: { message?: string } } };
      };

      // Retry logic for rate limits or temporary errors
      if (
        retries > 0 &&
        (err.code === 'rate_limit_exceeded' ||
          err.code === 'ECONNRESET' ||
          err.status === 429 ||
          err.message?.includes('timeout'))
      ) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        return this.generateUserMatches(
          currentUser,
          potentialMatches,
          retries - 1
        );
      }

      // If retries exhausted or other error, throw
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to generate AI matches';
      throw new Error(errorMessage);
    }
  }

  /**
   * Format user profile for AI analysis
   */
  private formatUserProfile(user: IUser): string {
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
    currentUser: IUser,
    targetUser: IUser,
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
            content:
              'You are a professional networking assistant. Generate warm, authentic connection messages that help people build meaningful professional relationships.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      return (
        response.choices[0]?.message?.content ||
        "Hi! I'd love to connect and learn more about your work."
      );
    } catch {
      return "Hi! I'd love to connect and learn more about your work.";
    }
  }
}

export default new AIService();
