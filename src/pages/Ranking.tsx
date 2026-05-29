import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { convertTimestampToDate } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, Trophy, Target, Footprints, Award, TrendingDown,
  CalendarDays, Users, Crown, Settings2, Medal,
  Loader2, CalendarRange, Info, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerRankStats {
  id: string;
  name: string;
  goals: number;
  assists: number;
  victories: number;
  draws: number;
  defeats: number;
  matches: number;
  gamesAttended: number;
  totalPoints: number;
  winRate: number;
}

interface RankingConfig {
  presence: number;
  goal: number;
  assist: number;
  victory: number;
  draw: number;
  defeat: number;
  rankingStartDate: string;
}

const DEFAULT_CONFIG: RankingConfig = {
  presence: 1,
  goal: 3,
  assist: 2,
  victory: 3,
  draw: 1,
  defeat: -1,
  rankingStartDate: '',
};

type RankingType = 'points' | 'goals' | 'assists' | 'victories' | 'draws' | 'defeats' | 'presence';
type DateFilterMode = 'all' | 'thisYear' | 'thisMonth' | 'byYear' | 'byMonth' | 'period';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const RANK_TABS: { value: RankingType; icon: React.ReactNode; label: string; short: string }[] = [
  { value: 'points',    icon: <Trophy className="w-3 h-3" />,       label: 'Pontuação',  short: 'Pts'  },
  { value: 'goals',     icon: <Target className="w-3 h-3" />,       label: 'Artilheiro', short: 'Gols' },
  { value: 'assists',   icon: <Footprints className="w-3 h-3" />,   label: 'Assists',    short: 'Asst' },
  { value: 'victories', icon: <Award className="w-3 h-3" />,        label: 'Vitórias',   short: 'Vit'  },
  { value: 'draws',     icon: <Minus className="w-3 h-3" />,        label: 'Empates',    short: 'Emp'  },
  { value: 'defeats',   icon: <TrendingDown className="w-3 h-3" />, label: 'Derrotas',   short: 'Der'  },
  { value: 'presence',  icon: <Users className="w-3 h-3" />,        label: 'Presença',   short: 'Pres' },
];

const WEIGHT_FIELDS: { key: keyof Omit<RankingConfig, 'rankingStartDate'>; label: string }[] = [
  { key: 'presence', label: 'Presença' },
  { key: 'goal',     label: 'Gol'      },
  { key: 'assist',   label: 'Assist'   },
  { key: 'victory',  label: 'Vitória'  },
  { key: 'draw',     label: 'Empate'   },
  { key: 'defeat',   label: 'Derrota'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function medalStyle(rank: number) {
  if (rank === 1) return {
    avatarBg: 'bg-yellow-100', avatarText: 'text-yellow-800', ring: 'ring-yellow-300', badge: '🥇',
    valueColor: 'text-yellow-700', borderColor: 'border-yellow-200',
    cardBg: 'bg-gradient-to-b from-yellow-50 to-white',
    pedestal: 'bg-gradient-to-t from-yellow-500 to-yellow-300',
  };
  if (rank === 2) return {
    avatarBg: 'bg-slate-100', avatarText: 'text-slate-700', ring: 'ring-slate-200', badge: '🥈',
    valueColor: 'text-slate-600', borderColor: 'border-slate-200',
    cardBg: 'bg-gradient-to-b from-slate-50 to-white',
    pedestal: 'bg-gradient-to-t from-slate-400 to-slate-200',
  };
  return {
    avatarBg: 'bg-amber-100', avatarText: 'text-amber-800', ring: 'ring-amber-300', badge: '🥉',
    valueColor: 'text-amber-700', borderColor: 'border-amber-200',
    cardBg: 'bg-gradient-to-b from-amber-50 to-white',
    pedestal: 'bg-gradient-to-t from-amber-700 to-amber-400',
  };
}

function rankLabel(type: RankingType): string {
  const map: Record<RankingType, string> = {
    points: 'pts', goals: 'gols', assists: 'assists',
    victories: 'vitórias', draws: 'empates', defeats: 'derrotas',
    presence: 'presenças',
  };
  return map[type];
}

function primaryValue(stats: PlayerRankStats, type: RankingType): number {
  switch (type) {
    case 'points':    return stats.totalPoints;
    case 'goals':     return stats.goals;
    case 'assists':   return stats.assists;
    case 'victories': return stats.victories;
    case 'draws':     return stats.draws;
    case 'defeats':   return stats.defeats;
    case 'presence':  return stats.gamesAttended;
  }
}

function secondaryStats(stats: PlayerRankStats, type: RankingType) {
  switch (type) {
    case 'points':    return [{ label: 'Gols', value: stats.goals }, { label: 'Assists', value: stats.assists }, { label: 'Vitórias', value: stats.victories }];
    case 'goals':     return [{ label: 'Assists', value: stats.assists }, { label: 'Vitórias', value: stats.victories }];
    case 'assists':   return [{ label: 'Gols', value: stats.goals }, { label: 'Vitórias', value: stats.victories }];
    case 'victories': return [{ label: 'Empates', value: stats.draws }, { label: 'Derrotas', value: stats.defeats }];
    case 'draws':     return [{ label: 'Vitórias', value: stats.victories }, { label: 'Derrotas', value: stats.defeats }];
    case 'defeats':   return [{ label: 'Vitórias', value: stats.victories }, { label: 'Empates', value: stats.draws }];
    case 'presence':  return [{ label: 'Vitórias', value: stats.victories }, { label: 'Derrotas', value: stats.defeats }];
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Ranking() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [allStats, setAllStats] = useState<PlayerRankStats[]>([]);
  const [config, setConfig] = useState<RankingConfig>(DEFAULT_CONFIG);
  const [totalGames, setTotalGames] = useState(0);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [dateMode, setDateMode] = useState<DateFilterMode>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const [rankType, setRankType] = useState<RankingType>('points');
  const [showEditor, setShowEditor] = useState(false);
  const [editConfig, setEditConfig] = useState<RankingConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Raw string values for weight inputs — avoids the "0 persists" controlled-input bug
  const [weightsRaw, setWeightsRaw] = useState<Record<string, string>>({});

  // ── Load config ───────────────────────────────────────────────────────────
  useEffect(() => {
    getDoc(doc(db, 'settings', 'scoringWeights')).then(snap => {
      if (snap.exists()) {
        const data = { ...DEFAULT_CONFIG, ...snap.data() } as RankingConfig;
        setConfig(data);
        setEditConfig(data);
      }
    }).catch((err) => {
      console.error('Erro ao carregar configurações do ranking:', err);
    });
  }, []);

  // ── Date range ────────────────────────────────────────────────────────────
  const userDateRange = useMemo((): { start: Date | null; end: Date | null } => {
    const now = new Date();
    switch (dateMode) {
      case 'all':       return { start: null, end: null };
      case 'thisYear':  return { start: startOfYear(now), end: endOfYear(now) };
      case 'thisMonth': return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'byYear':    return { start: startOfYear(new Date(selectedYear, 0)), end: endOfYear(new Date(selectedYear, 0)) };
      case 'byMonth':   return { start: startOfMonth(new Date(selectedYear, selectedMonth)), end: endOfMonth(new Date(selectedYear, selectedMonth)) };
      case 'period':    return {
        start: periodStart ? new Date(periodStart + 'T00:00:00') : null,
        end:   periodEnd   ? new Date(periodEnd   + 'T23:59:59') : null,
      };
    }
  }, [dateMode, selectedYear, selectedMonth, periodStart, periodEnd]);

  const effectiveStart = useMemo((): Date | null => {
    const adminStart = config.rankingStartDate ? new Date(config.rankingStartDate + 'T00:00:00') : null;
    if (!adminStart) return userDateRange.start;
    if (!userDateRange.start) return adminStart;
    return userDateRange.start > adminStart ? userDateRange.start : adminStart;
  }, [config.rankingStartDate, userDateRange.start]);

  // ── Load & aggregate data ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'games'), orderBy('date', 'desc')));
        if (cancelled) return;

        const statsMap: Record<string, PlayerRankStats> = {};
        const years = new Set<number>();
        let filteredCount = 0;

        snap.docs.forEach(docSnap => {
          const raw = docSnap.data();
          const gameDate = convertTimestampToDate(raw.date);
          years.add(gameDate.getFullYear());

          if (effectiveStart && gameDate < effectiveStart) return;
          if (userDateRange.end && gameDate > userDateRange.end) return;
          filteredCount++;

          const players: { id: string; name: string }[] = raw.players ?? [];
          const matches: any[] = raw.matches ?? [];

          // Presence
          players.forEach(p => {
            if (!statsMap[p.id]) {
              statsMap[p.id] = {
                id: p.id, name: p.name,
                goals: 0, assists: 0, victories: 0, draws: 0, defeats: 0,
                matches: 0, gamesAttended: 0, totalPoints: 0, winRate: 0,
              };
            }
            statsMap[p.id].name = p.name;
            statsMap[p.id].gamesAttended += 1;
          });

          // Matches
          matches.forEach((match: any) => {
            if (match.status !== 'finished') return;
            const teams: any[] = match.teams ?? [];

            // Goals & assists
            (match.goals ?? []).forEach((g: any) => {
              if (g.scorerId  && statsMap[g.scorerId])  statsMap[g.scorerId].goals   += 1;
              if (g.assisterId && statsMap[g.assisterId]) statsMap[g.assisterId].assists += 1;
            });

            // Victory / Draw / Defeat — derived from goals per team (placar real)
            if (teams.length >= 2) {
              // Count goals per team from the goals array
              const teamGoals: Record<string, number> = {};
              teams.forEach((t: any) => { teamGoals[t.id] = 0; });
              (match.goals ?? []).forEach((g: any) => {
                if (!g.scorerId) return;
                for (const team of teams) {
                  if ((team.players ?? []).some((p: any) => p.id === g.scorerId)) {
                    teamGoals[team.id] = (teamGoals[team.id] ?? 0) + 1;
                    break;
                  }
                }
              });
              // Fall back to team.score only when no goals are recorded
              const totalGoals = Object.values(teamGoals).reduce((a: number, b: number) => a + b, 0);
              if (totalGoals === 0) {
                teams.forEach((t: any) => { teamGoals[t.id] = Number(t.score ?? 0); });
              }

              const goalValues = teams.map((t: any) => teamGoals[t.id] ?? 0);
              const maxGoals = Math.max(...goalValues);
              const isDraw = goalValues.every(v => v === goalValues[0]);

              teams.forEach((team: any) => {
                const tGoals = teamGoals[team.id] ?? 0;
                const won  = !isDraw && tGoals === maxGoals;
                const drew = isDraw;
                (team.players ?? []).forEach((p: any) => {
                  if (!statsMap[p.id]) return;
                  statsMap[p.id].matches += 1;
                  if (won)       statsMap[p.id].victories += 1;
                  else if (drew) statsMap[p.id].draws     += 1;
                  else           statsMap[p.id].defeats   += 1;
                });
              });
            }
          });
        });

        // Derived fields
        Object.values(statsMap).forEach(s => {
          s.winRate = s.matches > 0 ? Math.round((s.victories / s.matches) * 100) : 0;
          s.totalPoints =
            s.gamesAttended * config.presence +
            s.goals         * config.goal     +
            s.assists       * config.assist   +
            s.victories     * config.victory  +
            s.draws         * config.draw     +
            s.defeats       * config.defeat;
        });

        setAllStats(Object.values(statsMap));
        setTotalGames(filteredCount);
        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [effectiveStart, userDateRange.end, config]);

  const ranked = useMemo(
    () => [...allStats].sort((a, b) => primaryValue(b, rankType) - primaryValue(a, rankType)),
    [allStats, rankType]
  );

  const top3 = ranked.slice(0, 3);
  const years = availableYears.length > 0 ? availableYears : [new Date().getFullYear()];

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await setDoc(doc(db, 'settings', 'scoringWeights'), editConfig);
      setConfig({ ...editConfig });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowEditor(false);
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar configurações do ranking:', err);
      setSaveError(err?.message ?? 'Erro ao salvar. Verifique as permissões do Firestore.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-600 rounded-xl shadow-md shrink-0">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-none">Ranking</h1>
              {!loading && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {allStats.length} jogadores · {totalGames} jogo{totalGames !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditConfig(config);
                setWeightsRaw(Object.fromEntries(WEIGHT_FIELDS.map(f => [f.key, String(config[f.key])])));
                setShowEditor(v => !v);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0',
                showEditor
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              )}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Configurar</span>
              <span className="sm:hidden">Config</span>
            </button>
          )}
        </div>

        {/* Admin config editor */}
        <AnimatePresence>
          {isAdmin && showEditor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-blue-200 bg-blue-50/60">
                <CardContent className="p-4 space-y-4">

                  {/* Weights grid */}
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-3 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" /> Pesos da pontuação geral
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {WEIGHT_FIELDS.map(({ key, label }) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs text-blue-700 font-medium block text-center">{label}</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={weightsRaw[key] ?? String(editConfig[key])}
                            onFocus={e => e.target.select()}
                            onChange={e => {
                              const raw = e.target.value;
                              setWeightsRaw(prev => ({ ...prev, [key]: raw }));
                              const n = parseInt(raw, 10);
                              if (!isNaN(n)) setEditConfig(prev => ({ ...prev, [key]: n }));
                            }}
                            onBlur={e => {
                              const n = parseInt(e.target.value, 10);
                              const val = isNaN(n) ? 0 : n;
                              setWeightsRaw(prev => ({ ...prev, [key]: String(val) }));
                              setEditConfig(prev => ({ ...prev, [key]: val }));
                            }}
                            className="h-8 text-sm bg-white text-center px-1"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-500 mt-2 leading-relaxed">
                      pts = pres×{editConfig.presence} + gol×{editConfig.goal} + assist×{editConfig.assist} + vit×{editConfig.victory} + emp×{editConfig.draw} + der×{editConfig.defeat}
                    </p>
                  </div>

                  {/* Start date */}
                  <div className="border-t border-blue-200 pt-4">
                    <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Data mínima do ranking
                    </p>
                    <p className="text-xs text-blue-500 mb-2.5">
                      Jogos anteriores a esta data serão ignorados em todos os cálculos.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="date"
                        value={editConfig.rankingStartDate}
                        onChange={e => setEditConfig(prev => ({ ...prev, rankingStartDate: e.target.value }))}
                        className="h-8 text-xs border border-blue-200 rounded-lg px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                      />
                      {editConfig.rankingStartDate && (
                        <button
                          onClick={() => setEditConfig(prev => ({ ...prev, rankingStartDate: '' }))}
                          className="text-xs text-blue-500 hover:text-blue-700 underline"
                        >
                          Limpar (ler tudo)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1 border-t border-blue-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                      >
                        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                        Salvar configurações
                      </button>
                      <button
                        onClick={() => { setShowEditor(false); setSaveError(null); setSaveSuccess(false); }}
                        className="px-3 py-2 text-xs text-gray-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Cancelar
                      </button>
                      {saveSuccess && (
                        <span className="text-xs text-green-600 font-medium">✓ Salvo com sucesso</span>
                      )}
                    </div>
                    {saveError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {saveError}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start date notice */}
        {config.rankingStartDate && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              Dados a partir de{' '}
              <span className="font-semibold">
                {format(parseISO(config.rankingStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </span>
          </div>
        )}

        {/* Date Filters */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-3 sm:p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Filtrar por período
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {([
                { mode: 'all'       as DateFilterMode, label: 'Todos'     },
                //{ mode: 'thisMonth' as DateFilterMode, label: 'Este Mês'  },
                //{ mode: 'thisYear'  as DateFilterMode, label: 'Este Ano'  },
                { mode: 'byYear'    as DateFilterMode, label: 'Por Ano'   },
                { mode: 'byMonth'   as DateFilterMode, label: 'Por Mês'   },
                { mode: 'period'    as DateFilterMode, label: 'Período', icon: <CalendarRange className="w-3 h-3" /> },
              ] as { mode: DateFilterMode; label: string; icon?: React.ReactNode }[]).map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => setDateMode(mode)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    dateMode === mode
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  )}
                >
                  {icon}{label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {dateMode === 'byYear' && (
                <motion.div key="y" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs text-gray-500">Ano:</span>
                  <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <span className="flex-1 text-left">{selectedYear}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
              {dateMode === 'byMonth' && (
                <motion.div key="m" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <span className="text-xs text-gray-500">Mês:</span>
                  <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <span className="flex-1 text-left">{MONTHS[selectedMonth]}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                    <SelectTrigger className="h-8 w-20 text-xs">
                      <span className="flex-1 text-left">{selectedYear}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
              {dateMode === 'period' && (
                <motion.div key="p" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 shrink-0">De:</span>
                    <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
                      className="h-8 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 shrink-0">Até:</span>
                    <input type="date" value={periodEnd} min={periodStart} onChange={e => setPeriodEnd(e.target.value)}
                      className="h-8 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* ── Ranking type selector ────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 min-w-max pb-0.5">
              {RANK_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setRankType(tab.value)}
                  className={cn(
                    'flex items-center gap-1.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                    'px-3 sm:px-4',
                    rankType === tab.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50'
                  )}
                >
                  {tab.icon}
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Right fade hint on mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none sm:hidden" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && ranked.length === 0 && (
          <Card className="border-gray-100">
            <CardContent className="py-12 text-center">
              <Trophy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum dado encontrado para este período.</p>
            </CardContent>
          </Card>
        )}

        {/* Pódio Top 3 */}
        {!loading && top3.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-yellow-500" />
              Top 3 — {rankType === 'points' ? 'Pontuação Geral' : rankLabel(rankType)}
            </p>
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              {top3[1] && <PodiumCard rank={2} stats={top3[1]} rankType={rankType} config={config} pedestalH="h-20 sm:h-24" />}
              <PodiumCard        rank={1} stats={top3[0]} rankType={rankType} config={config} pedestalH="h-28 sm:h-32" />
              {top3[2] && <PodiumCard rank={3} stats={top3[2]} rankType={rankType} config={config} pedestalH="h-14 sm:h-16" />}
            </div>
          </div>
        )}

        {/* Classificação completa */}
        {!loading && ranked.length > 3 && (
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Medal className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900">Classificação Completa</h2>
              <span className="ml-auto text-xs text-gray-400">{ranked.length} jogadores</span>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
              {ranked.map((stats, idx) => (
                <RankRow key={stats.id} rank={idx + 1} stats={stats} rankType={rankType} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── PodiumCard ───────────────────────────────────────────────────────────────

function PodiumCard({ rank, stats, rankType, config, pedestalH }: {
  rank: number; stats: PlayerRankStats; rankType: RankingType; config: RankingConfig; pedestalH: string;
}) {
  const s = medalStyle(rank);
  const value = primaryValue(stats, rankType);
  const isFirst = rank === 1;

  const breakdown = rankType === 'points' ? ([
    stats.gamesAttended > 0 && { emoji: '📅', label: 'Presença', count: stats.gamesAttended, w: config.presence, result: stats.gamesAttended * config.presence },
    stats.goals         > 0 && { emoji: '⚽', label: 'Gols',     count: stats.goals,          w: config.goal,     result: stats.goals         * config.goal     },
    stats.assists       > 0 && { emoji: '👟', label: 'Assists',   count: stats.assists,         w: config.assist,   result: stats.assists       * config.assist   },
    stats.victories     > 0 && { emoji: '🏆', label: 'Vitórias', count: stats.victories,        w: config.victory,  result: stats.victories     * config.victory  },
    stats.draws         > 0 && { emoji: '🤝', label: 'Empates',  count: stats.draws,            w: config.draw,     result: stats.draws         * config.draw     },
    stats.defeats       > 0 && { emoji: '💀', label: 'Derrotas', count: stats.defeats,          w: config.defeat,   result: stats.defeats       * config.defeat   },
  ] as const).filter(Boolean) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank === 1 ? 0 : rank === 2 ? 0.1 : 0.18 }}
      className="flex-1 flex flex-col items-center min-w-0 max-w-[160px] sm:max-w-none"
    >
      <span className="text-xl sm:text-2xl mb-1 leading-none">{s.badge}</span>

      <div className={cn(
        'w-full rounded-xl border shadow-sm flex flex-col items-center gap-1.5 p-2 sm:p-3',
        s.cardBg, s.borderColor
      )}>
        <div className={cn(
          'rounded-full flex items-center justify-center font-bold shrink-0 ring-2',
          s.avatarBg, s.avatarText, s.ring,
          isFirst ? 'w-11 h-11 sm:w-14 sm:h-14 text-base sm:text-lg' : 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base'
        )}>
          {stats.name.charAt(0).toUpperCase()}
        </div>

        <p className={cn('font-bold text-gray-900 text-center w-full truncate leading-tight', isFirst ? 'text-xs sm:text-sm' : 'text-xs')}>
          {stats.name.split(' ')[0]}
        </p>

        <p className={cn('font-extrabold leading-none', s.valueColor, isFirst ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl')}>
          {value}
        </p>
        <p className="text-xs text-gray-400 -mt-0.5">{rankLabel(rankType)}</p>

        {breakdown && breakdown.length > 0 && (
          <div className="w-full mt-1 pt-1.5 border-t border-gray-200/60 space-y-0.5">
            {(breakdown as { emoji: string; label: string; count: number; w: number; result: number }[]).map(b => (
              <div key={b.label} className="flex items-center justify-between gap-1">
                <span className="text-xs text-gray-500 shrink-0">{b.emoji} {b.count}×{b.w}</span>
                <span className={cn('text-xs font-semibold', b.result >= 0 ? 'text-gray-700' : 'text-red-500')}>
                  {b.result > 0 ? '+' : ''}{b.result}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-0.5 border-t border-gray-200/50">
              <span className="text-xs text-gray-400">Total</span>
              <span className={cn('text-xs font-bold', s.valueColor)}>{value} pts</span>
            </div>
          </div>
        )}
      </div>

      <div className={cn('w-full rounded-t-sm opacity-70', pedestalH, s.pedestal)} />
    </motion.div>
  );
}

// ─── RankRow ──────────────────────────────────────────────────────────────────

function RankRow({ rank, stats, rankType }: { rank: number; stats: PlayerRankStats; rankType: RankingType }) {
  const value = primaryValue(stats, rankType);
  const secondaries = secondaryStats(stats, rankType);
  return (
    <div className={cn('flex items-center gap-2.5 px-3 sm:px-4 py-2.5 hover:bg-gray-50 transition-colors', rank <= 3 && 'bg-blue-50/20')}>
      <span className={cn('w-6 text-center shrink-0 font-bold', rank <= 3 ? 'text-base' : 'text-xs text-gray-300')}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </span>
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 shrink-0">
        {stats.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{stats.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {secondaries.map(s => (
            <span key={s.label} className="text-xs text-gray-400">
              {s.label} <span className="font-medium text-gray-600">{s.value}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{rankLabel(rankType)}</p>
      </div>
    </div>
  );
}
