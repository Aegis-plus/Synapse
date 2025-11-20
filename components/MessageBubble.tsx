
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message, MessageRole, MessageType } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isDark?: boolean;
}

// Typing animation component
const TypingIndicator = () => (
  <div className="flex gap-1.5 items-center py-1 px-1 min-h-[1.5rem]">
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-typing-dot [animation-delay:-0.32s]"></div>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-typing-dot [animation-delay:-0.16s]"></div>
    <div className="w-1.5 h-1.5 bg-current rounded-full animate-typing-dot"></div>
  </div>
);

// Helper component to handle copy state for code blocks
const CodeBlock = ({ 
  language, 
  children, 
  style, 
  isDark, 
  ...props 
}: { 
  language: string, 
  children: React.ReactNode, 
  style: any, 
  isDark?: boolean 
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!children) return;
    const text = String(children).replace(/\n$/, '');
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`
      rounded-lg overflow-hidden my-4 border shadow-sm group
      ${isDark ? 'border-white/10' : 'border-gray-200'}
    `}>
      {/* Header */}
      <div className={`
        px-4 py-2 text-xs font-mono flex justify-between items-center select-none
        ${isDark ? 'bg-[#1a1b26] text-gray-400 border-b border-white/5' : 'bg-gray-100 text-gray-500 border-b border-gray-200'}
      `}>
        <span className="font-semibold">{language || 'code'}</span>
        <button
          onClick={copyToClipboard}
          className={`
            flex items-center gap-1.5 transition-colors px-2 py-1 rounded
            ${isDark 
              ? 'hover:text-white hover:bg-white/10' 
              : 'hover:text-gray-900 hover:bg-gray-200'
            }
          `}
          title="Copy code"
        >
          {isCopied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span className="text-green-500 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        {...props}
        PreTag="div"
        children={String(children).replace(/\n$/, '')}
        language={language}
        style={style}
        customStyle={{
          margin: 0,
          padding: '1.25rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          backgroundColor: isDark ? '#282a36' : '#fff', // Keep standard code block bg
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }
        }}
      />
    </div>
  );
};

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({ message, isDark = false }) => {
  const isUser = message.role === MessageRole.User;

  // Select syntax highlighter style based on theme
  const syntaxStyle = isDark ? vscDarkPlus : vs;

  return (
      <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex max-w-[90%] md:max-w-[85%] lg:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
          
          {/* Avatar */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1
            ${isUser 
              ? 'bg-latte-blue dark:bg-mocha-surface1' 
              : 'bg-latte-lavender dark:bg-mocha-overlay0'
            }
          `}>
            {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
          </div>

          {/* Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 max-w-full`}>
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm w-full overflow-hidden border
              ${isUser 
                ? 'bg-latte-blue dark:bg-mocha-surface1 text-white border-transparent rounded-tr-none' 
                : 'bg-white dark:bg-mocha-surface0 text-latte-text dark:text-mocha-text border-latte-surface0 dark:border-mocha-surface1 rounded-tl-none'
              }`}>
              
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {message.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt="Attachment" 
                      className="max-h-64 max-w-full rounded-lg border border-white/20 object-contain bg-black/10"
                    />
                  ))}
                </div>
              )}

              {message.type === MessageType.Text && (
                <div className={`prose prose-sm max-w-none break-words
                  ${isUser 
                    ? 'text-white prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-a:text-white' 
                    : isDark ? 'prose-invert' : ''}
                  prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent
                `}>
                  {message.isStreaming && !message.content && !message.images?.length ? (
                    <TypingIndicator />
                  ) : (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({node, className, children, ...props}: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isMatch = !!match;
                            
                            if (isMatch) {
                                return (
                                  <CodeBlock 
                                    language={match[1]} 
                                    style={syntaxStyle} 
                                    isDark={isDark} 
                                    {...props}
                                  >
                                    {children}
                                  </CodeBlock>
                                );
                            }
                            
                            return (
                              <code {...props} className={`${className} font-mono text-[0.9em] rounded px-1.5 py-0.5
                                ${isUser 
                                  ? 'bg-white/20 text-white border border-white/10' 
                                  : isDark
                                    ? 'bg-mocha-surface1 text-mocha-pink border border-white/5'
                                    : 'bg-latte-surface0 text-latte-red border border-latte-surface1'
                                }
                              `}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 align-middle bg-current animate-pulse"/>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
