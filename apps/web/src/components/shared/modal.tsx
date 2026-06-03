'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg card glass-strong animate-fade-in-scale shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface))] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border-light));
          border-radius: var(--radius-full);
        }
      `}</style>
    </div>
  );
}
