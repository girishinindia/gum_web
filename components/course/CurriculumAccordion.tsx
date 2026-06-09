'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen, FileText, Layers } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { CurriculumModule } from '@/lib/api';

interface Props {
  modules: CurriculumModule[];
}

export function CurriculumAccordion({ modules }: Props) {
  const [openModules, setOpenModules] = useState<Set<number>>(() => new Set(modules.length > 0 ? [modules[0].id] : []));
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());

  const toggleModule = (id: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleChapter = (key: string) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-12 px-6 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-500">
          <Layers className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Curriculum coming soon</p>
        <p className="mt-1 text-xs text-slate-400">The detailed module breakdown for this course is being finalised.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((mod, idx) => {
        const isOpen = openModules.has(mod.id);
        const num = String(idx + 1).padStart(2, '0');
        return (
          <div key={mod.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* Module header */}
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="shrink-0 h-9 w-9 rounded-full bg-sky-500 text-white heading text-sm flex items-center justify-center">
                {num}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="heading text-base text-slate-900 truncate">{mod.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mod.chapter_count} chapter{mod.chapter_count !== 1 ? 's' : ''}
                  {' · '}
                  {mod.topic_count} topic{mod.topic_count !== 1 ? 's' : ''}
                  {' · '}
                  {mod.subtopic_count} sub-topic{mod.subtopic_count !== 1 ? 's' : ''}
                </p>
              </div>
              <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform shrink-0', isOpen && 'rotate-180')} />
            </button>

            {/* Module body — chapters */}
            {isOpen && (
              <div className="border-t border-slate-100 px-5 pb-4">
                {mod.chapters.map((ch) => {
                  const chKey = `${mod.id}-${ch.id}`;
                  const chOpen = openChapters.has(chKey);
                  return (
                    <div key={ch.id} className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleChapter(chKey)}
                        className="w-full flex items-center gap-3 text-left py-2 hover:text-brand-700 transition-colors"
                        aria-expanded={chOpen}
                      >
                        <BookOpen className="h-4 w-4 text-brand-500 shrink-0" />
                        <span className="flex-1 text-sm font-semibold text-slate-800">{ch.name}</span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {ch.topic_count} topic{ch.topic_count !== 1 ? 's' : ''} · {ch.subtopic_count} sub-topic{ch.subtopic_count !== 1 ? 's' : ''}
                        </span>
                        <ChevronDown className={cn('h-4 w-4 text-slate-300 transition-transform shrink-0', chOpen && 'rotate-180')} />
                      </button>

                      {/* Topics + sub-topics */}
                      {chOpen && (
                        <div className="pl-7 mt-1 space-y-2">
                          {ch.topics.map((topic) => (
                            <div key={topic.id}>
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium">{topic.name}</span>
                                {topic.subtopic_count > 0 && (
                                  <span className="text-[10px] text-slate-400">({topic.subtopic_count})</span>
                                )}
                              </div>
                              {topic.sub_topics.length > 0 && (
                                <ul className="pl-6 mt-1 space-y-0.5">
                                  {topic.sub_topics.map((st) => (
                                    <li key={st.id} className="flex items-center gap-2 text-xs text-slate-500">
                                      <FileText className="h-3 w-3 text-slate-300 shrink-0" />
                                      <span>{st.name}</span>
                                      {st.estimated_minutes != null && st.estimated_minutes > 0 && (
                                        <span className="text-[10px] text-slate-300">{st.estimated_minutes}m</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
