
import React from 'react';
import { X, MessageSquare, Sliders, Info } from 'lucide-react';

interface RightPanelProps {
  isOpen: boolean;
  onCloseMobile?: () => void;

  textModels: string[];
  selectedTextModel: string;
  onSelectTextModel: (model: string) => void;
  
  systemInstruction: string;
  onSystemInstructionChange: (value: string) => void;
}

const RightPanelComponent: React.FC<RightPanelProps> = ({
  isOpen,
  onCloseMobile,
  textModels,
  selectedTextModel,
  onSelectTextModel,
  systemInstruction,
  onSystemInstructionChange
}) => {
  return (
    <aside className={`
      fixed inset-y-0 right-0 z-30 w-80 
      bg-latte-base border-l border-latte-surface0
      dark:bg-mocha-base dark:border-mocha-surface0
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      md:relative md:translate-x-0
      ${!isOpen ? 'md:hidden' : 'md:flex'}
      flex flex-col shadow-2xl md:shadow-none
    `}>
      
      {/* Header */}
      <div className="p-4 border-b border-latte-surface0 dark:border-mocha-surface0 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-latte-text dark:text-mocha-text">
          <Sliders size={18} />
          <span>Configuration</span>
        </div>
        <button 
          onClick={onCloseMobile}
          className="md:hidden p-1 hover:bg-latte-surface0 dark:hover:bg-mocha-surface0 rounded text-latte-subtext1 dark:text-mocha-overlay0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* System Instruction */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-latte-subtext1 dark:text-mocha-overlay0">
            <Info size={12} />
            System System (Prompt)
          </label>
          <textarea 
            value={systemInstruction}
            onChange={(e) => onSystemInstructionChange(e.target.value)}
            placeholder="You are a helpful AI assistant. You reply in a concise and witty manner..."
            className="w-full h-40 p-3 text-sm rounded-lg outline-none resize-none transition-all
              bg-latte-mantle border border-latte-surface0 text-latte-text focus:border-latte-blue
              dark:bg-mocha-surface0 dark:border-mocha-surface1 dark:text-mocha-text dark:focus:border-mocha-mauve"
          />
          <p className="text-[10px] text-latte-subtext1 dark:text-mocha-overlay0">
            Define how the AI should behave for this chat session.
          </p>
        </div>

        <hr className="border-latte-surface0 dark:border-mocha-surface0 opacity-50" />

        {/* Text Model Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-latte-subtext1 dark:text-mocha-overlay0">
            <MessageSquare size={12} />
            Text Model
          </label>
          <select 
            value={selectedTextModel}
            onChange={(e) => onSelectTextModel(e.target.value)}
            className="w-full text-sm rounded-lg p-2.5 outline-none transition-all cursor-pointer
              bg-latte-mantle border border-latte-surface0 text-latte-text focus:border-latte-blue
              dark:bg-mocha-surface0 dark:border-mocha-surface1 dark:text-mocha-text dark:focus:border-mocha-mauve"
          >
            {textModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

      </div>
    </aside>
  );
};

export const RightPanel = React.memo(RightPanelComponent);