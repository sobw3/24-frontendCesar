
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
    Instagram, MessageSquare, PieChart, LayoutDashboard,  
} from 'lucide-react';




// --- CONFIGURAÇÃO DA API ---
const API_URL = process.env.REACT_APP_API_URL || 'https://two4hprontobackendcesar.onrender.com';
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
    const [animationClass, setAnimationClass] = useState('translate-y-[-150%] opacity-0');

    useEffect(() => {
        if (isVisible) {
            setAnimationClass('translate-y-0 opacity-100');
        } else {
            setAnimationClass('translate-y-[-150%] opacity-0');
        }
    }, [isVisible]);

    return (
        <div className={`fixed top-4 left-0 right-0 z-[9999] flex justify-center pointer-events-none transition-all duration-500 ease-out ${animationClass}`}>
            <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-green-500/30 text-white px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.3)] flex items-center gap-4 pointer-events-auto min-w-[300px] max-w-sm">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-lg shadow-green-500/10 shrink-0">
                    <CheckCircle2 size={20} className="text-green-400" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-green-400 uppercase tracking-wider mb-0.5">Sucesso</h4>
                    <p className="text-gray-200 text-sm font-medium">{message}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
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
    
    // --- Classe do Botão Neon (Laranja) ---
    const neonButtonClassOrange = `
        bg-orange-500 text-white font-bold py-3 px-4 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-orange-500/40 hover:shadow-orange-400/60
        transition-all disabled:bg-gray-500 disabled:shadow-none
        transform hover:scale-105
    `;
    
    // --- Classe do Botão Neon (Verde) ---
    const neonButtonClassGreen = `
        bg-green-600 text-white font-bold py-3 px-4 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-green-500/40 hover:shadow-green-500/60
        transition-all disabled:bg-gray-500 disabled:shadow-none
        transform hover:scale-105
    `;
    
    // --- CORREÇÃO: Handler para a máscara de data DD/MM/AAAA ---
    const handleDateChange = (e) => { setBirthDate(formatDate(e.target.value)); };

    const handleVerifyUser = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        
        // --- CORREÇÃO: Converte a data DD/MM/AAAA para o backend ---
        const [day, month, year] = birthDate.split('/');
        const birthDateForBackend = `${year}-${month}-${day}`;
        // --- FIM DA CORREÇÃO ---
        
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-user`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                // Envia CPF formatado e data convertida
                body: JSON.stringify({ cpf: cpf, birth_date: birthDateForBackend })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha na verificação.');
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
        if (newPassword.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
        setIsLoading(true); setError(''); setSuccess('');
        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ cpf: cpf, newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao alterar a senha.');
            setSuccess(data.message);
            setTimeout(() => setPage('login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- DESIGN "DARK & NEON" (Padrão do App) ---
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <style>{keyframes}</style>
            
            {/* Card de Vidro (Glassmorphism) */}
            <div className="w-full max-w-md 
                            bg-gray-800/50 backdrop-blur-sm 
                            border border-gray-700/50 
                            p-8 rounded-2xl shadow-2xl 
                            animate-surgir relative"
            >
                
                {/* Botão Voltar (Estilizado) */}
                <button 
                    onClick={() => setPage('login')} 
                    className="absolute top-4 left-4 text-gray-400 hover:text-orange-400 
                               flex items-center gap-2 font-medium transition
                               bg-gray-700/50 hover:bg-gray-700 px-3 py-2 rounded-lg"
                    style={{ animationDelay: '100ms' }}
                >
                    <ArrowLeft size={16} /> 
                </button>
                
                {/* Título (Fonte Leve) */}
                <h2 className="text-3xl font-light text-center mb-6 text-white animate-surgir" style={{ animationDelay: '200ms' }}>
                    Recuperar Senha
                </h2>
                
                {step === 1 && (
                    <form onSubmit={handleVerifyUser} className="animate-surgir" style={{ animationDelay: '300ms' }}>
                        <p className="text-center text-gray-400 mb-6">Insira os seus dados para verificarmos a sua identidade.</p>
                        
                        {/* Inputs (Estilo Transparente) */}
                        <div className="mb-4 relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Seu CPF" 
                                value={cpf} 
                                onChange={(e) => setCpf(formatCPF(e.target.value))} 
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                required 
                            />
                        </div>
                        {/* --- CORREÇÃO: Input de Data de Nascimento (Texto + Máscara) --- */}
                        <div className="mb-6 relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Data de Nascimento (DD/MM/AAAA)"
                                value={birthDate} 
                                onChange={handleDateChange} // Usa a máscara
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                required 
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        
                        {/* Botão Laranja (Neon) */}
                        <button 
                            type="submit" 
                            className={`w-full ${neonButtonClassOrange}`} 
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Verificar'}
                        </button>
                    </form>
                )}
                
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="animate-surgir" style={{ animationDelay: '300ms' }}>
                        <p className="text-center text-green-400 mb-6 font-semibold">Utilizador verificado! Agora, crie uma nova senha.</p>
                        
                        {/* Inputs (Estilo Transparente) */}
                        <div className="mb-4 relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="password" 
                                placeholder="Nova senha (mín. 6 caracteres)" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                required 
                            />
                        </div>
                        <div className="mb-6 relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="password" 
                                placeholder="Confirme a nova senha" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                required 
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        {success && <p className="text-green-400 text-sm text-center mb-4">{success}</p>}
                        
                        {/* Botão Verde (Neon) */}
                        <button 
                            type="submit" 
                            className={`w-full ${neonButtonClassGreen}`} 
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Alterar Senha'}
                        </button>
                    </form>
                )}
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
            {/* Card Branco Clean */}
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-gray-900 animate-scale-up relative">
                
                {/* Botão Fechar */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                        <Shield size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Acesso Restrito</h2>
                    <p className="text-sm text-gray-500">Painel Administrativo</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Input Usuário */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Utilizador" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400" 
                            required 
                        />
                    </div>

                    {/* Input Senha */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400" 
                            required 
                        />
                    </div>
                    
                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center font-medium">
                            {error}
                        </div>
                    )}
                    
                    {/* Botão Entrar */}
                    <button 
                        type="submit" 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-orange-500/30 transform active:scale-95 flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar no Painel'}
                    </button>
                </form>
                
                <div className="mt-6 text-center border-t border-gray-100 pt-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Área Segura</p>
                </div>
            </div>
        </div>
    );
};

const LoginPage = ({ onLogin, onAdminLogin, onSwitchToRegister, setPage }) => {
    // --- ESTADOS ---
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
            {/* --- AQUI ESTÁ A MÁGICA: O MODAL É CHAMADO AQUI --- */}
            <AdminLoginModal 
                show={showAdminModal} 
                onClose={() => setShowAdminModal(false)} 
                onAdminLogin={onAdminLogin} 
            />

            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
                
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Card de Login */}
                <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10 animate-scale-up flex flex-col justify-between" style={{ minHeight: '550px' }}>
                    
                    {/* LOGO */}
                    <div className="h-32 mb-6 w-full flex items-center justify-center">
                        <img 
                            src="https://i.imgur.com/LCoZwuM.png" 
                            alt="Pronto24h" 
                            className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                        />
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-5 flex-1">
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wide">CPF</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={handleCpfChange}
                                    maxLength={14}
                                    className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 p-3.5 placeholder-gray-500 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wide">Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 p-3.5 placeholder-gray-500 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-500/20 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <span className="flex items-center gap-2">Entrar <ArrowRight size={18} /></span>}
                        </button>
                    </form>

                    {/* Links Rodapé */}
                    <div className="mt-6 text-center space-y-3">
                        <button onClick={() => setPage('forgot-password')} className="text-sm font-medium text-gray-400 hover:text-orange-400 transition-colors">
                            Esqueci minha senha
                        </button>
                        
                        <div className="flex items-center justify-center gap-2 text-sm pt-2 border-t border-white/5">
                            {/* BOTÃO QUE ABRE O MODAL DE ADMIN */}
                            <button 
                                onClick={() => setShowAdminModal(true)} 
                                className="flex items-center gap-1 text-gray-600 hover:text-gray-300 transition-colors py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                            >
                                <Shield size={12} /> Admin
                            </button>
                            
                            <span className="text-gray-600">|</span>
                            
                            <button onClick={onSwitchToRegister} className="font-bold text-orange-500 hover:text-orange-400 transition-colors">
                                Cadastre-se
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-4 text-[10px] text-gray-600 font-medium">
                    &copy; 2024 Pronto24h. Todos os direitos reservados.
                </div>
            </div>
        </>
    );
};

// App.js -> SUBSTITUA o seu componente RegisterPage por este

const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
        </div>
        <input
            className="w-full bg-gray-800/50 border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent block pl-12 p-3.5 placeholder-gray-500 transition-all outline-none"
            {...props}
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
    
    // Novos estados para a animação de sucesso
    const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('Seja bem vindo ao mercado pronto24h');

    // --- UTILS DE FORMATAÇÃO ---
    const formatCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
    const formatPhone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2").slice(0, 15);
    const formatDate = (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 10);
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validateCPF = (cpf) => cpf.length === 14;

    // --- HANDLERS ---
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
            // SIMULAÇÃO DO BACKEND
            await new Promise(r => setTimeout(r, 1500));
            
            // Se chegou aqui, deu sucesso no cadastro.
            setIsLoading(false);
            
            // INICIA A SEQUÊNCIA DE ANIMAÇÃO
            setShowSuccessAnimation(true);

            // 1. Mensagem inicial já está definida ("Seja bem vindo...")
            
            // 2. Após 2.5 segundos, muda para "Boas compras!"
            setTimeout(() => {
                setSuccessMessage('Boas compras!');
                
                // 3. Após mais 2 segundos, redireciona para o Login
                setTimeout(() => {
                    if (onSwitchToLogin) onSwitchToLogin();
                }, 2000);
                
            }, 2500);

        } catch (err) {
            setError(err.message || 'Erro ao criar conta');
            setIsLoading(false);
        }
    }
    
    // --- VALIDAÇÕES ---
    const validateStep1 = () => {
        if (!formData.name || !validateEmail(formData.email) || formData.cpf.length !== 14 || formData.phone_number.length < 14 || formData.birthDate.length !== 10) return false;
        const [day, month, year] = formData.birthDate.split('/');
        return !(!day || !month || !year || year.length !== 4);
    };
    const validateStep2 = () => formData.apartmentBlock.trim() && formData.apartmentNumber.trim();
    const validateStep3 = () => formData.password.length >= 6 && formData.password === formData.confirmPassword && formData.terms;

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* --- TELA DE SUCESSO ANIMADA --- */}
            {showSuccessAnimation ? (
                 <div className="w-full max-w-lg bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500" style={{ minHeight: '400px' }}>
                    
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                        <div className="bg-gradient-to-tr from-green-500 to-emerald-400 p-6 rounded-full shadow-lg relative z-10">
                            <Check size={48} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-700">
                        {successMessage === 'Boas compras!' ? 'Tudo pronto!' : 'Sucesso!'}
                    </h2>
                    
                    <p className="text-xl text-gray-300 font-medium transition-all duration-500 transform">
                        {successMessage}
                    </p>

                    <div className="mt-8">
                        <Loader2 className="h-6 w-6 text-orange-500 animate-spin mx-auto" />
                        <p className="text-xs text-gray-500 mt-2">Redirecionando para o login...</p>
                    </div>
                 </div>
            ) : (
                /* --- FORMULÁRIO PADRÃO --- */
                <div className="w-full max-w-lg bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10 flex flex-col" style={{ minHeight: '680px' }}>
                    
                    {/* --- LOGO --- */}
                    <div className="h-24 mb-4 w-full flex items-center justify-center flex-shrink-0">
                        <img 
                            src="https://i.imgur.com/LCoZwuM.png"
                            alt="Pronto24h" 
                            className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-white text-center mb-1">Crie sua conta</h2>
                    <p className="text-gray-400 text-center text-sm mb-6">Passo {step} de 3</p>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-8 flex-shrink-0 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-400 h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    {/* --- JANELA DE SLIDE --- */}
                    <div className="flex-1 overflow-hidden relative">
                        <div 
                            className="flex transition-transform duration-500 ease-in-out h-full" 
                            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
                        >
                            
                            {/* --- PASSO 1: PESSOAL --- */}
                            <div className="w-full flex-shrink-0 px-1 flex flex-col h-full">
                                <div className="space-y-4 flex-1">
                                    <InputField icon={User} name="name" type="text" placeholder="Nome Completo" value={formData.name} onChange={handleChange} />
                                    <InputField icon={Mail} name="email" type="email" placeholder="E-mail" value={formData.email} onChange={handleChange} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField icon={FileText} name="cpf" type="text" placeholder="CPF" value={formData.cpf} onChange={handleCpfChange} maxLength={14} />
                                        <InputField icon={Calendar} name="birthDate" type="text" placeholder="Nascimento" value={formData.birthDate} onChange={handleDateChange} maxLength={10} />
                                    </div>
                                    <InputField icon={Phone} name="phone_number" type="tel" placeholder="Telefone" value={formData.phone_number} onChange={handlePhoneChange} maxLength={15} />
                                </div>

                                <div className="mt-auto pt-6 flex justify-end">
                                    <button 
                                        onClick={() => setStep(step + 1)} 
                                        disabled={!validateStep1()} 
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* --- PASSO 2: ENDEREÇO --- */}
                            <div className="w-full flex-shrink-0 px-1 flex flex-col h-full">
                                <div className="space-y-1 flex-1">
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                                        <p className="text-blue-200 text-sm text-center">
                                            Precisamos saber onde você mora para liberar o acesso às máquinas corretas.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 ml-1 mb-1 block uppercase">Bloco / Torre</label>
                                            <InputField icon={Building2} name="apartmentBlock" type="text" placeholder="Ex: Bloco A" value={formData.apartmentBlock} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 ml-1 mb-1 block uppercase">Nº Apartamento</label>
                                            <InputField icon={Home} name="apartmentNumber" type="text" placeholder="Ex: 101" value={formData.apartmentNumber} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 flex justify-between">
                                    <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-white font-bold py-3 px-4 rounded-xl flex items-center gap-2 transition-colors">
                                        <ArrowLeft size={18} /> Voltar
                                    </button>
                                    <button 
                                        onClick={() => setStep(step + 1)} 
                                        disabled={!validateStep2()} 
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* --- PASSO 3: SEGURANÇA --- */}
                            <div className="w-full flex-shrink-0 px-1 flex flex-col h-full">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 ml-1 mb-1 block uppercase">Senha de Acesso</label>
                                        <InputField icon={Lock} name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 ml-1 mb-1 block uppercase">Confirmar Senha</label>
                                        <InputField icon={Lock} name="confirmPassword" type="password" placeholder="Repita a senha" value={formData.confirmPassword} onChange={handleChange} />
                                    </div>

                                    <div className="pt-4">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.terms} 
                                                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} 
                                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-600 bg-gray-800 transition-all checked:border-orange-500 checked:bg-orange-500 hover:border-orange-400"
                                                />
                                                <Check size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                            </div>
                                            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors select-none">
                                                Declaro que as informações preenchidas são verdadeiras e aceito os termos de uso.
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Mensagens de Feedback */}
                                {error && <p className="text-red-400 text-xs text-center mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}

                                <div className="mt-auto pt-6 flex justify-between items-center">
                                    <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-white font-bold py-3 px-4 rounded-xl flex items-center gap-2 transition-colors">
                                        <ArrowLeft size={18} /> Voltar
                                    </button>
                                    <button 
                                        onClick={handleRegisterSubmit} 
                                        disabled={!validateStep3() || isLoading} 
                                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Finalizar <Check size={18} /></>}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer Link */}
                    <div className="text-center mt-6 pt-4 border-t border-white/5 flex-shrink-0">
                        <button 
                            onClick={onSwitchToLogin} 
                            className="text-sm text-gray-500 hover:text-orange-400 transition-colors font-medium"
                        >
                            Já tem uma conta? <span className="text-white underline decoration-orange-500/50 hover:decoration-orange-500">Fazer Login</span>
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
    const isOutOfStock = product.stock === 0;
    const isOnSale = product.is_on_sale;
    
    // Formatação de preço
    const formatPrice = (price) => {
        const [int, dec] = parseFloat(price).toFixed(2).split('.');
        return { int, dec };
    };
    const salePrice = formatPrice(product.sale_price);
    const originalPrice = formatPrice(product.original_price);

    return (
        <div className={`group relative flex flex-col bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-orange-500/10 hover:-translate-y-1 overflow-hidden ${isOutOfStock ? 'opacity-70' : 'hover:border-orange-500/30'}`}>
            
            {/* Efeito de Brilho no Hover (Glow) */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-purple-500/5 transition-all duration-700 pointer-events-none" />

            {/* Imagem */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10 opacity-80" />
                
                <img 
                    src={product.image_url || `https://placehold.co/300x300/1f2937/ffffff?text=Sem+Foto`} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`} 
                />

                {/* Badge Promoção (Glass) */}
                {isOnSale && !isOutOfStock && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        <Flame size={10} fill="currentColor" /> Promo
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col flex-1 relative z-20 -mt-8">
                {/* Nome do Produto */}
                <h3 className="text-gray-100 font-bold text-lg leading-snug mb-1 line-clamp-2 min-h-[3.25rem] group-hover:text-white transition-colors drop-shadow-md">
                    {product.name}
                </h3>

                {/* Separador Sutil */}
                <div className="w-8 h-0.5 bg-gray-700/50 rounded-full mb-3 group-hover:bg-orange-500/50 transition-colors"></div>
                
                <div className="mt-auto">
                    {/* Preço */}
                    <div className="flex items-end justify-between mb-4">
                        <div className="flex flex-col">
                            {isOnSale && (
                                <span className="text-gray-500 text-xs font-medium line-through decoration-red-500/50 mb-0.5 ml-1">
                                    R$ {originalPrice.int},{originalPrice.dec}
                                </span>
                            )}
                            <div className="flex items-baseline gap-0.5 text-white drop-shadow-lg">
                                <span className="text-sm font-light text-gray-400 mr-1">R$</span>
                                <span className={`text-3xl font-black tracking-tighter ${isOnSale ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300' : 'text-white'}`}>
                                    {salePrice.int}
                                </span>
                                <span className="text-sm font-bold text-gray-400">,{salePrice.dec}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botão de Ação */}
                    {!isOutOfStock ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            className="group/btn relative w-full overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 p-3 transition-all duration-300 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                            <div className="flex items-center justify-center gap-2 text-sm font-bold text-white group-hover/btn:text-orange-400 transition-colors">
                                <div className="bg-orange-500 rounded-full p-1 text-white shadow-lg shadow-orange-500/40 group-hover/btn:scale-110 transition-transform">
                                    <Plus size={14} strokeWidth={3} />
                                </div>
                                <span className="tracking-wide">ADICIONAR</span>
                            </div>
                        </button>
                    ) : (
                        <div className="w-full bg-red-500/5 border border-red-500/10 text-red-400/50 font-bold py-3 rounded-xl text-xs uppercase tracking-widest text-center cursor-not-allowed">
                            Indisponível
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay Esgotado (Full Cover Glass) */}
            {isOutOfStock && (
                <div className="absolute inset-0 z-30 bg-[#0f172a]/60 backdrop-blur-sm flex flex-col items-center justify-center border-t border-white/5">
                    <div className="bg-black/40 p-4 rounded-full border border-white/10 mb-2 shadow-2xl">
                         <AlertCircle size={28} className="text-gray-400" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-widest uppercase">Esgotado</span>
                </div>
            )}
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

    return (
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl bg-[#1e293b] border border-white/10">
            <style>{marqueeStyle}</style>

            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/90 via-[#0f172a]/80 to-[#0f172a]/40"></div>

            <div className="relative z-10 p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 capitalize">{user?.name?.split(' ')[0]?.toLowerCase() || 'Visitante'}</span>!
                </h1>
                <p className="text-gray-300 text-base md:text-lg mb-6 max-w-lg shadow-black drop-shadow-md">
                    Bateu aquela fome? A <span className="font-bold text-white">{currentCondo?.name || 'Freezer'}</span> está abastecida.
                </p>

                <div className="flex flex-col gap-4">
                    {/* Barra de Pesquisa */}
                    <div className="relative group w-full max-w-xl">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-[#0f172a]/80 backdrop-blur-md rounded-xl flex items-center px-4 py-3 border border-gray-700/50 focus-within:border-orange-500/50 transition-colors">
                            <Search className="text-gray-400 shrink-0" size={20} />
                            <input 
                                type="text" 
                                placeholder="O que você procura hoje?" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none text-white text-base px-3 focus:ring-0 placeholder-gray-400 outline-none"
                            />
                            {isSearchLoading && <Loader2 className="animate-spin text-orange-500 shrink-0" size={20} />}
                            {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white"><X size={16}/></button>}
                        </div>
                    </div>

                    {/* --- ÁREA DE CARDS (CORRIGIDA: REMOVIDA ALTURA FIXA E MELHORADO WRAP) --- */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                        
                        {/* 1. BOTÃO DE SALDO */}
                        <button 
                            onClick={() => setPage('wallet')} 
                            className="group relative flex items-center gap-3 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl transition-all duration-300 hover:border-orange-500/30 active:scale-95 w-full sm:w-fit shrink-0"
                        >
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-orange-500/20 blur-lg rounded-full group-hover:bg-orange-500/40 transition-all"></div>
                            <div className="relative p-2 bg-gradient-to-br from-gray-800 to-black rounded-lg border border-white/10 shadow-lg group-hover:border-orange-500/20 transition-colors">
                                <Wallet className="text-orange-500" size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0 leading-none group-hover:text-orange-400 transition-colors">
                                    Seu Saldo
                                </p>
                                <p className="text-lg font-black text-white tracking-tight drop-shadow-md leading-tight">
                                    R$ {parseFloat(user?.wallet_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </button>

                        {/* 2. CARD "LETREIRO DIGITAL" (CORRIGIDO: Min-Height e responsividade) */}
                        <div className="flex-1 min-h-[56px] relative bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center shadow-inner w-full">
                            {/* Fundo escuro */}
                            <div className="absolute inset-0 bg-[#0a0f1c]"></div>
                            
                            {/* Efeito de Scanlines */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

                            {/* O Texto Rolante */}
                            <div className="relative z-0 w-full overflow-hidden flex items-center py-2">
                                <div className="animate-led whitespace-nowrap">
                                    
                                    {/* BLOCO 1 DE MENSAGENS */}
                                    <span className="font-mono font-bold text-[10px] md:text-sm tracking-widest px-4 flex items-center gap-6">
                                        <span className="text-cyan-400">✨ BOAS COMPRAS!</span>
                                        <span className="text-red-500 flex items-center gap-1">📹 VOCÊ ESTÁ SENDO FILMADO</span>
                                        <span className="text-yellow-400">⚠️ RETIRE APENAS O QUE FOI PAGO</span>
                                        <span className="text-red-500 flex items-center gap-1">👁️ AÇÃO MONITORADA</span>
                                        <span className="text-cyan-400">👋 VOLTE SEMPRE!</span>
                                    </span>

                                    {/* BLOCO 2 DE MENSAGENS (DUPLICADO PARA O LOOP) */}
                                    <span className="font-mono font-bold text-[10px] md:text-sm tracking-widest px-4 flex items-center gap-6">
                                        <span className="text-cyan-400">✨ BOAS COMPRAS!</span>
                                        <span className="text-red-500 flex items-center gap-1">📹 VOCÊ ESTÁ SENDO FILMADO</span>
                                        <span className="text-yellow-400">⚠️ RETIRE APENAS O QUE FOI PAGO</span>
                                        <span className="text-red-500 flex items-center gap-1">👁️ AÇÃO MONITORADA</span>
                                        <span className="text-cyan-400">👋 VOLTE SEMPRE!</span>
                                    </span>

                                </div>
                            </div>
                            
                            {/* Brilho nas bordas */}
                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#0a0f1c] to-transparent z-20"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#0a0f1c] to-transparent z-20"></div>
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
                const res = await fetch(`${API_URL}/api/products/search?q=${searchQuery}&condoId=${user?.condoId}`);
                if (res.ok) { const data = await res.json(); setSearchResults(data); }
            } catch (err) { console.error(err); } 
            finally { setIsSearchLoading(false); }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchQuery, user?.condoId]);

    const currentCondo = condos.find(c => c.id === user?.condoId);

    // --- RENDERIZAÇÃO ---
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col">
            
            {/* HEADER COM NOTIFICAÇÃO */}
            <header className="bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 shadow-lg shadow-black/20 py-1 h-16 relative flex items-center justify-center">
                <img 
                    src="https://i.imgur.com/LCoZwuM.png" 
                    alt="Pronto24h" 
                    className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.4)] transform scale-150 transition-transform duration-300" 
                />
                {unreadCount > 0 && (
                    <button 
                        onClick={() => setPage('my-tickets')} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 group"
                    >
                        <Bell size={20} className="group-hover:animate-swing" />
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-md animate-bounce">
                            {unreadCount}
                        </span>
                        <div className="absolute inset-0 rounded-full blur-md bg-red-500/20 -z-10 animate-pulse"></div>
                    </button>
                )}
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 container mx-auto px-4 py-6 pb-36 md:pb-10 relative">
                
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
                    <div className="mb-8 -mt-6 relative z-30 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Search size={12} className="text-orange-500" /> Resultados ({searchResults.length})
                                </p>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                                <div className="grid grid-cols-1 gap-2">
                                    {searchResults.map(item => (
                                        <div key={item.id} onClick={() => { addToCart(item); setSearchQuery(''); }} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/5 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-800 border border-white/10 shadow-sm">
                                                <img src={item.image_url || 'https://placehold.co/50'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                                            </div>
                                            <div className="flex-1 min-w-0 relative z-10">
                                                <h4 className="font-bold text-gray-200 text-sm mb-1 truncate group-hover:text-orange-400 transition-colors">{item.name}</h4>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xs text-gray-500">R$</span>
                                                    <span className="text-orange-400 font-black text-lg">{parseFloat(item.sale_price).toFixed(2).replace('.', ',')}</span>
                                                </div>
                                            </div>
                                            <button className="relative z-10 w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all shadow-lg group-hover:shadow-orange-500/20">
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seletor de Máquina */}
                {condos.length > 1 && (
                    <div className="mb-8">
                        <p className="text-gray-400 text-xs font-bold uppercase mb-3 ml-1 tracking-wider flex items-center gap-2">
                            <MapPin size={12} /> Selecione uma máquina
                        </p>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {condos.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => onCondoSelected(c, true)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition border ${c.id === user?.condoId ? 'bg-white text-black border-white shadow-lg shadow-white/10' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-500 hover:bg-gray-800'}`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Listagem de Produtos */}
                {isLoading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" size={40}/></div>
                ) : (
                    <div className="space-y-12">
                        {Object.keys(products).map(category => (
                            <div key={category} className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                                        <span className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></span>
                                        {category}
                                    </h2>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                    {products[category].map(product => (
                                        <ProductCard 
                                            key={product.id} 
                                            product={product} 
                                            addToCart={addToCart} 
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {Object.keys(products).length === 0 && <InstructionsCarousel />}
                    </div>
                )}
            </main>

            {/* --- BOTTOM NAV --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <button 
                        onClick={() => handleNavChange('cart')} 
                        className={`group relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${activeTab === 'cart' ? 'bg-orange-500 scale-110 shadow-orange-500/50' : 'bg-[#1e293b] border-4 border-[#0f172a] text-gray-400'}`}
                    >
                        <ShoppingCart size={28} className={activeTab === 'cart' ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-md animate-bounce">
                                {cart.reduce((a,b)=>a+b.quantity,0)}
                            </span>
                        )}
                        <div className={`absolute inset-0 rounded-full blur-xl bg-orange-500/40 -z-10 transition-opacity duration-300 ${activeTab === 'cart' ? 'opacity-100' : 'opacity-0'}`}></div>
                    </button>
                </div>

                <div className="relative bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-4 h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-between items-end pb-4">
                    <button onClick={() => handleNavChange('home')} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className={`relative p-1 transition-all duration-300 ${activeTab === 'home' ? '-translate-y-1' : ''}`}>
                            <Home size={24} className={`transition-colors duration-300 ${activeTab === 'home' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${activeTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${activeTab === 'home' ? 'text-white' : 'text-gray-500'}`}>Início</span>
                    </button>

                    <button onClick={() => handleNavChange('history')} className="flex-1 flex flex-col items-center gap-1 group mr-6">
                        <div className={`relative p-1 transition-all duration-300 ${activeTab === 'history' ? '-translate-y-1' : ''}`}>
                            <History size={24} className={`transition-colors duration-300 ${activeTab === 'history' ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${activeTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}>Pedidos</span>
                    </button>

                    <div className="w-12"></div>

                    <button onClick={() => handleNavChange('wallet')} className="flex-1 flex flex-col items-center gap-1 group ml-6">
                        <div className={`relative p-1 transition-all duration-300 ${activeTab === 'wallet' ? '-translate-y-1' : ''}`}>
                            <Wallet size={24} className={`transition-colors duration-300 ${activeTab === 'wallet' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${activeTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${activeTab === 'wallet' ? 'text-white' : 'text-gray-500'}`}>Carteira</span>
                    </button>

                    <button onClick={() => handleNavChange('profile')} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className={`relative p-1 transition-all duration-300 ${activeTab === 'profile' ? '-translate-y-1' : ''}`}>
                            <User size={24} className={`transition-colors duration-300 ${activeTab === 'profile' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${activeTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500'}`}>Perfil</span>
                    </button>
                </div>
            </div>

            {/* DRAWER MENU ATUALIZADO */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end isolate">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300" 
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    <div className="relative w-[85%] max-w-xs h-full bg-[#0f172a]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        
                        {/* CABEÇALHO DO MENU */}
                        <div className="p-6 flex justify-between items-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <User size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight leading-none">Minha Conta</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">Configurações e Ajuda</p>
                                </div>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            
                            {/* CARD DO USUÁRIO */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-black p-5 border border-white/10 group shadow-lg">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl font-bold text-white shadow-lg border-2 border-[#0f172a]">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg leading-tight capitalize truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* CARD DE DIVULGAÇÃO (NOVO) */}
                            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-900/40 to-black group">
                                <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay"></div>
                                <div className="relative p-5 z-10">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Oportunidade</span>
                                        <Zap size={16} className="text-yellow-400 animate-pulse" fill="currentColor" />
                                    </div>
                                    <h4 className="text-white font-black text-lg leading-tight mb-2">Tenha seu próprio Mercado Autônomo!</h4>
                                    <p className="text-gray-300 text-xs leading-relaxed mb-4">Invista pouco e lucre 24h por dia. Tecnologia completa pronta para você começar.</p>
                                    <div className="mb-4">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Investimento a partir de</p>
                                        <p className="text-xl font-black text-yellow-400">R$ 4.690,00</p>
                                    </div>
                                    <a href="https://wa.me/5500000000000?text=Olá,%20tenho%20interesse%20em%20ter%20um%20ponto%20autônomo!" target="_blank" rel="noopener noreferrer" className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-center py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-yellow-500/20">
                                        Quero Saber Mais
                                    </a>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Acesso Rápido</p>
                                <button onClick={() => {setPage('my-account'); setMobileMenuOpen(false)}} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all group">
                                    <div className="p-2 bg-black/30 rounded-lg text-gray-400 group-hover:text-orange-400 transition-colors"><User size={20}/></div>
                                    <span className="font-bold text-gray-200 group-hover:text-white">Minha Conta</span>
                                </button>
                                <button onClick={() => {setPage('my-tickets'); setMobileMenuOpen(false)}} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
                                    <div className="p-2 bg-black/30 rounded-lg text-gray-400 group-hover:text-blue-400 transition-colors"><Bell size={20}/></div>
                                    <span className="font-bold text-gray-200 group-hover:text-white">Notificações</span>
                                </button>
                            </nav>

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Precisa de Ajuda?</p>
                                <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-green-600/10 border border-green-500/20 text-green-400 hover:bg-green-600 hover:text-white transition-all group">
                                    <MessageCircle size={20} className="group-hover:animate-bounce"/>
                                    <span className="font-bold">Suporte WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-black/20">
                            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sm">
                                <LogOut size={18} /> Sair do App
                            </button>
                            <p className="text-center text-[10px] text-gray-600 mt-4 font-medium">Versão 2.4.0 • Pronto24h</p>
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

    // --- AÇÃO DE PAGAMENTO (CORRIGIDA) ---
    const handleConfirmPayment = async () => {
        setIsLoading(true); 
        setError('');
        
        // 1. Definição explícita da URL para evitar erro de localhost
        const API_URL = 'https://two4hprontobackendcesar.onrender.com';
        const token = localStorage.getItem('token');

        // 2. Dados de envio (Log para debug)
        const payload = { 
            items: cart, 
            fridgeId: fridgeId || 'MS5', // Fallback se o fridgeId vier nulo
            condoId: user?.condoId || 1  // Fallback se o condoId vier nulo
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

            // 3. Fluxo de Sucesso
            setPaymentData({ orderId: data.orderId }); 
            onPaymentSuccess(); // Isso deve acionar o feedback visual
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

    // --- COMPONENTES VISUAIS ---
    const CartItem = ({ item }) => (
        <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:bg-white/10 hover:border-orange-500/30 overflow-hidden">
            <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-gray-800 shadow-lg">
                <img 
                    src={item.image_url || `https://placehold.co/100x100/374151/ffffff?text=${item.name.substring(0,3)}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                />
            </div>
            <div className="flex-grow min-w-0">
                <h3 className="font-bold text-gray-100 text-sm md:text-base leading-tight mb-1 truncate">{item.name}</h3>
                <p className="text-orange-400 font-black text-lg">
                    R$ {parseFloat(item.sale_price).toFixed(2).replace('.', ',')}
                </p>
            </div>
            <div className="flex items-center gap-3 bg-black/20 rounded-xl p-1 border border-white/5">
                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"><Minus size={14} /></button>
                <span className="font-bold text-white w-4 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-lg text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95"><Plus size={14} /></button>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"><X size={14} /></button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col">
            
            {/* INSERIR AQUI SEUS MODAIS (PaymentConfirmationModal e ClearCartModal) 
                Estou assumindo que eles são importados ou passados por contexto, 
                mas se precisar do código deles, me avise. 
            */}
            {/* Exemplo de uso se eles estiverem disponíveis no escopo: */}
            {typeof PaymentConfirmationModal !== 'undefined' && (
                <PaymentConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirmPayment}
                    isLoading={isLoading}
                    cartTotal={cartTotal}
                    userBalance={userBalance}
                />
            )}
            
            {typeof ClearCartModal !== 'undefined' && (
                <ClearCartModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    onConfirm={handleClearCartConfirm}
                />
            )}

            {/* HEADER */}
            <header className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPage('home')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Meu Carrinho</h1>
                    </div>
                    {cart.length > 0 && (
                        <button onClick={() => setIsClearModalOpen(true)} className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 transition-colors">
                            <Trash2 size={12} /> Limpar
                        </button>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 pb-40 md:pb-10">
                {cart.length === 0 ? (
                    // EMPTY STATE
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-2xl relative">
                            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                            <ShoppingCart size={40} className="text-gray-400 relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Seu carrinho está vazio</h2>
                        <p className="text-gray-400 text-center max-w-xs mb-8">Parece que você ainda não escolheu nada.</p>
                        <button onClick={() => setPage('home')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            <ArrowLeft size={18} /> Voltar para a Loja
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LISTA DE ITENS */}
                        <div className="lg:col-span-2 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {cart.map(item => <CartItem key={item.id} item={item} />)}
                        </div>

                        {/* RESUMO E PAGAMENTO (DESKTOP) */}
                        <div className="hidden lg:block h-fit sticky top-24 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white"><Package size={20} className="text-orange-500" /> Resumo</h2>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-400 text-sm"><span>Subtotal ({cart.reduce((a,b)=>a+b.quantity,0)} itens)</span><span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span></div>
                                    <div className="h-px bg-white/10 my-2"></div>
                                    <div className="flex justify-between items-end"><span className="text-white font-bold">Total</span><span className="text-2xl font-black text-orange-400">R$ {cartTotal.toFixed(2).replace('.', ',')}</span></div>
                                </div>

                                <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Wallet size={20} /></div>
                                        <div><p className="text-xs text-gray-400 font-bold uppercase">Seu Saldo</p><p className="text-white font-bold">R$ {userBalance.toFixed(2).replace('.', ',')}</p></div>
                                    </div>
                                </div>

                                {error && <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-300 text-sm text-center mb-4 flex items-center justify-center gap-2"><AlertTriangle size={16} /> {error}</div>}

                                {!canAfford ? (
                                    <button onClick={() => setPage('wallet')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 animate-pulse">
                                        <Zap size={20} fill="currentColor" className="text-yellow-300" /> Depósito Rápido (Faltam R$ {difference.toFixed(2)})
                                    </button>
                                ) : (
                                    <button onClick={() => setIsConfirmModalOpen(true)} disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="animate-spin" /> : <> <CheckCircle2 size={20} /> Finalizar Compra </>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- BARRA FIXA MOBILE (Checkout Otimizado) --- */}
            {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom-full duration-500">
                    {error && <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-red-300 text-xs text-center mb-3 flex items-center justify-center gap-2"><AlertTriangle size={12}/> {error}</div>}

                    <div className="flex gap-4 items-center">
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total</span>
                                <span className="text-2xl font-black text-white leading-none">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md w-fit border border-white/5">
                                <Wallet size={10} className={canAfford ? "text-green-400" : "text-red-400"} />
                                <span className="text-[10px] text-gray-400">Saldo:</span>
                                <span className={`text-[10px] font-bold ${canAfford ? "text-green-400" : "text-red-400"}`}>
                                    R$ {userBalance.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>

                        {/* BOTÃO INTELIGENTE (Pagar ou Recarregar) */}
                        {!canAfford ? (
                            <button 
                                onClick={() => setPage('wallet')} 
                                className="flex-[1.4] bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-3 rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 border border-green-400/20 animate-pulse-slow"
                            >
                                <Zap size={20} fill="currentColor" className="text-yellow-300" />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] text-green-100 uppercase font-bold mb-0.5">Faltam R$ {difference.toFixed(2)}</span>
                                    <span className="text-sm font-black">DEPOSITAR</span>
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={isLoading}
                                className="flex-[1.4] bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <> Pagar <CheckCircle2 size={20} /> </>}
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
    const BASE_URL = API_URL || 'https://two4hprontobackendcesar.onrender.com';

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
    const [isLoading, setIsLoading] = React.useState(false); // Carregando o PAGAMENTO
    const [isBrickLoading, setIsBrickLoading] = React.useState(true); // Carregando o FORMULÁRIO
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

    // 2. Inicializa o Brick do Cartão (VERSÃO COM TRADUÇÃO FORÇADA)
    React.useEffect(() => {
        if (isMpReady && depositAmount > 0 && !brickIsInitializing.current) {
            
            if (!MERCADOPAGO_PUBLIC_KEY) {
                setError("Chave de API do Mercado Pago (Pública) não foi configurada. Verifique o .env.");
                setIsBrickLoading(false);
                return;
            }
            
            brickIsInitializing.current = true; 
            const mp = new window.MercadoPago(MERCADOPAGO_PUBLIC_KEY);
            const bricksBuilder = mp.bricks();

            const renderCardPaymentBrick = async () => {
                try {
                    const container = document.getElementById("cardPaymentBrick_container");
                    if (container.firstChild) {
                        while (container.firstChild) {
                            container.removeChild(container.firstChild);
                        }
                    }
                    
                    setIsBrickLoading(true); 
                    
                    await bricksBuilder.create("cardPayment", "cardPaymentBrick_container", {
                        initialization: {
                            amount: depositAmount,
                            locale: 'pt-BR', // Tentativa 1 (oficial)
                            payer: {
                                email: user.email,
                                identification: {
                                    type: 'CPF',
                                    number: user.cpf.replace(/\D/g, '')
                                }
                            },
                        },
                        customization: {
                            // ==============================================
                            // --- CORREÇÃO 2: TRADUÇÃO MANUAL (FORÇADA) ---
                            // ==============================================
                            texts: {
                                submit: `Depositar R$ ${depositAmount.toFixed(2).replace('.', ',')}`,
                                // Traduzindo os placeholders (o que fica dentro do campo)
                                placeholder: {
                                    cardholderName: "Nome como aparece no cartão",
                                    cardholderEmail: "E-mail",
                                    cardNumber: "Número do cartão",
                                    expirationDate: "MM/AA",
                                    securityCode: "CVV",
                                    identificationNumber: "Seu CPF"
                                }
                            },
                            // Traduzindo os labels (o que fica em cima do campo)
                            translation: {
                                "pt-BR": {
                                    "cardPayment": {
                                        "title": "Cartão de crédito ou débito",
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
                            // ==============================================
                            // --- FIM DA CORREÇÃO DE TRADUÇÃO ---
                            // ==============================================
                            visual: { 
                                style: { 
                                    theme: 'dark',
                                    customVariables: {
                                        baseColor: '#1F2937', 
                                        outlinePrimaryColor: '#F97316',
                                        borderRadius: '0.5rem', 
                                        inputBackgroundColor: '#374151', 
                                        formBackgroundColor: 'transparent',
                                        buttonBackgroundColor: '#22C55E', // Botão Verde
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
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('wallet')} className="text-orange-400 hover:text-orange-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Depositar com Cartão</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto">
                    <p className="text-center text-lg text-gray-300 mb-6">Valor do depósito: <span className="font-bold text-orange-400">R$ {depositAmount.toFixed(2).replace('.', ',')}</span></p>
                    
                    {/* Container do Brick (Glassmorphism) */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-lg">
                        
                        {/* 1. O Brick será renderizado aqui */}
                        <div id="cardPaymentBrick_container"></div>
                        
                        {/* 2. Loader (controlado por DOIS estados) */}
                        {(isBrickLoading || isLoading) && (
                            <div className="flex flex-col justify-center items-center h-48 gap-4">
                                <Loader2 className="animate-spin text-orange-400" size={32} />
                                <span className="text-gray-400">
                                    {isLoading ? 'A processar pagamento...' : 'A carregar formulário seguro...'}
                                </span>
                            </div>
                        )}
                        
                        {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}
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
    // --- ESTADOS ---
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);
    // Removi o showEditModal pois você pediu para tirar o botão de editar
    const token = localStorage.getItem('token');
    
    // Estado para Bottom Nav
    const [navTab, setNavTab] = React.useState('profile');

    const handleNavChange = (tabId) => {
        if (tabId === 'profile') return;
        setNavTab(tabId);
        setTimeout(() => {
            if(tabId === 'cart') setPage('cart');
            else setPage(tabId);
        }, 200);
    };

    // --- COMPONENTES VISUAIS INTERNOS ---

    const ProfileHeader = () => (
        <div className="flex flex-col items-center justify-center mb-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative group">
                {/* Avatar com Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative w-28 h-28 rounded-full bg-[#1e293b] border-4 border-[#0f172a] flex items-center justify-center shadow-2xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 uppercase select-none">
                            {user?.name?.charAt(0) || 'U'}
                        </span>
                    </div>
                </div>
                {/* Badge de Verificado */}
                <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-4 border-[#0f172a] shadow-lg">
                    <ShieldCheck size={16} strokeWidth={3} />
                </div>
            </div>
            
            <h2 className="mt-4 text-2xl font-bold text-white capitalize text-center">{user?.name || 'Usuário'}</h2>
            <p className="text-gray-400 text-sm text-center">{user?.email || 'email@exemplo.com'}</p>
        </div>
    );

    const InfoCard = ({ title, children, action, icon: Icon }) => (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                        <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-white text-lg">{title}</h3>
                </div>
                {/* Botão de ação (só aparece se passado via props) */}
                {action && (
                    <button 
                        onClick={action.onClick} 
                        className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                    >
                        <Edit3 size={12} /> {action.label}
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-gray-200 font-medium truncate">{value || 'Não informado'}</p>
            </div>
        </div>
    );

    return (
        <>
            {/* --- MODAL DE SENHA (Agora funcional) --- */}
            {/* Certifique-se que o componente ChangePasswordModal existe no escopo ou import */}
            {typeof ChangePasswordModal !== 'undefined' && (
                <ChangePasswordModal
                    isOpen={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onSave={onAccountUpdate}
                    token={token}
                    user={user}
                />
            )}

            <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col">
                
                {/* HEADER */}
                <header className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 pb-4">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => setPage('home')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Meu Perfil</h1>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-6 pb-36 max-w-lg">
                    
                    {/* CABEÇALHO DO PERFIL (FOTO) */}
                    <ProfileHeader />

                    {/* CARD DADOS PESSOAIS (Sem botão editar) */}
                    <InfoCard title="Dados Pessoais" icon={User}>
                        <InfoRow icon={User} label="Nome Completo" value={user?.name} />
                        <InfoRow icon={Mail} label="E-mail" value={user?.email} />
                        <InfoRow icon={Phone} label="Telefone" value={user?.phone_number} />
                        <InfoRow icon={Calendar} label="Data de Nascimento" value={user?.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : null} />
                        <InfoRow icon={User} label="CPF" value={user?.cpf} />
                    </InfoCard>

                    {/* CARD LOCALIZAÇÃO */}
                    <InfoCard title="Localização" icon={MapPin}>
                        <InfoRow icon={Home} label="Condomínio ID" value={user?.condoId} /> 
                        <InfoRow icon={MapPin} label="Apartamento/Unidade" value={user?.apartment} />
                    </InfoCard>

                    {/* CARD SEGURANÇA */}
                    <InfoCard title="Segurança" icon={ShieldCheck}>
                        <button 
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300">
                                    <KeyRound size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold text-sm">Alterar Senha</p>
                                    <p className="text-gray-500 text-xs">Atualize sua senha de acesso</p>
                                </div>
                            </div>
                            <Edit3 size={16} className="text-gray-500" />
                        </button>
                    </InfoCard>

                    {/* BOTÃO SAIR */}
                    <button 
                        onClick={onLogout}
                        className="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-all active:scale-95"
                    >
                        <LogOut size={20} /> Sair da Conta
                    </button>

                </main>

                {/* --- BOTTOM NAV PREMIUM --- */}
                <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <button 
                            onClick={() => handleNavChange('cart')} 
                            className={`group relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${navTab === 'cart' ? 'bg-orange-500 scale-110 shadow-orange-500/50' : 'bg-[#1e293b] border-4 border-[#0f172a] text-gray-400'}`}
                        >
                            <ShoppingCart size={28} className={navTab === 'cart' ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-md animate-bounce">
                                    {cart.reduce((a,b)=>a+b.quantity,0)}
                                </span>
                            )}
                            <div className={`absolute inset-0 rounded-full blur-xl bg-orange-500/40 -z-10 transition-opacity duration-300 ${navTab === 'cart' ? 'opacity-100' : 'opacity-0'}`}></div>
                        </button>
                    </div>

                    <div className="relative bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-4 h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-between items-end pb-4">
                        <button onClick={() => handleNavChange('home')} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className={`relative p-1 transition-all duration-300 ${navTab === 'home' ? '-translate-y-1' : ''}`}>
                                <Home size={24} className={`transition-colors duration-300 ${navTab === 'home' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                            </div>
                            <span className={`text-[10px] font-bold transition-colors ${navTab === 'home' ? 'text-white' : 'text-gray-500'}`}>Início</span>
                        </button>

                        <button onClick={() => handleNavChange('history')} className="flex-1 flex flex-col items-center gap-1 group mr-6">
                            <div className={`relative p-1 transition-all duration-300 ${navTab === 'history' ? '-translate-y-1' : ''}`}>
                                <History size={24} className={`transition-colors duration-300 ${navTab === 'history' ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                            </div>
                            <span className={`text-[10px] font-bold transition-colors ${navTab === 'history' ? 'text-white' : 'text-gray-500'}`}>Pedidos</span>
                        </button>

                        <div className="w-12"></div>

                        <button onClick={() => handleNavChange('wallet')} className="flex-1 flex flex-col items-center gap-1 group ml-6">
                            <div className={`relative p-1 transition-all duration-300 ${navTab === 'wallet' ? '-translate-y-1' : ''}`}>
                                <Wallet size={24} className={`transition-colors duration-300 ${navTab === 'wallet' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                            </div>
                            <span className={`text-[10px] font-bold transition-colors ${navTab === 'wallet' ? 'text-white' : 'text-gray-500'}`}>Carteira</span>
                        </button>

                        {/* Botão Perfil (ATIVO) */}
                        <button onClick={() => handleNavChange('profile')} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className={`relative p-1 transition-all duration-300 ${navTab === 'profile' ? '-translate-y-1' : ''}`}>
                                <User size={24} className={`transition-colors duration-300 ${navTab === 'profile' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                            </div>
                            <span className={`text-[10px] font-bold transition-colors ${navTab === 'profile' ? 'text-white' : 'text-gray-500'}`}>Perfil</span>
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

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                {/* Cabeçalho Premium */}
                <div className="relative p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Recarregar Carteira
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/20 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Input de Valor Gigante */}
                    <div className="mb-8 text-center relative">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                            Valor do Depósito
                        </label>
                        <div className="relative flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-500 mr-2 absolute left-4 md:left-8 top-1/2 -translate-y-1/2">R$</span>
                            <input 
                                type="number" 
                                value={depositAmount} 
                                onChange={(e) => setDepositAmount(e.target.value)} 
                                placeholder="0,00" 
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-6 text-center text-4xl font-black text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all" 
                                autoFocus 
                            />
                        </div>
                        {formError && <p className="text-red-400 text-xs font-bold mt-2 animate-pulse">{formError}</p>}
                    </div>

                    {/* Valores Rápidos (Pills Modernos) */}
                    <div className="grid grid-cols-5 gap-2 mb-8">
                        {quickValues.map((val) => (
                            <button 
                                key={val} 
                                type="button" 
                                onClick={() => setDepositAmount(val.toString())} 
                                className={`py-2 px-1 rounded-xl text-xs md:text-sm font-bold border transition-all active:scale-95 
                                    ${parseFloat(depositAmount) === val 
                                        ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>

                    {/* Botões de Pagamento Premium */}
                    <div className="space-y-3">
                        {/* Botão PIX */}
                        <button type="button" onClick={(e) => handleAction(e, 'pix')} className="group w-full relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-green-900/20 border border-green-400/20 transition-all active:scale-[0.98]">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <QrCode size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-base leading-none">PIX Instantâneo</p>
                                    <p className="text-[10px] text-green-100 font-medium mt-1 opacity-90">Cai na hora • Sem taxas</p>
                                </div>
                            </div>
                            <div className="bg-white/20 p-1.5 rounded-full relative z-10">
                                <Zap size={16} fill="currentColor" className="text-yellow-300" />
                            </div>
                            {/* Efeito de brilho no hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>

                        {/* Botão Cartão (Em breve) */}
                        <button type="button" onClick={(e) => handleAction(e, 'card')} className="w-full bg-[#0f172a] hover:bg-[#162032] text-gray-300 hover:text-white p-4 rounded-xl flex items-center gap-3 border border-white/10 transition-all active:scale-[0.98] group">
                            <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-blue-400 transition-colors">
                                <CreditCard size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm leading-none group-hover:text-blue-200 transition-colors">Cartão de Crédito</p>
                                <p className="text-[10px] text-gray-500 mt-1">Em breve</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer de Segurança */}
                <div className="bg-black/20 p-3 text-center border-t border-white/5">
                    <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                        <CheckCircle2 size={10} className="text-green-500" /> Ambiente 100% Seguro
                    </p>
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
    
    const BASE_URL = API_URL || 'https://two4hprontobackendcesar.onrender.com';
    const [showBalance, setShowBalance] = React.useState(true);
    const [recentTransactions, setRecentTransactions] = React.useState([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = React.useState(true);
    
    // Modais e Loadings
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
    const [isCreatingDeposit, setIsCreatingDeposit] = React.useState(false); // NOVO: Estado para overlay
    
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
        
        // 1. Inicia o Loading Global (Mostra o overlay)
        setIsCreatingDeposit(true);
        setFormError('');
        
        // 2. Fecha o modal (O overlay vai cobrir a transição)
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
            // Desliga o loading (seja sucesso ou erro)
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
            setShowConfirmationModal(false); if(showToast) showToast("Sucesso!");
            updateUserBalance(); setRecipientEmail(''); setTransferAmount('');
        } catch (err) { setFormError(err.message); setShowConfirmationModal(false); setIsTransferModalOpen(true); } 
        finally { setIsTransferring(false); }
    };

    // Visual Helpers
    const VirtualCard = () => (
        <div className="relative h-52 w-full rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500 group select-none">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#1e293b] to-black"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10 p-6 flex flex-col justify-between h-full border border-white/10 rounded-3xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Saldo Total</p>
                        <div className="flex items-center gap-3">
                            {showBalance ? (
                                <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg tracking-tight">R$ {user?.wallet_balance ? parseFloat(user.wallet_balance).toFixed(2).replace('.', ',') : '0,00'}</h2>
                            ) : <h2 className="text-3xl md:text-4xl font-black text-gray-600 mt-1 tracking-widest">••••••</h2>}
                            <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 hover:text-white transition-colors p-1">{showBalance ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                    </div>
                    <CreditCard className="text-white/30 w-10 h-10" />
                </div>
                <div className="flex justify-between items-end">
                    <div><p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Titular</p><p className="text-gray-300 font-medium text-sm uppercase tracking-wide truncate max-w-[150px]">{user?.name || 'Cliente'}</p></div>
                    <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full border border-white/5"><PiggyBank size={14} className="text-orange-400" /><span className="text-orange-400/80 text-[10px] font-bold tracking-wider">PRONTO WALLET</span></div>
                </div>
            </div>
        </div>
    );

    const ActionTile = ({ icon: Icon, label, color, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 active:scale-95 transition-all duration-300 group shadow-lg">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500 group-hover:text-white transition-all shadow-lg group-hover:shadow-${color}-500/30`}><Icon size={22} /></div>
            <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">{label}</span>
        </button>
    );

    const TransactionItem = ({ tx }) => {
        const isDeposit = tx.type === 'deposit' || tx.type === 'transfer_in';
        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeposit ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{isDeposit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</div>
                    <div><p className="text-gray-200 font-bold text-sm capitalize truncate max-w-[120px]">{tx.description || tx.type.replace(/_/g, ' ')}</p><p className="text-gray-500 text-[10px]">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</p></div>
                </div>
                <span className={`font-bold text-sm ${isDeposit ? 'text-green-400' : 'text-white'}`}>{isDeposit ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}</span>
            </div>
        );
    };

    return (
        <>
            {/* OVERLAY DE CARREGAMENTO GERAL (BLUR E SPINNER) */}
            {isCreatingDeposit && (
                <div className="fixed inset-0 z-[100] bg-[#0f172a]/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative bg-[#1e293b] p-4 rounded-full border border-white/10 shadow-2xl">
                            <Loader2 size={48} className="text-orange-500 animate-spin" />
                        </div>
                    </div>
                    <h2 className="text-white font-bold text-xl mt-6 tracking-tight">Gerando PIX...</h2>
                    <p className="text-gray-400 text-sm mt-1">Aguarde um momento</p>
                </div>
            )}

            <DepositModal isOpen={isDepositModalOpen} onClose={() => { setIsDepositModalOpen(false); setFormError(''); setDepositAmount(''); }} onPix={handleCreatePixDeposit} onCard={() => alert("Em breve!")} depositAmount={depositAmount} setDepositAmount={setDepositAmount} formError={formError} />
            <TransferModal isOpen={isTransferModalOpen} onClose={() => { setIsTransferModalOpen(false); setFormError(''); setRecipientEmail(''); setTransferAmount(''); }} onSubmit={handleVerifyRecipient} recipientEmail={recipientEmail} setRecipientEmail={setRecipientEmail} transferAmount={transferAmount} setTransferAmount={setTransferAmount} formError={formError} isVerifying={isVerifying} />
            <TransferConfirmationModal isOpen={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} onConfirm={handleConfirmTransfer} recipient={recipientDetails} amount={transferAmount} isTransferring={isTransferring} />

            <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col">
                <header className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 pb-4">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => setPage('home')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"><ArrowLeft size={20} /></button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Carteira</h1>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-6 pb-36 max-w-lg">
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700"><VirtualCard /></div>
                    <div className="grid grid-cols-3 gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <ActionTile icon={ArrowDownToLine} label="Depositar" color="green" onClick={() => setIsDepositModalOpen(true)} />
                        <ActionTile icon={ArrowRightLeft} label="Transferir" color="blue" onClick={() => setIsTransferModalOpen(true)} />
                        <ActionTile icon={History} label="Extrato" color="orange" onClick={() => setPage('history')} />
                    </div>
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <div className="flex items-center justify-between mb-4 px-1"><h3 className="text-lg font-bold text-white">Últimas Transações</h3><button onClick={() => setPage('history')} className="text-xs text-orange-400 font-bold hover:text-orange-300 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">Ver completo</button></div>
                        {isLoadingTransactions ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div> : recentTransactions.length > 0 ? <div className="flex flex-col gap-2">{recentTransactions.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}</div> : <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5 border-dashed"><p className="text-gray-500 text-sm">Nenhuma movimentação recente.</p></div>}
                    </div>
                </main>
                <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <button onClick={() => handleNavChange('cart')} className={`group relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${navTab === 'cart' ? 'bg-orange-500 scale-110 shadow-orange-500/50' : 'bg-[#1e293b] border-4 border-[#0f172a] text-gray-400'}`}>
                            <ShoppingCart size={28} className={navTab === 'cart' ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-md animate-bounce">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
                            <div className={`absolute inset-0 rounded-full blur-xl bg-orange-500/40 -z-10 transition-opacity duration-300 ${navTab === 'cart' ? 'opacity-100' : 'opacity-0'}`}></div>
                        </button>
                    </div>
                    <div className="relative bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-4 h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-between items-end pb-4">
                        <button onClick={() => handleNavChange('home')} className="flex-1 flex flex-col items-center gap-1 group"><div className={`relative p-1 transition-all duration-300 ${navTab === 'home' ? '-translate-y-1' : ''}`}><Home size={24} className={`transition-colors duration-300 ${navTab === 'home' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} /><span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span></div><span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'home' ? 'text-white' : 'text-gray-500'}`}>Início</span></button>
                        <button onClick={() => handleNavChange('history')} className="flex-1 flex flex-col items-center gap-1 group mr-6"><div className={`relative p-1 transition-all duration-300 ${navTab === 'history' ? '-translate-y-1' : ''}`}><History size={24} className={`transition-colors duration-300 ${navTab === 'history' ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} /><span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span></div><span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'history' ? 'text-white' : 'text-gray-500'}`}>Pedidos</span></button>
                        <div className="w-12"></div>
                        <button onClick={() => handleNavChange('wallet')} className="flex-1 flex flex-col items-center gap-1 group ml-6"><div className={`relative p-1 transition-all duration-300 ${navTab === 'wallet' ? '-translate-y-1' : ''}`}><Wallet size={24} className={`transition-colors duration-300 ${navTab === 'wallet' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} /><span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span></div><span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'wallet' ? 'text-white' : 'text-gray-500'}`}>Carteira</span></button>
                        <button onClick={() => handleNavChange('profile')} className="flex-1 flex flex-col items-center gap-1 group"><div className={`relative p-1 transition-all duration-300 ${navTab === 'profile' ? '-translate-y-1' : ''}`}><User size={24} className={`transition-colors duration-300 ${navTab === 'profile' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} /><span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span></div><span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'profile' ? 'text-white' : 'text-gray-500'}`}>Perfil</span></button>
                    </div>
                </div>
            </div>
        </>
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

    const KPICard = ({ label, value, icon, color }) => (
        <div className={`p-4 rounded-xl border bg-gray-800/40 backdrop-blur-sm flex items-center gap-4 ${color}`}>
            <div className="p-3 rounded-lg bg-white/5 text-white">{icon}</div>
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white">{value}</p>
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        const styles = { paid: 'text-green-400 bg-green-500/10', pending: 'text-yellow-400 bg-yellow-500/10', failed: 'text-red-400 bg-red-500/10', refunded: 'text-purple-400 bg-purple-500/10' };
        return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles[status]}`}>{status === 'paid' ? 'APROVADO' : status === 'refunded' ? 'ESTORNADO' : status}</span>;
    };

    return (
        <div className="flex flex-col gap-6 pb-20 animate-fade-in px-2 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-black text-white">Vendas</h2>
                    <p className="text-gray-400 text-sm">Registro completo de transações</p>
                </div>
                {/* Paginação Simplificada no Topo */}
                <div className="text-xs text-gray-500 font-mono mt-2 md:mt-0">
                    Total: {meta.totalItems} registros • Página {meta.currentPage} de {meta.totalPages}
                </div>
            </div>

            {/* KPIs Baseados no Filtro Global (Backend) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard 
                    label="Faturamento Total (Filtro)" 
                    value={`R$ ${meta.totalRevenue ? meta.totalRevenue.toFixed(2).replace('.', ',') : '0,00'}`} 
                    icon={<DollarSign size={24}/>} color="border-green-500/30 text-green-400" 
                />
                <KPICard 
                    label="Total de Vendas" 
                    value={meta.totalItems} 
                    icon={<ShoppingCart size={24}/>} color="border-blue-500/30 text-blue-400" 
                />
                <KPICard 
                    label="Ticket Médio" 
                    value={`R$ ${meta.totalItems > 0 ? (meta.totalRevenue / meta.totalItems).toFixed(2).replace('.', ',') : '0,00'}`} 
                    icon={<TrendingUp size={24}/>} color="border-purple-500/30 text-purple-400" 
                />
            </div>

            {/* Filtros */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input name="search" value={filters.search} onChange={handleInputChange} placeholder="Nome, ID..." className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-3 text-white text-sm focus:border-blue-500 outline-none" />
                    </div>
                </div>
                <div className="w-full md:w-auto">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">De</label>
                    <input name="startDate" type="date" value={filters.startDate} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="w-full md:w-auto">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Até</label>
                    <input name="endDate" type="date" value={filters.endDate} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <button onClick={handleApplyFilters} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition h-[38px] flex items-center justify-center gap-2">
                    <Filter size={16} /> Filtrar
                </button>
            </div>

            {/* Tabela */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden min-h-[400px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 text-gray-400 border-b border-gray-700 text-xs uppercase tracking-wider">
                                <th className="p-4 pl-6">Data</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Resumo</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-700/50">
                            {loading ? (
                                <tr><td colSpan="6" className="p-20 text-center"><Loader2 className="animate-spin inline mr-2 text-blue-500" size={24}/> Carregando...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="p-20 text-center text-gray-500 italic">Nenhum registro encontrado.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleOpenDetails(order)}>
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-white">{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                                            <div className="text-xs text-gray-500 font-mono">{new Date(order.created_at).toLocaleTimeString('pt-BR').slice(0,5)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{order.user_name}</div>
                                            <div className="text-xs text-gray-500">{order.condo_name}</div>
                                        </td>
                                        <td className="p-4 text-gray-400 text-xs max-w-[200px] truncate">
                                            {order.product_summary || 'Ver detalhes...'}
                                        </td>
                                        <td className={`p-4 font-bold ${order.status === 'refunded' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                            R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="p-4">{getStatusBadge(order.status)}</td>
                                        <td className="p-4 text-center">
                                            <button className="text-gray-400 hover:text-white"><Eye size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- CONTROLES DE PAGINAÇÃO --- */}
                <div className="p-4 border-t border-gray-700 bg-gray-900/30 flex justify-between items-center">
                    <button 
                        onClick={() => handlePageChange(meta.currentPage - 1)} 
                        disabled={meta.currentPage === 1}
                        className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft size={16} /> Anterior
                    </button>
                    
                    <span className="text-sm text-gray-400 font-medium">
                        Página <span className="text-white font-bold">{meta.currentPage}</span> de {meta.totalPages}
                    </span>

                    <button 
                        onClick={() => handlePageChange(meta.currentPage + 1)} 
                        disabled={meta.currentPage >= meta.totalPages}
                        className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Próximo <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Modal de Detalhes (Igual ao anterior) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">Recibo #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)}><X size={20} className="text-gray-400 hover:text-white"/></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {/* Conteúdo do Modal aqui... (igual ao anterior) */}
                            {loadingItems ? <Loader2 className="animate-spin mx-auto"/> : (
                                <div className="space-y-2">
                                    {orderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                                            <span className="text-gray-300">{item.quantity}x {item.name}</span>
                                            <span className="text-white font-bold">R$ {(item.quantity * item.price_at_purchase).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 text-right">
                                        <span className="text-xl font-black text-green-400">Total: R$ {Number(selectedOrder.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end">
                            {selectedOrder.status === 'paid' && <button onClick={handleRefund} className="text-red-400 text-sm font-bold flex gap-2"><RotateCcw size={16}/> Estornar</button>}
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

    // Componente Card
    const FinanceCard = ({ title, value, subtext, type, icon, onWithdraw }) => {
        const styles = {
            profit: 'from-emerald-900/40 to-emerald-800/20 border-emerald-500/30 text-emerald-400',
            cost: 'from-blue-900/40 to-blue-800/20 border-blue-500/30 text-blue-400',
            wallet: 'from-purple-900/40 to-purple-800/20 border-purple-500/30 text-purple-400'
        };
        const currentStyle = styles[type] || styles.profit;

        return (
            <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${currentStyle} p-6 shadow-xl`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${currentStyle.split(' ').pop()}`}>
                        {icon}
                    </div>
                    {onWithdraw && (
                        <button onClick={onWithdraw} className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-white hover:scale-105">
                            Sacar
                        </button>
                    )}
                </div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black text-white mt-1">
                        R$ {Number(value || 0).toFixed(2).replace('.', ',')}
                    </h3>
                    <p className="text-[10px] text-white/50 mt-2 font-medium">{subtext}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 pb-20 animate-fade-in px-2 md:px-0">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/40 p-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Landmark className="text-orange-500" size={32}/> Caixa Central
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Gestão de Liquidez & Retiradas</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">Patrimônio Líquido Total</p>
                    <p className="text-2xl font-mono font-bold text-white">
                        R$ {((summary?.net_profit || 0) + (summary?.cost_of_goods || 0)).toFixed(2).replace('.', ',')}
                    </p>
                </div>
            </div>

            {/* Cards (Sempre mostram o Total Geral, independente do filtro de data) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinanceCard type="profit" title="Lucro Disponível" value={summary?.net_profit} subtext="Livre para retirada" icon={<TrendingUp size={24}/>} onWithdraw={() => { setWithdrawType('net_profit'); setIsWithdrawModalOpen(true); }} />
                <FinanceCard type="cost" title="Fundo de Reposição" value={summary?.cost_of_goods} subtext="Reservado para estoque" icon={<PiggyBank size={24}/>} onWithdraw={() => { setWithdrawType('cost_of_goods'); setIsWithdrawModalOpen(true); }} />
                <FinanceCard type="wallet" title="Saldo dos Clientes" value={summary?.total_wallet_balance} subtext="Passivo (Carteiras)" icon={<Wallet size={24}/>} />
            </div>

            {/* --- ÁREA DO EXTRATO COM FILTROS --- */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-xl overflow-hidden flex flex-col h-[700px]">
                
                {/* Barra de Filtros */}
                <div className="p-6 border-b border-gray-700/50 bg-gray-900/30 flex flex-col md:flex-row gap-4 items-end justify-between">
                    <div className="flex items-center gap-2">
                        <History className="text-gray-400" size={20}/> 
                        <h3 className="font-bold text-white">Extrato de Movimentações</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                        <div className="flex-1 md:flex-none">
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tipo</label>
                            <select name="type" value={filters.type} onChange={handleFilterChange} className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500 w-full md:w-32">
                                <option value="all">Todos</option>
                                <option value="entrada">Entradas</option>
                                <option value="saida">Saídas</option>
                            </select>
                        </div>
                        <div className="flex-1 md:flex-none">
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">De</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500 w-full" />
                        </div>
                        <div className="flex-1 md:flex-none">
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Até</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-orange-500 w-full" />
                        </div>
                        <button onClick={fetchData} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg mt-auto shadow-lg transition">
                            <Search size={16} />
                        </button>
                    </div>
                </div>
                
                {/* Lista de Movimentos */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-orange-500"/></div>
                    ) : movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                            <AlertCircle size={40} className="opacity-20"/>
                            <p>Nenhuma movimentação neste período.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {movements.map((mov) => {
                                const isEntry = mov.type === 'entrada';
                                let label = 'Saída / Retirada';
                                let iconBg = 'bg-red-500/10 text-red-400';
                                let tagColor = 'border-red-500/30 text-red-400 bg-red-500/10';
                                let tagName = 'CARTEIRA';

                                if (isEntry) {
                                    label = 'Entrada (Depósito)';
                                    iconBg = 'bg-green-500/10 text-green-400';
                                } else if (mov.source_type === 'net_profit') {
                                    label = 'Retirada de Lucro';
                                    iconBg = 'bg-emerald-500/10 text-emerald-400';
                                    tagColor = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
                                    tagName = 'LUCRO';
                                } else if (mov.source_type === 'cost_of_goods') {
                                    label = 'Retirada de Reposição';
                                    iconBg = 'bg-blue-500/10 text-blue-400';
                                    tagColor = 'border-blue-500/30 text-blue-400 bg-blue-500/10';
                                    tagName = 'REPOSIÇÃO';
                                }

                                return (
                                    <div key={`${mov.type}-${mov.id}`} className="flex items-center justify-between p-4 bg-gray-800/40 hover:bg-gray-700/40 rounded-2xl border border-gray-700/30 transition group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${iconBg}`}>
                                                {isEntry ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">{label}</p>
                                                <p className="text-xs text-gray-500">{new Date(mov.created_at).toLocaleString('pt-BR')} • {mov.user_name}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{mov.details}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <p className={`font-mono font-bold text-lg ${isEntry ? 'text-green-400' : 'text-red-400'}`}>
                                                {isEntry ? '+' : '-'} R$ {Math.abs(Number(mov.amount)).toFixed(2).replace('.', ',')}
                                            </p>
                                            {!isEntry && <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${tagColor}`}>{tagName}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL SAQUE --- */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <form onSubmit={handleWithdraw} className="bg-gray-900 w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl overflow-hidden relative">
                         <div className={`p-6 bg-gradient-to-r ${withdrawType === 'net_profit' ? 'from-emerald-900 to-gray-900' : 'from-blue-900 to-gray-900'} border-b border-gray-700`}>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Wallet size={20}/> Realizar Saque</h3>
                            <p className="text-sm text-white/70 mt-1">De: <b className="uppercase">{withdrawType === 'net_profit' ? 'Lucro Líquido' : 'Fundo de Reposição'}</b></p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Valor (R$)</label>
                                <input type="number" step="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 px-4 text-white font-mono text-lg outline-none focus:border-orange-500" placeholder="0,00" />
                                <p className="text-xs text-gray-500 mt-2 text-right">Disponível: R$ {Number(withdrawType === 'net_profit' ? summary?.net_profit : summary?.cost_of_goods).toFixed(2).replace('.', ',')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Motivo</label>
                                <input type="text" required value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-orange-500" placeholder="Ex: Dividendos..." />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3">
                            <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition">Cancelar</button>
                            <button type="submit" disabled={processing} className={`flex-1 py-3 rounded-xl text-white font-bold transition flex items-center justify-center gap-2 ${withdrawType === 'net_profit' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{processing ? <Loader2 className="animate-spin"/> : 'Confirmar'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- MODAL SUCESSO --- */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-gray-900 border border-green-500/30 w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-lg shadow-green-900/40 animate-bounce-slow">
                            <CheckCircle2 size={48} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Saque Confirmado!</h3>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition mt-6">Maravilha!</button>
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
    const [activeTab, setActiveTab] = React.useState('critical'); // critical | validity | history | pending
    
    const [purchaseHistory, setPurchaseHistory] = React.useState([]);
    const [loadingHistory, setLoadingHistory] = React.useState(false);

    // --- NOVO: ESTADOS DE REPOSIÇÕES PENDENTES ---
    const [pendingRestocks, setPendingRestocks] = React.useState([]);

    // --- ESTADOS DO MODO COMPRAS (Fornecedor) ---
    const [isShoppingMode, setIsShoppingMode] = React.useState(false);
    const [shoppingQueue, setShoppingQueue] = React.useState([]);
    const [currentStep, setCurrentStep] = React.useState(0);
    const [priceInput, setPriceInput] = React.useState('');
    const [qtyInput, setQtyInput] = React.useState('');
    const [cart, setCart] = React.useState([]);
    const [showSummary, setShowSummary] = React.useState(false);
    const [isSavingPurchase, setIsSavingPurchase] = React.useState(false);

    // --- NOVO: ESTADOS DO MODO AUDITORIA (Na frente da máquina) ---
    const [isAuditingMode, setIsAuditingMode] = React.useState(false);
    const [currentAuditSession, setCurrentAuditSession] = React.useState(null);
    const [auditStep, setAuditStep] = React.useState(0);
    const [countedQty, setCountedQty] = React.useState('');
    const [auditResults, setAuditResults] = React.useState([]);
    const [showAuditSummary, setShowAuditSummary] = React.useState(false);
    const [isSavingAudit, setIsSavingAudit] = React.useState(false);

    const apiUrl = window.API_URL || 'https://two4hprontobackendcesar.onrender.com';

    // --- FETCH DADOS ---
    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            // 1. Busca Produtos
            const urlProducts = selectedCondoId === 'all' 
                ? `${apiUrl}/api/admin/products` 
                : `${apiUrl}/api/admin/products?condoId=${selectedCondoId}`;
            const resProducts = await fetch(urlProducts, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resProducts.ok) {
                const data = await resProducts.json();
                setProducts(Array.isArray(data) ? data : (data.products || []));
            }

            // 2. Busca Reposições Pendentes (NOVO)
            const urlPending = selectedCondoId === 'all'
                ? `${apiUrl}/api/admin/inventory/pending-restocks`
                : `${apiUrl}/api/admin/inventory/pending-restocks?condoId=${selectedCondoId}`;
            const resPending = await fetch(urlPending, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resPending.ok) setPendingRestocks(await resPending.json());

            // 3. Busca Histórico
            fetchHistory();
        } catch (error) { 
            console.error("Erro ao buscar dados:", error); 
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

    React.useEffect(() => { fetchData(); }, [fetchData]);

    // --- LÓGICA DE FILTROS ---
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

    // =========================================================
    // MODO COMPRAS (Fornecedor)
    // =========================================================
    const startShopping = () => {
        if (criticalItems.length === 0) return alert("Stock saudável! Nada a repor.");
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
        if (isNaN(actualPrice) || isNaN(boughtQty) || boughtQty <= 0) return alert("Informe o preço pago e a quantidade.");

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
            return alert("Nenhum item foi comprado.");
        }
        setIsSavingPurchase(true);
        try {
            const payload = {
                condo_id: selectedCondoId === 'all' ? null : selectedCondoId,
                date: new Date().toISOString().split('T')[0],
                total_spent: cart.reduce((acc, i) => acc + i.totalCost, 0),
                total_savings: cart.reduce((acc, i) => acc + i.savings, 0),
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.boughtQty,
                    new_price: item.boughtPrice 
                }))
            };

            const response = await fetch(`${apiUrl}/api/admin/inventory/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Erro ao gravar compra.");

            alert("Compras gravadas! A aguardar abastecimento físico na máquina.");
            setIsShoppingMode(false);
            fetchData(); 
            setActiveTab('pending'); // Redireciona para a aba de pendentes
        } catch (error) { alert(`Erro: ${error.message}`); } 
        finally { setIsSavingPurchase(false); }
    };

    // =========================================================
    // MODO AUDITORIA / ABASTECIMENTO (Na Máquina)
    // =========================================================
    const startAudit = (session) => {
        if (!session.items || session.items.length === 0) return alert("Sessão vazia.");
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
        
        if (isNaN(counted) || counted < 0) return alert("Insira uma quantidade contada válida.");

        const result = {
            product_id: item.product_id,
            name: item.name,
            image_url: item.image_url,
            expected_qty: parseInt(item.expected_current_stock),
            bought_qty: item.quantity,
            counted_qty: counted
        };

        setAuditResults([...auditResults, result]);

        if (auditStep + 1 < currentAuditSession.items.length) {
            setAuditStep(prev => prev + 1);
            setCountedQty('');
        } else {
            setShowAuditSummary(true);
        }
    };

    const finishAudit = async () => {
        setIsSavingAudit(true);
        try {
            const payload = {
                pending_restock_id: currentAuditSession.id,
                condo_id: currentAuditSession.condo_id,
                items: auditResults
            };

            const response = await fetch(`${apiUrl}/api/admin/inventory/execute-restock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Erro ao finalizar abastecimento.");

            alert("Abastecimento concluído! As inconsistências (se existirem) foram registadas.");
            setIsAuditingMode(false);
            fetchData();
            setActiveTab('history');
        } catch (error) { alert(`Erro: ${error.message}`); } 
        finally { setIsSavingAudit(false); }
    };

    // --- Helpers UI ---
    const getHistoryGroupedByMonth = () => {
        if (!purchaseHistory || purchaseHistory.length === 0) return [];
        const grouped = {};
        purchaseHistory.forEach(item => {
            const dateObj = new Date(item.date || item.created_at);
            if (isNaN(dateObj.getTime())) return;
            const key = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            if (!grouped[key]) grouped[key] = { purchases: [], totalSavings: 0, totalSpent: 0 };
            grouped[key].purchases.push(item);
            grouped[key].totalSavings += parseFloat(item.total_savings || item.totalSavings || 0);
            grouped[key].totalSpent += parseFloat(item.total_spent || item.totalSpent || 0);
        });
        return Object.entries(grouped);
    };

    const getSelectedCondoName = () => {
        if (selectedCondoId === 'all') return 'Todas as Máquinas';
        const condo = condominiums.find(c => c.id === parseInt(selectedCondoId) || c.id === selectedCondoId);
        return condo ? condo.name : 'Máquina Específica';
    };

    // =========================================================
    // RENDER: MODO AUDITORIA (ECRÃ CHEIO)
    // =========================================================
    if (isAuditingMode && currentAuditSession) {
        if (showAuditSummary) {
            const inconsistencies = auditResults.filter(r => r.counted_qty !== r.expected_qty);
            return (
                <div className="fixed inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
                        <div className="mb-6 flex justify-center">
                            <div className="h-20 w-20 rounded-full flex items-center justify-center border-4 border-blue-500 bg-blue-500/20 text-blue-400 shadow-xl">
                                <ClipboardCheck size={40}/>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">Conferência Terminada</h2>
                        
                        <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700 text-left">
                            <p className="text-gray-300 font-bold mb-2 text-center">Resumo da Auditoria:</p>
                            <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
                                <span className="text-gray-400">Total de Itens:</span>
                                <span className="text-white font-bold">{auditResults.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Inconsistências Encontradas:</span>
                                <span className={`font-bold ${inconsistencies.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {inconsistencies.length}
                                </span>
                            </div>
                        </div>

                        {inconsistencies.length > 0 && (
                            <p className="text-xs text-red-400 mb-6 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                As falhas no stock serão registadas na lista de auditoria oculta para futura verificação nas câmaras.
                            </p>
                        )}

                        <button 
                            onClick={finishAudit}
                            disabled={isSavingAudit}
                            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isSavingAudit ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24}/>} 
                            {isSavingAudit ? 'A Injetar no Stock...' : 'Confirmar e Guardar no Stock'}
                        </button>
                    </div>
                </div>
            );
        }

        const item = currentAuditSession.items[auditStep];
        return (
            <div className="fixed inset-0 z-50 bg-[#0f172a] overflow-y-auto">
                <div className="sticky top-0 p-4 md:p-6 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-500 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20"><ClipboardCheck size={24}/></div>
                        <div>
                            <h3 className="text-xl font-black text-white leading-tight">Auditoria e Abastecimento</h3>
                            <p className="text-xs text-blue-400 font-bold uppercase">{currentAuditSession.condo_name || 'Geral'}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAuditingMode(false)} className="bg-white/5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-red-500/20"><X size={20}/></button>
                </div>

                <div className="max-w-xl mx-auto p-4 md:p-8 flex flex-col gap-6">
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((auditStep + 1) / currentAuditSession.items.length) * 100}%` }}></div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-3xl p-1 border border-gray-700 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent z-10 pointer-events-none"></div>
                        <img src={item.image_url || 'https://placehold.co/400'} className="w-full h-60 object-cover rounded-[22px]" alt={item.name}/>
                        <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                            <h2 className="text-2xl font-black text-white mb-1">{item.name}</h2>
                            <p className="text-green-400 font-bold bg-green-500/20 w-fit px-3 py-1 rounded-lg border border-green-500/30">
                                Você trouxe: +{item.quantity} unidades
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-blue-500/30 shadow-lg">
                        <h4 className="text-lg font-bold text-white mb-2 text-center">Quantas unidades ESTÃO NA MÁQUINA AGORA?</h4>
                        <p className="text-xs text-red-400 text-center mb-6 font-bold uppercase tracking-widest bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                            Não conte com as que tem na mão. Apenas as que já lá estavam!
                        </p>
                        
                        <input 
                            type="number"
                            autoFocus
                            value={countedQty}
                            onChange={(e) => setCountedQty(e.target.value)}
                            placeholder="Ex: 2"
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl py-6 px-4 text-center text-4xl font-black text-white focus:border-blue-500 outline-none mb-6 shadow-inner"
                        />

                        <button onClick={handleNextAudit} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                            Registar Contagem <ArrowRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER: MODO COMPRAS (Fornecedor) - MANTIDO
    // =========================================================
    if (isShoppingMode) {
        // ... (O CÓDIGO DO isShoppingMode CONTINUA EXATAMENTE IGUAL AO ANTERIOR)
        // Por brevidade na resposta, a estrutura é a mesma que te enviei antes, 
        // incluindo o showSummary e o handleSkipProduct.
    }

    // =========================================================
    // RENDER: DASHBOARD NORMAL
    // =========================================================
    const historyData = getHistoryGroupedByMonth();

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gray-800/30 p-6 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" size={32}/> Central de Riscos
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">Controle de validade, reposição, e prevenção de perdas.</p>
                </div>
                <div className="w-full md:w-auto bg-gray-900 p-2 rounded-xl border border-gray-700 flex items-center gap-3 shadow-inner">
                    <Store className="text-gray-500 ml-3 shrink-0" size={20}/>
                    <select 
                        onChange={(e) => setSelectedCondoId(e.target.value)} 
                        value={selectedCondoId} 
                        className="bg-transparent border-none text-white focus:ring-0 cursor-pointer font-bold text-sm w-full md:w-56 py-2 pr-4 outline-none"
                    >
                        <option value="all">Geral (Todas as Máquinas)</option>
                        {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-32"><Loader2 className="animate-spin mx-auto text-orange-500" size={48}/></div>
            ) : (
                <>
                    {/* CARDS DE NAVEGAÇÃO - AGORA SÃO 4 CARDS! */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* 1. PARA COMPRAR */}
                        <div onClick={() => setActiveTab('critical')} className={`rounded-3xl p-5 border cursor-pointer transition-all flex flex-col justify-between group ${activeTab === 'critical' ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-orange-500 shadow-lg shadow-orange-500/20 scale-[1.02]' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Para Comprar</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-orange-400">{criticalItems.length}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl shadow-inner ${activeTab === 'critical' ? 'bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}><ShoppingCart size={24}/></div>
                            </div>
                        </div>

                        {/* 2. PENDENTES (A ABASTECER) - NOVO CARD */}
                        <div onClick={() => setActiveTab('pending')} className={`rounded-3xl p-5 border cursor-pointer transition-all flex flex-col justify-between group ${activeTab === 'pending' ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}>
                            <div className="flex justify-between items-start relative">
                                <div>
                                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">A Abastecer</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-blue-400">{pendingRestocks.length}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl shadow-inner ${activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}><Truck size={24}/></div>
                                {pendingRestocks.length > 0 && <span className="absolute -top-2 -right-2 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
                            </div>
                        </div>

                        {/* 3. VALIDADE */}
                        <div onClick={() => setActiveTab('validity')} className={`rounded-3xl p-5 border cursor-pointer transition-all flex flex-col justify-between group ${activeTab === 'validity' ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-red-500 shadow-lg shadow-red-500/20 scale-[1.02]' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Vencendo (30d)</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-red-400">{expiringItems.length}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl shadow-inner ${activeTab === 'validity' ? 'bg-red-500 text-white' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}><Calendar size={24}/></div>
                            </div>
                        </div>

                        {/* 4. HISTÓRICO */}
                        <div onClick={() => setActiveTab('history')} className={`rounded-3xl p-5 border cursor-pointer transition-all flex flex-col justify-between group ${activeTab === 'history' ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500 shadow-lg shadow-green-500/20 scale-[1.02]' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Compras Feitas</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-green-400">{purchaseHistory.length}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl shadow-inner ${activeTab === 'history' ? 'bg-green-500 text-white' : 'bg-gray-700/50 text-gray-400 border border-gray-600'}`}><History size={24}/></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-xl min-h-[400px]">
                        
                        {/* --- NOVO CONTEÚDO: REPOSIÇÕES PENDENTES --- */}
                        {activeTab === 'pending' && (
                            <>
                                <div className="p-6 md:p-8 border-b border-white/5 bg-white/5">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Truck className="text-blue-500"/> Reposições Pendentes</h3>
                                    <p className="text-sm text-gray-400 mt-1">Compras que já foram feitas no fornecedor mas ainda não foram abastecidas fisicamente na máquina.</p>
                                </div>
                                <div className="p-6">
                                    {pendingRestocks.length === 0 ? (
                                        <div className="text-center py-16 bg-gray-900/50 rounded-3xl border border-gray-800">
                                            <ClipboardCheck className="mx-auto text-gray-600 mb-4" size={48}/>
                                            <p className="text-gray-400 font-medium text-lg">Nenhuma reposição pendente no momento.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {pendingRestocks.map(session => (
                                                <div key={session.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col justify-between shadow-lg">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="text-lg font-black text-white">{session.condo_name || 'Geral'}</h4>
                                                                <p className="text-xs text-gray-400 font-mono">{new Date(session.created_at).toLocaleString('pt-BR')}</p>
                                                            </div>
                                                            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-blue-500/20">Em Trânsito</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="bg-gray-900 p-3 rounded-xl border border-gray-700 flex-1">
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Itens Comprados</p>
                                                                <p className="text-lg font-black text-white">{session.items?.length || 0}</p>
                                                            </div>
                                                            <div className="bg-gray-900 p-3 rounded-xl border border-gray-700 flex-1">
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Valor Investido</p>
                                                                <p className="text-lg font-black text-orange-400">R$ {parseFloat(session.total_spent).toFixed(2).replace('.',',')}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => startAudit(session)} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                                                        <ClipboardCheck size={18}/> Iniciar Auditoria e Abastecer
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* As outras abas continuam idênticas aqui em baixo (critical, validity, history) */}
                        {/* MANTÉM OS TEUS activeTab === 'critical' E OUTROS EXACTAMENTE COMO TINHAS */}
                        
                    </div>
                </>
            )}
        </div>
    );
};
// App.js -> SUBSTITUA o seu componente UserManagementPage por este

const UserManagementPage = ({ condominiums, token }) => { 
    const [usersData, setUsersData] = React.useState({ users: [], pagination: {} });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    // --- FETCH ---
    const fetchUsers = React.useCallback(async (page = 1) => {
        setIsLoading(true); setCurrentPage(page);
        try {
            // Nota: Se o backend suportar filtro no endpoint, mude para: `...&search=${searchQuery}`
            const response = await fetch(`${API_URL}/api/admin/users-paginated?page=${page}&limit=10`, { 
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
    }, [token]);

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
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            <UserEditModal 
                user={selectedUser} 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveUser} 
                token={token}
                condominiums={condominiums}
            />
            
            {/* HEADER DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 p-8 shadow-2xl flex flex-col justify-center">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <h2 className="text-3xl font-black text-white relative z-10">Utilizadores</h2>
                    <p className="text-gray-400 mt-1 relative z-10">Gestão de moradores e permissões.</p>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><CheckCircle2 size={28}/></div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Ativos (Pág)</p>
                        <p className="text-2xl font-black text-white">{activeCount}</p>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-red-500/20 rounded-xl text-red-400"><Ban size={28}/></div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Bloqueados (Pág)</p>
                        <p className="text-2xl font-black text-white">{blockedCount}</p>
                    </div>
                </div>
            </div>
            
            {/* BARRA DE PESQUISA */}
            <div className="bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-white/5 flex items-center gap-4 mt-2">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por Nome, CPF ou Email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 pl-12 py-3"
                    />
                </div>
            </div>
            
            {isLoading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={40} /></div> : (
                <>
                    {/* --- VISÃO PC --- */}
                    <div className="hidden md:block bg-gray-900/50 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                                    <th className="p-6">Utilizador</th>
                                    <th className="p-6">CPF</th>
                                    <th className="p-6">Local</th>
                                    <th className="p-6">Saldo</th>
                                    <th className="p-6 text-center">Status</th>
                                    <th className="p-6 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {(user.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{user.name}</span>
                                                    <span className="text-xs text-gray-500">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-gray-400">{user.cpf || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{user.apartment || '-'}</span>
                                                <span className="text-xs text-gray-500">{user.condo_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-bold ${parseFloat(user.wallet_balance) > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                                R$ {parseFloat(user.wallet_balance || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.is_active ? 
                                                <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">ATIVO</span> : 
                                                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto"><Ban size={10}/> BLOQ</span>
                                            }
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleOpenModal(user)} 
                                                className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition-all"
                                                title="Editar Usuário"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center p-12 text-gray-500">Nenhum utilizador encontrado nesta página.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- VISÃO MOBILE --- */}
                    <div className="md:hidden flex flex-col gap-4">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <div key={user.id} className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg relative overflow-hidden">
                                {/* Status Dot */}
                                <div className={`absolute top-5 right-5 h-3 w-3 rounded-full ${user.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>

                                <div className="flex items-center gap-4 mb-5">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl border-2 border-gray-700 shadow-lg">
                                        {(user.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{user.name}</h3>
                                        <p className="text-sm text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Wallet size={10}/> Saldo</p>
                                        <p className="text-lg font-bold text-green-400">R$ {parseFloat(user.wallet_balance || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Building2 size={10}/> Local</p>
                                        <p className="text-sm font-bold text-white truncate">{user.condo_name || '-'}</p>
                                        <p className="text-xs text-gray-400">Apt: {user.apartment || 'N/A'}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleOpenModal(user)} 
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                                >
                                    <Edit size={16} /> Gerenciar Cadastro
                                </button>
                            </div>
                        )) : (
                            <div className="text-center p-8 bg-gray-800/50 rounded-3xl border border-gray-700 border-dashed">
                                <User size={48} className="mx-auto mb-3 opacity-20 text-gray-500" />
                                <p className="text-gray-500">Nenhum utilizador encontrado.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* PAGINAÇÃO */}
                    <div className="mt-4 flex justify-center items-center gap-4 bg-gray-800/50 p-4 rounded-2xl w-fit mx-auto border border-white/5">
                        <button 
                            onClick={() => fetchUsers(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600 text-white disabled:opacity-30 disabled:hover:bg-gray-700 transition"
                        >
                            <ChevronLeft size={20}/>
                        </button>
                        <span className="text-gray-300 font-mono text-sm">Página <strong className="text-white">{currentPage}</strong></span>
                        <button 
                            onClick={() => fetchUsers(currentPage + 1)} 
                            disabled={!usersData.users || usersData.users.length < 10} // Desabilita se vier menos que o limite
                            className="p-2 rounded-lg bg-gray-700 hover:bg-blue-600 text-white disabled:opacity-30 disabled:hover:bg-gray-700 transition"
                        >
                            <ChevronRight size={20}/>
                        </button>
                    </div>
                </>
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
        <div>
            {/* --- BOTÃO "NOVO CONDOMÍNIO" RESTAURADO --- */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestão de Condomínios</h2>
                <button onClick={() => onAddNew()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircle size={20} /> Novo Condomínio
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    {/* --- CABEÇALHOS DA TABELA RESTAURADOS --- */}
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">ID da Geladeira</th>
                            <th className="p-4">Síndico</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {condominiums.map(condo => (
                            <tr key={condo.id} className="border-b border-gray-700">
                                {/* --- DADOS DO CONDOMÍNIO RESTAURADOS --- */}
                                <td className="p-4">{condo.name}</td>
                                <td className="p-4 font-mono">{condo.fridge_id}</td>
                                <td className="p-4">{condo.syndic_name}</td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleRemoteUnlock(condo.fridge_id)} className="text-green-400 hover:text-green-300 p-2" title="Destravar Remotamente">
                                        <KeyRound size={18} />
                                    </button>
                                    <button onClick={() => onEdit(condo)} className="text-blue-400 hover:text-blue-300 p-2" title="Editar">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(condo.id)} className="text-red-400 hover:text-red-300 p-2" title="Apagar">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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



const StockManagement = ({ condominiums, token, API_URL }) => { // Receba API_URL aqui ou defina globalmente
    const BASE_URL = API_URL || 'https://two4hprontobackendcesar.onrender.com';// Fallback se não vier na prop

    // --- ESTADOS ---
    const [selectedCondoId, setSelectedCondoId] = React.useState(condominiums[0]?.id || '');
    const [inventory, setInventory] = React.useState([]); 
    const [inventoryQuantities, setInventoryQuantities] = React.useState({}); 
    const [inventoryDates, setInventoryDates] = React.useState({}); 
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isStockLoading, setIsStockLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false); 
    const [toast, setToast] = React.useState({ show: false, message: '' });
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

    // --- FETCH INVENTORY (BUSCAR DADOS REAIS DO BANCO) ---
    const fetchInventory = React.useCallback(async () => {
        if (selectedCondoId) {
            setIsStockLoading(true);
            try {
                // CORREÇÃO: Agora buscamos do endpoint de INVENTÁRIO, não de produtos gerais.
                // Isso garante que a validade e quantidade venham do banco.
                const response = await fetch(`${BASE_URL}/api/admin/inventory?condoId=${selectedCondoId}`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });

                if (!response.ok) throw new Error('Falha ao buscar estoque.');
                
                const data = await response.json();
                // O backend retorna lista de produtos com campos extras (quantity, nearest_expiration_date)
                const lista = Array.isArray(data) ? data : [];
                setInventory(lista); 
                
                // Mapeia para os estados de edição
                const quantities = {};
                const dates = {};
                
                lista.forEach(item => {
                    quantities[item.id] = item.quantity || 0; 
                    // Formata a data para o input date (YYYY-MM-DD)
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
    
    React.useEffect(() => { fetchInventory(); }, [fetchInventory]);

    // --- HANDLERS ---
    const handleInventoryChange = (productId, quantity) => {
        setInventoryQuantities(prev => ({ ...prev, [productId]: Math.max(0, parseInt(quantity) || 0) }));
    };

    const handleDateChange = (productId, date) => {
        setInventoryDates(prev => ({ ...prev, [productId]: date }));
    };

    // --- SALVAR NO BANCO (CORREÇÃO PRINCIPAL) ---
    const handleSaveAllChanges = async () => {
        if (!selectedCondoId) return;
        setIsSaving(true);

        try {
            // 1. Prepara os dados no formato que o backend (bulkUpdateInventory) espera
            const itemsToSave = inventory.map(product => ({
                product_id: product.id,
                quantity: inventoryQuantities[product.id],
                // Se a data estiver vazia, manda null pro banco não dar erro de formato
                nearest_expiration_date: inventoryDates[product.id] || null 
            }));

            // 2. Envia para o Backend
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

            setToast({ show: true, message: 'Estoque e validades salvos com sucesso!' });
            
            // Recarrega os dados para garantir sincronia
            await fetchInventory();

        } catch (error) {
            console.error("Erro ao salvar:", error);
            setToast({ show: true, message: `Erro: ${error.message}` });
        } finally {
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
            setIsSaving(false);
        }
    };

    // --- FUNÇÃO DE ADICIONAR (VINDA DO MODAL) ---
    const handleAddProductFromModal = (product, qty, date) => {
        const exists = inventory.find(p => p.id === product.id);
        
        if (exists) {
            const currentQty = inventoryQuantities[product.id] || 0;
            const newTotal = currentQty + parseInt(qty);
            
            setInventoryQuantities(prev => ({ ...prev, [product.id]: newTotal }));
            if (date) setInventoryDates(prev => ({ ...prev, [product.id]: date }));
            
            setToast({ show: true, message: `Adicionado +${qty} unidades de ${product.name}!` });
        } else {
            setInventory(prev => [product, ...prev]);
            setInventoryQuantities(prev => ({ ...prev, [product.id]: parseInt(qty) }));
            setInventoryDates(prev => ({ ...prev, [product.id]: date }));
            
            setToast({ show: true, message: `${product.name} adicionado! Clique em SALVAR.` });
        }
        
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleRemoveProduct = async (productId, productName) => {
        if (!window.confirm(`Tem certeza que deseja remover "${productName}" da lista?`)) return;
        
        // Se for remover, podemos remover visualmente e deixar o usuário salvar, 
        // ou chamar uma API de delete imediato. Aqui removemos visualmente e zeramos a qtd.
        setInventory(prev => prev.filter(p => p.id !== productId));
        
        // Opcional: Zerar a quantidade no estado para garantir que se ele salvar, zere no banco
        setInventoryQuantities(prev => ({ ...prev, [productId]: 0 }));

        setToast({ show: true, message: 'Produto removido da lista. Clique em Salvar para confirmar.' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // --- FILTRAGEM NA TELA PRINCIPAL ---
    const filteredInventory = inventory.filter(item => 
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* MODAL NOVO */}
            <AddProductToInventoryModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddProductFromModal}
                token={token}
                productsInInventory={inventory}
            />

            {/* TOAST */}
            {toast.show && (
                <div className="fixed top-24 right-8 bg-green-500 text-white py-3 px-6 rounded-xl shadow-2xl flex items-center gap-3 z-[999] animate-slide-in-right backdrop-blur-md border border-white/20">
                    <CheckCircle2 size={24} /> <span className="font-bold">{toast.message}</span>
                </div>
            )}
            
            {/* HEADER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                            Gestão de Estoque
                        </h2>
                        <p className="text-gray-400 mt-2 font-medium">Controle de entrada e saída por condomínio.</p>
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <button 
                            onClick={() => setIsAddModalOpen(true)} 
                            disabled={!selectedCondoId} 
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-30 shadow-lg shadow-blue-900/20"
                        >
                            <PlusCircle size={20}/> 
                            <span className="hidden md:inline">Adicionar Produto</span>
                            <span className="md:hidden">Adicionar</span>
                        </button>
                        
                        <button 
                            onClick={handleSaveAllChanges} 
                            disabled={isSaving || isStockLoading || !selectedCondoId} 
                            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            <span>Salvar Alterações</span>
                        </button>
                    </div>
                </div>

                {/* FILTROS DA TELA PRINCIPAL */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-white/5">
                    <div className="w-full md:w-1/3 relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-400 transition-colors" size={20} />
                        <select 
                            onChange={(e) => setSelectedCondoId(e.target.value)} 
                            value={selectedCondoId} 
                            className="w-full bg-transparent border-none text-white focus:ring-0 pl-12 py-3 cursor-pointer [&>option]:bg-gray-900 font-medium"
                        >
                            <option value="">Selecione o Condomínio...</option>
                            {condominiums.map(condo => <option key={condo.id} value={condo.id}>{condo.name}</option>)}
                        </select>
                    </div>

                    <div className="w-px bg-white/10 hidden md:block"></div>

                    <div className="w-full md:flex-grow relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-400 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Filtrar lista atual..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={!selectedCondoId}
                            className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 pl-12 py-3 disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>
            
            {/* TABELA DE ESTOQUE */}
            {isStockLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
                    <Loader2 size={48} className="animate-spin text-green-500"/>
                    <p>Carregando dados...</p>
                </div>
            ) : !selectedCondoId ? (
                <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700 border-dashed animate-pulse">
                    <Building2 size={64} className="mx-auto text-gray-600 mb-4"/>
                    <p className="text-gray-400 text-xl font-medium">Selecione um condomínio acima.</p>
                </div>
            ) : (
                <>
                    {/* TABLE DESKTOP */}
                    <div className="hidden md:block bg-gray-900/50 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="p-6 font-semibold">Produto</th>
                                    <th className="p-6 font-semibold w-64 text-center">Quantidade</th>
                                    <th className="p-6 font-semibold w-64 text-center">Validade</th>
                                    <th className="p-6 font-semibold w-24 text-center">Ações</th> 
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                {filteredInventory.map(product => {
                                    const currentQty = inventoryQuantities[product.id] || 0;
                                    const critical = product.critical_stock_level || 5;
                                    
                                    let borderColor = 'border-transparent focus:border-green-500';
                                    let statusLabel = null;

                                    if (currentQty === 0) {
                                        borderColor = 'border-red-500/50 focus:border-red-500';
                                        statusLabel = <span className="text-[10px] text-red-500 font-bold mt-1 flex justify-center items-center gap-1 animate-pulse"><AlertCircle size={10}/> ESGOTADO</span>;
                                    } else if (currentQty <= critical) {
                                        borderColor = 'border-orange-500/50 focus:border-orange-500';
                                        statusLabel = <span className="text-[10px] text-orange-400 font-bold mt-1 flex justify-center items-center gap-1"><AlertTriangle size={10}/> BAIXO</span>;
                                    }

                                    return (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-gray-800 overflow-hidden shadow-inner shrink-0 border border-white/5 relative">
                                                        <img src={product.image_url || 'https://placehold.co/100'} className="h-full w-full object-cover" alt=""/>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-white block text-base">{product.name}</span>
                                                        <span className="text-xs text-gray-500">{product.category || 'Geral'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <input 
                                                        type="number" 
                                                        value={currentQty} 
                                                        onChange={(e) => handleInventoryChange(product.id, e.target.value)} 
                                                        className={`w-24 bg-gray-800/50 border-2 rounded-lg py-2 text-center text-white focus:outline-none focus:ring-0 font-bold text-lg transition-all ${borderColor}`} 
                                                    />
                                                    {statusLabel}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="relative inline-block w-40">
                                                    <input 
                                                        type="date" 
                                                        value={inventoryDates[product.id] || ''} 
                                                        onChange={(e) => handleDateChange(product.id, e.target.value)} 
                                                        className="w-full bg-gray-800/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-green-500 outline-none text-center cursor-pointer" 
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleRemoveProduct(product.id, product.name)} 
                                                    className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
                                                    title="Remover do condomínio"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredInventory.length === 0 && (
                                    <tr><td colSpan="4" className="text-center p-12 text-gray-500">Nenhum produto encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE LIST */}
                    <div className="md:hidden flex flex-col gap-4">
                        {filteredInventory.map(product => (
                            <div key={product.id} className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <img src={product.image_url || 'https://placehold.co/100'} className="h-16 w-16 rounded-2xl object-cover bg-gray-900 shadow-md" alt=""/>
                                        <div>
                                            <h3 className="font-bold text-white text-lg leading-tight">{product.name}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveProduct(product.id, product.name)} className="text-red-400 bg-red-500/10 p-2.5 rounded-xl">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-2xl border border-white/5">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Quantidade</label>
                                        <input 
                                            type="number" 
                                            value={inventoryQuantities[product.id] || 0} 
                                            onChange={(e) => handleInventoryChange(product.id, e.target.value)} 
                                            className="w-full bg-gray-800 py-3 px-3 rounded-xl border border-gray-700 focus:border-green-500 focus:outline-none font-bold text-xl text-center text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Validade</label>
                                        <input 
                                            type="date" 
                                            value={inventoryDates[product.id] || ''} 
                                            onChange={(e) => handleDateChange(product.id, e.target.value)} 
                                            className="w-full bg-gray-800 py-3.5 px-2 rounded-xl border border-gray-700 focus:border-green-500 outline-none text-sm text-gray-300 text-center" 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
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
    const BASE_URL = API_URL || 'https://two4hprontobackendcesar.onrender.com';
    
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
                alert("Despesa registrada e abatida do lucro!");
            } else {
                alert("Erro ao salvar.");
            }
        } catch (err) { alert("Erro de conexão."); }
        finally { setIsSaving(false); }
    };

    // 2. EXCLUIR DESPESA
    const handleDeleteTransaction = async (id) => {
        if(!window.confirm("Remover esta conta? O valor voltará para o lucro.")) return;
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
        if (financeData.transactions.length === 0) return alert("Nada para exportar.");

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
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* CABEÇALHO */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Painel Financeiro
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">Fluxo de caixa inteligente.</p>
                </div>
                <div className="bg-gray-800 p-2 rounded-xl border border-gray-700 flex flex-wrap gap-2 items-center shadow-lg">
                    <select name="period" onChange={handleFilterChange} value={filterInputs.period} className="bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-sm text-white outline-none cursor-pointer">
                        <option value="7days">7 Dias</option>
                        <option value="month">Este Mês</option>
                        <option value="year">Este Ano</option>
                    </select>
                    <button onClick={fetchFinanceData} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition shadow-lg"><Filter size={18}/></button>
                </div>
            </div>

            {isLoading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={48}/></div> : (
                <>
                    {/* KPIS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Receita */}
                        <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={64} className="text-blue-500"/></div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Receita Total</p>
                            <h3 className="text-3xl font-black text-white">R$ {financeData.kpis.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                        </div>

                        {/* Despesas (Sincronizado com o Modal) */}
                        <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown size={64} className="text-red-500"/></div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Saídas Totais</p>
                            <h3 className="text-3xl font-black text-white">R$ {financeData.kpis.expenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                            <p className="text-xs text-red-400 mt-1">Inclui despesas registradas</p>
                        </div>

                        {/* Lucro (Calculado: Receita - Despesas) */}
                        <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 relative overflow-hidden ring-1 ring-green-500/30">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64} className="text-green-500"/></div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Lucro Líquido</p>
                            <h3 className={`text-3xl font-black ${financeData.kpis.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                R$ {financeData.kpis.net_profit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </h3>
                            <div className="mt-2 text-xs text-green-400 font-bold bg-green-500/10 w-fit px-2 py-0.5 rounded">
                                Margem: {financeData.kpis.profit_margin}%
                            </div>
                        </div>

                        {/* Resumo Rápido */}
                        <div className="bg-gray-900 border border-gray-700 p-4 rounded-3xl flex flex-col justify-center gap-3">
                            <button onClick={handleDownloadReport} className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold py-3 rounded-xl border border-gray-600 transition w-full">
                                <Download size={16}/> Baixar Relatório
                            </button>
                            <button onClick={scrollToExtract} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg transition w-full">
                                <TrendingUp size={16}/> Ver Extrato Completo
                            </button>
                        </div>
                    </div>

                    {/* GRÁFICO */}
                    <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChart2 className="text-blue-500"/> Fluxo de Receita</h3>
                        <FinancialChart data={financeData.chart_data} />
                    </div>

                    {/* CONTAS A PAGAR & EXTRATO */}
                    <div ref={extractRef} className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-xl mt-6">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingDown className="text-red-500" size={20}/> Extrato & Despesas
                            </h3>
                            <button onClick={() => { setIsModalOpen(true); setNewTransaction(prev => ({...prev, type: 'expense'})); }} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition font-bold flex items-center gap-1">
                                <PlusCircle size={14}/> Registrar Despesa
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-5">Data</th>
                                        <th className="p-5">Descrição</th>
                                        <th className="p-5">Categoria</th>
                                        <th className="p-5 text-right">Valor</th>
                                        <th className="p-5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                    {financeData.transactions && financeData.transactions.length > 0 ? financeData.transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-5 font-mono text-gray-400">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-5 font-medium text-white flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                {t.description}
                                            </td>
                                            <td className="p-5 text-gray-400">{t.category}</td>
                                            <td className={`p-5 text-right font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                {t.type === 'income' ? '+' : '-'} R$ {parseFloat(t.amount).toFixed(2)}
                                            </td>
                                            <td className="p-5 text-center">
                                                <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-500 hover:text-red-400 p-1 transition"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-10 text-center text-gray-500">Nenhum lançamento no período.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL LANÇAMENTO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
                    <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6">Nova Movimentação</h2>
                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button type="button" onClick={() => setNewTransaction({...newTransaction, type: 'expense'})} className={`py-2 rounded-lg font-bold border ${newTransaction.type === 'expense' ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-900 border-gray-600 text-gray-400'}`}>Despesa (-)</button>
                                <button type="button" onClick={() => setNewTransaction({...newTransaction, type: 'income'})} className={`py-2 rounded-lg font-bold border ${newTransaction.type === 'income' ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-900 border-gray-600 text-gray-400'}`}>Receita (+)</button>
                            </div>
                            
                            <input required type="text" placeholder="Descrição (Ex: Conta de Luz)" value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500"/>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="number" step="0.01" placeholder="Valor (R$)" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500"/>
                                <input required type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500"/>
                            </div>

                            <select value={newTransaction.category} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500">
                                <option value="Outros">Outros</option>
                                <option value="Operacional">Operacional</option>
                                <option value="Fornecedor">Fornecedor</option>
                                <option value="Marketing">Marketing</option>
                            </select>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600">Cancelar</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg">{isSaving ? 'Salvando...' : 'Confirmar'}</button>
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
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-6">{condo ? 'Editar' : 'Novo'} Condomínio</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Condomínio" className="bg-gray-700 p-2 rounded-md md:col-span-2" required />
                    <input name="fridge_id" value={formData.fridge_id || ''} onChange={handleChange} placeholder="ID da Geladeira (Ex: SF001)" className="bg-gray-700 p-2 rounded-md" required />
                    <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Endereço" className="bg-gray-700 p-2 rounded-md" />
                    <input name="syndic_name" value={formData.syndic_name || ''} onChange={handleChange} placeholder="Nome do Síndico" className="bg-gray-700 p-2 rounded-md" />
                    <input name="syndic_contact" value={formData.syndic_contact || ''} onChange={handleChange} placeholder="Contacto do Síndico" className="bg-gray-700 p-2 rounded-md" />
                    <input name="syndic_profit_percentage" type="number" step="0.01" value={formData.syndic_profit_percentage || ''} onChange={handleChange} placeholder="% Lucro Síndico" className="bg-gray-700 p-2 rounded-md" />
                    <input name="initial_investment" type="number" step="0.01" value={formData.initial_investment || ''} onChange={handleChange} placeholder="Investimento Inicial" className="bg-gray-700 p-2 rounded-md" />
                    <input name="monthly_fixed_cost" type="number" step="0.01" value={formData.monthly_fixed_cost || ''} onChange={handleChange} placeholder="Custo Fixo Mensal" className="bg-gray-700 p-2 rounded-md md:col-span-2" />
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded-md">Cancelar</button>
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 py-2 px-4 rounded-md">Salvar</button>
                    </div>
                </form>
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
                const url = new URL('https://two4hprontobackendcesar.onrender.com/api/admin/dashboard/expiring-products'); // Ajuste sua URL base se necessário
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

    if (loading) return <div className="h-24 flex items-center justify-center text-xs text-gray-500">Carregando alertas...</div>;

    if (products.length === 0) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-green-500/20 p-2 rounded-full">
                    <CheckCircle2 size={24} className="text-green-500" />
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">Tudo em dia!</h4>
                    <p className="text-gray-400 text-xs">Nenhum produto próximo do vencimento (30 dias).</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {products.map((item) => {
                const daysLeft = getDaysRemaining(item.expiry_date);
                const isCritical = daysLeft <= 5; // 5 dias ou menos é crítico
                
                return (
                    <div key={item.id} className="bg-gray-700/30 border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-700/50 transition">
                        {/* Imagem */}
                        <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                             {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">IMG</div>
                            )}
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                            <h5 className="text-white text-xs font-bold truncate">{item.name}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <MapPin size={10} /> {item.condo_name}
                                </span>
                                <span className="text-[10px] text-gray-500">• {item.quantity} un.</span>
                            </div>
                        </div>

                        {/* Badge de Data */}
                        <div className={`text-right px-2 py-1 rounded-lg border ${isCritical ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                            <div className={`text-xs font-bold flex items-center gap-1 justify-end ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                                <CalendarDays size={12} />
                                {new Date(item.expiry_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                            </div>
                            <span className={`text-[9px] font-medium ${isCritical ? 'text-red-500/70' : 'text-yellow-500/70'}`}>
                                {daysLeft < 0 ? 'Vencido' : daysLeft === 0 ? 'Vence Hoje' : `Vence em ${daysLeft} dias`}
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
    // --- CORREÇÃO DE NOMES ---
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
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-0 shadow-xl border border-gray-700 group h-full">
            
            {/* Cabeçalho */}
            <div className="p-5 pb-2 border-b border-gray-700/50 flex justify-between items-start">
                <div>
                    <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Layers size={14} className="text-blue-400"/> Patrimônio em Estoque
                    </h4>
                    <p className="text-2xl font-black text-white mt-1">
                        R$ {saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">Valor total de venda</p>
                </div>
                
                {/* Só exibe a badge se houver contagem de itens vindo do backend */}
                {items > 0 && (
                    <div className="text-right">
                        <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs font-bold">
                            {items} Itens
                        </span>
                    </div>
                )}
            </div>

            {/* Corpo com Detalhes Financeiros */}
            <div className="p-5 pt-3 space-y-3">
                
                {/* Linha de Custo */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                        Investimento (Custo)
                    </div>
                    <span className="font-semibold text-gray-300">
                         R$ {costValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Linha de Lucro (Destaque) */}
                <div className="flex justify-between items-center text-sm bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                    <div className="flex items-center gap-2 text-green-400 font-bold">
                        <TrendingUp size={14} />
                        Lucro Potencial
                    </div>
                    <div className="text-right">
                        <span className="block font-bold text-green-400">
                             R$ {profitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-green-500/70 block">
                            Margem: {margin}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Barra Visual de Progresso */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700 flex">
                {/* Parte Vermelha = Custo */}
                <div 
                    className="h-full bg-red-500/50" 
                    style={{ width: `${saleValue > 0 ? (costValue / saleValue) * 100 : 0}%` }}
                ></div>
                {/* Parte Verde = Lucro */}
                <div 
                    className="h-full bg-green-500" 
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
    const BASE_URL = API_URL || 'https://two4hprontobackendcesar.onrender.com';

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

    if (isLoading && !stats) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={64}/></div>;

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in px-2 md:px-0">
            
            <EmergencyUnlockModal 
                isOpen={isUnlockModalOpen}
                onClose={() => setIsUnlockModalOpen(false)}
                onConfirm={handleConfirmUnlock}
                condoName={targetUnlockCondo?.name}
                isUnlocking={isUnlocking}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/40 p-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Visão Geral</h2>
                    <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Pronto24h • Painel Administrativo</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <WifiOff size={20} /> <span className="font-semibold">Erro: {error}</span>
                    <button onClick={() => fetchStats()} className="ml-auto bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded text-sm transition">Reconectar</button>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="w-full lg:w-1/4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block tracking-wider ml-1">Unidade</label>
                        <div className="relative group">
                            <Building2 className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 pl-10 pr-3 text-white text-sm focus:border-orange-500 outline-none appearance-none cursor-pointer">
                                <option value="all">Todas as Unidades</option>
                                {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block tracking-wider ml-1">De</label>
                        <input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 px-3 text-white text-sm focus:border-orange-500 outline-none" />
                    </div>
                    <div className="w-full lg:w-1/4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block tracking-wider ml-1">Até</label>
                        <input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 px-3 text-white text-sm focus:border-orange-500 outline-none" />
                    </div>
                    <div className="w-full lg:w-1/4 flex gap-2 h-10">
                        <button onClick={handleApplyFilters} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2 text-sm active:scale-95"><Filter size={16} /> Aplicar Filtros</button>
                        <button onClick={() => fetchStats(true)} className="w-10 bg-gray-700 hover:bg-gray-600 text-white rounded-xl flex justify-center items-center border border-gray-600"><RefreshCw size={18} className={isRefreshing ? "animate-spin text-orange-400" : ""} /></button>
                    </div>
                </div>
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ModernStatCard icon={<DollarSign size={24} />} label="Faturamento Bruto" value={`R$ ${(stats?.revenue_today || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} subValue="Vendas totais no período" colorName="green" />
                <ModernStatCard icon={<PiggyBank size={24} />} label="Lucro Líquido" value={`R$ ${(stats?.net_profit_today || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} subValue="Após desconto de custos" colorName="blue" />
                <ModernStatCard icon={<Ticket size={24} />} label="Ticket Médio" value={`R$ ${ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} subValue="Gasto médio por cliente" colorName="purple" />
                <ModernStatCard icon={<ShoppingCart size={24} />} label="Volume de Pedidos" value={stats?.orders_today || 0} subValue="Transações finalizadas" colorName="orange" />
            </div>

            {/* Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-white/5">
                        {/* ADICIONADO: condoId agora é passado para este widget também */}
                        <LatestOrdersWidget 
                            token={token} 
                            condominiums={condominiums} 
                            condoId={filterInputs.condoId} 
                        />
                    </div>
                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="text-yellow-500" size={20} />
                            <h3 className="font-bold text-white">Campeões de Venda</h3>
                        </div>
                        <SalesPerformanceWidget title="" data={stats?.top_sellers || []} type="top" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                            <Activity size={16} className="text-orange-500" /> Centro de Comando
                        </h3>
                        <div className="space-y-3">
                            <button onClick={initiateUnlock} disabled={isUnlocking} className={`w-full py-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg ${filterInputs.condoId === 'all' ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-400 hover:text-red-300'}`}>
                                {isUnlocking ? <Loader2 className="animate-spin" size={20}/> : <Lock size={20}/>} {filterInputs.condoId === 'all' ? 'Selecione uma Unidade' : 'ABRIR PORTA (EMERGÊNCIA)'}
                            </button>
                            <button onClick={() => setActiveTab('products')} className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm font-semibold">
                                <PlusCircle size={18} /> Adicionar Produto
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-lg">
                        <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500"/> Atenção Necessária</h3>
                        {/* ADICIONADO: condoId passado para filtrar os alertas */}
                        <ExpiringSoonWidget 
                            token={token} 
                            condominiums={condominiums} 
                            condoId={filterInputs.condoId}
                        />
                    </div>
                    
                    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-lg">
                         {/* ESTE WIDGET DEVE LER 'total_inventory_cost' */}
                         <InventoryValueWidget data={stats?.inventory_value || {}} />
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

// App.js -> SUBSTITUA o seu componente AdminDashboard por este

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

const ProductManager = React.memo(({ token, API_URL }) => {
    // GARANTIA: Se a prop API_URL não vier, tenta usar uma string fixa ou alertar erro
    const BASE_URL = API_URL || "https://two4hprontobackendcesar.onrender.com"; 
    
    // --- ESTADOS ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros e Paginação
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', category: '', purchase_price: '', sale_price: '', 
        promotional_price: '', promotion_start_date: '', promotion_end_date: '', 
        critical_stock_level: 5, image_url: '', global_stock: 0 
    });
    
    // Estado auxiliar para "Nova Categoria" no select
    const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);

    // --- HELPER: Formatação ---
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // --- EFEITOS ---

    // 1. Busca Inicial
    useEffect(() => {
        const fetchProducts = async () => {
            if (!token) return;
            setLoading(true);
            try {
                // Usa BASE_URL aqui
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

    // 2. Debounce da Busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== debouncedSearch) {
                setDebouncedSearch(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedSearch]);

    // 3. Resetar página
    useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterCategory]);

    // --- MEMOIZATION ---
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = (product.name || '').toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesCategory = filterCategory === 'all' || !filterCategory || product.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, debouncedSearch, filterCategory]);

    const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

    const { currentItems, totalPages } = useMemo(() => {
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
            // Usa BASE_URL aqui também
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
        <div className="flex flex-col gap-6 pb-10 text-gray-200">
            {/* CABEÇALHO */}
            <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Catálogo</h2>
                        <p className="text-gray-400 text-sm">Gerenciamento inteligente de estoque</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-900/40 transition-all transform hover:scale-[1.02] active:scale-95">
                        <Plus size={20} /> Novo Produto
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar produto..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-950/50 border border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <div className="w-full md:w-64 relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-gray-950/50 border border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange-500 outline-none appearance-none cursor-pointer">
                            <option value="all">Todas Categorias</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-orange-500 gap-3">
                    <Loader2 className="animate-spin" size={48}/>
                    <span className="text-gray-500 text-sm animate-pulse">Carregando catálogo...</span>
                </div>
            ) : (
                <>
                    <div className="hidden md:block bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-950/50 text-gray-400 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-5 font-bold">Produto</th>
                                    <th className="p-5 font-bold">Categoria</th>
                                    <th className="p-5 font-bold">Preço</th>
                                    <th className="p-5 font-bold text-center">Status</th>
                                    <th className="p-5 font-bold text-center">Estoque</th>
                                    <th className="p-5 font-bold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-sm">
                                {currentItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-800/50 transition-colors group">
                                        <td className="p-5 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                                                {item.image_url ? 
                                                    <img src={item.image_url} className="h-full w-full object-cover" alt={item.name}/> : 
                                                    <Package className="text-gray-600" size={24}/>
                                                }
                                            </div>
                                            <span className="font-semibold text-gray-200 group-hover:text-orange-400 transition-colors">{item.name}</span>
                                        </td>
                                        <td className="p-5 text-gray-400"><span className="bg-gray-800 px-2 py-1 rounded-lg text-xs border border-gray-700">{item.category}</span></td>
                                        <td className="p-5">
                                            {isPromoActive(item) ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 line-through">{formatCurrency(item.sale_price)}</span>
                                                    <span className="text-green-400 font-bold">{formatCurrency(item.promotional_price)}</span>
                                                </div>
                                            ) : <span className="font-medium">{formatCurrency(item.sale_price)}</span>}
                                        </td>
                                        <td className="p-5 text-center">
                                            {isPromoActive(item) && 
                                                <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                                                    <Calendar size={10}/> Promo
                                                </span>
                                            }
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`font-bold px-3 py-1 rounded-full text-xs ${item.global_stock <= item.critical_stock_level ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-800 text-white'}`}>
                                                {item.global_stock} un
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(item)} className="p-2 bg-gray-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg text-gray-400 transition-all"><Edit size={16}/></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-gray-800 hover:bg-red-600/20 hover:text-red-400 rounded-lg text-gray-400 transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE */}
                    <div className="md:hidden grid gap-4">
                        {currentItems.map(item => (
                            <div key={item.id} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-lg flex gap-4 relative overflow-hidden active:scale-[0.98] transition-transform">
                                {isPromoActive(item) && <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-bl-xl shadow-lg z-10">OFERTA</div>}
                                
                                <div className="h-24 w-24 rounded-xl bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-700">
                                    {item.image_url ? <img src={item.image_url} className="h-full w-full object-cover" alt=""/> : <div className="h-full w-full flex items-center justify-center text-gray-600"><Package size={32}/></div>}
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                    <div>
                                        <h3 className="font-bold text-gray-100 line-clamp-1 text-lg">{item.name}</h3>
                                        <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.global_stock <= item.critical_stock_level ? 'border-red-900 text-red-400 bg-red-900/10' : 'border-gray-700 text-gray-400 bg-gray-800'}`}>Estoque: {item.global_stock}</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div>
                                            {isPromoActive(item) ? (
                                                <>
                                                    <span className="text-xs text-gray-600 line-through block">{formatCurrency(item.sale_price)}</span>
                                                    <div className="text-green-400 font-bold text-lg">{formatCurrency(item.promotional_price)}</div>
                                                </>
                                            ) : <div className="text-white font-bold text-lg">{formatCurrency(item.sale_price)}</div>}
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleOpenModal(item)} className="text-gray-400 hover:text-blue-400"><Edit size={20}/></button>
                                            <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={20}/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINAÇÃO */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition shadow-lg"><ChevronLeft size={20}/></button>
                            <span className="text-gray-500 font-medium text-sm">Página <span className="text-white font-bold">{currentPage}</span> de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition shadow-lg"><ChevronRight size={20}/></button>
                        </div>
                    )}
                </>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 w-full max-w-2xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950/50">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {editingProduct ? <Edit size={20} className="text-blue-400"/> : <Plus size={20} className="text-orange-400"/>}
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-800 transition"><X className="text-gray-400 hover:text-white" size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome do Produto</label>
                                    <input required placeholder="Ex: Vinho Tinto Malbec..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-950/50 border border-gray-700 focus:border-orange-500 rounded-xl p-3.5 text-white outline-none transition-all"/>
                                </div>
                                
                                {/* SELEÇÃO DE CATEGORIA */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</label>
                                    {isNewCategoryMode ? (
                                        <div className="flex gap-2">
                                            <input 
                                                autoFocus
                                                required 
                                                placeholder="Digite a nova categoria" 
                                                value={formData.category} 
                                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                                className="w-full bg-gray-950/50 border border-gray-700 focus:border-orange-500 rounded-xl p-3.5 text-white outline-none transition-all"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => { setIsNewCategoryMode(false); setFormData({...formData, category: ''}) }}
                                                className="px-3 bg-gray-800 rounded-xl border border-gray-700 text-gray-400 hover:text-white"
                                            >
                                                <X size={18}/>
                                            </button>
                                        </div>
                                    ) : (
                                        <select 
                                            required 
                                            value={categories.includes(formData.category) ? formData.category : (formData.category ? 'manual' : '')} 
                                            onChange={(e) => {
                                                if (e.target.value === 'new_cat') {
                                                    setIsNewCategoryMode(true);
                                                    setFormData({...formData, category: ''});
                                                } else {
                                                    setFormData({...formData, category: e.target.value});
                                                }
                                            }} 
                                            className="w-full bg-gray-950/50 border border-gray-700 rounded-xl p-3.5 text-white focus:border-orange-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Selecione...</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="new_cat" className="text-orange-400 font-bold">+ Nova Categoria...</option>
                                        </select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estoque Atual / Mínimo</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Atual" value={formData.global_stock} onChange={e => setFormData({...formData, global_stock: Number(e.target.value)})} className="w-1/2 bg-gray-950/50 border border-gray-700 focus:border-blue-500 rounded-xl p-3.5 text-white outline-none"/>
                                        <input type="number" placeholder="Mín" value={formData.critical_stock_level} onChange={e => setFormData({...formData, critical_stock_level: Number(e.target.value)})} className="w-1/2 bg-gray-950/50 border border-gray-700 focus:border-red-500 text-red-300 rounded-xl p-3.5 outline-none"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><DollarSign size={12}/> Custo (R$)</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} className="w-full bg-gray-950/50 border border-gray-700 focus:border-gray-500 rounded-xl p-3.5 text-white outline-none transition-all"/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1"><DollarSign size={12}/> Venda (R$)</label>
                                    <input required type="number" step="0.01" placeholder="0.00" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full bg-gray-950/50 border border-gray-700 focus:border-green-500 rounded-xl p-3.5 text-white outline-none transition-all font-bold"/>
                                </div>
                            </div>
                            <div className="bg-gray-800/30 p-5 rounded-2xl border border-gray-800/50 space-y-4">
                                <h4 className="text-sm font-bold text-orange-400 flex items-center gap-2"><Calendar size={16}/> Configurar Promoção</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Preço Promo</label>
                                        <input type="number" step="0.01" placeholder="0.00" value={formData.promotional_price} onChange={e => setFormData({...formData, promotional_price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-xl p-3 text-white outline-none"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Início</label>
                                        <input type="date" value={formData.promotion_start_date} onChange={e => setFormData({...formData, promotion_start_date: e.target.value})} className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-xl p-3 text-white outline-none"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Fim</label>
                                        <input type="date" value={formData.promotion_end_date} onChange={e => setFormData({...formData, promotion_end_date: e.target.value})} className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 rounded-xl p-3 text-white outline-none"/>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL da Imagem</label>
                                <input placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-gray-950/50 border border-gray-700 focus:border-orange-500 rounded-xl p-3.5 text-white outline-none transition-all"/>
                            </div>
                        </form>
                        <div className="p-6 bg-gray-950/50 border-t border-gray-800 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-gray-400 font-bold hover:bg-gray-800 transition">Cancelar</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-wait">
                                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                                {isSaving ? 'Salvando...' : 'Salvar Produto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
    
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
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Gestão de Condomínios</h2>
                    <button onClick={() => onAddNew()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <PlusCircle size={20} /> Novo Condomínio
                    </button>
                </div>
                {isLoading && activeTab === 'condominiums' ? <Loader2 className="animate-spin" /> : (
                    <div className="bg-gray-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="p-4">Nome</th>
                                    <th className="p-4">ID da Geladeira</th>
                                    <th className="p-4">Nº de Usuários</th>
                                    <th className="p-4">Itens em Estoque</th>
                                    <th className="p-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {condominiums.map(condo => (
                                    <tr key={condo.id} className="border-b border-gray-700">
                                        <td className="p-4">{condo.name}</td>
                                        <td className="p-4 font-mono">{condo.fridge_id}</td>
                                        <td className="p-4 text-center">{condo.user_count}</td>
                                        <td className="p-4 text-center">{condo.item_count}</td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => handleRemoteUnlock(condo.fridge_id)} className="text-green-400 hover:text-green-300 p-2" title="Destravar Remotamente">
                                                <KeyRound size={18} />
                                            </button>
                                            <button onClick={() => onEdit(condo)} className="text-blue-400 hover:text-blue-300 p-2" title="Editar">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => onDelete(condo.id)} className="text-red-400 hover:text-red-300 p-2" title="Apagar">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };


    // --- ESTADO DO RELÓGIO (Adicione isso junto com seus outros useStates) ---
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- CONTEÚDO MEMORIZADO (Correção: useMemo) ---
    const content = React.useMemo(() => {
        const isMainLoading = (isLoading && (products.length === 0 || condominiums.length === 0));
        
        if (isMainLoading) {
            return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>;
        }
        
        if (error) {
            return <div className="text-red-400 bg-red-900/20 p-4 rounded-lg">Erro: {error}</div>;
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
            default: return <div>Selecione uma opção</div>;
        }
    }, [activeTab, token, products, condominiums, isLoading, error]);

    // Função para fechar o menu ao clicar num link (mobile)
    const handleNavClick = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
            <CondoModal isOpen={isCondoModalOpen} onClose={handleCloseCondoModal} onSave={handleSaveCondo} condo={currentCondo} />
            <ProductModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} onSave={handleSaveProduct} product={currentProduct} />
            
{/* --- HEADER MOBILE (Estático / No Fluxo) --- */}
            <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-md p-5 flex justify-between items-center border-b border-white/5 shadow-2xl z-20 shrink-0 h-20 w-full relative">
                
                {/* Logo */}
                <div className="flex items-center pl-2">
                    <img 
                        src="https://i.imgur.com/LCoZwuM.png" 
                        alt="Pronto24h" 
                        className="h-12,1 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                    />
                </div>

                {/* Relógio e Menu */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">BRASÍLIA</span>
                        <div className="font-mono flex items-baseline gap-1 text-white">
                            <span className="text-xl font-black tracking-widest">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-xs font-bold text-orange-500 animate-pulse">
                                :{currentTime.toLocaleTimeString([], { second: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className="text-white p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all border border-white/10 bg-gray-800/50"
                    >
                        {isMobileMenuOpen ? <X size={26} className="text-red-400" /> : <Menu size={26} className="text-orange-500" />}
                    </button>
                </div>
            </div>

            {/* --- OVERLAY PARA MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}
            
            {/* --- SIDEBAR RESPONSIVA --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-[#0f172a] flex flex-col shrink-0 border-r border-white/5 shadow-2xl
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:block
            `}>
                {/* Efeito de Fundo (Glow) */}
                <div className="absolute top-0 left-0 w-full h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

                {/* --- LOGO --- */}
                <div className="p-8 flex justify-center items-center relative z-10 border-b border-white/5">
                    <img 
                        src="https://i.imgur.com/LCoZwuM.png" 
                        alt="Pronto24h" 
                        className="h-12,1 object-contain transition-transform hover:scale-105 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    />
                </div>
                
                {/* --- NAVEGAÇÃO ORGANIZADA --- */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-6 relative z-10">
                    
                    {/* GRUPO 1: VISÃO GERAL */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 pl-3">Visão Geral</h3>
                        <div className="space-y-1">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                { id: 'sales', label: 'Entradas e Vendas', icon: DollarSign },
                                { id: 'central-cashier', label: 'Caixa Central', icon: PiggyBank },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 relative overflow-hidden group
                                    ${activeTab === item.id 
                                        ? 'bg-gradient-to-r from-orange-500/10 to-transparent text-white border-l-2 border-orange-500 shadow-[inset_10px_0_20px_-10px_rgba(249,115,22,0.1)]' 
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                    {activeTab === item.id && <ChevronRight size={16} className="text-orange-500 animate-fade-in" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GRUPO 2: ESTOQUE */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 pl-3">Inventário</h3>
                        <div className="space-y-1">
                            {[
                                { id: 'products', label: 'Catálogo Produtos', icon: Package },
                                { id: 'stock', label: 'Estoque Geral', icon: ShoppingCart },
                                { id: 'critical-stock', label: 'Validade / Críticos', icon: AlertTriangle },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 relative overflow-hidden group
                                    ${activeTab === item.id 
                                        ? 'bg-gradient-to-r from-orange-500/10 to-transparent text-white border-l-2 border-orange-500' 
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* GRUPO 3: ADMINISTRAÇÃO */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 pl-3">Admin</h3>
                        <div className="space-y-1">
                            {[
                                { id: 'condominiums', label: 'Condomínios', icon: Building2 },
                                { id: 'users', label: 'Utilizadores', icon: UsersIcon },
                                { id: 'finance', label: 'Relatórios', icon: BarChart },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 relative overflow-hidden group
                                    ${activeTab === item.id 
                                        ? 'bg-gradient-to-r from-orange-500/10 to-transparent text-white border-l-2 border-orange-500' 
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
                
                {/* FOOTER SAIR */}
                <div className="mt-4 p-4 border-t border-white/5 bg-[#0f172a] relative z-10">
                    <button onClick={onLogout} className="flex items-center w-full gap-3 p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group">
                        <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-red-500/20 transition-colors">
                            <LogOut size={20} />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-bold block">Sair</span>
                            <span className="text-[10px] text-gray-600 block">Encerrar sessão</span>
                        </div>
                    </button>
                </div>
            </aside>
            
            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
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

    // --- Lógica de Navegação com Delay (Para a animação da luzinha funcionar antes de trocar) ---
    const handleNavChange = (tabId) => {
        if (tabId === 'history') return; // Já estamos aqui
        
        setNavTab(tabId); // Move a luzinha
        
        // Espera 200ms para a animação começar antes de trocar a tela efetivamente
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

    // === COMPONENTES VISUAIS INTERNOS ===

    // 1. Item de Compra (Premium Glass)
    const PurchaseItem = ({ tx }) => (
        <div 
            onClick={() => openReceiptModal(tx.id)} 
            className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/30 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-gray-800 shadow-lg group-hover:shadow-orange-500/20 transition-all">
                <img 
                    src={tx.items[0].image_url || 'https://placehold.co/100x100/374151/ffffff?text=Prod'}
                    alt={tx.items[0].product_name}
                    className="w-full h-full object-cover"
                />
                {tx.items.length > 1 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-white font-bold text-xs">+{tx.items.length - 1}</span>
                    </div>
                )}
            </div>

            <div className="flex-grow min-w-0 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-100 text-base md:text-lg truncate pr-2 group-hover:text-white transition-colors">
                            {tx.items.length === 1 ? tx.items[0].product_name : `Compra com ${tx.items.length} itens`}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <Calendar size={12} />
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')} às {new Date(tx.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-lg text-white group-hover:text-orange-400 transition-colors">
                            -R$ {parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                        </p>
                        <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/5">
                            Débito
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // 2. Item de Carteira (Premium Glass)
    const WalletActivityItem = ({ tx }) => {
        const isDeposit = tx.type === 'deposit' || tx.type === 'transfer_in';
        const colorClass = isDeposit ? 'text-green-400' : 'text-red-400';
        const bgIconClass = isDeposit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';

        return (
            <div 
                onClick={() => openReceiptModal(tx.id)} 
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
                <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${bgIconClass} shadow-lg transition-transform group-hover:scale-110`}>
                    <div className={colorClass}>
                        {React.cloneElement(getTransactionIcon(tx.type), { size: 24 })}
                    </div>
                </div>
                
                <div className="flex-grow min-w-0 flex justify-between items-center gap-4 relative z-10">
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-100 text-base truncate group-hover:text-white transition-colors">{tx.description}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')} • {new Date(tx.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`font-black text-lg ${colorClass}`}>
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
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-orange-200 uppercase tracking-widest mb-1">Total Gasto (Pág.)</p>
                                <h2 className="text-4xl font-black text-white drop-shadow-lg">
                                    R$ <span className="text-orange-400">{summary.totalPurchases.toFixed(2).replace('.', ',')}</span>
                                </h2>
                            </div>
                            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/40 transform rotate-3">
                                <ShoppingBag size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-5 rounded-3xl relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-500/20 rounded-full blur-[30px]"></div>
                    <p className="text-xs font-bold text-green-200 uppercase tracking-widest mb-2 flex items-center gap-1"><TrendingUp size={14}/> Entradas</p>
                    <p className="text-2xl font-black text-white">R$ {summary.totalWalletIn.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 p-5 rounded-3xl relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/20 rounded-full blur-[30px]"></div>
                    <p className="text-xs font-bold text-red-200 uppercase tracking-widest mb-2 flex items-center gap-1"><TrendingDown size={14}/> Saídas</p>
                    <p className="text-2xl font-black text-white">R$ {summary.totalWalletOut.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        );
    };
    
    // 4. Empty State
    const EmptyState = ({ icon: Icon, title, desc }) => (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 border border-white/5 rounded-3xl text-center dashed-border">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600">
                <Icon size={32} />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-gray-500 text-sm max-w-xs">{desc}</p>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col">
            
            {/* --- HEADER (Glass Sticky) --- */}
            <header className="bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 pb-4">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button 
                        onClick={() => handleNavChange('home')} 
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight">Histórico de Atividades</h1>
                </div>
                
                {/* --- ABAS INTERNAS (Switch) --- */}
                <div className="container mx-auto px-4">
                    <div className="bg-black/20 p-1 rounded-xl flex relative border border-white/5">
                        <button 
                            onClick={() => setInternalTab('compras')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${internalTab === 'compras' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <ShoppingBag size={16} /> Minhas Compras
                        </button>
                        <button 
                            onClick={() => setInternalTab('carteira')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${internalTab === 'carteira' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Wallet size={16} /> Carteira
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8 pb-32">
                <div className="max-w-2xl mx-auto flex flex-col">
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-orange-500" size={40} />
                            <p className="text-gray-500 text-sm animate-pulse">Carregando histórico...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                            <p className="text-red-400 font-bold mb-2">Ops, algo deu errado.</p>
                            <p className="text-red-300/70 text-sm mb-4">{error}</p>
                            <button onClick={() => fetchHistoryData(1)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold">Tentar Novamente</button>
                        </div>
                    ) : (
                        <>
                            {/* Resumo Financeiro */}
                            <SummaryCard internalTab={internalTab} />
                            
                            {/* LISTA DE COMPRAS */}
                            {internalTab === 'compras' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 pl-2">Transações Recentes</h3>
                                    {purchases.length > 0 ? (
                                        purchases.map(tx => <PurchaseItem key={tx.id} tx={tx} />)
                                    ) : (
                                        <EmptyState icon={Package} title="Nenhuma compra" desc="Você ainda não realizou compras neste período." />
                                    )}
                                </div>
                            )}
                            
                            {/* LISTA DE CARTEIRA */}
                            {internalTab === 'carteira' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 pl-2">Extrato</h3>
                                    {walletActivity.length > 0 ? (
                                        walletActivity.map(tx => <WalletActivityItem key={tx.id} tx={tx} />)
                                    ) : (
                                        <EmptyState icon={DollarSign} title="Sem movimentações" desc="Seu histórico de depósitos e transferências aparecerá aqui." />
                                    )}
                                </div>
                            )}
                            
                            {/* PAGINAÇÃO MODERNIZADA */}
                            {historyData.transactions?.length > 0 && (
                                <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5">
                                    <button 
                                        onClick={() => fetchHistoryData(historyData.pagination.page - 1)} 
                                        disabled={historyData.pagination.page === 1} 
                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-orange-500/30 transition-all flex items-center gap-2"
                                    >
                                        <ChevronLeft size={16} /> Anterior
                                    </button>
                                    
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Pág {historyData.pagination.page}
                                    </span>
                                    
                                    <button 
                                        onClick={() => fetchHistoryData(historyData.pagination.page + 1)} 
                                        disabled={historyData.pagination.page === Math.ceil((historyData?.pagination?.total || 0) / (historyData?.pagination?.limit || 10))} 
                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-orange-500/30 transition-all flex items-center gap-2"
                                    >
                                        Próxima <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* --- BOTTOM NAV PREMIUM (FIXA) --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
                
                {/* Carrinho Flutuante (FAB) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <button 
                        onClick={() => handleNavChange('cart')} 
                        className={`group relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${navTab === 'cart' ? 'bg-orange-500 scale-110 shadow-orange-500/50' : 'bg-[#1e293b] border-4 border-[#0f172a] text-gray-400'}`}
                    >
                        <ShoppingCart size={28} className={navTab === 'cart' ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                        
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-md animate-bounce">
                                {cart.reduce((a,b)=>a+b.quantity,0)}
                            </span>
                        )}
                        
                        <div className={`absolute inset-0 rounded-full blur-xl bg-orange-500/40 -z-10 transition-opacity duration-300 ${navTab === 'cart' ? 'opacity-100' : 'opacity-0'}`}></div>
                    </button>
                </div>

                {/* Barra de Fundo Vidro */}
                <div className="relative bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-4 h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-between items-end pb-4">
                    
                    {/* Botão Início */}
                    <button onClick={() => handleNavChange('home')} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className={`relative p-1 transition-all duration-300 ${navTab === 'home' ? '-translate-y-1' : ''}`}>
                            <Home size={24} className={`transition-colors duration-300 ${navTab === 'home' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'home' ? 'text-white' : 'text-gray-500'}`}>
                            Início
                        </span>
                    </button>

                    {/* Botão Pedidos (ATIVO) */}
                    <button onClick={() => handleNavChange('history')} className="flex-1 flex flex-col items-center gap-1 group mr-6">
                        <div className={`relative p-1 transition-all duration-300 ${navTab === 'history' ? '-translate-y-1' : ''}`}>
                            <History size={24} className={`transition-colors duration-300 ${navTab === 'history' ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'history' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'history' ? 'text-white' : 'text-gray-500'}`}>
                            Pedidos
                        </span>
                    </button>

                    {/* Espaçador Central */}
                    <div className="w-12"></div>

                    {/* Botão Carteira */}
                    <button onClick={() => handleNavChange('wallet')} className="flex-1 flex flex-col items-center gap-1 group ml-6">
                        <div className={`relative p-1 transition-all duration-300 ${navTab === 'wallet' ? '-translate-y-1' : ''}`}>
                            <Wallet size={24} className={`transition-colors duration-300 ${navTab === 'wallet' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'wallet' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'wallet' ? 'text-white' : 'text-gray-500'}`}>
                            Carteira
                        </span>
                    </button>

                    {/* Botão Perfil */}
                    <button onClick={() => handleNavChange('profile')} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className={`relative p-1 transition-all duration-300 ${navTab === 'profile' ? '-translate-y-1' : ''}`}>
                            <User size={24} className={`transition-colors duration-300 ${navTab === 'profile' ? 'text-orange-500 fill-orange-500/20' : 'text-gray-500 group-hover:text-gray-300'}`} />
                            <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full blur-[3px] transition-all duration-300 ${navTab === 'profile' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${navTab === 'profile' ? 'text-white' : 'text-gray-500'}`}>
                            Perfil
                        </span>
                    </button>

                </div>
            </div>

            {/* Transaction Modal (Placeholder se você tiver o componente global) */}
            {/* <TransactionReceiptModal ... /> */}
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
