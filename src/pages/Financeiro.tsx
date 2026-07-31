import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Copy, Check, ChevronDown, Wallet, Users, Receipt, Scale, TrendingUp, X, History, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Loader';

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
  const [searchTerm, setSearchTerm] = useState('');
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
    return <div className="min-h-screen bg-paper p-8 text-center text-state-live font-bold">Acesso restrito ao administrador.</div>;
  }

  const arrecadadoMes = Object.values(payments)
    .filter(p => p.status === 'paid' && p.month === selectedMonth && p.year === selectedYear)
    .reduce((acc, p) => acc + p.value, 0);
  const arrecadadoDiaristas = diaristaPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.value, 0);
  const totalDiaristasPagos = diaristaPayments.filter(p => p.status === 'paid').length;
  // Saldo do mês = mensalidades + diaristas − custo da pelada
  const saldoMes = arrecadadoMes + arrecadadoDiaristas - custoPelada;

  const visibleMensalistas = mensalistas
    .filter(m => {
      const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
      const p = payments[paymentId];
      if (statusFilter === 'all') return true;
      if (statusFilter === 'paid') return p && p.status === 'paid';
      if (statusFilter === 'pending') return !p || p.status !== 'paid';
      return true;
    })
    .filter(m => (m.playerInfo?.name || '').toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => (a.playerInfo?.name || '').localeCompare(b.playerInfo?.name || ''));

  const statusTabs: { key: 'all' | 'paid' | 'pending'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'paid', label: 'Pagos' },
    { key: 'pending', label: 'Pendentes' },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="order-1 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-wine to-[#9e2a3d] text-white flex items-center justify-center shadow-sm flex-none">
            <Wallet className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-2xl text-ink leading-none">Financeiro</h1>
            <p className="text-[13px] text-ink-soft mt-1 first-letter:uppercase">
              {format(new Date(selectedYear, selectedMonth - 1), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="order-4 lg:order-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft uppercase tracking-wide">
              <TrendingUp className="w-3.5 h-3.5" /> Arrecadado
            </div>
            <p className="font-heading font-extrabold text-[22px] sm:text-[28px] lg:text-[30px] leading-none mt-2 text-state-success">
              R$ {arrecadadoMes.toFixed(2)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1.5">Mensalidades pagas</p>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft uppercase tracking-wide">
              <Receipt className="w-3.5 h-3.5" /> Custo da pelada
            </div>
            <p className="font-heading font-extrabold text-[22px] sm:text-[28px] lg:text-[30px] leading-none mt-2 text-ink">
              R$ {custoPelada.toFixed(2)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1.5">{descricaoCusto}</p>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft uppercase tracking-wide">
              <Users className="w-3.5 h-3.5" /> Diaristas
            </div>
            <p className="font-heading font-extrabold text-[22px] sm:text-[28px] lg:text-[30px] leading-none mt-2 text-wine">
              R$ {arrecadadoDiaristas.toFixed(2)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1.5 font-stat">{totalDiaristasPagos} pagamentos</p>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft uppercase tracking-wide">
              <Scale className="w-3.5 h-3.5" /> Saldo do mês
            </div>
            <p className={`font-heading font-extrabold text-[22px] sm:text-[28px] lg:text-[30px] leading-none mt-2 ${saldoMes < 0 ? 'text-state-live' : 'text-state-success'}`}>
              R$ {saldoMes.toFixed(2)}
            </p>
            <p className="text-[11px] text-ink-soft mt-1.5">Mensalidades + diaristas − custo</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="order-2 lg:order-3 bg-surface border border-line rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-end">
              {/* Mês */}
              <div className="sm:w-44">
                <label className="text-xs font-medium text-ink-medium mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-wine" /> Mês
                </label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                    className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-sm text-ink capitalize focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors appearance-none cursor-pointer"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1} className="py-1 capitalize">{format(new Date(2024, i), 'MMMM', { locale: ptBR })}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-ink-icon absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Ano */}
              <div className="sm:w-28">
                <label className="text-xs font-medium text-ink-medium mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-wine" /> Ano
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    className="w-full bg-paper border border-line rounded-xl px-3 py-2.5 text-sm text-ink font-stat focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine transition-colors appearance-none cursor-pointer"
                  >
                    {[2025,2026,2027,2028,2029,2030].map(y => (
                      <option key={y} value={y} className="py-1">{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-ink-icon absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-ink-medium mb-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-wine" /> Status
                </label>
                <div className="inline-flex bg-line-soft rounded-xl p-1 gap-1">
                  {statusTabs.map(tab => {
                    const active = statusFilter === tab.key;
                    const activeColor =
                      tab.key === 'paid' ? 'text-state-success'
                      : tab.key === 'pending' ? 'text-state-warning'
                      : 'text-wine';
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                          active ? `bg-surface shadow-sm ${activeColor}` : 'text-ink-soft hover:text-ink-medium'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Copiar lista WhatsApp */}
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-wine hover:bg-wine-dark text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar lista</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lista + Histórico */}
        <div className="order-3 lg:order-4 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[calc(100vh-22rem)] lg:min-h-[400px]">
          {/* Lista de Mensalistas */}
          <div className="lg:col-span-2 bg-surface border border-line rounded-2xl overflow-hidden flex flex-col">
            <div className="px-4 sm:px-5 py-4 border-b border-line">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-wine" />
                <h2 className="font-heading font-bold text-[15px] text-ink">Jogadores</h2>
                <span className="ml-auto text-xs text-ink-soft font-stat">{visibleMensalistas.length} de {mensalistas.length}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 border border-line rounded-xl px-3 bg-paper focus-within:ring-2 focus-within:ring-wine/30 focus-within:border-wine transition-colors">
                <Search className="w-4 h-4 text-ink-soft flex-none" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar jogador"
                  className="flex-1 bg-transparent outline-none text-sm text-ink py-2.5 min-w-0"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-ink-icon hover:text-ink flex-none" aria-label="Limpar busca">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            ) : visibleMensalistas.length === 0 ? (
              <div className="text-center py-14 text-ink-soft text-sm">Nenhum jogador neste filtro.</div>
            ) : (
              <>
                {/* Desktop: Tabela */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="py-3 px-5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft min-w-[200px]">Jogador</th>
                        <th className="py-3 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Status</th>
                        <th className="py-3 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Atrasos</th>
                        <th className="py-3 px-5 text-right text-[11px] font-semibold uppercase tracking-wide text-ink-soft w-[130px]">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleMensalistas.map((m) => {
                        const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
                        const p = payments[paymentId];
                        const diaristaPayment = diaristaPayments.find(dp => dp.playerId === m.id);
                        const isDiarista = m.playerInfo?.paymentType === 'diarista';

                        return (
                          <tr
                            key={m.id}
                            className="border-b border-line-soft last:border-0 hover:bg-paper/60 transition-colors"
                          >
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2.5">
                                <span className="w-8 h-8 flex-none rounded-full bg-ink/90 text-white font-stat font-bold text-[11px] flex items-center justify-center">
                                  {(m.playerInfo?.name || m.id).slice(0, 2).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-ink truncate max-w-[200px]" title={m.playerInfo?.name || m.id}>
                                    {m.playerInfo?.name || m.id}
                                  </div>
                                  {isDiarista && (
                                    <div className="text-[11px] text-ink-soft">Diarista</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isDiarista ? (
                                diaristaPayment ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-state-success/10 text-state-success">
                                    <Check className="w-3 h-3" /> Pago · <span className="font-stat">R$ {diaristaPayment.value.toFixed(2)}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-state-warningBg text-state-warning">
                                    Pendente
                                  </span>
                                )
                              ) : (
                                p && p.status === 'paid' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-state-success/10 text-state-success">
                                    <Check className="w-3 h-3" /> Pago
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-state-warningBg text-state-warning">
                                    Pendente
                                  </span>
                                )
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isDiarista ? (
                                <span className="text-ink-soft">-</span>
                              ) : (
                                (() => {
                                  const monthsInDebt = calculateMonthsInDebt(m.id);
                                  if (monthsInDebt === 0) {
                                    return <span className="text-ink-soft">-</span>;
                                  } else {
                                    return (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-state-live/10 text-state-live font-stat">
                                        {monthsInDebt} {monthsInDebt === 1 ? 'mês' : 'meses'}
                                      </span>
                                    );
                                  }
                                })()
                              )}
                            </td>
                            <td className="py-3 px-5 text-right w-[130px]">
                              {isDiarista ? (
                                <button
                                  onClick={() => handleDiaristaPayment(m.id, m.playerInfo?.name || '')}
                                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors
                                    ${diaristaPayment
                                      ? 'border border-[#ded8c9] bg-surface text-ink-medium hover:bg-paper'
                                      : 'bg-wine text-white hover:bg-wine-dark'
                                    }`}
                                >
                                  {diaristaPayment ? 'Voltar' : 'Pagou'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleTogglePayment(m.id)}
                                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors
                                    ${p && p.status === 'paid'
                                      ? 'border border-[#ded8c9] bg-surface text-ink-medium hover:bg-paper'
                                      : 'bg-wine text-white hover:bg-wine-dark'
                                    }`}
                                >
                                  {p && p.status === 'paid' ? 'Voltar' : 'Pagou'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: Cards */}
                <div className="md:hidden p-3 space-y-3">
                  {visibleMensalistas.map((m) => {
                    const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
                    const p = payments[paymentId];
                    const diaristaPayment = diaristaPayments.find(dp => dp.playerId === m.id);
                    const isDiarista = m.playerInfo?.paymentType === 'diarista';
                    const isPaid = isDiarista ? !!diaristaPayment : !!(p && p.status === 'paid');

                    return (
                      <div key={m.id} className="bg-paper border border-line rounded-2xl p-3.5">
                        {/* Cabeçalho com Nome e Status */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-9 h-9 flex-none rounded-full bg-ink/90 text-white font-stat font-bold text-xs flex items-center justify-center">
                              {(m.playerInfo?.name || m.id).slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-ink truncate text-[15px]">
                                {m.playerInfo?.name || m.id}
                              </h3>
                              <span className="text-[11px] text-ink-soft">
                                {isDiarista ? 'Diarista' : 'Mensalista'}
                              </span>
                            </div>
                          </div>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-state-success/10 text-state-success flex-none">
                              <Check className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-state-warningBg text-state-warning flex-none">
                              Pendente
                            </span>
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex items-center gap-4 mb-3.5 text-sm">
                          {isDiarista && diaristaPayment && (
                            <div>
                              <span className="text-[11px] text-ink-soft block">Valor</span>
                              <span className="font-stat font-semibold text-state-success">R$ {diaristaPayment.value.toFixed(2)}</span>
                            </div>
                          )}
                          {!isDiarista && (
                            <div>
                              <span className="text-[11px] text-ink-soft block">Atrasos</span>
                              {(() => {
                                const monthsInDebt = calculateMonthsInDebt(m.id);
                                if (monthsInDebt === 0) {
                                  return <span className="text-ink-medium text-sm">Em dia</span>;
                                } else {
                                  return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-state-live/10 text-state-live font-stat">
                                      {monthsInDebt} {monthsInDebt === 1 ? 'mês' : 'meses'}
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Botão de Ação */}
                        {isDiarista ? (
                          <button
                            onClick={() => handleDiaristaPayment(m.id, m.playerInfo?.name || '')}
                            className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                              ${diaristaPayment
                                ? 'border border-[#ded8c9] bg-surface text-ink-medium hover:bg-paper'
                                : 'bg-wine text-white hover:bg-wine-dark'
                              }`}
                          >
                            {diaristaPayment ? 'Desfazer pagamento' : 'Registrar pagamento'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTogglePayment(m.id)}
                            className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                              ${p && p.status === 'paid'
                                ? 'border border-[#ded8c9] bg-surface text-ink-medium hover:bg-paper'
                                : 'bg-wine text-white hover:bg-wine-dark'
                              }`}
                          >
                            {p && p.status === 'paid' ? 'Desfazer pagamento' : 'Registrar pagamento'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-surface border border-line rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-4 border-b border-line">
              <History className="w-4 h-4 text-wine" />
              <h2 className="font-heading font-bold text-[15px] text-ink">Histórico de pagamentos</h2>
            </div>
            <div className="p-4 flex-1 min-h-0 overflow-y-auto space-y-6">
              {/* Mensalistas */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft mb-2">Mensalistas</h3>
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
                      <div key={idx} className="flex items-center justify-between bg-paper border border-line-soft rounded-xl px-3.5 py-2.5 w-full">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-ink truncate max-w-[160px]" title={payment.playerName || 'Usuário Removido'}>
                            {payment.playerName || 'Usuário Removido'}
                          </span>
                          <span className="text-[11px] text-ink-soft">{formatPaymentDate(payment.paidAt)}</span>
                          <span className="text-[11px] text-ink-soft truncate max-w-[160px]">Por: {payment.recordedBy}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-none">
                          <span className="text-sm font-semibold text-ink font-stat">R$ {payment.value.toFixed(2)}</span>
                          <span className="text-[10px] text-state-success bg-state-success/10 px-2 py-0.5 rounded-full font-semibold">Pago</span>
                        </div>
                      </div>
                    ))}
                  {Object.values(payments).filter(p => p.status === 'paid' && p.month === selectedMonth && p.year === selectedYear).length === 0 && (
                    <p className="text-xs text-ink-soft py-2">Nenhum pagamento registrado.</p>
                  )}
                </div>
              </div>
              {/* Diaristas */}
              {diaristaPayments.filter(p => p.status === 'paid').length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft mb-2">Diaristas</h3>
                  <div className="flex flex-col gap-2">
                    {diaristaPayments
                      .filter(p => p.status === 'paid')
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#f8efe4] border border-[#ecdcc6] rounded-xl px-3.5 py-2.5 w-full">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-ink truncate max-w-[160px]" title={payment.playerName}>
                              {payment.playerName}
                            </span>
                            <span className="text-[11px] text-ink-soft">{formatPaymentDate(payment.date)}</span>
                            <span className="text-[11px] text-ink-soft truncate max-w-[160px]">Por: {payment.recordBy}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-none">
                            <span className="text-sm font-semibold text-ink font-stat">R$ {payment.value.toFixed(2)}</span>
                            <span className="text-[10px] text-state-success bg-state-success/10 px-2 py-0.5 rounded-full font-semibold">Pago</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Mensalista */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl shadow-xl border border-line p-6 w-full max-w-sm mx-auto animate-fade-in">
            <h3 className="text-lg font-heading font-bold text-ink mb-6">Confirmar pagamento</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-medium mb-2">
                Valor do pagamento
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-stat">R$</span>
                <input
                  type="number"
                  value={paymentValue}
                  onChange={(e) => setPaymentValue(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2.5 bg-paper border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine text-lg font-stat text-ink"
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
                className="flex-1 px-4 py-2.5 border border-[#ded8c9] bg-surface text-ink-medium hover:bg-paper rounded-xl text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 px-4 py-2.5 bg-wine text-white rounded-xl hover:bg-wine-dark text-sm font-semibold transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento do Diarista */}
      {showDiaristaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in border border-line">
            <button
              className="absolute top-4 right-4 text-ink-icon hover:text-ink transition-colors"
              onClick={() => setShowDiaristaModal(false)}
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-heading font-bold text-ink mb-4">Confirmar pagamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-medium mb-1.5">Nome do diarista</label>
                <input
                  className="w-full border border-line rounded-xl px-3 py-2.5 text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine"
                  value={selectedDiarista?.name || ''}
                  readOnly
                  placeholder="Nome do diarista"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-medium mb-1.5">Valor do pagamento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft font-stat">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full border border-line rounded-xl pl-9 pr-3 py-2.5 text-ink font-stat bg-paper focus:outline-none focus:ring-2 focus:ring-wine/30 focus:border-wine"
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
                className="px-4 py-2.5 text-sm font-semibold text-ink-medium border border-[#ded8c9] bg-surface rounded-xl hover:bg-paper transition-colors"
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
                className="px-4 py-2.5 text-sm font-semibold text-state-success bg-state-success/10 rounded-xl hover:bg-state-success/20 transition-colors"
                type="button"
                disabled={!selectedDiarista}
              >
                Grátis
              </button>
              <button
                onClick={confirmDiaristaPayment}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-wine rounded-xl hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={!selectedDiarista}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
