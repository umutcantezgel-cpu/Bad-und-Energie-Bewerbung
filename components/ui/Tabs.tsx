'use client';

import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export function Tabs({
  tabs,
  defaultValue,
  onChange,
  className = '',
}: {
  tabs: TabItem[];
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(defaultValue || tabs[0]?.id);

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (onChange) onChange(id);
  };

  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];

  return (
    <div className={`w-full ${className}`}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 max-w-fit mb-6"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`tab-${activeTab?.id}`}
        className="focus:outline-none"
      >
        {activeTab?.content}
      </div>
    </div>
  );
}
