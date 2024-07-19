import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { configureGemini } from '../config/openai-config.js';
import { GenerateContentResult, GenerateContentCandidate } from '@google/generative-ai';

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
    }

    // Prepare chat history as a single string
    const chatHistory = user.chats.map(({ role, content }) => `${role}: ${content}`).join('\n');
    const prompt = `${chatHistory}\nUser: ${message}`;

    // Initialize Gemini client and get the model
    const gemini = configureGemini();
    const model = gemini.getGenerativeModel({model:"gemini-pro"});

    // Generate response using the model instance
    const response: GenerateContentResult = await model.generateContent(prompt);
    console.log("API Response:", JSON.stringify(response, null, 2));

    // Extract content from response based on the hierarchy
    let assistantResponse = "No response";
    if (response?.response?.candidates?.length > 0) {
      const candidate: GenerateContentCandidate = response.response.candidates[0];
      if (candidate.content && Array.isArray(candidate.content.parts)) {
        assistantResponse = candidate.content.parts.map(part => part.text).join('');
      } else {
        console.warn("Unexpected content structure:", candidate.content);
      }
    } else {
      console.warn("No valid candidates found in response.");
    }

    // Add assistant's response to chat history
    user.chats.push({ role: "assistant", content: assistantResponse });
    await user.save();

    // Return response to the user
    res.status(200).json({ message: assistantResponse });

  } catch (error) {
    console.error("Error generating chat completion:", error);
    res.status(500).json({ message: "Internal server error", cause: error.message });
  }
};



// Function to retrieve chats for the user
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

// Function to delete chats for the user
export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};
