'use client';

import React from 'react';
import { Tag, AlertTriangle, Clock, HelpCircle, GitCompare, Bookmark } from 'lucide-react';
import { clsx } from 'clsx';

export interface MistakeTagOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const MISTAKE_TAGS: MistakeTagOption[] = [
  {
    id: 'tajweed',
    label: 'Tajweed Rule',
    description: 'Ghunnah, Madd length, or Ikhfa error',
    icon: <Tag className="w-3.5 h-3.5 text-teal-deep" />
  },
  {
    id: 'hesitation',
    label: 'Hesitation',
    description: 'Pause or delayed recall during recitation',
    icon: <Clock className="w-3.5 h-3.5 text-amber-warm" />
  },
  {
    id: 'verse_start',
    label: 'Verse Start',
    description: 'Forgot first word of Ayah',
    icon: <HelpCircle className="w-3.5 h-3.5 text-apricot-muted" />
  },
  {
    id: 'waw_fa',
    label: 'Waw / Fa Swapped',
    description: 'Confused connector particles (وَ / فَ)',
    icon: <GitCompare className="w-3.5 h-3.5 text-purple-600" />
  },
  {
    id: 'mutashabihat',
    label: 'Mutashābihāt',
    description: 'Confused with similar verse elsewhere',
    icon: <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
  }
];

interface MistakeTagSelectorProps {
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
}

export const MistakeTagSelector: React.FC<MistakeTagSelectorProps> = ({
  selectedTags,
  onToggleTag
}) => {
  return (
    <div className="space-y-1.5 animate-in fade-in">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate flex items-center justify-between">
        <span>Classify Stumble Types (Optional)</span>
        <span className="text-[10px] text-slate-light font-medium">Helps focus re-testing</span>
      </label>

      <div className="flex flex-wrap gap-1.5">
        {MISTAKE_TAGS.map(tag => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggleTag(tag.id)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all',
                isSelected
                  ? 'bg-teal-deep text-white border-teal-deep shadow-xs'
                  : 'bg-surface/80 border-surface-border text-slate hover:bg-surface hover:text-ink'
              )}
              title={tag.description}
            >
              {tag.icon}
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
