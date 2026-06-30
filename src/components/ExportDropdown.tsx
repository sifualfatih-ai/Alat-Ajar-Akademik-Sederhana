import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExportOption {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

interface ExportDropdownProps {
  options: ExportOption[];
}

export default function ExportDropdown({ options }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="py-1">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      option.onClick();
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-white/5 transition-colors ${option.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
