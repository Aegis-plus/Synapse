
export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system'
}

export enum MessageType {
  Text = 'text'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  isStreaming?: boolean;
  images?: string[];
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  systemInstruction?: string;
  model?: string;
  enableStreaming?: boolean;
}

export interface Model {
  name: string;
  type: 'text';
  description?: string;
}

// Pollinations API types
export interface PollinationsModelResponse {
  name: string;
  type: string;
  [key: string]: any;
}

export interface ChatCompletionChunk {
  id: string;
  choices: {
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }[];
}
