import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Portal } from '@/components/ui/Portal';

const MONTHS_PT = [...Array(12)].map((_, i) => format(new Date(2024, i), 'MMMM', { locale: ptBR }));
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

function MonthSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
      <SelectTrigger className="w-full">
        <span className="flex-1 text-left capitalize">{MONTHS_PT[value - 1]}</span>
      </SelectTrigger>
      <SelectContent>
        {MONTHS_PT.map((m, i) => (
          <SelectItem key={i + 1} value={String(i + 1)} className="capitalize">{m}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function YearSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
      <SelectTrigger className="w-full">
        <span className="flex-1 text-left">{value}</span>
      </SelectTrigger>
      <SelectContent>
        {YEARS.map(y => (
          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface Payment {
  userId: string;
  playerName: string;
  recordedBy: string;
  month: number;
  year: number;
  status: 'paid' | 'pending';
  value: number;
  paidAt?: string;
  obs?: string;
}

interface DiaristaPayment {
  id: string;
  playerId: string;
  playerName: string;
  recordBy: string;
  date: string;
  value: number;
  status: 'paid' | 'pending';
  paidAt?: string;
  gameId: string;
  matchId: string;
}

interface Mensalista {
  id: string;
  playerInfo: {
    name: string;
    paymentType: string;
  };
  email: string;
}

export function Financeiro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mensalistas, setMensalistas] = useState<Mensalista[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [diaristaPayments, setDiaristaPayments] = useState<DiaristaPayment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [paymentValue, setPaymentValue] = useState(130);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMensalista, setSelectedMensalista] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDiaristaModal, setShowDiaristaModal] = useState(false);
  const [selectedDiarista, setSelectedDiarista] = useState<{id: string, name: string} | null>(null);
  const [diaristaPaymentValue, setDiaristaPaymentValue] = useState(30);
  const [realGames, setRealGames] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchMensalistas = async () => {
      setIsLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('playerInfo.paymentType', '==', 'mensalista'));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Mensalista[];
      setMensalistas(lista);
      setIsLoading(false);
    };
    fetchMensalistas();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchPayments = async () => {
      const paymentsRef = collection(db, 'payments');
      // Busca pagamentos do mês atual e 4 meses anteriores
      const monthsToCheck = Array.from({ length: 5 }, (_, i) => selectedMonth - i);
      const q = query(
        paymentsRef,
        where('month', 'in', monthsToCheck),
        where('year', '==', selectedYear)
      );
      const snapshot = await getDocs(q);
      const map: Record<string, Payment> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Payment;
        const paymentId = `${data.userId}_${data.month}_${data.year}`;
        map[paymentId] = data;
      });
      setPayments(map);
    };
    fetchPayments();
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchDiaristaPayments = async () => {
      const paymentsRef = collection(db, 'diaristaPayments');
      const q = query(
        paymentsRef,
        where('date', '>=', new Date(selectedYear, selectedMonth - 1, 1).toISOString()),
        where('date', '<=', new Date(selectedYear, selectedMonth, 0).toISOString())
      );
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DiaristaPayment[];
      setDiaristaPayments(payments);
    };
    fetchDiaristaPayments();
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchGames = async () => {
      const start = startOfMonth(new Date(selectedYear, selectedMonth - 1));
      const end = endOfMonth(new Date(selectedYear, selectedMonth - 1));
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef,
        where('date', '>=', start),
        where('date', '<=', end)
      );
      const snapshot = await getDocs(q);
      setRealGames(snapshot.docs.map(doc => doc.data()));
    };
    fetchGames();
  }, [selectedMonth, selectedYear]);

  const handleTogglePayment = async (userId: string) => {
    const paymentId = `${userId}_${selectedMonth}_${selectedYear}`;
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentDoc = await getDoc(paymentRef);
    const alreadyPaid = paymentDoc.exists() && paymentDoc.data().status === 'paid';

    if (alreadyPaid) {
      // Se já está pago, apenas desmarca
      await setDoc(paymentRef, {
        userId,
        playerName: mensalistas.find(m => m.id === userId)?.playerInfo?.name || 'Usuário Removido',
        recordedBy: user?.username || 'Admin',
        month: selectedMonth,
        year: selectedYear,
        status: 'pending',
        value: 0,
        paidAt: null,
      });
      setPayments(prev => ({
        ...prev,
        [paymentId]: {
          userId,
          playerName: mensalistas.find(m => m.id === userId)?.playerInfo?.name || 'Usuário Removido',
          recordedBy: user?.username || 'Admin',
          month: selectedMonth,
          year: selectedYear,
          status: 'pending',
          value: 0,
          paidAt: undefined,
        },
      }));
    } else {
      // Se não está pago, mostra o modal para confirmar o valor
      setSelectedMensalista(userId);
      setShowPaymentModal(true);
    }
  };

  const confirmPayment = async () => {
    if (!selectedMensalista) return;

    const paymentId = `${selectedMensalista}_${selectedMonth}_${selectedYear}`;
    const paymentRef = doc(db, 'payments', paymentId);
    const playerName = mensalistas.find(m => m.id === selectedMensalista)?.playerInfo?.name || 'Usuário Removido';

    await setDoc(paymentRef, {
      userId: selectedMensalista,
      playerName,
      recordedBy: user?.username || 'Admin',
      month: selectedMonth,
      year: selectedYear,
      status: 'paid',
      value: paymentValue,
      paidAt: new Date().toISOString(),
    });

    setPayments(prev => ({
      ...prev,
      [paymentId]: {
        userId: selectedMensalista,
        playerName,
        recordedBy: user?.username || 'Admin',
        month: selectedMonth,
        year: selectedYear,
        status: 'paid',
        value: paymentValue,
        paidAt: new Date().toISOString(),
      },
    }));

    setShowPaymentModal(false);
    setSelectedMensalista(null);
  };

  const handleDiaristaPayment = async (userId: string, name: string) => {
    setSelectedDiarista({ id: userId, name });
    setShowDiaristaModal(true);
  };

  const confirmDiaristaPayment = async () => {
    if (!selectedDiarista || !user) return;

    try {
      const paymentRef = doc(collection(db, 'diaristaPayments'));
      const paymentData: DiaristaPayment = {
        id: paymentRef.id,
        playerId: selectedDiarista.id,
        playerName: selectedDiarista.name,
        recordBy: user?.playerInfo?.name || user?.email || 'Sistema',
        date: new Date().toISOString(),
        value: diaristaPaymentValue,
        status: 'paid',
        paidAt: new Date().toISOString(),
        gameId: '',
        matchId: '',
      };

      await setDoc(paymentRef, paymentData);
      setDiaristaPayments(prev => [...prev, paymentData]);
      setShowDiaristaModal(false);
      setSelectedDiarista(null);
      setDiaristaPaymentValue(30);
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
  };

  const formatPaymentDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getFirstPaymentDate = (userId: string) => {
    let firstYear: number | null = null;
    let firstMonth: number | null = null;
    Object.values(payments).forEach(p => {
      if (p.userId === userId) {
        if (firstYear === null || p.year < firstYear || (p.year === firstYear && p.month < firstMonth!)) {
          firstYear = p.year;
          firstMonth = p.month;
        }
      }
    });
    if (firstYear === null || firstMonth === null) return null;
    return { month: firstMonth, year: firstYear };
  };

  const calculateMonthsInDebt = (userId: string) => {
    const firstPayment = getFirstPaymentDate(userId);
    if (!firstPayment) return 0;

    let monthsInDebt = 0;

    for (let i = 1; i <= 4; i++) {
      const checkMonth = selectedMonth - i;
      let adjustedMonth = checkMonth;
      let adjustedYear = selectedYear;
      if (checkMonth < 1) {
        adjustedMonth = checkMonth + 12;
        adjustedYear = selectedYear - 1;
      }

      // Para de contar se o mês verificado é anterior ao primeiro registro do jogador
      if (adjustedYear < firstPayment.year || (adjustedYear === firstPayment.year && adjustedMonth < firstPayment.month)) {
        break;
      }

      const paymentId = `${userId}_${adjustedMonth}_${adjustedYear}`;
      const payment = payments[paymentId];
      if (!payment || payment.status !== 'paid') {
        monthsInDebt++;
      } else {
        break;
      }
    }

    return monthsInDebt;
  };

  const generateWhatsAppMessage = () => {
    const monthName = format(new Date(2024, selectedMonth - 1), 'MMMM', { locale: ptBR }).toUpperCase();

    let message = `MENSALIDADE DE ${monthName}\n\n`;

    const sortedMensalistas = mensalistas
      .slice()
      .sort((a, b) => (a.playerInfo?.name || '').localeCompare(b.playerInfo?.name || ''));

    sortedMensalistas.forEach((m, index) => {
      const number = String(index + 1).padStart(2, '0');
      const name = m.playerInfo?.name?.toUpperCase() || '';

      const currentMonthPaymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
      const paidCurrentMonth = payments[currentMonthPaymentId]?.status === 'paid';

      const monthsInDebt = calculateMonthsInDebt(m.id);

      let statusStr = '';
      if (paidCurrentMonth) {
        statusStr = '✅';
      } else if (monthsInDebt > 0) {
        statusStr = '🚨'.repeat(Math.min(monthsInDebt, 4));
      }

      const line = statusStr ? `${number} - ${name} ${statusStr}` : `${number} - ${name}`;
      message += `${line}\n\n`;
    });

    return message;
  };

  const copyToClipboard = async () => {
    const message = generateWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar mensagem:', err);
    }
  };

  const isFuture = selectedYear > new Date().getFullYear() ||
    (selectedYear === new Date().getFullYear() && selectedMonth > new Date().getMonth() + 1);

  const today = new Date();
  const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1;

  let custoPelada = 0;
  let custoReal = 0;
  let custoPrevisto = 0;
  let descricaoCusto = '';
  const valorPelada = 450 + 100 + 50;

  if (isFuture) {
    // previsão futura
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const saturdays = Array.from(
      { length: lastDay.getDate() },
      (_, i) => new Date(selectedYear, selectedMonth - 1, i + 1)
    ).filter(date => date.getDay() === 6).length;
    custoPelada = saturdays * valorPelada;
    descricaoCusto = `${saturdays} sábados no mês (previsão)`;
  } else if (isCurrentMonth) {
    // mês atual: real + previsão
    // Agrupa peladas por dia (apenas um custo por dia)
    const peladasRealizadasDiasUnicos = Array.from(new Set(realGames
      .filter(g => (g.date.toDate ? g.date.toDate() < today : new Date(g.date) < today))
      .map(g => {
        const d = g.date.toDate ? g.date.toDate() : new Date(g.date);
        return d.toISOString().split('T')[0];
      })
    ));
    const peladasFuturas = realGames.filter(g => g.date.toDate ? g.date.toDate() >= today : new Date(g.date) >= today);

    custoReal = peladasRealizadasDiasUnicos.length * valorPelada;
    // previsão: quantos sábados ainda faltam no mês e não tem pelada marcada
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const saturdaysNoMes = Array.from(
      { length: lastDay.getDate() },
      (_, i) => new Date(selectedYear, selectedMonth - 1, i + 1)
    ).filter(date => date.getDay() === 6);

    const sabadosFuturos = saturdaysNoMes.filter(sab => sab >= today);
    // Se já tem pelada marcada para o sábado futuro, não soma previsão
    const sabadosSemPelada = sabadosFuturos.filter(sab => !realGames.some(g => {
      const gameDate = g.date.toDate ? g.date.toDate() : new Date(g.date);
      return gameDate.getDate() === sab.getDate() && gameDate.getMonth() === sab.getMonth() && gameDate.getFullYear() === sab.getFullYear();
    }));

    custoPrevisto = sabadosSemPelada.length * valorPelada;
    custoPelada = custoReal + custoPrevisto;
    descricaoCusto = `${peladasRealizadasDiasUnicos.length} peladas realizadas + ${sabadosSemPelada.length} previstas`;
  } else {
    // mês passado: só real
    // Agrupa peladas por dia (apenas um custo por dia)
    const peladasDiasUnicos = Array.from(new Set(realGames.map(g => {
      const d = g.date.toDate ? g.date.toDate() : new Date(g.date);
      return d.toISOString().split('T')[0];
    })));
    custoPelada = peladasDiasUnicos.length * valorPelada;
    descricaoCusto = `${peladasDiasUnicos.length} peladas realizadas`;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="pelada-page">
        <div className="relative z-10 flex items-center justify-center min-h-[60vh] px-4">
          <div className="glass-card p-8 text-center max-w-sm">
            <p className="text-danger-soft font-bold">Acesso restrito ao administrador.</p>
          </div>
        </div>
      </div>
    );
  }

  // Totais derivados (somente apresentação — usa os mesmos dados já calculados)
  const totalArrecadado = Object.values(payments)
    .filter(p => p.status === 'paid' && p.month === selectedMonth && p.year === selectedYear)
    .reduce((acc, p) => acc + p.value, 0);
  const totalDiaristas = diaristaPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.value, 0);
  const saldo = totalArrecadado - custoPelada;

  const filteredMensalistas = mensalistas
    .filter(m => {
      const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
      const p = payments[paymentId];
      if (statusFilter === 'all') return true;
      if (statusFilter === 'paid') return p && p.status === 'paid';
      if (statusFilter === 'pending') return !p || p.status !== 'paid';
      return true;
    })
    .sort((a, b) => (a.playerInfo?.name || '').localeCompare(b.playerInfo?.name || ''));

  const statusOptions: { key: 'all' | 'paid' | 'pending'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'paid', label: 'Pagos' },
    { key: 'pending', label: 'Pendentes' },
  ];

  // Painel sólido e discreto — visual mais sóbrio que o glass-card
  const panel = 'rounded-xl border border-divider bg-[var(--surface-solid)] shadow-sm';

  return (
    <div className="pelada-page pb-10">
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-5 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors shrink-0"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-wide text-heading leading-none">Financeiro</h1>
          <p className="text-xs text-ink-muted mt-1 capitalize">{MONTHS_PT[selectedMonth - 1]} de {selectedYear}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${panel} p-3 sm:p-4`}>
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-ink-soft mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-team-blue-soft" /> Mês
            </label>
            <MonthSelect value={selectedMonth} onChange={setSelectedMonth} />
          </div>

          <div className="w-full md:w-28">
            <label className="block text-xs font-medium text-ink-soft mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-team-blue-soft" /> Ano
            </label>
            <YearSelect value={selectedYear} onChange={setSelectedYear} />
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-ink-soft mb-1.5 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-team-blue-soft" /> Status
            </label>
            <div className="flex gap-1.5 p-1 rounded-xl bg-surface border border-divider">
              {statusOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === opt.key
                      ? 'bg-team-blue text-white shadow-sm'
                      : 'text-ink-soft hover:bg-surface-hover'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-team-blue hover:brightness-110 text-white text-sm font-semibold rounded-xl transition whitespace-nowrap"
          >
            {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copySuccess ? 'Copiado!' : 'Copiar Lista'}</span>
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de Mensalistas */}
        <div className="lg:col-span-2">
          <div className={`${panel} overflow-hidden`}>
            <div className="px-5 py-3 border-b border-divider flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Mensalistas</h2>
              <span className="ml-auto text-xs text-ink-dim tabular-nums">{filteredMensalistas.length}</span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-ink-muted">Carregando...</div>
            ) : filteredMensalistas.length === 0 ? (
              <div className="text-center py-12 text-ink-dim text-sm">Nenhum jogador neste filtro.</div>
            ) : (
              <>
                {/* Desktop: Tabela */}
                <div className="hidden md:block max-h-[460px] overflow-y-auto overflow-x-auto scroll-custom">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-[var(--surface-solid)]">
                      <tr className="border-b border-divider text-ink-muted">
                        <th className="py-2.5 px-5 text-left text-xs font-semibold uppercase tracking-wide min-w-[180px]">Nome</th>
                        <th className="py-2.5 px-4 text-center text-xs font-semibold uppercase tracking-wide">Status</th>
                        <th className="py-2.5 px-4 text-center text-xs font-semibold uppercase tracking-wide">Atrasos</th>
                        <th className="py-2.5 px-4 text-center text-xs font-semibold uppercase tracking-wide w-[120px]">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider">
                      {filteredMensalistas.map((m) => {
                        const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
                        const p = payments[paymentId];
                        const diaristaPayment = diaristaPayments.find(dp => dp.playerId === m.id);
                        const isDiarista = m.playerInfo?.paymentType === 'diarista';
                        const isPaid = isDiarista ? !!diaristaPayment : !!(p && p.status === 'paid');

                        return (
                          <tr key={m.id} className="hover:bg-surface-hover transition-colors">
                            <td className="py-2.5 px-5 font-medium text-heading min-w-[180px]">
                              <span className="truncate" title={m.playerInfo?.name || m.id}>
                                {m.playerInfo?.name || m.id}
                                {isDiarista && <span className="ml-2 text-xs text-meio-soft">(Diarista)</span>}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isDiarista ? (
                                diaristaPayment ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 text-success-soft border border-success/30">
                                    Pago (R$ {diaristaPayment.value.toFixed(2)})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning-soft border border-warning/30">
                                    Pendente
                                  </span>
                                )
                              ) : (
                                isPaid ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 text-success-soft border border-success/30">
                                    Pago
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning-soft border border-warning/30">
                                    Pendente
                                  </span>
                                )
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isDiarista ? (
                                <span className="text-ink-dim">-</span>
                              ) : (
                                (() => {
                                  const monthsInDebt = calculateMonthsInDebt(m.id);
                                  if (monthsInDebt === 0) {
                                    return <span className="text-ink-dim">-</span>;
                                  } else {
                                    return (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-danger/15 text-danger-soft border border-danger/30">
                                        {monthsInDebt} {monthsInDebt === 1 ? 'mês' : 'meses'}
                                      </span>
                                    );
                                  }
                                })()
                              )}
                            </td>
                            <td className="py-3 px-4 text-center w-[120px]">
                              <button
                                onClick={() => isDiarista ? handleDiaristaPayment(m.id, m.playerInfo?.name || '') : handleTogglePayment(m.id)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                                  isPaid
                                    ? 'bg-danger/15 text-danger-soft border border-danger/30 hover:bg-danger/25'
                                    : 'bg-team-blue text-white hover:brightness-110'
                                }`}
                              >
                                {isPaid ? 'Voltar' : 'Pagou'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: Cards — lista completa, sem limite de altura */}
                <div className="md:hidden p-3 space-y-2.5">
                  {filteredMensalistas.map((m) => {
                    const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
                    const p = payments[paymentId];
                    const diaristaPayment = diaristaPayments.find(dp => dp.playerId === m.id);
                    const isDiarista = m.playerInfo?.paymentType === 'diarista';
                    const isPaid = isDiarista ? !!diaristaPayment : !!(p && p.status === 'paid');
                    const monthsInDebt = isDiarista ? 0 : calculateMonthsInDebt(m.id);

                    return (
                      <div key={m.id} className="rounded-lg p-3 bg-surface border border-divider">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-heading truncate">{m.playerInfo?.name || m.id}</h3>
                            <span className="text-xs text-ink-muted">{isDiarista ? 'Diarista' : 'Mensalista'}</span>
                          </div>
                          {isPaid ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-success/15 text-success-soft border border-success/30">Pago</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-warning/15 text-warning-soft border border-warning/30">Pendente</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-sm">
                          {isDiarista && diaristaPayment ? (
                            <div>
                              <span className="text-xs text-ink-muted block">Valor</span>
                              <span className="font-semibold text-success-soft">R$ {diaristaPayment.value.toFixed(2)}</span>
                            </div>
                          ) : !isDiarista && (
                            <div>
                              <span className="text-xs text-ink-muted block">Atrasos</span>
                              {monthsInDebt === 0 ? (
                                <span className="text-ink-soft text-sm">Em dia</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-danger/15 text-danger-soft border border-danger/30">
                                  {monthsInDebt} {monthsInDebt === 1 ? 'mês' : 'meses'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => isDiarista ? handleDiaristaPayment(m.id, m.playerInfo?.name || '') : handleTogglePayment(m.id)}
                          className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                            isPaid
                              ? 'bg-danger/15 text-danger-soft border border-danger/30 hover:bg-danger/25'
                              : 'bg-team-blue text-white hover:brightness-110'
                          }`}
                        >
                          {isPaid ? 'Desfazer Pagamento' : 'Registrar Pagamento'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Histórico */}
        <div className={`${panel} overflow-hidden self-start`}>
          <div className="px-5 py-3 border-b border-divider">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Histórico de Pagamentos</h2>
          </div>
          <div className="p-4 max-h-[460px] overflow-y-auto scroll-custom space-y-5">
            {/* Mensalistas */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-team-blue-soft mb-2">Mensalistas</h3>
              <div className="flex flex-col gap-2">
                {Object.values(payments)
                  .filter(p => p.status === 'paid' && p.month === selectedMonth && p.year === selectedYear)
                  .sort((a, b) => {
                    const dateA = a.paidAt ? new Date(a.paidAt).setHours(0, 0, 0, 0) : 0;
                    const dateB = b.paidAt ? new Date(b.paidAt).setHours(0, 0, 0, 0) : 0;

                    if (dateA !== dateB) {
                      return dateB - dateA;
                    }

                    return (a.playerName || '').localeCompare(b.playerName || '');
                  })
                  .map((payment, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 py-2.5 border-b border-divider last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-team-blue shrink-0" title="Mensalista" />
                        <div className="min-w-0">
                          <span className="block font-medium text-sm text-heading truncate" title={payment.playerName || 'Usuário Removido'}>
                            {payment.playerName || 'Usuário Removido'}
                          </span>
                          <span className="text-xs text-ink-dim">{formatPaymentDate(payment.paidAt)} · {payment.recordedBy}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-heading tabular-nums shrink-0">R$ {payment.value.toFixed(2)}</span>
                    </div>
                  ))}
                {Object.values(payments).filter(p => p.status === 'paid' && p.month === selectedMonth && p.year === selectedYear).length === 0 && (
                  <p className="text-xs text-ink-dim py-2">Nenhum pagamento registrado.</p>
                )}
              </div>
            </div>

            {/* Diaristas */}
            {diaristaPayments.filter(p => p.status === 'paid').length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-meio-soft mb-2">Diaristas</h3>
                <div className="flex flex-col gap-2">
                  {diaristaPayments
                    .filter(p => p.status === 'paid')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 py-2.5 border-b border-divider last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-meio shrink-0" title="Diarista" />
                          <div className="min-w-0">
                            <span className="block font-medium text-sm text-heading truncate" title={payment.playerName}>
                              {payment.playerName}
                            </span>
                            <span className="text-xs text-ink-dim">{formatPaymentDate(payment.date)} · {payment.recordBy}</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-heading tabular-nums shrink-0">R$ {payment.value.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo do mês */}
      <div className={`${panel} p-4`}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Resumo do mês</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-divider rounded-lg overflow-hidden border border-divider">
          <div className="bg-[var(--surface-solid)] p-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-team-blue" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Arrecadado</span>
            </div>
            <p className="mt-2 text-xl font-bold text-heading tabular-nums">R$ {totalArrecadado.toFixed(2)}</p>
          </div>

          <div className="bg-[var(--surface-solid)] p-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Custo da Pelada</span>
            </div>
            <p className="mt-2 text-xl font-bold text-heading tabular-nums">R$ {custoPelada.toFixed(2)}</p>
            <p className="text-[11px] text-ink-dim mt-1 leading-tight">{descricaoCusto}</p>
          </div>

          <div className="bg-[var(--surface-solid)] p-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-meio" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Diaristas</span>
            </div>
            <p className="mt-2 text-xl font-bold text-heading tabular-nums">R$ {totalDiaristas.toFixed(2)}</p>
            <p className="text-[11px] text-ink-dim mt-1">{diaristaPayments.filter(p => p.status === 'paid').length} pagamentos</p>
          </div>

          <div className="bg-[var(--surface-solid)] p-4">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${saldo >= 0 ? 'bg-success' : 'bg-danger'}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Saldo do Mês</span>
            </div>
            <p className={`mt-2 text-xl font-bold tabular-nums ${saldo >= 0 ? 'text-success-soft' : 'text-danger-soft'}`}>R$ {saldo.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Modal: pagamento mensalista */}
      {showPaymentModal && (
        <Portal>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80]">
          <div className="bg-[var(--surface-solid)] text-ink rounded-2xl shadow-xl p-6 w-full max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-heading mb-6">Confirmar Pagamento</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-soft mb-2">Valor do Pagamento</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">R$</span>
                <input
                  type="number"
                  value={paymentValue}
                  onChange={(e) => setPaymentValue(Number(e.target.value))}
                  className="field-input pl-12 text-lg"
                  min="0"
                  step="10"
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (!isNaN(value)) {
                      setPaymentValue(Number(value.toFixed(2)));
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedMensalista(null);
                }}
                className="flex-1 px-4 py-2.5 text-ink-soft bg-surface-hover hover:bg-surface-hover rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 px-4 py-2.5 bg-team-blue text-white rounded-lg hover:brightness-110 text-sm font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Modal: pagamento diarista */}
      {showDiaristaModal && (
        <Portal>
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--surface-solid)] text-ink rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-4 text-2xl text-ink-dim hover:text-ink-soft"
              onClick={() => setShowDiaristaModal(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold text-heading mb-4">Confirmar Pagamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1.5">Nome do Diarista</label>
                <input
                  className="field-input"
                  value={selectedDiarista?.name || ''}
                  readOnly
                  placeholder="Nome do diarista"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-1.5">Valor do Pagamento</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="field-input pl-12"
                    value={diaristaPaymentValue === 0 ? '' : diaristaPaymentValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setDiaristaPaymentValue(value === '' ? 0 : Number(value));
                    }}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDiaristaModal(false)}
                className="px-4 py-2 text-sm font-medium text-ink-soft bg-surface-hover rounded-lg hover:bg-surface-hover transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setDiaristaPaymentValue(0);
                  setTimeout(() => {
                    confirmDiaristaPayment();
                  }, 0);
                }}
                className="px-4 py-2 text-sm font-medium text-success-soft bg-success/15 border border-success/30 rounded-lg hover:bg-success/25 transition-colors"
                type="button"
                disabled={!selectedDiarista}
              >
                Gratis
              </button>
              <button
                onClick={confirmDiaristaPayment}
                className="px-4 py-2 text-sm font-medium text-white bg-team-blue rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={!selectedDiarista}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
    </div>
  );
}
