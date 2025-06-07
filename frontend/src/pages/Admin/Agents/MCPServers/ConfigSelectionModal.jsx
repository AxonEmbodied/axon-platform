import React, { useState, useEffect } from 'react';
import ModalWrapper from '@/components/ModalWrapper';
import { CheckCircle } from '@phosphor-icons/react';
import { titleCase } from 'text-case';

function getOptionTitle(option, index) {
  const serverName = titleCase(option.name);
  const configData = option.config.mcpServers[option.name];
  if (!configData) return `${serverName} (Configuration #${index + 1})`;

  if (configData.command === 'npx') return `${serverName} (via NPX)`;
  if (configData.command === 'docker') return `${serverName} (via Docker)`;
  
  return `${serverName} (Configuration #${index + 1})`;
}

export default function ConfigSelectionModal({ isOpen = false, options, onSelect, onCancel }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || !options || options.length === 0) return null;
  
  const selectedOption = options[selectedIndex];

  return (
    <ModalWrapper isOpen={isOpen}>
      <div className="flex flex-col w-full max-w-4xl max-h-[80vh] bg-main-gradient rounded-lg text-white shadow-lg">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="text-lg font-semibold">
            Multiple Configurations Found
          </div>
          <p className="text-white/80 text-sm mt-1">
            This README contains multiple server configurations. Please select one to add.
          </p>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 min-h-0">
          {/* Left Column: List of options */}
          <div className="w-1/3 flex-shrink-0 flex flex-col gap-y-1 p-4 border-r border-white/10 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`block w-full text-left p-3 rounded-md transition-colors ${
                  selectedIndex === index ? 'bg-white/20' : 'bg-transparent hover:bg-white/10'
                }`}
              >
                <p className="font-semibold text-sm">{getOptionTitle(option, index)}</p>
              </button>
            ))}
          </div>

          {/* Right Column: Details of selected option */}
          {selectedOption && (
            <div className="w-2/3 flex flex-col p-4 overflow-y-hidden">
              <h3 className="text-base font-semibold mb-2 flex-shrink-0">{getOptionTitle(selectedOption, selectedIndex)}</h3>
              <pre className="flex-1 p-3 bg-black/30 rounded-md text-white/90 text-xs whitespace-pre-wrap font-mono overflow-y-auto">
                {JSON.stringify(selectedOption.config, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between items-center border-t border-white/10 flex-shrink-0">
          <button
            onClick={onCancel}
            className="text-white/70 text-sm hover:text-white"
          >
            Cancel
          </button>
          {selectedOption && (
            <button
              onClick={() => onSelect(selectedOption.config)}
              className="flex items-center justify-center gap-x-2 py-2 px-6 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all duration-300"
            >
              <CheckCircle size={18} />
              <span>Add Selected Configuration</span>
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
} 