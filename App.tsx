
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageRole, MessageType, ChatSession } from './types';
import { fetchModels, streamChatCompletion } from './services/api';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { MessageBubble } from './components/MessageBubble';
import { Send, Menu, Loader2, AlertCircle, PanelRightOpen, PanelRightClose, PanelLeftOpen, PanelLeftClose, Settings2, MessageSquare, Paperclip, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_SESSIONS = 'pollinations_sessions_v1';
const STORAGE_KEY_THEME = 'pollinations_theme';
const STORAGE_KEY_MODELS = 'pollinations_selected_models';

const App: React.FC = () => {
  // --- State ---

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      return (localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark') || 'dark';
  });

  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
    return [{ id: uuidv4(), title: 'New Chat', messages: [], createdAt: Date.now() }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
      const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (savedSessions) {
          const parsed = JSON.parse(savedSessions);
          if (parsed.length > 0) return parsed[0].id;
      }
      return ''; 
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // Layout State
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  // Models State
  const [textModels, setTextModels] = useState<string[]>(['openai']);
  const [selectedTextModel, setSelectedTextModel] = useState('openai');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // 1. Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // 2. Initialize Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const { textModels } = await fetchModels();
        setTextModels(textModels.length ? textModels : ['openai']);
        
        const savedModels = localStorage.getItem(STORAGE_KEY_MODELS);
        if (savedModels) {
            const { text } = JSON.parse(savedModels);
            if (text && textModels.includes(text)) setSelectedTextModel(text);
            else if (textModels.length) setSelectedTextModel(textModels[0]);
        } else {
            if (textModels.length) setSelectedTextModel(textModels[0]);
        }
      } catch (err) {
        console.error("Model fetch error", err);
        setError("Failed to load models. Using defaults.");
      }
    };
    loadModels();
  }, []);

  // 3. Save Model Selection
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODELS, JSON.stringify({ text: selectedTextModel }));
  }, [selectedTextModel]);

  // 4. Sync Current Session ID if empty
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

  // 5. Persist Sessions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  // 6. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, selectedImages.length]);

  // 7. Handle Resize for mobile responsiveness
  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth < 768) {
              setIsLeftSidebarOpen(false);
              setIsRightPanelOpen(false);
          }
      };
      window.addEventListener('resize', handleResize);
      // Initial check
      if (window.innerWidth < 768) {
          setIsLeftSidebarOpen(false);
          setIsRightPanelOpen(false);
      }
      return () => window.removeEventListener('resize', handleResize);
  }, []);


  // --- Helpers ---

  const getCurrentSession = () => sessions.find(s => s.id === currentSessionId);
  const getCurrentMessages = () => getCurrentSession()?.messages || [];
  const getSystemInstruction = () => getCurrentSession()?.systemInstruction || '';

  const updateCurrentSessionMessages = (newMessages: Message[]) => {
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              let title = s.title;
              if (s.title === 'New Chat' && newMessages.length > 0) {
                  const firstUserMsg = newMessages.find(m => m.role === MessageRole.User);
                  if (firstUserMsg) {
                      title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
                  }
              }
              return { ...s, title, messages: newMessages };
          }
          return s;
      }));
  };

  // Using useCallback to stabilize reference
  const handleSystemInstructionChange = useCallback((value: string) => {
    setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
            return { ...s, systemInstruction: value };
        }
        return s;
    }));
  }, [currentSessionId]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- Handlers ---

  const handleNewChat = () => {
      const newSession: ChatSession = {
          id: uuidv4(),
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          systemInstruction: '' // Empty by default
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      if (window.innerWidth < 768) {
          setIsLeftSidebarOpen(false);
          setIsRightPanelOpen(false);
      }
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      
      if (currentSessionId === id) {
          if (newSessions.length > 0) {
              setCurrentSessionId(newSessions[0].id);
          } else {
              handleNewChat();
          }
      }
  };

  const handleToggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const imagePromises = files.map(file => convertFileToBase64(file));
      try {
        const base64Images = await Promise.all(imagePromises);
        setSelectedImages(prev => [...prev, ...base64Images]);
      } catch (err) {
        console.error("Error reading files", err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const imagePromises: Promise<string>[] = [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          imagePromises.push(convertFileToBase64(file));
        }
      }
    }

    if (imagePromises.length > 0) {
      e.preventDefault();
      try {
        const base64Images = await Promise.all(imagePromises);
        setSelectedImages(prev => [...prev, ...base64Images]);
      } catch (err) {
        console.error("Error pasting images", err);
      }
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && selectedImages.length === 0) || isLoading) return;
    if (!currentSessionId) handleNewChat();

    const currentMsgs = getCurrentMessages();
    
    const userMessage: Message = {
      id: uuidv4(),
      role: MessageRole.User,
      content: input.trim(),
      type: MessageType.Text,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined
    };

    const updatedMessages = [...currentMsgs, userMessage];
    updateCurrentSessionMessages(updatedMessages);
    
    setInput('');
    setSelectedImages([]);
    setIsLoading(true);
    setError(null);

    await handleTextGeneration(updatedMessages);
  };

  const handleTextGeneration = async (currentHistory: Message[]) => {
    const botMessageId = uuidv4();
    const botMessage: Message = {
        id: botMessageId,
        role: MessageRole.Assistant,
        content: '',
        type: MessageType.Text,
        isStreaming: true
    };

    const historyWithBot = [...currentHistory, botMessage];
    updateCurrentSessionMessages(historyWithBot);

    // Prepare API messages (Inject System Instruction)
    const sysInstruction = getSystemInstruction();
    let apiMessages = [...currentHistory];
    
    if (sysInstruction.trim()) {
        apiMessages = [
            {
                id: 'system',
                role: MessageRole.System,
                content: sysInstruction,
                type: MessageType.Text
            },
            ...apiMessages
        ];
    }

    try {
        await streamChatCompletion(apiMessages, selectedTextModel, (chunk) => {
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    return {
                        ...s,
                        messages: s.messages.map(msg => {
                            if (msg.id === botMessageId) {
                                return { ...msg, content: msg.content + chunk };
                            }
                            return msg;
                        })
                    };
                }
                return s;
            }));
        });
        
        // Finalize
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return {
                    ...s,
                    messages: s.messages.map(msg => 
                        msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
                    )
                };
            }
            return s;
        }));

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to generate text response");
        setSessions(prev => prev.map(s => {
             if (s.id === currentSessionId) {
                 const msg = s.messages.find(m => m.id === botMessageId);
                 if (msg && !msg.content) {
                     return { ...s, messages: s.messages.filter(m => m.id !== botMessageId) };
                 }
                 return {
                     ...s,
                     messages: s.messages.map(m => m.id === botMessageId ? { ...m, isStreaming: false } : m)
                 };
             }
             return s;
        }));
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentMessages = getCurrentMessages();

  return (
    <div className="flex h-screen overflow-hidden bg-latte-base dark:bg-mocha-base text-latte-text dark:text-mocha-text font-sans transition-colors duration-300">
      
      {/* Left Sidebar */}
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectChat={setCurrentSessionId}
        onDeleteChat={handleDeleteChat}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOpen={isLeftSidebarOpen}
        onCloseMobile={() => setIsLeftSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-latte-surface0 dark:border-mocha-surface0 bg-latte-base/95 dark:bg-mocha-base/95 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} 
                className="p-2 hover:bg-latte-surface0 dark:hover:bg-mocha-surface0 rounded-lg transition-colors"
                title="Toggle Sidebar"
              >
                {isLeftSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
              <span className="font-semibold md:hidden">Synapse</span>
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} 
                className={`p-2 rounded-lg transition-colors ${isRightPanelOpen ? 'bg-latte-surface0 dark:bg-mocha-surface0' : 'hover:bg-latte-surface0 dark:hover:bg-mocha-surface0'}`}
                title="Toggle Settings"
              >
                {isRightPanelOpen ? <Settings2 size={20} className="text-latte-blue dark:text-mocha-mauve" /> : <Settings2 size={20} />}
              </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative">
          <div className="max-w-3xl mx-auto">
            {currentMessages.length === 0 && (
               <div className="flex flex-col items-center justify-center min-h-[50vh] text-center opacity-50">
                  <div className="bg-latte-surface1 dark:bg-mocha-surface0 p-4 rounded-full mb-4 transition-colors">
                    <MessageSquare size={48} className="text-latte-lavender dark:text-mocha-mauve" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to Synapse</h2>
                  <p className="text-sm max-w-md mb-4">
                    Select a model from the settings panel and start chatting. 
                  </p>
               </div>
            )}
            
            {currentMessages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isDark={theme === 'dark'} 
              />
            ))}
            
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 text-sm text-latte-red dark:text-mocha-red bg-latte-red/10 dark:bg-mocha-red/10 border border-latte-red/20 dark:border-mocha-red/20 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-latte-surface0 dark:border-mocha-surface0 bg-latte-base dark:bg-mocha-base transition-colors z-10">
          <div className="max-w-3xl mx-auto relative">
            
            <div className="relative rounded-xl border shadow-sm border-latte-surface1 dark:border-mocha-surface0 bg-white dark:bg-mocha-surface0 transition-all duration-300 overflow-hidden">
              
              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="flex gap-2 p-3 overflow-x-auto border-b border-latte-surface0 dark:border-white/5 bg-latte-base/5 dark:bg-black/10">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative group flex-shrink-0">
                      <img 
                        src={img} 
                        alt="Preview" 
                        className="h-16 w-16 object-cover rounded-md border border-latte-surface1 dark:border-white/10"
                      />
                      <button
                        onClick={() => removeSelectedImage(idx)}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 p-2">
                {/* Attachment Button */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg transition-colors flex-shrink-0
                    text-latte-subtext1 hover:text-latte-text hover:bg-latte-surface0
                    dark:text-mocha-overlay0 dark:hover:text-mocha-text dark:hover:bg-mocha-surface1"
                  title="Attach Image"
                  disabled={isLoading}
                >
                  <Paperclip size={20} />
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder={selectedImages.length > 0 ? "Add a caption..." : "Type a message..."}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none py-2.5 max-h-32 min-h-[44px] text-latte-text dark:text-mocha-text placeholder-latte-surface1 dark:placeholder-mocha-overlay0"
                  rows={1}
                  style={{ height: 'auto', minHeight: '44px' }}
                  disabled={isLoading}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                  className={`p-2 rounded-lg flex-shrink-0 transition-all duration-200
                    ${((!input.trim() && selectedImages.length === 0) || isLoading) 
                      ? 'bg-latte-surface0 dark:bg-mocha-surface1 text-latte-surface1 dark:text-mocha-overlay0 cursor-not-allowed' 
                      : 'bg-latte-blue hover:bg-latte-lavender dark:bg-mocha-mauve dark:hover:bg-mocha-pink text-white shadow-md'
                    }
                  `}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-latte-subtext1 dark:text-mocha-overlay0">
               Powered by Pollinations. AI generated content may be inaccurate.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel 
        isOpen={isRightPanelOpen}
        onCloseMobile={() => setIsRightPanelOpen(false)}
        textModels={textModels}
        selectedTextModel={selectedTextModel}
        onSelectTextModel={setSelectedTextModel}
        systemInstruction={getSystemInstruction()}
        onSystemInstructionChange={handleSystemInstructionChange}
      />

      {/* Overlays for mobile */}
      {(isLeftSidebarOpen || isRightPanelOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => {
              setIsLeftSidebarOpen(false);
              setIsRightPanelOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
