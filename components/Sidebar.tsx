import React from 'react';
import { Plus, Trash2, Sun, Moon, MessageCircle, Cpu, Settings } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  
  isOpen: boolean;
  onCloseMobile?: () => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  theme,
  onToggleTheme,
  isOpen,
  onCloseMobile
}) => {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-72 
      bg-latte-mantle border-r border-latte-surface0
      dark:bg-mocha-mantle dark:border-mocha-surface0
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      flex flex-col shadow-2xl
      md:relative md:translate-x-0 
      ${!isOpen ? 'md:hidden' : 'md:flex'}
    `}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-latte-blue to-latte-lavender dark:from-mocha-blue dark:to-mocha-mauve rounded-lg flex items-center justify-center shadow-lg">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-latte-text dark:text-mocha-text">Synapse</h1>
        </div>

        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200
            bg-latte-surface0 hover:bg-latte-surface1 text-latte-text
            dark:bg-mocha-surface0 dark:hover:bg-mocha-surface1 dark:text-mocha-text
            font-medium shadow-sm mb-6"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <label className="block text-xs font-bold uppercase tracking-wider px-2 mb-2 text-latte-subtext1 dark:text-mocha-overlay0">
          History
        </label>
        <div className="space-y-1">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => {
                onSelectChat(session.id);
                if (window.innerWidth < 768 && onCloseMobile) onCloseMobile();
              }}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-colors
                ${session.id === currentSessionId 
                  ? 'bg-latte-surface1 dark:bg-mocha-surface1 text-latte-text dark:text-mocha-text font-medium' 
                  : 'text-latte-subtext1 dark:text-mocha-subtext1 hover:bg-latte-surface0 dark:hover:bg-mocha-surface0 hover:text-latte-text dark:hover:text-mocha-text'
                }
              `}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageCircle size={14} className="flex-shrink-0 opacity-70" />
                <span className="truncate">{session.title}</span>
              </div>
              <button 
                onClick={(e) => onDeleteChat(session.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-latte-red/20 dark:hover:bg-mocha-red/20 text-latte-red dark:text-mocha-red transition-all"
                title="Delete chat"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Theme Toggle */}
      <div className="mt-auto p-4 border-t border-latte-surface0 dark:border-mocha-surface0">
        <button 
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between p-2.5 rounded-lg transition-colors
            hover:bg-latte-surface0 dark:hover:bg-mocha-surface0 text-latte-text dark:text-mocha-text"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {theme === 'dark' ? <Moon size={16} className="text-mocha-mauve" /> : <Sun size={16} className="text-latte-peach" />}
            <span>{theme === 'dark' ? 'Mocha Mode' : 'Latte Mode'}</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export const Sidebar = React.memo(SidebarComponent, (prev, next) => {
  return (
    prev.isOpen === next.isOpen &&
    prev.theme === next.theme &&
    prev.currentSessionId === next.currentSessionId &&
    prev.sessions.length === next.sessions.length &&
    prev.sessions.every((s, i) => s.id === next.sessions[i].id && s.title === next.sessions[i].title)
  );
});