import {
  Brain,
  CheckCircle2,
  Eye,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  buildWeaknessCards,
  STATIC_SRS_CARDS,
} from '../content/srsCards';
import { generateTaskById } from '../core/generators';
import {
  computeNextSrsState,
  createInitialSrsState,
  formatIntervalLabel,
  isCardDue,
  type SrsRating,
} from '../core/srs';
import { useAppStore } from '../store/useAppStore';
import type { GeneratedTask, SrsCardDefinition } from '../types/learning';
import { MathText } from './MathText';
import { TaskCard } from './TaskCard';

type CategoryFilter = 'all' | 'decision' | 'reflex' | 'weakness';

const CATEGORY_META: Record<
  SrsCardDefinition['category'],
  { label: string; badgeClass: string; icon: typeof Brain }
> = {
  decision: {
    label: 'Entscheidungs-Karte',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    icon: Layers,
  },
  reflex: {
    label: 'Kopfrechen-Reflex',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    icon: Zap,
  },
  weakness: {
    label: 'Schwächen-Training',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    icon: Target,
  },
};

const RATINGS: { rating: SrsRating; label: string; hint: string; btnClass: string }[] = [
  {
    rating: 0,
    label: 'Nochmal',
    hint: 'Wusste es nicht',
    btnClass:
      'border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-800 dark:text-red-200',
  },
  {
    rating: 3,
    label: 'Schwer',
    hint: 'Mit Mühe erinnert',
    btnClass:
      'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-900 dark:text-amber-200',
  },
  {
    rating: 4,
    label: 'Gut',
    hint: 'Sicher gewusst',
    btnClass:
      'border-green-300 dark:border-green-800 bg-green-50/70 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/60 text-green-800 dark:text-green-200',
  },
  {
    rating: 5,
    label: 'Leicht',
    hint: 'Sofort im Reflex',
    btnClass:
      'border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-blue-800 dark:text-blue-200',
  },
];

export function getAllSrsCards(
  skillStats: ReturnType<typeof useAppStore.getState>['skillStats'],
  srsQueue: ReturnType<typeof useAppStore.getState>['srsQueue']
): SrsCardDefinition[] {
  const weakness = buildWeaknessCards(skillStats, srsQueue);
  return [...weakness, ...STATIC_SRS_CARDS];
}

export function countDueSrsCards(
  skillStats: ReturnType<typeof useAppStore.getState>['skillStats'],
  srsQueue: ReturnType<typeof useAppStore.getState>['srsQueue'],
  nowMs = Date.now()
): number {
  const all = getAllSrsCards(skillStats, srsQueue);
  return all.filter((c) => isCardDue(srsQueue[c.id], nowMs)).length;
}

export function SrsView() {
  const { skillStats, srsQueue, reviewSrsCard, recordSkillAttempt } = useAppStore();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [revealed, setRevealed] = useState(false);
  const [practiceAhead, setPracticeAhead] = useState(false);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [activeWeakTask, setActiveWeakTask] = useState<{
    cardId: string;
    task: GeneratedTask;
  } | null>(null);

  const now = Date.now();
  const allCards = useMemo(
    () => getAllSrsCards(skillStats, srsQueue),
    [skillStats, srsQueue]
  );

  const filteredCards = useMemo(() => {
    const byCat =
      filter === 'all' ? allCards : allCards.filter((c) => c.category === filter);
    if (practiceAhead) return byCat;
    return byCat.filter((c) => isCardDue(srsQueue[c.id], now));
  }, [allCards, filter, practiceAhead, srsQueue, now]);

  const currentCard = filteredCards[0] ?? null;

  // Keep a generated task synced for weakness cards
  const weakTask = useMemo(() => {
    if (!currentCard?.generatorId) return null;
    if (activeWeakTask && activeWeakTask.cardId === currentCard.id) {
      return activeWeakTask.task;
    }
    return generateTaskById(currentCard.generatorId);
  }, [currentCard, activeWeakTask]);

  const handleRate = async (rating: SrsRating) => {
    if (!currentCard) return;
    await reviewSrsCard(currentCard.id, rating, {
      generatorId: currentCard.generatorId,
    });
    setReviewedToday((c) => c + 1);
    setRevealed(false);
    setActiveWeakTask(null);
  };

  const previewIntervals = useMemo(() => {
    if (!currentCard) return {} as Record<SrsRating, string>;
    const existing = srsQueue[currentCard.id] ?? createInitialSrsState(currentCard.id, now);
    return {
      0: formatIntervalLabel(computeNextSrsState(existing, 0, now).intervalDays),
      3: formatIntervalLabel(computeNextSrsState(existing, 3, now).intervalDays),
      4: formatIntervalLabel(computeNextSrsState(existing, 4, now).intervalDays),
      5: formatIntervalLabel(computeNextSrsState(existing, 5, now).intervalDays),
    };
  }, [currentCard, srsQueue, now]);

  const dueCounts = useMemo(() => {
    const due = allCards.filter((c) => isCardDue(srsQueue[c.id], now));
    return {
      all: due.length,
      decision: due.filter((c) => c.category === 'decision').length,
      reflex: due.filter((c) => c.category === 'reflex').length,
      weakness: due.filter((c) => c.category === 'weakness').length,
    };
  }, [allCards, srsQueue, now]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Wiederholung (SM-2 Spaced Repetition)
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Trainiert Formel-Entscheidungen, Kopfrechen-Reflexe und deine persönlichen Schwächen aus Übungen & Klausuren.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-semibold">
            Fällig: {dueCounts.all}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 font-semibold">
            Heute geübt: {reviewedToday}
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: `Alle (${dueCounts.all})` },
              { id: 'weakness', label: `Schwächen (${dueCounts.weakness})` },
              { id: 'decision', label: `Entscheidungen (${dueCounts.decision})` },
              { id: 'reflex', label: `Kopfrechen-Reflexe (${dueCounts.reflex})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilter(tab.id);
                setRevealed(false);
                setPracticeAhead(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {practiceAhead && (
          <button
            type="button"
            onClick={() => setPracticeAhead(false)}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Zurück zu fälligen Karten
          </button>
        )}
      </div>

      {/* Active Card or Empty State */}
      {!currentCard ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center space-y-4 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
          <h2 className="text-xl font-bold">
            {filter === 'weakness' && allCards.every((c) => c.category !== 'weakness')
              ? 'Noch keine offenen Schwächen registriert!'
              : 'Alle fälligen Karten erledigt!'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            {filter === 'weakness' && allCards.every((c) => c.category !== 'weakness')
              ? 'Sobald dir in den Lektionen oder im Prüfungsmodus ein Aufgabentyp schwerfällt, landet er automatisch hier im Schwächen-Stapel.'
              : 'Dein Langzeitgedächtnis arbeitet jetzt für dich. Komm morgen wieder vorbei – oder übe freiwillig vor.'}
          </p>
          {allCards.some((c) => filter === 'all' || c.category === filter) && (
            <button
              type="button"
              onClick={() => setPracticeAhead(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Freiwillig alle Karten dieser Kategorie durchgehen
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xs space-y-5">
          {/* Card Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {(() => {
                const meta = CATEGORY_META[currentCard.category];
                const Icon = meta.icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badgeClass}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>
                );
              })()}
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[var(--bg-subtle)] text-[var(--text-muted)] uppercase">
                {currentCard.moduleId}
              </span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              Noch {filteredCards.length} {filteredCards.length === 1 ? 'Karte' : 'Karten'} im Stapel
            </span>
          </div>

          {/* Dynamic Weakness Card with live TaskCard */}
          {currentCard.generatorId && weakTask ? (
            <div className="space-y-4">
              <div className="text-sm text-[var(--text-muted)] flex items-center justify-between">
                <span>
                  <MathText text={currentCard.question} /> — {currentCard.explanation}
                </span>
              </div>

              <TaskCard
                key={weakTask.id}
                task={weakTask}
                onNewTask={() =>
                  setActiveWeakTask({
                    cardId: currentCard.id,
                    task: generateTaskById(currentCard.generatorId!),
                  })
                }
                onEvaluated={(ok, errType) => {
                  void recordSkillAttempt(weakTask.generatorId, ok, errType);
                  setRevealed(true);
                }}
              />

              <div className="pt-2 border-t border-[var(--border-color)] space-y-2.5">
                <div className="text-xs font-semibold text-[var(--text-muted)]">
                  Wie sicher lief der Rechenweg? (Wählt den nächsten Wiederholungs-Termin nach SM-2)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {RATINGS.map((r) => (
                    <button
                      key={r.rating}
                      type="button"
                      onClick={() => void handleRate(r.rating)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${r.btnClass}`}
                    >
                      <div className="font-bold text-sm">{r.label}</div>
                      <div className="text-[11px] opacity-80">{r.hint}</div>
                      <div className="text-[11px] font-mono font-semibold mt-1">
                        in {previewIntervals[r.rating]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standard Flashcard (Entscheidung / Reflex) */
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-base leading-relaxed">
                <MathText text={currentCard.question} />
              </div>

              {!revealed ? (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Antwort aufdecken
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-5 rounded-xl border border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/25 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Antwort
                    </div>
                    <div className="text-[15px] leading-relaxed">
                      <MathText text={currentCard.answer} />
                    </div>
                    <div className="pt-2 border-t border-green-200 dark:border-green-900 text-xs text-[var(--text-muted)] leading-relaxed">
                      <MathText text={currentCard.explanation} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[var(--text-muted)]">
                      Wie gut saß die Antwort? (SM-2 plant das nächste Intervall automatisch)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {RATINGS.map((r) => (
                        <button
                          key={r.rating}
                          type="button"
                          onClick={() => void handleRate(r.rating)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${r.btnClass}`}
                        >
                          <div className="font-bold text-sm">{r.label}</div>
                          <div className="text-[11px] opacity-80">{r.hint}</div>
                          <div className="text-[11px] font-mono font-semibold mt-1">
                            in {previewIntervals[r.rating]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
