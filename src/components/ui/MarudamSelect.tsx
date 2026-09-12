'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

export interface MarudamSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MarudamSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: MarudamSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function MarudamSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className,
  style,
}: MarudamSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const item = listboxRef.current.children[focusedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, focusedIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0 && !options[focusedIndex].disabled) {
            onChange(options[focusedIndex].value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
          const idx = options.findIndex((o) => o.value === value);
          setFocusedIndex(idx >= 0 ? idx : 0);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const idx = options.findIndex((o) => o.value === value);
          setFocusedIndex(idx >= 0 ? idx : 0);
        } else {
          setFocusedIndex((prev) => (prev + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (idx: number) => {
    if (options[idx].disabled) return;
    onChange(options[idx].value);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', ...style }}
      onKeyDown={handleKeyDown}
    >
      <div
        id={id}
        role="combobox"
        aria-controls={`${id}-listbox`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.06)',
          border: isOpen ? '1px solid rgba(160,224,80,0.55)' : '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0.75rem',
          padding: '0.72rem 1rem',
          color: selectedOption ? 'white' : 'rgba(255,255,255,0.45)',
          fontSize: '0.92rem',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            opacity: 0.7,
            flexShrink: 0,
            marginLeft: '0.5rem',
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <ul
          id={`${id}-listbox`}
          ref={listboxRef}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            maxHeight: '260px',
            overflowY: 'auto',
            background: 'rgba(20, 35, 25, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '0.75rem',
            padding: '0.35rem',
            margin: 0,
            listStyle: 'none',
            zIndex: 1000,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            boxSizing: 'border-box',
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => setFocusedIndex(idx)}
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '0.4rem',
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  color: opt.disabled ? 'rgba(255,255,255,0.3)' : 'white',
                  background: isFocused && !opt.disabled ? 'rgba(160,224,80,0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.1s',
                  fontSize: '0.92rem',
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a0e050" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
