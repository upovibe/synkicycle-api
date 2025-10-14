import OpenAI from 'openai';
import { config } from '@config/env';
import { IUser } from '@models/User';
import { ChatMessage, IChatMessage } from '@models/ChatMessage';
import { Conversation, IConversation } from '@models/Conversation';
import AIService from './ai.service';
import { User } from '@models/User';

export interface ChatbotResponse {
  message: string;
  messageType: 'text' | 'suggestion' | 'action' | 'profile_analysis';
  metadata?: {
    suggestedUsers?: any[];
    actionType?: string;
    actionData?: any;
    profileScore?: number;
    profileSuggestions?: string[];
  };
}

export interface ChatContext {
  user: IUser;
  conversationHistory: IChatMessage[];
  recentMatches?: any[];
  userStats?: any;
}

class ChatbotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  /**
   * Process user message and generate AI response
   */
  async processMessage(
    userId: string,
    message: string,
    conversationId: string
  ): Promise<ChatbotResponse> {
    try {
      // Get user and conversation context
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      const conversation = await Conversation.findOne({ conversationId });
      const recentMessages = await ChatMessage.find({ conversationId })
        .sort({ timestamp: -1 })
        .limit(10);

      // Create context for AI
      const context: ChatContext = {
        user,
        conversationHistory: recentMessages.reverse(),
      };

      // Analyze message intent and generate response
      const response = await this.generateResponse(message, context);

      // Save user message
      await this.saveMessage(conversationId, userId, 'user', message, 'text');

      // Save AI response
      await this.saveMessage(
        conversationId,
        'ai-assistant',
        'ai',
        response.message,
        response.messageType,
        response.metadata
      );

      // Update conversation
      await this.updateConversation(conversationId, response.message);

      return response;
    } catch (error) {
      console.error('Chatbot service error:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Generate AI response based on user message and context
   */
  private async generateResponse(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    try {
      // Analyze message intent
      const intent = await this.analyzeIntent(message, context);

      switch (intent.type) {
        case 'connection_request':
          return await this.handleConnectionRequest(context);
        case 'profile_help':
          return await this.handleProfileHelp(context);
        case 'search_help':
          return await this.handleSearchHelp(message, context);
        case 'general_networking':
          return await this.handleGeneralNetworking(message, context);
        case 'greeting':
          return await this.handleGreeting(context);
        default:
          return await this.handleGeneralQuery(message, context);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        message: "I'm sorry, I encountered an error. Could you please try again?",
        messageType: 'text',
      };
    }
  }

  /**
   * Analyze user message intent
   */
  private async analyzeIntent(message: string, context: ChatContext): Promise<{ type: string; confidence: number }> {
    const prompt = `
Analyze the user's message and determine their intent. The user is on a professional networking platform.

User Profile:
- Name: ${context.user.name || context.user.username}
- Profession: ${context.user.profession || 'Not specified'}
- Bio: ${context.user.bio || 'Not provided'}
- Interests: ${context.user.interests?.join(', ') || 'None'}

User Message: "${message}"

Classify the intent as one of these:
1. "connection_request" - User wants to find people to connect with
2. "profile_help" - User wants help improving their profile
3. "search_help" - User wants help finding specific people or skills
4. "general_networking" - User has general networking questions
5. "greeting" - User is greeting or starting conversation
6. "general_query" - Other general questions

Respond with JSON: {"type": "intent_type", "confidence": 0.95}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing user intent for a networking platform. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 100,
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"type": "general_query", "confidence": 0.5}');
      return result;
    } catch {
      return { type: 'general_query', confidence: 0.5 };
    }
  }

  /**
   * Handle connection request intent
   */
  private async handleConnectionRequest(context: ChatContext): Promise<ChatbotResponse> {
    try {
      // Get potential matches using existing AI service
      const potentialMatches = await User.find({
        _id: { $ne: context.user._id },
        verified: true,
      }).limit(20);

      const matches = await AIService.generateUserMatches(context.user, potentialMatches);

      if (matches.length === 0) {
        return {
          message: "I couldn't find any great matches for you right now. Try updating your interests or bio to help me find better connections!",
          messageType: 'text',
        };
      }

      const topMatches = matches.slice(0, 3);
      const suggestedUsers = topMatches.map(match => ({
        userId: match.user.id,
        name: match.user.name || match.user.username,
        username: match.user.username,
        profession: match.user.profession,
        bio: match.user.bio,
        avatar: match.user.avatar,
        matchScore: match.matchScore,
        reason: match.reason,
        connectionType: match.connectionType,
      }));

      return {
        message: `I found ${matches.length} great connections for you! Here are my top recommendations:`,
        messageType: 'suggestion',
        metadata: {
          suggestedUsers,
          actionType: 'view_profile',
        },
      };
    } catch (error) {
      return {
        message: "I'm having trouble finding connections right now. Please try again later!",
        messageType: 'text',
      };
    }
  }

  /**
   * Handle profile help intent
   */
  private async handleProfileHelp(context: ChatContext): Promise<ChatbotResponse> {
    const suggestions = [];
    let profileScore = 0;

    // Analyze profile completeness
    if (context.user.name) profileScore += 20;
    if (context.user.username) profileScore += 15;
    if (context.user.profession) profileScore += 20;
    if (context.user.bio && context.user.bio.length > 50) profileScore += 25;
    if (context.user.interests && context.user.interests.length >= 3) profileScore += 20;

    // Generate suggestions
    if (!context.user.bio || context.user.bio.length < 50) {
      suggestions.push('Add a compelling bio (50+ characters) to showcase your expertise');
    }
    if (!context.user.interests || context.user.interests.length < 3) {
      suggestions.push('Add at least 3 interests to help others find you');
    }
    if (!context.user.profession) {
      suggestions.push('Add your profession to attract relevant connections');
    }
    if (!context.user.avatar) {
      suggestions.push('Add a professional profile picture');
    }

    if (suggestions.length === 0) {
      suggestions.push('Your profile looks great! Consider adding more specific skills or recent projects.');
    }

    return {
      message: `Your profile is ${profileScore}% complete! Here's how to make it even better:`,
      messageType: 'profile_analysis',
      metadata: {
        profileScore,
        profileSuggestions: suggestions,
        actionType: 'improve_bio',
      },
    };
  }

  /**
   * Handle search help intent
   */
  private async handleSearchHelp(message: string, context: ChatContext): Promise<ChatbotResponse> {
    // Extract search terms from message
    const searchTerms = message.toLowerCase().match(/\b(react|javascript|python|ai|design|marketing|sales|developer|manager|engineer)\b/g) || [];
    
    if (searchTerms.length === 0) {
      return {
        message: "I'd be happy to help you find people! What skills, interests, or professions are you looking for?",
        messageType: 'text',
      };
    }

    try {
      // Search for users with matching skills/interests
      const searchQuery = {
        $or: [
          { profession: { $regex: searchTerms.join('|'), $options: 'i' } },
          { interests: { $in: searchTerms } },
          { bio: { $regex: searchTerms.join('|'), $options: 'i' } },
        ],
        _id: { $ne: context.user._id },
        verified: true,
      };

      const matches = await User.find(searchQuery).limit(10);
      
      if (matches.length === 0) {
        return {
          message: `I couldn't find anyone with those specific skills right now. Try broader terms or check back later!`,
          messageType: 'text',
        };
      }

      const suggestedUsers = matches.slice(0, 5).map(user => ({
        userId: user._id.toString(),
        name: user.name || user.username,
        username: user.username,
        profession: user.profession,
        bio: user.bio,
        avatar: user.avatar,
        matchReason: `Matches your search for: ${searchTerms.join(', ')}`,
      }));

      return {
        message: `I found ${matches.length} people matching "${searchTerms.join(', ')}":`,
        messageType: 'suggestion',
        metadata: {
          suggestedUsers,
          actionType: 'view_profile',
        },
      };
    } catch (error) {
      return {
        message: "I'm having trouble searching right now. Please try again!",
        messageType: 'text',
      };
    }
  }

  /**
   * Handle general networking questions
   */
  private async handleGeneralNetworking(message: string, context: ChatContext): Promise<ChatbotResponse> {
    const prompt = `
You are a professional networking assistant. The user is asking about networking on this platform.

User Profile:
- Name: ${context.user.name || context.user.username}
- Profession: ${context.user.profession || 'Not specified'}
- Bio: ${context.user.bio || 'Not provided'}

User Question: "${message}"

Provide helpful, actionable advice about professional networking. Keep it conversational and specific to their situation. 2-3 sentences max.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional networking coach. Give practical, actionable advice.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return {
        message: response.choices[0]?.message?.content || "I'm here to help with your networking goals! What would you like to know?",
        messageType: 'text',
      };
    } catch {
      return {
        message: "I'm here to help with your networking goals! What would you like to know?",
        messageType: 'text',
      };
    }
  }

  /**
   * Handle greeting intent
   */
  private async handleGreeting(context: ChatContext): Promise<ChatbotResponse> {
    const greetings = [
      `Hi ${context.user.name || context.user.username}! I'm your AI networking assistant. How can I help you grow your professional network today?`,
      `Hello! I'm here to help you find amazing connections and improve your networking game. What would you like to work on?`,
      `Hey there! Ready to expand your professional network? I can help you find connections, improve your profile, or answer any networking questions!`,
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    return {
      message: randomGreeting,
      messageType: 'text',
    };
  }

  /**
   * Handle general queries
   */
  private async handleGeneralQuery(message: string, context: ChatContext): Promise<ChatbotResponse> {
    const prompt = `
You are a helpful AI assistant for a professional networking platform. The user is asking a question.

User Profile:
- Name: ${context.user.name || context.user.username}
- Profession: ${context.user.profession || 'Not specified'}

User Question: "${message}"

Provide a helpful, friendly response. If it's not related to networking, politely redirect to networking topics. Keep it conversational and under 100 words.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for a professional networking platform. Be friendly and helpful.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return {
        message: response.choices[0]?.message?.content || "I'm here to help with your networking needs! What would you like to know?",
        messageType: 'text',
      };
    } catch {
      return {
        message: "I'm here to help with your networking needs! What would you like to know?",
        messageType: 'text',
      };
    }
  }

  /**
   * Save message to database
   */
  private async saveMessage(
    conversationId: string,
    senderId: string,
    senderType: 'user' | 'ai',
    message: string,
    messageType: 'text' | 'suggestion' | 'action' | 'profile_analysis',
    metadata?: any
  ): Promise<void> {
    const chatMessage = new ChatMessage({
      conversationId,
      senderId,
      senderType,
      message,
      messageType,
      metadata,
    });

    await chatMessage.save();
  }

  /**
   * Update conversation with latest message
   */
  private async updateConversation(conversationId: string, lastMessage: string): Promise<void> {
    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        lastMessage: lastMessage.substring(0, 200),
        lastMessageAt: new Date(),
        $inc: { messageCount: 1 },
      },
      { upsert: true }
    );
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId: string, limit = 50): Promise<IChatMessage[]> {
    return await ChatMessage.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(limit);
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string): Promise<IConversation[]> {
    return await Conversation.find({ userId, isActive: true })
      .sort({ lastMessageAt: -1 });
  }

  /**
   * Create new conversation
   */
  async createConversation(userId: string, title?: string): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = new Conversation({
      conversationId,
      userId,
      title,
    });

    await conversation.save();
    return conversationId;
  }
}

export default new ChatbotService();
