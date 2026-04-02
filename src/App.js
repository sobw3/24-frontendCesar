
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// --- SLIDER ---
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- GRÁFICOS (RECHARTS) ---
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

// --- ÍCONES (LUCIDE-REACT) ---
import { 
    Mail, Eye, Facebook, Siren, Tag, ShieldAlert, Headset, LockKeyhole, UnlockKeyhole,  CalendarDays, Unlock, AtSign, ShieldCheck, Edit3, ScanBarcode, Zap, ShoppingBag, 
    MessageCircle, MapPin, ArrowDown, Twitter, Store, Play, BarChart2, Download, RotateCcw, 
    Landmark, Image as ImageIcon, TrendingDown, ArrowUpRight, ArrowDownLeft, AlertCircle, 
    ChevronLeft, ChevronRight, TrendingUp, Layers, Wifi, WifiOff, Activity, RefreshCw, 
    EyeOff, Lock, User, ThumbsDown, Trophy, Clock, Smartphone, Home, Building, Check, 
    Search, ShoppingCart, Hourglass, Menu, X, ArrowLeft, ArrowRight, Trash2, Plus, Minus, 
    Users as UsersIcon, Package, LogOut, CreditCard, QrCode, Shield, Loader2, Edit, 
    PlusCircle, Building2, Copy, ChevronDown, ChevronUp, DollarSign, KeyRound, Calendar, 
    Wallet, Flame, AlertTriangle, Save, Filter, ArrowDownToLine, ArrowRightLeft, Ticket, 
    Bell, PiggyBank, History, Phone, Refrigerator, CheckCircle2, Info, Ban, FileText,
    Instagram, MessageSquare, PieChart, LayoutDashboard, ClipboardCheck, Truck, CheckCircle, XCircle, Video, Receipt, Sparkles, Smile, Lightbulb
} from 'lucide-react';




// --- CONFIGURAÇÃO DA API ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const MERCADOPAGO_PUBLIC_KEY = process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY;


// --- FUNÇÕES HELPER ---
const formatCPF = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
};

const formatPhone = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
};

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
};

const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit': return <ArrowDownToLine className="text-green-400" />;
            case 'transfer_in': return <ArrowRightLeft className="text-green-400" />;
            case 'transfer_out': return <ArrowRightLeft className="text-red-400" />;
            case 'purchase': return <ShoppingCart className="text-red-400" />;
            case 'credit_purchase': return <CreditCard className="text-red-400" />;
            case 'invoice_payment': return <FileText className="text-blue-400" />;
            default: return <DollarSign />;
        }
    };

const Toast = ({ message, isVisible, onClose }) => {
    // Estado inicial: Escondido para cima, transparente e levemente menor
    const [animationClass, setAnimationClass] = useState('-translate-y-12 opacity-0 scale-95');

    useEffect(() => {
        if (isVisible) {
            // Estado visível: Desce, fica opaco e volta ao tamanho normal
            setAnimationClass('translate-y-4 sm:translate-y-6 opacity-100 scale-100');
        } else {
            setAnimationClass('-translate-y-12 opacity-0 scale-95');
        }
    }, [isVisible]);

    return (
        // O ease-[cubic-bezier(...)] é o segredo para o efeito "mola" (bouncy)
        <div className={`fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${animationClass} px-4`}>
            
            <div className="bg-white/90 backdrop-blur-xl border border-gray-100 p-2 pr-4 rounded-[28px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center gap-3 pointer-events-auto w-full max-w-sm mx-auto">
                
                {/* Ícone de Sucesso Premium */}
                <div className="w-12 h-12 rounded-[20px] bg-green-50 flex items-center justify-center shrink-0 border border-green-100/50 shadow-inner">
                    <CheckCircle2 size={24} strokeWidth={2.5} className="text-green-500" />
                </div>
                
                {/* Textos */}
                <div className="flex-1 py-1 min-w-0">
                    <p className="text-[9px] font-extrabold-id text-green-500 uppercase tracking-widest mb-0.5">
                        Adicionado
                    </p>
                    <p className="text-gray-900 text-sm md:text-base font-extrabold-id leading-tight truncate">
                        {message}
                    </p>
                </div>
                
                {/* Botão Fechar Discreto */}
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shrink-0 active:scale-90"
                    title="Fechar"
                >
                    <X size={16} strokeWidth={3} />
                </button>

            </div>
        </div>
    );
};

const TransferConfirmationModal = ({ isOpen, onClose, onConfirm, recipient, amount, isTransferring }) => {
    if (!isOpen || !recipient) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            
            {/* Backdrop Blur Escuro */}
            <div 
                className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md transition-opacity animate-in fade-in" 
                onClick={!isTransferring ? onClose : undefined}
            ></div>

            {/* Container do Modal */}
            <div className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header com Gradiente Sutil */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"></div>

                <div className="relative p-6 pt-8 text-center">
                    
                    {/* Título */}
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                        Revisão do Envio
                    </h3>
                    
                    {/* Valor em Destaque (Hero) */}
                    <div className="mb-6 relative">
                        <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-xl">
                            <span className="text-2xl text-blue-400 mr-1">R$</span>
                            {parseFloat(amount).toFixed(2).replace('.', ',')}
                        </h2>
                    </div>

                    {/* Conector Visual (Seta) */}
                    <div className="flex justify-center mb-[-14px] relative z-10">
                        <div className="bg-[#1e293b] p-1.5 rounded-full border border-white/10">
                            <ArrowDown size={20} className="text-blue-400 animate-bounce" />
                        </div>
                    </div>

                    {/* Card do Destinatário (Estilo Ticket) */}
                    <div className="bg-black/20 border border-white/5 rounded-2xl p-6 pt-8 relative overflow-hidden group">
                        {/* Efeito de brilho no fundo */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"></div>
                        
                        <div className="flex flex-col items-center gap-3">
                            {/* Avatar / Ícone */}
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <span className="text-xl font-bold text-white">
                                    {recipient.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            
                            {/* Dados */}
                            <div className="text-center">
                                <p className="text-white font-bold text-lg leading-tight mb-1">
                                    {recipient.name}
                                </p>
                                <p className="text-blue-300/80 text-sm font-medium bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10 inline-block">
                                    {recipient.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer de Segurança */}
                    <div className="mt-6 mb-6 flex items-center justify-center gap-2 text-gray-500">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Transação Criptografada</span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={onClose} 
                            disabled={isTransferring}
                            className="py-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        
                        <button 
                            onClick={onConfirm} 
                            disabled={isTransferring} 
                            className="relative overflow-hidden py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-80 flex items-center justify-center gap-2 group"
                        >
                            {isTransferring ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Confirmar Envio</span>
                                    <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const TransferLoadingModal = ({ isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-[999] animate-fade-in-fast">
            <Loader2 size={64} className="text-orange-400 animate-spin" />
            <p className="text-white text-xl mt-6 font-semibold">Processando transferência...</p>
            <p className="text-gray-400 mt-2">Aguarde, estamos concluindo a transação com segurança.</p>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente TransactionReceiptModal por este

const TransactionReceiptModal = ({ isOpen, onClose, transactionId, token }) => {
    const [details, setDetails] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // --- DEFINIÇÃO DAS ANIMAÇÕES (Apenas "Surgir") ---
    const keyframes = `
        @keyframes surgir {
            from {
                opacity: 0;
                transform: scale(0.95) translateY(10px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        .animate-surgir {
            animation: surgir 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
            opacity: 0;
        }
    `;
    
    // --- Classe do Botão Neon (ESTÁTICO, sem pulso) ---
    const neonButtonClass = `
        bg-blue-500 text-white font-bold py-3 px-6 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50
        transition-all disabled:bg-gray-500 disabled:shadow-none
        transform hover:scale-105
    `;

    React.useEffect(() => {
        if (isOpen && transactionId) {
            const fetchDetails = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`${API_URL}/api/wallet/transaction/${transactionId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setDetails(data);
                    } else {
                        setDetails(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch transaction details:", error);
                    setDetails(null);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [isOpen, transactionId, token]);

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast print:bg-white print:text-black">
            <style>{keyframes}</style>
            
            {/* --- CARD REDESENHADO (Fundo Sólido #18212f) --- */}
            <div 
                id="receipt" 
                className="p-8 rounded-2xl shadow-2xl 
                           w-full max-w-md 
                           animate-surgir
                           print:shadow-none print:bg-white print:rounded-none"
                // --- COR DO FUNDO APLICADA AQUI ---
                style={{ backgroundColor: '#18212f' }}
            >
                {/* --- LOGO DE IMAGEM --- */}
                <img 
                    src="/logo-smartfridge.png" // Caminho para a pasta /public
                    alt="SmartFridge Logo" 
                    className="h-10 w-auto mx-auto mb-6 print:h-12"
                />
                
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-200 print:text-black">Comprovante de Transação</h2>
                
                {isLoading ? <div className="flex justify-center"><Loader2 className="animate-spin text-white print:text-black" /></div> : details ? (
                    <div className="space-y-4 text-gray-300 print:text-gray-800">
                        
                        {/* --- Seção de Detalhes (Fundo Sólido Mais Escuro) --- */}
                        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                            <p className="flex justify-between"><strong className="text-gray-400 font-medium">ID da Transação:</strong> <span className="font-semibold text-white">{details.id}</span></p>
                            <p className="flex justify-between"><strong className="text-gray-400 font-medium">Data e Hora:</strong> <span className="font-semibold text-white">{new Date(details.created_at).toLocaleString('pt-BR')}</span></p>
                            <p className="flex justify-between"><strong className="text-gray-400 font-medium">Tipo:</strong> <span className="font-semibold text-white capitalize">{details.type?.replace(/_/g, ' ')}</span></p>
                            <p className="flex justify-between text-right"><strong className="text-gray-400 font-medium">Descrição:</strong> <span className="font-semibold text-white ml-4">{details.description}</span></p>
                        </div>
                        
                        {/* --- Seção de Valor (Com Neon Estático) --- */}
                        <div className="text-center bg-gray-900 rounded-lg p-4">
                            <p className="text-lg text-gray-300">Valor Total</p>
                            <p 
                                className="flex justify-center text-4xl mt-1 font-bold text-orange-400 print:text-orange-500"
                                // --- NEON ESTÁTICO (Sem pulso) ---
                                style={{ textShadow: '0 0 8px rgba(249, 115, 22, 0.7)' }}
                            >
                                R$ {parseFloat(details.amount).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        
                        {/* Itens da Compra (se houver) */}
                        {details.items && details.items.length > 0 && (
                            <div className="bg-gray-900 rounded-lg p-4">
                                <h3 className="font-bold text-lg text-gray-200 print:text-black mb-2">Itens da Compra</h3>
                                <div className="space-y-2 mt-2">
                                    {details.items.map(item => (
                                        <div key={item.product_id} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.product_name}</span>
                                            <span>R$ {parseFloat(item.price_at_purchase).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Destinatário (se houver) */}
                        {details.recipient && (
                            <div className="bg-gray-900 rounded-lg p-4">
                                <h3 className="font-bold text-lg text-gray-200 print:text-black mb-2">Detalhes do Destinatário</h3>
                                <p className="flex justify-between"><strong className="text-gray-400 font-medium">Nome:</strong> <span>{details.recipient.name}</span></p>
                                <p className="flex justify-between"><strong className="text-gray-400 font-medium">E-mail:</strong> <span>{details.recipient.email}</span></p>
                                <p className="flex justify-between"><strong className="text-gray-400 font-medium">Condomínio:</strong> <span>{details.recipient.condominium_name}</span></p>
                            </div>
                        )}
                    </div>
                ) : <p className="text-red-400 text-center">Não foi possível carregar os detalhes da transação.</p>}
                
                {/* --- BOTÕES REDESENHADOS (Sólidos) --- */}
                <div className="flex justify-center gap-4 mt-8 print:hidden">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={handlePrint} 
                        disabled={isLoading || !details} 
                        className={neonButtonClass} // Botão Neon Estático
                    >
                        Salvar / Imprimir
                    </button>
                </div>
                <style>
                    {`@media print { 
                        body * { visibility: hidden; } 
                        #receipt, #receipt * { visibility: visible; } 
                        #receipt { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; background: #fff !important; } 
                        /* Garante que o fundo escuro não imprima */
                        .bg-gray-900 { background: #fff !important; color: #000 !important; }
                    }`}
                </style>
            </div>
        </div>
    );
};

const CountdownTimer = ({ endDate }) => {
    const calculateTimeLeft = React.useCallback(() => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }, [endDate]);
    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());
    React.useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    if (Object.keys(timeLeft).length === 0) return <span className="text-xs font-bold text-gray-400">Encerrada!</span>;
    const formatTime = (value) => (value || 0).toString().padStart(2, '0');
    const timerComponents = [];
    if (timeLeft.d > 0) timerComponents.push(`${timeLeft.d}d`);
    if (timeLeft.h > 0 || timeLeft.d > 0) timerComponents.push(`${formatTime(timeLeft.h)}h`);
    timerComponents.push(`${formatTime(timeLeft.m)}m`);
    timerComponents.push(`${formatTime(timeLeft.s)}s`);
    return <div className="text-xs font-bold tabular-nums">{timerComponents.join(':')}</div>;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (!totalPages || totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600 transition"><ArrowLeft size={16} /></button>
            <span className="text-gray-400">Página {currentPage} de {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600 transition"><ArrowRight size={16} /></button>
        </div>
    );
};

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
            <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
    );
};


const formatDate = (value) => {
    return value
        .replace(/\D/g, '')       // Remove tudo que não for dígito
        .replace(/(\d{2})(\d)/, '$1/$2') // Adiciona / após os 2 primeiros dígitos (DD)
        .replace(/(\d{2})(\d)/, '$1/$2') // Adiciona / após os 2 próximos dígitos (MM)
        .substring(0, 10);        // Limita a 10 caracteres (DD/MM/AAAA)
};

const ForgotPasswordPage = ({ setPage }) => {
    const [step, setStep] = React.useState(1);
    const [cpf, setCpf] = React.useState('');
    const [birthDate, setBirthDate] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    // --- MÁSCARAS ---
    const formatCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
    const formatDate = (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 10);

    const handleCpfChange = (e) => setCpf(formatCPF(e.target.value));
    const handleDateChange = (e) => setBirthDate(formatDate(e.target.value));

    const handleVerifyUser = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        const [day, month, year] = birthDate.split('/');
        const birthDateForBackend = `${year}-${month}-${day}`;
        
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-user`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ cpf, birth_date: birthDateForBackend })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Dados incorretos.');
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); return; }
        if (newPassword.length < 6) { setError('Mínimo de 6 caracteres.'); return; }
        setIsLoading(true); setError(''); setSuccess('');
        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ cpf, newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao alterar.');
            setSuccess('Senha alterada com sucesso!');
            setTimeout(() => setPage('login'), 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                
                .slide-in { animation: slideUp 0.5s ease-out forwards; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .progress-bar {
                    height: 6px;
                    background: #f3f4f6;
                    border-radius: 10px;
                    overflow: hidden;
                    width: 120px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #cb6ce6, #a855f7);
                    transition: width 0.4s ease;
                }
            `}</style>

            {/* Top Bar / Header */}
            <div className="p-6 pt-12 flex flex-col items-center">
                <button 
                    onClick={() => setPage('login')}
                    className="self-start p-3 bg-gray-50 rounded-2xl text-gray-400 active:scale-90 transition-transform mb-6"
                >
                    <ArrowLeft size={24} />
                </button>
                
                <h2 className="text-3xl font-extrabold-id text-gray-950 uppercase tracking-tighter italic leading-none text-center">
                    Recuperar <br /> <span className="text-[#cb6ce6]">Acesso</span>
                </h2>

                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: step === 1 ? '50%' : '100%' }}></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {success ? 'Concluído' : `Passo ${step} de 2`}
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-8 pb-12">
                <div className="max-w-md mx-auto w-full slide-in">
                    
                    {step === 1 && (
                        <form onSubmit={handleVerifyUser} className="space-y-5">
                            <p className="text-gray-500 text-sm font-semibold text-center mb-8 px-4">
                                Confirme seus dados para validar sua identidade com segurança.
                            </p>

                            <div className="relative flex items-center group">
                                <User className="absolute left-5 text-gray-300 group-focus-within:text-[#cb6ce6] transition-colors" size={22} />
                                <input 
                                    type="tel" 
                                    placeholder="Seu CPF" 
                                    value={cpf} 
                                    onChange={handleCpfChange}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-4 font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#cb6ce6]/10 focus:border-[#cb6ce6]/40 transition-all"
                                    required 
                                />
                            </div>

                            <div className="relative flex items-center group">
                                <Calendar className="absolute left-5 text-gray-300 group-focus-within:text-[#cb6ce6] transition-colors" size={22} />
                                <input 
                                    type="tel" 
                                    placeholder="Nascimento (DD/MM/AAAA)"
                                    value={birthDate} 
                                    onChange={handleDateChange}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-4 font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#cb6ce6]/10 focus:border-[#cb6ce6]/40 transition-all"
                                    required 
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-500 text-[11px] font-black uppercase p-4 rounded-xl text-center border border-red-100 slide-in">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-gray-950 text-white font-extrabold-id uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-gray-200 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Verificar Identidade'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {!success ? (
                                <>
                                    <div className="bg-purple-50 p-5 rounded-3xl flex items-center gap-4 mb-6 border border-purple-100">
                                        <div className="bg-white p-2 rounded-xl text-[#cb6ce6] shadow-sm">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <p className="text-[11px] text-purple-700 font-bold uppercase leading-tight">
                                            Identidade confirmada! <br />Escolha uma senha forte abaixo.
                                        </p>
                                    </div>

                                    <div className="relative flex items-center group">
                                        <Lock className="absolute left-5 text-gray-300 group-focus-within:text-[#cb6ce6] transition-colors" size={22} />
                                        <input 
                                            type="password" 
                                            placeholder="Nova Senha" 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-4 font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#cb6ce6]/10 focus:border-[#cb6ce6]/40 transition-all"
                                            required 
                                        />
                                    </div>

                                    <div className="relative flex items-center group">
                                        <Lock className="absolute left-5 text-gray-300 group-focus-within:text-[#cb6ce6] transition-colors" size={22} />
                                        <input 
                                            type="password" 
                                            placeholder="Confirmar Nova Senha" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-4 font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#cb6ce6]/10 focus:border-[#cb6ce6]/40 transition-all"
                                            required 
                                        />
                                    </div>

                                    {error && <div className="text-red-500 text-[11px] font-black uppercase text-center p-2">{error}</div>}

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full bg-[#cb6ce6] text-white font-extrabold-id uppercase tracking-widest py-5 rounded-2xl shadow-2xl shadow-[#cb6ce6]/30 active:scale-95 transition-all"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Atualizar Senha'}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 slide-in">
                                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h3 className="text-xl font-extrabold-id text-gray-900 uppercase italic">Sucesso!</h3>
                                    <p className="text-gray-500 font-semibold text-center mt-2">Sua senha foi redefinida.<br/>Redirecionando para o login...</p>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-8 text-center">
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                    Segurança ponta a ponta • OwnMarket
                </p>
            </div>
        </div>
    );
};
// ============================================================================
// COMPONENTES AUXILIARES (COLE ANTES DA HOMEPAGE)
// ============================================================================


// --- COMPONENTE: MODAL DE LOGIN DO ADMIN (CLEAN & BRIGHT) ---
const AdminLoginModal = ({ show, onClose, onAdminLogin }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // Se o modal não estiver visível, não renderiza nada
    if (!show) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Requisição para a API de login de administrador
            // Ajuste a URL se necessário (ex: /api/auth/admin-login)
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            // Proteção contra respostas HTML (erro 404/500)
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error("Erro do Servidor (HTML recebido):", responseText);
                throw new Error("Erro de conexão com o servidor.");
            }

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao autenticar.');
            }

            // Sucesso
            localStorage.setItem('adminToken', data.token); // Salva o token se necessário
            onAdminLogin(data.token, data.user); // Passa os dados para o App.js
            onClose(); // Fecha o modal

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast backdrop-blur-sm">
            {/* Card Branco Clean - OwnMarket Style */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 w-full max-w-sm text-gray-900 animate-scale-up relative">
                
                {/* Botão Fechar */}
                <button 
                    onClick={onClose} 
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center mb-6 mt-2">
                    {/* Ícone de Escudo em Roxo Suave */}
                    <div className="w-14 h-14 bg-purple-50 text-[#cb6ce6] rounded-full flex items-center justify-center mb-4">
                        <Shield size={26} />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Acesso Restrito</h2>
                    <p className="text-sm text-gray-500 mt-1">Painel Administrativo</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Input Usuário */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Utilizador" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#cb6ce6] focus:border-transparent transition-all placeholder-gray-400" 
                            required 
                        />
                    </div>

                    {/* Input Senha */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" />
                        </div>
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#cb6ce6] focus:border-transparent transition-all placeholder-gray-400" 
                            required 
                        />
                    </div>
                    
                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl border border-red-100 text-center font-medium">
                            {error}
                        </div>
                    )}
                    
                    {/* Botão Entrar */}
                    <button 
                        type="submit" 
                        className="w-full bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#cb6ce6]/25 transform active:scale-[0.98] flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar no Painel'}
                    </button>
                </form>
                
                <div className="mt-8 text-center border-t border-gray-100 pt-5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Área Segura</p>
                </div>
            </div>
        </div>
    );
};

const LoginPage = ({ onLogin, onAdminLogin, onSwitchToRegister, setPage }) => {
    // --- ESTADOS (LÓGICA INTACTA) ---
    const [cpf, setCpf] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    
    // ESTADO PARA CONTROLAR O MODAL DO ADMIN
    const [showAdminModal, setShowAdminModal] = React.useState(false);

    // Formata CPF
    const handleCpfChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        setCpf(value);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault(); 
        setIsLoading(true); 
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ cpf, password })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Credenciais inválidas.'); }
            onLogin(data.token, data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Modal de Gestor */}
            <AdminLoginModal 
                show={showAdminModal} 
                onClose={() => setShowAdminModal(false)} 
                onAdminLogin={onAdminLogin} 
            />

            {/* Injeção de Estilos para Fontes e Animações */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                
                @keyframes fade-slide-up {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-slide {
                    animation: fade-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* Fundo Fullscreen Mobile Moderno */}
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] font-sans relative overflow-hidden">
                
                {/* Elementos Decorativos de Fundo */}
                <div className="absolute top-[-15%] right-[-20%] w-[300px] h-[300px] bg-[#cb6ce6]/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[250px] h-[250px] bg-[#cb6ce6]/10 rounded-full blur-[80px] pointer-events-none"></div>

                {/* --- LOGO CENTRALIZADA NO TOPO (Fora do Card) --- */}
                <div className="w-full flex justify-center pt-10 pb-6 z-10 animate-fade-slide">
                    <img 
                        src="https://i.imgur.com/Lo5PXP2.png" 
                        alt="OwnMarket" 
                        className="h-16 object-contain"
                    />
                </div>

                {/* --- CARD DO FORMULÁRIO --- */}
                <div 
                    className="w-full max-w-[360px] px-5 z-10 animate-fade-slide" 
                    style={{ animationDelay: '0.1s', opacity: 0 }}
                >
                    <div className="bg-white rounded-[32px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] border border-white/60 p-7 relative">
                        
                        {/* Título Discreto e Pequeno (Dentro do Card) */}
                        <div className="text-center mb-6">
                            <h2 className="text-[11px] font-extrabold-id text-gray-400 uppercase tracking-widest">
                                Acessar Conta
                            </h2>
                        </div>
                        
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            
                            {/* Input CPF */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors z-10">
                                    <User className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="CPF"
                                    value={cpf}
                                    onChange={handleCpfChange}
                                    maxLength={14}
                                    className="w-full bg-[#F8FAFC] border-2 border-transparent text-gray-900 text-sm font-bold rounded-2xl focus:border-[#cb6ce6]/30 focus:bg-white focus:shadow-[0_4px_15px_rgba(203,108,230,0.06)] block pl-11 py-4 pr-4 placeholder-gray-400 transition-all outline-none"
                                    required
                                    inputMode="numeric"
                                />
                            </div>

                            {/* Input Senha */}
                            <div className="space-y-1.5">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors z-10">
                                        <Lock className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#F8FAFC] border-2 border-transparent text-gray-900 text-sm font-bold rounded-2xl focus:border-[#cb6ce6]/30 focus:bg-white focus:shadow-[0_4px_15px_rgba(203,108,230,0.06)] block pl-11 py-4 pr-4 placeholder-gray-400 transition-all outline-none"
                                        required
                                    />
                                </div>
                                
                                {/* Link Esqueceu a Senha */}
                                <div className="flex justify-end pr-1 pt-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setPage('forgot-password')} 
                                        className="text-[10px] font-bold text-[#cb6ce6] hover:text-[#b85cd3] tracking-wide transition-colors"
                                    >
                                        Esqueci a senha
                                    </button>
                                </div>
                            </div>

                            {/* Mensagem de Erro */}
                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center animate-pulse">
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            {/* Botão Principal Entrar */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg shadow-[#cb6ce6]/25 text-sm font-extrabold-id uppercase tracking-widest text-white bg-[#cb6ce6] active:scale-95 disabled:opacity-50 transition-all mt-6"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <span className="flex items-center gap-2">ENTRAR</span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Botão de Cadastrar Fora do Card */}
                    <div className="mt-5 flex flex-col items-center">
                        <button 
                            onClick={onSwitchToRegister} 
                            className="w-full py-4 rounded-2xl bg-transparent border-2 border-gray-200 text-gray-500 font-extrabold-id uppercase tracking-widest text-xs active:bg-gray-100 transition-all"
                        >
                            Criar Conta
                        </button>
                    </div>
                </div>

                {/* --- RODAPÉ ULTRA DISCRETO --- */}
                <div 
                    className="mt-auto pb-6 pt-10 flex flex-col items-center justify-center z-10 animate-fade-slide" 
                    style={{ animationDelay: '0.2s', opacity: 0 }}
                >
                    <button 
                        onClick={() => setShowAdminModal(true)} 
                        className="flex items-center gap-1.5 text-gray-300/60 hover:text-gray-400 transition-colors py-2 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest active:bg-transparent"
                    >
                        <Shield size={10} strokeWidth={2.5}/> Acesso Gestor
                    </button>
                    
                    <div className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-1">
                        &copy; {new Date().getFullYear()} OwnMarket.
                    </div>
                </div>

            </div>
        </>
    );
};

// Componente de Input Premium criado para acompanhar o novo visual
const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative flex items-center w-full group">
        <div className="absolute left-5 text-gray-300 group-focus-within:text-[#cb6ce6] transition-colors duration-300">
            {Icon && <Icon size={22} strokeWidth={2.5} />}
        </div>
        <input
            {...props}
            className="w-full bg-gray-50/80 border border-gray-100 text-gray-800 text-[15px] font-semibold placeholder-gray-400 rounded-[20px] pl-14 pr-5 py-4 outline-none focus:bg-white focus:border-[#cb6ce6]/40 focus:ring-4 focus:ring-[#cb6ce6]/10 transition-all duration-300"
        />
    </div>
);

const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
    const [step, setStep] = React.useState(1);
    const [formData, setFormData] = React.useState({ 
        name: '', cpf: '', email: '', phone_number: '', birthDate: '', 
        apartmentBlock: '', apartmentNumber: '', 
        password: '', confirmPassword: '', terms: false 
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('Seja bem vindo ao OwnMarket');

    const formatCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
    const formatPhone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2").slice(0, 15);
    const formatDate = (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 10);
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validateCPF = (cpf) => cpf.length === 14;

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    const handleCpfChange = (e) => { setFormData({ ...formData, cpf: formatCPF(e.target.value) }); };
    const handlePhoneChange = (e) => { setFormData({ ...formData, phone_number: formatPhone(e.target.value) }); };
    const handleDateChange = (e) => { setFormData({ ...formData, birthDate: formatDate(e.target.value) }); };

    const handleRegisterSubmit = async () => {
        setError('');
        if (!validateCPF(formData.cpf)) { setError('CPF inválido.'); return; }
        if (!validateEmail(formData.email)) { setError('Formato de e-mail inválido.'); return; }
        setIsLoading(true);
        
        try {
            const API_URL = window.API_URL || 'http://localhost:5000';
            
            // TRADUÇÃO EXATA PARA O SEU BACK-END
            const payload = {
                name: formData.name,
                cpf: formData.cpf, 
                email: formData.email,
                password: formData.password,
                phone_number: formData.phone_number, // Match exato
                birth_date: formData.birthDate.split('/').reverse().join('-'), // "birth_date" em formato SQL (YYYY-MM-DD)
                apartment: `${formData.apartmentBlock} - ${formData.apartmentNumber}` // "apartment" juntando Bloco e Número
            };

            const response = await fetch(`${API_URL}/api/auth/register`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Pega a mensagem de erro específica do Back-end (Ex: CPF já cadastrado)
                throw new Error(data.message || 'Erro ao criar conta no servidor.');
            }

            setIsLoading(false);
            setShowSuccessAnimation(true);
            setTimeout(() => {
                setSuccessMessage('Boas compras!');
                setTimeout(() => { if (onSwitchToLogin) onSwitchToLogin(); }, 2000);
            }, 2500);

        } catch (err) {
            setError(err.message || 'Erro de comunicação com o servidor.');
            setIsLoading(false);
        }
    }
    
    const validateStep1 = () => {
        if (!formData.name || !validateEmail(formData.email) || formData.cpf.length !== 14 || formData.phone_number.length < 14 || formData.birthDate.length !== 10) return false;
        const [day, month, year] = formData.birthDate.split('/');
        return !(!day || !month || !year || year.length !== 4);
    };
    const validateStep2 = () => formData.apartmentBlock.trim() && formData.apartmentNumber.trim();
    const validateStep3 = () => formData.password.length >= 6 && formData.password === formData.confirmPassword && formData.terms;

    // Calcula a largura da barra de progresso
    const progressWidth = `${(step / 3) * 100}%`;

    return (
        <div className="min-h-screen w-full flex flex-col bg-white font-sans overflow-x-hidden selection:bg-[#cb6ce6]/20">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                
                @keyframes fluid-wave {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    50% { transform: translateX(0%) skewX(-15deg); }
                    100% { transform: translateX(100%) skewX(-15deg); }
                }
                .liquid-fill {
                    background: linear-gradient(90deg, #cb6ce6, #a855f7);
                    height: 100%;
                    transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1);
                    position: relative;
                    overflow: hidden;
                    border-radius: 99px;
                }
                .liquid-fill::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: fluid-wave 2s infinite linear;
                }
                .slide-enter { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes slide-in {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {showSuccessAnimation ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-gray-50">
                    <div className="w-28 h-28 bg-gradient-to-tr from-[#cb6ce6] to-[#a855f7] rounded-[2rem] rotate-3 flex items-center justify-center mb-10 shadow-2xl shadow-[#cb6ce6]/40 animate-bounce transition-all">
                        <Check size={56} className="text-white -rotate-3" />
                    </div>
                    <h2 className="text-4xl font-extrabold-id text-gray-900 mb-3 uppercase tracking-tighter italic">PRONTO!</h2>
                    <p className="text-gray-500 font-semibold text-lg leading-tight px-4 animate-pulse">{successMessage}</p>
                 </div>
            ) : (
                <div className="flex-1 flex flex-col relative">
                    
                    {/* Header Mobile Otimizado */}
                    <div className="pt-12 pb-6 px-6 flex flex-col items-center text-center bg-white z-10">
                        <img src="https://i.ibb.co/jkyLRP0T/Screenshot-4.png" className="h-8 mb-8 object-contain" alt="OwnMarket" />
                        
                        <h2 className="text-[2.5rem] font-extrabold-id text-gray-900 uppercase tracking-tighter italic leading-[0.9]">
                            CRIAR <br/> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cb6ce6] to-[#a855f7]">
                                CONTA
                            </span>
                        </h2>
                        
                        {/* Barra de Progresso Liquid */}
                        <div className="w-full max-w-[200px] h-2 bg-gray-100 rounded-full mt-8 overflow-hidden shadow-inner">
                            <div className="liquid-fill" style={{ width: progressWidth }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3">
                            Passo {step} de 3
                        </p>
                    </div>

                    {/* Conteúdo do Formulário */}
                    <div className="flex-1 px-6 pb-12 w-full max-w-md mx-auto">
                        <div className="w-full">
                            {step === 1 && (
                                <div className="space-y-4 slide-enter">
                                    <InputField icon={User} name="name" placeholder="Nome Completo" value={formData.name} onChange={handleChange} />
                                    <InputField icon={Mail} name="email" placeholder="Seu E-mail" value={formData.email} onChange={handleChange} type="email" />
                                    <InputField icon={FileText} name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleCpfChange} maxLength={14} type="tel" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField icon={Calendar} name="birthDate" placeholder="Data Nasc." value={formData.birthDate} onChange={handleDateChange} maxLength={10} type="tel" />
                                        <InputField icon={Phone} name="phone_number" placeholder="Celular" value={formData.phone_number} onChange={handlePhoneChange} maxLength={15} type="tel" />
                                    </div>
                                    <div className="pt-4">
                                        <button onClick={() => setStep(2)} disabled={!validateStep1()} className="w-full bg-gray-900 text-white font-extrabold-id uppercase tracking-widest text-sm py-5 rounded-[20px] hover:bg-black active:scale-[0.98] transition-all duration-300 disabled:opacity-30 shadow-xl shadow-gray-900/20">
                                            Próximo Passo
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 slide-enter">
                                    <div className="bg-purple-50/50 p-5 rounded-[24px] border border-purple-100/50 flex items-center gap-4 mb-2">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm text-[#cb6ce6]">
                                            <Building2 size={24} strokeWidth={2.5} />
                                        </div>
                                        <p className="text-[11px] text-gray-600 font-bold uppercase tracking-tight leading-snug">
                                            Identifique sua unidade para liberar acesso imediato à loja.
                                        </p>
                                    </div>
                                    <InputField icon={Building2} name="apartmentBlock" placeholder="Bloco ou Edifício" value={formData.apartmentBlock} onChange={handleChange} />
                                    <InputField icon={Home} name="apartmentNumber" placeholder="Número da Unidade" value={formData.apartmentNumber} onChange={handleChange} type="number" />
                                    
                                    <div className="flex flex-col gap-4 pt-4">
                                        <button onClick={() => setStep(3)} disabled={!validateStep2()} className="w-full bg-gray-900 text-white font-extrabold-id uppercase tracking-widest text-sm py-5 rounded-[20px] active:scale-[0.98] transition-all duration-300 disabled:opacity-30 shadow-xl shadow-gray-900/20">
                                            Confirmar Local
                                        </button>
                                        <button onClick={() => setStep(1)} className="text-gray-400 font-bold uppercase text-[11px] tracking-widest text-center py-2 active:text-gray-600 transition-colors">
                                            Voltar ao início
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4 slide-enter">
                                    <InputField icon={Lock} name="password" type="password" placeholder="Criar Senha (min. 6 char)" value={formData.password} onChange={handleChange} />
                                    <InputField icon={Lock} name="confirmPassword" type="password" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} />
                                    
                                    <label className="flex items-center gap-4 bg-gray-50/80 p-5 rounded-[20px] mt-2 cursor-pointer active:bg-gray-100 border border-gray-100 focus-within:border-[#cb6ce6]/40 transition-all">
                                        <div className="relative flex items-center justify-center">
                                            <input type="checkbox" checked={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-xl checked:bg-[#cb6ce6] checked:border-[#cb6ce6] transition-all flex-shrink-0" />
                                            <Check size={16} strokeWidth={3} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                        </div>
                                        <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight leading-snug">
                                            Aceito os termos de segurança e privacidade OwnMarket.
                                        </span>
                                    </label>

                                    {error && (
                                        <div className="text-red-600 font-bold text-[11px] uppercase bg-red-50 p-4 rounded-2xl text-center border border-red-100 animate-pulse">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col gap-4 pt-4">
                                        <button onClick={handleRegisterSubmit} disabled={!validateStep3() || isLoading} className="w-full bg-gradient-to-r from-[#cb6ce6] to-[#a855f7] text-white font-extrabold-id uppercase tracking-widest text-sm py-5 rounded-[20px] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 shadow-xl shadow-[#cb6ce6]/40 relative overflow-hidden">
                                            {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Finalizar Cadastro'}
                                        </button>
                                        <button onClick={() => setStep(2)} className="text-gray-400 font-bold uppercase text-[11px] tracking-widest text-center py-2 active:text-gray-600 transition-colors">
                                            Revisar Endereço
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Fixo */}
                    <div className="mt-auto p-6 text-center border-t border-gray-50 bg-white/80 backdrop-blur-md">
                        <button onClick={onSwitchToLogin} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest active:scale-95 transition-transform">
                            Já possui uma conta? <span className="text-[#cb6ce6] ml-1 border-b-2 border-[#cb6ce6]/30 pb-0.5">Entrar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};



const BannerCarousel = () => {
    // Configurações do carrossel
    const settings = {
        dots: true, // Mostra os pontinhos de navegação em baixo
        infinite: true, // O carrossel volta ao início quando chega ao fim
        speed: 500, // Velocidade da transição em milissegundos
        slidesToShow: 1, // Mostra 1 banner de cada vez
        slidesToScroll: 1, // Passa 1 banner de cada vez
        autoplay: true, // Passa os banners automaticamente
        autoplaySpeed: 3000, // Muda de banner a cada 3 segundos
        arrows: false // Esconde as setas laterais para um visual mais limpo
    };

    // Dados dos banners (substitua pelas suas imagens)
    const banners = [
        { id: 1, imageUrl: 'https://i.imgur.com/BWhKz2n.png' },
        { id: 2, imageUrl: 'https://i.imgur.com/X5TpUD9.png' },
        { id: 3, imageUrl: 'https://i.imgur.com/hQrNGQf.png' }
    ];

    return (
        <div className="mb-8">
            <Slider {...settings}>
                {banners.map(banner => (
                    <div key={banner.id}>
                        <img 
                            src={banner.imageUrl} 
                            alt={`Banner ${banner.id}`} 
                            className="w-full h-auto object-cover rounded-lg"
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

const formatName = (name) => {
    if (!name) return 'Visitante';
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1).toLowerCase();
};

const ProductCard = ({ product, addToCart }) => {
    
    // --- LÓGICA DETETIVE DE PROMOÇÃO ---
    // Pega todos os possíveis nomes que seu banco de dados pode estar usando
    const pSale = parseFloat(product.sale_price);
    const pPromo = parseFloat(product.promotional_price);
    const pBase = parseFloat(product.price); 
    const pRegular = parseFloat(product.regular_price);

    // 1. Descobre o preço atual (o que o cliente vai pagar)
    let currentPrice = pSale;
    if (!isNaN(pPromo) && pPromo > 0 && pPromo < pSale) {
        currentPrice = pPromo;
    }

    // 2. Descobre o preço antigo (para ficar riscado na tela)
    let oldPrice = pSale;
    if (!isNaN(pBase) && pBase > currentPrice) oldPrice = pBase;
    else if (!isNaN(pRegular) && pRegular > currentPrice) oldPrice = pRegular;
    else if (!isNaN(pSale) && pSale > currentPrice) oldPrice = pSale;

    // 3. É promoção se o preço antigo for maior que o preço atual, 
    // OU se o painel administrativo enviar a palavra "PROMO"
    const isPromo = (oldPrice > currentPrice) || product.status === 'PROMO' || product.status === 'promo';

    return (
        <div className="group relative bg-white rounded-[24px] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center hover:shadow-[0_8px_30px_rgba(203,108,230,0.15)] hover:border-[#cb6ce6]/30 transition-all duration-300 overflow-hidden h-full">
            
            {/* TAG PROMOCIONAL DESTACADA */}
            {isPromo && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[8px] font-extrabold-id px-2 py-1.5 rounded-lg uppercase tracking-widest z-20 shadow-md shadow-red-500/30 flex items-center gap-1 animate-fade-in">
                    <Zap size={10} className="animate-pulse" fill="currentColor" />
                    OFERTA
                </div>
            )}

            {/* Imagem do Produto com Fundo Clean e Efeito Multiply */}
            <div className="w-full aspect-square bg-[#F8FAFC] rounded-[16px] mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-[#cb6ce6]/5 transition-colors border border-transparent group-hover:border-[#cb6ce6]/10 cursor-pointer" onClick={() => addToCart(product)}>
                {product.image_url ? (
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply relative z-10" 
                        loading="lazy"
                    />
                ) : (
                    <Package size={40} strokeWidth={1.5} className="text-gray-300 relative z-10" />
                )}
            </div>
            
            {/* Informações do Produto */}
            <div className="w-full flex flex-col flex-1 px-1">
                <h3 className="font-extrabold-id text-[13px] sm:text-sm text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-[#cb6ce6] transition-colors cursor-pointer" onClick={() => addToCart(product)}>
                    {product.name}
                </h3>
                
                {product.category && (
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 truncate">
                        {product.category}
                    </p>
                )}

                {/* Bloco de Preço e Botões */}
                <div className="mt-auto flex flex-col w-full pt-3 border-t border-gray-50 relative z-20">
                    
                    {/* Preços Dinâmicos */}
                    {isPromo && oldPrice > currentPrice ? (
                        <div className="flex flex-col mb-3 cursor-pointer" onClick={() => addToCart(product)}>
                            <span className="text-[10px] text-gray-400 line-through font-bold">R$ {oldPrice.toFixed(2).replace('.', ',')}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-extrabold-id text-[#cb6ce6] uppercase">R$</span>
                                <span className="text-[#cb6ce6] font-black text-xl tracking-tighter leading-none">{currentPrice.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-1 mb-3 cursor-pointer" onClick={() => addToCart(product)}>
                            <span className="text-[10px] font-extrabold-id text-gray-400 uppercase">R$</span>
                            <span className="text-gray-900 font-black text-xl tracking-tighter leading-none group-hover:text-[#cb6ce6] transition-colors">{currentPrice.toFixed(2).replace('.', ',')}</span>
                        </div>
                    )}
                    
                    {/* Botões: Comprar & Adicionar Carrinho */}
                    <div className="flex items-center gap-2 w-full mt-auto">
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                addToCart(product); 
                                // Se você passa essa prop pelo map na HomePage:
                                // window.location.href='/cart' ou sua função de abrir carrinho aqui.
                            }}
                            className="flex-1 bg-[#cb6ce6] text-white h-9 rounded-[12px] font-extrabold-id text-[10px] uppercase tracking-widest transition-all shadow-sm shadow-[#cb6ce6]/20 hover:bg-[#b85cd3] active:scale-95 flex items-center justify-center"
                        >
                            Comprar
                        </button>
                        
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                addToCart(product); 
                            }}
                            className="w-9 h-9 shrink-0 rounded-[12px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#cb6ce6] hover:text-white hover:border-[#cb6ce6] transition-all shadow-sm active:scale-90"
                            title="Adicionar ao Carrinho"
                        >
                            <Plus size={18} strokeWidth={3} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const HeroBanner = ({ user, currentCondo, setPage, searchQuery, setSearchQuery, isSearchLoading }) => {

    const marqueeStyle = `
        @keyframes scroll-led {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-led {
            display: flex;
            animation: scroll-led 20s linear infinite;
        }
    `;

    // Lógica para definir se o Ponto é masculino ou feminino baseado no nome
    const condoName = currentCondo?.name || 'Freezer';
    const getArticle = (name) => {
        const firstWord = name.split(' ')[0].toLowerCase();
        // Palavras femininas comuns em pontos de venda
        if (firstWord === 'geladeira' || firstWord === 'máquina' || firstWord === 'maquina' || firstWord.endsWith('a')) {
            return { prefix: 'A', suffix: 'abastecida', noun: '' };
        }
        return { prefix: 'O ponto', suffix: 'abastecido', noun: '' };
    };

    const grammar = getArticle(condoName);

    return (
        <div className="relative rounded-[32px] overflow-hidden mb-8 shadow-2xl bg-gradient-to-br from-[#8b3d9c] to-[#cb6ce6] border border-white/20">
            <style>{marqueeStyle}</style>

            {/* Imagem de Fundo (Opcional, com blend sutil) */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none"></div>
            
            {/* Gradiente de transição para o texto e barra de pesquisa */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#601c6e]/80 via-[#cb6ce6]/50 to-transparent pointer-events-none"></div>

            <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-between h-full">
                
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold-id text-white tracking-tighter leading-none mb-2">
                        Olá, <span className="text-yellow-300 capitalize">{user?.name?.split(' ')[0]?.toLowerCase() || 'Visitante'}</span>!
                    </h1>
                    <p className="text-white/80 font-bold text-[11px] uppercase tracking-widest leading-relaxed max-w-sm">
                        Bateu aquela fome? {grammar.prefix} <span className="text-white bg-white/20 px-2 py-0.5 rounded-md mx-1">{condoName}</span> está {grammar.suffix}.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    
                    {/* BARRA DE PESQUISA (Translúcida Branca) */}
                    <div className="relative group w-full max-w-xl">
                        <div className="relative bg-white/20 backdrop-blur-md shadow-sm rounded-2xl flex items-center px-4 py-3.5 border border-white/30 focus-within:border-white transition-all hover:bg-white/30">
                            <Search className="text-white shrink-0" size={20} strokeWidth={2.5}/>
                            <input 
                                type="text" 
                                placeholder="O que você procura hoje?" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none text-white placeholder-white/70 text-sm font-bold px-3 focus:ring-0 outline-none"
                            />
                            {isSearchLoading && <Loader2 className="animate-spin text-white shrink-0" size={20} />}
                            {searchQuery && !isSearchLoading && (
                                <button onClick={() => setSearchQuery('')} className="text-white/70 hover:text-white transition-colors p-1 bg-white/10 rounded-full">
                                    <X size={14} strokeWidth={3}/>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-2">
                        
                        {/* 1. BOTÃO DE SALDO (Branco) */}
                        <button 
                            onClick={() => setPage('wallet')} 
                            className="group relative flex items-center gap-3.5 bg-white px-5 py-4 rounded-2xl transition-all duration-300 hover:bg-gray-50 active:scale-95 w-full sm:w-fit shrink-0 shadow-lg shadow-black/10"
                        >
                            <div className="relative p-2.5 bg-[#cb6ce6]/10 rounded-xl border border-[#cb6ce6]/20 transition-colors text-[#cb6ce6]">
                                <Wallet size={20} strokeWidth={2.5}/>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-0.5 group-hover:text-[#cb6ce6] transition-colors">
                                    Seu Saldo
                                </p>
                                <p className="text-xl font-black text-gray-900 tracking-tight leading-none">
                                    R$ {parseFloat(user?.wallet_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </button>

                        {/* 2. AVISOS ROTATIVOS (LETREIRO NO MESMO TOM) */}
                        <div className="flex-1 min-h-[72px] relative bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden flex items-center shadow-lg shadow-black/10 w-full">
                            
                            <div className="absolute left-4 z-20 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </div>

                            {/* O Texto Rolante */}
                            <div className="relative z-0 w-full overflow-hidden flex items-center py-2 ml-6">
                                <div className="animate-led whitespace-nowrap">
                                    
                                    {/* BLOCO 1 DE MENSAGENS COM ÍCONES SVG */}
                                    <span className="font-extrabold-id text-[10px] md:text-xs tracking-widest uppercase px-4 flex items-center gap-6">
                                        <span className="text-white flex items-center gap-1.5"><Sparkles size={14} strokeWidth={3}/> BOAS COMPRAS!</span>
                                        <span className="text-white bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Video size={14} strokeWidth={2.5}/> VOCÊ ESTÁ SENDO FILMADO</span>
                                        <span className="text-yellow-300 bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><AlertTriangle size={14} strokeWidth={2.5}/> RETIRE APENAS O QUE FOI PAGO</span>
                                        <span className="text-white bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Eye size={14} strokeWidth={2.5}/> AÇÃO MONITORADA</span>
                                        <span className="text-white flex items-center gap-1.5"><Smile size={14} strokeWidth={2.5}/> VOLTE SEMPRE!</span>
                                    </span>

                                    {/* BLOCO 2 DE MENSAGENS (DUPLICADO PARA O LOOP CONTÍNUO) */}
                                    <span className="font-extrabold-id text-[10px] md:text-xs tracking-widest uppercase px-4 flex items-center gap-6">
                                        <span className="text-white flex items-center gap-1.5"><Sparkles size={14} strokeWidth={3}/> BOAS COMPRAS!</span>
                                        <span className="text-white bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Video size={14} strokeWidth={2.5}/> VOCÊ ESTÁ SENDO FILMADO</span>
                                        <span className="text-yellow-300 bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><AlertTriangle size={14} strokeWidth={2.5}/> RETIRE APENAS O QUE FOI PAGO</span>
                                        <span className="text-white bg-black/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Eye size={14} strokeWidth={2.5}/> AÇÃO MONITORADA</span>
                                        <span className="text-white flex items-center gap-1.5"><Smile size={14} strokeWidth={2.5}/> VOLTE SEMPRE!</span>
                                    </span>

                                </div>
                            </div>
                            
                            {/* Esmaecimento nas bordas */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#b359cd]/80 to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#b359cd]/80 to-transparent z-10 pointer-events-none"></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const SearchBar = ({ searchQuery, setSearchQuery, isSearchLoading, searchResults, addToCart }) => (
    <div className="relative max-w-2xl mx-auto -mt-14 mb-10 z-20 px-4">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-gray-800 rounded-xl shadow-2xl flex items-center p-2 border border-gray-700">
                <Search className="text-gray-400 ml-3" size={24} />
                <input 
                    type="text" 
                    placeholder="O que você procura hoje?" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-white text-lg px-4 py-2 focus:ring-0 placeholder-gray-500 outline-none"
                />
                {isSearchLoading && <Loader2 className="animate-spin text-orange-500 mr-3" />}
            </div>
            
            {/* Resultados da Busca */}
            {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    {searchResults.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => { addToCart(item); setSearchQuery(''); }}
                            className="p-3 hover:bg-gray-700 flex items-center gap-3 cursor-pointer border-b border-gray-700/50 last:border-0"
                        >
                            <img src={item.image_url || 'https://placehold.co/50'} className="w-10 h-10 rounded object-cover" alt="" />
                            <div>
                                <p className="font-bold text-white text-sm">{item.name}</p>
                                <p className="text-orange-400 text-xs font-bold">R$ {parseFloat(item.sale_price).toFixed(2)}</p>
                            </div>
                            <Plus size={16} className="ml-auto text-gray-400" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const InstructionsCarousel = () => {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    
    const steps = [
        {
            icon: <MapPin size={32} className="text-orange-400" />,
            title: "Escolha sua Máquina",
            desc: "Selecione 'Freezer' ou 'Geladeira' abaixo para ver os produtos disponíveis nesta unidade."
        },
        {
            icon: <ScanBarcode size={32} className="text-blue-400" />,
            title: "Selecione os Produtos",
            desc: "Navegue pelo catálogo visual e adicione suas bebidas e snacks favoritos ao carrinho."
        },
        {
            icon: <CreditCard size={32} className="text-green-400" />,
            title: "Pagamento Rápido",
            desc: "Use seu saldo na carteira com pagamento instantâneo na hora de finalizar."
        }
    ];

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % steps.length);
        }, 5000); // Aumentei um pouco para dar tempo de ler com calma
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="py-8 flex flex-col items-center justify-center w-full px-4">
            {/* Container Principal "Vidro" */}
            <div className="relative w-full max-w-lg bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden group">
                
                {/* Efeitos de Luz de Fundo (Ambient Light) */}
                <div className="absolute top-[-50%] left-[20%] w-48 h-48 bg-orange-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute bottom-[-50%] right-[20%] w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
                    
                    {/* Conteúdo com Animação (Key força o re-render da animação) */}
                    <div key={currentSlide} className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        
                        {/* Círculo do Ícone com Brilho */}
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-md transform scale-110"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-b from-white/10 to-white/5 rounded-full border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md">
                                {steps[currentSlide].icon}
                            </div>
                        </div>

                        {/* Textos */}
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                            {steps[currentSlide].title}
                        </h3>
                        <p className="text-gray-400 text-base leading-relaxed max-w-xs mx-auto">
                            {steps[currentSlide].desc}
                        </p>
                    </div>

                    {/* Indicadores / Paginação */}
                    <div className="flex items-center gap-3 mt-8">
                        {steps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`transition-all duration-500 ease-out rounded-full ${
                                    currentSlide === idx 
                                    ? 'w-10 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' 
                                    : 'w-1.5 h-1.5 bg-gray-600 hover:bg-gray-500'
                                }`}
                                aria-label={`Ir para passo ${idx + 1}`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};


const HomePage = ({ user, onLogout, cart, setCart, addToCart, setPage, onCondoSelected, condos }) => {
    // --- ESTADOS ---
    const [products, setProducts] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearchLoading, setIsSearchLoading] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('home');
    const [unreadCount, setUnreadCount] = React.useState(0);

    const handleNavChange = (tabId) => {
        setActiveTab(tabId);
        if (tabId !== 'profile') {
            setPage(tabId);
        } else {
            setMobileMenuOpen(true);
        }
    };

    // --- FETCH NOTIFICAÇÕES ---
    React.useEffect(() => {
        const fetchUnreadTickets = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const API_URL = window.API_URL || 'http://localhost:5000';
                const response = await fetch(`${API_URL}/api/user/tickets`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                if (response.ok) {
                    const data = await response.json();
                    const count = data.filter(t => !t.is_read).length;
                    setUnreadCount(count);
                }
            } catch (err) {
                console.error("Erro ao buscar notificações:", err);
            }
        };
        fetchUnreadTickets();
        const interval = setInterval(fetchUnreadTickets, 30000);
        return () => clearInterval(interval);
    }, []);

    // --- FETCH PRODUTOS ---
    React.useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true); 
            if (!user?.condoId) { setIsLoading(false); setProducts({}); return; }
            try {
                const API_URL = window.API_URL || 'http://localhost:5000';
                const response = await fetch(`${API_URL}/api/products?condoId=${user.condoId}`); 
                if (response.ok) { const data = await response.json(); setProducts(data); }
            } catch (err) { console.error(err); } 
            finally { setIsLoading(false); }
        };
        fetchProducts();
    }, [user?.condoId]); 

    // --- PESQUISA ---
    React.useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        setIsSearchLoading(true);
        const delay = setTimeout(async () => {
            try {
                const API_URL = window.API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/products/search?q=${searchQuery}&condoId=${user?.condoId}`);
                if (res.ok) { const data = await res.json(); setSearchResults(data); }
            } catch (err) { console.error(err); } 
            finally { setIsSearchLoading(false); }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery, user?.condoId]);

    const currentCondo = condos?.find(c => c.id === user?.condoId);

    // --- LÓGICA BLINDADA DE PREÇO E PROMOÇÃO ---
    const getProductPricing = (item) => {
        const pPromo = parseFloat(item.promotional_price);
        const pSale = parseFloat(item.sale_price);
        const pRegular = parseFloat(item.price || item.regular_price); // Caso o banco envie o preço cheio

        // Se veio qualquer valor no campo promocional maior que zero, FORÇA a ser promoção!
        const isPromo = !isNaN(pPromo) && pPromo > 0;
        
        const currentPrice = isPromo ? pPromo : pSale;
        
        // Tenta achar o preço antigo verdadeiro (maior valor possível)
        let oldPrice = pSale;
        if (pSale > pPromo) oldPrice = pSale;
        else if (!isNaN(pRegular) && pRegular > pPromo) oldPrice = pRegular;

        // Só mostra o preço antigo riscado se ele fizer sentido (for maior que o atual)
        const showOldPrice = isPromo && oldPrice > currentPrice;

        return { isPromo, currentPrice, oldPrice, showOldPrice };
    };

    // --- RENDERIZAÇÃO ---
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col selection:bg-[#cb6ce6]/20">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* HEADER SUPERIOR */}
            <header className="bg-gradient-to-b from-[#cb6ce6]/10 to-[#F8FAFC] pt-6 pb-2 relative flex items-center justify-center border-b border-transparent">
                <img 
                    src="https://i.imgur.com/Lo5PXP2.png" 
                    alt="OwnMarket" 
                    className="h-16 md:h-20 w-auto object-contain drop-shadow-md transition-transform hover:scale-105 duration-500" 
                />
                
                {unreadCount > 0 && (
                    <button 
                        onClick={() => setPage('my-tickets')} 
                        className="absolute right-4 top-6 w-10 h-10 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#cb6ce6] hover:border-[#cb6ce6]/30 transition-all active:scale-95 group shadow-sm"
                    >
                        <Bell size={20} className="group-hover:animate-bounce" />
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                            {unreadCount}
                        </span>
                    </button>
                )}
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 pb-36 md:pb-10 relative z-10">
                
                <HeroBanner 
                    user={user} 
                    currentCondo={currentCondo} 
                    setPage={setPage} 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isSearchLoading={isSearchLoading}
                />
                
                {/* RESULTADOS DA BUSCA */}
                {searchResults.length > 0 && searchQuery && (
                    <div className="mb-8 -mt-6 relative z-30 animate-fade-in">
                        <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <p className="text-[10px] font-extrabold-id text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Search size={14} className="text-[#cb6ce6]" strokeWidth={3} /> Resultados da Busca ({searchResults.length})
                                </p>
                            </div>
                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-3">
                                <div className="grid grid-cols-1 gap-2">
                                    {searchResults.map(item => {
                                        const { isPromo, currentPrice, oldPrice, showOldPrice } = getProductPricing(item);

                                        return (
                                            <div 
                                                key={item.id} 
                                                onClick={() => { addToCart(item); setSearchQuery(''); }} 
                                                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-100 relative overflow-hidden"
                                            >
                                                {/* TAG PROMOCIONAL DA BUSCA */}
                                                {isPromo && (
                                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[8px] font-extrabold-id px-1.5 py-0.5 rounded-md uppercase tracking-widest z-20 shadow-sm animate-fade-in">
                                                        <Zap size={8} className="inline mr-0.5 animate-pulse" /> Oferta
                                                    </div>
                                                )}

                                                <div className="relative w-16 h-16 shrink-0 rounded-[16px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply relative z-10" alt={item.name} />
                                                    ) : (
                                                        <Package size={24} className="text-gray-300 relative z-10"/>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <h4 className="font-extrabold-id text-gray-900 text-sm mb-1 truncate group-hover:text-[#cb6ce6] transition-colors">{item.name}</h4>
                                                    
                                                    {isPromo ? (
                                                        <div className="flex items-center gap-2">
                                                            {showOldPrice && <span className="text-[9px] text-gray-400 line-through font-bold">R$ {oldPrice.toFixed(2).replace('.', ',')}</span>}
                                                            <div className="flex items-baseline gap-0.5">
                                                                <span className="text-[10px] font-extrabold-id text-[#cb6ce6]">R$</span>
                                                                <span className="text-[#cb6ce6] font-black text-sm">{currentPrice.toFixed(2).replace('.', ',')}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-baseline gap-0.5">
                                                            <span className="text-[10px] font-bold text-gray-400">R$</span>
                                                            <span className="text-gray-900 font-black text-sm">{currentPrice.toFixed(2).replace('.', ',')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#cb6ce6] group-hover:text-white group-hover:border-[#cb6ce6] transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-[#cb6ce6]/30 active:scale-95 shrink-0 relative z-20">
                                                    <Plus size={20} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SEÇÃO DE MÁQUINAS (Equipamentos) --- */}
                {condos && condos.length > 1 && (
                    <div className="mb-10 animate-fade-in">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-xl font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                <MapPin size={20} className="text-[#cb6ce6]" strokeWidth={2.5} /> 
                                Maquinas disponíveis
                            </h2>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-200/60 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                {condos.length} Máquina{condos.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x px-1">
                            {condos.map(c => {
                                const isSelected = c.id === user?.condoId;
                                return (
                                    <button 
                                        key={c.id} 
                                        onClick={() => onCondoSelected(c, true)}
                                        className={`snap-start shrink-0 relative w-44 p-5 rounded-[24px] border-2 transition-all duration-300 text-left flex flex-col gap-3 active:scale-95 ${isSelected ? 'bg-[#cb6ce6] border-[#cb6ce6] shadow-[0_10px_30px_rgba(203,108,230,0.3)]' : 'bg-white border-gray-100 hover:border-[#cb6ce6]/40 shadow-sm hover:shadow-md'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                            <Building2 size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <span className={`font-extrabold-id text-sm uppercase tracking-tighter truncate w-full ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                {c.name}
                                            </span>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1 ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                                                {isSelected ? <><CheckCircle2 size={12} strokeWidth={3}/> Atual</> : 'Acessar Loja'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Listagem de Produtos (Catálogo) */}
                {isLoading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-[#cb6ce6]" size={40}/>
                        <span className="text-[10px] font-extrabold-id uppercase tracking-widest text-gray-400 animate-pulse">Abrindo a geladeira...</span>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.keys(products).map(category => (
                            <div key={category} className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-2xl font-extrabold-id text-gray-900 tracking-tighter uppercase flex items-center gap-3">
                                        <span className="w-2 h-8 bg-[#cb6ce6] rounded-full"></span>
                                        {category}
                                    </h2>
                                    <div className="h-px bg-gray-200 flex-1 mt-1"></div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                    {products[category].map(product => {
                                        
                                        const { isPromo, currentPrice, oldPrice, showOldPrice } = getProductPricing(product);

                                        return (
                                        /* === CARTÃO DE PRODUTO PREMIUM === */
                                        <div 
                                            key={product.id} 
                                            className="group relative bg-white rounded-[24px] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center hover:shadow-[0_8px_30px_rgba(203,108,230,0.15)] hover:border-[#cb6ce6]/30 transition-all duration-300 overflow-hidden"
                                        >
                                            {/* TAG PROMOCIONAL DESTACADA */}
                                            {isPromo && (
                                                <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[8px] font-extrabold-id px-2.5 py-1.5 rounded-lg uppercase tracking-widest z-20 shadow-md shadow-red-500/30 flex items-center gap-1 animate-fade-in pointer-events-none">
                                                    <Zap size={10} className="animate-pulse" fill="currentColor" />
                                                    EM PROMOÇÃO
                                                </div>
                                            )}

                                            {/* Imagem do Produto com Fundo Clean */}
                                            <div className="w-full aspect-square bg-[#F8FAFC] rounded-[16px] mb-4 relative overflow-hidden flex items-center justify-center group-hover:bg-[#cb6ce6]/5 transition-colors border border-transparent group-hover:border-[#cb6ce6]/10 cursor-pointer" onClick={() => addToCart(product)}>
                                                {product.image_url ? (
                                                    <img 
                                                        src={product.image_url} 
                                                        alt={product.name} 
                                                        className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply relative z-10" 
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <Package size={40} strokeWidth={1.5} className="text-gray-300 relative z-10" />
                                                )}
                                            </div>
                                            
                                            {/* Informações do Produto */}
                                            <div className="w-full flex flex-col flex-1">
                                                <h3 className="font-extrabold-id text-sm text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-[#cb6ce6] transition-colors cursor-pointer" onClick={() => addToCart(product)}>
                                                    {product.name}
                                                </h3>
                                                
                                                {product.category && (
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 truncate">
                                                        {product.category}
                                                    </p>
                                                )}

                                                {/* Bloco de Preço e Botões */}
                                                <div className="mt-auto flex flex-col w-full pt-3 border-t border-gray-50 relative z-20">
                                                    
                                                    {/* Preços */}
                                                    {isPromo ? (
                                                        <div className="flex flex-col mb-3 cursor-pointer" onClick={() => addToCart(product)}>
                                                            {showOldPrice && (
                                                                <span className="text-[10px] text-gray-400 line-through font-bold">R$ {oldPrice.toFixed(2).replace('.', ',')}</span>
                                                            )}
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-[10px] font-extrabold-id text-[#cb6ce6] uppercase">R$</span>
                                                                <span className="text-[#cb6ce6] font-black text-xl tracking-tighter leading-none">{currentPrice.toFixed(2).replace('.', ',')}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-baseline gap-1 mb-3 cursor-pointer" onClick={() => addToCart(product)}>
                                                            <span className="text-[10px] font-extrabold-id text-gray-400 uppercase">R$</span>
                                                            <span className="text-gray-900 font-black text-xl tracking-tighter leading-none group-hover:text-[#cb6ce6] transition-colors">{currentPrice.toFixed(2).replace('.', ',')}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Botões: Comprar & Carrinho */}
                                                    <div className="flex items-center gap-2 w-full mt-auto">
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                addToCart(product); 
                                                                handleNavChange('cart'); 
                                                            }}
                                                            className="flex-1 bg-[#cb6ce6] text-white h-9 rounded-[12px] font-extrabold-id text-[10px] uppercase tracking-widest transition-all shadow-sm shadow-[#cb6ce6]/20 hover:bg-[#b85cd3] active:scale-95 flex items-center justify-center"
                                                        >
                                                            Comprar
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                addToCart(product); 
                                                            }}
                                                            className="w-9 h-9 shrink-0 rounded-[12px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#cb6ce6] hover:text-white hover:border-[#cb6ce6] transition-all shadow-sm active:scale-90"
                                                            title="Adicionar ao Carrinho"
                                                        >
                                                            <Plus size={18} strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        /* === FIM DO CARTÃO === */
                                    )})}
                                </div>
                            </div>
                        ))}
                        
                        {Object.keys(products).length === 0 && (
                            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center text-gray-500 font-bold">
                                Nenhum produto encontrado nesta máquina.
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* --- BOTTOM NAV (Barra Inferior Flutuante Clean) --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-40 pointer-events-none">
                
                {/* Botão Carrinho Central (Flutuante) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button 
                        onClick={() => handleNavChange('cart')} 
                        className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${activeTab === 'cart' ? 'bg-[#cb6ce6] shadow-lg shadow-[#cb6ce6]/40 scale-105' : 'bg-white border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.1)] text-[#cb6ce6]'}`}
                    >
                        <ShoppingCart size={24} strokeWidth={2.5} className={activeTab === 'cart' ? 'text-white' : ''} />
                        
                        {/* Badge de quantidade */}
                        {cart.length > 0 && (
                            <span className={`absolute -top-1 -right-1 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${activeTab === 'cart' ? 'bg-gray-900' : 'bg-[#cb6ce6] animate-bounce'}`}>
                                {cart.reduce((a,b)=>a+b.quantity,0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Base da Navegação */}
                <div className="relative bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 h-[72px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex justify-between items-center pointer-events-auto">
                    
                    <button onClick={() => handleNavChange('home')} className="flex flex-col items-center gap-1 group w-16">
                        <div className={`transition-all duration-300 ${activeTab === 'home' ? '-translate-y-1' : ''}`}>
                            <Home size={22} strokeWidth={activeTab === 'home' ? 3 : 2} className={`transition-colors duration-300 ${activeTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${activeTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Início</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${activeTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <button onClick={() => handleNavChange('history')} className="flex flex-col items-center gap-1 group w-16 mr-8">
                        <div className={`transition-all duration-300 ${activeTab === 'history' ? '-translate-y-1' : ''}`}>
                            <History size={22} strokeWidth={activeTab === 'history' ? 3 : 2} className={`transition-colors duration-300 ${activeTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${activeTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Pedidos</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${activeTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <div className="w-4"></div>

                    <button onClick={() => handleNavChange('wallet')} className="flex flex-col items-center gap-1 group w-16 ml-8">
                        <div className={`transition-all duration-300 ${activeTab === 'wallet' ? '-translate-y-1' : ''}`}>
                            <Wallet size={22} strokeWidth={activeTab === 'wallet' ? 3 : 2} className={`transition-colors duration-300 ${activeTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${activeTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Carteira</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${activeTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <button onClick={() => handleNavChange('profile')} className="flex flex-col items-center gap-1 group w-16">
                        <div className={`transition-all duration-300 ${activeTab === 'profile' ? '-translate-y-1' : ''}`}>
                            <User size={22} strokeWidth={activeTab === 'profile' ? 3 : 2} className={`transition-colors duration-300 ${activeTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${activeTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Perfil</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${activeTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>
                </div>
            </div>

            {/* --- DRAWER MENU (Menu Lateral Perfil) --- */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end isolate font-sans">
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    <div className="relative w-[85%] max-w-sm h-full bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
                        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-[14px] bg-[#cb6ce6]/10 flex items-center justify-center text-[#cb6ce6] border border-[#cb6ce6]/20">
                                    <User size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Minha Conta</h3>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Opções e Suporte</p>
                                </div>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm border border-gray-200 active:scale-95 transition-all">
                                <X size={18} strokeWidth={3}/>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                            <div className="relative overflow-hidden rounded-[24px] bg-gray-50 border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 shrink-0 rounded-[16px] bg-white flex items-center justify-center text-2xl font-extrabold-id text-gray-900 border border-gray-200 shadow-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-extrabold-id text-gray-900 text-base leading-tight uppercase tracking-tighter truncate">{user?.name}</p>
                                        <p className="text-[10px] font-bold text-gray-500 truncate mt-0.5">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[24px] border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="bg-yellow-400 text-yellow-900 text-[9px] font-extrabold-id px-2.5 py-1 rounded-lg uppercase tracking-widest">Oportunidade</span>
                                    <Zap size={18} className="text-yellow-500 animate-pulse" fill="currentColor" />
                                </div>
                                <h4 className="text-yellow-900 font-extrabold-id text-lg leading-tight uppercase tracking-tighter mb-2">Tenha seu próprio Mercado!</h4>
                                <p className="text-yellow-800/80 text-[11px] font-bold leading-relaxed mb-4">Invista pouco e lucre 24h por dia. Tecnologia 100% pronta para você começar.</p>
                                <div className="mb-5 bg-white/60 p-3 rounded-xl border border-yellow-200/50">
                                    <p className="text-[9px] text-yellow-700 uppercase font-extrabold-id tracking-widest">Investimento inicial</p>
                                    <p className="text-xl font-black text-yellow-600 mt-0.5">R$ 4.690,00</p>
                                </div>
                                <a 
                                    href="https://wa.me/5500000000000?text=Olá,%20tenho%20interesse%20em%20ter%20um%20ponto%20autônomo!" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center justify-center w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-extrabold-id text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    Quero Saber Mais
                                </a>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-1 pl-1">Acesso Rápido</p>
                                <button onClick={() => {setPage('my-account'); setMobileMenuOpen(false)}} className="flex items-center gap-4 p-4 rounded-[20px] bg-white border border-gray-100 hover:border-[#cb6ce6]/40 hover:shadow-md transition-all group">
                                    <div className="p-2.5 bg-gray-50 rounded-[14px] text-gray-400 group-hover:text-[#cb6ce6] group-hover:bg-[#cb6ce6]/10 transition-colors border border-gray-100 group-hover:border-[#cb6ce6]/20">
                                        <User size={18} strokeWidth={2.5}/>
                                    </div>
                                    <span className="font-extrabold-id text-gray-600 group-hover:text-gray-900 text-xs uppercase tracking-widest">Minha Conta</span>
                                </button>
                                <button onClick={() => {setPage('my-tickets'); setMobileMenuOpen(false)}} className="flex items-center gap-4 p-4 rounded-[20px] bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                                    <div className="p-2.5 bg-gray-50 rounded-[14px] text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors border border-gray-100 group-hover:border-blue-100">
                                        <Bell size={18} strokeWidth={2.5}/>
                                    </div>
                                    <span className="font-extrabold-id text-gray-600 group-hover:text-gray-900 text-xs uppercase tracking-widest flex-1 text-left">Notificações</span>
                                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>}
                                </button>
                            </nav>

                            <div className="pt-2">
                                <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-2 pl-1">Precisa de Ajuda?</p>
                                <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-[20px] bg-green-50 border border-green-200 text-green-700 hover:bg-green-500 hover:text-white transition-all group active:scale-95">
                                    <MessageCircle size={20} strokeWidth={2.5} className="group-hover:animate-bounce"/>
                                    <span className="font-extrabold-id text-[10px] uppercase tracking-widest">Suporte WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto">
                            <button 
                                onClick={onLogout} 
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-200 bg-white text-red-500 font-extrabold-id text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                <LogOut size={16} strokeWidth={3} /> Sair do App
                            </button>
                            <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4">Versão 3.1.0 • OwnMarket</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



const speak = async (text) => {
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (!token) return;

        // 1. Chama o nosso backend para gerar o áudio
        const response = await fetch(`${API_URL}/api/tts/speak`, { // Use a rota correta aqui
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error('Falha ao gerar o áudio no backend.');
        }

        // 2. Transforma a resposta em um objeto de áudio que o navegador pode tocar
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // 3. Toca o áudio
        const audio = new Audio(audioUrl);
        audio.play();

    } catch (error) {
        console.error("Erro ao tentar reproduzir a voz:", error);
    }
};


const PaymentConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading, cartTotal, userBalance }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={isLoading ? null : onClose}></div>
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-orange-500" /> Confirmar Compra
                </h3>
                
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-white/5 space-y-3">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Total do Pedido</span>
                        <span className="text-white font-bold">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Seu Saldo</span>
                        <span className="text-green-400 font-bold">R$ {userBalance.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between text-sm">
                        <span>Saldo Restante</span>
                        <span className="text-gray-300 font-bold">R$ {(userBalance - cartTotal).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. NOVO MODAL DE LIMPAR CARRINHO (SUBSTITUI WINDOW.CONFIRM) ---
const ClearCartModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-500/20">
                    <Trash2 className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Esvaziar Carrinho?</h3>
                <p className="text-gray-400 text-center text-sm mb-6">
                    Você tem certeza que deseja remover todos os itens? Essa ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/20">
                        Sim, Limpar
                    </button>
                </div>
            </div>
        </div>
    );
};

const CartPage = ({ cart, setCart, setPage, user, setPaymentData, onPaymentSuccess, fridgeId, showToast }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    
    // Controles dos Modais
    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = React.useState(false); 

    // --- CÁLCULOS ---
    const updateQuantity = (productId, amount) => {
        const newCart = cart.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + amount;
                
                // Proteção de estoque
                if (amount > 0) {
                    const maxStock = item.stock !== undefined ? item.stock : 99;
                    if (newQuantity > maxStock) {
                        if (showToast) showToast(`Máximo de ${maxStock} unidades disponíveis!`);
                        return item; 
                    }
                }
                return { ...item, quantity: Math.max(0, newQuantity) };
            }
            return item;
        }).filter(item => item.quantity > 0);
        
        setCart(newCart);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const handleClearCartConfirm = () => {
        setCart([]);
        setIsClearModalOpen(false);
    };

    const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.sale_price) * item.quantity), 0);
    const userBalance = parseFloat(user?.wallet_balance || 0); 
    const canAfford = userBalance >= cartTotal;
    const difference = cartTotal - userBalance;

    // --- AÇÃO DE PAGAMENTO ---
    const handleConfirmPayment = async () => {
        setIsLoading(true); 
        setError('');
        
        const API_URL = window.API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');

        const payload = { 
            items: cart, 
            fridgeId: fridgeId || 'MS5', 
            condoId: user?.condoId || 1  
        };

        console.log("Iniciando Pagamento...", payload);

        try {
            const response = await fetch(`${API_URL}/api/orders/pay-with-wallet`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Falha ao processar pagamento.');
            }
            
            console.log("Pagamento Sucesso:", data);

            // Fluxo de Sucesso
            setPaymentData({ orderId: data.orderId }); 
            onPaymentSuccess(); 
            setCart([]); 
            setIsConfirmModalOpen(false);
            setPage('postPayment'); 

        } catch (err) {
            console.error("Erro no Pagamento:", err);
            setError(err.message);
            setIsConfirmModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    // --- COMPONENTES VISUAIS (CLEAN UI) ---
    const CartItem = ({ item }) => (
        <div className="group relative bg-white border border-gray-100 p-4 rounded-[24px] flex items-center gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(203,108,230,0.12)] hover:border-[#cb6ce6]/30 overflow-hidden">
            
            <div className="relative flex-shrink-0 w-[84px] h-[84px] rounded-2xl overflow-hidden border border-gray-50 bg-[#F8FAFC] flex items-center justify-center group-hover:bg-[#cb6ce6]/5 transition-colors">
                {item.image_url ? (
                    <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-[80%] h-[80%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                    />
                ) : (
                    <Package size={24} strokeWidth={1.5} className="text-gray-300" />
                )}
            </div>
            
            <div className="flex-grow min-w-0 py-1">
                <h3 className="font-extrabold-id text-gray-900 text-sm leading-tight mb-0.5 truncate group-hover:text-[#cb6ce6] transition-colors">{item.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 truncate">{item.category || 'Produto'}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-[10px] font-extrabold-id text-gray-400 uppercase">R$</span>
                    <span className="text-gray-900 font-black text-lg tracking-tighter leading-none group-hover:text-[#cb6ce6] transition-colors">
                        {parseFloat(item.sale_price).toFixed(2).replace('.', ',')}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-1.5 border border-gray-100 shrink-0">
                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors shadow-sm active:scale-90"><Minus size={16} strokeWidth={3} /></button>
                <span className="font-black text-gray-900 w-5 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-[#cb6ce6] hover:bg-[#b85cd3] rounded-lg text-white shadow-sm shadow-[#cb6ce6]/30 transition-all active:scale-90"><Plus size={16} strokeWidth={3} /></button>
            </div>
            
            {/* Botão de excluir discreto no canto (mobile = visível, desktop = hover) */}
            <button 
                onClick={() => removeFromCart(item.id)} 
                className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100"
                title="Remover Item"
            >
                <Trash2 size={16} strokeWidth={2.5} />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col selection:bg-[#cb6ce6]/20">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* COMPONENTES DOS MODAIS ASSUMIDOS COMO GLOBAIS/CONTEXTO */}
            {/* ... Seus modais aqui ... */}

            {/* HEADER CLEAN UI */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 pb-4 pt-6">
                <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setPage('home')} 
                            className="w-10 h-10 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#cb6ce6] hover:border-[#cb6ce6]/30 hover:bg-[#cb6ce6]/5 transition-all active:scale-95 shadow-sm"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Meu Carrinho</h1>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{cart.reduce((a,b)=>a+b.quantity,0)} Itens selecionados</p>
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <button 
                            onClick={() => setIsClearModalOpen(true)} 
                            className="text-[10px] font-extrabold-id text-red-500 hover:text-red-600 flex items-center gap-1.5 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 transition-colors uppercase tracking-widest active:scale-95 shadow-sm"
                        >
                            <Trash2 size={14} strokeWidth={3}/> Limpar
                        </button>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-6 pb-40 md:pb-10 flex-1 flex flex-col">
                {cart.length === 0 ? (
                    // EMPTY STATE CLEAN UI
                    <div className="flex flex-col items-center justify-center py-20 m-auto animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner relative">
                            <ShoppingCart size={40} strokeWidth={2} className="text-gray-300 relative z-10" />
                        </div>
                        <h2 className="text-2xl font-extrabold-id text-gray-900 mb-1 uppercase tracking-tighter text-center">Seu carrinho está vazio</h2>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest text-center max-w-xs mb-8">Bateu a fome? Escolha algo na loja.</p>
                        <button 
                            onClick={() => setPage('home')} 
                            className="bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[10px] uppercase tracking-widest py-4 px-8 rounded-2xl shadow-lg shadow-[#cb6ce6]/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <ArrowLeft size={16} strokeWidth={3} /> Voltar para a Loja
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LISTA DE ITENS */}
                        <div className="lg:col-span-2 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {cart.map(item => <CartItem key={item.id} item={item} />)}
                        </div>

                        {/* RESUMO E PAGAMENTO (DESKTOP) */}
                        <div className="hidden lg:block h-fit sticky top-28 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                                
                                <h2 className="text-lg font-extrabold-id text-gray-900 mb-6 flex items-center gap-2.5 uppercase tracking-tighter">
                                    <div className="p-2 bg-[#cb6ce6]/10 rounded-xl text-[#cb6ce6]"><Package size={20} strokeWidth={2.5}/></div>
                                    Resumo da Compra
                                </h2>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-widest">
                                        <span>Subtotal ({cart.reduce((a,b)=>a+b.quantity,0)} itens)</span>
                                        <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-900 font-extrabold-id text-base uppercase tracking-tighter">Total a Pagar</span>
                                        <span className="text-3xl font-black text-[#cb6ce6] tracking-tighter">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>

                                {/* Widget de Saldo Minimalista */}
                                <div className="bg-gray-50 rounded-[20px] p-5 mb-8 border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${canAfford ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                            <Wallet size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-extrabold-id uppercase tracking-widest mb-0.5">Seu Saldo Atual</p>
                                            <p className={`text-lg font-black tracking-tighter ${canAfford ? 'text-gray-900' : 'text-red-500'}`}>
                                                R$ {userBalance.toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-500 text-xs font-bold text-center mb-6 flex items-center justify-center gap-2">
                                        <AlertTriangle size={16} strokeWidth={3} /> {error}
                                    </div>
                                )}

                                {!canAfford ? (
                                    <button 
                                        onClick={() => setPage('wallet')} 
                                        className="w-full bg-gray-900 hover:bg-black text-white font-extrabold-id text-[10px] uppercase tracking-widest py-4 px-4 rounded-[20px] transition-all shadow-md active:scale-95 flex flex-col items-center justify-center gap-1 animate-pulse border border-gray-800"
                                    >
                                        <span className="flex items-center gap-2 text-sm"><Zap size={16} fill="currentColor" className="text-yellow-400" /> Saldo Insuficiente</span>
                                        <span className="text-gray-400">Faltam R$ {difference.toFixed(2)} — Recarregar Agora</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsConfirmModalOpen(true)} 
                                        disabled={isLoading} 
                                        className="w-full bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[11px] uppercase tracking-widest py-4 px-4 rounded-[20px] shadow-lg shadow-[#cb6ce6]/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <> Finalizar Pagamento <CheckCircle2 size={20} strokeWidth={3} /> </>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- BARRA FIXA MOBILE (Checkout Otimizado Clean UI) --- */}
            {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 p-5 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-50 animate-in slide-in-from-bottom-full duration-500">
                    
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl text-red-500 text-[10px] font-bold text-center mb-4 flex items-center justify-center gap-2">
                            <AlertTriangle size={14} strokeWidth={3}/> {error}
                        </div>
                    )}

                    <div className="flex gap-4 items-center">
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-baseline gap-1.5 mb-1.5">
                                <span className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest">Total</span>
                                <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            
                            {/* Saldo Pílula */}
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-fit border ${canAfford ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                <Wallet size={12} strokeWidth={2.5} />
                                <span className="text-[9px] font-extrabold-id uppercase tracking-widest opacity-80">Saldo:</span>
                                <span className="text-[10px] font-black">R$ {userBalance.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        {/* BOTÃO INTELIGENTE MOBILE (Pagar ou Recarregar) */}
                        {!canAfford ? (
                            <button 
                                onClick={() => setPage('wallet')} 
                                className="flex-[1.2] bg-gray-900 hover:bg-black text-white py-3.5 px-4 rounded-[20px] shadow-md flex items-center justify-center gap-3 transition-all active:scale-95 border border-gray-800"
                            >
                                <Zap size={24} fill="currentColor" className="text-yellow-400 shrink-0 animate-pulse" />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[8px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Faltam R$ {difference.toFixed(2)}</span>
                                    <span className="text-xs font-extrabold-id uppercase tracking-widest">Recarregar</span>
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={isLoading}
                                className="flex-[1.2] bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id py-4 rounded-[20px] shadow-lg shadow-[#cb6ce6]/25 flex items-center justify-center gap-2 transition-transform active:scale-95 text-[11px] uppercase tracking-widest"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <> Pagar <CheckCircle2 size={20} strokeWidth={3} /> </>}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const PixPaymentPage = ({ paymentData, setPage, onPaymentSuccess, API_URL }) => {
    const [copySuccess, setCopySuccess] = React.useState(false);
    
    // Fallback para API_URL se não for passado
    const BASE_URL = API_URL || 'http://localhost:5000';

    // --- LÓGICA DE DETETIVE (MANTIDA) ---
    const isDeposit = React.useMemo(() => {
        if (!paymentData) return false;
        const hasAmount = paymentData.amount && parseFloat(paymentData.amount) > 0;
        const noItems = !paymentData.items;
        // Se tiver amount > 0 OU não tiver itens, é depósito.
        return hasAmount || noItems;
    }, [paymentData]);

    const cancelTargetPage = isDeposit ? 'wallet' : 'cart';

    // Proteção contra renderização sem dados
    React.useEffect(() => {
        if (!paymentData) {
            const timer = setTimeout(() => setPage('home'), 1500);
            return () => clearTimeout(timer);
        }
    }, [paymentData, setPage]);

    // Polling
    React.useEffect(() => {
        if (!paymentData?.orderId) return;

        const interval = setInterval(async () => {
            if (document.visibilityState !== 'visible') return;
            const token = localStorage.getItem('token');
            try {
                const statusUrl = isDeposit
                    ? `${BASE_URL}/api/wallet/deposit-status/${paymentData.orderId}`
                    : `${BASE_URL}/api/orders/${paymentData.orderId}/status`;
                
                const response = await fetch(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) return;
                
                const data = await response.json();
                
                if (data.status === 'paid') {
                    onPaymentSuccess();
                    clearInterval(interval);
                    setPage(isDeposit ? 'depositSuccess' : 'postPayment');
                }
            } catch (error) {
                // Silently ignore polling errors
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [paymentData, setPage, onPaymentSuccess, isDeposit, BASE_URL]);

    const handleCopy = () => {
        if (paymentData?.pix_qr_code_text) {
            navigator.clipboard.writeText(paymentData.pix_qr_code_text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
        }
    };

    const handleCancel = () => { 
        setPage(cancelTargetPage); 
    };

    // --- TELA DE LOADING SEGURA ---
    if (!paymentData) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                <p className="font-bold text-lg">Gerando PIX...</p>
                <p className="text-xs text-gray-500 mt-2">Isso pode levar alguns segundos</p>
            </div>
        );
    }

    // --- RENDERIZAÇÃO PREMIUM ---
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Header */}
                <div className="bg-white/5 border-b border-white/5 p-6 text-center relative">
                    <button 
                        onClick={handleCancel}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-3">
                        <Zap size={12} className="text-green-400 fill-green-400" />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Pagamento Instantâneo</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Pagamento via PIX</h2>
                </div>

                <div className="p-6 md:p-8">
                    
                    {/* Valor em Destaque */}
                    {paymentData.amount && (
                        <div className="text-center mb-8">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Valor a Pagar</p>
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                R$ {parseFloat(paymentData.amount).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                    )}

                    {/* QR Code Container */}
                    <div className="relative bg-white p-4 rounded-2xl mx-auto w-fit shadow-lg shadow-black/20 mb-8 group overflow-hidden">
                        {/* Moldura de Scan animada */}
                        <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-2xl pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 blur-sm animate-[scan_2s_ease-in-out_infinite]"></div>
                        
                        {paymentData.pix_qr_code ? (
                            <img 
                                src={`data:image/jpeg;base64,${paymentData.pix_qr_code}`} 
                                alt="PIX QR Code" 
                                className="w-48 h-48 object-contain relative z-10" 
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center text-gray-400 font-bold text-xs">
                                Carregando QR...
                            </div>
                        )}
                        
                        <p className="text-black/50 text-[10px] font-bold text-center mt-2 uppercase tracking-wide">Escaneie no App do Banco</p>
                    </div>

                    {/* Copia e Cola */}
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                            <span>Código Copia e Cola</span>
                            <span className="text-orange-500">Expira em 30 min</span>
                        </div>
                        
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative bg-[#0f172a] border border-white/10 rounded-xl p-1 flex items-center">
                                <div className="flex-1 overflow-hidden px-3 py-3">
                                    <p className="text-gray-400 font-mono text-xs truncate select-all">
                                        {paymentData.pix_qr_code_text || "Carregando código..."}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleCopy}
                                    disabled={!paymentData.pix_qr_code_text}
                                    className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                                        copySuccess 
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    {copySuccess ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Status Footer */}
                    <div className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping"></div>
                                <div className="relative bg-orange-500/10 p-2 rounded-full border border-orange-500/20">
                                    <Loader2 className="text-orange-500 animate-spin" size={20} />
                                </div>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Aguardando pagamento...</p>
                                <p className="text-gray-500 text-xs">A confirmação é automática</p>
                            </div>
                        </div>
                        <ShieldCheck className="text-gray-600" size={20} />
                    </div>

                </div>

                {/* Footer Link */}
                <div className="bg-black/20 p-4 text-center">
                    <button 
                        onClick={handleCancel}
                        className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
                    >
                        Cancelar operação
                    </button>
                </div>
            </div>

            {/* Animação CSS */}
            <style>{`@keyframes scan { 0%, 100% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 50% { transform: translateY(190px); opacity: 1; } 90% { opacity: 0; } }`}</style>
        </div>
    );
};

const CardPaymentPage = ({ user, cart, setPage, onPaymentSuccess, setPaymentData, fridgeId }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isMpReady, setIsMpReady] = React.useState(false);
    const brickIsInitializing = React.useRef(false);

    const cartTotal = React.useMemo(() => 
        cart.reduce((total, item) => total + (parseFloat(item.sale_price) * item.quantity), 0),
        [cart]
    );

    React.useEffect(() => {
        const scriptId = 'mercadopago-sdk';
        if (window.MercadoPago) {
            setIsMpReady(true);
            return;
        }
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = () => setIsMpReady(true);
        document.body.appendChild(script);
    }, []);

    React.useEffect(() => {
        if (isMpReady && cartTotal > 0 && !brickIsInitializing.current) {
            brickIsInitializing.current = true;
            const mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY);
            const bricksBuilder = mp.bricks();

            const renderCardPaymentBrick = async () => {
                try {
                    await bricksBuilder.create("cardPayment", "cardPaymentBrick_container", {
                        initialization: {
                            amount: cartTotal,
                            payer: { email: user.email },
                        },
                        customization: { visual: { style: { theme: 'dark' } } },
                        callbacks: {
                            onSubmit: async (cardFormData) => {
                                setIsLoading(true); setError('');
                                const token = localStorage.getItem('token');
                                try {
                                    const response = await fetch(`${API_URL}/api/orders/create-card`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        // CORREÇÃO: Enviando condoId e fridgeId para o backend
                                        body: JSON.stringify({ ...cardFormData, items: cart, user: user, condoId: user.condoId, fridgeId: fridgeId })
                                    });
                                    const data = await response.json();
                                    if (!response.ok) throw new Error(data.message || 'Pagamento recusado.');
                                    setPaymentData({ unlockToken: data.unlockToken });
                                    onPaymentSuccess(data.unlockToken);
                                    setPage('awaitingUnlock');
                                } catch (err) {
                                    setError(err.message);
                                    setIsLoading(false);
                                }
                            },
                            onError: (err) => setError('Ocorreu um erro ao processar os dados do cartão.'),
                        },
                    });
                } catch (e) {
                    setError("Erro ao inicializar o formulário de pagamento.");
                }
            };
            renderCardPaymentBrick();
        }
    }, [isMpReady, cartTotal, user, fridgeId, cart, setPage, onPaymentSuccess, setPaymentData]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('cart')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Pagamento com Cartão</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg">
                    <p className="text-center text-lg text-gray-300 mb-4">Valor da compra: <span className="font-bold text-orange-400">R$ {cartTotal.toFixed(2).replace('.', ',')}</span></p>
                    {!isMpReady && !error && <div className="flex justify-center items-center flex-col gap-4"><Loader2 className="animate-spin" /><span>A carregar formulário...</span></div>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <div id="cardPaymentBrick_container"></div>
                    {isLoading && <div className="flex justify-center mt-4"><Loader2 className="animate-spin" /><span>A processar...</span></div>}
                </div>
            </main>
        </div>
    );
};

// App.js -> SUBSTITUA o componente CardBrandLogo por este

// --- CORREÇÃO 1: Ícones da Bandeira (Corrigidos com <path>) ---
const CardBrandLogo = ({ brand }) => {
    // A 'brand' agora será 'visa', 'master', 'elo', etc.
    const logos = {
        visa: (
            <svg viewBox="0 0 38 12" height="24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M33.636 11.353h-3.44L27.18 0h3.843l3.613 11.353zM23.012 0L19.45 11.353h-3.23L12.657 0h3.843l1.81 7.424 1.9-7.424h2.8zM12.27 1.81L9.94 11.353H6.26L8.59 1.81h3.68zM4.68 11.353l1.81-9.544c.15-.65-.11-1.05-.81-1.21L5.64 0H.6L.51 1.05c.9.15 1.44.43 1.29 1.36L.01 11.353h3.843l.827-4.145h.04z" />
            </svg>
        ),
        master: ( // <-- Corrigido de 'mastercard' para 'master'
            <svg viewBox="0 0 38 24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#EB001B"/>
                <circle cx="26" cy="12" r="12" fill="#F79E1B" opacity="0.8"/>
            </svg>
        ),
        amex: (
            <svg viewBox="0 0 320 202.2" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#006FCF" d="M320 202.2H0V0h320z"/>
                <path fill="#FFF" d="M109.8 135.2h100.3v33.4H109.8zM160 33.6c-30.8 0-55.8 25-55.8 55.8s25 55.8 55.8 55.8 55.8-25 55.8-55.8-25-55.8-55.8-55.8zm-9.3 84.8h-18.6v-58h18.6v58zm28 0h-18.6v-58h18.6v58z"/>
            </svg>
        ),
        elo: (
             <svg viewBox="0 0 100 63" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M93.9 6.1H6.1C2.7 6.1 0 8.8 0 12.2v38.5c0 3.4 2.7 6.1 6.1 6.1h87.8c3.4 0 6.1-2.7 6.1-6.1V12.2c0-3.4-2.7-6.1-6.1-6.1z" fill="#00A4E0"/>
                <path d="M47.2 27.2h-6.7c-2.1 0-3.1.9-3.1 2.5v.2c0 1.2.9 2.1 2.8 2.3l6.4.8c4.2.5 6.6 2.3 6.6 5.8v.2c0 4.2-3.6 6.8-9 6.8h-12c-1.3 0-2.3-.9-2.3-2.2v-.2c0-1.1.8-2 2-2.2h8.2c1.8 0 2.8-.8 2.8-2.3v-.2c0-1.3-.9-2.2-2.9-2.4l-6.4-.8c-4.1-.5-6.5-2.4-6.5-5.9v-.2c0-4.1 3.5-6.7 8.9-6.7h11.2c1.2 0 2.1.8 2.1 2v.2c0 1-.7 1.9-1.8 2.1zM65.4 45.4h-5.9c-1.1 0-1.9-.9-1.9-2v-19c0-1.1.9-2 1.9-2h5.9c1.1 0 1.9.9 1.9 2v19c0 1.1-.8 2-1.9 2zM81.5 45.4h-10c-1.1 0-2-.9-2-2V24.4c0-1.1.9-2 2-2h9.4c5.1 0 8.5 3 8.5 7.6v.2c0 4.1-3 7-7.4 7.4l-1.9.2v.2h1.9c5.1 0 8.9 3.1 8.9 7.9v.2c0 4.7-3.7 7.5-8.8 7.5zm.1-12.7h-9.4v10.7h9.4c3.9 0 6.3-2.2 6.3-5.3v-.2c0-3-2.4-5.2-6.3-5.2zm-.1-8.5h-9.4v6.6h9.4c3.4 0 5.6-2 5.6-3.3v-.2c0-1.4-2.2-3.1-5.6-3.1z" fill="#FFF"/>
            </svg>
        ),
    };
    return logos[brand] || null;
};


// App.js -> SUBSTITUA o seu componente CardDepositPage por este


const CardDepositPage = ({ user, depositData, setPage, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = React.useState(false); 
    const [isBrickLoading, setIsBrickLoading] = React.useState(true); 
    const [error, setError] = React.useState('');
    const [isMpReady, setIsMpReady] = React.useState(false);
    const brickIsInitializing = React.useRef(false); 

    const depositAmount = parseFloat(depositData?.amount || 0);

    // 1. Carrega o script do Mercado Pago
    React.useEffect(() => {
        if (window.MercadoPago) {
            setIsMpReady(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = () => setIsMpReady(true);
        document.body.appendChild(script);
    }, []);

    // 2. Inicializa o Brick do Cartão
    React.useEffect(() => {
        if (isMpReady && depositAmount > 0 && !brickIsInitializing.current) {
            
            // Certifique-se de que a variável de ambiente está correta no seu projeto
            const publicKey = window.MERCADOPAGO_PUBLIC_KEY || process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY;

            if (!publicKey) {
                setError("Chave de API do Mercado Pago (Pública) não foi configurada.");
                setIsBrickLoading(false);
                return;
            }
            
            brickIsInitializing.current = true; 
            const mp = new window.MercadoPago(publicKey);
            const bricksBuilder = mp.bricks();

            const renderCardPaymentBrick = async () => {
                try {
                    const container = document.getElementById("cardPaymentBrick_container");
                    if (container && container.firstChild) {
                        while (container.firstChild) {
                            container.removeChild(container.firstChild);
                        }
                    }
                    
                    setIsBrickLoading(true); 
                    
                    await bricksBuilder.create("cardPayment", "cardPaymentBrick_container", {
                        initialization: {
                            amount: depositAmount,
                            locale: 'pt-BR', 
                            payer: {
                                email: user?.email || '',
                                identification: {
                                    type: 'CPF',
                                    number: user?.cpf ? user.cpf.replace(/\D/g, '') : ''
                                }
                            },
                        },
                        customization: {
                            texts: {
                                submit: `Depositar R$ ${depositAmount.toFixed(2).replace('.', ',')}`,
                                placeholder: {
                                    cardholderName: "Nome como aparece no cartão",
                                    cardholderEmail: "E-mail",
                                    cardNumber: "Número do cartão",
                                    expirationDate: "MM/AA",
                                    securityCode: "CVV",
                                    identificationNumber: "Seu CPF"
                                }
                            },
                            translation: {
                                "pt-BR": {
                                    "cardPayment": {
                                        "title": "Dados do Cartão",
                                        "cardholderName": { "label": "Nome no cartão" },
                                        "cardholderEmail": { "label": "E-mail" },
                                        "cardNumber": { "label": "Número do cartão" },
                                        "expirationDate": { "label": "Vencimento" },
                                        "securityCode": { "label": "Código de segurança (CVV)" },
                                        "identificationType": { "label": "Tipo de documento" },
                                        "identificationNumber": { "label": "Número do documento" },
                                        "issuer": { "label": "Banco emissor" },
                                        "installments": { "label": "Parcelas" }
                                    }
                                }
                            },
                            // --- ATUALIZAÇÃO DO TEMA DO MERCADO PAGO PARA CLEAN UI ---
                            visual: { 
                                style: { 
                                    theme: 'default', // Mudamos de dark para default (claro)
                                    customVariables: {
                                        baseColor: '#cb6ce6', // Cor principal do OwnMarket
                                        outlinePrimaryColor: '#cb6ce6',
                                        borderRadius: '16px', 
                                        inputBackgroundColor: '#F8FAFC', 
                                        formBackgroundColor: 'transparent',
                                        buttonBackgroundColor: '#cb6ce6',
                                        buttonTextColor: '#FFFFFF'
                                    }
                                } 
                            }
                        },
                        callbacks: {
                            onReady: () => {
                                setIsBrickLoading(false); 
                            },
                            onError: (err) => {
                                console.error("Erro ao inicializar o Brick:", err);
                                setError("Erro ao inicializar o formulário de pagamento.");
                                setIsBrickLoading(false);
                            },
                            onSubmit: async (cardFormData) => {
                                setIsLoading(true); 
                                setError('');
                                const token = localStorage.getItem('token');
                                const API_URL = window.API_URL || 'http://localhost:5000';
                                
                                try {
                                    const response = await fetch(`${API_URL}/api/wallet/deposit-card`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ 
                                            cardFormData: cardFormData, 
                                            amount: depositAmount
                                        })
                                    });
                                    const data = await response.json();
                                    if (!response.ok) throw new Error(data.message || 'Depósito recusado.');
                                    
                                    onPaymentSuccess();
                                    setPage('depositSuccess');

                                } catch (err) {
                                    setError(err.message);
                                    setIsLoading(false);
                                }
                            }
                        },
                    });
                } catch (e) {
                    console.error("Erro ao inicializar o Brick (catch):", e);
                    setError("Erro ao inicializar o formulário de pagamento.");
                    setIsBrickLoading(false);
                }
            };
            
            renderCardPaymentBrick();
        }
    }, [isMpReady, depositAmount, user, setPage, onPaymentSuccess]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col selection:bg-[#cb6ce6]/20">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                
                /* Tweak para forçar fontes no Mercado Pago se ele aceitar herança */
                #cardPaymentBrick_container {
                    font-family: 'Inter', sans-serif;
                }
            `}</style>
            
            {/* OVERLAY DE PAGAMENTO EM PROCESSAMENTO */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in px-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#cb6ce6]/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative bg-white p-5 rounded-[24px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(203,108,230,0.3)]">
                            <Loader2 size={40} strokeWidth={3} className="text-[#cb6ce6] animate-spin" />
                        </div>
                    </div>
                    <h2 className="text-gray-900 font-extrabold-id text-2xl mt-6 tracking-tighter uppercase">Processando...</h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 text-center">Não feche esta página<br/>Aguardando operadora de cartão</p>
                </div>
            )}

            {/* HEADER CLEAN UI */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 pb-4 pt-6">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setPage('wallet')} 
                            className="w-10 h-10 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#cb6ce6] hover:border-[#cb6ce6]/30 hover:bg-[#cb6ce6]/5 transition-all active:scale-95 shadow-sm"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5}/>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Depósito Cartão</h1>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                <ShieldCheck size={10} className="text-green-500"/> Ambiente Seguro
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 pb-36 max-w-lg flex-1">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Widget de Resumo do Valor */}
                    <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-[18px] bg-gray-50 text-[#cb6ce6] flex items-center justify-center border border-gray-100">
                                <CreditCard size={28} strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-1">Total a Adicionar</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-extrabold-id text-[#cb6ce6] uppercase">R$</span>
                                    <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
                                        {depositAmount.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Container do Formulário Mercado Pago (Ninho Clean UI) */}
                    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative min-h-[400px]">
                        
                        {/* Indicador de Carregamento Inicial do Formulário */}
                        {isBrickLoading && !isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-[32px] gap-4">
                                <Loader2 className="animate-spin text-[#cb6ce6]" size={40} strokeWidth={2.5}/>
                                <span className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest animate-pulse">Criptografando conexão...</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-500 text-xs font-bold text-center mb-6">
                                {error}
                            </div>
                        )}
                        
                        {/* 1. O Brick será injetado exatamente aqui */}
                        <div id="cardPaymentBrick_container" className="w-full"></div>
                        
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 opacity-60">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Pagamento processado por Mercado Pago</span>
                    </div>

                </div>
            </main>
        </div>
    );
};


const PaymentPage = ({ paymentData, setPage, onPaymentSuccess }) => {
    const [copySuccess, setCopySuccess] = React.useState(false);
    
    // --- LÓGICA BLINDADA DE DEPÓSITO ---
    // Verifica se é depósito (tem amount > 0) ou se não tem itens de carrinho.
    // Usamos useMemo para garantir que o cálculo seja estável.
    const isDeposit = React.useMemo(() => {
        if (!paymentData) return false;
        // Se tiver 'amount' (correção do backend) OU se não tiver 'items' (lista de produtos), é depósito.
        return (paymentData.amount && parseFloat(paymentData.amount) > 0) || !paymentData.items || paymentData.items.length === 0;
    }, [paymentData]);

    const cancelTargetPage = isDeposit ? 'wallet' : 'cart';

    // --- CORREÇÃO DO ERRO DE LOOP (REDIRECIONAMENTO) ---
    // NUNCA chame setPage direto no corpo do componente. Usamos useEffect.
    React.useEffect(() => {
        // Se entrou na página sem dados nenhum, espera 1s antes de desistir.
        // Isso dá tempo do App.js atualizar o estado.
        if (!paymentData) {
            const timer = setTimeout(() => {
                console.warn("⚠️ [PaymentPage] Sem dados após espera. Redirecionando.");
                setPage('wallet'); // Manda pra wallet em vez de cart/home pra não frustrar
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [paymentData, setPage]);

    // --- POLLING (Verificação do Status) ---
    React.useEffect(() => {
        if (!paymentData?.orderId) return;

        const interval = setInterval(async () => {
            if (document.visibilityState !== 'visible') return;
            const token = localStorage.getItem('token');
            try {
                // Seleciona a URL correta (Depósito ou Compra)
                const statusUrl = isDeposit
                    ? `${API_URL}/api/wallet/deposit-status/${paymentData.orderId}`
                    : `${API_URL}/api/orders/${paymentData.orderId}/status`;
                
                const response = await fetch(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) return;
                
                const data = await response.json();
                
                if (data.status === 'paid') {
                    console.log("✅ [PaymentPage] Pagamento confirmado!");
                    onPaymentSuccess();
                    clearInterval(interval);
                    // Redireciona para a tela de sucesso correta
                    setPage(isDeposit ? 'depositSuccess' : 'postPayment');
                }
            } catch (error) {
                // Silencia erros de rede menores no polling
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [paymentData, setPage, onPaymentSuccess, isDeposit]);

    const handleCopy = () => {
        if (paymentData?.pix_qr_code_text) {
            navigator.clipboard.writeText(paymentData.pix_qr_code_text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
        }
    };

    // --- TELA DE CARREGAMENTO (IMPORTANTE) ---
    // Se não tiver dados, mostra Loading em vez de quebrar ou redirecionar errado
    if (!paymentData) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-4 text-center">
                <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                <h2 className="text-xl font-bold">Gerando PIX...</h2>
                <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Header */}
                <div className="bg-white/5 border-b border-white/5 p-6 text-center relative">
                    <button 
                        onClick={() => setPage(cancelTargetPage)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-3">
                        <Zap size={12} className="text-green-400 fill-green-400" />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Pagamento Instantâneo</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Pagamento via PIX</h2>
                </div>

                <div className="p-6 md:p-8">
                    
                    {/* Valor em Destaque (Se disponível) */}
                    {paymentData.amount && (
                        <div className="text-center mb-8">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Valor a Pagar</p>
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                R$ {parseFloat(paymentData.amount).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                    )}

                    {/* QR Code */}
                    <div className="relative bg-white p-4 rounded-2xl mx-auto w-fit shadow-lg shadow-black/20 mb-8 group overflow-hidden">
                        <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-2xl pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 blur-sm animate-[scan_2s_ease-in-out_infinite]"></div>
                        
                        {paymentData.pix_qr_code ? (
                            <img 
                                src={`data:image/jpeg;base64,${paymentData.pix_qr_code}`} 
                                alt="PIX QR Code" 
                                className="w-48 h-48 object-contain relative z-10" 
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center text-gray-400 font-bold">
                                Carregando QR...
                            </div>
                        )}
                        <p className="text-black/50 text-[10px] font-bold text-center mt-2 uppercase tracking-wide">Escaneie no App do Banco</p>
                    </div>

                    {/* Copia e Cola */}
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                            <span>Código Copia e Cola</span>
                            <span className="text-orange-500">Expira em 30 min</span>
                        </div>
                        
                        <div className="relative bg-[#0f172a] border border-white/10 rounded-xl p-1 flex items-center">
                            <div className="flex-1 overflow-hidden px-3 py-3">
                                <p className="text-gray-400 font-mono text-xs truncate select-all">
                                    {paymentData.pix_qr_code_text || 'Gerando código...'}
                                </p>
                            </div>
                            <button 
                                onClick={handleCopy}
                                disabled={!paymentData.pix_qr_code_text}
                                className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                                    copySuccess 
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                {copySuccess ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-[#0f172a]/50 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="text-orange-500 animate-spin" size={20} />
                            <div>
                                <p className="text-white font-bold text-sm">Aguardando pagamento...</p>
                                <p className="text-gray-500 text-xs">A confirmação é automática</p>
                            </div>
                        </div>
                        <ShieldCheck className="text-gray-600" size={20} />
                    </div>

                </div>

                {/* Cancelar */}
                <div className="bg-black/20 p-4 text-center">
                    <button 
                        onClick={() => setPage(cancelTargetPage)}
                        className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
                    >
                        Cancelar operação
                    </button>
                </div>
            </div>
            
            <style>{`@keyframes scan { 0%, 100% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 50% { transform: translateY(190px); opacity: 1; } 90% { opacity: 0; } }`}</style>
        </div>
    );
};

const EnjoyPage = ({ setPage, user }) => {
    
    // Adicionado: useEffect para a voz com o nome do utilizador
    React.useEffect(() => {
        // Pega o primeiro nome para a saudação ficar mais natural
        const firstName = user?.name ? user.name.split(' ')[0] : 'Cliente';
        const textToSpeak = `${firstName}, porta destravada! Abra a porta e retire seus produtos. Volte sempre!`;
        
        setTimeout(() => {
            speak(textToSpeak);
        }, 1000);

        const timer = setTimeout(() => {
            setPage('home');
        }, 10000);

        return () => {
            clearTimeout(timer);
            window.speechSynthesis.cancel();
        };
    }, [setPage, user]); // Depende do 'user' para ter acesso ao nome

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 text-center">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
                <Check size={80} className="text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Porta Destravada!</h1>
                <p className="text-gray-300 mb-6">Retire os seus produtos e feche a porta. Bom apetite!</p>
            </div>
        </div>
    );
};

const DepositSuccessPage = ({ setPage }) => {
    
    // O seu useEffect de 5 segundos está perfeito e foi mantido
    React.useEffect(() => {
        // Inicia um temporizador para redirecionar para a carteira após 5 segundos
        const timer = setTimeout(() => {
            setPage('wallet');
        }, 5000);
        // Limpa o temporizador se o utilizador sair da página antes
        return () => clearTimeout(timer);
    }, [setPage]);

    // --- DEFINIÇÃO DAS ANIMAÇÕES (Surgindo + Checkmark + Barra de Progresso) ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes draw-check { 
            100% { stroke-dashoffset: 0; } 
        }
        @keyframes fade-in-scale { 
            0% { opacity: 0; transform: scale(0.7); } 
            100% { opacity: 1; transform: scale(1); } 
        }
        /* Nova animação para a barra de progresso de 5s */
        @keyframes fill-redirect-bar {
            from { width: 0%; }
            to { width: 100%; }
        }
        .animate-surgir {
            animation: surgir 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }
        .animate-fill-redirect {
            /* Duração de 5 segundos (5000ms) */
            animation: fill-redirect-bar 5s linear forwards;
        }
    `;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 text-center">
            <style>{keyframes}</style>
            
            {/* --- CARD REDESENHADO (Glassmorphism) --- */}
            <div className="w-full max-w-md 
                            bg-gray-800/50 backdrop-blur-sm 
                            border border-gray-700/50 
                            p-8 rounded-2xl shadow-2xl 
                            flex flex-col items-center justify-center 
                            min-h-[400px] overflow-hidden relative 
                            animate-surgir"
            >
                
                {/* --- ÍCONE DE CHECKMARK ANIMADO (Neon Verde) --- */}
                <svg className="w-32 h-32" viewBox="0 0 52 52" style={{ animation: `fade-in-scale 0.5s ease-out forwards` }}>
                    <path d="M14 27l5.917 4.917L38 18"
                        fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                        className="stroke-current text-green-400"
                        style={{
                            filter: 'drop-shadow(0 0 10px rgba(74, 222, 128, 0.7))', // Neon
                            strokeDasharray: 48, strokeDashoffset: 48,
                            animation: `draw-check 0.6s ease-out 0.3s forwards`
                        }}/>
                </svg>

                <h1 className="text-3xl font-bold text-green-400 mt-4">Depósito Aprovado!</h1>
                <p className="text-gray-300 mt-3 text-base">O valor foi creditado na sua carteira.</p>
                <p className="text-gray-400 mt-1 text-sm">A redirecionar para a carteira...</p>
                
                {/* --- BARRA DE PROGRESSO DE REDIRECIONAMENTO (5s) --- */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-700/50">
                    <div className="h-full bg-green-500 animate-fill-redirect"
                         style={{ filter: 'drop-shadow(0 0 4px rgba(74, 222, 128, 0.5))' }}
                    ></div>
                </div>
            </div>
        </div>
    );
};


// App.js -> SUBSTITUA o seu componente EditProfileModal por este

const EditProfileModal = ({ user, isOpen, onClose, onSave, token }) => {
    const [formData, setFormData] = React.useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // --- Keyframes para animação do card e botão ---
    const keyframes = `
        @keyframes surgir { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes neon-pulse-shadow-blue {
            0%, 100% { box-shadow: 0 0 8px rgba(96, 165, 250, 0.5), 0 0 12px rgba(96, 165, 250, 0.5); }
            50% { box-shadow: 0 0 12px rgba(96, 165, 250, 0.8), 0 0 20px rgba(96, 165, 250, 0.8); }
        }
        .animate-surgir { animation: surgir 0.3s ease-out forwards; }
        .neon-button-blue { animation: neon-pulse-shadow-blue 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    `;
    
    // --- Classe do Botão Neon (Salvar) ---
    const neonButtonClass = `
        bg-blue-500 text-white font-bold py-3 px-6 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50
        transition-all disabled:bg-gray-500 disabled:shadow-none
        neon-button-blue
    `;

    // Atualiza o estado do formulário quando o usuário (prop) mudar
    React.useEffect(() => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
        });
    }, [user, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: formData.name, email: formData.email }) 
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao atualizar os dados.');
            
            onSave(data.user); 
            onClose(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <style>{keyframes}</style>
            {/* --- MODAL REDESENHADO (Glassmorphism e Animação) --- */}
            <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl shadow-2xl w-full max-w-md animate-surgir">
                
                {/* Ícone de Destaque */}
                <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User size={32} className="text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white text-center mb-6">Editar Meus Dados</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Nome Completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 mb-1">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 py-3 px-6 rounded-lg font-medium">Cancelar</button>
                    <button type="submit" disabled={isLoading} className={neonButtonClass}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente ChangePasswordModal por este

const ChangePasswordModal = ({ isOpen, onClose, onSave, token, user }) => {
    const [formData, setFormData] = React.useState({ password: '', newPassword: '', confirmNewPassword: '' });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    // --- Keyframes para animação do card e botão ---
    const keyframes = `
        @keyframes surgir { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes neon-pulse-shadow-blue {
            0%, 100% { box-shadow: 0 0 8px rgba(96, 165, 250, 0.5), 0 0 12px rgba(96, 165, 250, 0.5); }
            50% { box-shadow: 0 0 12px rgba(96, 165, 250, 0.8), 0 0 20px rgba(96, 165, 250, 0.8); }
        }
        .animate-surgir { animation: surgir 0.3s ease-out forwards; }
        .neon-button-blue { animation: neon-pulse-shadow-blue 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    `;
    
    // --- Classe do Botão Neon (Salvar) ---
    const neonButtonClass = `
        bg-blue-500 text-white font-bold py-3 px-6 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50
        transition-all disabled:bg-gray-500 disabled:shadow-none
        neon-button-blue
    `;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('As novas senhas não coincidem.');
            setIsLoading(false);
            return;
        }
        
        // --- CORREÇÃO DE BUG ---
        // Precisamos garantir que 'user' não seja nulo antes de acessar 'name' e 'email'
        if (!user) {
            setError("Erro: Informações do usuário não carregadas. Tente novamente.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                // O backend 'updateMe' espera 'name' e 'email'
                body: JSON.stringify({ 
                    name: user.name, 
                    email: user.email,
                    password: formData.password, 
                    newPassword: formData.newPassword 
                }) 
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao alterar a senha.');
            
            setSuccess('Senha alterada com sucesso!');
            onSave(data.user); 
            setTimeout(() => {
                onModalClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const onModalClose = () => {
        setFormData({ password: '', newPassword: '', confirmNewPassword: '' });
        setError('');
        setSuccess('');
        onClose();
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <style>{keyframes}</style>
            {/* --- MODAL REDESENHADO (Glassmorphism e Animação) --- */}
            <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl shadow-2xl w-full max-w-md animate-surgir">
                
                {/* Ícone de Destaque */}
                <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <KeyRound size={32} className="text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white text-center mb-6">Alterar Senha</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Senha Atual</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Nova Senha</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Mínimo 6 caracteres" className="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 mb-1">Confirmar Nova Senha</label>
                    <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} placeholder="Repita a nova senha" className="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                </div>
                
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                {success && <p className="text-green-400 text-center mb-4">{success}</p>}
                
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onModalClose} className="bg-gray-600 hover:bg-gray-500 py-3 px-6 rounded-lg font-medium">Cancelar</button>
                    <button type="submit" disabled={isLoading} className={neonButtonClass}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Alterar Senha'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const MyAccountPage = ({ user, setPage, onAccountUpdate, onLogout, cart = [] }) => {
    // --- ESTADOS (LÓGICA INTOCADA) ---
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);
    const token = localStorage.getItem('token');
    
    // Estado para Bottom Nav
    const [navTab, setNavTab] = React.useState('profile');
    
    // Rotação de dicas dinâmica
    const [tipIndex, setTipIndex] = React.useState(0);
    const tips = [
        "Mantenha sua carteira sempre recarregada para compras super rápidas.",
        "Seu histórico de compras fica salvo para você acompanhar seus gastos.",
        "Ative as notificações para receber ofertas exclusivas na sua máquina.",
        "Problemas com a máquina? Chame nosso suporte pelo botão no Início."
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % tips.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [tips.length]);

    const handleNavChange = (tabId) => {
        if (tabId === 'profile') return;
        setNavTab(tabId);
        setTimeout(() => {
            if(tabId === 'cart') setPage('cart');
            else setPage(tabId);
        }, 200);
    };

    // --- COMPONENTES VISUAIS INOVADORES ---

    const MinimalInfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex flex-col gap-1 p-4 bg-gray-50/80 hover:bg-gray-100 rounded-2xl transition-colors border border-transparent hover:border-gray-200">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Icon size={12} strokeWidth={3} />
                <span className="text-[9px] font-extrabold-id uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-gray-900 font-bold text-sm truncate">{value || 'N/A'}</span>
        </div>
    );

    return (
        <>
            {/* ESTILOS GLOBAIS DA PÁGINA */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px); }
            `}</style>

            {/* --- MODAL DE SENHA (Lógica Intocada) --- */}
            {typeof ChangePasswordModal !== 'undefined' && (
                <ChangePasswordModal
                    isOpen={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onSave={onAccountUpdate}
                    token={token}
                    user={user}
                />
            )}

            <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col selection:bg-[#cb6ce6]/20 relative overflow-hidden">
                
                {/* Elementos de Fundo Abstratos para dar Modernidade */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#cb6ce6]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                {/* HEADER MINIMALISTA */}
                <header className="sticky top-0 z-40 pb-4 pt-6 px-4 md:px-8">
                    <div className="container mx-auto flex items-center justify-between glass-card p-4 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setPage('home')} 
                                className="w-10 h-10 rounded-[14px] bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#cb6ce6] hover:text-white transition-all active:scale-95 border border-gray-100 hover:border-[#cb6ce6] shadow-sm"
                            >
                                <ArrowLeft size={18} strokeWidth={3}/>
                            </button>
                            <h1 className="text-xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none pt-1">Minha Conta</h1>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                            <ShieldCheck size={14} className="text-green-500" strokeWidth={3}/>
                            <span className="text-[9px] font-extrabold-id text-green-600 uppercase tracking-widest">Verificado</span>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 md:px-8 py-4 pb-36 flex-1 max-w-5xl">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        
                        {/* COLUNA ESQUERDA (Identidade & Dicas) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            
                            {/* WIDGET DE IDENTIDADE */}
                            <div className="bg-white rounded-[36px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#cb6ce6]/20 to-transparent rounded-bl-[100px] -z-10 transition-transform duration-700 group-hover:scale-110"></div>
                                
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-6">
                                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-gray-200 to-gray-50 shadow-inner">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
                                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#cb6ce6] to-[#9c4bbb] uppercase select-none">
                                                    {user?.name?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                                            <CheckCircle2 size={12} strokeWidth={4} className="text-white"/>
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-2xl font-extrabold-id text-gray-900 tracking-tighter leading-tight mb-1">{user?.name || 'Cliente OwnMarket'}</h2>
                                    <p className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{user?.email || 'Sem e-mail'}</p>
                                </div>
                            </div>

                            {/* WIDGET DE DICAS INTELIGENTES */}
                            <div className="bg-[#cb6ce6] text-white rounded-[32px] p-6 shadow-[0_15px_40px_-10px_rgba(203,108,230,0.4)] relative overflow-hidden">
                                <Sparkles className="absolute top-4 right-4 text-white/20 w-24 h-24 rotate-12" />
                                <div className="flex items-center gap-2 mb-4 relative z-10">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <Lightbulb size={18} strokeWidth={2.5} className="text-yellow-300" />
                                    </div>
                                    <h3 className="font-extrabold-id uppercase tracking-widest text-[10px]">Dica OwnMarket</h3>
                                </div>
                                <div className="relative z-10 h-[60px] flex items-center">
                                    <p key={tipIndex} className="text-sm font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {tips[tipIndex]}
                                    </p>
                                </div>
                                {/* Indicadores de bolinha */}
                                <div className="flex gap-1.5 mt-4 relative z-10">
                                    {tips.map((_, idx) => (
                                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === tipIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}></div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* COLUNA DIREITA (Informações e Ações em Grid) */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            
                            <h3 className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest pl-2 flex items-center gap-2 mt-2 md:mt-0">
                                <User size={12} strokeWidth={3}/> Visão Geral do Perfil
                            </h3>

                            {/* GRID DE DADOS PESSOAIS */}
                            <div className="bg-white rounded-[36px] p-6 md:p-8 border border-gray-100 shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <MinimalInfoItem icon={User} label="Nome Completo" value={user?.name} />
                                    <MinimalInfoItem icon={User} label="CPF" value={user?.cpf} />
                                    <MinimalInfoItem icon={Phone} label="Telefone" value={user?.phone_number} />
                                    <MinimalInfoItem icon={Calendar} label="Nascimento" value={user?.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''} />
                                </div>
                            </div>

                            {/* GRID DE LOCALIZAÇÃO */}
                            <div className="bg-white rounded-[36px] p-6 md:p-8 border border-gray-100 shadow-sm">
                                <h4 className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <MapPin size={12} strokeWidth={3}/> Sua Localização
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <MinimalInfoItem icon={Building2} label="ID do Ponto/Máquina" value={user?.condoId} />
                                    <MinimalInfoItem icon={Home} label="Unidade/Apto" value={user?.apartment} />
                                </div>
                            </div>

                            {/* ZONA DE PERIGO / SEGURANÇA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                
                                <button 
                                    onClick={() => setShowPasswordModal(true)}
                                    className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-[28px] p-6 text-left transition-all active:scale-95 flex flex-col items-start gap-4 shadow-sm"
                                >
                                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#cb6ce6]/10 text-gray-400 group-hover:text-[#cb6ce6] rounded-2xl flex items-center justify-center transition-colors">
                                        <KeyRound size={24} strokeWidth={2.5}/>
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold-id text-gray-900 uppercase tracking-tighter text-base group-hover:text-[#cb6ce6] transition-colors">Senha de Acesso</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Toque para redefinir</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={onLogout}
                                    className="group bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-[28px] p-6 text-left transition-all active:scale-95 flex flex-col items-start gap-4 shadow-sm"
                                >
                                    <div className="w-12 h-12 bg-white text-red-500 group-hover:text-red-500 rounded-2xl flex items-center justify-center shadow-sm">
                                        <LogOut size={24} strokeWidth={2.5} className="ml-1"/>
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold-id text-red-500 group-hover:text-white uppercase tracking-tighter text-base transition-colors">Sair do App</h4>
                                        <p className="text-[10px] font-bold text-red-400/80 group-hover:text-red-100 uppercase tracking-widest mt-1 transition-colors">Desconectar conta atual</p>
                                    </div>
                                </button>

                            </div>

                        </div>
                    </div>
                </main>

                {/* --- BOTTOM NAV PREMIUM (CLEAN UI) --- */}
                <div className="md:hidden fixed bottom-0 left-0 w-full z-40 pointer-events-none">
                    
                    {/* Carrinho Flutuante (FAB) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                        <button 
                            onClick={() => handleNavChange('cart')} 
                            className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${navTab === 'cart' ? 'bg-[#cb6ce6] shadow-lg shadow-[#cb6ce6]/40 scale-105' : 'bg-white border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.1)] text-[#cb6ce6]'}`}
                        >
                            <ShoppingCart size={24} strokeWidth={2.5} className={navTab === 'cart' ? 'text-white' : ''} />
                            
                            {cart.length > 0 && (
                                <span className={`absolute -top-1 -right-1 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${navTab === 'cart' ? 'bg-gray-900' : 'bg-[#cb6ce6] animate-bounce'}`}>
                                    {cart.reduce((a,b)=>a+b.quantity,0)}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Base da Navegação Vidro */}
                    <div className="relative bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 h-[72px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex justify-between items-center pointer-events-auto">
                        
                        <button onClick={() => handleNavChange('home')} className="flex flex-col items-center gap-1 group w-16">
                            <div className={`transition-all duration-300 ${navTab === 'home' ? '-translate-y-1' : ''}`}>
                                <Home size={22} strokeWidth={navTab === 'home' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            </div>
                            <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Início</span>
                            <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                        </button>

                        <button onClick={() => handleNavChange('history')} className="flex flex-col items-center gap-1 group w-16 mr-8">
                            <div className={`transition-all duration-300 ${navTab === 'history' ? '-translate-y-1' : ''}`}>
                                <History size={22} strokeWidth={navTab === 'history' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            </div>
                            <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Pedidos</span>
                            <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                        </button>

                        <div className="w-4"></div>

                        <button onClick={() => handleNavChange('wallet')} className="flex flex-col items-center gap-1 group w-16 ml-8">
                            <div className={`transition-all duration-300 ${navTab === 'wallet' ? '-translate-y-1' : ''}`}>
                                <Wallet size={22} strokeWidth={navTab === 'wallet' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            </div>
                            <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Carteira</span>
                            <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                        </button>

                        <button onClick={() => handleNavChange('profile')} className="flex flex-col items-center gap-1 group w-16">
                            <div className={`transition-all duration-300 ${navTab === 'profile' ? '-translate-y-1' : ''}`}>
                                <User size={22} strokeWidth={navTab === 'profile' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            </div>
                            <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Perfil</span>
                            <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};


// App.js -> SUBSTITUA o seu componente Footer por este


const ChangeCondoPage = ({ user, setPage, onCondoChanged }) => {
    const [condos, setCondos] = React.useState([]);
    const [selectedCondoId, setSelectedCondoId] = React.useState(user?.condoId);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    React.useEffect(() => {
        const fetchCondos = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/condominiums`);
                const data = await response.json();
                setCondos(data);
            } catch (err) {
                setError('Falha ao carregar condomínios.');
            }
        };
        fetchCondos();
    }, []);
    const handleUpdateCondo = async () => {
        setIsLoading(true); setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/auth/update-condo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ condoId: selectedCondoId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao atualizar condomínio.');
            onCondoChanged(data.user);
            localStorage.removeItem('savedFridgeId');
            setPage('fridgeSelection');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Mudar de Condomínio</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Selecione o seu novo condomínio</h2>
                    <div className="flex flex-col gap-3">
                        {condos.map(condo => (
                            <button key={condo.id} onClick={() => setSelectedCondoId(condo.id)} className={`w-full text-left p-4 rounded-lg transition ${selectedCondoId === condo.id ? 'bg-orange-500 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {condo.name}
                            </button>
                        ))}
                    </div>
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <button onClick={handleUpdateCondo} disabled={isLoading || selectedCondoId === user.condoId} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Mudança'}
                    </button>
                </div>
            </main>
        </div>
    );
};


const DepositModal = ({ isOpen, onClose, onPix, onCard, depositAmount, setDepositAmount, formError }) => {
    // ==========================================
    // LÓGICA INTOCADA (MANTIDA EXATAMENTE IGUAL)
    // ==========================================
    if (!isOpen) return null;

    const quickValues = [20, 50, 100, 150, 200];

    const handleAction = (e, type) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const value = parseFloat(depositAmount);
        if (!value || value <= 0) {
            if (type === 'pix') onPix(0); else onCard(0);
            return;
        }
        if (type === 'pix') onPix(value); else onCard(value);
    };

    // ==========================================
    // NOVA INTERFACE: MODAL FLUTUANTE PREMIUM
    // ==========================================
    return (
        // Aqui está a correção: 'items-center p-4' garante que ele fica no meio e NUNCA ocupa a tela toda
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                
                /* Remove setas numéricas do input type=number */
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* Backdrop Escuro Profundo com Blur */}
            <div 
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            
            {/* Modal Container: Flutuante, com margens e max-h para não engolir a tela */}
            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                
                {/* Cabeçalho Fixo */}
                <div className="relative p-6 pb-4 flex items-center justify-between shrink-0 bg-white z-10">
                    <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        Recarregar Saldo
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors active:scale-90 border border-gray-100"
                    >
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>

                {/* Conteúdo com Scroll interno (proteção caso a tela do celular seja muito pequena) */}
                <div className="overflow-y-auto hide-scrollbar flex-1 pb-4">
                    
                    {/* Área de Digitação Massiva */}
                    <div className="px-6 pb-6 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Qual valor deseja adicionar?</p>
                        
                        <div className="flex justify-center items-center group relative w-fit mx-auto bg-gray-50/50 p-4 rounded-[28px] border-2 border-transparent focus-within:border-[#cb6ce6]/20 focus-within:bg-white transition-all shadow-inner focus-within:shadow-sm">
                            <span className="text-2xl font-black text-gray-300 mr-2 select-none transition-colors group-focus-within:text-[#cb6ce6]">
                                R$
                            </span>
                            <input 
                                type="number" 
                                value={depositAmount} 
                                onChange={(e) => setDepositAmount(e.target.value)} 
                                placeholder="0,00" 
                                className="w-full max-w-[160px] bg-transparent text-center text-5xl font-black text-gray-900 placeholder-gray-200 focus:outline-none tracking-tighter" 
                                autoFocus 
                            />
                        </div>
                        {formError && <p className="text-red-500 text-[10px] font-extrabold-id uppercase tracking-widest mt-4 animate-pulse">{formError}</p>}
                    </div>

                    {/* Valores Rápidos em Botões Compactos */}
                    <div className="flex flex-wrap justify-center gap-2 px-6 mb-8">
                        {quickValues.map((val) => {
                            const isSelected = parseFloat(depositAmount) === val;
                            return (
                                <button 
                                    key={val} 
                                    type="button" 
                                    onClick={() => setDepositAmount(val.toString())} 
                                    className={`px-4 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 border-2 
                                        ${isSelected 
                                            ? 'bg-[#cb6ce6] text-white border-[#cb6ce6] shadow-md shadow-[#cb6ce6]/30' 
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-[#cb6ce6]/30 hover:bg-gray-50'
                                        }`}
                                >
                                    R$ {val}
                                </button>
                            );
                        })}
                    </div>

                    {/* Área de Seleção de Pagamento */}
                    <div className="bg-gray-50 px-6 py-5 border-t border-gray-100 rounded-t-[32px] mx-2 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                        <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-3 pl-2 text-center">Como você quer pagar?</p>
                        
                        <div className="space-y-2.5">
                            {/* Cartão de Ação: PIX */}
                            <button 
                                type="button" 
                                onClick={(e) => handleAction(e, 'pix')} 
                                className="group w-full relative overflow-hidden bg-white hover:bg-green-50 border border-gray-100 hover:border-green-200 p-3 rounded-[20px] flex items-center justify-between shadow-sm transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 bg-green-500 text-white rounded-[14px] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        <QrCode size={22} strokeWidth={2.5}/>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-extrabold-id text-gray-900 text-sm uppercase tracking-tighter leading-none mb-1">PIX Instantâneo</p>
                                        <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Zap size={10} fill="currentColor"/> Sem taxas • Cai na hora
                                        </p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <ChevronRight size={16} strokeWidth={3} />
                                </div>
                            </button>

                            {/* Cartão de Ação: Cartão de Crédito */}
                            <button 
                                type="button" 
                                onClick={(e) => handleAction(e, 'card')} 
                                className="group w-full bg-white hover:bg-gray-50 border border-gray-100 p-3 rounded-[20px] flex items-center justify-between shadow-sm transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-[14px] flex items-center justify-center border border-gray-100 group-hover:text-gray-900 group-hover:scale-105 transition-all duration-500">
                                        <CreditCard size={22} strokeWidth={2.5}/>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-extrabold-id text-gray-900 text-sm uppercase tracking-tighter leading-none mb-1">Cartão de Crédito</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Via Mercado Pago</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                    <ChevronRight size={16} strokeWidth={3} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};



const TransferModal = ({ isOpen, onClose, onSubmit, recipientEmail, setRecipientEmail, transferAmount, setTransferAmount, formError, isVerifying }) => {
    
    if (!isOpen) return null;

    // Função para evitar propagação de clique
    const handleModalClick = (e) => e.stopPropagation();

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            
            {/* Backdrop com Blur */}
            <div 
                className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm transition-opacity animate-in fade-in" 
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div 
                onClick={handleModalClick}
                className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            >
                {/* Header */}
                <div className="relative p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> 
                        Nova Transferência
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full bg-black/20 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6">
                    
                    {/* --- INPUT HERO (VALOR) --- */}
                    <div className="mb-8 relative">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 block text-center">
                            Quanto você quer enviar?
                        </label>
                        <div className="relative flex items-center justify-center group">
                            <span className="text-3xl font-bold text-gray-500 mr-2 mb-1">R$</span>
                            <input 
                                type="number" 
                                value={transferAmount} 
                                onChange={(e) => setTransferAmount(e.target.value)} 
                                placeholder="0,00" 
                                className="w-full bg-transparent border-b-2 border-white/10 py-4 text-center text-5xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-all"
                                autoFocus 
                            />
                        </div>
                    </div>

                    {/* --- CARD DE DESTINATÁRIO --- */}
                    <div className="mb-8">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                            Para quem?
                        </label>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-100 transition duration-500"></div>
                            <div className="relative bg-[#0f172a] border border-white/10 rounded-xl p-1 flex items-center">
                                <div className="p-3 bg-white/5 rounded-lg mr-3 text-blue-400">
                                    <User size={24} />
                                </div>
                                <div className="flex-1 pr-2">
                                    <input 
                                        type="email" 
                                        value={recipientEmail} 
                                        onChange={(e) => setRecipientEmail(e.target.value)} 
                                        placeholder="email@destinatario.com" 
                                        className="w-full bg-transparent text-white font-medium placeholder-gray-500 focus:outline-none h-full py-2"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-0.5">Digite o e-mail da conta SmartFridge</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensagem de Erro */}
                    {formError && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 justify-center animate-pulse">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            <p className="text-red-400 text-xs font-bold">{formError}</p>
                        </div>
                    )}

                    {/* --- BOTÃO DE AÇÃO --- */}
                    <button 
                        type="submit" 
                        disabled={isVerifying} 
                        className="group w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {isVerifying ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="font-bold">Buscando conta...</span>
                                </>
                            ) : (
                                <>
                                    <span className="font-bold text-lg">Continuar</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                        
                        {/* Brilho de Fundo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>

                    {/* Footer Info */}
                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
                            <Wallet size={10} /> Transferência instantânea e segura
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

const WalletPage = ({ 
    user, setPage, setPaymentData, setDepositData, setPaymentMethod, 
    updateUserBalance, showToast, cart = [], API_URL
}) => {
    
    const BASE_URL = API_URL || 'http://localhost:5000';
    const [showBalance, setShowBalance] = React.useState(true);
    const [recentTransactions, setRecentTransactions] = React.useState([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = React.useState(true);
    
    // Modais e Loadings
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
    const [isCreatingDeposit, setIsCreatingDeposit] = React.useState(false); 
    
    // Forms
    const [depositAmount, setDepositAmount] = React.useState('');
    const [transferAmount, setTransferAmount] = React.useState('');
    const [recipientEmail, setRecipientEmail] = React.useState('');
    const [formError, setFormError] = React.useState('');
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [isTransferring, setIsTransferring] = React.useState(false);
    const [recipientDetails, setRecipientDetails] = React.useState(null);
    const [navTab, setNavTab] = React.useState('wallet');

    // Navegação
    const handleNavChange = (tabId) => {
        if (tabId === 'wallet') return;
        setNavTab(tabId);
        setTimeout(() => { if(tabId === 'cart') setPage('cart'); else setPage(tabId); }, 200);
    };

    // Fetch Transações
    React.useEffect(() => {
        if (updateUserBalance) updateUserBalance();
        const fetchRecent = async () => {
            setIsLoadingTransactions(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await fetch(`${BASE_URL}/api/wallet/recent-transactions`, { headers: { 'Authorization': `Bearer ${token}` } });
                if(response.ok) { const data = await response.json(); setRecentTransactions(data); }
            } catch (error) { console.error("Erro transações:", error); } 
            finally { setIsLoadingTransactions(false); }
        };
        fetchRecent();
    }, [updateUserBalance, BASE_URL]);

    // Handler Depósito (COM EFEITO DE CARREGAMENTO)
    const handleCreatePixDeposit = async (amount) => {
        if (!amount || amount <= 0) { setFormError('Insira um valor válido.'); return; }
        
        // 1. Inicia o Loading Global
        setIsCreatingDeposit(true);
        setFormError('');
        
        // 2. Fecha o modal
        setIsDepositModalOpen(false);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/wallet/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao criar depósito.');
            if (!data.amount) data.amount = parseFloat(amount);
            
            setPaymentData(data);
            setPage('payment'); 
        } catch (err) { 
            alert(`Erro: ${err.message}`);
        } finally {
            setIsCreatingDeposit(false);
        }
    };

    // Handler Verificação Transferência
    const handleVerifyRecipient = async (e) => {
        e?.preventDefault(); 
        if (!recipientEmail || !transferAmount || parseFloat(transferAmount) <= 0) { setFormError('Dados inválidos.'); return; }
        setIsVerifying(true); setFormError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/wallet/verify-recipient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ recipientEmail })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setRecipientDetails(data); setIsTransferModalOpen(false); setShowConfirmationModal(true); 
        } catch (err) { setFormError(err.message); } finally { setIsVerifying(false); }
    };

    // Handler Confirmar Transferência
    const handleConfirmTransfer = async () => {
        setIsTransferring(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/wallet/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ recipientEmail, amount: parseFloat(transferAmount) })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setShowConfirmationModal(false); if(showToast) showToast("Transferência Concluída!");
            updateUserBalance(); setRecipientEmail(''); setTransferAmount('');
            // Atualiza histórico localmente sem precisar recarregar a página
            setRecentTransactions(prev => [{
                id: Date.now(), type: 'transfer_out', amount: -parseFloat(transferAmount), 
                description: `Para ${recipientDetails?.name}`, created_at: new Date().toISOString()
            }, ...prev]);
        } catch (err) { setFormError(err.message); setShowConfirmationModal(false); setIsTransferModalOpen(true); } 
        finally { setIsTransferring(false); }
    };

    // === COMPONENTES VISUAIS (CLEAN UI PREMIUM) ===
    const VirtualCard = () => (
        <div className="relative h-56 w-full rounded-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(203,108,230,0.3)] transition-transform hover:scale-[1.02] duration-500 group select-none">
            {/* Fundo Premium Misto Escuro/Roxo */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-[#cb6ce6]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            {/* Efeitos de Luz Internos */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#cb6ce6]/30 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 p-7 flex flex-col justify-between h-full border border-white/10 rounded-[32px]">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white/60 text-[10px] font-extrabold-id uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            Saldo Disponível
                            <button onClick={() => setShowBalance(!showBalance)} className="text-white/40 hover:text-white transition-colors p-1 bg-white/5 rounded-full backdrop-blur-sm">
                                {showBalance ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                        </p>
                        <div className="flex items-baseline gap-2">
                            {showBalance ? (
                                <>
                                    <span className="text-white/60 font-bold text-lg">R$</span>
                                    <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-md tracking-tighter leading-none">
                                        {user?.wallet_balance ? parseFloat(user.wallet_balance).toFixed(2).replace('.', ',') : '0,00'}
                                    </h2>
                                </>
                            ) : (
                                <h2 className="text-4xl md:text-5xl font-black text-white/50 tracking-widest leading-none mt-1">••••••</h2>
                            )}
                        </div>
                    </div>
                    <div className="p-2.5 bg-white/10 rounded-[14px] backdrop-blur-md border border-white/10">
                        <CreditCard className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                    <div>
                        <p className="text-white/40 text-[9px] font-extrabold-id uppercase tracking-widest mb-0.5">Titular</p>
                        <p className="text-white font-bold text-sm uppercase tracking-wider truncate max-w-[150px]">{user?.name || 'Cliente'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <Zap size={14} className="text-[#cb6ce6]" fill="currentColor" />
                        <span className="text-white text-[10px] font-extrabold-id tracking-widest uppercase">Own Pay</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const ActionTile = ({ icon: Icon, label, colorClass, bgClass, onClick }) => (
        <button 
            onClick={onClick} 
            className="flex flex-col items-center justify-center gap-2.5 bg-white border border-gray-100 rounded-[24px] p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-200 active:scale-95 transition-all duration-300 group"
        >
            <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center ${bgClass} ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-extrabold-id text-gray-500 group-hover:text-gray-900 uppercase tracking-widest">{label}</span>
        </button>
    );

    const TransactionItem = ({ tx }) => {
        const isDeposit = tx.type === 'deposit' || tx.type === 'transfer_in';
        return (
            <div className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-gray-100 hover:shadow-sm hover:border-gray-200 transition-all group cursor-default">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isDeposit ? 'bg-green-50 text-green-500 border border-green-100' : 'bg-gray-50 text-gray-900 border border-gray-200'}`}>
                        {isDeposit ? <ArrowDownLeft size={20} strokeWidth={3} /> : <ArrowUpRight size={20} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 pr-4">
                        <p className="text-gray-900 font-extrabold-id text-sm capitalize truncate leading-tight group-hover:text-[#cb6ce6] transition-colors">
                            {tx.description || tx.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')} • {new Date(tx.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <span className={`font-black text-base tracking-tighter ${isDeposit ? 'text-green-500' : 'text-gray-900'}`}>
                        {isDeposit ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col selection:bg-[#cb6ce6]/20">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* OVERLAY DE CARREGAMENTO GERAL (CLEAN UI) */}
            {isCreatingDeposit && (
                <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in px-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#cb6ce6]/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative bg-white p-5 rounded-[24px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(203,108,230,0.3)]">
                            <Loader2 size={40} strokeWidth={3} className="text-[#cb6ce6] animate-spin" />
                        </div>
                    </div>
                    <h2 className="text-gray-900 font-extrabold-id text-2xl mt-6 tracking-tighter uppercase">Gerando PIX</h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Conectando ao Banco Central...</p>
                </div>
            )}

            {/* MODAIS (Devem estar sendo importados e estilizados no seu projeto principal) */}
            {/* Assumindo que os Modals já existem. Se precisarem do design Clean UI, me avise. */}
            {typeof DepositModal !== 'undefined' && <DepositModal isOpen={isDepositModalOpen} onClose={() => { setIsDepositModalOpen(false); setFormError(''); setDepositAmount(''); }} onPix={handleCreatePixDeposit} onCard={() => alert("Em breve!")} depositAmount={depositAmount} setDepositAmount={setDepositAmount} formError={formError} />}
            {typeof TransferModal !== 'undefined' && <TransferModal isOpen={isTransferModalOpen} onClose={() => { setIsTransferModalOpen(false); setFormError(''); setRecipientEmail(''); setTransferAmount(''); }} onSubmit={handleVerifyRecipient} recipientEmail={recipientEmail} setRecipientEmail={setRecipientEmail} transferAmount={transferAmount} setTransferAmount={setTransferAmount} formError={formError} isVerifying={isVerifying} />}
            {typeof TransferConfirmationModal !== 'undefined' && <TransferConfirmationModal isOpen={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} onConfirm={handleConfirmTransfer} recipient={recipientDetails} amount={transferAmount} isTransferring={isTransferring} />}

            {/* HEADER CLEAN UI */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 pb-4 pt-6">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setPage('home')} 
                            className="w-10 h-10 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#cb6ce6] hover:border-[#cb6ce6]/30 hover:bg-[#cb6ce6]/5 transition-all active:scale-95 shadow-sm"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5}/>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Minha Carteira</h1>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Gestão Financeira</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 pb-36 max-w-lg flex-1">
                
                {/* CARTÃO VIRTUAL */}
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <VirtualCard />
                </div>
                
                {/* BOTÕES DE AÇÃO RÁPIDA */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <ActionTile 
                        icon={ArrowDownToLine} 
                        label="Depositar" 
                        colorClass="text-green-500" 
                        bgClass="bg-green-50 border border-green-100" 
                        onClick={() => setIsDepositModalOpen(true)} 
                    />
                    <ActionTile 
                        icon={ArrowRightLeft} 
                        label="Transferir" 
                        colorClass="text-blue-500" 
                        bgClass="bg-blue-50 border border-blue-100" 
                        onClick={() => setIsTransferModalOpen(true)} 
                    />
                    <ActionTile 
                        icon={History} 
                        label="Extrato" 
                        colorClass="text-[#cb6ce6]" 
                        bgClass="bg-[#cb6ce6]/10 border border-[#cb6ce6]/20" 
                        onClick={() => setPage('history')} 
                    />
                </div>
                
                {/* LISTA DE TRANSAÇÕES */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-sm font-extrabold-id text-gray-400 uppercase tracking-widest">Últimas Transações</h3>
                        <button 
                            onClick={() => setPage('history')} 
                            className="text-[9px] text-gray-500 font-bold uppercase tracking-widest hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
                        >
                            Ver completo
                        </button>
                    </div>
                    
                    <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2">
                        {isLoadingTransactions ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="animate-spin text-[#cb6ce6]" size={32} />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Buscando histórico...</p>
                            </div>
                        ) : recentTransactions.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {recentTransactions.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4 flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3 border border-gray-100">
                                    <History size={20} strokeWidth={2.5}/>
                                </div>
                                <p className="text-gray-900 font-extrabold-id uppercase tracking-tighter">Nenhuma movimentação</p>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 max-w-[200px]">Seu histórico de depósitos aparecerá aqui.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- BOTTOM NAV PREMIUM (CLEAN UI) --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-40 pointer-events-none">
                
                {/* Carrinho Flutuante (FAB) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button 
                        onClick={() => handleNavChange('cart')} 
                        className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${navTab === 'cart' ? 'bg-[#cb6ce6] shadow-lg shadow-[#cb6ce6]/40 scale-105' : 'bg-white border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.1)] text-[#cb6ce6]'}`}
                    >
                        <ShoppingCart size={24} strokeWidth={2.5} className={navTab === 'cart' ? 'text-white' : ''} />
                        
                        {cart.length > 0 && (
                            <span className={`absolute -top-1 -right-1 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${navTab === 'cart' ? 'bg-gray-900' : 'bg-[#cb6ce6] animate-bounce'}`}>
                                {cart.reduce((a,b)=>a+b.quantity,0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Base da Navegação Vidro */}
                <div className="relative bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 h-[72px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex justify-between items-center pointer-events-auto">
                    
                    <button onClick={() => handleNavChange('home')} className="flex flex-col items-center gap-1 group w-16">
                        <div className={`transition-all duration-300 ${navTab === 'home' ? '-translate-y-1' : ''}`}>
                            <Home size={22} strokeWidth={navTab === 'home' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Início</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <button onClick={() => handleNavChange('history')} className="flex flex-col items-center gap-1 group w-16 mr-8">
                        <div className={`transition-all duration-300 ${navTab === 'history' ? '-translate-y-1' : ''}`}>
                            <History size={22} strokeWidth={navTab === 'history' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Pedidos</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <div className="w-4"></div>

                    <button onClick={() => handleNavChange('wallet')} className="flex flex-col items-center gap-1 group w-16 ml-8">
                        <div className={`transition-all duration-300 ${navTab === 'wallet' ? '-translate-y-1' : ''}`}>
                            <Wallet size={22} strokeWidth={navTab === 'wallet' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Carteira</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <button onClick={() => handleNavChange('profile')} className="flex flex-col items-center gap-1 group w-16">
                        <div className={`transition-all duration-300 ${navTab === 'profile' ? '-translate-y-1' : ''}`}>
                            <User size={22} strokeWidth={navTab === 'profile' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Perfil</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE DE SUCESSO DA COMPRA (PRODUTOS) ---
const PostPaymentStatusPage = ({ user, setPage }) => {
    // === CONSTANTES ===
    const UNLOCK_TIME = 11;
    const RELOCK_TIME = 20;

    // === ESTADOS ===
    const [stage, setStage] = useState('processing');
    const [countdown, setCountdown] = useState(UNLOCK_TIME);
    const propsRef = useRef({ user, setPage });

    // Mensagens do Banner
    const messages = [
        "Ambiente monitorado 24h",
        "Aguarde o destravamento",
        "Suporte via App",
        "Retravamento automático",
        "Compra segura"
    ];

    // === LÓGICA DE TEMPO (Intacta) ===
    useEffect(() => {
        propsRef.current = { user, setPage };
        
        if (stage === 'processing') {
            setCountdown(UNLOCK_TIME);
            const interval = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
            const stageTimeout = setTimeout(() => setStage('success'), UNLOCK_TIME * 1000);
            return () => { clearInterval(interval); clearTimeout(stageTimeout); };
        } else if (stage === 'success') {
            setCountdown(RELOCK_TIME);
            const interval = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
            const redirectTimeout = setTimeout(() => {
                if (propsRef.current.setPage) propsRef.current.setPage('home');
                else window.location.href = '/';
            }, RELOCK_TIME * 1000);
            return () => { clearInterval(interval); clearTimeout(redirectTimeout); };
        }
    }, [stage, setPage, user]);

    // Cálculo da Barra Linear
    const maxTime = stage === 'processing' ? UNLOCK_TIME : RELOCK_TIME;
    const progress = (countdown / maxTime) * 100;

    return (
        // Usando um fundo gradiente sutil para dar profundidade ao vidro
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#131c2e] to-black flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-orange-500/30 animate-fade-in">
            
            {/* === AMBIENT LIGHTS (Glow de fundo que reflete no vidro) === */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 transition-all duration-[1500ms] 
                    ${stage === 'processing' ? 'bg-orange-600/40 translate-y-0' : 'bg-blue-600/20 -translate-y-20'}`} />
                
                <div className={`absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 transition-all duration-[1500ms]
                    ${stage === 'success' ? 'bg-emerald-600/40 translate-y-0' : 'bg-orange-600/10 translate-y-20'}`} />
            </div>

            {/* === CARD PRINCIPAL (GLASSMORPHISM PREMIUM) === */}
            {/* backdrop-blur-xl, bg-opacity, border-white/10 são chave para o efeito vidro */}
            <div className="relative w-full max-w-[380px] bg-[#1e293b]/70 backdrop-blur-2xl border border-white/10 rounded-[36px] overflow-hidden shadow-2xl shadow-black/50 transition-all duration-700 z-10">
                
                {/* Efeito de reflexo superior no vidro */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {/* 1. Header / Ícone */}
                <div className="pt-12 pb-10 flex flex-col items-center justify-center text-center px-8 relative">
                    
                    {/* Ícone em um "botão de vidro" */}
                    <div className="relative mb-6 group">
                        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-700 ${stage === 'processing' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg backdrop-blur-md
                            ${stage === 'processing' 
                                ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-400/30' 
                                : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-400/30'
                            }`}
                        >
                            {stage === 'processing' ? (
                                <Loader2 size={36} className="text-orange-400 animate-spin drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                            ) : (
                                <CheckCircle2 size={36} className="text-emerald-400 animate-in zoom-in duration-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            )}
                        </div>
                    </div>

                    {/* Textos */}
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-3 drop-shadow-md">
                        {stage === 'processing' ? 'Validando Pagamento' : 'Acesso Liberado!'}
                    </h2>
                    <p className="text-white/60 font-medium text-[15px] leading-relaxed max-w-[260px]">
                        {stage === 'processing' 
                            ? 'Aguarde, estamos finalizando a validação da sua compra.' 
                            : 'Porta destravada. Retire seus produtos agora.'}
                    </p>
                </div>

                {/* 2. Área do Contador e Barra Linear */}
                <div className="px-8 pb-12 relative z-20">
                    <div className="flex justify-between items-end mb-4">
                        <div className="flex items-center gap-2 text-white/40">
                             {stage === 'processing' ? <Clock size={14}/> : <Zap size={14} className={stage === 'success' ? 'text-emerald-400' : ''}/>}
                             <span className="text-[11px] font-bold uppercase tracking-widest">
                                {stage === 'processing' ? 'Tempo estimado' : 'Fechando em'}
                            </span>
                        </div>
                        <span className={`text-5xl font-black tabular-nums tracking-tighter transition-all duration-500 drop-shadow-lg
                            ${stage === 'processing' ? 'text-orange-400' : 'text-emerald-400'}`}>
                            {countdown}<span className="text-2xl ml-1 opacity-50">s</span>
                        </span>
                    </div>

                    {/* Barra Reta (Container estilo "trilho") */}
                    <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                        {/* Barra Reta (Preenchimento com Glow) */}
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-linear relative
                                ${stage === 'processing' 
                                    ? 'bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                                    : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}
                            style={{ width: `${progress}%` }}
                        >
                            {/* Brilho na ponta da barra */}
                             <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/40 to-transparent rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* 3. Banner de Informações (Footer do Card em Vidro Mais Escuro) */}
                <div className="bg-black/30 backdrop-blur-md border-t border-white/10 py-4 relative overflow-hidden rounded-b-[36px]">
                    {/* Fades laterais */}
                    <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-black/40 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-black/40 to-transparent z-10 pointer-events-none"></div>

                    <div className="flex items-center animate-marquee whitespace-nowrap px-4 relative z-0">
                        {[...Array(4)].map((_, i) => (
                            <React.Fragment key={i}>
                                {messages.map((msg, idx) => (
                                    <div key={`${i}-${idx}`} className="flex items-center gap-2 mx-5 transition-colors duration-500">
                                        {idx % 2 === 0 ? 
                                            <ShieldCheck size={14} className={stage === 'processing' ? 'text-orange-500/70' : 'text-emerald-500/70'}/> : 
                                            <Info size={14} className={stage === 'processing' ? 'text-orange-500/70' : 'text-emerald-500/70'}/>
                                        }
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">{msg}</span>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

            </div>

            {/* Styles para Marquee e FadeIn */}
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 45s linear infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

const AdminStatCard = ({ icon, label, value, colorClass = 'text-orange-400' }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-gray-700 ${colorClass}`}>{icon}</div>
        <div><p className="text-gray-400 text-sm">{label}</p><p className="text-2xl font-bold">{value}</p></div>
    </div>
);

const DailyPromotionsWidget = ({ token }) => {
    const [promotions, setPromotions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await fetch(`${API_URL}/api/admin/promotions/daily`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPromotions(data);
                }
            } catch (error) {
                console.error("Erro ao buscar promoções:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPromotions();
    }, [token]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Flame className="text-orange-400" /> Promoções do Dia</h3>
            {isLoading ? <Loader2 className="animate-spin" /> : promotions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {promotions.map(p => (
                        <div key={p.id} className="bg-gray-700 p-2 rounded-md text-center">
                            <img src={p.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} alt={p.name} className="w-full h-20 object-cover rounded-md mb-2" />
                            <p className="text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-xs text-gray-400 line-through">R$ {parseFloat(p.sale_price).toFixed(2)}</p>
                            <p className="font-bold text-orange-400">R$ {parseFloat(p.promotional_price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-400">Nenhuma promoção ativa hoje.</p>}
        </div>
    );
};

// =================================================================================
// COMPONENTE DE VENDAS (SalesPage) - VERSÃO FINAL C/ DIAGNÓSTICO DE ERRO
// =================================================================================

const SalesPage = ({ condominiums, token }) => {
    // Estados de Dados
    const [orders, setOrders] = React.useState([]);
    const [meta, setMeta] = React.useState({ currentPage: 1, totalPages: 1, totalRevenue: 0, totalItems: 0 });
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    // Estados do Modal
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [orderItems, setOrderItems] = React.useState([]);
    const [loadingItems, setLoadingItems] = React.useState(false);

    // Filtros (Datas vazias = Todo o período)
    const [filters, setFilters] = React.useState({
        startDate: '', 
        endDate: '',
        condoId: condominiums?.[0]?.id || 'all',
        status: 'all',
        search: ''
    });

    const fetchSales = React.useCallback(async (page = 1) => {
        setLoading(true);
        setError('');
        
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 10); // 10 itens por página

        // Só envia datas se o usuário selecionou
        if (filters.startDate) params.append('startDate', `${filters.startDate} 00:00:00`);
        if (filters.endDate) params.append('endDate', `${filters.endDate} 23:59:59`);
        
        if (filters.condoId && filters.condoId !== 'all') params.append('condoId', filters.condoId);
        if (filters.status !== 'all') params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);

        try {
            const res = await fetch(`${API_URL}/api/admin/sales?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error("Erro ao carregar dados.");
            
            const responseData = await res.json();

            // Lógica para lidar com o novo formato { data: [], meta: {} }
            if (responseData.data && Array.isArray(responseData.data)) {
                setOrders(responseData.data);
                setMeta(responseData.meta);
            } else if (Array.isArray(responseData)) {
                // Fallback caso o backend ainda esteja enviando array antigo
                setOrders(responseData);
            } else {
                setOrders([]);
            }

        } catch (err) {
            console.error(err);
            setError("Falha na comunicação.");
        } finally {
            setLoading(false);
        }
    }, [filters, token]);

    // Carrega página 1 ao montar ou mudar filtros
    React.useEffect(() => { fetchSales(1); }, []);

    // Handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            fetchSales(newPage);
        }
    };

    const handleApplyFilters = () => fetchSales(1); // Volta para pág 1 ao filtrar

    const handleInputChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Detalhes e Estorno (Mantidos iguais)
    const handleOpenDetails = async (order) => {
        setSelectedOrder(order);
        setLoadingItems(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/sales/${order.id}/items`, { headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) setOrderItems(await res.json());
        } catch (err) { console.error(err); } finally { setLoadingItems(false); }
    };

    const handleRefund = async () => {
        if (!selectedOrder) return;
        const confirm = prompt("Digite ESTORNAR para confirmar:");
        if (confirm !== "ESTORNAR") return;
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${selectedOrder.id}/refund`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) { alert("Estornado!"); setSelectedOrder(null); fetchSales(meta.currentPage); } 
        } catch (err) { alert("Erro."); }
    };

    // Componentes de UI atualizados para Clean Design
    const KPICard = ({ label, value, icon, iconColor, iconBg }) => (
        <div className="p-6 rounded-[28px] border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 w-full transition-transform hover:scale-[1.02]">
            <div className={`p-4 rounded-2xl flex-shrink-0 ${iconBg} ${iconColor}`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-extrabold-id uppercase tracking-widest truncate">{label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1 truncate">{value}</p>
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        const styles = { 
            paid: 'text-green-600 bg-green-50 border-green-100', 
            pending: 'text-yellow-600 bg-yellow-50 border-yellow-100', 
            failed: 'text-red-600 bg-red-50 border-red-100', 
            refunded: 'text-gray-400 bg-gray-100 border-gray-200 line-through' 
        };
        return (
            <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-extrabold-id uppercase tracking-widest ${styles[status]}`}>
                {status === 'paid' ? 'APROVADO' : status === 'refunded' ? 'ESTORNADO' : status}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-6 pb-24 animate-fade-in px-4 md:px-8 max-w-7xl mx-auto w-full pt-8 font-sans bg-gray-50 min-h-screen">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Header Mobile / Desktop */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        HISTÓRICO <span className="text-[#cb6ce6]">VENDAS</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Registro completo de transações</p>
                </div>
                
                <div className="text-[10px] text-gray-500 font-extrabold-id uppercase tracking-widest bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm">
                    {meta.totalItems} registros • Pág {meta.currentPage}/{meta.totalPages}
                </div>
            </div>

            {/* KPIs (Fundo Branco, Sombras Suaves) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <KPICard 
                    label="Faturamento Total" 
                    value={`R$ ${meta.totalRevenue ? meta.totalRevenue.toFixed(2).replace('.', ',') : '0,00'}`} 
                    icon={<DollarSign size={24} strokeWidth={2.5}/>} 
                    iconColor="text-green-500" iconBg="bg-green-50"
                />
                <KPICard 
                    label="Total de Vendas" 
                    value={meta.totalItems} 
                    icon={<ShoppingCart size={24} strokeWidth={2.5}/>} 
                    iconColor="text-blue-500" iconBg="bg-blue-50"
                />
                <KPICard 
                    label="Ticket Médio" 
                    value={`R$ ${meta.totalItems > 0 ? (meta.totalRevenue / meta.totalItems).toFixed(2).replace('.', ',') : '0,00'}`} 
                    icon={<TrendingUp size={24} strokeWidth={2.5}/>} 
                    iconColor="text-[#cb6ce6]" iconBg="bg-[#cb6ce6]/10"
                />
            </div>

            {/* Filtros Clean UI */}
            <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                <div className="flex flex-col lg:flex-row gap-4 items-end w-full">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Buscar Pedido</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" size={18} strokeWidth={2.5} />
                            <input name="search" value={filters.search} onChange={handleInputChange} placeholder="Nome, ID do pedido..." className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-gray-900 text-sm font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all placeholder-gray-300" />
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full lg:w-auto">
                        <div className="flex-1 lg:w-36 space-y-2 min-w-0">
                            <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">De</label>
                            <input name="startDate" type="date" value={filters.startDate} onChange={handleInputChange} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 text-sm font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="flex-1 lg:w-36 space-y-2 min-w-0">
                            <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Até</label>
                            <input name="endDate" type="date" value={filters.endDate} onChange={handleInputChange} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 text-sm font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all" />
                        </div>
                    </div>

                    <button onClick={handleApplyFilters} className="w-full lg:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-[10px] rounded-2xl py-4 px-10 shadow-lg shadow-[#cb6ce6]/25 flex justify-center items-center gap-2 active:scale-95 transition-all">
                        <Filter size={16} strokeWidth={2.5} /> FILTRAR
                    </button>
                </div>
            </div>

            {/* Tabela de Vendas Premium (Blindada contra overflow) */}
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
                
                {/* Scroll apenas dentro da tabela */}
                <div className="overflow-x-auto hide-scrollbar w-full min-h-[350px]">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-400 border-b border-gray-100 text-[9px] font-extrabold-id uppercase tracking-widest">
                                <th className="p-6 pl-8">Data / Hora</th>
                                <th className="p-6">Cliente / Local</th>
                                <th className="p-6">Resumo</th>
                                <th className="p-6">Valor Total</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Recibo</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="p-24 text-center"><Loader2 className="animate-spin inline mr-2 text-[#cb6ce6]" size={32}/></td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="p-24 text-center text-gray-400 font-extrabold-id text-[11px] uppercase tracking-widest">Nenhum registro encontrado.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer group" onClick={() => handleOpenDetails(order)}>
                                        <td className="p-6 pl-8">
                                            <div className="font-extrabold-id text-gray-900 text-sm">{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(order.created_at).toLocaleTimeString('pt-BR').slice(0,5)}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{order.user_name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[180px] mt-1 flex items-center gap-1">
                                                <MapPin size={10} className="text-gray-300"/> {order.condo_name}
                                            </div>
                                        </td>
                                        <td className="p-6 text-gray-500 text-xs font-medium max-w-[200px] truncate">
                                            {order.product_summary || 'Ver detalhes na nota'}
                                        </td>
                                        <td className={`p-6 font-black text-lg ${order.status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                            R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="p-6">{getStatusBadge(order.status)}</td>
                                        <td className="p-6 text-center">
                                            <button className="text-[#cb6ce6]/50 group-hover:text-[#cb6ce6] bg-gray-50 group-hover:bg-[#cb6ce6]/10 p-3 rounded-xl transition-all shadow-sm border border-transparent group-hover:border-[#cb6ce6]/20">
                                                <Receipt size={18} strokeWidth={2.5} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- CONTROLES DE PAGINAÇÃO (Design Flutuante) --- */}
                <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button 
                        onClick={() => handlePageChange(meta.currentPage - 1)} 
                        disabled={meta.currentPage === 1}
                        className="w-full sm:w-auto px-6 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-extrabold-id uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all active:scale-95"
                    >
                        <ChevronLeft size={16} strokeWidth={3} /> Anterior
                    </button>
                    
                    <div className="flex gap-2">
                        {[...Array(meta.totalPages || 1)].map((_, i) => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${meta.currentPage === i + 1 ? 'bg-[#cb6ce6] w-6' : 'bg-gray-200 w-2'}`}></div>
                        ))}
                    </div>

                    <button 
                        onClick={() => handlePageChange(meta.currentPage + 1)} 
                        disabled={meta.currentPage >= meta.totalPages}
                        className="w-full sm:w-auto px-6 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-extrabold-id uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all active:scale-95"
                    >
                        Próxima <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Modal de Detalhes da Venda (Recibo Clean) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 sm:p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2 text-xl mb-1">
                                    <Receipt size={24} className="text-[#cb6ce6]"/> Recibo
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: #{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm active:scale-95"><X size={18} strokeWidth={3}/></button>
                        </div>
                        
                        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 bg-white hide-scrollbar">
                            {loadingItems ? <Loader2 className="animate-spin mx-auto text-[#cb6ce6]" size={32}/> : (
                                <div className="space-y-6">
                                    {/* Lista de Produtos */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Itens do Pedido</h4>
                                        {orderItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span className="text-gray-500 font-bold text-sm">{item.quantity}x <span className="text-gray-900 ml-1">{item.name}</span></span>
                                                <span className="text-gray-900 font-black">R$ {(item.quantity * item.price_at_purchase).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Totalizador */}
                                    <div className="bg-green-50/50 rounded-[20px] p-6 border border-green-100 flex justify-between items-center">
                                        <span className="text-green-700 font-extrabold-id uppercase tracking-widest text-[11px]">Total Pago</span>
                                        <span className="text-3xl font-black text-green-600">R$ {Number(selectedOrder.total_amount).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Rodapé e Botão de Estorno */}
                        <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            {selectedOrder.status === 'paid' ? (
                                <button 
                                    onClick={handleRefund} 
                                    className="w-full py-4.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl text-[11px] font-extrabold-id uppercase tracking-widest flex justify-center items-center gap-2 transition-all active:scale-95"
                                >
                                    <RotateCcw size={18} strokeWidth={3}/> Solicitar Estorno
                                </button>
                            ) : (
                                <div className="w-full text-center text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest py-3">
                                    Pedido {selectedOrder.status === 'refunded' ? 'Estornado' : 'Com Falha'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CentralCashierPage = ({ token }) => {
    // --- ESTADOS ---
    const [summary, setSummary] = React.useState(null);
    const [movements, setMovements] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    // --- FILTROS ---
    const getTodayISO = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    const getFirstDayOfMonth = () => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    };

    const [filters, setFilters] = React.useState({
        startDate: getFirstDayOfMonth(),
        endDate: getTodayISO(),
        type: 'all' // 'all', 'entrada', 'saida'
    });

    // --- MODAIS ---
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    
    // --- FORMULÁRIO SAQUE ---
    const [withdrawType, setWithdrawType] = React.useState('net_profit');
    const [withdrawAmount, setWithdrawAmount] = React.useState('');
    const [withdrawReason, setWithdrawReason] = React.useState('');
    const [processing, setProcessing] = React.useState(false);

    // --- BUSCA DADOS ---
    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            // 1. Prepara parâmetros de filtro para o Histórico
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.type !== 'all') params.append('type', filters.type);

            // 2. Busca em paralelo (Resumo é sempre total, Histórico é filtrado)
            const [resSummary, resHistory] = await Promise.all([
                fetch(`${API_URL}/api/admin/cashier/summary`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/cashier/history?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (resSummary.ok && resHistory.ok) {
                setSummary(await resSummary.json());
                setMovements(await resHistory.json());
            }
        } catch (error) {
            console.error("Erro ao carregar caixa:", error);
        } finally {
            setLoading(false);
        }
    }, [token, filters]); // Recarrega sempre que os filtros mudam

    React.useEffect(() => { fetchData(); }, [fetchData]);

    // Handlers
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setProcessing(true);
        const amount = parseFloat(withdrawAmount);
        const maxAvailable = withdrawType === 'net_profit' ? summary?.net_profit : summary?.cost_of_goods;

        if (amount <= 0 || amount > maxAvailable) {
            alert(`Saldo insuficiente.`);
            setProcessing(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/admin/cashier/withdraw`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, type: withdrawType, reason: withdrawReason })
            });

            if (res.ok) {
                setIsWithdrawModalOpen(false);
                setWithdrawAmount('');
                setWithdrawReason('');
                setShowSuccessModal(true);
                fetchData();
            } else {
                alert("Erro ao realizar saque.");
            }
        } catch (error) { alert("Erro de conexão."); } 
        finally { setProcessing(false); }
    };

    // Componente Card Premium Clean UI
    const FinanceCard = ({ title, value, subtext, type, icon, onWithdraw }) => {
        const styles = {
            profit: {
                bg: 'bg-white border-gray-100',
                iconBg: 'bg-green-50 text-green-500',
                valColor: 'text-green-600',
                btn: 'bg-green-50 hover:bg-green-100 text-green-600 border-transparent hover:border-green-200'
            },
            cost: {
                bg: 'bg-white border-gray-100',
                iconBg: 'bg-blue-50 text-blue-500',
                valColor: 'text-blue-600',
                btn: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-transparent hover:border-blue-200'
            },
            wallet: {
                bg: 'bg-white border-gray-100',
                iconBg: 'bg-[#cb6ce6]/10 text-[#cb6ce6]',
                valColor: 'text-gray-900',
                btn: '' // Sem botão
            }
        };
        const currentStyle = styles[type] || styles.profit;

        return (
            <div className={`relative overflow-hidden rounded-[28px] border shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-transform hover:scale-[1.02] ${currentStyle.bg}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-4 rounded-2xl ${currentStyle.iconBg}`}>
                        {icon}
                    </div>
                    {onWithdraw && (
                        <button onClick={onWithdraw} className={`text-[9px] font-extrabold-id uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 border shadow-sm ${currentStyle.btn}`}>
                            Sacar
                        </button>
                    )}
                </div>
                <div>
                    <p className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest">{title}</p>
                    <h3 className={`text-3xl font-black mt-1 ${currentStyle.valColor} truncate`}>
                        R$ {Number(value || 0).toFixed(2).replace('.', ',')}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold">{subtext}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 pb-24 animate-fade-in px-5 md:px-8 max-w-7xl mx-auto w-full pt-8 font-sans bg-gray-50 min-h-screen">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
            
            {/* Header Mobile / Desktop Clean */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        CAIXA <span className="text-[#cb6ce6]">CENTRAL</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gestão de Liquidez & Retiradas</p>
                </div>
                
                <div className="text-right bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <p className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest">Patrimônio Líquido Total</p>
                    <p className="text-xl font-black text-gray-900 leading-none mt-1">
                        R$ {((summary?.net_profit || 0) + (summary?.cost_of_goods || 0)).toFixed(2).replace('.', ',')}
                    </p>
                </div>
            </div>

            {/* Cards de Saldo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <FinanceCard type="profit" title="Lucro Disponível" value={summary?.net_profit} subtext="Livre para retirada" icon={<TrendingUp size={24} strokeWidth={2.5}/>} onWithdraw={() => { setWithdrawType('net_profit'); setIsWithdrawModalOpen(true); }} />
                <FinanceCard type="cost" title="Fundo de Reposição" value={summary?.cost_of_goods} subtext="Reservado para estoque" icon={<PiggyBank size={24} strokeWidth={2.5}/>} onWithdraw={() => { setWithdrawType('cost_of_goods'); setIsWithdrawModalOpen(true); }} />
                <FinanceCard type="wallet" title="Saldo dos Clientes" value={summary?.total_wallet_balance} subtext="Passivo (Carteiras)" icon={<Wallet size={24} strokeWidth={2.5}/>} />
            </div>

            {/* --- ÁREA DO EXTRATO --- */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-[700px] w-full">
                
                {/* Barra de Filtros Clean UI */}
                <div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex flex-col lg:flex-row gap-4 items-end justify-between z-10 relative shadow-sm">
                    <div className="flex items-center gap-2 mb-2 lg:mb-0 w-full lg:w-auto">
                        <History className="text-[#cb6ce6]" size={20} strokeWidth={2.5}/> 
                        <h3 className="font-extrabold-id text-gray-900 uppercase tracking-widest text-[11px]">Extrato de Movimentações</h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
                        <div className="w-full sm:w-auto space-y-1.5">
                            <label className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest block pl-1">Tipo</label>
                            <select name="type" value={filters.type} onChange={handleFilterChange} className="bg-gray-50 border-2 border-transparent text-gray-900 font-bold text-xs rounded-2xl px-4 py-3.5 outline-none focus:border-[#cb6ce6]/30 focus:bg-white w-full sm:w-36 transition-all appearance-none cursor-pointer">
                                <option value="all">Todos</option>
                                <option value="entrada">Entradas</option>
                                <option value="saida">Saídas</option>
                            </select>
                        </div>
                        
                        <div className="flex gap-3 w-full sm:w-auto">
                            <div className="flex-1 sm:w-32 space-y-1.5 min-w-0">
                                <label className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest block pl-1">De</label>
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="bg-gray-50 border-2 border-transparent text-gray-900 font-bold text-xs rounded-2xl px-3 py-3.5 outline-none focus:border-[#cb6ce6]/30 focus:bg-white w-full transition-all" />
                            </div>
                            <div className="flex-1 sm:w-32 space-y-1.5 min-w-0">
                                <label className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest block pl-1">Até</label>
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="bg-gray-50 border-2 border-transparent text-gray-900 font-bold text-xs rounded-2xl px-3 py-3.5 outline-none focus:border-[#cb6ce6]/30 focus:bg-white w-full transition-all" />
                            </div>
                        </div>

                        <button onClick={fetchData} className="w-full sm:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white p-3.5 rounded-2xl shadow-lg shadow-[#cb6ce6]/25 transition-all active:scale-95 flex justify-center items-center h-[46px] mt-auto">
                            <Search size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                
                {/* Lista de Movimentos */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-4 sm:p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-full gap-3">
                            <Loader2 className="animate-spin text-[#cb6ce6]" size={32}/>
                            <span className="text-[10px] font-extrabold-id uppercase tracking-widest text-gray-400 animate-pulse">Buscando registros...</span>
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                            <AlertCircle size={40} className="text-gray-300" strokeWidth={2}/>
                            <p className="text-[11px] font-extrabold-id uppercase tracking-widest">Nenhuma movimentação no período.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {movements.map((mov) => {
                                const isEntry = mov.type === 'entrada';
                                let label = 'Saída / Retirada';
                                let iconBg = 'bg-red-50 text-red-500';
                                let tagColor = 'border-red-100 text-red-500 bg-red-50/50';
                                let tagName = 'CARTEIRA';

                                if (isEntry) {
                                    label = 'Entrada (Depósito)';
                                    iconBg = 'bg-green-50 text-green-500';
                                } else if (mov.source_type === 'net_profit') {
                                    label = 'Retirada de Lucro';
                                    iconBg = 'bg-green-50 text-green-600';
                                    tagColor = 'border-green-200 text-green-600 bg-green-50';
                                    tagName = 'LUCRO';
                                } else if (mov.source_type === 'cost_of_goods') {
                                    label = 'Retirada de Reposição';
                                    iconBg = 'bg-blue-50 text-blue-500';
                                    tagColor = 'border-blue-200 text-blue-600 bg-blue-50';
                                    tagName = 'REPOSIÇÃO';
                                }

                                return (
                                    <div key={`${mov.type}-${mov.id}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white hover:shadow-md rounded-[24px] border border-gray-100 transition-all group gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className={`p-3.5 rounded-2xl flex-shrink-0 ${iconBg}`}>
                                                {isEntry ? <ArrowDownLeft size={20} strokeWidth={2.5}/> : <ArrowUpRight size={20} strokeWidth={2.5}/>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-extrabold-id text-gray-900 text-sm truncate uppercase tracking-tight">{label}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{new Date(mov.created_at).toLocaleString('pt-BR')} • {mov.user_name}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[200px] sm:max-w-[300px]">{mov.details}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                                            <p className={`font-black text-xl sm:text-lg ${isEntry ? 'text-green-600' : 'text-gray-900'}`}>
                                                {isEntry ? '+' : '-'} R$ {Math.abs(Number(mov.amount)).toFixed(2).replace('.', ',')}
                                            </p>
                                            {!isEntry && <span className={`text-[9px] uppercase font-extrabold-id tracking-widest px-2.5 py-1 rounded-lg border ${tagColor}`}>{tagName}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL SAQUE (CLEAN UI) --- */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
                    <form onSubmit={handleWithdraw} className="bg-white w-full max-w-md rounded-[32px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden relative">
                         <div className="p-6 sm:p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                    <Wallet size={20} className={withdrawType === 'net_profit' ? 'text-green-500' : 'text-blue-500'} strokeWidth={2.5}/> 
                                    Realizar Saque
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Origem: <span className={withdrawType === 'net_profit' ? 'text-green-600' : 'text-blue-600'}>
                                        {withdrawType === 'net_profit' ? 'LUCRO LÍQUIDO' : 'FUNDO DE REPOSIÇÃO'}
                                    </span>
                                </p>
                            </div>
                            <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm active:scale-95">
                                <X size={16} strokeWidth={3}/>
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 space-y-5 bg-white">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1 block">Valor (R$)</label>
                                <input 
                                    type="number" step="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} 
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 font-black text-xl outline-none focus:border-[#cb6ce6]/30 focus:bg-white transition-all placeholder-gray-300" 
                                    placeholder="0,00" 
                                />
                                <p className="text-[9px] font-bold text-gray-400 mt-2 text-right uppercase tracking-widest">
                                    Disponível: R$ {Number(withdrawType === 'net_profit' ? summary?.net_profit : summary?.cost_of_goods).toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1 block">Motivo do Saque</label>
                                <input 
                                    type="text" required value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} 
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-4 text-gray-900 text-sm font-bold outline-none focus:border-[#cb6ce6]/30 focus:bg-white transition-all placeholder-gray-300" 
                                    placeholder="Ex: Pagamento de dividendos..." 
                                />
                            </div>
                        </div>

                        <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                            <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="w-full sm:w-auto px-6 py-4 rounded-2xl text-gray-500 bg-white border border-gray-200 font-extrabold-id uppercase tracking-widest text-[10px] hover:bg-gray-100 active:scale-95 transition-all shadow-sm">
                                Cancelar
                            </button>
                            <button type="submit" disabled={processing} className={`w-full flex-1 py-4 rounded-2xl text-white font-extrabold-id uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-wait ${withdrawType === 'net_profit' ? 'bg-green-600 hover:bg-green-500 shadow-green-600/25' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'}`}>
                                {processing ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18} strokeWidth={2.5}/>}
                                {processing ? 'PROCESSANDO...' : 'CONFIRMAR SAQUE'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- MODAL SUCESSO (CLEAN UI) --- */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white border border-gray-100 w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5 border border-green-100 shadow-sm animate-bounce-slow">
                            <CheckCircle2 size={40} className="text-green-500" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-extrabold-id text-gray-900 uppercase tracking-tighter mb-2">Saque Confirmado!</h3>
                        <p className="text-gray-500 text-xs font-bold mb-6">A movimentação já consta no extrato.</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-black text-white font-extrabold-id uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95">
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CriticalStockPage = ({ condominiums, token }) => {
    // --- ESTADOS GERAIS ---
    const [selectedCondoId, setSelectedCondoId] = React.useState('all'); 
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('critical');
    
    const [purchaseHistory, setPurchaseHistory] = React.useState([]);
    const [loadingHistory, setLoadingHistory] = React.useState(false);

    // --- ESTADOS DE REPOSIÇÕES PENDENTES E AUDITORIA ---
    const [pendingRestocks, setPendingRestocks] = React.useState([]);
    const [audits, setAudits] = React.useState([]); 

    // --- ESTADOS DA INVESTIGAÇÃO ---
    const [selectedAudit, setSelectedAudit] = React.useState(null);
    const [auditDetails, setAuditDetails] = React.useState(null);
    const [loadingAuditDetails, setLoadingAuditDetails] = React.useState(false);

    // --- ESTADOS DO MODO COMPRAS (Fornecedor) ---
    const [isShoppingMode, setIsShoppingMode] = React.useState(false);
    const [shoppingQueue, setShoppingQueue] = React.useState([]);
    const [currentStep, setCurrentStep] = React.useState(0);
    const [priceInput, setPriceInput] = React.useState('');
    const [qtyInput, setQtyInput] = React.useState('');
    const [cart, setCart] = React.useState([]);
    const [showSummary, setShowSummary] = React.useState(false);
    const [isSavingPurchase, setIsSavingPurchase] = React.useState(false);

    // --- ESTADOS DO MODO AUDITORIA (Na frente da máquina) ---
    const [isAuditingMode, setIsAuditingMode] = React.useState(false);
    const [currentAuditSession, setCurrentAuditSession] = React.useState(null);
    const [auditStep, setAuditStep] = React.useState(0);
    const [countedQty, setCountedQty] = React.useState('');
    const [auditResults, setAuditResults] = React.useState([]);
    const [showAuditSummary, setShowAuditSummary] = React.useState(false);
    const [isSavingAudit, setIsSavingAudit] = React.useState(false);

    // --- TOASTS ---
    const [toast, setToast] = React.useState(null);

    const apiUrl = window.API_URL || 'http://localhost:5000';

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // --- FETCH DADOS ---
    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            
            // 1. Produtos
            const urlProducts = selectedCondoId === 'all' 
                ? `${apiUrl}/api/admin/products` 
                : `${apiUrl}/api/admin/products?condoId=${selectedCondoId}`;
            const resProducts = await fetch(urlProducts, { headers });
            if (resProducts.ok) {
                const data = await resProducts.json();
                setProducts(Array.isArray(data) ? data : (data.products || []));
            }

            // 2. Pendentes
            const urlPending = selectedCondoId === 'all'
                ? `${apiUrl}/api/admin/inventory/pending-restocks`
                : `${apiUrl}/api/admin/inventory/pending-restocks?condoId=${selectedCondoId}`;
            const resPending = await fetch(urlPending, { headers });
            if (resPending.ok) setPendingRestocks(await resPending.json());

            // 3. Auditorias
            const urlAudits = selectedCondoId === 'all'
                ? `${apiUrl}/api/admin/inventory/audits`
                : `${apiUrl}/api/admin/inventory/audits?condoId=${selectedCondoId}`;
            const resAudits = await fetch(urlAudits, { headers });
            if (resAudits.ok) setAudits(await resAudits.json());

            fetchHistory();
        } catch (error) { 
            console.error("Erro dados:", error); 
            showToast("Erro ao buscar dados.", "error");
        } finally { 
            setLoading(false); 
        }
    }, [selectedCondoId, token, apiUrl]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const urlHistory = selectedCondoId === 'all' 
                ? `${apiUrl}/api/admin/purchase-history` 
                : `${apiUrl}/api/admin/purchase-history?condoId=${selectedCondoId}`;
            const resHistory = await fetch(urlHistory, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resHistory.ok) setPurchaseHistory(await resHistory.json());
        } catch (error) { console.error(error); } 
        finally { setLoadingHistory(false); }
    };

    // --- NOVA FUNÇÃO: ABRIR INVESTIGAÇÃO ---
    const handleOpenAuditInvestigation = async (audit) => {
        setSelectedAudit(audit);
        setLoadingAuditDetails(true);
        try {
            const response = await fetch(`${apiUrl}/api/admin/inventory/audit/${audit.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAuditDetails(data);
            } else {
                showToast("Erro ao carregar detalhes da investigação.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Erro de conexão.", "error");
        } finally {
            setLoadingAuditDetails(false);
        }
    };

    React.useEffect(() => { fetchData(); }, [fetchData]);

    // --- FILTROS ---
    const criticalItems = products.filter(p => {
        const stock = parseInt(p.global_stock || p.quantity || 0);
        const critical = parseInt(p.critical_stock_level || 5);
        if (selectedCondoId !== 'all' && p.global_stock === undefined && p.quantity === undefined) return false;
        return stock <= critical;
    });

    const expiringItems = products.filter(p => {
        const expDate = p.nearest_expiration_date || p.expiration_date;
        if (!expDate) return false;
        const diffDays = Math.ceil((new Date(expDate) - new Date()) / (1000 * 60 * 60 * 24)); 
        return diffDays >= 0 && diffDays <= 30;
    });

    const calculateSmartQuantity = (item) => {
        const currentStock = parseInt(item.global_stock || item.quantity || 0);
        const critical = parseInt(item.critical_stock_level || 5);
        const idealStock = item.ideal_stock_level ? parseInt(item.ideal_stock_level) : (critical * 3);
        return Math.max(1, idealStock - currentStock);
    };

    // --- HELPERS ---
    const getSelectedCondoName = () => {
        if (selectedCondoId === 'all') return 'Todas as Máquinas';
        const condo = condominiums?.find(c => c.id === parseInt(selectedCondoId) || c.id === selectedCondoId);
        return condo ? condo.name : 'Máquina Específica';
    };

    // =========================================================
    // MODO COMPRAS (Fornecedor)
    // =========================================================
    const startShopping = () => {
        if (selectedCondoId === 'all') {
            return showToast("⚠️ Selecione uma MÁQUINA ESPECÍFICA no topo antes de iniciar a reposição.", "warning");
        }
        if (criticalItems.length === 0) {
            return showToast("Estoque saudável! Nada a repor no momento.", "success");
        }
        setShoppingQueue(criticalItems);
        setCurrentStep(0);
        setCart([]);
        setShowSummary(false);
        setIsShoppingMode(true);
        setPriceInput(criticalItems[0].purchase_price || ''); 
        setQtyInput(calculateSmartQuantity(criticalItems[0]).toString());
    };

    const handleSkipProduct = () => {
        if (currentStep + 1 < shoppingQueue.length) {
            const nextItem = shoppingQueue[currentStep + 1];
            setCurrentStep(prev => prev + 1);
            setPriceInput(nextItem.purchase_price || '');
            setQtyInput(calculateSmartQuantity(nextItem).toString());
        } else {
            setShowSummary(true);
        }
    };

    const handleNextProduct = () => {
        const item = shoppingQueue[currentStep];
        const actualPrice = parseFloat(priceInput);
        const boughtQty = parseInt(qtyInput);
        
        if (isNaN(actualPrice) || isNaN(boughtQty) || boughtQty <= 0) {
            return showToast("Por favor, informe o preço pago e a quantidade válida.", "warning");
        }

        const expectedPrice = parseFloat(item.purchase_price) || 0;
        setCart([...cart, {
            product_id: item.id,
            name: item.name,
            boughtQty,
            boughtPrice: actualPrice,
            expectedPrice,
            totalCost: actualPrice * boughtQty,
            savings: (expectedPrice - actualPrice) * boughtQty 
        }]);
        handleSkipProduct();
    };

    const finishShopping = async () => {
        if (cart.length === 0) { 
            setIsShoppingMode(false); 
            return showToast("Nenhum item comprado. Ação cancelada.", "warning"); 
        }
        setIsSavingPurchase(true);
        try {
            const payload = {
                condo_id: selectedCondoId === 'all' ? null : selectedCondoId,
                date: new Date().toISOString().split('T')[0],
                total_spent: cart.reduce((acc, i) => acc + i.totalCost, 0),
                total_savings: cart.reduce((acc, i) => acc + i.savings, 0),
                items: cart.map(item => ({ product_id: item.product_id, quantity: item.boughtQty, new_price: item.boughtPrice }))
            };
            const response = await fetch(`${apiUrl}/api/admin/inventory/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Erro ao gravar compra.");
            
            showToast("Compras gravadas! A aguardar abastecimento físico na máquina.", "success");
            setIsShoppingMode(false);
            fetchData(); 
            setActiveTab('pending'); 
        } catch (error) { 
            showToast(`Erro: ${error.message}`, "error"); 
        } finally { 
            setIsSavingPurchase(false); 
        }
    };

    // =========================================================
    // MODO AUDITORIA (Na Máquina)
    // =========================================================
    const startAudit = (session) => {
        if (!session.items || session.items.length === 0) {
            return showToast("Sessão vazia ou inválida.", "error");
        }
        setCurrentAuditSession(session);
        setAuditStep(0);
        setCountedQty('');
        setAuditResults([]);
        setShowAuditSummary(false);
        setIsAuditingMode(true);
    };

    const handleNextAudit = () => {
        const item = currentAuditSession.items[auditStep];
        const counted = parseInt(countedQty);
        
        if (isNaN(counted) || counted < 0) {
            return showToast("Insira uma quantidade contada válida.", "warning");
        }

        setAuditResults([...auditResults, {
            product_id: item.product_id, name: item.name, image_url: item.image_url,
            expected_qty: parseInt(item.expected_current_stock), bought_qty: item.quantity, counted_qty: counted
        }]);
        
        if (auditStep + 1 < currentAuditSession.items.length) {
            setAuditStep(prev => prev + 1); setCountedQty('');
        } else { 
            setShowAuditSummary(true); 
        }
    };

    const finishAudit = async () => {
        setIsSavingAudit(true);
        try {
            const response = await fetch(`${apiUrl}/api/admin/inventory/execute-restock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ pending_restock_id: currentAuditSession.id, condo_id: currentAuditSession.condo_id, items: auditResults })
            });
            if (!response.ok) throw new Error("Erro ao finalizar abastecimento.");
            
            showToast("Abastecimento concluído! Inconsistências (se existirem) foram registadas.", "success");
            setIsAuditingMode(false);
            fetchData();
            setActiveTab('audits'); 
        } catch (error) { 
            showToast(`Erro: ${error.message}`, "error"); 
        } finally { 
            setIsSavingAudit(false); 
        }
    };

    // =========================================================
    // RENDER: MODO COMPRAS (Fornecedor)
    // =========================================================
    if (isShoppingMode) {
        if (showSummary) {
            const totalSpent = cart.reduce((acc, i) => acc + i.totalCost, 0);
            const totalSavings = cart.reduce((acc, i) => acc + i.savings, 0);
            const isSaving = totalSavings >= 0;

            return (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 font-sans">
                    <div className="bg-white border border-gray-100 w-full max-w-md rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] text-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isSaving ? 'from-green-400 to-green-500' : 'from-red-400 to-red-500'}`}></div>
                        
                        <div className="mb-6 flex justify-center">
                            <div className={`h-20 w-20 rounded-full flex items-center justify-center shadow-sm ${isSaving ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                {isSaving ? <TrendingUp size={40} strokeWidth={2.5}/> : <TrendingDown size={40} strokeWidth={2.5}/>}
                            </div>
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl font-extrabold-id text-gray-900 tracking-tighter uppercase mb-2">Reposição Concluída!</h2>
                        <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest mb-8">Resumo no fornecedor ({getSelectedCondoName()}).</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 p-5 rounded-[24px] border border-gray-100 flex flex-col justify-center items-center">
                                <p className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest mb-1">Custo Total</p>
                                <p className="text-xl font-black text-gray-900">R$ {totalSpent.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <div className={`p-5 rounded-[24px] border flex flex-col justify-center items-center ${isSaving ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                <p className={`text-[9px] uppercase font-extrabold-id tracking-widest mb-1 ${isSaving ? 'text-green-600' : 'text-red-600'}`}>
                                    {isSaving ? 'Economia Gerada' : 'Gasto Extra'}
                                </p>
                                <p className={`text-xl font-black ${isSaving ? 'text-green-600' : 'text-red-600'}`}>
                                    R$ {Math.abs(totalSavings).toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={finishShopping}
                            disabled={isSavingPurchase}
                            className="w-full py-4.5 rounded-2xl bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-xs shadow-lg shadow-[#cb6ce6]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            {isSavingPurchase ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18} strokeWidth={2.5}/>} 
                            {isSavingPurchase ? 'A GRAVAR...' : 'SALVAR COMPRA'}
                        </button>
                    </div>
                </div>
            );
        }

        const item = shoppingQueue[currentStep];
        const currentStock = parseInt(item.global_stock || item.quantity || 0);
        const suggestedQty = calculateSmartQuantity(item);

        return (
            <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto font-sans">
                <div className="sticky top-0 p-4 sm:p-5 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <div className="bg-[#cb6ce6]/10 p-3 rounded-2xl text-[#cb6ce6]"><ShoppingCart size={22} strokeWidth={2.5}/></div>
                        <div>
                            <h3 className="text-xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Lista de Compras</h3>
                            <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mt-1">Repondo: {getSelectedCondoName()}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsShoppingMode(false)} className="bg-white border border-gray-200 p-2.5 rounded-full text-gray-400 hover:text-gray-900 shadow-sm active:scale-95 transition-all"><X size={18} strokeWidth={3}/></button>
                </div>

                <div className="max-w-xl mx-auto p-4 sm:p-8 flex flex-col gap-6 pb-24">
                    
                    <div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className="bg-[#cb6ce6] h-full rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / shoppingQueue.length) * 100}%` }}></div>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 font-extrabold-id uppercase tracking-widest">Produto {currentStep + 1} de {shoppingQueue.length}</p>
                    </div>

                    <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
                        <div className="w-32 h-32 rounded-[24px] bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={item.image_url || 'https://placehold.co/400'} className="w-full h-full object-cover" alt={item.name}/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="bg-gray-100 text-gray-500 text-[9px] font-extrabold-id px-3 py-1.5 rounded-xl uppercase tracking-widest mb-3 inline-block">
                                {item.category || 'Geral'}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold-id text-gray-900 leading-tight mb-3 uppercase tracking-tighter truncate">{item.name}</h2>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">Estoque Crítico: {currentStock} un</span>
                                <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">Sugestão: {suggestedQty} un</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold-id text-gray-400 uppercase flex items-center justify-center sm:justify-start gap-1.5 tracking-widest">
                                    <Package size={14} className="text-[#cb6ce6]" strokeWidth={2.5}/> Comprados (UN)
                                </label>
                                <input 
                                    type="number" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 sm:py-5 px-3 text-center text-xl sm:text-2xl font-black text-gray-900 focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold-id text-gray-400 uppercase flex items-center justify-center sm:justify-start gap-1.5 tracking-widest">
                                    <DollarSign size={14} className="text-green-500" strokeWidth={2.5}/> Custo Unitário
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold-id">R$</span>
                                    <input 
                                        type="number" autoFocus placeholder="0.00" value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 sm:py-5 pl-11 pr-3 text-xl sm:text-2xl font-black text-gray-900 focus:border-green-300 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Ref. Antiga: <b className="text-gray-900 text-[10px]">R$ {parseFloat(item.purchase_price||0).toFixed(2).replace('.', ',')}</b></span>
                            {priceInput && (
                                <span className={`text-[9px] uppercase font-extrabold-id tracking-widest px-3 py-1.5 rounded-xl border ${(parseFloat(item.purchase_price||0) - parseFloat(priceInput)) >= 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-100'}`}>
                                    {(parseFloat(item.purchase_price||0) - parseFloat(priceInput)) >= 0 ? 'Lucro Maior ⬆️' : 'Custo Maior ⬇️'}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={handleSkipProduct} 
                                className="w-full sm:w-1/3 py-4 rounded-2xl bg-white text-gray-500 font-extrabold-id text-[10px] uppercase tracking-widest shadow-sm border border-gray-200 active:scale-95 transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <X size={16} strokeWidth={2.5}/> Pular Produto
                            </button>
                            <button 
                                onClick={handleNextProduct} 
                                className="w-full sm:w-2/3 py-4 rounded-2xl bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[10px] uppercase tracking-widest shadow-lg shadow-[#cb6ce6]/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                Avançar <ArrowRight size={18} strokeWidth={2.5}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER: MODO AUDITORIA (Na Máquina)
    // =========================================================
    if (isAuditingMode && currentAuditSession) {
        if (showAuditSummary) {
            const inconsistencies = auditResults.filter(r => r.counted_qty !== r.expected_qty);
            return (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in font-sans">
                    <div className="bg-white border border-gray-100 w-full max-w-md rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] text-center relative overflow-hidden">
                        <div className="mb-6 flex justify-center">
                            <div className="h-20 w-20 rounded-full flex items-center justify-center bg-blue-50 text-blue-500 shadow-sm border border-blue-100">
                                <ClipboardCheck size={40} strokeWidth={2.5}/>
                            </div>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold-id text-gray-900 uppercase tracking-tighter mb-4">Conferência Finalizada</h2>
                        
                        <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 text-left">
                            <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
                                <span className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest">Total de Itens:</span>
                                <span className="text-gray-900 font-black">{auditResults.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest">Inconsistências:</span>
                                <span className={`font-black ${inconsistencies.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {inconsistencies.length}
                                </span>
                            </div>
                        </div>
                        
                        {inconsistencies.length > 0 && (
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
                                As falhas no estoque serão registradas para futura verificação nas câmeras.
                            </p>
                        )}
                        <button onClick={finishAudit} disabled={isSavingAudit} className="w-full py-4.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold-id text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                            {isSavingAudit ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18} strokeWidth={2.5}/>} 
                            {isSavingAudit ? 'A INJETAR NO ESTOQUE...' : 'CONFIRMAR E GUARDAR'}
                        </button>
                    </div>
                </div>
            );
        }
        
        const item = currentAuditSession.items[auditStep];
        return (
            <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto font-sans">
                <div className="sticky top-0 p-4 sm:p-5 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-500"><ClipboardCheck size={22} strokeWidth={2.5}/></div>
                        <div>
                            <h3 className="text-xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Auditoria / Abastecer</h3>
                            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1">{currentAuditSession.condo_name || 'Geral'}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAuditingMode(false)} className="bg-white border border-gray-200 p-2.5 rounded-full text-gray-400 hover:text-gray-900 shadow-sm active:scale-95 transition-all"><X size={18} strokeWidth={3}/></button>
                </div>

                <div className="max-w-xl mx-auto p-4 sm:p-8 flex flex-col gap-6 pb-24">
                    <div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${((auditStep + 1) / currentAuditSession.items.length) * 100}%` }}></div>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 font-extrabold-id uppercase tracking-widest">Produto {auditStep + 1} de {currentAuditSession.items.length}</p>
                    </div>

                    <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
                        <div className="w-32 h-32 rounded-[24px] bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={item.image_url || 'https://placehold.co/400'} className="w-full h-full object-cover" alt={item.name}/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl sm:text-3xl font-extrabold-id text-gray-900 leading-tight mb-3 uppercase tracking-tighter truncate">{item.name}</h2>
                            <p className="text-[#cb6ce6] font-extrabold-id text-[10px] uppercase tracking-widest bg-[#cb6ce6]/10 w-fit mx-auto sm:mx-0 px-3 py-1.5 rounded-xl">
                                Você trouxe: +{item.quantity} un
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <h4 className="text-[11px] font-extrabold-id text-gray-900 uppercase tracking-widest mb-3 text-center">Quantas unidades ESTÃO NA MÁQUINA AGORA?</h4>
                        <p className="text-[9px] text-red-600 text-center mb-6 font-bold uppercase tracking-widest bg-red-50 py-3 px-4 rounded-xl border border-red-100">
                            Não conte com as que tem na mão. Apenas as antigas!
                        </p>
                        
                        <input 
                            type="number" autoFocus value={countedQty} onChange={(e) => setCountedQty(e.target.value)} placeholder="Ex: 2"
                            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-6 px-4 text-center text-3xl font-black text-gray-900 focus:border-blue-300 focus:bg-white outline-none mb-6 transition-all placeholder-gray-300"
                        />
                        
                        <button onClick={handleNextAudit} className="w-full py-4.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold-id text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all">
                            Registrar Contagem <ArrowRight size={18} strokeWidth={2.5}/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER: PÁGINA PRINCIPAL (Dashboard de Estoque) E INVESTIGAÇÃO
    // =========================================================
    return (
        <div className="flex flex-col gap-6 pb-24 animate-fade-in px-5 md:px-8 max-w-7xl mx-auto w-full pt-8 font-sans bg-gray-50 min-h-screen">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {toast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
                    <div className={`px-6 py-3 rounded-full shadow-lg border text-[10px] font-extrabold-id uppercase tracking-widest flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : toast.type === 'warning' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {toast.type === 'error' ? <AlertCircle size={16}/> : toast.type === 'warning' ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        ABASTECIMENTO & <span className="text-[#cb6ce6]">ESTOQUE</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Controle de Reposições e Auditorias</p>
                </div>
                <div className="w-full md:w-auto relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" size={18} strokeWidth={2.5} />
                    <select value={selectedCondoId} onChange={(e) => setSelectedCondoId(e.target.value)} className="w-full md:w-64 bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/50 outline-none appearance-none cursor-pointer transition-all shadow-sm">
                        <option value="all">Todas as Máquinas</option>
                        {condominiums?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Navegação por Abas (Clean Pills) */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 w-full snap-x">
                {[
                    { id: 'critical', label: 'Crítico', count: criticalItems.length, color: 'text-red-500 bg-red-50' },
                    { id: 'expiring', label: 'A Vencer', count: expiringItems.length, color: 'text-yellow-600 bg-yellow-50' },
                    { id: 'pending', label: 'Reposições Pend.', count: pendingRestocks.length, color: 'text-blue-500 bg-blue-50' },
                    { id: 'audits', label: 'Auditorias', count: audits.length, color: 'text-gray-500 bg-gray-100' },
                    { id: 'history', label: 'Histórico Compras', count: purchaseHistory.length, color: 'text-gray-500 bg-gray-100' }
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)}
                        className={`snap-start flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-extrabold-id uppercase tracking-widest transition-all flex items-center gap-2 border ${activeTab === tab.id ? 'bg-white text-gray-900 border-gray-200 shadow-sm' : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-100'}`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] ${tab.color}`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#cb6ce6]" size={40}/>
                </div>
            ) : (
                <div className="w-full">
                    
                    {/* TAB: CRÍTICO */}
                    {activeTab === 'critical' && (
                        <div className="space-y-6 animate-fade-in w-full">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <div>
                                    <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                        <AlertCircle className="text-red-500" size={20}/> Estoque Crítico
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Produtos abaixo da margem de segurança.</p>
                                </div>
                                <button onClick={startShopping} className="w-full sm:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[10px] uppercase tracking-widest py-3.5 px-6 rounded-2xl shadow-lg shadow-[#cb6ce6]/25 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    <ShoppingCart size={16} strokeWidth={2.5}/> IR ÀS COMPRAS
                                </button>
                            </div>

                            {criticalItems.length === 0 ? (
                                <div className="bg-white rounded-[28px] border border-gray-100 p-12 flex flex-col items-center text-center shadow-sm">
                                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4"><CheckCircle2 size={32} strokeWidth={2.5}/></div>
                                    <p className="text-sm font-extrabold-id text-gray-900 uppercase tracking-widest">Estoque Saudável</p>
                                    <p className="text-xs font-bold text-gray-400 mt-2">Nenhum produto crítico nesta máquina.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {criticalItems.map(item => (
                                        <div key={item.id} className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt=""/> : <Package size={24} className="text-gray-300"/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-extrabold-id text-gray-900 uppercase truncate tracking-tight">{item.name}</h4>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate mt-0.5 mb-2">{item.category}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-extrabold-id bg-red-50 text-red-600 px-2 py-1 rounded-lg uppercase tracking-widest">Atual: {item.global_stock || item.quantity || 0}</span>
                                                    <span className="text-[9px] font-extrabold-id bg-gray-50 text-gray-500 px-2 py-1 rounded-lg uppercase tracking-widest">Mín: {item.critical_stock_level}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: VENCIMENTOS */}
                    {activeTab === 'expiring' && (
                        <div className="space-y-6 animate-fade-in w-full">
                            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                    <CalendarDays className="text-yellow-500" size={20}/> Próximos ao Vencimento (30 dias)
                                </h3>
                            </div>
                            
                            {expiringItems.length === 0 ? (
                                <div className="bg-white rounded-[28px] border border-gray-100 p-12 flex flex-col items-center text-center shadow-sm">
                                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4"><CheckCircle2 size={32} strokeWidth={2.5}/></div>
                                    <p className="text-sm font-extrabold-id text-gray-900 uppercase tracking-widest">Tudo na validade</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {expiringItems.map(item => {
                                        const expDate = item.nearest_expiration_date || item.expiration_date;
                                        const diffDays = Math.ceil((new Date(expDate) - new Date()) / (1000 * 60 * 60 * 24));
                                        const isCritical = diffDays <= 5;
                                        return (
                                            <div key={item.id} className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt=""/> : <Package size={24} className="text-gray-300"/>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-extrabold-id text-gray-900 uppercase truncate tracking-tight">{item.name}</h4>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate mt-0.5 mb-2">{item.condo_name || 'Geral'}</p>
                                                    <span className={`text-[9px] font-extrabold-id px-2.5 py-1 rounded-lg uppercase tracking-widest ${isCritical ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                        {diffDays <= 0 ? 'Vencido' : `Vence em ${diffDays} dias`}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: REPOSIÇÕES PENDENTES */}
                    {activeTab === 'pending' && (
                        <div className="space-y-6 animate-fade-in w-full">
                            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                    <ClipboardCheck className="text-blue-500" size={20}/> Compras a Injetar
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Vá até a máquina com os produtos e clique para iniciar.</p>
                            </div>
                            
                            {pendingRestocks.length === 0 ? (
                                <div className="bg-white rounded-[28px] border border-gray-100 p-12 flex flex-col items-center text-center shadow-sm">
                                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4"><Package size={32} strokeWidth={2.5}/></div>
                                    <p className="text-sm font-extrabold-id text-gray-900 uppercase tracking-widest">Nenhuma reposição pendente</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {pendingRestocks.map(session => (
                                        <div key={session.id} className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-extrabold-id text-blue-500 uppercase tracking-widest mb-1">{session.condo_name || 'Geral'}</p>
                                                    <p className="text-xs font-bold text-gray-500">Data: {new Date(session.created_at).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                                <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest">
                                                    {session.items?.length || 0} Itens
                                                </span>
                                            </div>
                                            <button onClick={() => startAudit(session)} className="mt-auto w-full py-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold-id text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                                                INICIAR ABASTECIMENTO <ArrowRight size={16} strokeWidth={2.5}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: HISTÓRICO DE COMPRAS */}
                    {activeTab === 'history' && (
                        <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full animate-fade-in">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                    <ShoppingCart className="text-[#cb6ce6]" size={20}/> Histórico no Fornecedor
                                </h3>
                            </div>
                            <div className="overflow-x-auto hide-scrollbar w-full">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-400 text-[9px] font-extrabold-id uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="p-5 pl-6">Data</th>
                                            <th className="p-5">Local/Máquina</th>
                                            <th className="p-5 text-center">Itens Listados</th>
                                            <th className="p-5 text-right">Gasto Informado</th>
                                            <th className="p-5 text-right pr-6">Economia/Défice</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-50">
                                        {loadingHistory ? (
                                            <tr><td colSpan="5" className="p-16 text-center"><Loader2 className="animate-spin inline text-[#cb6ce6]" size={24}/></td></tr>
                                        ) : purchaseHistory.length === 0 ? (
                                            <tr><td colSpan="5" className="p-16 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhum histórico encontrado.</td></tr>
                                        ) : (
                                            purchaseHistory.map(hist => (
                                                <tr key={hist.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="p-5 pl-6 font-extrabold-id text-gray-900 text-xs">{new Date(hist.created_at).toLocaleDateString('pt-BR')}</td>
                                                    <td className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">{hist.condo_name || 'Geral'}</td>
                                                    <td className="p-5 text-center font-black text-gray-900">{hist.items_count}</td>
                                                    <td className="p-5 text-right font-black text-gray-900">R$ {Number(hist.total_spent).toFixed(2).replace('.', ',')}</td>
                                                    <td className="p-5 text-right pr-6">
                                                        <span className={`text-[10px] font-extrabold-id uppercase tracking-widest px-2.5 py-1.5 rounded-xl border ${Number(hist.total_savings) >= 0 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                            {Number(hist.total_savings) >= 0 ? '+' : '-'} R$ {Math.abs(Number(hist.total_savings)).toFixed(2).replace('.', ',')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: AUDITORIAS (HISTÓRICO) */}
                    {activeTab === 'audits' && (
                        <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full animate-fade-in">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                    <FileText className="text-gray-500" size={20}/> Relatórios de Auditoria
                                </h3>
                            </div>
                            <div className="overflow-x-auto hide-scrollbar w-full">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-400 text-[9px] font-extrabold-id uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="p-5 pl-6">Data Fecho</th>
                                            <th className="p-5">Local</th>
                                            <th className="p-5 text-center">Itens Injetados</th>
                                            <th className="p-5 text-center pr-6">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-50">
                                        {audits.length === 0 ? (
                                            <tr><td colSpan="4" className="p-16 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhuma auditoria registada.</td></tr>
                                        ) : (
                                            audits.map(audit => (
                                                <tr key={audit.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="p-5 pl-6 font-extrabold-id text-gray-900 text-xs">{new Date(audit.audited_at).toLocaleDateString('pt-BR')}</td>
                                                    <td className="p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">{audit.condo_name || 'Geral'}</td>
                                                    <td className="p-5 text-center font-black text-gray-900">{audit.items_count}</td>
                                                    <td className="p-5 text-center pr-6">
                                                        <button onClick={() => handleOpenAuditInvestigation(audit)} className="bg-white border border-gray-200 text-gray-500 hover:text-[#cb6ce6] hover:border-[#cb6ce6]/30 px-4 py-2 rounded-xl text-[9px] font-extrabold-id uppercase tracking-widest shadow-sm active:scale-95 transition-all">
                                                            Ver Detalhes
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DETALHES AUDITORIA E INVESTIGAÇÃO (INCONSISTÊNCIAS) */}
            {selectedAudit && !isAuditingMode && (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in font-sans">
                    <div className="bg-white border border-gray-100 w-full max-w-2xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
                        
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2 text-lg">
                                    <ClipboardCheck size={20} className="text-[#cb6ce6]" strokeWidth={2.5}/> Detalhes da Auditoria
                                </h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Realizada em: {new Date(selectedAudit.audited_at).toLocaleDateString('pt-BR')} às {new Date(selectedAudit.audited_at).toLocaleTimeString('pt-BR').slice(0,5)}</p>
                            </div>
                            <button onClick={() => {setSelectedAudit(null); setAuditDetails(null);}} className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 shadow-sm transition-colors active:scale-95"><X size={16} strokeWidth={3}/></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-white hide-scrollbar flex-1">
                            
                            {/* Resumo Global da Auditoria */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 flex justify-around text-center shadow-sm">
                                <div><p className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest">Esperado</p><p className="text-xl font-black text-gray-900">{selectedAudit.expected_quantity}</p></div>
                                <div><p className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest">Contado</p><p className="text-xl font-black text-gray-900">{selectedAudit.actual_quantity}</p></div>
                                <div><p className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest">Diferença</p><p className={`text-xl font-black ${selectedAudit.difference_quantity < 0 ? 'text-red-500' : 'text-yellow-600'}`}>{selectedAudit.difference_quantity > 0 ? '+' : ''}{selectedAudit.difference_quantity}</p></div>
                            </div>

                            {loadingAuditDetails ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#cb6ce6]" size={32}/></div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Lista de Itens Inspecionados */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">Itens Auditados</h4>
                                        {auditDetails?.items?.map((item, idx) => {
                                            const isInconsistent = item.expected_qty !== item.counted_qty;
                                            return (
                                                <div key={idx} className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isInconsistent ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                                                    <div>
                                                        <p className="font-extrabold-id text-gray-900 text-xs uppercase tracking-tight">{item.product_name}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Reposição Injetada: +{item.bought_qty} un</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                                        <div className="text-center px-3 border-r border-gray-100">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Esperado</p>
                                                            <p className="font-black text-gray-900 text-sm">{item.expected_qty}</p>
                                                        </div>
                                                        <div className="text-center px-3">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contado</p>
                                                            <p className={`font-black text-sm ${isInconsistent ? 'text-red-500' : 'text-green-500'}`}>{item.counted_qty}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Seção de Vendas no Período (Investigação) */}
                                    <div className="pt-4">
                                        <h3 className="text-[11px] font-extrabold-id text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Search size={16} className="text-[#cb6ce6]" strokeWidth={2.5}/> Vendas desde a última reposição
                                        </h3>
                                        <div className="space-y-3">
                                            {auditDetails && auditDetails.sales && auditDetails.sales.length > 0 ? (
                                                auditDetails.sales.map((sale, idx) => (
                                                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-white hover:shadow-sm transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-[#cb6ce6]/10 p-2 rounded-full text-[#cb6ce6] flex-shrink-0"><User size={16} strokeWidth={2.5}/></div>
                                                            <div>
                                                                <p className="font-extrabold-id text-gray-900 text-xs">{sale.user_name}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(sale.sale_date).toLocaleString('pt-BR')} às {new Date(sale.sale_date).toLocaleTimeString('pt-BR').slice(0,5)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-left sm:text-right pl-11 sm:pl-0">
                                                            <p className="font-black text-gray-900 text-sm">{sale.quantity} un</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">R$ {parseFloat(sale.unit_price).toFixed(2).replace('.', ',')}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest">Nenhuma venda registada neste intervalo.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Alerta de Câmeras */}
                                    <div className="mt-6 bg-red-50 border border-red-100 p-5 rounded-2xl flex items-start gap-4">
                                        <div className="bg-white p-2 rounded-full shadow-sm flex-shrink-0 border border-red-100">
                                            <Video className="text-red-500" size={18} strokeWidth={2.5}/>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold-id text-red-600 uppercase tracking-widest mb-1">Verificar Câmeras</p>
                                            <p className="text-[10px] font-bold text-red-500/80 leading-relaxed">
                                                {auditDetails ? 
                                                    `Analise as gravações entre ${new Date(auditDetails.window_start).toLocaleString('pt-BR')} e ${new Date(auditDetails.window_end).toLocaleString('pt-BR')}.` 
                                                    : "Aguardando carregamento das datas..."}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};



const UserManagementPage = ({ condominiums, token, API_URL }) => { 
    const [usersData, setUsersData] = React.useState({ users: [], pagination: {} });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const BASE_URL = API_URL || 'http://localhost:5000';

    // --- FETCH ---
    const fetchUsers = React.useCallback(async (page = 1) => {
        setIsLoading(true); setCurrentPage(page);
        try {
            // Nota: Se o backend suportar filtro no endpoint, mude para: `...&search=${searchQuery}`
            const response = await fetch(`${BASE_URL}/api/admin/users-paginated?page=${page}&limit=10`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (!response.ok) throw new Error('Falha ao buscar utilizadores.');
            const data = await response.json();
            setUsersData(data);
        } catch (err) {
            console.error(err);
            setUsersData({ users: [], pagination: {} });
        } finally {
            setIsLoading(false);
        }
    }, [token, BASE_URL]);

    React.useEffect(() => { fetchUsers(1); }, [fetchUsers]);

    const handleOpenModal = (user) => { setSelectedUser(user); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedUser(null); };
    const handleSaveUser = () => { fetchUsers(currentPage); };
    
    // Filtro Safe (Proteção contra null/undefined)
    const filteredUsers = (usersData.users || []).filter(user => {
        const query = searchQuery.toLowerCase();
        const name = (user.name || '').toLowerCase();
        const cpf = (user.cpf || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        
        return name.includes(query) || cpf.includes(query) || email.includes(query);
    });

    // Métricas Rápidas (Baseado na página atual, ou idealmente viria do backend)
    const activeCount = (usersData.users || []).filter(u => u.is_active).length;
    const blockedCount = (usersData.users || []).length - activeCount;

    return (
        <div className="flex flex-col gap-6 animate-fade-in w-full font-sans pb-24 pt-8 bg-gray-50 min-h-screen px-5 md:px-8 max-w-7xl mx-auto">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <UserEditModal 
                user={selectedUser} 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveUser} 
                token={token}
                condominiums={condominiums}
                API_URL={BASE_URL}
            />
            
            {/* HEADER MOBILE/DESKTOP (CLEAN UI) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2 w-full">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        GESTÃO <span className="text-[#cb6ce6]">USUÁRIOS</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Administração de Clientes e Acessos</p>
                </div>
            </div>

            {/* HEADER DASHBOARD (MÉTRICAS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="p-3.5 bg-green-50 rounded-2xl text-green-500"><CheckCircle2 size={24} strokeWidth={2.5}/></div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-extrabold-id tracking-widest">Usuários Ativos</p>
                        <p className="text-3xl font-black text-gray-900 mt-0.5 leading-none">{activeCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] border border-gray-100 flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="p-3.5 bg-red-50 rounded-2xl text-red-500"><Ban size={24} strokeWidth={2.5}/></div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-extrabold-id tracking-widest">Contas Bloqueadas</p>
                        <p className="text-3xl font-black text-gray-900 mt-0.5 leading-none">{blockedCount}</p>
                    </div>
                </div>
            </div>
            
            {/* BARRA DE PESQUISA */}
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" size={20} strokeWidth={2.5} />
                    <input 
                        type="text" 
                        placeholder="Buscar por Nome, CPF ou Email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent text-gray-900 placeholder-gray-400 font-bold text-sm rounded-2xl focus:border-[#cb6ce6]/30 focus:bg-white outline-none pl-12 py-4 transition-all"
                    />
                </div>
            </div>
            
            {isLoading ? <div className="py-20 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-[#cb6ce6]" size={40} /><span className="text-[10px] font-extrabold-id uppercase tracking-widest text-gray-400">Carregando usuários...</span></div> : (
                <div className="w-full">
                    {/* --- VISÃO DESKTOP (BLINDADA CONTRA OVERFLOW) --- */}
                    <div className="hidden md:block bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full min-h-[400px] flex-col">
                        <div className="overflow-x-auto hide-scrollbar w-full">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-400 border-b border-gray-100 text-[9px] font-extrabold-id uppercase tracking-widest">
                                    <tr>
                                        <th className="p-5 pl-6">Utilizador</th>
                                        <th className="p-5">Documento (CPF)</th>
                                        <th className="p-5">Local / Ponto</th>
                                        <th className="p-5">Saldo Carteira</th>
                                        <th className="p-5 text-center">Status</th>
                                        <th className="p-5 text-center pr-6">Gerenciar</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-5 pl-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-[#cb6ce6]/10 flex items-center justify-center text-[#cb6ce6] font-extrabold-id text-base shadow-sm border border-[#cb6ce6]/20 shrink-0">
                                                        {(user.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-extrabold-id text-gray-900 block truncate max-w-[200px]">{user.name}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 block truncate max-w-[200px] mt-0.5">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 font-mono text-xs font-bold text-gray-500">{user.cpf || 'Não informado'}</td>
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-extrabold-id text-xs truncate max-w-[150px]">{user.condo_name || 'N/A'}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Apt/Sala: {user.apartment || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`font-black text-lg ${parseFloat(user.wallet_balance) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                    R$ {parseFloat(user.wallet_balance || 0).toFixed(2).replace('.', ',')}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                {user.is_active ? 
                                                    <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1.5 rounded-xl text-[9px] font-extrabold-id uppercase tracking-widest">Ativo</span> : 
                                                    <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-xl text-[9px] font-extrabold-id uppercase tracking-widest inline-flex items-center gap-1 justify-center w-fit mx-auto"><Ban size={12} strokeWidth={3}/> Bloqueado</span>
                                                }
                                            </td>
                                            <td className="p-5 text-center pr-6">
                                                <button 
                                                    onClick={() => handleOpenModal(user)} 
                                                    className="bg-white hover:bg-[#cb6ce6]/10 text-gray-400 hover:text-[#cb6ce6] p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-[#cb6ce6]/20 active:scale-95"
                                                    title="Editar Usuário"
                                                >
                                                    <Edit size={16} strokeWidth={2.5}/>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center p-16 text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhum usuário encontrado na busca.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- VISÃO MOBILE (CARDS NATIVOS) --- */}
                    <div className="md:hidden flex flex-col gap-4 w-full">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <div key={user.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                                
                                {/* Status Dot / Badge no Topo */}
                                <div className="absolute top-0 right-0">
                                    {user.is_active ? (
                                        <span className="bg-green-500 text-white text-[8px] font-extrabold-id tracking-widest px-3 py-1.5 rounded-bl-2xl shadow-sm z-10 block">ATIVO</span>
                                    ) : (
                                        <span className="bg-red-500 text-white text-[8px] font-extrabold-id tracking-widest px-3 py-1.5 rounded-bl-2xl shadow-sm z-10 flex items-center gap-1"><Ban size={10} strokeWidth={3}/> BLOQUEADO</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-5 mt-2 min-w-0">
                                    <div className="h-14 w-14 rounded-[20px] bg-[#cb6ce6]/10 flex items-center justify-center text-[#cb6ce6] font-extrabold-id text-xl border border-[#cb6ce6]/20 shrink-0">
                                        {(user.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 pr-6">
                                        <h3 className="font-extrabold-id text-gray-900 text-sm leading-tight truncate uppercase tracking-tighter">{user.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 truncate">{user.email}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
                                        <p className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest mb-1 flex items-center gap-1.5"><Wallet size={12} strokeWidth={3} className="text-[#cb6ce6]"/> Saldo</p>
                                        <p className={`text-xl font-black ${parseFloat(user.wallet_balance) > 0 ? 'text-green-600' : 'text-gray-400'}`}>R$ {parseFloat(user.wallet_balance || 0).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center min-w-0">
                                        <p className="text-[9px] text-gray-400 uppercase font-extrabold-id tracking-widest mb-1 flex items-center gap-1.5"><Building2 size={12} strokeWidth={3} className="text-blue-400"/> Ponto/Local</p>
                                        <p className="text-xs font-bold text-gray-900 truncate">{user.condo_name || 'Não associado'}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">Apt/Sala: {user.apartment || '-'}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleOpenModal(user)} 
                                    className="w-full bg-[#cb6ce6]/10 hover:bg-[#cb6ce6]/20 text-[#cb6ce6] border border-[#cb6ce6]/20 font-extrabold-id text-[10px] uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Edit size={16} strokeWidth={3} /> GERENCIAR CADASTRO
                                </button>
                            </div>
                        )) : (
                            <div className="text-center p-12 bg-white rounded-[28px] border border-gray-100 shadow-sm flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-300 flex justify-center items-center mb-4"><Search size={28} strokeWidth={2.5}/></div>
                                <p className="text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhum utilizador encontrado.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* PAGINAÇÃO (Design Clean) */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                        <button 
                            onClick={() => fetchUsers(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gray-50 text-gray-500 font-extrabold-id uppercase tracking-widest text-[10px] border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95 flex justify-center items-center gap-2"
                        >
                            <ChevronLeft size={16} strokeWidth={3}/> ANTERIOR
                        </button>
                        
                        <span className="text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">
                            PÁGINA <span className="text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg ml-1">{currentPage}</span>
                        </span>
                        
                        <button 
                            onClick={() => fetchUsers(currentPage + 1)} 
                            disabled={!usersData.users || usersData.users.length < 10}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gray-50 text-gray-500 font-extrabold-id uppercase tracking-widest text-[10px] border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95 flex justify-center items-center gap-2"
                        >
                            PRÓXIMA <ChevronRight size={16} strokeWidth={3}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CondoManager = ({ condominiums, onEdit, onDelete, onAddNew, token }) => {
    const handleRemoteUnlock = async (fridgeId) => {
        if (!fridgeId) {
            alert('Este condomínio não tem um ID de geladeira definido.');
            return;
        }
        if (window.confirm(`Tem a certeza que quer destravar remotamente a geladeira ${fridgeId}?`)) {
            try {
                const response = await fetch(`${API_URL}/api/admin/fridges/${fridgeId}/unlock`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao enviar comando.');
                alert('Comando de desbloqueio enviado com sucesso!');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in w-full font-sans">
            
            {/* --- HEADER MOBILE/DESKTOP (CLEAN UI) --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        GESTÃO <span className="text-[#cb6ce6]">UNIDADES</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Administração de Condomínios e Máquinas</p>
                </div>
                <button 
                    onClick={() => onAddNew()} 
                    className="w-full md:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-[10px] rounded-2xl py-4 px-6 shadow-lg shadow-[#cb6ce6]/25 flex justify-center items-center gap-2 active:scale-95 transition-all"
                >
                    <PlusCircle size={18} strokeWidth={2.5} /> NOVO CONDOMÍNIO
                </button>
            </div>

            {/* --- DESKTOP TABLE (BLINDADA CONTRA OVERFLOW) --- */}
            <div className="hidden md:block bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                <div className="overflow-x-auto hide-scrollbar w-full">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-400 border-b border-gray-100 text-[9px] font-extrabold-id uppercase tracking-widest">
                            <tr>
                                <th className="p-5 pl-6">Nome / Condomínio</th>
                                <th className="p-5">ID da Geladeira</th>
                                <th className="p-5">Síndico / Responsável</th>
                                <th className="p-5 text-right pr-6">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {condominiums.map(condo => (
                                <tr key={condo.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="p-5 pl-6 font-extrabold-id text-gray-900 text-sm truncate max-w-[300px]">{condo.name}</td>
                                    <td className="p-5">
                                        <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                            {condo.fridge_id || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-5 font-bold text-gray-500 text-xs">{condo.syndic_name || 'Não informado'}</td>
                                    <td className="p-5 pr-6">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleRemoteUnlock(condo.fridge_id)} 
                                                className="bg-white hover:bg-green-50 text-gray-400 hover:text-green-500 p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-green-200" 
                                                title="Destravar Remotamente"
                                            >
                                                <KeyRound size={16} strokeWidth={2.5} />
                                            </button>
                                            <button 
                                                onClick={() => onEdit(condo)} 
                                                className="bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-500 p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-blue-200" 
                                                title="Editar"
                                            >
                                                <Edit size={16} strokeWidth={2.5} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(condo.id)} 
                                                className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-red-200" 
                                                title="Apagar"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {condominiums.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center p-16 text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">
                                        Nenhuma unidade cadastrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MOBILE CARDS (DESIGN NATIVO) --- */}
            <div className="md:hidden flex flex-col gap-4 w-full">
                {condominiums.map(condo => (
                    <div key={condo.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
                        
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="h-14 w-14 rounded-[20px] bg-gray-50 flex-shrink-0 border border-gray-100 flex items-center justify-center text-[#cb6ce6]">
                                    <Building2 size={24} strokeWidth={2.5}/>
                                </div>
                                <div className="min-w-0 pr-2">
                                    <h3 className="font-extrabold-id text-gray-900 text-sm leading-tight truncate uppercase tracking-tighter">{condo.name}</h3>
                                    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest truncate">Resp: {condo.syndic_name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center mb-5">
                            <span className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest">ID Geladeira</span>
                            <span className="font-mono text-[10px] font-bold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                {condo.fridge_id || 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-50">
                            <button 
                                onClick={() => handleRemoteUnlock(condo.fridge_id)} 
                                className="flex-1 py-3.5 bg-green-50 text-green-600 rounded-xl font-extrabold-id text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-green-100"
                            >
                                <KeyRound size={14} strokeWidth={3}/> Destravar
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => onEdit(condo)} className="p-3.5 bg-white rounded-xl text-gray-400 hover:text-blue-500 transition-all active:scale-95 border border-gray-200 shadow-sm">
                                    <Edit size={16} strokeWidth={2.5}/>
                                </button>
                                <button onClick={() => onDelete(condo.id)} className="p-3.5 bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all active:scale-95 border border-gray-200 shadow-sm">
                                    <Trash2 size={16} strokeWidth={2.5}/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {condominiums.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest bg-white rounded-[28px] border border-gray-100 shadow-sm">
                        Nenhuma unidade cadastrada.
                    </div>
                )}
            </div>
        </div>
    );
};
    

// App.js -> ADICIONE ESTE NOVO COMPONENTE

const AddProductToInventoryModal = ({ isOpen, onClose, onAdd, token, productsInInventory }) => {
    const [step, setStep] = React.useState(1); // 1: Selecionar, 2: Configurar
    const [masterProducts, setMasterProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    
    // Filtros
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('Todas');
    
    // Seleção
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [addQty, setAddQty] = React.useState(1);
    const [addDate, setAddDate] = React.useState('');

    // Busca produtos globais ao abrir
    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSearchTerm('');
            setSelectedProduct(null);
            setLoading(true);
            
            fetch(`${API_URL}/api/admin/products`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    const lista = Array.isArray(data) ? data : (data.products || []);
                    setMasterProducts(lista);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, token]);

    // Lógica de Filtro
    const categories = ['Todas', ...new Set(masterProducts.map(p => p.category).filter(Boolean))];
    
    const filteredList = masterProducts.filter(p => {
        const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
        return matchName && matchCat;
    });

    const handleSelect = (prod) => {
        setSelectedProduct(prod);
        setStep(2); // Vai para a tela de definir quantidade
    };

    const handleConfirm = () => {
        if (!selectedProduct) return;
        onAdd(selectedProduct, addQty, addDate);
        onClose();
    };

    // Verifica se o produto já está no inventário deste condomínio (para mostrar aviso visual)
    const isAlreadyInStock = (prodId) => productsInInventory.some(p => p.id === prodId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-scale-up">
                
                {/* HEADER */}
                <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                            <PlusCircle className="text-blue-500" /> Adicionar Produto
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {step === 1 ? 'Selecione o produto na lista global' : 'Defina a quantidade de entrada'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-900/50 custom-scrollbar">
                    {step === 1 ? (
                        <>
                            {/* BARRA DE FILTROS */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 z-10 bg-gray-900/95 p-4 rounded-xl border border-gray-700 backdrop-blur shadow-lg">
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        placeholder="Pesquisar por nome..." 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 text-white focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="w-full md:w-64 relative group">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20}/>
                                    <select 
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* GRID DE PRODUTOS */}
                            {loading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={48}/></div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredList.map(prod => {
                                        const alreadyHas = isAlreadyInStock(prod.id);
                                        return (
                                            <div 
                                                key={prod.id} 
                                                onClick={() => handleSelect(prod)}
                                                className={`group relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 border
                                                ${alreadyHas ? 'bg-blue-900/10 border-blue-500/30 hover:border-blue-400' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                                            >
                                                {/* Imagem */}
                                                <div className="h-16 w-16 bg-gray-900 rounded-xl overflow-hidden shrink-0 border border-white/5">
                                                    <img src={prod.image_url || 'https://placehold.co/100'} className="h-full w-full object-cover" alt="" />
                                                </div>
                                                
                                                {/* Infos */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white truncate">{prod.name}</h4>
                                                    <p className="text-xs text-gray-400">{prod.category || 'Geral'}</p>
                                                    
                                                    {alreadyHas ? (
                                                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 mt-1">
                                                            <Check size={10}/> Já em estoque (Repor)
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-500 mt-1 block group-hover:text-white transition-colors">
                                                            Novo no condomínio
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Seta Hover */}
                                                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                                                    <ArrowRight className="text-white" size={20} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {filteredList.length === 0 && (
                                        <div className="col-span-full text-center py-20 text-gray-500">
                                            <Package size={48} className="mx-auto mb-4 opacity-20"/>
                                            <p>Nenhum produto encontrado com esses filtros.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        // --- STEP 2: QUANTIDADE ---
                        <div className="h-full flex flex-col items-center justify-center animate-fade-in">
                            <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 flex flex-col items-center text-center gap-6 w-full max-w-lg shadow-2xl">
                                
                                {/* Destaque do Produto */}
                                <div className="relative">
                                    <div className="h-32 w-32 bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-600 mx-auto">
                                        <img src={selectedProduct.image_url || 'https://placehold.co/200'} className="h-full w-full object-cover" alt="" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-700 px-3 py-1 rounded-full border border-gray-600 shadow-sm whitespace-nowrap">
                                        <span className="text-xs font-bold text-white">R$ {parseFloat(selectedProduct.sale_price).toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                                    <p className="text-gray-400">{selectedProduct.category}</p>
                                </div>

                                {/* Inputs */}
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <div className="bg-gray-900/50 p-4 rounded-xl text-left border border-gray-700 hover:border-blue-500/50 transition-colors">
                                        <label className="text-xs font-bold text-blue-400 uppercase mb-2 block">Quantidade</label>
                                        <input 
                                            type="number" 
                                            autoFocus
                                            value={addQty}
                                            onChange={e => setAddQty(Math.max(1, e.target.value))}
                                            className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-xl text-left border border-gray-700 hover:border-blue-500/50 transition-colors">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Validade (Opcional)</label>
                                        <input 
                                            type="date" 
                                            value={addDate}
                                            onChange={e => setAddDate(e.target.value)}
                                            className="w-full bg-transparent text-lg text-white outline-none mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex gap-3 w-full mt-2">
                                    <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl bg-gray-700 text-gray-300 font-bold hover:bg-gray-600 transition">
                                        Voltar
                                    </button>
                                    <button onClick={handleConfirm} className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20">
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};



const StockManagement = ({ condominiums, token, API_URL }) => {
    const BASE_URL = API_URL || 'http://localhost:5000';

    // --- ESTADOS ---
    const [selectedCondoId, setSelectedCondoId] = useState(condominiums[0]?.id || '');
    const [inventory, setInventory] = useState([]); 
    const [inventoryQuantities, setInventoryQuantities] = useState({}); 
    const [inventoryDates, setInventoryDates] = useState({}); 
    const [searchQuery, setSearchQuery] = useState('');
    const [isStockLoading, setIsStockLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); 
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Estados do Modal
    const [allProducts, setAllProducts] = useState([]);
    const [modalSearchQuery, setModalSearchQuery] = useState('');
    const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);
    const [qtyToAdd, setQtyToAdd] = useState(1);

    // --- FETCH INVENTORY ---
    const fetchInventory = useCallback(async () => {
        if (selectedCondoId) {
            setIsStockLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/admin/inventory?condoId=${selectedCondoId}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });

                if (!response.ok) throw new Error('Falha ao buscar estoque.');
                
                const data = await response.json();
                const lista = Array.isArray(data) ? data : [];
                setInventory(lista); 
                
                const quantities = {};
                const dates = {};
                
                lista.forEach(item => {
                    quantities[item.id] = item.quantity || 0; 
                    if (item.nearest_expiration_date) {
                        dates[item.id] = new Date(item.nearest_expiration_date).toISOString().split('T')[0];
                    } else {
                        dates[item.id] = '';
                    }
                });
                
                setInventoryQuantities(quantities);
                setInventoryDates(dates);

            } catch (err) { 
                console.error(err);
                setToast({ show: true, message: 'Erro ao carregar dados.' });
            } finally { 
                setIsStockLoading(false); 
            }
        } else {
            setInventory([]);
        }
    }, [selectedCondoId, token, BASE_URL]);
    
    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    // Fetch todos os produtos para o Modal
    useEffect(() => {
        if (isAddModalOpen && allProducts.length === 0) {
            const fetchAllProducts = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/admin/products`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setAllProducts(Array.isArray(data) ? data : []);
                    }
                } catch (err) { console.error("Erro ao buscar catálogo completo:", err); }
            };
            fetchAllProducts();
        }
    }, [isAddModalOpen, allProducts.length, token, BASE_URL]);

    // --- HANDLERS ---
    const handleInventoryChange = (productId, quantity) => {
        setInventoryQuantities(prev => ({ ...prev, [productId]: Math.max(0, parseInt(quantity) || 0) }));
    };

    const handleDateChange = (productId, date) => {
        setInventoryDates(prev => ({ ...prev, [productId]: date }));
    };

    // --- SALVAR NO BANCO ---
    const handleSaveAllChanges = async () => {
        if (!selectedCondoId) return;
        setIsSaving(true);

        try {
            const itemsToSave = inventory.map(product => ({
                product_id: product.id,
                quantity: inventoryQuantities[product.id],
                nearest_expiration_date: inventoryDates[product.id] || null 
            }));

            const response = await fetch(`${BASE_URL}/api/admin/inventory/bulk-update`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    condo_id: selectedCondoId,
                    items: itemsToSave
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao salvar');
            }

            setToast({ show: true, message: 'Estoque salvo com sucesso!' });
            await fetchInventory();

        } catch (error) {
            console.error("Erro ao salvar:", error);
            setToast({ show: true, message: `Erro: ${error.message}` });
        } finally {
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
            setIsSaving(false);
        }
    };

    // --- FUNÇÃO DE ADICIONAR (NOVA LÓGICA DO MODAL) ---
    const confirmAddProduct = () => {
        if (!selectedProductToAdd) return;
        
        const exists = inventory.find(p => p.id === selectedProductToAdd.id);
        
        if (exists) {
            const currentQty = inventoryQuantities[selectedProductToAdd.id] || 0;
            const newTotal = currentQty + parseInt(qtyToAdd);
            setInventoryQuantities(prev => ({ ...prev, [selectedProductToAdd.id]: newTotal }));
            setToast({ show: true, message: `Adicionado +${qtyToAdd} unidades de ${selectedProductToAdd.name}!` });
        } else {
            setInventory(prev => [selectedProductToAdd, ...prev]);
            setInventoryQuantities(prev => ({ ...prev, [selectedProductToAdd.id]: parseInt(qtyToAdd) }));
            setToast({ show: true, message: `${selectedProductToAdd.name} adicionado! Clique em SALVAR.` });
        }
        
        setIsAddModalOpen(false);
        setSelectedProductToAdd(null);
        setQtyToAdd(1);
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleRemoveProduct = async (productId, productName) => {
        if (!window.confirm(`Tem certeza que deseja remover "${productName}" da lista?`)) return;
        
        setInventory(prev => prev.filter(p => p.id !== productId));
        setInventoryQuantities(prev => ({ ...prev, [productId]: 0 }));

        setToast({ show: true, message: 'Produto removido da lista. Clique em Salvar para confirmar.' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // --- FILTRAGEM ---
    const filteredInventory = inventory.filter(item => 
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredModalProducts = allProducts.filter(item => 
        (item.name || '').toLowerCase().includes(modalSearchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 pb-24 animate-fade-in px-5 md:px-8 max-w-7xl mx-auto w-full pt-8 font-sans bg-gray-50 min-h-screen">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* --- MODAL ADICIONAR PRODUTO --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-extrabold-id text-gray-900 uppercase tracking-tighter text-lg leading-none">Adicionar Produto</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Busque no catálogo</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm active:scale-95 transition-all">
                                <X size={18} strokeWidth={3}/>
                            </button>
                        </div>
                        
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2.5}/>
                                <input 
                                    type="text" 
                                    placeholder="Nome do produto..." 
                                    value={modalSearchQuery}
                                    onChange={(e) => setModalSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/40 focus:bg-white rounded-2xl pl-11 py-3 text-sm font-bold outline-none transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {filteredModalProducts.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredModalProducts.map(prod => (
                                        <button 
                                            key={prod.id}
                                            onClick={() => setSelectedProductToAdd(prod)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${selectedProductToAdd?.id === prod.id ? 'border-[#cb6ce6] bg-[#cb6ce6]/5 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                {prod.image_url ? <img src={prod.image_url} className="w-full h-full object-cover" alt=""/> : <Package size={16} className="text-gray-300"/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-extrabold-id text-gray-900 text-xs truncate uppercase">{prod.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">{prod.category || 'Geral'}</p>
                                            </div>
                                            {selectedProductToAdd?.id === prod.id && <CheckCircle2 size={20} className="text-[#cb6ce6] shrink-0"/>}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhum produto encontrado.</div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            {selectedProductToAdd ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold-id text-gray-500 uppercase tracking-widest">Quantidade:</span>
                                        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <button onClick={() => setQtyToAdd(Math.max(1, qtyToAdd - 1))} className="px-4 py-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors font-black">-</button>
                                            <input type="number" value={qtyToAdd} onChange={(e) => setQtyToAdd(Math.max(1, parseInt(e.target.value)||1))} className="w-16 text-center font-black text-gray-900 border-x border-gray-200 py-2 outline-none"/>
                                            <button onClick={() => setQtyToAdd(qtyToAdd + 1)} className="px-4 py-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors font-black">+</button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={confirmAddProduct}
                                        className="w-full bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-[#cb6ce6]/25 active:scale-95 transition-all flex justify-center items-center gap-2"
                                    >
                                        <PlusCircle size={16} strokeWidth={3}/> Adicionar à Lista
                                    </button>
                                </div>
                            ) : (
                                <button disabled className="w-full bg-gray-200 text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest py-4 rounded-2xl cursor-not-allowed">
                                    Selecione um produto
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST ESTILIZADO */}
            {toast.show && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
                    <div className="px-6 py-3 rounded-full shadow-lg border border-green-200 bg-green-50 text-green-600 text-[10px] font-extrabold-id uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={16} strokeWidth={3}/> 
                        {toast.message}
                    </div>
                </div>
            )}
            
            {/* HEADER CLEAN UI */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div className="flex flex-col gap-1 z-10 relative">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        GESTÃO <span className="text-[#cb6ce6]">ESTOQUE</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Controle de entrada e saída por condomínio.</p>
                </div>

                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 z-10 relative">
                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        disabled={!selectedCondoId} 
                        className="w-full sm:w-auto bg-white border border-gray-200 hover:border-[#cb6ce6]/50 text-gray-600 hover:text-[#cb6ce6] font-extrabold-id text-[10px] uppercase tracking-widest py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-95 shadow-sm"
                    >
                        <PlusCircle size={18} strokeWidth={2.5}/> Adicionar Produto
                    </button>
                    
                    <button 
                        onClick={handleSaveAllChanges} 
                        disabled={isSaving || isStockLoading || !selectedCondoId} 
                        className="w-full sm:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[10px] uppercase tracking-widest py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#cb6ce6]/25 disabled:opacity-50 active:scale-95"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} strokeWidth={2.5} />}
                        {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                    </button>
                </div>
            </div>

            {/* FILTROS CLEAN UI */}
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row gap-4 items-center">
                
                <div className="w-full md:w-1/3 relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" size={18} strokeWidth={2.5} />
                    <select 
                        onChange={(e) => setSelectedCondoId(e.target.value)} 
                        value={selectedCondoId} 
                        className="w-full bg-gray-50 border-2 border-transparent text-gray-900 focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl pl-11 py-3.5 pr-4 text-xs font-bold outline-none appearance-none cursor-pointer transition-all"
                    >
                        <option value="" disabled>Selecione a Unidade...</option>
                        {condominiums.map(condo => <option key={condo.id} value={condo.id}>{condo.name}</option>)}
                    </select>
                </div>

                <div className="hidden md:block w-px h-10 bg-gray-100"></div>

                <div className="w-full md:flex-grow relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" size={18} strokeWidth={2.5} />
                    <input 
                        type="text" 
                        placeholder="Buscar produto pelo nome..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={!selectedCondoId}
                        className="w-full bg-gray-50 border-2 border-transparent text-gray-900 focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl pl-11 py-3.5 pr-4 text-xs font-bold outline-none placeholder-gray-400 transition-all disabled:opacity-50"
                    />
                </div>
            </div>
            
            {/* TABELA E LISTA DE ESTOQUE */}
            {isStockLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                    <Loader2 size={40} className="animate-spin text-[#cb6ce6]"/>
                    <span className="text-[10px] font-extrabold-id uppercase tracking-widest animate-pulse">Sincronizando Estoque...</span>
                </div>
            ) : !selectedCondoId ? (
                <div className="bg-white rounded-[32px] border border-gray-100 p-16 flex flex-col items-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-5 border border-gray-100"><Building2 size={32} strokeWidth={2.5}/></div>
                    <p className="text-sm font-extrabold-id text-gray-900 uppercase tracking-widest">Nenhuma unidade selecionada</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Escolha uma máquina acima para ver o inventário.</p>
                </div>
            ) : (
                <div className="w-full">
                    {/* TABLE DESKTOP */}
                    <div className="hidden md:flex flex-col bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full min-h-[400px]">
                        <div className="overflow-x-auto hide-scrollbar w-full">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 text-[9px] font-extrabold-id uppercase tracking-widest">
                                        <th className="p-5 pl-6">Produto</th>
                                        <th className="p-5 w-48 text-center">Quantidade</th>
                                        <th className="p-5 w-48 text-center">Validade Mais Próxima</th>
                                        <th className="p-5 w-24 text-center">Remover</th> 
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {filteredInventory.map(product => {
                                        const currentQty = inventoryQuantities[product.id] || 0;
                                        const critical = product.critical_stock_level || 5;
                                        
                                        let borderColor = 'border-gray-200 focus:border-[#cb6ce6]/50';
                                        let statusLabel = null;

                                        if (currentQty === 0) {
                                            borderColor = 'border-red-200 focus:border-red-400';
                                            statusLabel = <span className="text-[9px] text-red-500 font-extrabold-id uppercase tracking-widest mt-2 flex justify-center items-center gap-1"><AlertCircle size={10} strokeWidth={3}/> ESGOTADO</span>;
                                        } else if (currentQty <= critical) {
                                            borderColor = 'border-yellow-300 focus:border-yellow-500';
                                            statusLabel = <span className="text-[9px] text-yellow-600 font-extrabold-id uppercase tracking-widest mt-2 flex justify-center items-center gap-1"><AlertTriangle size={10} strokeWidth={3}/> BAIXO</span>;
                                        }

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-5 pl-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                                            {product.image_url ? <img src={product.image_url} className="h-full w-full object-cover" alt=""/> : <Package className="text-gray-300" size={20}/>}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-extrabold-id text-gray-900 text-sm block truncate max-w-[200px]">{product.name}</span>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block truncate max-w-[200px]">{product.category || 'Geral'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <input 
                                                            type="number" 
                                                            value={currentQty} 
                                                            onChange={(e) => handleInventoryChange(product.id, e.target.value)} 
                                                            className={`w-24 bg-gray-50 border-2 rounded-xl py-2.5 text-center text-gray-900 font-black text-lg outline-none transition-all ${borderColor}`} 
                                                        />
                                                        {statusLabel}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className="flex justify-center">
                                                        <input 
                                                            type="date" 
                                                            value={inventoryDates[product.id] || ''} 
                                                            onChange={(e) => handleDateChange(product.id, e.target.value)} 
                                                            className="w-36 bg-gray-50 border-2 border-gray-200 rounded-xl py-2.5 px-3 text-gray-900 font-bold text-xs focus:border-[#cb6ce6]/50 focus:bg-white outline-none text-center cursor-pointer transition-all" 
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <button 
                                                        onClick={() => handleRemoveProduct(product.id, product.name)} 
                                                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                        title="Remover do condomínio"
                                                    >
                                                        <Trash2 size={18} strokeWidth={2.5}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredInventory.length === 0 && (
                                        <tr><td colSpan="4" className="text-center p-16 text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhum produto listado no inventário.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MOBILE LIST */}
                    <div className="md:hidden flex flex-col gap-4 w-full">
                        {filteredInventory.map(product => {
                            const currentQty = inventoryQuantities[product.id] || 0;
                            const critical = product.critical_stock_level || 5;
                            
                            let borderColor = 'border-gray-200 focus:border-[#cb6ce6]/50';
                            let statusLabel = null;

                            if (currentQty === 0) {
                                borderColor = 'border-red-200 focus:border-red-400 bg-red-50';
                                statusLabel = <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-extrabold-id tracking-widest px-3 py-1.5 rounded-bl-2xl shadow-sm z-10 flex items-center gap-1"><AlertCircle size={10}/> ESGOTADO</span>;
                            } else if (currentQty <= critical) {
                                borderColor = 'border-yellow-300 focus:border-yellow-500 bg-yellow-50';
                                statusLabel = <span className="absolute top-0 right-0 bg-yellow-500 text-white text-[8px] font-extrabold-id tracking-widest px-3 py-1.5 rounded-bl-2xl shadow-sm z-10 flex items-center gap-1"><AlertTriangle size={10}/> BAIXO</span>;
                            }

                            return (
                                <div key={product.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                                    {statusLabel}
                                    
                                    <div className="flex justify-between items-start mb-5 gap-3">
                                        <div className="flex items-center gap-3.5 min-w-0 w-full">
                                            <div className="h-14 w-14 rounded-[20px] bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                                                {product.image_url ? <img src={product.image_url} className="h-full w-full object-cover" alt=""/> : <Package size={20} className="text-gray-300"/>}
                                            </div>
                                            <div className="min-w-0 pr-6">
                                                <h3 className="font-extrabold-id text-gray-900 text-sm leading-tight truncate uppercase tracking-tighter">{product.name}</h3>
                                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest truncate">{product.category}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-extrabold-id text-gray-400 uppercase block pl-1 tracking-widest">QTD</label>
                                            <input 
                                                type="number" 
                                                value={currentQty} 
                                                onChange={(e) => handleInventoryChange(product.id, e.target.value)} 
                                                className={`w-full py-3.5 px-3 rounded-2xl border-2 focus:outline-none font-black text-xl text-center text-gray-900 transition-all ${borderColor}`} 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-extrabold-id text-gray-400 uppercase block pl-1 tracking-widest">Validade</label>
                                            <input 
                                                type="date" 
                                                value={inventoryDates[product.id] || ''} 
                                                onChange={(e) => handleDateChange(product.id, e.target.value)} 
                                                className="w-full bg-gray-50 py-3.5 px-2.5 rounded-2xl border-2 border-transparent focus:border-[#cb6ce6]/50 focus:bg-white outline-none text-[11px] font-bold text-gray-900 text-center transition-all" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                                        <button 
                                            onClick={() => handleRemoveProduct(product.id, product.name)} 
                                            className="text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 py-2 px-4 rounded-xl text-[9px] font-extrabold-id uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
                                        >
                                            <Trash2 size={12} strokeWidth={3}/> Remover Produto
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredInventory.length === 0 && (
                            <div className="p-12 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest bg-white rounded-[28px] border border-gray-100 shadow-sm">Nenhum produto listado.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- COMPONENTE: BARRA DE SAÚDE FINANCEIRA ---
const FinancialHealthBar = ({ revenue, expense }) => {
    const rev = parseFloat(revenue || 0);
    const exp = parseFloat(expense || 0);
    const total = Math.max(rev, 1);
    
    const profitVal = rev - exp;
    const expensePercent = Math.min(100, (exp / total) * 100);
    const profitPercent = Math.max(0, 100 - expensePercent);

    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-end mb-2">
                    <h4 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Margem Operacional</h4>
                    <span className={`text-xl font-black ${profitVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profitVal >= 0 ? 'Positiva' : 'Negativa'}
                    </span>
                </div>
                
                <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden flex relative">
                    <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${expensePercent}%` }}></div>
                    <div className="h-full bg-green-500 flex-1 transition-all duration-1000"></div>
                </div>

                <div className="flex justify-between mt-3 text-xs font-bold">
                    <span className="text-red-400">Custo: {expensePercent.toFixed(1)}%</span>
                    <span className="text-green-400">Lucro: {profitPercent.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const FinancialChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500">Sem dados</div>;
    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
                    <Tooltip contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#60a5fa'}} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// === SUB-COMPONENTE: PERFORMANCE (Circular) ===
const PerformanceCard = ({ margin, efficiency }) => {
    const data = [
        { name: 'Margem', value: parseFloat(margin) || 0 },
        { name: 'Restante', value: 100 - (parseFloat(margin) || 0) }
    ];
    const COLORS = ['#10b981', '#374151'];

    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <div className="relative w-40 h-40">
                {/* Simulando gráfico circular simples com SVG se não quiser usar PieChart complexo */}
                <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                    <path
                        className="text-gray-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className={`${parseFloat(margin) > 0 ? 'text-green-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                        strokeDasharray={`${Math.max(0, parseFloat(margin))}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{parseFloat(margin).toFixed(1)}%</span>
                    <span className="text-xs text-gray-400 uppercase font-bold">Margem Líquida</span>
                </div>
            </div>
            
            <div className="w-full mt-6 space-y-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Eficiência de Estoque</span>
                    <span>{efficiency}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, Math.max(0, efficiency))}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};



const FinanceReport = ({ condominiums, token, API_URL }) => {
    const BASE_URL = API_URL || 'http://localhost:5000';
    
    // Referência para rolar até o extrato
    const extractRef = useRef(null);

    const [isLoading, setIsLoading] = React.useState(true);
    const [filterInputs, setFilterInputs] = React.useState({ condoId: 'all', period: 'month' }); 
    const [financeData, setFinanceData] = React.useState({
        kpis: { revenue: 0, expenses: 0, net_profit: 0, profit_margin: 0, average_ticket: 0 },
        chart_data: [],
        transactions: [] 
    });

    // Modal States
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newTransaction, setNewTransaction] = React.useState({ description: '', amount: '', date: '', category: 'Outros', type: 'expense' });
    const [isSaving, setIsSaving] = React.useState(false);

    // === FETCH ===
    const fetchFinanceData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams(filterInputs).toString();
            // Chama a rota nova que calcula tudo junto
            const response = await fetch(`${BASE_URL}/api/admin/financial/stats?${query}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });

            if (response.ok) {
                const data = await response.json();
                
                // Formata gráfico
                const formattedChart = data.chartData && data.chartData.labels ? data.chartData.labels.map((l, i) => ({
                    name: l, value: data.chartData.data[i]
                })) : [];

                setFinanceData({
                    kpis: {
                        revenue: parseFloat(data.revenue || 0),
                        expenses: parseFloat(data.expenses || 0), // Isso já inclui suas despesas manuais!
                        net_profit: parseFloat(data.profit || 0),
                        profit_margin: parseFloat(data.margin || 0),
                        average_ticket: parseFloat(data.ticketAverage || 0)
                    },
                    chart_data: formattedChart,
                    transactions: data.transactions || [] // Lista vinda do banco
                });
            }
        } catch (err) { console.error(err); } 
        finally { setIsLoading(false); }
    }, [filterInputs, token, BASE_URL]);

    React.useEffect(() => { fetchFinanceData(); }, [fetchFinanceData]);

    // === AÇÕES ===
    
    // 1. SALVAR DESPESA
    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${BASE_URL}/api/admin/finance/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newTransaction)
            });
            
            if (res.ok) {
                setIsModalOpen(false);
                setNewTransaction({ description: '', amount: '', date: '', category: 'Outros', type: 'expense' });
                // ATENÇÃO: Recarrega os dados para atualizar os cards de Custo e Lucro
                await fetchFinanceData(); 
                alert("Movimentação registrada com sucesso!");
            } else {
                alert("Erro ao salvar.");
            }
        } catch (err) { alert("Erro de conexão."); }
        finally { setIsSaving(false); }
    };

    // 2. EXCLUIR DESPESA
    const handleDeleteTransaction = async (id) => {
        if(!window.confirm("Remover esta movimentação? Os valores serão reajustados.")) return;
        try {
            await fetch(`${BASE_URL}/api/admin/finance/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchFinanceData(); // Atualiza painel
        } catch (error) { alert("Erro ao deletar"); }
    };

    // 3. BAIXAR RELATÓRIO (CSV)
    const handleDownloadReport = () => {
        if (financeData.transactions.length === 0) return alert("Nada para exportar no período selecionado.");

        const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
        const rows = financeData.transactions.map(t => [
            new Date(t.date).toLocaleDateString('pt-BR'),
            t.description,
            t.category,
            t.type === 'income' ? 'Receita' : 'Despesa',
            parseFloat(t.amount).toFixed(2).replace('.', ',')
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(";") + "\n" 
            + rows.map(e => e.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 4. VER EXTRATO COMPLETO (Scroll)
    const scrollToExtract = () => {
        if (extractRef.current) {
            extractRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleFilterChange = (e) => setFilterInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <div className="flex flex-col gap-6 pb-24 animate-fade-in px-5 md:px-8 max-w-7xl mx-auto w-full pt-8 font-sans bg-gray-50 min-h-screen">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* CABEÇALHO */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        PAINEL <span className="text-[#cb6ce6]">FINANCEIRO</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Análise e Fluxo de Caixa</p>
                </div>
                
                <div className="bg-white p-3 sm:p-2.5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-2.5 items-center shadow-sm w-full lg:w-auto">
                    <select 
                        name="period" 
                        onChange={handleFilterChange} 
                        value={filterInputs.period} 
                        className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold text-gray-600 outline-none cursor-pointer w-full sm:w-40 uppercase tracking-widest focus:border-[#cb6ce6]/50 transition-all"
                    >
                        <option value="7days">7 Dias</option>
                        <option value="month">Este Mês</option>
                        <option value="year">Este Ano</option>
                    </select>
                    <button 
                        onClick={fetchFinanceData} 
                        className="w-full sm:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white p-3.5 sm:p-3 rounded-xl transition-all shadow-md shadow-[#cb6ce6]/25 active:scale-95 flex justify-center items-center gap-2"
                    >
                        <Filter size={16} strokeWidth={2.5}/> 
                        <span className="text-[10px] font-extrabold-id uppercase tracking-widest sm:hidden">Filtrar</span>
                    </button>
                </div>
            </div>

            {isLoading ? <div className="py-32 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin mx-auto text-[#cb6ce6]" size={40}/><span className="text-[10px] font-extrabold-id uppercase tracking-widest text-gray-400">Processando finanças...</span></div> : (
                <>
                    {/* KPIS (Clean Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                        
                        {/* Receita */}
                        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-green-500"><DollarSign size={80}/></div>
                            <div className="bg-green-50 p-3 rounded-2xl text-green-500 w-fit mb-4"><DollarSign size={20} strokeWidth={2.5}/></div>
                            <p className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest mb-1">Receita Total</p>
                            <h3 className="text-3xl font-black text-gray-900 truncate">R$ {financeData.kpis.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                        </div>

                        {/* Despesas */}
                        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500"><TrendingDown size={80}/></div>
                            <div className="bg-red-50 p-3 rounded-2xl text-red-500 w-fit mb-4"><TrendingDown size={20} strokeWidth={2.5}/></div>
                            <p className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest mb-1">Saídas Totais</p>
                            <h3 className="text-3xl font-black text-gray-900 truncate">R$ {financeData.kpis.expenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                            <p className="text-[9px] font-bold text-red-500 mt-2 uppercase tracking-widest">Inclui despesas extras</p>
                        </div>

                        {/* Lucro */}
                        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-500"><Wallet size={80}/></div>
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-500 w-fit mb-4"><Wallet size={20} strokeWidth={2.5}/></div>
                            <p className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest mb-1">Lucro Líquido</p>
                            <h3 className={`text-3xl font-black truncate ${financeData.kpis.net_profit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                R$ {financeData.kpis.net_profit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </h3>
                            <div className={`mt-2 text-[9px] font-extrabold-id uppercase tracking-widest w-fit px-2.5 py-1 rounded-lg ${financeData.kpis.net_profit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                                Margem: {financeData.kpis.profit_margin}%
                            </div>
                        </div>

                        {/* Resumo Rápido e Botões */}
                        <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center gap-3 hover:scale-[1.02] transition-transform">
                            <p className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest text-center mb-1">Ações do Relatório</p>
                            <button 
                                onClick={handleDownloadReport} 
                                className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-extrabold-id uppercase tracking-widest py-4 rounded-2xl border border-gray-200 transition-all active:scale-95"
                            >
                                <Download size={14} strokeWidth={3}/> Baixar Planilha
                            </button>
                            <button 
                                onClick={scrollToExtract} 
                                className="flex items-center justify-center gap-2 bg-[#cb6ce6]/10 hover:bg-[#cb6ce6]/20 text-[#cb6ce6] text-[10px] font-extrabold-id uppercase tracking-widest py-4 rounded-2xl transition-all active:scale-95"
                            >
                                <TrendingUp size={14} strokeWidth={3}/> Ver Lançamentos
                            </button>
                        </div>
                    </div>

                    {/* GRÁFICO (Adaptado para Clean UI) */}
                    <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                        <h3 className="text-[11px] font-extrabold-id text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <BarChart2 className="text-[#cb6ce6]" size={18} strokeWidth={2.5}/> Evolução da Receita
                        </h3>
                        <div className="w-full h-[300px]">
                            {/* O componente FinancialChart precisa ser capaz de renderizar um gráfico responsivo e claro */}
                            <FinancialChart data={financeData.chart_data} />
                        </div>
                    </div>

                    {/* CONTAS A PAGAR & EXTRATO */}
                    <div ref={extractRef} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-2 w-full">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-sm font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                <TrendingDown className="text-red-500" size={18} strokeWidth={2.5}/> Extrato & Lançamentos
                            </h3>
                            <button 
                                onClick={() => { setIsModalOpen(true); setNewTransaction(prev => ({...prev, type: 'expense'})); }} 
                                className="w-full sm:w-auto text-[10px] bg-white text-gray-900 border border-gray-200 px-5 py-3 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all font-extrabold-id uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                            >
                                <PlusCircle size={14} strokeWidth={3}/> Novo Lançamento
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto hide-scrollbar w-full">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-400 text-[9px] font-extrabold-id uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="p-5 pl-6">Data</th>
                                        <th className="p-5">Descrição</th>
                                        <th className="p-5">Categoria</th>
                                        <th className="p-5 text-right">Valor Líquido</th>
                                        <th className="p-5 text-center pr-6">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {financeData.transactions && financeData.transactions.length > 0 ? financeData.transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-5 pl-6 font-bold text-gray-500 text-xs uppercase tracking-widest">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-5 font-extrabold-id text-gray-900 text-xs flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
                                                {t.description}
                                            </td>
                                            <td className="p-5 text-gray-500 font-bold text-[10px] uppercase tracking-widest">{t.category}</td>
                                            <td className={`p-5 text-right font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                                {t.type === 'income' ? '+' : '-'} R$ {parseFloat(t.amount).toFixed(2).replace('.', ',')}
                                            </td>
                                            <td className="p-5 text-center pr-6">
                                                <button 
                                                    onClick={() => handleDeleteTransaction(t.id)} 
                                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5}/>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-16 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhum lançamento no período.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL LANÇAMENTO MANUAL (Clean UI) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
                    <div className="bg-white border border-gray-100 w-full max-w-md rounded-[32px] p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden">
                        
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Novo Lançamento</h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Registrar receita ou despesa manual</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 shadow-sm transition-colors active:scale-95">
                                <X size={16} strokeWidth={3}/>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                            
                            {/* Toggle Receita/Despesa */}
                            <div className="grid grid-cols-2 gap-3 mb-5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})} 
                                    className={`py-3 rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest transition-all ${newTransaction.type === 'expense' ? 'bg-red-50 border border-red-200 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 border border-transparent'}`}
                                >
                                    Despesa (-)
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})} 
                                    className={`py-3 rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest transition-all ${newTransaction.type === 'income' ? 'bg-green-50 border border-green-200 text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 border border-transparent'}`}
                                >
                                    Receita (+)
                                </button>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Descrição</label>
                                <input 
                                    required type="text" placeholder="Ex: Conta de Luz, Reposição extra..." 
                                    value={newTransaction.description} 
                                    onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} 
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 px-4 text-gray-900 text-sm font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Valor</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold-id text-xs">R$</span>
                                        <input 
                                            required type="number" step="0.01" placeholder="0.00" 
                                            value={newTransaction.amount} 
                                            onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})} 
                                            className={`w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 pl-10 pr-3 font-black text-base outline-none transition-all placeholder-gray-300 ${newTransaction.type === 'expense' ? 'focus:border-red-300 focus:bg-white text-red-600' : 'focus:border-green-300 focus:bg-white text-green-600'}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Data</label>
                                    <input 
                                        required type="date" 
                                        value={newTransaction.date} 
                                        onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} 
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 px-3 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pb-4">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Categoria</label>
                                <select 
                                    value={newTransaction.category} 
                                    onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} 
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 px-4 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Outros">Outros</option>
                                    <option value="Operacional">Custos Operacionais</option>
                                    <option value="Fornecedor">Pagamento Fornecedor</option>
                                    <option value="Marketing">Marketing / Divulgação</option>
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto flex-1 py-4 rounded-2xl bg-white border border-gray-200 text-gray-500 font-extrabold-id text-[10px] uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all shadow-sm">Cancelar</button>
                                <button type="submit" disabled={isSaving} className="w-full sm:w-auto flex-1 py-4 rounded-2xl bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[10px] uppercase tracking-widest shadow-lg shadow-[#cb6ce6]/25 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                    {isSaving ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16} strokeWidth={3}/>}
                                    {isSaving ? 'SALVANDO...' : 'REGISTRAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


const CondoModal = ({ isOpen, onClose, onSave, condo }) => {
    const [formData, setFormData] = React.useState({});

    React.useEffect(() => {
        setFormData(condo || {
            name: '',
            address: '',
            syndic_name: '',
            syndic_contact: '',
            syndic_profit_percentage: 0,
            initial_investment: 0,
            monthly_fixed_cost: 0,
            fridge_id: ''
        });
    }, [condo]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 relative">
                
                {/* CABEÇALHO DO MODAL */}
                <div className="p-6 sm:p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="font-extrabold-id text-gray-900 uppercase tracking-tighter flex items-center gap-2 text-xl mb-1">
                            <div className="bg-[#cb6ce6]/10 p-2 rounded-xl text-[#cb6ce6]">
                                <Store size={20} strokeWidth={2.5}/>
                            </div>
                            {condo ? 'Editar Ponto de Venda' : 'Novo Ponto de Venda'}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-11">
                            Configuração de Equipamento e Repasses
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm active:scale-95"
                    >
                        <X size={18} strokeWidth={3}/>
                    </button>
                </div>

                {/* CORPO DO FORMULÁRIO (Com scroll interno) */}
                <form id="pdvForm" onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto hide-scrollbar space-y-6">
                    
                    {/* Seção 1: Dados Básicos */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-extrabold-id text-[#cb6ce6] uppercase tracking-widest border-b border-gray-100 pb-2">Informações do Local</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Nome do Ponto de Venda</label>
                                <input 
                                    name="name" value={formData.name || ''} onChange={handleChange} 
                                    placeholder="Ex: Condomínio Torres / Empresa XYZ..." 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300" 
                                    required 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">ID do Equipamento</label>
                                <input 
                                    name="fridge_id" value={formData.fridge_id || ''} onChange={handleChange} 
                                    placeholder="Ex: SF001, GEL-02..." 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 font-mono uppercase" 
                                    required 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Endereço</label>
                                <input 
                                    name="address" value={formData.address || ''} onChange={handleChange} 
                                    placeholder="Rua, Número, Bairro..." 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Contato e Responsável */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-extrabold-id text-[#cb6ce6] uppercase tracking-widest border-b border-gray-100 pb-2 mt-2">Contato do Local</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Responsável (Síndico/Gestor)</label>
                                <input 
                                    name="syndic_name" value={formData.syndic_name || ''} onChange={handleChange} 
                                    placeholder="Nome completo..." 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Contato do Responsável</label>
                                <input 
                                    name="syndic_contact" value={formData.syndic_contact || ''} onChange={handleChange} 
                                    placeholder="(00) 00000-0000" 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Dados Financeiros */}
                    <div className="space-y-4 bg-green-50/50 p-5 rounded-3xl border border-green-100/50">
                        <h4 className="text-[10px] font-extrabold-id text-green-600 uppercase tracking-widest border-b border-green-200/50 pb-2">Acordos Financeiros</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-extrabold-id text-gray-500 uppercase tracking-widest pl-1">Repasse / Comissão (%)</label>
                                <div className="relative">
                                    <input 
                                        name="syndic_profit_percentage" type="number" step="0.01" value={formData.syndic_profit_percentage || ''} onChange={handleChange} 
                                        placeholder="0.00" 
                                        className="w-full bg-white border-2 border-transparent focus:border-green-300 rounded-2xl py-3.5 pl-4 pr-8 text-sm font-black text-gray-900 outline-none transition-all placeholder-gray-300 shadow-sm" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold-id">%</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-extrabold-id text-gray-500 uppercase tracking-widest pl-1">Investimento Inicial (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold-id text-xs">R$</span>
                                    <input 
                                        name="initial_investment" type="number" step="0.01" value={formData.initial_investment || ''} onChange={handleChange} 
                                        placeholder="0.00" 
                                        className="w-full bg-white border-2 border-transparent focus:border-green-300 rounded-2xl py-3.5 pl-9 pr-3 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-extrabold-id text-gray-500 uppercase tracking-widest pl-1">Custo Fixo Mensal (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold-id text-xs">R$</span>
                                    <input 
                                        name="monthly_fixed_cost" type="number" step="0.01" value={formData.monthly_fixed_cost || ''} onChange={handleChange} 
                                        placeholder="0.00" 
                                        className="w-full bg-white border-2 border-transparent focus:border-green-300 rounded-2xl py-3.5 pl-9 pr-3 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300 shadow-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* RODAPÉ DO MODAL (Botões) */}
                <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-full sm:w-auto px-6 py-4 rounded-2xl text-gray-500 bg-white border border-gray-200 font-extrabold-id uppercase tracking-widest text-[10px] hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        form="pdvForm"
                        className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-[10px] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#cb6ce6]/25 active:scale-95"
                    >
                        SALVAR PONTO
                    </button>
                </div>
            </div>
        </div>
    );
};

// App.js -> Substitua o seu ProductModal

const ProductModal = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = React.useState({});

    React.useEffect(() => {
        const initialData = {
            name: '',
            description: '',
            image_url: '',
            purchase_price: '',
            sale_price: '',
            critical_stock_level: 5,
            promotional_price: '', // Agora é um campo de texto vazio
            promotion_start_date: '',
            promotion_end_date: '',
            category: '' // Categoria adicionada
        };
        
        // Formata as datas para o input type="date"
        const productData = product ? {
            ...product,
            promotional_price: product.promotional_price || '', // Garante que não é 'null' no input
            promotion_start_date: product.promotion_start_date ? product.promotion_start_date.split('T')[0] : '',
            promotion_end_date: product.promotion_end_date ? product.promotion_end_date.split('T')[0] : ''
        } : initialData;

        setFormData(productData);
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            // Converte string vazia de volta para null para o banco de dados
            promotional_price: formData.promotional_price || null,
            promotion_start_date: formData.promotion_start_date || null,
            promotion_end_date: formData.promotion_end_date || null
        };
        onSave(dataToSave);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">{product ? 'Editar' : 'Novo'} Produto</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">Nome do Produto</label><input name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">Descrição</label><textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" rows="3"></textarea></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">URL da Imagem</label><input name="image_url" value={formData.image_url || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                        
                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-orange-400">Precificação</div>
                        
                        <div><label className="text-sm text-gray-400">Preço de Compra (Custo)</label><input name="purchase_price" type="number" step="0.01" value={formData.purchase_price || ''} onChange={handleChange} placeholder="Ex: 5.50" className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                        <div><label className="text-sm text-gray-400">Preço de Venda Padrão</label><input name="sale_price" type="number" step="0.01" value={formData.sale_price || ''} onChange={handleChange} placeholder="Ex: 9.99" className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                        
                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-orange-400">Promoção (Opcional)</div>

                        {/* --- CAMPO DE PREÇO PROMOCIONAL ATUALIZADO (MANUAL) --- */}
                        <div>
                            <label className="text-sm text-gray-400">Preço Promocional (Manual)</label>
                            <input 
                                name="promotional_price" 
                                type="number" 
                                step="0.01" 
                                value={formData.promotional_price || ''} 
                                onChange={handleChange} 
                                placeholder="Ex: 8.49" 
                                className="w-full bg-gray-700 p-2 rounded-md mt-1" 
                            />
                        </div>
                        {/* --- CAMPO DE CATEGORIA (Já existia no seu modal) --- */}
                        <div><label className="text-sm text-gray-400">Categoria</label>
                            <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1">
                                <option value="">Nenhuma</option>
                                <option value="Refrigerantes">Refrigerantes</option>
                                <option value="Energéticos">Energéticos</option>
                                <option value="Bebida alcoólica (+18)">Bebida alcoólica</option>
                                <option value="Bebida 0 álcool">Bebida 0 álcool</option>
                                <option value="Salgadinhos">Salgadinhos</option>
                                <option value="Doces">Doces</option>
                                <option value="Miojo e Cup Noodles">Miojo e Cup Noodles</option>
                                <option value="Biscoitos/Bolachas">Biscoitos/Bolachas</option>
                                <option value="Ingredientes">Ingredientes</option>
                                <option value="Fitness">Fitness</option>
                            </select>
                        </div>
                        <div><label className="text-sm text-gray-400">Início da Promoção</label><input name="promotion_start_date" type="date" value={formData.promotion_start_date || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                        <div><label className="text-sm text-gray-400">Fim da Promoção</label><input name="promotion_end_date" type="date" value={formData.promotion_end_date || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>

                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-orange-400">Estoque</div>
                        <div><label className="text-sm text-gray-400">Nível Crítico de Estoque</label><input name="critical_stock_level" type="number" value={formData.critical_stock_level || ''} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded-md mt-1" required /></div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded-md">Cancelar</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md">Salvar Produto</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente FridgeSelectionPage por este

const FridgeSelectionPage = ({ setFridgeId, setPage, user, onLogout, onCondoSelected }) => {
    const [condos, setCondos] = React.useState([]);
    const [selectedCondoId, setSelectedCondoId] = React.useState('');
    const [rememberSelection, setRememberSelection] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    
    // --- DEFINIÇÃO DAS ANIMAÇÕES (Surgindo + Neon ESTÁTICO) ---
    const keyframes = `
        @keyframes surgir {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-surgir {
            animation: surgir 0.6s ease-out forwards;
            opacity: 0;
        }
    `;
    
    // --- Classe do Botão Neon (ESTÁTICO, sem pulso) ---
    const neonButtonClass = `
        bg-orange-500 text-white font-bold py-3 px-4 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-orange-500/40 hover:shadow-orange-400/60 /* Sombra neon estática */
        transition-all disabled:bg-gray-500 disabled:shadow-none
        transform hover:scale-105 /* Animação de hover */
    `;


    React.useEffect(() => {
        const fetchCondos = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/public/condominiums`);
                if (!response.ok) throw new Error('Não foi possível carregar a lista de condomínios.');
                const data = await response.json();
                setCondos(data);
                // Pré-seleciona o condomínio do usuário se ele existir
                if (user?.condoId) {
                    setSelectedCondoId(user.condoId);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCondos();
    }, [user?.condoId]);


   const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!selectedCondoId) {
            setError('Por favor, selecione um condomínio.');
            setIsLoading(false);
            return;
        }

        const selectedCondo = condos.find(c => c.id === parseInt(selectedCondoId));
        if (!selectedCondo || !selectedCondo.fridge_id) {
            setError('Este condomínio não tem uma máquina associada ou é inválido.');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            // A validação de 'fridge_id' e 'condoId' já existe no backend
            const response = await fetch(`${API_URL}/api/public/validate-fridge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ condoId: selectedCondo.id, fridgeId: selectedCondo.fridge_id })
            });

            const data = await response.json();
            if (response.ok && data.valid) {
                // Passa o valor da checkbox para a função onCondoSelected
                onCondoSelected(selectedCondo, rememberSelection);
            } else {
                setError(data.message || 'Seleção inválida.');
            }
        } catch (err) {
            setError('Não foi possível validar a seleção. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // --- FUNDO ESCURO (Cor normal) ---
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <style>{keyframes}</style>
            
            <div className="w-full max-w-md">

                {/* --- CARD DE VIDRO (Layout do Login) --- */}
                <div className="bg-gray-800/50 backdrop-blur-sm 
                                border border-gray-700/50 
                                p-8 rounded-2xl shadow-2xl 
                                animate-surgir"
                >
                    
                    {/* Logo (Imagem) */}
                    <div className="text-center mb-8 animate-surgir" style={{ animationDelay: '100ms' }}>
                        <img 
                            src="/logo-smartfridge.png" // Caminho para a pasta /public
                            alt="SmartFridge Logo" 
                            className="h-12 w-auto mx-auto" // h-12 (48px)
                        />
                    </div>
                    
                    {/* Título e Subtítulo (Atualizados) */}
                    <h2 className="text-2xl font-light text-center mb-2 text-white animate-surgir" style={{ animationDelay: '200ms' }}>
                        Selecione sua Máquina
                    </h2>
                    <p className="text-gray-400 text-center mb-8 animate-surgir" style={{ animationDelay: '300ms' }}>
                        Escolha o condomínio para aceder à loja.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-surgir" style={{ animationDelay: '400ms' }}>
                        
                        {/* --- Dropdown (Estilo Transparente) --- */}
                        <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={selectedCondoId}
                                onChange={(e) => setSelectedCondoId(e.target.value)}
                                // --- CORREÇÃO DO FUNDO ---
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-4 pl-12 pr-4 
                                           text-white text-base
                                           focus:outline-none focus:ring-2 focus:ring-orange-500
                                           appearance-none"
                                required
                                disabled={isLoading || condos.length === 0}
                            >
                                <option value="">{isLoading ? 'A carregar...' : 'Selecione um condomínio'}</option>
                                {condos.map(condo => (
                                    <option key={condo.id} value={condo.id} className="bg-gray-800">{condo.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Checkbox "Lembrar seleção" */}
                        <div className="flex items-center justify-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberSelection}
                                onChange={(e) => setRememberSelection(e.target.checked)}
                                className="h-4 w-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-offset-gray-900"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">Lembrar minha seleção</label>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        
                        {/* --- Botão Neon (ESTÁTICO) --- */}
                        <button 
                            type="submit" 
                            className={`w-full ${neonButtonClass}`} 
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar na Loja'}
                        </button>
                    </form>
                    
                    {/* --- Botão Sair (Sutil) --- */}
                    <div className="text-center mt-6 border-t border-gray-700/50 pt-6">
                        <button 
                            onClick={onLogout} 
                            className="text-sm text-red-500 hover:text-red-400 transition 
                                       font-medium flex items-center justify-center gap-2 w-full"
                        >
                            <LogOut size={16} /> Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InventoryAnalysisPage = ({ condominiums, token }) => {
    // --- ESTADO ATUALIZADO ---
    const [analysisData, setAnalysisData] = React.useState({ analysis: [], insights: {}, summary: {} });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // --- LÓGICA DE FILTRO ADICIONADA ---
    const getTodayInBrasilia = () => {
        const date = new Date();
        const [day, month, year] = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    const [filterInputs, setFilterInputs] = React.useState({ condoId: condominiums[0]?.id || '', startDate: '', endDate: '' });
    const [activeFilters, setActiveFilters] = React.useState({ condoId: condominiums[0]?.id || '', startDate: '', endDate: '' });
    
    // --- FETCH ATUALIZADO ---
    const fetchAnalysis = React.useCallback(async () => {
        if (!activeFilters.condoId) return;
        setIsLoading(true);
        setError('');
        
        // Adiciona os filtros na query
        const params = new URLSearchParams({ condoId: activeFilters.condoId });
        if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
        if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);

        try {
            const response = await fetch(`${API_URL}/api/admin/inventory-analysis?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar dados de análise.');
            const data = await response.json();
            setAnalysisData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeFilters, token]);

    // --- useEffect ATUALIZADO ---
    // Atualiza filtros iniciais e dispara o fetch
    React.useEffect(() => {
        if (condominiums.length > 0 && !filterInputs.condoId) {
            const defaultCondoId = condominiums[0].id;
            setFilterInputs(prev => ({ ...prev, condoId: defaultCondoId }));
            setActiveFilters(prev => ({ ...prev, condoId: defaultCondoId }));
        } else if (condominiums.length > 0 && activeFilters.condoId) {
            fetchAnalysis();
        } else if (condominiums.length === 0) {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [condominiums, activeFilters, fetchAnalysis]); // Dispara quando os filtros mudam

    const handleInputChange = (e) => { setFilterInputs(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleApplyFilters = () => { setActiveFilters(filterInputs); }; // Dispara o fetch
    
    const handleFilterToday = () => {
        const today = getTodayInBrasilia();
        const newFilters = { ...filterInputs, startDate: today, endDate: today };
        setFilterInputs(newFilters);
        setActiveFilters(newFilters); // Dispara o fetch
    };
    // --- FIM DA LÓGICA DE FILTRO ---


    const ProgressBar = ({ value, max }) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        let bgColor = 'bg-green-500';
        if (percentage < 50) bgColor = 'bg-yellow-500';
        if (percentage < 25) bgColor = 'bg-red-500';

        return (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        );
    };

    // --- COMPONENTE DE INSIGHTS ATUALIZADO ---
    const AIInsights = ({ insights }) => (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Insights do Assistente (Período)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Insight 1: Mais Vendidos (Unidades) */}
                <div>
                    <h4 className="font-semibold text-lg mb-2">🏆 Mais Vendidos (un.)</h4>
                    <div className="flex flex-col gap-2 text-sm">
                        {insights.topSellers?.length > 0 ? insights.topSellers.map(p => (
                            <p key={p.id} className="bg-gray-700 p-2 rounded-md">{p.name} <span className="font-bold float-right">{p.units_sold_in_period} un.</span></p>
                        )) : <p className="text-sm text-gray-500">Nenhuma venda no período.</p>}
                    </div>
                </div>
                
                {/* Insight 2: Mais Lucrativos (R$) */}
                <div>
                    <h4 className="font-semibold text-lg mb-2">💰 Mais Lucrativos (R$)</h4>
                     <div className="flex flex-col gap-2 text-sm">
                        {insights.topLucrative?.length > 0 ? insights.topLucrative.map(p => (
                            <p key={p.id} className="bg-gray-700 p-2 rounded-md">{p.name} 
                                <span className="font-bold float-right text-teal-300">
                                    {/* --- INÍCIO DA CORREÇÃO --- */}
                                    {/* Adiciona parseFloat() para corrigir o erro */}
                                    R$ {parseFloat(p.net_profit_in_period || 0).toFixed(2)}
                                    {/* --- FIM DA CORREÇÃO --- */}
                                </span>
                            </p>
                        )) : <p className="text-sm text-gray-500">Nenhum lucro no período.</p>}
                    </div>
                </div>
                
                {/* Insight 3: Sugestão de Promoção (Inteligente) */}
                <div>
                    <h4 className="font-semibold text-lg mb-2">💡 Sugestão de Promoção</h4>
                    <div className="flex flex-col gap-2 text-sm text-gray-300">
                        <p>Produtos com estoque mas <span className="font-bold">zero vendas</span> no período:</p>
                        {insights.promotionSuggestions?.length > 0 ? insights.promotionSuggestions.map(p => (
                            <p key={p.id} className="font-bold text-orange-300 bg-gray-700 p-2 rounded-md">- {p.name} ({p.current_stock} un.)</p>
                        )) : <p className="text-sm text-gray-500">Nenhum produto encalhado!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
    // --- FIM DOS INSIGHTS ---

    // Dados do resumo (para os novos cards)
    const summary = analysisData.summary || {};

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Análise de Inventário</h2>
            
            {/* --- FILTROS ADICIONADOS --- */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap items-end gap-4">
                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Filtrar por Condomínio</label>
                    <select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3">
                        {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div><label className="text-sm text-gray-400 mb-1 block">De</label><input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Até</label><input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3" /></div>
                <button onClick={handleFilterToday} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Hoje</button>
                <button onClick={handleApplyFilters} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Filter size={16} /> Aplicar</button>
            </div>
            {/* --- FIM DOS FILTROS --- */}

            
            {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-orange-400" size={48}/></div> : 
             error ? <p className="text-red-400 text-center">{error}</p> :
             (
                <>
                    {/* --- NOVOS CARDS DE RESUMO --- */}
                    <h3 className="text-2xl font-bold mb-4 text-orange-400">Resumo do Estoque (Total)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <AdminStatCard 
                            icon={<DollarSign size={32} />} 
                            label="Custo Total em Estoque" 
                            value={`R$ ${(summary.total_cost_all_stock || 0).toFixed(2)}`} 
                            colorClass="text-yellow-400" 
                        />
                        <AdminStatCard 
                            icon={<PiggyBank size={32} />} 
                            label="Lucro Potencial Total" 
                            value={`R$ ${(summary.total_potential_profit || 0).toFixed(2)}`} 
                            colorClass="text-green-400" 
                        />
                    </div>
                    {/* --- FIM DOS NOVOS CARDS --- */}

                    {/* Insights Atualizados */}
                    {analysisData.insights && <AIInsights insights={analysisData.insights} />}

                    {/* Tabela de Relatório Detalhado (Atualizada) */}
                    <h3 className="text-2xl font-bold mb-4 mt-8">Relatório Detalhado de Produtos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {analysisData.analysis?.map(product => (
                            <div key={product.id} className="bg-gray-800 rounded-lg p-4 flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <img src={product.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} alt={product.name} className="w-16 h-16 rounded-md object-cover"/>
                                    <div>
                                        <h3 className="font-bold text-lg">{product.name}</h3>
                                        <p className="text-sm text-gray-400">Preço Venda: R$ {parseFloat(product.sale_price).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Estoque Atual</span>
                                        <span className="font-bold">{product.current_stock} / {product.critical_stock_level * 2} (Máx. Sugerido)</span>
                                    </div>
                                    <ProgressBar value={product.current_stock} max={product.critical_stock_level * 2} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-gray-700 p-2 rounded-md">
                                        <p className="text-xs text-gray-400">Custo Total em Stock</p>
                                        <p className="font-bold text-yellow-400">R$ {parseFloat(product.total_cost_in_stock).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-gray-700 p-2 rounded-md">
                                        <p className="text-xs text-gray-400">Lucro Potencial</p>
                                        <p className="font-bold text-green-400">R$ {parseFloat(product.potential_net_profit).toFixed(2)}</p>
                                    </div>
                                    {/* --- DADOS ATUALIZADOS (Período) --- */}
                                    <div className="bg-gray-700 p-2 rounded-md">
                                        <p className="text-xs text-gray-400">Vendas (Período)</p>
                                        <p className="font-bold">{product.units_sold_in_period} un.</p>
                                    </div>
                                    <div className="bg-gray-700 p-2 rounded-md">
                                        <p className="text-xs text-gray-400">Lucro (Período)</p>
                                        <p className="font-bold text-teal-400">R$ {parseFloat(product.net_profit_in_period).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
             )
            }
        </div>
    );
};

// =================================================================================
// 4. Widget: Próximo da Validade (Estilo "Alerta Crítico")
// =================================================================================
const ExpiringSoonWidget = ({ token, condoId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpiring = async () => {
            setLoading(true);
            try {
                // Passa o condoId na URL para filtrar
                const url = new URL('http://localhost:5000/api/admin/dashboard/expiring-products'); // Ajuste sua URL base se necessário
                if (condoId && condoId !== 'all') {
                    url.searchParams.append('condoId', condoId);
                }

                const res = await fetch(url.toString(), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Erro ao buscar vencimentos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpiring();
    }, [condoId, token]); // Recarrega se mudar o condomínio

    // Função auxiliar para formatar data e calcular dias restantes
    const getDaysRemaining = (dateString) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const expiry = new Date(dateString);
        expiry.setHours(0,0,0,0); // Ajusta para comparar apenas datas, ignorando fuso exato na visualização
        
        // Diferença em milissegundos
        const diffTime = expiry - today; 
        // Diferença em dias
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    if (loading) return (
        <div className="h-24 flex flex-col items-center justify-center gap-3 w-full">
            <Loader2 className="animate-spin text-[#cb6ce6]" size={24} />
            <span className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest animate-pulse">Carregando alertas...</span>
        </div>
    );

    if (products.length === 0) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-[20px] p-5 flex items-center gap-4 w-full shadow-sm">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-green-100/50 flex-shrink-0">
                    <CheckCircle2 size={24} className="text-green-500" strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="text-green-700 font-extrabold-id text-xs uppercase tracking-widest">Tudo em dia!</h4>
                    <p className="text-green-600/80 text-[10px] font-bold mt-1 leading-tight">Nenhum produto próximo do vencimento (30 dias).</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 w-full font-sans">
            {products.map((item) => {
                const daysLeft = getDaysRemaining(item.expiry_date);
                const isCritical = daysLeft <= 5; // 5 dias ou menos é crítico
                
                return (
                    <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-3 sm:p-4 flex items-center gap-3 hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all w-full overflow-hidden">
                        
                        {/* Imagem do Produto */}
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                             {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[8px] font-extrabold-id text-gray-300 uppercase tracking-widest">IMG</span>
                            )}
                        </div>

                        {/* Infos do Produto */}
                        <div className="flex-1 min-w-0">
                            <h5 className="text-gray-900 text-[11px] sm:text-xs font-extrabold-id truncate uppercase tracking-tight">{item.name}</h5>
                            
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[100px] sm:max-w-[140px]">
                                    <MapPin size={10} strokeWidth={2.5} className="flex-shrink-0 text-gray-400" /> 
                                    <span className="truncate">{item.condo_name}</span>
                                </span>
                                <span className="text-[9px] font-extrabold-id text-[#cb6ce6] uppercase tracking-widest bg-[#cb6ce6]/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                    {item.quantity} un.
                                </span>
                            </div>
                        </div>

                        {/* Badge de Data e Alerta */}
                        <div className={`text-right px-3 py-2 rounded-xl border flex flex-col justify-center flex-shrink-0 ${isCritical ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                            <div className={`text-[10px] font-extrabold-id flex items-center gap-1.5 justify-end uppercase tracking-widest ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                                <CalendarDays size={12} strokeWidth={2.5} />
                                {new Date(item.expiry_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                            </div>
                            <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isCritical ? 'text-red-500' : 'text-yellow-600/80'}`}>
                                {daysLeft < 0 ? 'Vencido' : daysLeft === 0 ? 'Vence Hoje' : `Em ${daysLeft} dias`}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const LatestOrdersWidget = ({ token, condominiums }) => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Assume que existe esta rota (criei no passo anterior das rotas)
                const res = await fetch(`${API_URL}/api/admin/latest-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Erro ao buscar ordens", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    if (loading) return <div className="p-4 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Carregando transações...</div>;
    if (orders.length === 0) return <div className="p-4 text-center text-gray-500">Nenhum pedido recente.</div>;

    const getStatusStyle = (status) => {
        switch(status) {
            case 'paid': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="overflow-hidden">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                <Clock size={16} /> Últimas Transações
            </h4>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-700 text-xs uppercase">
                            <th className="py-3 px-2">Data</th>
                            <th className="py-3 px-2">Cliente</th>
                            <th className="py-3 px-2">Valor</th>
                            <th className="py-3 px-2">Condomínio</th>
                            <th className="py-3 px-2 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-700/50 hover:bg-white/5 transition-colors group">
                                <td className="py-3 px-2 text-gray-400 font-mono text-xs">
                                    {new Date(order.created_at).toLocaleDateString('pt-BR')} <br/>
                                    {new Date(order.created_at).toLocaleTimeString('pt-BR').slice(0,5)}
                                </td>
                                <td className="py-3 px-2 font-medium text-white group-hover:text-orange-400 transition-colors">
                                    {order.user_name?.split(' ')[0]}
                                </td>
                                <td className="py-3 px-2 text-white font-bold">
                                    R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                </td>
                                <td className="py-3 px-2 text-gray-400 text-xs">
                                    {/* Tenta encontrar o nome do condomínio pelo ID, se disponível */}
                                    {condominiums.find(c => c.id === order.condo_id)?.name || 'N/A'}
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                        {order.status === 'paid' ? 'APROVADO' : order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SalesPerformanceWidget = ({ title, data, type }) => {
    // Se não houver dados
    if (!data || data.length === 0) return (
        <div className="text-center py-8 text-gray-500 text-sm italic">
            Sem dados de vendas registrados ainda.
        </div>
    );

    // CORREÇÃO: Backend envia 'units_sold', não 'total_sold'
    const maxValue = Math.max(...data.map(item => Number(item.units_sold || 0)));

    return (
        <div className="w-full">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                {type === 'top' ? <TrendingUp size={16} className="text-green-400"/> : <ArrowDownToLine size={16} className="text-red-400"/>}
                {title}
            </h4>
            
            <div className="space-y-4">
                {data.map((item, index) => {
                    // CORREÇÃO: Lendo 'units_sold'
                    const value = Number(item.units_sold || 0);
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    const isFirst = index === 0 && type === 'top';
                    
                    return (
                        <div key={item.id || index} className="group">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-bold ${isFirst ? 'text-yellow-400' : 'text-white'}`}>
                                    {/* CORREÇÃO: Lendo 'name' em vez de 'product_name' */}
                                    {index + 1}. {item.name}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">
                                    {value} un.
                                </span>
                            </div>
                            
                            {/* Barra de Progresso */}
                            <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        isFirst ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(250,204,21,0.4)]' : 
                                        type === 'top' ? 'bg-blue-500' : 'bg-red-500/50'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const InventoryValueWidget = ({ data }) => {
    // --- LÓGICA INTACTA ---
    // Backend envia: total_inventory_cost e total_potential_profit_value
    const costValue = Number(data?.total_inventory_cost || 0);
    const profitValue = Number(data?.total_potential_profit_value || 0);
    
    // O valor de venda é a soma do custo + lucro (já que o backend não manda pronto)
    const saleValue = costValue + profitValue;
    
    // Nota: O backend atual não está mandando 'total_items' na query 'inventoryValueQuery'.
    // Se quiser mostrar isso, precisará adicionar "SUM(i.quantity) as total_items" na query do backend.
    // Por enquanto, deixei como 0 ou lendo se existir para não quebrar.
    const items = Number(data?.total_items || 0);

    // Calcula margem de lucro em %
    const margin = saleValue > 0 ? ((profitValue / saleValue) * 100).toFixed(1) : '0.0';

    return (
        <div className="w-full flex flex-col h-full relative font-sans">
            {/* Cabeçalho */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Layers size={14} className="text-[#cb6ce6]" strokeWidth={3}/> Patrimônio em Estoque
                    </h4>
                    <p className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 tracking-tighter leading-none">
                        R$ {saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[9px] text-gray-400 font-extrabold-id uppercase tracking-widest mt-2">Valor total de venda</p>
                </div>
                
                {/* Badge de Itens Otimizada */}
                {items > 0 && (
                    <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1.5 rounded-xl text-[9px] font-extrabold-id uppercase tracking-widest">
                            {items} Itens
                        </span>
                    </div>
                )}
            </div>

            {/* Corpo com Detalhes Financeiros */}
            <div className="space-y-3 mt-auto">
                
                {/* Linha de Custo (Discreta) */}
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        Investimento (Custo)
                    </div>
                    <span className="font-extrabold-id text-gray-500 text-xs">
                         R$ {costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Linha de Lucro (Destaque Clean) */}
                <div className="flex justify-between items-center bg-green-50/50 p-4 sm:p-5 rounded-[20px] border border-green-100/50">
                    <div className="flex items-center gap-2 text-green-600 text-[10px] font-extrabold-id uppercase tracking-widest">
                        <TrendingUp size={16} strokeWidth={3} />
                        Lucro Potencial
                    </div>
                    <div className="text-right">
                        <span className="block font-extrabold-id text-green-600 text-base sm:text-lg leading-none mb-1">
                             R$ {profitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-green-500/80 font-extrabold-id uppercase tracking-widest block">
                            Margem: {margin}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Barra Visual de Progresso Arredondada (Clean UI) */}
            <div className="w-full h-1.5 bg-gray-50 rounded-full flex mt-6 overflow-hidden">
                {/* Parte Cinza = Custo */}
                <div 
                    className="h-full bg-gray-300 transition-all duration-1000" 
                    style={{ width: `${saleValue > 0 ? (costValue / saleValue) * 100 : 0}%` }}
                ></div>
                {/* Parte Verde = Lucro */}
                <div 
                    className="h-full bg-green-400 transition-all duration-1000" 
                    style={{ width: `${saleValue > 0 ? (profitValue / saleValue) * 100 : 0}%` }}
                ></div>
            </div>
        </div>
    );
};

// =================================================================================
// COMPONENTES AUXILIARES (Mantenha ou atualize os existentes)
// =================================================================================

// 1. Relógio em Tempo Real
const LiveClock = () => {
    const [time, setTime] = React.useState(new Date());
    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 backdrop-blur-sm shadow-inner">
            <Clock size={16} className="text-orange-400" />
            <span className="text-lg font-mono font-bold text-white tracking-widest">
                {time.toLocaleTimeString('pt-BR')}
            </span>
        </div>
    );
};

// 2. Monitor de Saúde (Otimizado)
const SystemHealthMonitor = () => {
    const [status, setStatus] = React.useState('checking'); 
    const checkHealth = React.useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/`); 
            if (res.ok) setStatus('online');
            else setStatus('offline');
        } catch (error) { setStatus('offline'); }
    }, []);

    React.useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider border uppercase shadow-glow transition-all ${
            status === 'online' ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-green-500/20' : 
            status === 'offline' ? 'bg-red-500/10 border-red-500/50 text-red-400 animate-pulse' : 
            'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
        }`}>
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {status === 'online' ? 'Sistema Operacional' : 'Servidor Offline'}
        </div>
    );
};

// 3. Card Moderno (Com suporte a gradiente e ícones)
const ModernStatCard = ({ icon, label, value, subValue, colorName }) => {
    const colors = {
        green:  'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
        blue:   'from-blue-600/20 to-blue-900/10 border-blue-500/30 text-blue-400',
        purple: 'from-violet-600/20 to-violet-900/10 border-violet-500/30 text-violet-400',
        orange: 'from-orange-600/20 to-orange-900/10 border-orange-500/30 text-orange-400',
    };
    const style = colors[colorName] || colors.blue;

    return (
        <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${style.split(' ').slice(0,3).join(' ')} p-5 shadow-lg group hover:scale-[1.02] transition-transform duration-300`}>
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150">
                {icon}
            </div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                    {subValue && <p className="text-xs text-white/60 mt-1 font-medium">{subValue}</p>}
                </div>
                <div className={`p-2.5 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 ${style.split(' ').pop()}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

// =================================================================================
// PÁGINA DASHBOARD OTIMIZADA
// =================================================================================

const AdminDashboardPage = ({ token, setActiveTab, API_URL }) => {
    const BASE_URL = API_URL || 'http://localhost:5000';

    // Estados
    const [stats, setStats] = useState(null);
    const [condominiums, setCondominiums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    
    // Modal Unlock
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [targetUnlockCondo, setTargetUnlockCondo] = useState(null);

    // Filtros Iniciais
    const getTodayISO = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    const [filterInputs, setFilterInputs] = useState({ 
        startDate: getTodayISO(), 
        endDate: getTodayISO(), 
        condoId: 'all' 
    });

    // --- BUSCA DE DADOS ---
    const fetchStats = useCallback(async (isBackgroundRefresh = false) => {
        if (!isBackgroundRefresh) setIsLoading(true);
        else setIsRefreshing(true);
        setError('');

        const params = new URLSearchParams();
        if (filterInputs.startDate) params.append('startDate', filterInputs.startDate);
        if (filterInputs.endDate) params.append('endDate', filterInputs.endDate);
        if (filterInputs.condoId) params.append('condoId', filterInputs.condoId);

        try {
            const [statsRes, condoRes] = await Promise.all([
                fetch(`${BASE_URL}/api/admin/dashboard-stats?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${BASE_URL}/api/admin/condominiums`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            if (!statsRes.ok || !condoRes.ok) throw new Error('Falha na comunicação com o servidor.');

            const data = await statsRes.json();
            const condoData = await condoRes.json();
            
            setStats(data);
            setCondominiums(condoData);
        } catch (err) {
            console.error("Erro Dashboard:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [filterInputs, token, BASE_URL]);

    useEffect(() => { fetchStats(); }, []);

    // Handlers
    const handleInputChange = (e) => { setFilterInputs(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleApplyFilters = () => { fetchStats(false); };

    // --- LÓGICA DE EMERGÊNCIA ---
    const initiateUnlock = () => {
        if (filterInputs.condoId === 'all') {
            alert("⚠️ Selecione uma unidade específica no filtro acima primeiro.");
            return;
        }
        const condo = condominiums.find(c => c.id.toString() === filterInputs.condoId.toString());
        if (!condo) return alert("Condomínio não encontrado.");
        
        setTargetUnlockCondo(condo);
        setIsUnlockModalOpen(true);
    };

    const handleConfirmUnlock = async () => {
        if (!targetUnlockCondo) return;
        setIsUnlocking(true);
        try {
            const targetId = targetUnlockCondo.fridge_id || targetUnlockCondo.id; 
            const res = await fetch(`${BASE_URL}/api/admin/fridges/${targetId}/unlock`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(`✅ Comando enviado com sucesso!`);
                setIsUnlockModalOpen(false);
            } else {
                alert(`❌ Erro: ${data.message}`);
            }
        } catch (err) {
            alert(`Erro de conexão: ${err.message}`);
        } finally {
            setIsUnlocking(false);
        }
    };

    // Ticket Médio
    const ticketMedio = React.useMemo(() => {
        if (!stats?.orders_today) return 0;
        return stats.orders_today > 0 ? (parseFloat(stats.revenue_today) / parseInt(stats.orders_today)) : 0;
    }, [stats]);

    if (isLoading && !stats) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col gap-4 w-full">
            <Loader2 className="animate-spin text-[#cb6ce6]" size={40}/>
            <span className="text-[10px] font-extrabold-id uppercase tracking-widest text-gray-400 animate-pulse">Sincronizando Sistema...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden animate-fade-in w-full flex flex-col items-center">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                
                /* Ocultar barra de rolagem no mobile para o visual limpo do App */
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <EmergencyUnlockModal 
                isOpen={isUnlockModalOpen}
                onClose={() => setIsUnlockModalOpen(false)}
                onConfirm={handleConfirmUnlock}
                condoName={targetUnlockCondo?.name}
                isUnlocking={isUnlocking}
            />

            <div className="px-5 md:px-8 w-full max-w-7xl flex flex-col gap-5 pt-8">
                
                {/* --- HEADER MOBILE NATIVO (BRANCO) --- */}
                <div className="flex flex-col gap-1 mb-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        VISÃO <span className="text-[#cb6ce6]">GERAL</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">OwnMarket • Dashboard Manager</p>
                </div>

                {/* --- MENSAGEM DE ERRO --- */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm w-full">
                        <WifiOff size={20} strokeWidth={2.5} className="flex-shrink-0" /> 
                        <span className="font-extrabold-id text-[10px] uppercase tracking-widest flex-1 leading-tight">{error}</span>
                        <button onClick={() => fetchStats()} className="bg-red-100 hover:bg-red-200 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 flex-shrink-0">
                            Repetir
                        </button>
                    </div>
                )}

                {/* --- FILTROS (CLEAN UI & MOBILE PERFECT) --- */}
                <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                    <div className="flex flex-col md:flex-row gap-4">
                        
                        {/* Unidade */}
                        <div className="flex-1 space-y-1.5 w-full">
                            <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Unidade / Local</label>
                            <div className="relative group w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors">
                                    <Building2 size={18} strokeWidth={2.5} />
                                </div>
                                <select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none appearance-none cursor-pointer transition-all">
                                    <option value="all">Todas as Unidades</option>
                                    {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Datas Side-by-Side (50/50 exato no mobile) */}
                        <div className="flex gap-3 w-full md:flex-1">
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Data Inicial</label>
                                <input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 px-3 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all" />
                            </div>
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Data Final</label>
                                <input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 px-3 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all" />
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-3 w-full md:w-auto md:items-end mt-1 md:mt-0">
                            <button onClick={handleApplyFilters} className="flex-1 md:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-[10px] rounded-2xl py-3.5 px-6 shadow-lg shadow-[#cb6ce6]/25 flex justify-center items-center gap-2 active:scale-95 transition-all">
                                <Filter size={16} strokeWidth={2.5} /> FILTRAR
                            </button>
                            <button onClick={() => fetchStats(true)} className="w-14 bg-gray-50 text-gray-500 rounded-2xl flex justify-center items-center border border-gray-100 active:scale-95 transition-all hover:bg-gray-100">
                                <RefreshCw size={18} strokeWidth={2.5} className={isRefreshing ? "animate-spin text-[#cb6ce6]" : ""} />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* --- KPIs (CARROSSEL NO MOBILE - TOTALMENTE LEGÍVEL) --- */}
                {/* Repare no calc e nas margens negativas para não quebrar a largura da página */}
                <div className="flex overflow-x-auto gap-4 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible w-[calc(100%+40px)] md:w-full">
                    
                    {/* CARD 1: Faturamento */}
                    <div className="snap-center min-w-[260px] md:min-w-0 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest">Faturamento Bruto</h3>
                                <p className="text-2xl font-black text-gray-900 mt-1 truncate">
                                    R$ {(stats?.revenue_today || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 text-green-500 rounded-2xl flex-shrink-0">
                                <DollarSign size={22} strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">Vendas totais no período</p>
                    </div>

                    {/* CARD 2: Lucro */}
                    <div className="snap-center min-w-[260px] md:min-w-0 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest">Lucro Líquido</h3>
                                <p className="text-2xl font-black text-gray-900 mt-1 truncate">
                                    R$ {(stats?.net_profit_today || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl flex-shrink-0">
                                <PiggyBank size={22} strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">Após desconto de custos</p>
                    </div>

                    {/* CARD 3: Ticket */}
                    <div className="snap-center min-w-[260px] md:min-w-0 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest">Ticket Médio</h3>
                                <p className="text-2xl font-black text-gray-900 mt-1 truncate">
                                    R$ {ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                            </div>
                            <div className="p-3 bg-[#cb6ce6]/10 text-[#cb6ce6] rounded-2xl flex-shrink-0">
                                <Ticket size={22} strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">Gasto médio por cliente</p>
                    </div>

                    {/* CARD 4: Volume */}
                    <div className="snap-center min-w-[260px] md:min-w-0 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest">Pedidos</h3>
                                <p className="text-2xl font-black text-gray-900 mt-1 truncate">
                                    {stats?.orders_today || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl flex-shrink-0">
                                <ShoppingCart size={22} strokeWidth={2.5}/>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">Transações finalizadas</p>
                    </div>
                </div>

                {/* --- ÁREA PRINCIPAL WIDGETS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
                    
                    <div className="lg:col-span-2 space-y-5 w-full min-w-0">
                        {/* WIDGET PEDIDOS RECENTES */}
                        {/* A classe overflow-x-auto interna impede que a tabela quebre o site no mobile */}
                        <div className="bg-white rounded-[28px] p-2 sm:p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                            <div className="w-full overflow-x-auto hide-scrollbar">
                                <LatestOrdersWidget 
                                    token={token} 
                                    condominiums={condominiums} 
                                    condoId={filterInputs.condoId} 
                                />
                            </div>
                        </div>
                        
                        {/* WIDGET CAMPEÕES DE VENDA */}
                        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-yellow-50 text-yellow-500 rounded-xl"><Trophy size={18} strokeWidth={2.5} /></div>
                                <h3 className="font-extrabold-id uppercase tracking-widest text-[11px] text-gray-900">Campeões de Venda</h3>
                            </div>
                            <div className="w-full overflow-x-auto hide-scrollbar">
                                <SalesPerformanceWidget title="" data={stats?.top_sellers || []} type="top" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 w-full min-w-0">
                        
                        {/* --- CENTRO DE COMANDO (Ações Rápidas) --- */}
                        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                            <h3 className="text-[10px] font-extrabold-id text-gray-400 uppercase mb-5 tracking-widest flex items-center gap-2">
                                <Activity size={14} strokeWidth={3} className="text-[#cb6ce6]" /> Centro de Comando
                            </h3>
                            
                            <div className="space-y-3 w-full">
                                {/* BOTÃO DE ABRIR PORTA */}
                                <button 
                                    onClick={initiateUnlock} 
                                    disabled={isUnlocking || filterInputs.condoId === 'all'} 
                                    className={`w-full py-4 rounded-2xl font-extrabold-id uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${filterInputs.condoId === 'all' ? 'bg-gray-50 border-2 border-transparent text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95'}`}
                                >
                                    {isUnlocking ? <Loader2 className="animate-spin" size={16}/> : <Lock size={16} strokeWidth={2.5}/>} 
                                    {filterInputs.condoId === 'all' ? 'SELECIONE A UNIDADE' : 'ABRIR PORTA (EMERGÊNCIA)'}
                                </button>
                                
                                {/* BOTÃO NOVO PRODUTO */}
                                <button 
                                    onClick={() => setActiveTab('products')} 
                                    className="w-full bg-gray-50 hover:bg-gray-100 text-[#cb6ce6] py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] font-extrabold-id uppercase tracking-widest active:scale-95"
                                >
                                    <PlusCircle size={16} strokeWidth={2.5} /> CADASTRAR PRODUTO
                                </button>
                            </div>
                        </div>

                        {/* WIDGET ATENÇÃO */}
                        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                            <h3 className="font-extrabold-id uppercase tracking-widest text-gray-900 mb-5 text-[11px] flex items-center gap-2">
                                <AlertTriangle size={16} strokeWidth={2.5} className="text-yellow-500"/> Atenção Necessária
                            </h3>
                            <div className="w-full overflow-x-auto hide-scrollbar">
                                <ExpiringSoonWidget 
                                    token={token} 
                                    condominiums={condominiums} 
                                    condoId={filterInputs.condoId}
                                />
                            </div>
                        </div>
                        
                        {/* WIDGET INVENTÁRIO */}
                        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
                            <div className="w-full overflow-x-auto hide-scrollbar">
                                <InventoryValueWidget data={stats?.inventory_value || {}} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const EmergencyUnlockModal = ({ isOpen, onClose, onConfirm, condoName, isUnlocking }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={!isUnlocking ? onClose : undefined}></div>
            <div className="relative w-full max-w-sm bg-[#1e293b] border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-900/50 overflow-hidden animate-in zoom-in-95">
                <div className="bg-red-500/10 p-6 flex flex-col items-center text-center border-b border-red-500/20">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-red-500/40">
                        <Siren size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Zona de Perigo</h3>
                    <p className="text-red-300 text-xs mt-2 font-bold uppercase tracking-wider">Abertura de Emergência</p>
                </div>
                <div className="p-6 text-center space-y-4">
                    <p className="text-gray-400 text-sm">Você está prestes a forçar a abertura da porta:</p>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-bold text-white flex items-center justify-center gap-2">
                        <Building2 size={18} className="text-orange-500"/> {condoName || 'Unidade'}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                        Esta ação envia um comando direto de hardware. Use apenas se o cliente estiver impossibilitado de abrir pelo app.
                    </p>
                </div>
                <div className="p-4 bg-black/20 flex gap-3">
                    <button onClick={onClose} disabled={isUnlocking} className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-colors">Cancelar</button>
                    <button onClick={onConfirm} disabled={isUnlocking} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2">
                        {isUnlocking ? <Loader2 className="animate-spin" size={16}/> : 'CONFIRMAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductManager = React.memo(({ token, API_URL }) => {
    // GARANTIA: Se a prop API_URL não vier, tenta usar uma string fixa ou alertar erro
    const BASE_URL = API_URL || "http://localhost:5000"; 
    
    // --- ESTADOS ---
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    // Filtros e Paginação
    const [searchQuery, setSearchQuery] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('all');
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 8;

    // Modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '', category: '', purchase_price: '', sale_price: '', 
        promotional_price: '', promotion_start_date: '', promotion_end_date: '', 
        critical_stock_level: 5, image_url: '', global_stock: 0 
    });
    
    // Estado auxiliar para "Nova Categoria" no select
    const [isNewCategoryMode, setIsNewCategoryMode] = React.useState(false);

    // --- HELPER: Formatação ---
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // --- EFEITOS ---
    React.useEffect(() => {
        const fetchProducts = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await fetch(`${BASE_URL}/api/admin/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    const lista = Array.isArray(data) ? data : (data.products || []);
                    setProducts(lista);
                } else {
                    console.error('Erro na resposta da API:', res.status);
                }
            } catch (error) {
                console.error("Erro crítico ao buscar:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [token, BASE_URL]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== debouncedSearch) {
                setDebouncedSearch(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    React.useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterCategory]);

    // --- MEMOIZATION ---
    const filteredProducts = React.useMemo(() => {
        return products.filter(product => {
            const matchesSearch = (product.name || '').toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesCategory = filterCategory === 'all' || !filterCategory || product.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, debouncedSearch, filterCategory]);

    const categories = React.useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

    const { currentItems, totalPages } = React.useMemo(() => {
        const total = Math.ceil(filteredProducts.length / itemsPerPage);
        const last = currentPage * itemsPerPage;
        const first = last - itemsPerPage;
        return { currentItems: filteredProducts.slice(first, last), totalPages: total };
    }, [filteredProducts, currentPage]);

    // --- AÇÕES ---
    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setIsNewCategoryMode(false); 

        if (product) {
            setFormData({
                ...product,
                category: product.category || '',
                promotion_start_date: product.promotion_start_date ? product.promotion_start_date.split('T')[0] : '',
                promotion_end_date: product.promotion_end_date ? product.promotion_end_date.split('T')[0] : ''
            });
        } else {
            setFormData({ name: '', category: '', purchase_price: '', sale_price: '', promotional_price: '', promotion_start_date: '', promotion_end_date: '', critical_stock_level: 5, image_url: '', global_stock: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const endpoint = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                method, 
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, 
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const savedProduct = await res.json();
                if (editingProduct) {
                    setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
                } else {
                    setProducts(prev => [savedProduct, ...prev]);
                }
                setIsModalOpen(false);
            } else {
                const errData = await res.json();
                alert(`Erro ao salvar: ${errData.message || res.statusText}`);
            }
        } catch (err) { 
            console.error(err);
            alert(`Erro de conexão com: ${BASE_URL}`); 
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Arquivar produto?")) return;
        const backup = [...products];
        setProducts(prev => prev.filter(p => p.id !== id)); 

        try {
            await fetch(`${BASE_URL}/api/admin/products/${id}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Falha ao deletar, revertendo...');
            setProducts(backup);
        }
    };

    const isPromoActive = (p) => p.promotional_price && parseFloat(p.promotional_price) > 0;

    // --- RENDER ---
    return (
        <div className="flex flex-col gap-5 font-sans w-full animate-fade-in pt-8">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-5 md:px-0 mb-2 w-full">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        CATÁLOGO <span className="text-[#cb6ce6]">PRODUTOS</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gerenciamento de Estoque Base</p>
                </div>
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-[10px] rounded-2xl py-4 px-6 shadow-lg shadow-[#cb6ce6]/25 flex justify-center items-center gap-2 active:scale-95 transition-all">
                    <PlusCircle size={18} strokeWidth={2.5}/> NOVO PRODUTO
                </button>
            </div>

            {/* Filtros Clean UI */}
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mx-5 md:mx-0 w-auto md:w-full">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1 w-full space-y-1.5">
                        <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Buscar Produto</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" size={16} strokeWidth={2.5} />
                            <input 
                                type="text" 
                                placeholder="Nome, marca..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none transition-all placeholder-gray-300"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-72 space-y-1.5">
                        <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Filtrar por Categoria</label>
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#cb6ce6] transition-colors" size={16} strokeWidth={2.5} />
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 text-xs font-bold focus:border-[#cb6ce6]/30 focus:bg-white outline-none appearance-none cursor-pointer transition-all">
                                <option value="all">Todas as Categorias</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#cb6ce6] gap-4 w-full">
                    <Loader2 className="animate-spin" size={40}/>
                    <span className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest animate-pulse">Sincronizando Catálogo...</span>
                </div>
            ) : (
                <div className="mx-5 md:mx-0">
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:flex flex-col bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full min-h-[400px]">
                        <div className="overflow-x-auto hide-scrollbar w-full">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 text-[9px] font-extrabold-id uppercase tracking-widest">
                                        <th className="p-5 pl-6">Produto</th>
                                        <th className="p-5">Categoria</th>
                                        <th className="p-5">Preço</th>
                                        <th className="p-5 text-center">Status</th>
                                        <th className="p-5 text-center">Estoque Total</th>
                                        <th className="p-5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {currentItems.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-4 pl-6 flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                                                    {item.image_url ? 
                                                        <img src={item.image_url} className="h-full w-full object-cover" alt={item.name}/> : 
                                                        <Package className="text-gray-300" size={20}/>
                                                    }
                                                </div>
                                                <span className="font-extrabold-id text-gray-900 text-xs truncate max-w-[200px]">{item.name}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-gray-50 px-3 py-1.5 rounded-lg text-[9px] font-extrabold-id uppercase tracking-widest border border-gray-200 text-gray-500">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {isPromoActive(item) ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 line-through font-bold">{formatCurrency(item.sale_price)}</span>
                                                        <span className="text-[#cb6ce6] font-black text-base">{formatCurrency(item.promotional_price)}</span>
                                                    </div>
                                                ) : <span className="font-black text-gray-900 text-base">{formatCurrency(item.sale_price)}</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                {isPromoActive(item) && 
                                                    <span className="inline-flex items-center gap-1.5 bg-[#cb6ce6]/10 text-[#cb6ce6] px-2.5 py-1.5 rounded-xl text-[9px] font-extrabold-id uppercase tracking-widest">
                                                        <Calendar size={12} strokeWidth={3}/> PROMO
                                                    </span>
                                                }
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`font-extrabold-id px-3 py-1.5 rounded-xl text-[10px] tracking-wider uppercase border ${item.global_stock <= item.critical_stock_level ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                    {item.global_stock} UN
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleOpenModal(item)} className="p-2.5 bg-white border border-gray-100 hover:border-[#cb6ce6]/30 hover:bg-[#cb6ce6]/10 rounded-xl text-gray-400 hover:text-[#cb6ce6] transition-all shadow-sm"><Edit size={16} strokeWidth={2.5}/></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-white border border-gray-100 hover:border-red-200 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm"><Trash2 size={16} strokeWidth={2.5}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentItems.length === 0 && (
                                        <tr><td colSpan="6" className="p-20 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">Nenhum produto encontrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Desktop Paginação */}
                        {totalPages > 1 && (
                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center mt-auto">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest text-gray-500 hover:text-gray-900 disabled:opacity-40 flex items-center gap-2 shadow-sm active:scale-95 transition-all"><ChevronLeft size={16} strokeWidth={3}/> Anterior</button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${currentPage === i + 1 ? 'bg-[#cb6ce6] w-6' : 'bg-gray-300 w-2'}`}></div>
                                    ))}
                                </div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest text-gray-500 hover:text-gray-900 disabled:opacity-40 flex items-center gap-2 shadow-sm active:scale-95 transition-all">Próxima <ChevronRight size={16} strokeWidth={3}/></button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="md:hidden flex flex-col gap-4 w-full">
                        {currentItems.map(item => (
                            <div key={item.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex gap-4 relative overflow-hidden">
                                {isPromoActive(item) && <div className="absolute top-0 right-0 bg-[#cb6ce6] text-white text-[8px] font-extrabold-id tracking-widest px-3 py-1.5 rounded-bl-2xl shadow-sm z-10">OFERTA</div>}
                                
                                <div className="h-20 w-20 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                                    {item.image_url ? <img src={item.image_url} className="h-full w-full object-cover" alt=""/> : <Package size={24} className="text-gray-300"/>}
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center py-1 min-w-0">
                                    <h3 className="font-extrabold-id text-gray-900 text-sm truncate">{item.name}</h3>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 mb-2 truncate">{item.category}</p>
                                    
                                    <div className="flex items-end justify-between mt-auto">
                                        <div>
                                            {isPromoActive(item) ? (
                                                <>
                                                    <span className="text-[10px] text-gray-400 line-through block font-bold">{formatCurrency(item.sale_price)}</span>
                                                    <div className="text-[#cb6ce6] font-black text-lg leading-none">{formatCurrency(item.promotional_price)}</div>
                                                </>
                                            ) : <div className="text-gray-900 font-black text-lg leading-none">{formatCurrency(item.sale_price)}</div>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[#cb6ce6] border border-gray-200 active:scale-95 transition-all"><Edit size={16} strokeWidth={2.5}/></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 border border-gray-200 active:scale-95 transition-all"><Trash2 size={16} strokeWidth={2.5}/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {currentItems.length === 0 && (
                            <div className="p-10 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest bg-white rounded-[28px] border border-gray-100 shadow-sm">Nenhum produto encontrado.</div>
                        )}
                        
                        {/* Mobile Paginação */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3.5 bg-white border border-gray-200 rounded-xl text-gray-500 disabled:opacity-40 shadow-sm active:scale-95"><ChevronLeft size={18} strokeWidth={3}/></button>
                                <span className="text-gray-400 font-extrabold-id uppercase tracking-widest text-[9px]">Pág <span className="text-gray-900">{currentPage}</span>/{totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3.5 bg-white border border-gray-200 rounded-xl text-gray-500 disabled:opacity-40 shadow-sm active:scale-95"><ChevronRight size={18} strokeWidth={3}/></button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO (Clean UI) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-extrabold-id uppercase tracking-tighter text-gray-900 flex items-center gap-2">
                                {editingProduct ? <Edit size={20} className="text-[#cb6ce6]"/> : <Plus size={20} className="text-[#cb6ce6]"/>}
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors shadow-sm active:scale-95"><X className="text-gray-500" size={16} strokeWidth={3}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6 overflow-y-auto hide-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Nome do Produto</label>
                                    <input required placeholder="Ex: Bebida Energética..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300"/>
                                </div>
                                
                                {/* SELEÇÃO DE CATEGORIA */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Categoria</label>
                                    {isNewCategoryMode ? (
                                        <div className="flex gap-2">
                                            <input 
                                                autoFocus required placeholder="Nova categoria..." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} 
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300"
                                            />
                                            <button type="button" onClick={() => { setIsNewCategoryMode(false); setFormData({...formData, category: ''}) }} className="px-4 bg-white rounded-2xl border border-gray-200 text-gray-400 hover:text-red-500 shadow-sm active:scale-95 transition-all">
                                                <X size={18} strokeWidth={2.5}/>
                                            </button>
                                        </div>
                                    ) : (
                                        <select 
                                            required value={categories.includes(formData.category) ? formData.category : (formData.category ? 'manual' : '')} 
                                            onChange={(e) => {
                                                if (e.target.value === 'new_cat') {
                                                    setIsNewCategoryMode(true);
                                                    setFormData({...formData, category: ''});
                                                } else {
                                                    setFormData({...formData, category: e.target.value});
                                                }
                                            }} 
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none appearance-none cursor-pointer transition-all"
                                        >
                                            <option value="" disabled>Selecione...</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="new_cat" className="text-[#cb6ce6] font-bold">+ Nova Categoria...</option>
                                        </select>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Estoque (Atual / Mín)</label>
                                    <div className="flex gap-3">
                                        <input type="number" placeholder="Atual" value={formData.global_stock} onChange={e => setFormData({...formData, global_stock: Number(e.target.value)})} className="w-1/2 bg-gray-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300"/>
                                        <input type="number" placeholder="Mín" value={formData.critical_stock_level} onChange={e => setFormData({...formData, critical_stock_level: Number(e.target.value)})} className="w-1/2 bg-red-50/50 border-2 border-transparent focus:border-red-200 focus:bg-white text-red-600 rounded-2xl py-4 px-4 text-sm font-bold outline-none transition-all placeholder-red-300"/>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1"><DollarSign size={12} strokeWidth={3}/> Custo (R$)</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-300 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300"/>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-extrabold-id text-green-500 uppercase tracking-widest pl-1 flex items-center gap-1"><DollarSign size={12} strokeWidth={3}/> Venda (R$)</label>
                                    <input required type="number" step="0.01" placeholder="0.00" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full bg-green-50/50 border-2 border-green-100 focus:border-green-300 focus:bg-white rounded-2xl py-4 px-4 text-lg text-green-700 font-black outline-none transition-all placeholder-green-200"/>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-4">
                                <h4 className="text-[10px] font-extrabold-id uppercase tracking-widest text-[#cb6ce6] flex items-center gap-2"><Calendar size={14} strokeWidth={3}/> Promoção Opcional</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Preço Promo</label>
                                        <input type="number" step="0.01" placeholder="0.00" value={formData.promotional_price} onChange={e => setFormData({...formData, promotional_price: e.target.value})} className="w-full bg-white border-2 border-transparent focus:border-[#cb6ce6]/30 rounded-2xl py-3.5 px-3 text-sm font-bold text-gray-900 outline-none transition-all shadow-sm placeholder-gray-300"/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Início</label>
                                        <input type="date" value={formData.promotion_start_date} onChange={e => setFormData({...formData, promotion_start_date: e.target.value})} className="w-full bg-white border-2 border-transparent focus:border-[#cb6ce6]/30 rounded-2xl py-3.5 px-3 text-sm font-bold text-gray-900 outline-none transition-all shadow-sm"/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">Fim</label>
                                        <input type="date" value={formData.promotion_end_date} onChange={e => setFormData({...formData, promotion_end_date: e.target.value})} className="w-full bg-white border-2 border-transparent focus:border-[#cb6ce6]/30 rounded-2xl py-3.5 px-3 text-sm font-bold text-gray-900 outline-none transition-all shadow-sm"/>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest pl-1">URL da Imagem</label>
                                <input placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#cb6ce6]/30 focus:bg-white rounded-2xl py-4 px-4 text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300"/>
                            </div>
                        </form>
                        
                        <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-4 rounded-2xl text-gray-500 bg-white border border-gray-200 font-extrabold-id uppercase tracking-widest text-[10px] hover:bg-gray-100 active:scale-95 transition-all shadow-sm">Cancelar</button>
                            <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-[10px] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#cb6ce6]/25 disabled:opacity-50 disabled:cursor-wait active:scale-95">
                                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} strokeWidth={2.5}/>}
                                {isSaving ? 'Salvando...' : 'Salvar Produto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [condominiums, setCondominiums] = React.useState([]);
    const [products, setProducts] = React.useState([]); 
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isCondoModalOpen, setIsCondoModalOpen] = React.useState(false);
    const [currentCondo, setCurrentCondo] = React.useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
    const [currentProduct, setCurrentProduct] = React.useState(null);
    
    // NOVO: Estado para controlar o menu no telemóvel
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    
    const token = localStorage.getItem('adminToken');

    const fetchData = React.useCallback(async (dataType, setData, params = '') => {
        setIsLoading(true); setError('');
        try {
            const response = await fetch(`${API_URL}/api/admin/${dataType}${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`Falha ao buscar ${dataType}.`);
            const data = await response.json();
            setData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        if (condominiums.length === 0) fetchData('condominiums', setCondominiums);
        if (products.length === 0) fetchData('products', setProducts);
    }, [condominiums.length, products.length, fetchData]);

    // --- FUNÇÕES DE CONDOMÍNIO ---
    const handleOpenCondoModal = (condo = null) => { setCurrentCondo(condo); setIsCondoModalOpen(true); };
    const handleCloseCondoModal = () => { setIsCondoModalOpen(false); setCurrentCondo(null); };
    const handleSaveCondo = async (condoData) => {
        const method = condoData.id ? 'PUT' : 'POST';
        const url = condoData.id ? `${API_URL}/api/admin/condominiums/${condoData.id}` : `${API_URL}/api/admin/condominiums`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(condoData) });
            if (!response.ok) throw new Error('Falha ao salvar condomínio.');
            fetchData('condominiums', setCondominiums);
            handleCloseCondoModal();
        } catch (err) { alert(err.message); }
    };
    const handleDeleteCondo = async (id) => {
        if (window.confirm('Tem a certeza que quer apagar este condomínio?')) {
            try {
                const response = await fetch(`${API_URL}/api/admin/condominiums/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Falha ao apagar condomínio.');
                fetchData('condominiums', setCondominiums);
                alert(data.message);
            } catch (err) { alert(err.message); }
        }
    };
    
    // --- FUNÇÕES DE PRODUTO ---
    const handleOpenProductModal = (product = null) => { setCurrentProduct(product); setIsProductModalOpen(true); }; 
    const handleCloseProductModal = () => { setIsProductModalOpen(false); setCurrentProduct(null); };
    
    const handleSaveProduct = async (productData) => {
        const method = productData.id ? 'PUT' : 'POST';
        const url = productData.id ? `${API_URL}/api/admin/products/${productData.id}` : `${API_URL}/api/admin/products`;
        try {
            const response = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(productData) 
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao salvar produto.');
            }
            fetchData('products', setProducts);
            handleCloseProductModal();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteProduct = async (id) => { 
        if (window.confirm('Tem a certeza que quer apagar este produto?')) {
            try {
                const response = await fetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao apagar produto.');
                fetchData('products', setProducts);
            } catch (err) { alert(err.message); }
        }
    };

    // Subcomponente CondoManager (Atualizado visualmente para combinar)
const CondoManager = ({ condominiums, onEdit, onDelete, onAddNew, token }) => {
    // --- ESTADO DE AUTENTICAÇÃO (NOVO) ---
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [passwordInput, setPasswordInput] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === '1325') {
            setIsAuthenticated(true);
            setPasswordError('');
        } else {
            setPasswordError('Senha incorreta. Acesso negado.');
            setPasswordInput('');
        }
    };

    // --- LÓGICA ORIGINAL INTACTA ---
    const handleRemoteUnlock = async (fridgeId) => {
        if (!fridgeId) {
            alert('Este equipamento não tem um ID de geladeira definido.');
            return;
        }
        if (window.confirm(`Tem a certeza que quer destravar remotamente o equipamento ${fridgeId}?`)) {
            try {
                const response = await fetch(`${API_URL}/api/admin/fridges/${fridgeId}/unlock`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao enviar comando.');
                alert('Comando de desbloqueio enviado com sucesso!');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    // --- TELA DE BLOQUEIO DE SENHA ---
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-5 font-sans animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#cb6ce6]"></div>
                    
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm text-gray-400">
                        <Lock size={32} strokeWidth={2.5}/>
                    </div>
                    
                    <h2 className="text-2xl font-extrabold-id text-gray-900 uppercase tracking-tighter mb-2">Acesso Restrito</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 leading-relaxed">
                        Área de segurança.<br/>Insira a senha mestra para gerenciar os equipamentos.
                    </p>

                    <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
                        <div>
                            <input 
                                type="password" 
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="••••"
                                autoFocus
                                className={`w-full bg-gray-50 border-2 rounded-2xl py-4 px-4 text-center text-2xl font-black tracking-[0.5em] outline-none transition-all ${passwordError ? 'border-red-300 text-red-600 focus:border-red-500 bg-red-50' : 'border-transparent text-gray-900 focus:border-[#cb6ce6]/50 focus:bg-white placeholder-gray-300'}`}
                            />
                            {passwordError && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2">{passwordError}</p>}
                        </div>
                        
                        <button type="submit" className="w-full py-4.5 rounded-2xl bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id text-[10px] uppercase tracking-widest shadow-lg shadow-[#cb6ce6]/25 flex items-center justify-center gap-2 active:scale-95 transition-all">
                            Desbloquear Acesso <ArrowRight size={16} strokeWidth={3}/>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-50 w-full flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-full text-blue-500 shrink-0 mt-0.5">
                            <Headset size={14} strokeWidth={3}/>
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-extrabold-id text-gray-900 uppercase tracking-widest mb-0.5">Esqueceu a senha?</p>
                            <p className="text-[9px] font-bold text-gray-400 leading-tight">Por questões de segurança, contate o suporte técnico para recuperação.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- TELA PRINCIPAL (APÓS SENHA) ---
    return (
        <div className="flex flex-col gap-6 animate-fade-in w-full font-sans pb-24 pt-8">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* --- HEADER MOBILE/DESKTOP (CLEAN UI) --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-5 md:px-0 max-w-7xl mx-auto w-full mb-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl sm:text-4xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">
                        GESTÃO <span className="text-[#cb6ce6]">PONTOS</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Administração de Equipamentos e Máquinas</p>
                </div>
                <button 
                    onClick={() => onAddNew()} 
                    className="w-full md:w-auto bg-[#cb6ce6] hover:bg-[#b85cd3] text-white font-extrabold-id uppercase tracking-widest text-[10px] rounded-2xl py-4 px-6 shadow-lg shadow-[#cb6ce6]/25 flex justify-center items-center gap-2 active:scale-95 transition-all"
                >
                    <PlusCircle size={18} strokeWidth={2.5} /> NOVO EQUIPAMENTO
                </button>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="px-5 md:px-0 max-w-7xl mx-auto w-full">
                
                {/* --- DESKTOP TABLE (BLINDADA CONTRA OVERFLOW) --- */}
                <div className="hidden md:block bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                    <div className="overflow-x-auto hide-scrollbar w-full">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-400 border-b border-gray-100 text-[9px] font-extrabold-id uppercase tracking-widest">
                                <tr>
                                    <th className="p-5 pl-6">Local / Ponto de Venda</th>
                                    <th className="p-5">ID Máquina</th>
                                    <th className="p-5 text-center">Nº Usuários</th>
                                    <th className="p-5 text-center">Estoque Físico</th>
                                    <th className="p-5 text-right pr-6">Ações Rápidas</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                {condominiums.map(condo => (
                                    <tr key={condo.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-5 pl-6">
                                            <span className="font-extrabold-id text-gray-900 text-sm block truncate max-w-[250px]">{condo.name}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block truncate max-w-[250px]">Resp: {condo.syndic_name || 'N/A'}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                                {condo.fridge_id || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center font-black text-gray-900 text-base">{condo.user_count}</td>
                                        <td className="p-5 text-center font-black text-gray-900 text-base">{condo.item_count}</td>
                                        <td className="p-5 pr-6">
                                            <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleRemoteUnlock(condo.fridge_id)} 
                                                    className="bg-white hover:bg-green-50 text-gray-400 hover:text-green-500 p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-green-200" 
                                                    title="Destravar Máquina"
                                                >
                                                    <KeyRound size={16} strokeWidth={2.5} />
                                                </button>
                                                <button 
                                                    onClick={() => onEdit(condo)} 
                                                    className="bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-500 p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-blue-200" 
                                                    title="Editar Local"
                                                >
                                                    <Edit size={16} strokeWidth={2.5} />
                                                </button>
                                                <button 
                                                    onClick={() => onDelete(condo.id)} 
                                                    className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 p-2.5 rounded-xl transition-all shadow-sm border border-gray-100 hover:border-red-200" 
                                                    title="Remover"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {condominiums.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-16 text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest">
                                            Nenhum equipamento cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MOBILE CARDS (DESIGN NATIVO) --- */}
                <div className="md:hidden flex flex-col gap-4 w-full">
                    {condominiums.map(condo => (
                        <div key={condo.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
                            
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="h-14 w-14 rounded-[20px] bg-[#cb6ce6]/10 flex-shrink-0 flex items-center justify-center text-[#cb6ce6]">
                                        <Store size={24} strokeWidth={2.5}/>
                                    </div>
                                    <div className="min-w-0 pr-2">
                                        <h3 className="font-extrabold-id text-gray-900 text-sm leading-tight truncate uppercase tracking-tighter">{condo.name}</h3>
                                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest truncate">Resp: {condo.syndic_name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center mb-5">
                                <span className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest">ID Máquina</span>
                                <span className="font-mono text-[10px] font-bold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    {condo.fridge_id || 'N/A'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="text-center p-3 rounded-2xl border border-gray-100 bg-gray-50">
                                    <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-1">Usuários</p>
                                    <p className="font-black text-xl text-gray-900">{condo.user_count}</p>
                                </div>
                                <div className="text-center p-3 rounded-2xl border border-gray-100 bg-gray-50">
                                    <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-1">Produtos</p>
                                    <p className="font-black text-xl text-gray-900">{condo.item_count}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-50">
                                <button 
                                    onClick={() => handleRemoteUnlock(condo.fridge_id)} 
                                    className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl font-extrabold-id text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-green-100"
                                >
                                    <KeyRound size={16} strokeWidth={2.5}/> Destravar
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(condo)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-blue-500 transition-all active:scale-95 border border-gray-200 shadow-sm">
                                        <Edit size={16} strokeWidth={2.5}/>
                                    </button>
                                    <button onClick={() => onDelete(condo.id)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all active:scale-95 border border-gray-200 shadow-sm">
                                        <Trash2 size={16} strokeWidth={2.5}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {condominiums.length === 0 && (
                        <div className="p-12 text-center text-gray-400 font-extrabold-id text-[10px] uppercase tracking-widest bg-white rounded-[28px] border border-gray-100 shadow-sm">
                            Nenhum equipamento cadastrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
    // --- ESTADO DO RELÓGIO ---
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- CONTEÚDO MEMORIZADO ---
    const content = React.useMemo(() => {
        const isMainLoading = (isLoading && (products.length === 0 || condominiums.length === 0));
        
        if (isMainLoading) {
            return (
                <div className="flex flex-col justify-center items-center h-[80vh] gap-4 w-full">
                    <Loader2 className="w-10 h-10 text-[#cb6ce6] animate-spin" />
                    <span className="text-[10px] font-extrabold-id uppercase tracking-widest text-gray-400 animate-pulse">Carregando painel...</span>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="p-8">
                    <div className="bg-red-50 border border-red-100 text-red-500 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
                        <WifiOff size={28} strokeWidth={2.5}/>
                        <div>
                            <p className="font-extrabold-id text-xs uppercase tracking-widest">Erro de Conexão</p>
                            <p className="text-sm font-bold mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            );
        }
        
        switch (activeTab) {
            case 'dashboard': return <AdminDashboardPage token={token} setActiveTab={setActiveTab} />;
            case 'sales': return <SalesPage condominiums={condominiums} token={token} />;
            case 'central-cashier': return <CentralCashierPage token={token} />;
            case 'critical-stock': return <CriticalStockPage condominiums={condominiums} token={token} />;
            case 'users': return <UserManagementPage condominiums={condominiums} token={token} />;
            case 'stock': return <StockManagement condominiums={condominiums} products={products} token={token} />;
            case 'condominiums': return <CondoManager condominiums={condominiums} onAddNew={handleOpenCondoModal} onEdit={handleOpenCondoModal} onDelete={handleDeleteCondo} token={token} />;
            case 'products': return <ProductManager token={token} />; 
            case 'finance': return <FinanceReport condominiums={condominiums} token={token} />;
            default: return <div className="p-8 font-extrabold-id text-gray-400">Selecione uma opção</div>;
        }
    }, [activeTab, token, products, condominiums, isLoading, error]);

    // Função para fechar o menu ao clicar num link (mobile)
    const handleNavClick = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900 font-sans w-full overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>

            <CondoModal isOpen={isCondoModalOpen} onClose={handleCloseCondoModal} onSave={handleSaveCondo} condo={currentCondo} />
            <ProductModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} onSave={handleSaveProduct} product={currentProduct} />
            
            {/* --- HEADER MOBILE (Clean Branco) --- */}
            <div className="md:hidden bg-white/95 backdrop-blur-xl p-4 sm:p-5 flex justify-between items-center border-b border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] z-20 shrink-0 h-20 w-full sticky top-0">
                
                {/* Logo */}
                <div className="flex items-center">
                    <img 
                        src="https://i.imgur.com/Lo5PXP2.png" 
                        alt="OwnMarket" 
                        className="h-11 sm:h-10 object-contain"
                    />
                </div>

                {/* Relógio e Menu */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[8px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-1">HORÁRIO LOCAL</span>
                        <div className="font-mono flex items-baseline gap-0.5 text-gray-900">
                            <span className="text-lg sm:text-xl font-black tracking-tight">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-[#cb6ce6] animate-pulse">
                                :{currentTime.toLocaleTimeString([], { second: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className="text-gray-900 p-2.5 sm:p-3 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm active:scale-95 transition-all"
                    >
                        {isMobileMenuOpen ? <X size={22} className="text-gray-500" strokeWidth={2.5}/> : <Menu size={22} strokeWidth={2.5}/>}
                    </button>
                </div>
            </div>

            {/* --- OVERLAY PARA MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}
            
            {/* --- SIDEBAR (Menu Lateral Clean UI) --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-[280px] bg-white flex flex-col shrink-0 border-r border-gray-100 shadow-[20px_0_40px_rgba(0,0,0,0.02)]
                transform transition-transform duration-400 cubic-bezier(0.16, 1, 0.3, 1)
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:block h-[100dvh]
            `}>

                {/* --- LOGO SIDEBAR --- */}
                <div className="p-8 flex justify-center items-center relative z-10 border-b border-gray-50 h-24">
                    <img 
                        src="https://i.imgur.com/Lo5PXP2.png" 
                        alt="OwnMarket" 
                        className="h-12 object-contain"
                    />
                </div>
                
                {/* --- NAVEGAÇÃO ORGANIZADA --- */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-8 relative z-10">
                    
                    {/* GRUPO 1: VISÃO GERAL */}
                    <div>
                        <h3 className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-3 pl-3">Visão Geral</h3>
                        <div className="space-y-1">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                { id: 'sales', label: 'Entradas e Vendas', icon: DollarSign },
                                { id: 'central-cashier', label: 'Caixa Central', icon: PiggyBank },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 relative group font-bold text-xs
                                    ${activeTab === item.id 
                                        ? 'bg-[#cb6ce6]/10 text-[#cb6ce6] shadow-sm' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <item.icon size={18} strokeWidth={activeTab === item.id ? 3 : 2.5} className={`transition-colors ${activeTab === item.id ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GRUPO 2: ESTOQUE */}
                    <div>
                        <h3 className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-3 pl-3">Inventário</h3>
                        <div className="space-y-1">
                            {[
                                { id: 'products', label: 'Catálogo Produtos', icon: Package },
                                { id: 'stock', label: 'Estoque Geral', icon: ShoppingCart },
                                { id: 'critical-stock', label: 'Abastecimento', icon: AlertTriangle },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 relative group font-bold text-xs
                                    ${activeTab === item.id 
                                        ? 'bg-[#cb6ce6]/10 text-[#cb6ce6] shadow-sm' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <item.icon size={18} strokeWidth={activeTab === item.id ? 3 : 2.5} className={`transition-colors ${activeTab === item.id ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GRUPO 3: ADMINISTRAÇÃO */}
                    <div>
                        <h3 className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-3 pl-3">Admin</h3>
                        <div className="space-y-1">
                            {[
                                { id: 'condominiums', label: 'Unidades', icon: Building2 },
                                { id: 'users', label: 'Utilizadores', icon: UsersIcon },
                                { id: 'finance', label: 'Relatórios', icon: BarChart2 },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 relative group font-bold text-xs
                                    ${activeTab === item.id 
                                        ? 'bg-[#cb6ce6]/10 text-[#cb6ce6] shadow-sm' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <item.icon size={18} strokeWidth={activeTab === item.id ? 3 : 2.5} className={`transition-colors ${activeTab === item.id ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
                
                {/* FOOTER SAIR */}
                <div className="p-5 border-t border-gray-50 bg-white relative z-10">
                    <button onClick={onLogout} className="flex items-center w-full gap-3 p-3.5 rounded-2xl text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group active:scale-95">
                        <div className="bg-gray-50 p-2.5 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-colors border border-gray-100 group-hover:border-red-100">
                            <LogOut size={16} strokeWidth={3} className="group-hover:text-red-500"/>
                        </div>
                        <div className="text-left">
                            <span className="text-xs font-extrabold-id uppercase tracking-wider block text-gray-700 group-hover:text-red-700">Sair da Conta</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">Encerrar sessão</span>
                        </div>
                    </button>
                </div>
            </aside>
            
            {/* --- MAIN CONTENT (Área Branca/Gelo principal) --- */}
            {/* Altura ajustada no mobile para não criar dois scrolls */}
            <main className="flex-1 bg-gray-50 overflow-y-auto w-full h-[calc(100dvh-80px)] md:h-[100dvh] relative custom-scrollbar">
                {content}
            </main>
        </div>
    )
};

// Componente auxiliar para os botões do menu ficarem mais limpos
const NavButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-3 p-3 rounded-md transition text-sm font-medium
        ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    >
        {icon} {label}
    </button>
);


const MyTicketsPage = ({ setPage }) => {
    const [tickets, setTickets] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const token = localStorage.getItem('token');

    // --- FETCH TICKETS ---
    const fetchTickets = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/tickets`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar notificações.');
            const data = await response.json();
            setTickets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    
    React.useEffect(() => { fetchTickets(); }, [fetchTickets]);
    
    // --- MARCAR COMO LIDO ---
    const handleMarkAsRead = async (ticketId) => {
        try {
            const response = await fetch(`${API_URL}/api/user/tickets/${ticketId}/read`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao marcar como lido.');
            
            // Atualiza UI instantaneamente
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, is_read: true } : t));
        } catch (err) {
            // Silencioso ou Toast
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col">
            
            {/* --- HEADER --- */}
            <header className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 pb-4">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight">Notificações</h1>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                        <p className="text-gray-500 text-sm">Buscando mensagens...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-red-400 mb-2 font-bold">Ops, algo deu errado.</p>
                        <p className="text-sm text-gray-400">{error}</p>
                        <button onClick={fetchTickets} className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30">Tentar Novamente</button>
                    </div>
                ) : tickets.length > 0 ? (
                    <div className="space-y-4">
                        {tickets.map((ticket, index) => (
                            <div 
                                key={ticket.id}
                                // Animação de entrada escalonada (stagger) baseada no index
                                className={`relative group overflow-hidden rounded-2xl transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-forwards
                                    ${ticket.is_read 
                                        ? 'bg-white/5 border border-white/5 opacity-80 hover:opacity-100' 
                                        : 'bg-gradient-to-br from-gray-800 to-[#1e293b] border border-orange-500/30 shadow-lg shadow-orange-500/5'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Indicador de Novo (Glow Lateral) */}
                                {!ticket.is_read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
                                )}

                                <div className="p-5 flex gap-4">
                                    {/* Ícone */}
                                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border
                                        ${ticket.is_read 
                                            ? 'bg-white/5 border-white/5 text-gray-500' 
                                            : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                                        }`}>
                                        {ticket.is_read ? <CheckCircle2 size={20} /> : <Bell size={20} className={!ticket.is_read ? 'animate-pulse' : ''} />}
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold text-sm ${ticket.is_read ? 'text-gray-400' : 'text-white'}`}>
                                                {ticket.title || 'Mensagem do Suporte'}
                                            </h3>
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                                <Clock size={10} />
                                                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        
                                        <p className={`text-sm leading-relaxed ${ticket.is_read ? 'text-gray-500' : 'text-gray-300'}`}>
                                            {ticket.message}
                                        </p>

                                        {/* Ação (Marcar como lido) */}
                                        {!ticket.is_read && (
                                            <button 
                                                onClick={() => handleMarkAsRead(ticket.id)}
                                                className="mt-4 text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-2 group/btn transition-colors"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-orange-500 group-hover/btn:scale-125 transition-transform"></span>
                                                Marcar como lida
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // --- EMPTY STATE PREMIUM ---
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 relative">
                            <MessageSquare size={40} className="text-gray-600" />
                            <div className="absolute top-0 right-0 w-6 h-6 bg-gray-700 rounded-full border-4 border-[#0f172a]"></div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Tudo limpo por aqui!</h2>
                        <p className="text-gray-500 max-w-xs mx-auto text-sm">
                            Você não tem novas notificações ou mensagens do suporte no momento.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- COMPONENTE MODAL DE EDIÇÃO AVANÇADO (PREMIUM) ---
const UserEditModal = ({ user, isOpen, onClose, onSave, token, condominiums }) => {
    // Estados do Formulário Básico
    const [formData, setFormData] = React.useState({
        name: '', email: '', cpf: '', phone_number: '', apartment: '', condo_id: '', birth_date: '',
        newPassword: '', confirmPassword: ''
    });

    // Estados das Ações Especiais
    const [balanceToAdd, setBalanceToAdd] = React.useState('');
    const [balanceReason, setBalanceReason] = React.useState('');
    const [ticketMessage, setTicketMessage] = React.useState('');
    
    // Estados de Controle
    const [activeTab, setActiveTab] = React.useState('info'); // 'info', 'finance', 'ticket'
    const [isSaving, setIsSaving] = React.useState(false);
    const [statusMsg, setStatusMsg] = React.useState({ type: '', text: '' }); // type: 'success' | 'error'

    // Carregar dados ao abrir
    React.useEffect(() => {
        if (user && isOpen) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                cpf: user.cpf || '',
                phone_number: user.phone_number || '',
                apartment: user.apartment || '',
                condo_id: user.condo_id || '',
                birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
                newPassword: '',
                confirmPassword: ''
            });
            setStatusMsg({ type: '', text: '' });
            setBalanceToAdd('');
            setBalanceReason('');
            setTicketMessage('');
            setActiveTab('info');
        }
    }, [user, isOpen]);

    // Helper para mensagens
    const showMessage = (type, text) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    };

    // --- AÇÃO 1: SALVAR DADOS PESSOAIS ---
    const handleSaveInfo = async (e) => {
        e.preventDefault();
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            return showMessage('error', 'As senhas não coincidem.');
        }

        setIsSaving(true);
        try {
            const body = { ...formData };
            if (!body.newPassword) delete body.newPassword;
            delete body.confirmPassword;

            const res = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Erro ao atualizar dados.');
            
            showMessage('success', 'Dados atualizados com sucesso!');
            onSave(); // Recarrega lista pai
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- AÇÃO 2: AJUSTAR SALDO ---
    const handleAdjustBalance = async () => {
        const amount = parseFloat(balanceToAdd);
        if (!amount || amount === 0) return showMessage('error', 'Digite um valor válido.');
        if (!balanceReason) return showMessage('error', 'O motivo é obrigatório.');

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${user.id}/add-balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount, reason: balanceReason })
            });

            if (!res.ok) throw new Error('Erro ao ajustar saldo.');
            
            showMessage('success', `Saldo de R$ ${Math.abs(amount).toFixed(2)} ${amount > 0 ? 'adicionado' : 'removido'}!`);
            onSave(); 
            setBalanceToAdd('');
            setBalanceReason('');
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- AÇÃO 3: ENVIAR TICKET ---
    const handleSendTicket = async () => {
        if (!ticketMessage) return showMessage('error', 'Digite uma mensagem.');

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${user.id}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: ticketMessage })
            });

            if (!res.ok) throw new Error('Erro ao enviar ticket.');
            
            showMessage('success', 'Notificação enviada ao usuário!');
            setTicketMessage('');
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- AÇÃO 4: BLOQUEAR/DESBLOQUEAR ---
    const handleToggleStatus = async () => {
        const action = user.is_active ? 'bloquear' : 'desbloquear';
        if (!window.confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${user.id}/toggle-status`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`Erro ao ${action} usuário.`);
            
            showMessage('success', `Usuário ${action === 'bloquear' ? 'bloqueado' : 'ativado'} com sucesso!`);
            onSave();
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-scale-up">
                
                {/* HEADER */}
                <div className="p-6 bg-gray-800 border-b border-gray-700 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">{user.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {user.is_active ? 'ATIVO' : 'BLOQUEADO'}
                                </span>
                                <span className="text-xs text-gray-400">{user.email}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-700 p-2 rounded-full transition"><X size={20}/></button>
                </div>

                {/* TABS DE NAVEGAÇÃO */}
                <div className="flex border-b border-gray-700 bg-gray-800/50">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Dados Pessoais</button>
                    <button onClick={() => setActiveTab('finance')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'finance' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Financeiro</button>
                    <button onClick={() => setActiveTab('ticket')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ticket' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Suporte & Ações</button>
                </div>

                {/* FEEDBACK MENSAGEM */}
                {statusMsg.text && (
                    <div className={`p-3 text-center text-sm font-bold animate-pulse ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {statusMsg.text}
                    </div>
                )}

                {/* CONTEÚDO SCROLLÁVEL */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-900/50 custom-scrollbar">
                    
                    {/* --- ABA 1: DADOS PESSOAIS --- */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleSaveInfo} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Nome Completo</label>
                                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none"/>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">CPF</label>
                                    <input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none"/>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none"/>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Telefone</label>
                                    <input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none"/>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Data de Nascimento</label>
                                    <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none"/>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Apartamento</label>
                                    <input value={formData.apartment} onChange={e => setFormData({...formData, apartment: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-blue-500 outline-none"/>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                                <h4 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2"><Lock size={16}/> Alterar Senha (Opcional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="password" placeholder="Nova Senha" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-orange-500 outline-none"/>
                                    <input type="password" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl p-3 text-white focus:border-orange-500 outline-none"/>
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50">
                                {isSaving ? <Loader2 className="animate-spin"/> : <Save size={20}/>} Salvar Dados
                            </button>
                        </form>
                    )}

                    {/* --- ABA 2: FINANCEIRO --- */}
                    {activeTab === 'finance' && (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="text-gray-400 text-sm">Saldo Atual em Carteira</p>
                                    <h2 className="text-3xl font-black text-green-400">R$ {parseFloat(user.wallet_balance || 0).toFixed(2)}</h2>
                                </div>
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><Wallet size={32}/></div>
                            </div>

                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><PlusCircle size={16} className="text-green-500"/> Ajuste Manual de Saldo</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Valor (R$)</label>
                                        <input 
                                            type="number" step="0.01" 
                                            placeholder="Ex: 50.00 ou -20.00"
                                            value={balanceToAdd} 
                                            onChange={e => setBalanceToAdd(e.target.value)} 
                                            className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-green-500 outline-none font-bold"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">Use negativo (-) para remover saldo.</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Motivo</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: Estorno, Bônus..."
                                            value={balanceReason} 
                                            onChange={e => setBalanceReason(e.target.value)} 
                                            className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <button onClick={handleAdjustBalance} disabled={isSaving || !balanceToAdd} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    <CheckCircle2 size={18}/> Confirmar Ajuste
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- ABA 3: SUPORTE E AÇÕES --- */}
                    {activeTab === 'ticket' && (
                        <div className="space-y-6">
                            {/* Bloqueio */}
                            <div className={`p-5 rounded-2xl border flex items-center justify-between ${user.is_active ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                <div>
                                    <h4 className={`text-lg font-bold ${user.is_active ? 'text-red-400' : 'text-green-400'}`}>
                                        {user.is_active ? 'Bloquear Acesso' : 'Desbloquear Conta'}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {user.is_active ? 'O usuário perderá acesso imediato ao sistema.' : 'O usuário poderá voltar a acessar o sistema.'}
                                    </p>
                                </div>
                                <button onClick={handleToggleStatus} disabled={isSaving} className={`px-4 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50 ${user.is_active ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                                    {user.is_active ? 'BLOQUEAR' : 'ATIVAR'}
                                </button>
                            </div>

                            {/* Enviar Mensagem */}
                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Mail size={16} className="text-orange-500"/> Enviar Notificação (Ticket)</h4>
                                <textarea 
                                    rows="4"
                                    placeholder="Digite a mensagem para o usuário..."
                                    value={ticketMessage}
                                    onChange={e => setTicketMessage(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:border-orange-500 outline-none mb-4 resize-none"
                                ></textarea>
                                <button onClick={handleSendTicket} disabled={isSaving || !ticketMessage} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Mail size={18}/> Enviar Mensagem
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CreditPage = ({ user, setPage, setPaymentData, setPaymentMethod }) => {
    // ESTADO: 'summary' irá guardar os dados completos vindos do backend.
    const [summary, setSummary] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    // EFEITO: Busca os dados do backend assim que a página carrega.
    React.useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            try {
                // Chama a nova rota '/api/credit/summary'
                const response = await fetch(`${API_URL}/api/credit/summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao carregar dados de crédito.');
                const data = await response.json();
                setSummary(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, []); // O array vazio [] garante que isto só executa uma vez.

    const handlePayInvoice = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/credit/pay-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Falha ao gerar PIX da fatura.');
            }
            
            setPaymentData(data);
            setPaymentMethod('pix');
            setPage('payment');

        } catch (err) {
            setError(err.message);
            alert(`Erro na comunicação com o servidor: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Estado de Carregamento
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <Loader2 className="animate-spin text-orange-400" size={48} />
            </div>
        );
    }
    
    // Estado de Erro
    if (error || !summary) {
        return (
             <div className="min-h-screen bg-gray-900 text-white">
                <header className="bg-gray-800 shadow-md">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => setPage('home')} className="text-orange-400 hover-text-orange-300"><ArrowLeft size={24} /></button>
                        <h1 className="text-2xl font-bold">Meu Crédito SmartFridge</h1>
                    </div>
                </header>
                 <main className="container mx-auto p-4 md:p-8 max-w-2xl text-center">
                     <p className="text-red-400">{error || "Não foi possível carregar as informações."}</p>
                 </main>
             </div>
        );
    }

    // Calcula a percentagem de uso com base nos dados do backend
    const usagePercentage = summary.creditLimit > 0 ? (summary.creditUsed / summary.creditLimit) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Meu Crédito SmartFridge</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-2xl">
                <div className="bg-gray-800 p-6 rounded-lg">
                     <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
                         <div className="flex justify-between items-start">
                             <div>
                                 <p className="text-sm opacity-80">SmartFridge</p>
                                 <p className="font-bold text-lg">Crédito</p>
                             </div>
                             <CreditCard size={32} />
                         </div>
                         <div className="mt-6">
                             <p className="text-sm opacity-80">Dívida Total (Faturas + Gastos)</p>
                             <p className="text-3xl font-bold">R$ {summary.creditUsed.toFixed(2).replace('.', ',')}</p>
                         </div>
                         <div className="mt-2 flex justify-between items-end">
                             <div>
                                 <p className="text-xs opacity-80">Limite Disponível</p>
                                 <p className="font-semibold">R$ {summary.availableCredit.toFixed(2).replace('.', ',')}</p>
                             </div>
                             <p className="text-xs opacity-80">Vencimento: {summary.dueDate ? new Date(summary.dueDate).toLocaleDateString('pt-BR') : 'N/D'}</p>
                         </div>
                     </div>
                     <div className="mt-4">
                         <div className="w-full bg-gray-700 rounded-full h-2.5">
                             <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
                         </div>
                         <div className="flex justify-between text-xs mt-1 text-gray-400">
                             <span>Gasto Total: R$ {summary.creditUsed.toFixed(2).replace('.', ',')}</span>
                             <span>Limite Total: R$ {summary.creditLimit.toFixed(2).replace('.', ',')}</span>
                         </div>
                     </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mt-8">
                    <h3 className="text-xl font-bold mb-4">Pagar Fatura</h3>
                    {summary.totalToPay > 0 ? (
                        <>
                            <div className="space-y-2 text-gray-300 mb-4 border-b border-gray-700 pb-4">
                                <p className="flex justify-between"><span>Faturas Pendentes:</span> <span>R$ {summary.pendingInvoicesAmount.toFixed(2).replace('.', ',')}</span></p>
                                <p className="flex justify-between"><span>Gastos do ciclo atual:</span> <span>R$ {summary.currentSpending.toFixed(2).replace('.', ',')}</span></p>
                                <p className="flex justify-between"><span>Taxa de Serviço (10%):</span> <span>R$ {summary.serviceFee.toFixed(2).replace('.', ',')}</span></p>
                                {summary.interest > 0 && (
                                     <p className="flex justify-between text-red-400"><span>Juros por Atraso:</span> <span>R$ {summary.interest.toFixed(2).replace('.', ',')}</span></p>
                                )}
                                <p className="flex justify-between text-white font-bold text-lg mt-2 pt-2 border-t border-gray-600"><span>Total a Pagar:</span> <span>R$ {summary.totalToPay.toFixed(2).replace('.', ',')}</span></p>
                            </div>
                            <button
                                onClick={handlePayInvoice}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <> <QrCode/> Gerar PIX para Pagamento</>}
                            </button>
                        </>
                    ) : (
                        <p className="text-center text-gray-400">Sua fatura está zerada. Nenhum pagamento é necessário.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

// App.js -> Substitua o seu componente HistoryPage por este


const HistoryPage = ({ setPage, token, cart = [] }) => {
    // === ESTADOS ===
    const [historyData, setHistoryData] = React.useState({ transactions: [], pagination: {} });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [showReceiptModal, setShowReceiptModal] = React.useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = React.useState(null);
    
    // Estado das Abas Internas (Minhas Compras vs Carteira)
    const [internalTab, setInternalTab] = React.useState('compras'); 

    // Estado da Bottom Nav (Inicia em 'history' pois estamos na página de histórico)
    const [navTab, setNavTab] = React.useState('history');

    // --- Lógica de Navegação com Delay ---
    const handleNavChange = (tabId) => {
        if (tabId === 'history') return; 
        
        setNavTab(tabId); 
        setTimeout(() => {
            setPage(tabId);
        }, 200);
    };

    // --- Ícones Auxiliares ---
    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit': return <ArrowDownLeft />;
            case 'transfer_in': return <ArrowDownLeft />;
            case 'purchase': return <ShoppingBag />;
            case 'credit_purchase': return <ShoppingBag />;
            default: return <ArrowUpRight />;
        }
    };

    // --- Lógica de Fetch ---
    const fetchHistoryData = React.useCallback(async (page = 1) => {
        setIsLoading(true);
        setError('');
        try {
            const API_URL = window.API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/user/history?page=${page}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao buscar o histórico.');
            const data = await response.json();
            setHistoryData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        fetchHistoryData(1);
    }, [fetchHistoryData]);

    const openReceiptModal = (transactionId) => {
        setSelectedTransactionId(transactionId);
        setShowReceiptModal(true);
    };
    
    // --- Lógica de Cálculo (useMemo) ---
    const { purchases, walletActivity, summary } = React.useMemo(() => {
        const transactions = historyData.transactions || [];
        
        const purchases = transactions.filter(tx => (tx.type === 'purchase' || tx.type === 'credit_purchase') && tx.items?.length > 0);
        const walletActivity = transactions.filter(tx => tx.type !== 'purchase' && tx.type !== 'credit_purchase');
        
        const totalPurchases = transactions
            .filter(tx => tx.type === 'purchase' || tx.type === 'credit_purchase')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        
        const totalWalletIn = transactions
            .filter(tx => tx.type === 'deposit' || tx.type === 'transfer_in')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
            
        const totalWalletOut = transactions
            .filter(tx => tx.type === 'purchase' || tx.type === 'credit_purchase' || tx.type === 'transfer_out')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
        
        return { 
            purchases, 
            walletActivity, 
            summary: { totalPurchases, totalWalletIn, totalWalletOut }
        };
    }, [historyData.transactions]);

    // === COMPONENTES VISUAIS INTERNOS (CLEAN UI) ===

    // 1. Item de Compra
    const PurchaseItem = ({ tx }) => (
        <div 
            onClick={() => openReceiptModal(tx.id)} 
            className="group bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-gray-50 hover:border-[#cb6ce6]/30 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
        >
            <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img 
                    src={tx.items[0]?.image_url || 'https://placehold.co/100x100/f3f4f6/a1a1aa?text=Prod'}
                    alt={tx.items[0]?.product_name || 'Produto'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {tx.items.length > 1 && (
                    <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-white font-extrabold-id text-xs tracking-wider">+{tx.items.length - 1}</span>
                    </div>
                )}
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                        <h3 className="font-extrabold-id text-gray-900 text-sm md:text-base truncate group-hover:text-[#cb6ce6] transition-colors">
                            {tx.items.length === 1 ? tx.items[0].product_name : `Compra com ${tx.items.length} itens`}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            <Calendar size={12} strokeWidth={3} />
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')} às {new Date(tx.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="font-black text-base text-gray-900">
                            -R$ {parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-extrabold-id text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            Débito
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // 2. Item de Carteira
    const WalletActivityItem = ({ tx }) => {
        const isDeposit = tx.type === 'deposit' || tx.type === 'transfer_in';
        const colorClass = isDeposit ? 'text-green-600' : 'text-red-500';
        const bgIconClass = isDeposit ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100';

        return (
            <div 
                onClick={() => openReceiptModal(tx.id)} 
                className="group bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
            >
                <div className={`relative flex-shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center border ${bgIconClass} transition-transform group-hover:scale-110`}>
                    <div className={colorClass}>
                        {React.cloneElement(getTransactionIcon(tx.type), { size: 22, strokeWidth: 2.5 })}
                    </div>
                </div>
                
                <div className="flex-grow min-w-0 flex justify-between items-center gap-4">
                    <div className="min-w-0">
                        <h3 className="font-extrabold-id text-gray-900 text-sm truncate group-hover:text-[#cb6ce6] transition-colors">{tx.description}</h3>
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5 uppercase tracking-widest">
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')} • {new Date(tx.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`font-black text-base ${colorClass}`}>
                            {isDeposit ? '+' : '-'} R$ {parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                        </p>
                    </div>
                </div>
            </div>
        );
    };
    
    // 3. Resumo (Widgets)
    const SummaryCard = ({ internalTab }) => {
        if (internalTab === 'compras') {
            return (
                <div className="animate-fade-in mb-8">
                    <div className="bg-white border border-gray-100 p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#cb6ce6]/10 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10 group-hover:bg-[#cb6ce6]/20 transition-colors"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-1">Total Gasto (Nesta Pág.)</p>
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
                                    R$ <span className="text-[#cb6ce6]">{summary.totalPurchases.toFixed(2).replace('.', ',')}</span>
                                </h2>
                            </div>
                            <div className="w-14 h-14 bg-[#cb6ce6]/10 border border-[#cb6ce6]/20 rounded-2xl flex items-center justify-center text-[#cb6ce6] shadow-sm transform group-hover:rotate-3 transition-transform">
                                <ShoppingBag size={28} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="animate-fade-in grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-gray-100 p-5 rounded-[24px] shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-100 rounded-full blur-[30px] opacity-50"></div>
                    <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-green-500" strokeWidth={3}/> Entradas
                    </p>
                    <p className="text-2xl font-black text-gray-900 tracking-tighter truncate">R$ <span className="text-green-500">{summary.totalWalletIn.toFixed(2).replace('.', ',')}</span></p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-[24px] shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-100 rounded-full blur-[30px] opacity-50"></div>
                    <p className="text-[9px] font-extrabold-id text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <TrendingDown size={14} className="text-red-500" strokeWidth={3}/> Saídas
                    </p>
                    <p className="text-2xl font-black text-gray-900 tracking-tighter truncate">R$ <span className="text-red-500">{summary.totalWalletOut.toFixed(2).replace('.', ',')}</span></p>
                </div>
            </div>
        );
    };
    
    // 4. Empty State
    const EmptyState = ({ icon: Icon, title, desc }) => (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-gray-200 border-dashed rounded-[28px] text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <Icon size={32} strokeWidth={2} />
            </div>
            <h3 className="text-gray-900 font-extrabold-id text-lg tracking-tighter mb-1 uppercase">{title}</h3>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest max-w-xs">{desc}</p>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col selection:bg-[#cb6ce6]/20">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                .font-extrabold-id { font-family: 'Inter', sans-serif; font-weight: 900; }
            `}</style>
            
            {/* --- HEADER (Clean UI) --- */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 pb-4 pt-6">
                <div className="container mx-auto px-4 pb-4 flex items-center gap-4">
                    <button 
                        onClick={() => handleNavChange('home')} 
                        className="w-10 h-10 rounded-[14px] bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#cb6ce6] hover:border-[#cb6ce6]/30 hover:bg-[#cb6ce6]/5 transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5}/>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold-id text-gray-900 uppercase tracking-tighter leading-none">Histórico</h1>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Suas atividades</p>
                    </div>
                </div>
                
                {/* --- ABAS INTERNAS (Pill Switcher) --- */}
                <div className="container mx-auto px-4">
                    <div className="bg-gray-100/80 p-1.5 rounded-2xl flex relative border border-gray-200/50 shadow-inner">
                        <button 
                            onClick={() => setInternalTab('compras')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${internalTab === 'compras' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ShoppingBag size={14} strokeWidth={3} className={internalTab === 'compras' ? 'text-[#cb6ce6]' : ''} /> Compras
                        </button>
                        <button 
                            onClick={() => setInternalTab('carteira')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${internalTab === 'carteira' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Wallet size={14} strokeWidth={3} className={internalTab === 'carteira' ? 'text-[#cb6ce6]' : ''} /> Carteira
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 container mx-auto px-4 py-8 pb-36">
                <div className="max-w-2xl mx-auto flex flex-col">
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="animate-spin text-[#cb6ce6]" size={40} />
                            <p className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest animate-pulse">Carregando histórico...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 p-6 rounded-[24px] text-center shadow-sm">
                            <p className="text-red-500 font-extrabold-id uppercase tracking-tighter mb-1">Ops, algo deu errado.</p>
                            <p className="text-red-400/80 font-bold text-xs mb-5">{error}</p>
                            <button onClick={() => fetchHistoryData(1)} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-extrabold-id uppercase tracking-widest transition-colors shadow-md shadow-red-500/20 active:scale-95">Tentar Novamente</button>
                        </div>
                    ) : (
                        <>
                            {/* Resumo Financeiro */}
                            <SummaryCard internalTab={internalTab} />
                            
                            {/* LISTA DE COMPRAS */}
                            {internalTab === 'compras' && (
                                <div className="space-y-3 animate-fade-in">
                                    <h3 className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest mb-3 pl-2 flex items-center gap-1.5">
                                        <History size={12} strokeWidth={3}/> Transações Recentes
                                    </h3>
                                    {purchases.length > 0 ? (
                                        purchases.map(tx => <PurchaseItem key={tx.id} tx={tx} />)
                                    ) : (
                                        <EmptyState icon={Package} title="Nenhuma compra" desc="Você ainda não realizou compras neste período." />
                                    )}
                                </div>
                            )}
                            
                            {/* LISTA DE CARTEIRA */}
                            {internalTab === 'carteira' && (
                                <div className="space-y-3 animate-fade-in">
                                    <h3 className="text-gray-400 text-[10px] font-extrabold-id uppercase tracking-widest mb-3 pl-2 flex items-center gap-1.5">
                                        <Wallet size={12} strokeWidth={3}/> Extrato Financeiro
                                    </h3>
                                    {walletActivity.length > 0 ? (
                                        walletActivity.map(tx => <WalletActivityItem key={tx.id} tx={tx} />)
                                    ) : (
                                        <EmptyState icon={DollarSign} title="Sem movimentações" desc="Seu histórico de depósitos e transferências aparecerá aqui." />
                                    )}
                                </div>
                            )}
                            
                            {/* PAGINAÇÃO MODERNIZADA */}
                            {historyData.transactions?.length > 0 && (
                                <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
                                    <button 
                                        onClick={() => fetchHistoryData(historyData.pagination.page - 1)} 
                                        disabled={historyData.pagination.page === 1} 
                                        className="px-5 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-500 font-extrabold-id text-[10px] uppercase tracking-widest disabled:opacity-40 disabled:bg-gray-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                    >
                                        <ChevronLeft size={16} strokeWidth={3}/> Anterior
                                    </button>
                                    
                                    <span className="text-[10px] font-extrabold-id text-gray-400 uppercase tracking-widest">
                                        Pág <span className="text-gray-900 bg-gray-100 px-2 py-1 rounded-md ml-0.5">{historyData.pagination.page}</span>
                                    </span>
                                    
                                    <button 
                                        onClick={() => fetchHistoryData(historyData.pagination.page + 1)} 
                                        disabled={historyData.pagination.page === Math.ceil((historyData?.pagination?.total || 0) / (historyData?.pagination?.limit || 10))} 
                                        className="px-5 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-500 font-extrabold-id text-[10px] uppercase tracking-widest disabled:opacity-40 disabled:bg-gray-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                    >
                                        Próxima <ChevronRight size={16} strokeWidth={3}/>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* --- BOTTOM NAV PREMIUM (CLEAN UI) --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-40 pointer-events-none">
                
                {/* Carrinho Flutuante (FAB) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button 
                        onClick={() => handleNavChange('cart')} 
                        className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${navTab === 'cart' ? 'bg-[#cb6ce6] shadow-lg shadow-[#cb6ce6]/40 scale-105' : 'bg-white border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.1)] text-[#cb6ce6]'}`}
                    >
                        <ShoppingCart size={24} strokeWidth={2.5} className={navTab === 'cart' ? 'text-white' : ''} />
                        
                        {cart.length > 0 && (
                            <span className={`absolute -top-1 -right-1 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${navTab === 'cart' ? 'bg-gray-900' : 'bg-[#cb6ce6] animate-bounce'}`}>
                                {cart.reduce((a,b)=>a+b.quantity,0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Base da Navegação Vidro */}
                <div className="relative bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 h-[72px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex justify-between items-center pointer-events-auto">
                    
                    <button onClick={() => handleNavChange('home')} className="flex flex-col items-center gap-1 group w-16">
                        <div className={`transition-all duration-300 ${navTab === 'home' ? '-translate-y-1' : ''}`}>
                            <Home size={22} strokeWidth={navTab === 'home' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'home' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Início</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <button onClick={() => handleNavChange('history')} className="flex flex-col items-center gap-1 group w-16 mr-8">
                        <div className={`transition-all duration-300 ${navTab === 'history' ? '-translate-y-1' : ''}`}>
                            <History size={22} strokeWidth={navTab === 'history' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'history' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Pedidos</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <div className="w-4"></div>

                    <button onClick={() => handleNavChange('wallet')} className="flex flex-col items-center gap-1 group w-16 ml-8">
                        <div className={`transition-all duration-300 ${navTab === 'wallet' ? '-translate-y-1' : ''}`}>
                            <Wallet size={22} strokeWidth={navTab === 'wallet' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'wallet' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Carteira</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                    <button onClick={() => handleNavChange('profile')} className="flex flex-col items-center gap-1 group w-16">
                        <div className={`transition-all duration-300 ${navTab === 'profile' ? '-translate-y-1' : ''}`}>
                            <User size={22} strokeWidth={navTab === 'profile' ? 3 : 2} className={`transition-colors duration-300 ${navTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </div>
                        <span className={`text-[9px] font-extrabold-id uppercase tracking-wider transition-colors duration-300 ${navTab === 'profile' ? 'text-[#cb6ce6]' : 'text-gray-400'}`}>Perfil</span>
                        <div className={`w-1 h-1 rounded-full bg-[#cb6ce6] mt-0.5 transition-all duration-300 ${navTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>

                </div>
            </div>

            {/* Transaction Modal (Placeholder se você tiver o componente global) */}
            {/* {showReceiptModal && <TransactionReceiptModal transactionId={selectedTransactionId} onClose={() => setShowReceiptModal(false)} />} */}
        </div>
    );
};


export default function App() {
    // === ESTADOS GLOBAIS ===
    const [page, setPage] = React.useState('login');
    const [user, setUser] = React.useState(null);
    const [cart, setCart] = React.useState([]);
    const [paymentData, setPaymentData] = React.useState(null);
    const [depositData, setDepositData] = React.useState(null);
    const [isInitializing, setIsInitializing] = React.useState(true);
    const [paymentMethod, setPaymentMethod] = React.useState(null);
    const [fridgeId, setFridgeId] = React.useState(null);
    const [allCondos, setAllCondos] = React.useState([]);

    // --- ESTADO DO TOAST (Apenas uma vez!) ---
    const [toast, setToast] = React.useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        // O próprio componente Toast lida com a animação de saída, 
        // mas aqui garantimos que o estado limpe após 3s
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // === LÓGICA DE DADOS DO USUÁRIO ===
    const updateUserBalance = React.useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const fullUserData = await response.json();
                setUser(prevUser => ({ ...prevUser, ...fullUserData }));
            }
        } catch (error) {
            console.error("Falha ao atualizar dados do usuário:", error);
        }
    }, []);

    const handleDepositSuccess = React.useCallback(() => {
        showToast('Depósito realizado com sucesso!');
        updateUserBalance();
    }, [updateUserBalance]);

    const handleLogout = () => {
        setUser(null);
        setCart([]);
        setFridgeId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('savedFridgeId'); 
        setPage('login');
    };
    
    // === LÓGICA DE LOGIN E GELADEIRA ===
    const setFridgeAndGoHome = (userData, condos) => {
        const savedFridgeId = localStorage.getItem('savedFridgeId');
        const userCondo = condos.find(c => c.id === userData.condoId);

        if (savedFridgeId && savedFridgeId !== "null" && savedFridgeId !== "undefined") {
            setFridgeId(savedFridgeId);
            setPage('home');
        } else if (userCondo && userCondo.fridge_id) {
            setFridgeId(userCondo.fridge_id);
            setPage('home');
        } else {
            setFridgeId(null); 
            setPage('home');
        }
    };
    
    const handleLogin = async (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const fullUserData = await response.json();
                setUser(fullUserData); 
                setFridgeAndGoHome(fullUserData, allCondos); 
            } else {
                throw new Error('Falha ao buscar dados completos do usuário.');
            }
        } catch (error) {
            console.error(error);
            setFridgeAndGoHome(userData, allCondos); 
        }
    };

    // === INICIALIZAÇÃO ===
    React.useEffect(() => {
        const initializeApp = async () => {
            try {
                const condosResponse = await fetch(`${API_URL}/api/public/condominiums`);
                const condosData = await condosResponse.json();
                setAllCondos(condosData); 

                const token = localStorage.getItem('token');
                const adminToken = localStorage.getItem('adminToken');
                
                if (adminToken) {
                    setUser({ name: "Admin" });
                    setPage('admin');
                } else if (token) {
                    const meResponse = await fetch(`${API_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (meResponse.ok) {
                        const userData = await meResponse.json();
                        setUser(userData);
                        setFridgeAndGoHome(userData, condosData);
                    } else {
                        handleLogout();
                    }
                }
            } catch (error) {
                console.error("Falha ao inicializar a aplicação:", error);
                handleLogout();
            } finally {
                setIsInitializing(false);
            }
        };

        initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    
    // === HANDLERS DE AÇÃO ===
    const handleCondoSelect = (selectedCondo, remember) => {
        if (remember) {
            localStorage.setItem('savedFridgeId', selectedCondo.fridge_id);
        } else {
            localStorage.removeItem('savedFridgeId');
        }
        setCart([]);
        if (user.condoId !== selectedCondo.id) {
             setUser(prevUser => ({ ...prevUser, condoId: selectedCondo.id }));
        }
        setFridgeId(selectedCondo.fridge_id);
        setPage('home'); 
    };

    const handleAdminLogin = () => { setUser({ name: "Admin" }); setPage('admin'); };
    
    const handleRegister = (token, userData) => { 
        handleLogin(token, userData);
    };
    
    const handleAccountUpdate = (updatedUser) => { setUser(prevUser => ({ ...prevUser, ...updatedUser })); };
    const handleCondoChanged = (updatedUser) => { setUser(updatedUser); };

    // === CARRINHO ===
    const addToCart = (productToAdd) => {
        // 1. Verifica quantos deste item já estão no carrinho
        const existingItem = cart.find(item => item.id === productToAdd.id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        // 2. Define o limite. 
        // IMPORTANTE: Verifique se o seu backend manda 'stock', 'quantity' ou 'amount' no objeto do produto.
        // Aqui assumo 'stock'. Se o backend não mandar nada, uso 999 pra não travar.
        const maxStock = productToAdd.stock !== undefined ? productToAdd.stock : 999;

        // 3. A Lógica de Bloqueio
        if (currentQty >= maxStock) {
            // Se já atingiu o limite, mostra erro e CANCELA a função
            showToast(`Apenas ${maxStock} unidades disponíveis!`);
            return; 
        }

        // 4. Se passou pela verificação, executa a adição
        setCart(prevCart => {
            if (existingItem) {
                return prevCart.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                return [...prevCart, { ...productToAdd, quantity: 1 }];
            }
        });
        
        showToast(`${productToAdd.name} adicionado!`); 
    };

    // === ROTEAMENTO ===
    const renderPage = () => {
        if (!user && !['login', 'register', 'forgot-password', 'admin'].includes(page)) {
            return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
        }
        
        switch (page) {
            case 'register': return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPage('login')} />;
            case 'fridgeSelection': return <FridgeSelectionPage onCondoSelected={handleCondoSelect} setPage={setPage} user={user} onLogout={handleLogout} />;
            
            case 'home': 
                return user
                    ? <HomePage 
                        user={user} 
                        onLogout={handleLogout} 
                        cart={cart} 
                        setCart={setCart} 
                        addToCart={addToCart} // Passando a função com Toast
                        setPage={setPage} 
                        fridgeId={fridgeId} 
                        onCondoSelected={handleCondoSelect}
                        condos={allCondos}
                      /> 
                    : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
            
            case 'cart': return <CartPage cart={cart} setCart={setCart} setPage={setPage} user={user} setPaymentData={setPaymentData} onPaymentSuccess={updateUserBalance} fridgeId={fridgeId} />;
            case 'payment': return <PaymentPage paymentData={paymentData} setPage={setPage} paymentMethod={paymentMethod} user={user} cart={cart} onPaymentSuccess={updateUserBalance} setPaymentData={setPaymentData} fridgeId={fridgeId}/>;
            case 'postPayment': return <PostPaymentStatusPage user={user} setPage={setPage} />;
            case 'profile': 
        case 'my-account': 
            return (
                <MyAccountPage 
                    user={user} 
                    setPage={setPage} 
                    onAccountUpdate={handleAccountUpdate} 
                    onLogout={handleLogout} 
                    cart={cart} 
                />
            );
            case 'changeCondo': return <ChangeCondoPage user={user} setPage={setPage} onCondoChanged={handleCondoChanged} />;
            case 'forgot-password': return <ForgotPasswordPage setPage={setPage} />;
            case 'admin': return <AdminDashboard onLogout={handleLogout} />;
            case 'wallet': return <WalletPage user={user} setPage={setPage} setPaymentData={setPaymentData} setDepositData={setDepositData} setPaymentMethod={setPaymentMethod} updateUserBalance={updateUserBalance} showToast={showToast} />;
            case 'card-deposit': return <CardDepositPage user={user} depositData={depositData} setPage={setPage} onPaymentSuccess={handleDepositSuccess} />;
            case 'my-tickets': return <MyTicketsPage setPage={setPage} />;
            case 'credit': return <CreditPage user={user} setPage={setPage} setPaymentData={setPaymentData} setPaymentMethod={setPaymentMethod} />;
            case 'depositSuccess': return <DepositSuccessPage setPage={setPage} />;
            case 'history': return <HistoryPage setPage={setPage} token={localStorage.getItem('token')} showToast={showToast} />;
            
            case 'login':
            default: return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
        }
    };

    return (
        <>
            {/* O TOAST AGORA ESTÁ NO LUGAR CERTO */}
            <Toast 
                isVisible={toast.show} 
                message={toast.message} 
                onClose={() => setToast({ ...toast, show: false })} 
            />

            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
                <main className="flex-grow">
                    {renderPage()}
                </main>
            </div>
        </>
    );
}
