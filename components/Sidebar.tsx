
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Sun, Moon, MessageCircle, Cpu, Pencil, Check, X } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  
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
  onRenameChat,
  theme,
  onToggleTheme,
  isOpen,
  onCloseMobile
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveTitle = (e?: React.FormEvent) => {
    e?.stopPropagation();
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

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
                if (editingId !== session.id) {
                  onSelectChat(session.id);
                  if (window.innerWidth < 768 && onCloseMobile) onCloseMobile();
                }
              }}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-colors
                ${session.id === currentSessionId 
                  ? 'bg-latte-surface1 dark:bg-mocha-surface1 text-latte-text dark:text-mocha-text font-medium' 
                  : 'text-latte-subtext1 dark:text-mocha-subtext1 hover:bg-latte-surface0 dark:hover:bg-mocha-surface0 hover:text-latte-text dark:hover:text-mocha-text'
                }
              `}
            >
              {editingId === session.id ? (
                <div className="flex items-center w-full gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-latte-base dark:bg-mocha-base border border-latte-blue dark:border-mocha-blue rounded px-1.5 py-0.5 text-sm outline-none"
                  />
                  <button onClick={() => saveTitle()} className="text-latte-green dark:text-mocha-green p-1 hover:bg-latte-surface0 dark:hover:bg-mocha-surface0 rounded"><Check size={14} /></button>
                  <button onClick={cancelEditing} className="text-latte-red dark:text-mocha-red p-1 hover:bg-latte-surface0 dark:hover:bg-mocha-surface0 rounded"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <MessageCircle size={14} className="flex-shrink-0 opacity-70" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => startEditing(e, session)}
                      className="p-1 rounded hover:bg-latte-blue/10 dark:hover:bg-mocha-blue/20 text-latte-blue dark:text-mocha-blue transition-all"
                      title="Rename chat"
                    >
                      <Pencil size={12} />
                    </button>
                    <button 
                      onClick={(e) => onDeleteChat(session.id, e)}
                      className="p-1 rounded hover:bg-latte-red/20 dark:hover:bg-mocha-red/20 text-latte-red dark:text-mocha-red transition-all"
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
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

export const Sidebar = React.memo(SidebarComponent);
