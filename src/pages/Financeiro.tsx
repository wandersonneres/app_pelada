import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, Copy, Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  userId: string;
  name?: string;
  playerName?: string;
  recordedBy: string;
  date: string;
  value: number;
  status: 'paid' | 'pending';
  paidAt?: string;
  obs?: string;
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
    if (!selectedDiarista) return;
    
    const paymentRef = doc(collection(db, 'diaristaPayments'));
    const paymentData: DiaristaPayment = {
      id: paymentRef.id,
      userId: selectedDiarista.id,
      name: selectedDiarista.name,
      playerName: selectedDiarista.name,
      recordedBy: user?.username || 'Admin',
      date: new Date().toISOString(),
      value: diaristaPaymentValue,
      status: 'paid',
      paidAt: new Date().toISOString(),
    };

    await setDoc(paymentRef, paymentData);
    setDiaristaPayments(prev => [...prev, paymentData]);
    setShowDiaristaModal(false);
    setSelectedDiarista(null);
  };

  const formatPaymentDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
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
      
      // Verifica o mês atual
      const currentMonthPaymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
      const currentMonthPayment = payments[currentMonthPaymentId];
      const currentMonthStatus = currentMonthPayment?.status === 'paid' ? ' ✅' : '';
      
      // Verifica apenas os 4 meses anteriores (excluindo o mês atual)
      let monthsInDebt = 0;
      for (let i = 1; i <= 4; i++) {
        const checkMonth = selectedMonth - i;
        const paymentId = `${m.id}_${checkMonth}_${selectedYear}`;
        const payment = payments[paymentId];
        
        // Se não existe pagamento ou o status não é 'paid', considera em atraso
        if (!payment || payment.status !== 'paid') {
          monthsInDebt++;
        } else {
          break;
        }
      }

      const debtStatus = monthsInDebt > 0 ? ' 🚨'.repeat(monthsInDebt) : '';
      message += `${number} - ${name}${currentMonthStatus}${debtStatus}\n\n`;
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
    return <div className="p-8 text-center text-red-500 font-bold">Acesso restrito ao administrador.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-3 lg:p-4">
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Financeiro</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Filtros */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow p-4">
          {/* Mobile (default) */}
          <div className="sm:hidden">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Mês
                </label>
                <div className="relative">
                  <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(Number(e.target.value))} 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1} className="py-1">{format(new Date(2024, i), 'MMMM', { locale: ptBR })}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Ano
                </label>
                <div className="relative">
                  <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(Number(e.target.value))} 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                  >
                    {[2025,2026,2027,2028,2029,2030].map(y => (
                      <option key={y} value={y} className="py-1">{y}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Status
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${statusFilter === 'paid' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    Pagos
                  </button>
                  <button
                    onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${statusFilter === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    Pendentes
                  </button>
                </div>
              </div>

              <div className="col-span-4 flex items-end">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 px-2 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg text-gray-700"
                >
                  {copySuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tablet (sm) */}
          <div className="hidden sm:block md:hidden">
            <div className="flex items-end gap-4">
              <div className="flex gap-4 flex-1">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Mês
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedMonth} 
                      onChange={e => setSelectedMonth(Number(e.target.value))} 
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1} className="py-1">{format(new Date(2024, i), 'MMMM', { locale: ptBR })}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Ano
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedYear} 
                      onChange={e => setSelectedYear(Number(e.target.value))} 
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                    >
                      {[2025,2026,2027,2028,2029,2030].map(y => (
                        <option key={y} value={y} className="py-1">{y}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="w-40">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Check className="w-4 h-4 text-blue-600" />
                    Status
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${statusFilter === 'paid' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      Pagos
                    </button>
                    <button
                      onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${statusFilter === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      Pendentes
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg text-gray-700 font-medium whitespace-nowrap"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Desktop (md e lg) */}
          <div className="hidden md:block">
            <div className="flex items-end justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-40">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Mês
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedMonth} 
                      onChange={e => setSelectedMonth(Number(e.target.value))} 
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1} className="py-1">{format(new Date(2024, i), 'MMMM', { locale: ptBR })}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Ano
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedYear} 
                      onChange={e => setSelectedYear(Number(e.target.value))} 
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
                    >
                      {[2025,2026,2027,2028,2029,2030].map(y => (
                        <option key={y} value={y} className="py-1">{y}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="w-40">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Check className="w-4 h-4 text-blue-600" />
                    Status
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${statusFilter === 'paid' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      Pagos
                    </button>
                    <button
                      onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${statusFilter === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      Pendentes
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg text-gray-700 font-medium whitespace-nowrap"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Lista</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Mensalistas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow">
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-6 text-left font-semibold text-gray-900 min-w-[180px]">Nome</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-900">Status</th>
                      <th className="py-3 px-4 text-center font-semibold text-gray-900 w-[120px]">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mensalistas.filter(m => {
                      const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
                      const p = payments[paymentId];
                      if (statusFilter === 'all') return true;
                      if (statusFilter === 'paid') return p && p.status === 'paid';
                      if (statusFilter === 'pending') return !p || p.status !== 'paid';
                      return true;
                    })
                    .sort((a, b) => (a.playerInfo?.name || '').localeCompare(b.playerInfo?.name || ''))
                    .map((m, idx) => {
                      const paymentId = `${m.id}_${selectedMonth}_${selectedYear}`;
                      const p = payments[paymentId];
                      const diaristaPayment = diaristaPayments.find(dp => dp.userId === m.id);
                      
                      return (
                        <tr
                          key={m.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="py-3 px-6 font-medium text-gray-900 min-w-[180px] truncate" title={m.playerInfo?.name || m.id}>
                            {m.playerInfo?.name || m.id}
                            {m.playerInfo?.paymentType === 'diarista' && (
                              <span className="ml-2 text-xs text-gray-500">(Diarista)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {m.playerInfo?.paymentType === 'diarista' ? (
                              diaristaPayment ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Pago (R$ {diaristaPayment.value.toFixed(2)})
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pendente
                                </span>
                              )
                            ) : (
                              p && p.status === 'paid' ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Pago
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pendente
                                </span>
                              )
                            )}
                          </td>
                          <td className="py-3 px-4 text-center w-[120px]">
                            {m.playerInfo?.paymentType === 'diarista' ? (
                              <button
                                onClick={() => handleDiaristaPayment(m.id, m.playerInfo?.name || '')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                                  ${diaristaPayment 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                              >
                                {diaristaPayment ? 'Voltar' : 'Pagou'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTogglePayment(m.id)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                                  ${p && p.status === 'paid' 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
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
            )}
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Histórico de Pagamentos
            </h2>
          </div>
          <div className="p-4 max-h-[calc(100vh)] overflow-y-auto">
            <div className="space-y-6">
              {/* Mensalistas */}
              <div>
                <h3 className="text-sm font-bold text-blue-700 mb-2">Mensalistas</h3>
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
                      <div key={idx} className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 hover:bg-blue-100 transition-colors w-full">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate max-w-[180px]" title={payment.playerName || 'Usuário Removido'}>
                            {payment.playerName || 'Usuário Removido'}
                          </span>
                          <span className="text-xs text-blue-500">{formatPaymentDate(payment.paidAt)}</span>
                          <span className="text-xs text-gray-500">Registrado por: {payment.recordedBy}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-blue-900">R$ {payment.value.toFixed(2)}</span>
                          <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-1">Pago</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              {/* Diaristas */}
              {diaristaPayments.filter(p => p.status === 'paid').length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-purple-700 mb-2">Diaristas</h3>
                  <div className="flex flex-col gap-2">
                    {diaristaPayments
                      .filter(p => p.status === 'paid')
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-3 hover:bg-purple-100 transition-colors w-full">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm truncate max-w-[180px]" title={payment.playerName || payment.name || 'Diarista'}>
                              {payment.playerName || payment.name || 'Diarista'}
                            </span>
                            <span className="text-xs text-purple-500">{formatPaymentDate(payment.date)}</span>
                            <span className="text-xs text-gray-500">Registrado por: {payment.recordedBy}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-purple-900">R$ {payment.value.toFixed(2)}</span>
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-1">Pago</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informativos */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Informativos do Mês</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Valor Arrecadado */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Valor Arrecadado</h3>
                <p className="text-2xl font-bold text-blue-700">
                  R$ {Object.values(payments)
                    .filter(p => p.status === 'paid' && p.month === selectedMonth && p.year === selectedYear)
                    .reduce((acc, p) => acc + p.value, 0)
                    .toFixed(2)}
                </p>
              </div>

              {/* Custo da Pelada */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-900 mb-1">Custo da Pelada</h3>
                <p className="text-2xl font-bold text-green-700">
                  R$ {custoPelada.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {descricaoCusto}
                </p>
              </div>

              {/* Arrecadação Diaristas */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-medium text-purple-900 mb-1">Arrecadação Diaristas</h3>
                <p className="text-2xl font-bold text-purple-700">
                  R$ {diaristaPayments
                    .filter(p => p.status === 'paid')
                    .reduce((acc, p) => acc + p.value, 0)
                    .toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {diaristaPayments.filter(p => p.status === 'paid').length} pagamentos
                </p>
              </div>

              {/* Saldo */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="text-sm font-medium text-orange-900 mb-1">Saldo do Mês</h3>
                <p className="text-2xl font-bold text-orange-700">
                  R$ {(() => {
                    const arrecadado = Object.values(payments)
                      .filter(p => p.status === 'paid' && p.month === selectedMonth && p.year === selectedYear)
                      .reduce((acc, p) => acc + p.value, 0);
                    
                    return (arrecadado - custoPelada).toFixed(2);
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-6">Confirmar Pagamento</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Pagamento
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  value={paymentValue}
                  onChange={(e) => setPaymentValue(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
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
                className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento Diarista */}
      {showDiaristaModal && selectedDiarista && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-6">Confirmar Pagamento - Diarista</h3>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Jogador: <span className="font-medium">{selectedDiarista.name}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Pagamento
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  value={diaristaPaymentValue}
                  onChange={(e) => setDiaristaPaymentValue(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  min="0"
                  step="10"
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (!isNaN(value)) {
                      setDiaristaPaymentValue(Number(value.toFixed(2)));
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDiaristaModal(false);
                  setSelectedDiarista(null);
                }}
                className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDiaristaPayment}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
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