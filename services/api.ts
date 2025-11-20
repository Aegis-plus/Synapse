
import { Model, Message, MessageRole, ChatCompletionChunk } from '../types';

const API_BASE = 'https://enter.pollinations.ai/api';

// 1. For local testing: You can paste your API key between the quotes below
const MANUAL_API_KEY = '';

// 2. Helper to safely get the API key from various sources
const getApiKey = () => {
  if (MANUAL_API_KEY) return MANUAL_API_KEY;
  
  try {
    // Check for process.env (standard build tools)
    return process.env.API_KEY || '';
  } catch (e) {
    // Handle environments where process is not defined (browser-only)
    return '';
  }
};

const API_KEY = getApiKey();

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  return headers;
};

export const fetchModels = async (): Promise<{ textModels: string[] }> => {
  try {
    // Fetch text models
    const textResponse = await fetch(`${API_BASE}/generate/v1/models`);
    const textData = await textResponse.json();
    
    // Parse text models
    const textModels = Array.isArray(textData) ? textData : (textData.data?.map((m: any) => m.id) || ['openai', 'mistral', 'llama']);
    
    return {
        textModels: textModels.map((m: any) => typeof m === 'string' ? m : m.name || m.id)
    };
  } catch (error) {
    console.error("Failed to fetch models", error);
    return {
        textModels: ['openai', 'mistral', 'llama']
    };
  }
};

export const streamChatCompletion = async (
    messages: Message[],
    model: string,
    onChunk: (content: string) => void
): Promise<void> => {
    const apiMessages = messages.map(m => {
        if (m.images && m.images.length > 0) {
            return {
                role: m.role,
                content: [
                    { type: 'text', text: m.content },
                    ...m.images.map(img => ({
                        type: 'image_url',
                        image_url: {
                            url: img
                        }
                    }))
                ]
            };
        }
        return {
            role: m.role,
            content: m.content
        };
    });

    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
    };

    const response = await fetch(`${API_BASE}/generate/v1/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            model: model,
            messages: apiMessages,
            stream: true
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat failed: ${response.status} - ${errorText}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; 

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
                
                if (trimmedLine.startsWith('data: ')) {
                    try {
                        const jsonStr = trimmedLine.slice(6);
                        const data: ChatCompletionChunk = JSON.parse(jsonStr);
                        const content = data.choices[0]?.delta?.content;
                        if (content) {
                            onChunk(content);
                        }
                    } catch (e) {
                        console.warn('Error parsing chunk', e);
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
};
