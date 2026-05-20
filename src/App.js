
import React from 'react';
// Ícones adicionados: History para o novo histórico, FileText para faturas
import { Mail, Eye, EyeOff, Lock, User, MapPin, ThumbsDown, Trophy, Clock, Smartphone, Home, Building, Check, Search, ShoppingCart, Hourglass, Menu, X, ArrowLeft, ArrowRight, Trash2, Plus, Minus, BarChart, Users as UsersIcon, Package, LogOut, CreditCard, QrCode, Shield, Loader2, Edit, PlusCircle, Building2, Copy, ChevronDown, ChevronUp, DollarSign, KeyRound, Calendar, Wallet, Flame, AlertTriangle, Save, Filter, ArrowDownToLine, ArrowRightLeft, Ticket, Bell, PiggyBank, History, Phone, Refrigerator, CheckCircle2, Info, Ban, FileText, Instagram, MessageSquare, PieChart, LayoutDashboard } from 'lucide-react';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick"; // E adicione esta também


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

const Toast = ({ show, message }) => {
    // Se o estado for falso, o pop-up fica invisível
    if (!show) return null;

    // Lógica inteligente (sem alterar os seus estados): 
    // Identifica se a mensagem é um erro para mudar a cor para vermelho
    const isError = message.toLowerCase().includes('erro') || 
                    message.toLowerCase().includes('falha') || 
                    message.toLowerCase().includes('insuficiente') || 
                    message.toLowerCase().includes('obrigatório');

    const Icon = isError ? AlertTriangle : CheckCircle2;
    const titleText = isError ? 'Atenção' : 'Sucesso!';

    // Animação de entrada suave caindo do topo
    const keyframes = `
        @keyframes toast-slide-down {
            0% { opacity: 0; transform: translateY(-40px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast {
            animation: toast-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    `;

    return (
        <div className="fixed top-8 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
            <style>{keyframes}</style>
            
            <div className={`animate-toast bg-black/85 backdrop-blur-3xl border ${isError ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-[#f2bd46]/50 shadow-[0_0_20px_rgba(242,189,70,0.2)]'} shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-2xl p-4 sm:p-5 flex items-center gap-4 max-w-sm w-full relative overflow-hidden`}>
                
                {/* Glow Ambiente de fundo no Pop-up */}
                <div className={`absolute top-0 left-0 w-32 h-32 ${isError ? 'bg-red-500/10' : 'bg-[#f2bd46]/10'} blur-[40px] rounded-full pointer-events-none`}></div>

                {/* Ícone Destaque em uma caixa de vidro */}
                <div className={`${isError ? 'bg-red-500/20 border-red-500/30' : 'bg-[#f2bd46]/20 border-[#f2bd46]/30'} border p-3 rounded-xl shadow-inner relative z-10 flex-shrink-0`}>
                    <Icon size={24} className={isError ? 'text-red-400' : 'text-[#f2bd46]'} />
                </div>
                
                {/* Textos do Pop-up */}
                <div className="flex flex-col relative z-10 min-w-0">
                    <span className="text-white font-extrabold text-base tracking-tight truncate">{titleText}</span>
                    <span className="text-gray-300 text-sm font-medium leading-snug mt-0.5">{message}</span>
                </div>
                
            </div>
        </div>
    );
};

const TransferConfirmationModal = ({ isOpen, onClose, onConfirm, recipient, amount, isTransferring }) => {
    // --- Keyframes para animação do card e botão ---
    const keyframes = `
        @keyframes surgir { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes neon-pulse-shadow {
            0%, 100% { box-shadow: 0 0 8px rgba(249, 115, 22, 0.5), 0 0 12px rgba(249, 115, 22, 0.5); }
            50% { box-shadow: 0 0 12px rgba(249, 115, 22, 0.8), 0 0 20px rgba(249, 115, 22, 0.8); }
        }
        .animate-surgir { animation: surgir 0.3s ease-out forwards; }
        .neon-button-[#f2bd46] { animation: neon-pulse-shadow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    `;
    
    // --- Classe do Botão Neon (Confirmar) ---
    const neonButtonClass = `
        bg-[#f2bd46] text-white font-bold py-3 px-6 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-[#f2bd46]/30 hover:shadow-[#f2bd46]/50
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
        neon-button-[#f2bd46]
    `;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <style>{keyframes}</style>
            {/* --- MODAL REDESENHADO (Glassmorphism e Animação) --- */}
            <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl shadow-2xl w-full max-w-md animate-surgir">

                {/* Ícone de Destaque */}
                <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} className="text-blue-400" />
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-4">Confirmar Transferência</h2>
                <p className="text-gray-300 text-center mb-6">Você está prestes a transferir <span className="font-bold text-[#f2bd46]">R$ {parseFloat(amount || 0).toFixed(2).replace('.', ',')}</span> para:</p>
                
                {/* Card de Destinatário */}
                <div className="bg-[#1a1a1a]/80 p-4 rounded-lg text-left space-y-2 border border-gray-600/50">
                    <p><span className="text-gray-400 font-medium">Nome:</span> <span className="text-white">{recipient?.name}</span></p>
                    <p><span className="text-gray-400 font-medium">E-mail:</span> <span className="text-white">{recipient?.email}</span></p>
                </div>
                
                <div className="flex justify-center gap-4 mt-8">
                    <button onClick={onClose} className="bg-[#1a1a1a] hover:bg-[#1a1a1a] text-white font-bold py-3 px-6 rounded-lg transition-colors">Cancelar</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isTransferring} 
                        className={neonButtonClass} // Botão Neon
                    >
                        {isTransferring ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TransferLoadingModal = ({ isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-[999] animate-fade-in-fast">
            <Loader2 size={64} className="text-[#f2bd46] animate-spin" />
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
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
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
                    src="https://i.postimg.cc/5yNYZHHp/Design-sem-nome-(1).png" // Caminho para a pasta /public
                    alt="SmartFridge Logo" 
                    className="h-10 w-auto mx-auto mb-6 print:h-12"
                />
                
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-200 print:text-black">Comprovante de Transação</h2>
                
                {isLoading ? <div className="flex justify-center"><Loader2 className="animate-spin text-white print:text-black" /></div> : details ? (
                    <div className="space-y-4 text-gray-300 print:text-gray-800">
                        
                        {/* --- Seção de Detalhes (Fundo Sólido Mais Escuro) --- */}
                        <div className="bg-black rounded-lg p-4 space-y-3">
                            <p className="flex justify-between"><strong className="text-gray-400 font-medium">ID da Transação:</strong> <span className="font-semibold text-white">{details.id}</span></p>
                            <p className="flex justify-between"><strong className="text-gray-400 font-medium">Data e Hora:</strong> <span className="font-semibold text-white">{new Date(details.created_at).toLocaleString('pt-BR')}</span></p>
                            <p className="flex justify-between"><strong className="text-gray-400 font-medium">Tipo:</strong> <span className="font-semibold text-white capitalize">{details.type?.replace(/_/g, ' ')}</span></p>
                            <p className="flex justify-between text-right"><strong className="text-gray-400 font-medium">Descrição:</strong> <span className="font-semibold text-white ml-4">{details.description}</span></p>
                        </div>
                        
                        {/* --- Seção de Valor (Com Neon Estático) --- */}
                        <div className="text-center bg-black rounded-lg p-4">
                            <p className="text-lg text-gray-300">Valor Total</p>
                            <p 
                                className="flex justify-center text-4xl mt-1 font-bold text-[#f2bd46] print:text-[#f2bd46]"
                                // --- NEON ESTÁTICO (Sem pulso) ---
                                style={{ textShadow: '0 0 8px rgba(249, 115, 22, 0.7)' }}
                            >
                                R$ {parseFloat(details.amount).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        
                        {/* Itens da Compra (se houver) */}
                        {details.items && details.items.length > 0 && (
                            <div className="bg-black rounded-lg p-4">
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
                            <div className="bg-black rounded-lg p-4">
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
                        className="bg-[#1a1a1a] hover:bg-[#1a1a1a] text-white font-bold py-3 px-6 rounded-lg transition-colors"
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
                        .bg-black { background: #fff !important; color: #000 !important; }
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
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-[#1a1a1a] rounded-md disabled:opacity-50 hover:bg-[#1a1a1a] transition"><ArrowLeft size={16} /></button>
            <span className="text-gray-400">Página {currentPage} de {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-[#1a1a1a] rounded-md disabled:opacity-50 hover:bg-[#1a1a1a] transition"><ArrowRight size={16} /></button>
        </div>
    );
};

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <div className="w-full bg-[#1a1a1a] rounded-full h-2.5 mb-8">
            <div className="bg-[#f2bd46] h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente AdminLoginModal por este

const AdminLoginModal = ({ show, onClose, onAdminLogin }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    if (!show) return null;
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao autenticar.');
            localStorage.setItem('adminToken', data.token);
            onAdminLogin();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- NOVO DESIGN "CLEAN & BRIGHT" ---
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            {/* Card Branco */}
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-gray-900">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#f2bd46]-600">Acesso Restrito</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-gray-800" /></button>
                </div>
                
                <form onSubmit={handleLogin}>
                    {/* Inputs (Alto Contraste) */}
                    <div className="mb-4 relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Utilizador" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" 
                            required 
                        />
                    </div>
                    <div className="mb-4 relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" 
                            required 
                        />
                    </div>
                    
                    {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}
                    
                    {/* Botão Laranja Sólido */}
                    <button 
                        type="submit" 
                        className="w-full bg-[#f2bd46] hover:bg-[#f2bd46]-700 text-white font-bold py-3 rounded-lg transform hover:scale-105 flex justify-center items-center transition" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar no Painel'}
                    </button>
                </form>
            </div>
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

    // --- DEFINIÇÃO DAS ANIMAÇÕES ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
    `;

    // --- CLASSES DOS BOTÕES (Novo Design) ---
    const neonButtonClassOrange = `
        bg-[#f2bd46] text-black font-bold py-3.5 px-4 
        flex items-center justify-center gap-2 rounded-xl
        shadow-[0_0_15px_rgba(242,189,70,0.4)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] 
        transition-all duration-300 disabled:bg-[#1a1a1a] disabled:text-gray-500 disabled:shadow-none
        transform hover:-translate-y-1 active:translate-y-0
    `;

    const neonButtonClassGreen = `
        bg-[#22c55e] text-black font-bold py-3.5 px-4 
        flex items-center justify-center gap-2 rounded-xl
        shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] 
        transition-all duration-300 disabled:bg-[#1a1a1a] disabled:text-gray-500 disabled:shadow-none
        transform hover:-translate-y-1 active:translate-y-0
    `;

    // Manutenção de Lógica Intacta
    const handleDateChange = (e) => { setBirthDate(formatDate(e.target.value)); };

    const handleVerifyUser = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        
        const [day, month, year] = birthDate.split('/');
        const birthDateForBackend = `${year}-${month}-${day}`;
        
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-user`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
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

    return (
        <div 
            className="min-h-screen text-white flex flex-col justify-center items-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url('https://i.ibb.co/N2Hh8yjt/Chat-GPT-Image-12-de-mai-de-2026-10-20-15.png')`
            }}
        >
            <style>{keyframes}</style>
            
            <div className="absolute inset-0 bg-black/80 z-0"></div>

            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#f2bd46]/15 rounded-full blur-[100px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#f2bd46]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
            
            <div className="w-full max-w-md z-10">
                <div className="bg-black/50 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-surgir relative">
                    
                    <button 
                        onClick={() => setPage('login')} 
                        className="absolute top-6 left-6 text-gray-400 hover:text-[#f2bd46] flex items-center justify-center transition-colors bg-black/40 hover:bg-black/60 border border-gray-700/50 p-2 rounded-full backdrop-blur-sm"
                        style={{ animationDelay: '100ms' }}
                        title="Voltar para o Login"
                    >
                        <ArrowLeft size={20} /> 
                    </button>
                    
                    <div className="text-center mb-8 animate-surgir" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-2xl font-extrabold tracking-tight mb-1 text-white mt-4">
                            Recuperar Senha
                        </h2>
                    </div>
                    
                    {step === 1 && (
                        <form onSubmit={handleVerifyUser} className="animate-surgir" style={{ animationDelay: '300ms' }}>
                            <p className="text-center text-gray-300 text-sm mb-6">Insira os seus dados para verificarmos a sua identidade.</p>
                            
                            <div className="mb-4 relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Seu CPF" 
                                    value={cpf} 
                                    onChange={(e) => setCpf(formatCPF(e.target.value))} 
                                    className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" 
                                    required 
                                />
                            </div>
                            
                            <div className="mb-6 relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Data de Nascimento (DD/MM/AAAA)"
                                    value={birthDate} 
                                    onChange={handleDateChange} 
                                    className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" 
                                    required 
                                />
                            </div>
                            
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 px-3 rounded-lg mb-4 animate-surgir">
                                    {error}
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                className={`w-full ${neonButtonClassOrange}`} 
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'Verificar Identidade'}
                            </button>
                        </form>
                    )}
                    
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="animate-surgir" style={{ animationDelay: '300ms' }}>
                            <p className="text-center text-green-400/90 text-sm mb-6 font-medium">Usuário verificado! Agora, crie uma nova senha.</p>
                            
                            <div className="mb-4 relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#22c55e] transition-colors duration-300" size={20} />
                                <input 
                                    type="password" 
                                    placeholder="Nova senha (mín. 6 caracteres)" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]/70 focus:ring-1 focus:ring-[#22c55e]/70 transition-all duration-300" 
                                    required 
                                />
                            </div>
                            
                            <div className="mb-6 relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#22c55e] transition-colors duration-300" size={20} />
                                <input 
                                    type="password" 
                                    placeholder="Confirme a nova senha" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]/70 focus:ring-1 focus:ring-[#22c55e]/70 transition-all duration-300" 
                                    required 
                                />
                            </div>
                            
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 px-3 rounded-lg mb-4 animate-surgir">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center py-2 px-3 rounded-lg mb-4 animate-surgir">
                                    {success}
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                className={`w-full ${neonButtonClassGreen}`} 
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'Alterar Senha'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente LoginPage por este

const LoginPage = ({ onLogin, onAdminLogin, onSwitchToRegister, setPage }) => {
    const [cpf, setCpf] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [showAdminModal, setShowAdminModal] = React.useState(false);
    
    // NOVO: Estado para controlar a tela de boas-vindas inicial
    const [isIntro, setIsIntro] = React.useState(true);

    // Efeito para remover a tela de boas-vindas (reduzido para 2.6s para ser mais dinâmico)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsIntro(false);
        }, 2600); 
        return () => clearTimeout(timer);
    }, []);

    const handleCpfChange = (e) => { setCpf(formatCPF(e.target.value)); };
    
    // --- DEFINIÇÃO DAS ANIMAÇÕES ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        @keyframes fadeOut {
            from { opacity: 1; backdrop-filter: blur(12px); }
            to { opacity: 0; backdrop-filter: blur(0px); visibility: hidden; }
        }
        .animate-fadeout {
            animation: fadeOut 0.6s ease-in-out forwards;
        }
        /* Nova Animação Cinematográfica para o Bem-Vindo */
        @keyframes textFocus {
            0% { filter: blur(10px); opacity: 0; transform: scale(0.95); }
            100% { filter: blur(0px); opacity: 1; transform: scale(1); }
        }
        .animate-text-focus {
            animation: textFocus 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    `;
    
    // --- Classe do Botão Neon ---
    const neonButtonClass = `
        bg-[#f2bd46] text-black font-bold py-3.5 px-4 
        flex items-center justify-center gap-2 rounded-xl
        shadow-[0_0_15px_rgba(242,189,70,0.4)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] 
        transition-all duration-300 disabled:bg-[#1a1a1a] disabled:text-gray-500 disabled:shadow-none
        transform hover:-translate-y-1 active:translate-y-0
    `;
    
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf, password })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Erro ao fazer login.'); }
            onLogin(data.token, data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Modal de Admin */}
            <AdminLoginModal show={showAdminModal} onClose={() => setShowAdminModal(false)} onAdminLogin={onAdminLogin} />
            
            {/* --- CONTAINER PRINCIPAL COM IMAGEM DE FUNDO --- */}
            <div 
                className="min-h-screen text-white flex flex-col justify-center items-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{
                    // Imagem de mercado desfocada/escura para dar contexto.
                    backgroundImage: `url('https://i.ibb.co/N2Hh8yjt/Chat-GPT-Image-12-de-mai-de-2026-10-20-15.png')`
                }}
            >
                <style>{keyframes}</style>
                
                {/* Overlay Escuro para garantir a leitura do texto e efeito Neon */}
                <div className="absolute inset-0 bg-black/80 z-0"></div>

                {/* Efeitos de luz no fundo (Ambient Glow) */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#f2bd46]/15 rounded-full blur-[100px] pointer-events-none z-0"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#f2bd46]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

                {/* --- TELA DE INTRODUÇÃO (BOAS-VINDAS MINIMALISTA) --- */}
                {isIntro ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-fadeout" style={{ animationDelay: '2s' }}>
                        <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-white animate-text-focus">
                            BEM-VINDO
                        </h1>
                        <p className="text-[#f2bd46] mt-4 tracking-[0.3em] text-xs font-semibold animate-surgir" style={{ animationDelay: '600ms' }}>
                            DANIEL MARQUES MARKET
                        </p>
                    </div>
                ) : null}

                {/* --- TELA DE LOGIN PRINCIPAL --- */}
                {/* Só renderiza o conteúdo do form se a intro já estiver no fim ou finalizada */}
                {!isIntro && (
                    <div className="w-full max-w-md z-10">
                        
                        {/* Card de Vidro (Glassmorphism) Modernizado */}
                        <div className="bg-black/50 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-surgir">
                            
                            {/* --- Cabeçalho com Logo e Boas-vindas --- */}
                            <div className="text-center mb-8 animate-surgir" style={{ animationDelay: '100ms' }}>
                                <img 
                                    src="https://i.postimg.cc/5yNYZHHp/Design-sem-nome-(1).png" 
                                    alt="Daniel Marques Market Logo" 
                                    className="h-16 w-auto mx-auto mb-5 drop-shadow-[0_0_10px_rgba(242,189,70,0.2)]" 
                                />
                                <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                                    Acesse sua conta
                                </h1>
                                <p className="text-gray-300 text-sm">
                                    Sua loja autônoma 24 horas
                                </p>
                            </div>
                            
                            <form onSubmit={handleLoginSubmit} className="animate-surgir" style={{ animationDelay: '200ms' }}>
                                
                                {/* Inputs com design refinado */}
                                <div className="mb-4 relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                    <input 
                                        type="text" 
                                        placeholder="Seu CPF" 
                                        value={cpf} 
                                        onChange={handleCpfChange} 
                                        className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" 
                                        required 
                                    />
                                </div>
                                
                                <div className="mb-6 relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                    <input 
                                        type="password" 
                                        placeholder="Senha" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" 
                                        required 
                                    />
                                </div>
                                
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 px-3 rounded-lg mb-4 animate-surgir">
                                        {error}
                                    </div>
                                )}
                                
                                {/* Botão Principal */}
                                <button 
                                    type="submit" 
                                    className={`w-full ${neonButtonClass}`} 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'Entrar na Loja'}
                                </button>
                            </form>
                            
                            {/* Links de apoio */}
                            <div className="flex flex-col items-center gap-3 mt-8 animate-surgir" style={{ animationDelay: '300ms' }}>
                                <button onClick={() => setPage('forgot-password')} className="text-sm text-gray-300 hover:text-[#f2bd46] transition-colors font-medium drop-shadow-md">
                                    Esqueci minha senha
                                </button>
                                <div className="w-full h-px bg-gray-700/60 my-1"></div>
                                <button onClick={onSwitchToRegister} className="text-sm text-gray-200 hover:text-white transition-colors font-medium drop-shadow-md">
                                    Não tem uma conta? <span className="text-[#f2bd46] font-bold">Cadastre-se</span>
                                </button>
                            </div>
                            
                            {/* Botão Admin Secreto/Discreto */}
                            <div className="absolute top-4 right-4 animate-surgir" style={{ animationDelay: '400ms' }}>
                                <button 
                                    onClick={() => setShowAdminModal(true)} 
                                    className="text-gray-500 hover:text-[#f2bd46] transition-colors p-2 rounded-full hover:bg-black/50 backdrop-blur-sm"
                                    title="Acessar como Administrador"
                                >
                                    <Shield size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// App.js -> SUBSTITUA o seu componente RegisterPage por este

const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
    const [step, setStep] = React.useState(1);
    const [formData, setFormData] = React.useState({ name: '', cpf: '', email: '', phone_number: '', birthDate: '', apartmentBlock: '', apartmentNumber: '', password: '', confirmPassword: '', terms: false });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    // --- DEFINIÇÃO DAS ANIMAÇÕES ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
    `;
    
    // --- Classe do Botão Neon (Laranja) Atualizada ---
    const neonButtonClassOrange = `
        bg-[#f2bd46] text-black font-bold py-3.5 px-4 
        flex items-center justify-center gap-2 rounded-xl
        shadow-[0_0_15px_rgba(242,189,70,0.4)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] 
        transition-all duration-300 disabled:bg-[#1a1a1a] disabled:text-gray-500 disabled:shadow-none
        transform hover:-translate-y-1 active:translate-y-0
    `;

    // --- Botão Secundário (Voltar) ---
    const secondaryButtonClass = `
        bg-black/40 hover:bg-black/60 border border-gray-700/50 
        text-white font-medium py-3.5 px-5 rounded-xl transition-all duration-300
        flex items-center gap-2 backdrop-blur-sm hover:text-[#f2bd46]
    `;
    
    // --- LÓGICA MANTIDA INTACTA ---
    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    const handleCpfChange = (e) => { setFormData({ ...formData, cpf: formatCPF(e.target.value) }); };
    const handlePhoneChange = (e) => { setFormData({ ...formData, phone_number: formatPhone(e.target.value) }); };
    const handleDateChange = (e) => { setFormData({ ...formData, birthDate: formatDate(e.target.value) }); };

    const handleRegisterSubmit = async () => {
        setError('');
        if (!validateCPF(formData.cpf)) { setError('CPF inválido.'); return; }
        if (!validateEmail(formData.email)) { setError('Formato de e-mail inválido.'); return; }
        setIsLoading(true); setSuccess('');

        const [day, month, year] = formData.birthDate.split('/');
        const birthDateForBackend = `${year}-${month}-${day}`;

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: formData.name, 
                    cpf: formData.cpf, 
                    email: formData.email, 
                    phone_number: formData.phone_number, 
                    password: formData.password, 
                    birth_date: birthDateForBackend,
                    apartment: `Bloco ${formData.apartmentBlock} - Apto ${formData.apartmentNumber}` 
                })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Erro ao criar conta.'); }
            setSuccess('Conta criada! A fazer login...');
            
            onRegister(data.token, data.user); 

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }
    
    const validateStep1 = () => {
        if (!formData.name || !validateEmail(formData.email) || formData.cpf.length !== 14 || formData.phone_number.length < 14 || formData.birthDate.length !== 10) return false;
        
        const [day, month, year] = formData.birthDate.split('/');
        if (!day || !month || !year || year.length !== 4) return false;
        
        const birthDate = new Date(`${year}-${month}-${day}T00:00:00`);
        if (isNaN(birthDate.getTime())) return false; 
        
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }
    
    const validateStep2 = () => { 
        return formData.apartmentBlock.trim() && formData.apartmentNumber.trim(); 
    }
    const validateStep3 = () => { return formData.password.length >= 6 && formData.password === formData.confirmPassword && formData.terms; }
    
    // ==========================================
    // --- NOVO: FUNÇÕES DE SUPORTE E TUTORIAL ---
    // ==========================================
    const handleTutorialClick = () => {
        // Substitua abaixo pelo link do seu vídeo do YouTube
        const youtubeUrl = "https://www.youtube.com/watch?v=SEU_LINK_AQUI";
        window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
    };

    const handleSupportClick = () => {
        // Coloque o número do WhatsApp com DDI (55 para Brasil) e DDD. Ex: 5511999999999
        const whatsappNumber = "5561992729183"; 
        const message = "Olá! Estou com dificuldades para fazer meu cadastro no Daniel Marques Market. Podem me ajudar?";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };
    // ==========================================

    // --- DESIGN "DARK & NEON" REFINADO ---
    return (
        <div 
            className="min-h-screen text-white flex flex-col justify-center items-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://i.ibb.co/N2Hh8yjt/Chat-GPT-Image-12-de-mai-de-2026-10-20-15.png')` }}
        >
            <style>{keyframes}</style>
            
            {/* Overlay Escuro */}
            <div className="absolute inset-0 bg-black/80 z-0"></div>

            {/* Ambient Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#f2bd46]/15 rounded-full blur-[100px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#f2bd46]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            {/* Card de Vidro (Glassmorphism) Modernizado */}
            <div className="w-full max-w-xl z-10">
                <div className="bg-black/50 backdrop-blur-xl border border-gray-700/50 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-surgir">
                    
                    {/* Cabeçalho */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Crie sua conta</h2>
                        <p className="text-gray-300 text-sm">Siga as etapas para ter acesso à loja autônoma.</p>
                    </div>
                    
                    {/* Barra de Progresso Estilizada */}
                    <div className="w-full bg-black/60 border border-gray-800 rounded-full h-2 mb-8 overflow-hidden">
                        <div 
                            className="bg-[#f2bd46] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(242,189,70,0.8)]" 
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    {/* Janela da animação */}
                    <div className="overflow-hidden">
                    
                        {/* Trilho que desliza */}
                        <div 
                            className="flex transition-transform duration-500 ease-in-out" 
                            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
                        >
                            
                            {/* --- ETAPA 1: DADOS PESSOAIS --- */}
                            <div className="w-full flex-shrink-0 px-1">
                                <h3 className="text-lg font-bold mb-5 text-[#f2bd46] flex items-center gap-2">
                                    <User size={20} /> 1. Informações Pessoais
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                        <input name="name" type="text" placeholder="Nome Completo" value={formData.name} onChange={handleChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                        <input name="email" type="email" placeholder="E-mail" value={formData.email} onChange={handleChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                    </div>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                        <input type="text" placeholder="CPF" value={formData.cpf} onChange={handleCpfChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                    </div>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                        <input name="phone_number" type="tel" placeholder="Telefone (XX) XXXXX-XXXX" value={formData.phone_number} onChange={handlePhoneChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                    </div>
                                    <div>
                                        <div className="relative group mt-1">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                            <input type="text" name="birthDate" placeholder="Data de Nascimento (DD/MM/AAAA)" value={formData.birthDate} onChange={handleDateChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex justify-end items-center">
                                    <button 
                                        onClick={() => setStep(step + 1)} 
                                        disabled={!validateStep1()} 
                                        className={`flex items-center gap-2 ${neonButtonClassOrange} px-8`}
                                    >
                                        Avançar <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* --- ETAPA 2: ENDEREÇO --- */}
                            <div className="w-full flex-shrink-0 px-1">
                                <h3 className="text-lg font-bold mb-5 text-[#f2bd46] flex items-center gap-2">
                                    <Building2 size={20} /> 2. Endereço
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wider">Bloco / Torre</label>
                                            <Building2 className="absolute left-4 top-[65%] -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                            <input name="apartmentBlock" type="text" placeholder="Ex: A" value={formData.apartmentBlock} onChange={handleChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                        </div>
                                        <div className="relative group">
                                            <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wider">Apartamento</label>
                                            <Home className="absolute left-4 top-[65%] -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                            <input name="apartmentNumber" type="text" placeholder="Ex: 101" value={formData.apartmentNumber} onChange={handleChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex justify-between items-center">
                                    <button 
                                        onClick={() => setStep(step - 1)} 
                                        className={secondaryButtonClass}
                                    >
                                        <ArrowLeft size={18} /> Voltar
                                    </button>
                                    <button 
                                        onClick={() => setStep(step + 1)} 
                                        disabled={!validateStep2()} 
                                        className={`flex items-center gap-2 ${neonButtonClassOrange} px-8`}
                                    >
                                        Avançar <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* --- ETAPA 3: SEGURANÇA --- */}
                            <div className="w-full flex-shrink-0 px-1">
                                <h3 className="text-lg font-bold mb-5 text-[#f2bd46] flex items-center gap-2">
                                    <Shield size={20} /> 3. Segurança
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                        <input name="password" type="password" placeholder="Crie uma senha (mín. 6 caracteres)" value={formData.password} onChange={handleChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={20} />
                                        <input name="confirmPassword" type="password" placeholder="Confirme sua senha" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300" />
                                    </div>
                                    
                                    <div className="flex items-center mt-2 bg-black/40 border border-gray-800 p-4 rounded-xl">
                                        <input 
                                            id="terms" 
                                            name="terms" 
                                            type="checkbox" 
                                            checked={formData.terms} 
                                            onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} 
                                            className="h-5 w-5 text-[#f2bd46] bg-black border-gray-600 rounded focus:ring-[#f2bd46] focus:ring-offset-black accent-[#f2bd46]" 
                                        />
                                        <label htmlFor="terms" className="ml-3 text-sm text-gray-300 cursor-pointer select-none">
                                            Eu declaro que as informações acima são verdadeiras.
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex justify-between items-center">
                                    <button 
                                        onClick={() => setStep(step - 1)} 
                                        className={secondaryButtonClass}
                                    >
                                        <ArrowLeft size={18} /> Voltar
                                    </button>
                                    <button 
                                        onClick={handleRegisterSubmit} 
                                        disabled={!validateStep3() || isLoading} 
                                        className={`flex items-center justify-center gap-2 px-8 ${neonButtonClassOrange}`}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={22} /> : <>Finalizar <Check size={18} /></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 px-3 rounded-lg mt-6 animate-surgir">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center py-2 px-3 rounded-lg mt-6 animate-surgir">
                            {success}
                        </div>
                    )}
                    
                    {/* Botões de Rodapé e Ajuda */}
                    <div className="mt-8 pt-6 border-t border-gray-700/50 flex flex-col gap-5">
                        
                        {/* Já tem conta */}
                        <div className="text-center">
                            <button 
                                onClick={onSwitchToLogin} 
                                className="text-sm text-gray-300 hover:text-white transition-colors font-medium drop-shadow-md"
                            >
                                Já tem uma conta? <span className="text-[#f2bd46] font-bold">Faça login</span>
                            </button>
                        </div>

                        {/* --- NOVO: Banner Discreto de Suporte --- */}
                        <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-[#f2bd46]/30 hover:bg-black/60 transition-all duration-300 group">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#f2bd46]/10 p-2.5 rounded-full text-[#f2bd46] group-hover:scale-110 transition-transform duration-300">
                                    <Info size={22} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-200 font-semibold mb-1">Dificuldade no cadastro?</p>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <button 
                                            type="button"
                                            onClick={handleTutorialClick}
                                            className="text-[13px] text-[#f2bd46] hover:text-white transition-colors flex items-center gap-1 font-medium"
                                        >
                                            Ver tutorial
                                        </button>
                                        <span className="text-gray-600 text-xs">•</span>
                                        <button 
                                            type="button"
                                            onClick={handleSupportClick}
                                            className="text-[13px] text-[#f2bd46] hover:text-white transition-colors flex items-center gap-1 font-medium"
                                        >
                                            Chamar suporte
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:flex text-gray-500 group-hover:text-[#f2bd46] transition-colors">
                                <MessageSquare size={20} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
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

// App.js -> SUBSTITUA o seu componente HomePage por este

const HomePage = ({ user, onLogout, cart, setCart, addToCart, setPage, fridgeId, onCondoSelected }) => {
    // --- (Estados do HomePage MANTIDOS) ---
    const [showMenu, setShowMenu] = React.useState(false);
    const [products, setProducts] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [condos, setCondos] = React.useState([]); 
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearchLoading, setIsSearchLoading] = React.useState(false);
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);
    const [unreadTickets, setUnreadTickets] = React.useState(0);

    // --- (useEffect de busca de Condos/Máquinas MANTIDO) ---
    React.useEffect(() => {
        const fetchCondos = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/condominiums`);
                const data = await response.json();
                setCondos(data);
            } catch (err) { console.error(err) }
        };
        fetchCondos();
    }, []);

    const currentCondo = condos.find(c => c.id === user?.condoId);

    // --- (useEffect de Produtos MANTIDO) ---
    React.useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true); 
            setError('');
            
            if (!user?.condoId) {
                setIsLoading(false); 
                setProducts({});   
                return;            
            }

            try {
                const response = await fetch(`${API_URL}/api/products?condoId=${user.condoId}`); 
                if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Falha ao buscar produtos.'); }
                const data = await response.json(); 
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [user?.condoId]); 

    // --- (useEffect de Pesquisa MANTIDO) ---
    React.useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }
        setIsSearchLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchResults = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/products/search?q=${searchQuery}&condoId=${user.condoId}`);
                    const data = await response.json();
                    setSearchResults(data);
                } catch (err) {
                    console.error("Erro na pesquisa:", err);
                } finally {
                    setIsSearchLoading(false);
                }
            };
            fetchResults();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, user?.condoId]);

    // --- (Tickets MANTIDO) ---
    React.useEffect(() => {
        const fetchUnreadTickets = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/api/user/tickets/unread-count`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) { const data = await response.json(); setUnreadTickets(data.count); }
            } catch (error) { console.error("Erro tickets:", error); }
        };
        fetchUnreadTickets();
        const interval = setInterval(fetchUnreadTickets, 60000);
        return () => clearInterval(interval);
    }, []);

    const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);
    const handleBuyNow = (e, product) => { e.stopPropagation(); addToCart(product); setPage('cart'); };
    const handleAddToCart = (e, product) => { e.stopPropagation(); addToCart(product); };

    // --- SideMenu (VISUAL ATUALIZADO COM GLASSMORPHISM) ---
    const SideMenu = () => (
        <div className={`fixed top-0 left-0 h-full w-72 bg-black/90 backdrop-blur-2xl border-r border-gray-800 shadow-[20px_0_50px_rgba(0,0,0,0.7)] z-50 transform ${showMenu ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 ease-in-out`}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-10">
                    <span className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-[#f2bd46]">MENU</span>
                    <button onClick={() => setShowMenu(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X className="text-white" />
                    </button>
                </div>
                <nav className="flex flex-col gap-3">
                    <button onClick={() => setPage('wallet')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                        <div className="bg-[#1a1a1a] p-2 rounded-lg group-hover:bg-[#f2bd46]/20 transition-colors"><Wallet size={20} className="text-gray-400 group-hover:text-[#f2bd46] transition-colors" /></div> 
                        <span className="font-medium text-gray-200 group-hover:text-white transition-colors">Minha Carteira</span>
                    </button>
                    <button onClick={() => setPage('history')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                        <div className="bg-[#1a1a1a] p-2 rounded-lg group-hover:bg-[#f2bd46]/20 transition-colors"><History size={20} className="text-gray-400 group-hover:text-[#f2bd46] transition-colors" /></div> 
                        <span className="font-medium text-gray-200 group-hover:text-white transition-colors">Meu Histórico</span>
                    </button>
                    <button onClick={() => setPage('my-tickets')} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1a1a1a] p-2 rounded-lg group-hover:bg-[#f2bd46]/20 transition-colors"><Ticket size={20} className="text-gray-400 group-hover:text-[#f2bd46] transition-colors" /></div> 
                            <span className="font-medium text-gray-200 group-hover:text-white transition-colors">Meus Tiquetes</span>
                        </div>
                        {unreadTickets > 0 && <span className="bg-red-500 text-xs font-bold text-white rounded-full h-6 w-6 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">{unreadTickets}</span>}
                    </button>
                    <button onClick={() => setPage('my-account')} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                        <div className="bg-[#1a1a1a] p-2 rounded-lg group-hover:bg-[#f2bd46]/20 transition-colors"><User size={20} className="text-gray-400 group-hover:text-[#f2bd46] transition-colors" /></div> 
                        <span className="font-medium text-gray-200 group-hover:text-white transition-colors">Minha Conta</span>
                    </button>
                </nav>
            </div>
            <button onClick={onLogout} className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 hover:border-red-500/40 transition-all">
                <LogOut size={20} /> Sair do Aplicativo
            </button>
        </div>
    );
    
    // --- Lógica de Categorias MANTIDA ---
    const categories = React.useMemo(() => {
        return Object.keys(products).reduce((acc, category) => {
            const items = products[category];
            if (items.length > 0) acc[category] = items;
            return acc;
        }, {});
    }, [products]);
    
    // --- Card de Produto da Lista Principal (VISUAL ATUALIZADO) ---
    const ProductListCard = ({ product, onAddToCart, onBuyNow }) => {
        const isOutOfStock = product.stock === 0;
        const isOnSale = product.is_on_sale;
        const keyframes = `
            @keyframes surgir { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes neon-pulse-text-[#f2bd46] { 0%, 100% { text-shadow: 0 0 5px rgba(242, 189, 70, 0.5), 0 0 10px rgba(242, 189, 70, 0.5); } 50% { text-shadow: 0 0 10px rgba(242, 189, 70, 0.8), 0 0 20px rgba(242, 189, 70, 0.8); } }
            @keyframes neon-pulse-text-red { 0%, 100% { text-shadow: 0 0 5px rgba(239, 68, 68, 0.5), 0 0 10px rgba(239, 68, 68, 0.5); } 50% { text-shadow: 0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.8); } }
            .animate-surgir { animation: surgir 0.5s ease-out forwards; }
            .neon-text-[#f2bd46] { animation: neon-pulse-text-[#f2bd46] 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .neon-text-red { animation: neon-pulse-text-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        `;
        
        let cardClasses = ` animate-surgir flex flex-col md:flex-row items-center gap-5 bg-black/40 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 p-5 relative `;
        if (isOnSale) { cardClasses += ` border-[#f2bd46]/40`; } else { cardClasses += ` border-gray-700/50`; }
        if (!isOutOfStock) { cardClasses += ` hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-gray-500/80 group`; }
        
        // Estilos de botões idênticos à tela de Auth
        const btnBuyClass = `bg-[#f2bd46] text-black font-bold py-3 px-5 text-sm flex items-center justify-center gap-2 rounded-xl shadow-[0_0_15px_rgba(242,189,70,0.4)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto`;
        const btnAddClass = `bg-black/50 hover:bg-black/80 border border-gray-700/80 text-white font-semibold py-3 px-5 text-sm flex items-center justify-center gap-2 rounded-xl transition-all duration-300 hover:border-[#f2bd46]/50 hover:text-[#f2bd46] w-full md:w-auto`;

        const StockIndicator = () => {
            if (isOutOfStock) return null;
            if (product.stock <= product.critical_stock_level) {
                return (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
                        <AlertTriangle size={14} className="text-red-400" />
                        <p className="text-xs font-bold text-red-400 neon-text-red uppercase tracking-wider"> Restam apenas {product.stock}! </p>
                    </div>
                );
            }
            return (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                    <Package size={14} className="text-green-400" />
                    <p className="text-xs font-medium text-green-400"> {product.stock} disponíveis </p>
                </div>
            );
        };

        return (
            <div className={cardClasses}>
                <style>{keyframes}</style>
                {/* Glow de fundo no card para itens em promoção */}
                {isOnSale && <div className="absolute inset-0 bg-gradient-to-r from-[#f2bd46]/5 to-transparent pointer-events-none rounded-2xl"></div>}
                
                <img src={product.image_url || `https://placehold.co/200x200/1a1a1a/4B5563?text=Sem+Foto`} alt={product.name} className={`w-full aspect-square md:w-36 md:h-36 rounded-xl object-cover flex-shrink-0 shadow-lg ${isOutOfStock ? 'opacity-40 grayscale' : 'group-hover:scale-[1.02] transition-transform duration-500'}`} />
                
                <div className="flex-grow min-w-0 w-full z-10">
                    {isOnSale && ( <div className="flex items-center gap-1.5 text-[#f2bd46] mb-2 bg-[#f2bd46]/10 inline-block px-2 py-0.5 rounded uppercase tracking-wider"> <Flame size={14} className="inline pb-0.5"/> <span className="font-bold text-[11px]">PROMOÇÃO IMPERDÍVEL</span> </div> )}
                    <h3 className="font-extrabold text-white text-xl md:text-2xl truncate mb-1">{product.name}</h3>
                    
                    {isOnSale ? (
                        <div className="flex items-baseline gap-3 mt-1">
                            <p className="text-3xl font-black text-[#f2bd46] neon-text-[#f2bd46] tracking-tight">R$ {parseFloat(product.sale_price).toFixed(2).replace('.', ',')}</p>
                            <p className="text-lg text-gray-500 line-through font-medium">R$ {parseFloat(product.original_price).toFixed(2).replace('.', ',')}</p>
                        </div>
                    ) : ( <p className="text-3xl font-black text-white mt-1 tracking-tight">R$ {parseFloat(product.sale_price).toFixed(2).replace('.', ',')}</p> )}
                    <StockIndicator />
                </div>
                
                <div className="flex-shrink-0 w-full md:w-auto z-10 mt-2 md:mt-0">
                    {isOutOfStock ? ( <span className="w-full flex items-center justify-center gap-2 text-sm bg-black/60 border border-gray-800 text-gray-500 font-bold p-3.5 text-center rounded-xl uppercase tracking-widest"><Ban size={18}/> ESGOTADO</span> ) : (
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-3 w-full">
                            <button onClick={(e) => onAddToCart(e, product)} className={btnAddClass}> <Plus size={18} /> Carrinho </button>
                            <button onClick={(e) => onBuyNow(e, product)} className={btnBuyClass}> <ShoppingCart size={18} /> Comprar </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- Switcher de Máquina (VISUAL ATUALIZADO) ---
    const MachineSwitcher = ({ condos, userCondoId, onCondoSelected }) => {
        const otherMachines = condos.filter(c => c.id !== userCondoId);
        if (otherMachines.length === 0) return null;
        return (
            <div className="animate-surgir bg-black/40 backdrop-blur-xl border border-gray-700/50 p-5 rounded-2xl mb-8 shadow-lg" style={{ animationDelay: '100ms' }}>
                <h3 className="text-sm uppercase tracking-wider font-bold text-gray-400 mb-4 flex items-center gap-2"><MapPin size={16}/> Explorar outras máquinas</h3>
                <div className="flex flex-wrap gap-3">
                    {otherMachines.map(machine => (
                        <button key={machine.id} onClick={() => onCondoSelected(machine, true)} className="bg-black/60 border border-gray-700/80 rounded-xl py-2.5 px-5 flex items-center gap-2.5 hover:bg-[#f2bd46]/10 hover:border-[#f2bd46]/50 transition-all duration-300 text-gray-300 hover:text-white group">
                            <Refrigerator size={18} className="text-gray-500 group-hover:text-[#f2bd46] transition-colors" /> 
                            <span className="font-medium">{machine.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // --- Componente para Resultados da Pesquisa (VISUAL ATUALIZADO) ---
    const SearchResultItem = ({ product }) => (
        <div 
            className="p-3 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors border-b border-gray-700/50 last:border-0 cursor-pointer group" 
            onClick={() => { addToCart(product); setSearchQuery(''); }}
        >
            <div className="flex items-center gap-4 overflow-hidden">
                <img src={product.image_url || `https://placehold.co/100x100/1a1a1a/4B5563?text=Foto`} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-black flex-shrink-0 border border-gray-700/50 group-hover:border-[#f2bd46]/30 transition-colors" />
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-200 group-hover:text-white truncate text-sm">{product.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        {product.promotional_price ? (
                            <>
                                <span className="text-[#f2bd46] font-black tracking-tight">R$ {parseFloat(product.sale_price).toFixed(2).replace('.',',')}</span>
                                <span className="text-gray-500 line-through text-xs font-medium">R$ {parseFloat(product.original_price).toFixed(2).replace('.',',')}</span>
                            </>
                        ) : (
                            <span className="text-gray-300 font-bold tracking-tight">R$ {parseFloat(product.sale_price).toFixed(2).replace('.',',')}</span>
                        )}
                    </div>
                </div>
            </div>
            <button className="bg-black/50 border border-gray-600 p-2.5 rounded-lg text-gray-400 group-hover:bg-[#f2bd46] group-hover:border-[#f2bd46] group-hover:text-black transition-all duration-300 flex-shrink-0 shadow-md">
                <Plus size={18} />
            </button>
        </div>
    );

    const authInputClass = "w-full bg-black/60 border border-gray-700/80 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#f2bd46]/70 focus:ring-1 focus:ring-[#f2bd46]/70 transition-all duration-300";

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Ambient Glows Universais de Fundo */}
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-[#f2bd46]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#f2bd46]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
            
            <SideMenu />
            {showMenu && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowMenu(false)}></div>}
            
            <header className="sticky top-0 bg-black/70 backdrop-blur-xl border-b border-gray-800/60 shadow-lg z-30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <button onClick={() => setShowMenu(true)} className="md:hidden relative p-2 bg-black/40 border border-gray-700/50 rounded-xl hover:bg-white/10 transition-colors">
                            <Menu size={22} />
                            {unreadTickets > 0 && <span className="absolute -top-1 -right-1 bg-red-500 h-3 w-3 rounded-full border-2 border-black"></span>}
                        </button>
                        <div className="cursor-pointer transition-transform hover:scale-105" onClick={() => setPage('home')}>
                            <img src="https://i.postimg.cc/5yNYZHHp/Design-sem-nome-(1).png" alt="SmartFridge Logo" className="h-16 w-auto drop-shadow-[0_0_10px_rgba(242,189,70,0.2)]" />
                        </div>
                    </div>
                    
                    {/* BARRA DE PESQUISA (DESKTOP) */}
                    <div className="flex-1 mx-8 max-w-lg relative hidden md:block group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar um produto..." 
                            className={authInputClass} 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            onFocus={() => setIsSearchFocused(true)} 
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} 
                        />
                        {isSearchFocused && searchQuery && (
                            <div className="absolute top-full mt-3 w-full bg-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] z-40 max-h-80 overflow-y-auto overflow-hidden">
                                {isSearchLoading ? <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center gap-3"><Loader2 className="animate-spin text-[#f2bd46]" size={24}/> <span className="text-sm font-medium">Buscando produtos...</span></div> : searchResults.length > 0 ? (
                                    <div className="py-2">{searchResults.map(product => <SearchResultItem key={product.id} product={product} />)}</div>
                                ) : ( <div className="p-6 text-center text-gray-400 flex flex-col items-center gap-2"><Search size={24} className="opacity-50"/> <span className="text-sm">Nenhum resultado encontrado.</span></div> )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-300">
                            <button onClick={() => setPage('wallet')} className="hover:text-[#f2bd46] transition-colors flex items-center gap-2"><Wallet size={16}/> Carteira</button>
                            <button onClick={() => setPage('history')} className="hover:text-[#f2bd46] transition-colors flex items-center gap-2"><History size={16}/> Histórico</button>
                            <button onClick={() => setPage('my-tickets')} className="hover:text-[#f2bd46] transition-colors flex items-center gap-2 relative"> 
                                <Ticket size={16}/> Tiquetes 
                                {unreadTickets > 0 && <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-black shadow-[0_0_8px_rgba(239,68,68,0.6)]">{unreadTickets}</span>} 
                            </button>
                            <button onClick={() => setPage('my-account')} className="hover:text-[#f2bd46] transition-colors flex items-center gap-2"><User size={16}/> Conta</button>
                        </nav>
                        <div className="h-8 w-px bg-gray-800 hidden md:block"></div>
                        <button className="relative p-2.5 bg-[#f2bd46]/10 border border-[#f2bd46]/30 text-[#f2bd46] hover:bg-[#f2bd46] hover:text-black transition-all duration-300 rounded-xl shadow-[0_0_15px_rgba(242,189,70,0.15)] group" onClick={() => setPage('cart')}>
                            <ShoppingCart size={22} className="group-hover:scale-110 transition-transform"/>
                            {totalItemsInCart > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white font-bold rounded-full h-5 w-5 flex items-center justify-center text-xs shadow-[0_0_10px_rgba(239,68,68,0.8)] border-2 border-black">{totalItemsInCart}</span>}
                        </button>
                    </div>
                </div>
                
                {/* BARRA DE PESQUISA (MOBILE) */}
                <div className="container mx-auto px-4 pb-4 md:hidden">
                    <div className="relative w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f2bd46] transition-colors duration-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar um produto..." 
                            className={authInputClass} 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            onFocus={() => setIsSearchFocused(true)} 
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} 
                        />
                        {isSearchFocused && searchQuery && (
                            <div className="absolute top-full mt-2 w-full bg-black/95 backdrop-blur-3xl border border-gray-700/80 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto">
                                {isSearchLoading ? <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center gap-2"><Loader2 className="animate-spin text-[#f2bd46]" size={20}/> <span className="text-sm">Procurando...</span></div> : searchResults.length > 0 ? (
                                    <div className="py-1">{searchResults.map(product => <SearchResultItem key={product.id} product={product} />)}</div>
                                ) : ( <div className="p-6 text-center text-gray-400 text-sm">Nenhum resultado encontrado.</div> )}
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto p-4 md:p-8 z-10 relative">
                {/* Banner de Boas Vindas Glassmorphism */}
                <div className="animate-surgir bg-gradient-to-br from-black/60 to-black/20 backdrop-blur-xl border border-gray-700/50 p-6 md:p-8 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-[#f2bd46]/5 blur-[60px] pointer-events-none rounded-full"></div>
                    <div className="z-10">
                        <h1 className="text-2xl md:text-3xl font-light mb-1">Bem-vindo de volta, <span className="font-extrabold text-[#f2bd46] tracking-tight">{user?.name}</span>!</h1>
                        <p className="text-gray-400 text-sm md:text-base flex items-center gap-2">
                            <MapPin size={16} className="text-[#f2bd46]"/> Comprando agora na máquina: <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md ml-1">{currentCondo?.name || '...'}</span>
                        </p>
                    </div>
                </div>
                
                <MachineSwitcher condos={condos} userCondoId={user?.condoId} onCondoSelected={onCondoSelected} />
                
                {isLoading && (<div className="flex flex-col justify-center items-center h-64 gap-4"><Loader2 className="w-12 h-12 text-[#f2bd46] animate-spin drop-shadow-[0_0_10px_rgba(242,189,70,0.5)]" /><span className="text-gray-400 font-medium tracking-widest animate-pulse">CARREGANDO PRODUTOS...</span></div>)}
                {error && (<div className="text-center p-8 bg-red-900/10 border border-red-500/20 text-red-400 rounded-2xl backdrop-blur-md shadow-lg flex flex-col items-center gap-3"><AlertTriangle size={32}/><p className="font-bold text-lg">Oops! Algo deu errado.</p><p className="text-sm opacity-80">{error}</p></div>)}
                
                {!isLoading && !error && (
                    <div className="flex flex-col gap-12 pb-24">
                        {!currentCondo && (
                            <div className="animate-surgir text-center p-12 bg-black/40 backdrop-blur-xl border border-gray-700/50 text-gray-400 rounded-3xl shadow-xl flex flex-col items-center">
                                <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                                    <Refrigerator size={56} className="text-gray-500" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-2 tracking-tight">Nenhuma máquina selecionada</p>
                                <p className="max-w-md mx-auto text-sm">Por favor, selecione uma máquina na seção "Explorar outras máquinas" acima para começar a encher o seu carrinho.</p>
                            </div>
                        )}
                        {currentCondo && Object.keys(categories).length === 0 && (
                            <div className="animate-surgir text-center p-12 bg-black/40 backdrop-blur-xl border border-gray-700/50 text-gray-400 rounded-3xl shadow-xl flex flex-col items-center">
                                <div className="bg-[#f2bd46]/10 p-6 rounded-full mb-6 border border-[#f2bd46]/20">
                                    <Package size={56} className="text-[#f2bd46]" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-2 tracking-tight">Máquina Vazia!</p>
                                <p className="max-w-md mx-auto text-sm">Parece que não há produtos disponíveis nesta máquina no momento. Que tal verificar outra geladeira próxima?</p>
                            </div>
                        )}
                        {currentCondo && Object.keys(categories).length > 0 && Object.keys(categories).map((category, catIndex) => (
                            <div key={category} className="animate-surgir" style={{ animationDelay: `${200 + catIndex * 100}ms` }}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-8 w-1.5 bg-[#f2bd46] rounded-full shadow-[0_0_10px_rgba(242,189,70,0.8)]"></div>
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">{category}</h2>
                                    <div className="h-px bg-gradient-to-r from-gray-700 to-transparent flex-grow ml-4"></div>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {categories[category].map(product => (
                                        <ProductListCard key={product.id} product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
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
    
    const remainingBalance = userBalance - cartTotal;

    // --- DEFINIÇÃO DAS ANIMAÇÕES (Surgindo + Premium Glow) ---
    const keyframes = `
        @keyframes surgir-modal {
            0% { opacity: 0; transform: scale(0.95) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .animate-surgir-modal {
            animation: surgir-modal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
    `;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <style>{keyframes}</style>
            
            {/* Overlay Escuro com Desfoque */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={!isLoading ? onClose : undefined}
            ></div>
            
            {/* --- MODAL REDESENHADO (Premium Glassmorphism) --- */}
            <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-2xl border border-gray-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 rounded-3xl animate-surgir-modal overflow-hidden">
                
                {/* Ambient Glow interno para dar profundidade */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#f2bd46]/10 blur-[50px] rounded-full pointer-events-none"></div>

                {/* Ícone de Destaque */}
                <div className="w-20 h-20 bg-gradient-to-br from-[#f2bd46]/20 to-transparent border border-[#f2bd46]/40 shadow-[0_0_20px_rgba(242,189,70,0.2)] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <Wallet size={36} className="text-[#f2bd46]" />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-2 tracking-tight">Confirmar Pagamento</h2>
                <p className="text-gray-400 text-sm text-center mb-8 px-2 leading-relaxed">
                    Você está prestes a finalizar sua compra. Por favor, verifique o resumo abaixo.
                </p>
                
                {/* Resumo Financeiro (Premium Receipt Look) */}
                <div className="bg-black/50 border border-gray-800 p-5 rounded-2xl space-y-4 mb-8 shadow-inner relative z-10">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <ShoppingCart size={16} /> Valor da Compra
                        </span> 
                        <span className="text-lg font-bold text-white">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Wallet size={16} /> Seu Saldo Atual
                        </span> 
                        <span className="text-lg font-bold text-green-400">R$ {userBalance.toFixed(2).replace('.', ',')}</span>
                    </div>
                    
                    {/* Linha divisória com gradiente */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2"></div>
                    
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Saldo Restante</span> 
                        <span className="text-2xl font-black text-[#f2bd46] tracking-tight">R$ {remainingBalance.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
                    <button 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="w-full order-2 sm:order-1 bg-black/40 border border-gray-700 hover:bg-white/10 hover:border-gray-500 text-gray-300 hover:text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    
                    <button 
                        onClick={onConfirm} 
                        disabled={isLoading} 
                        className="w-full order-1 sm:order-2 bg-[#f2bd46] text-black font-extrabold py-3.5 px-6 flex items-center justify-center gap-2 rounded-xl shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] transition-all duration-300 hover:-translate-y-0.5 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:transform-none"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <> <CheckCircle2 size={20} /> Confirmar </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente CartPage por este

const CartPage = ({ cart, setCart, setPage, user, setPaymentData, onPaymentSuccess, fridgeId }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    
    // --- NOVO ESTADO: Controla o modal de confirmação (MANTIDO) ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);

    // --- DEFINIÇÃO DAS ANIMAÇÕES E NEON (Visual Premium) ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 10px rgba(242, 189, 70, 0.4), 0 0 20px rgba(242, 189, 70, 0.4); }
            50% { text-shadow: 0 0 15px rgba(242, 189, 70, 0.8), 0 0 30px rgba(242, 189, 70, 0.8); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .neon-text-gold {
            animation: pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
    `;
    
    // --- Classe do Botão Neon (Visual Premium Atualizado) ---
    const neonButtonClass = `
        w-full bg-[#f2bd46] text-black font-extrabold py-4 px-6 text-base sm:text-lg
        flex items-center justify-center gap-2 rounded-2xl 
        shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)]
        transition-all duration-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:transform-none
        transform hover:-translate-y-1
    `;

    // --- FUNÇÕES DE LÓGICA (100% Intocadas) ---
    const updateQuantity = (productId, amount) => {
        const newCart = cart.map(item => {
            if (item.id === productId) return { ...item, quantity: Math.max(0, item.quantity + amount) };
            return item;
        }).filter(item => item.quantity > 0);
        setCart(newCart);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        if (window.confirm('Tem certeza que deseja remover todos os itens do carrinho?')) {
            setCart([]);
        }
    };

    const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.sale_price) * item.quantity), 0);
    const userBalance = parseFloat(user?.wallet_balance || 0);
    const canAfford = userBalance >= cartTotal;
    const difference = cartTotal - userBalance;

    const handleConfirmPayment = async () => {
        setIsLoading(true); 
        setError('');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/orders/pay-with-wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ items: cart, fridgeId: fridgeId, condoId: user.condoId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao pagar com saldo.');
            
            setPaymentData({ orderId: data.orderId }); 
            onPaymentSuccess();
            
            // Limpa o carrinho após o pagamento ser bem-sucedido
            setCart([]);
            
            setIsConfirmModalOpen(false); 
            setPage('postPayment'); 

        } catch (err) {
            setError(err.message);
            setIsConfirmModalOpen(false); 
        } finally {
            setIsLoading(false);
        }
    };

    // --- JSX (Visual Premium Glassmorphism Aplicado) ---
    return (
        <>
            {/* Injeta as animações CSS na página */}
            <style>{keyframes}</style>
            
            {/* --- MODAL DE CONFIRMAÇÃO (Lógica Mantida) --- */}
            <PaymentConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmPayment}
                isLoading={isLoading}
                cartTotal={cartTotal}
                userBalance={userBalance}
            />

            <div 
                className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat pb-20"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop')` }}
            >
                {/* Overlay Escuro e Ambient Glow */}
                <div className="absolute inset-0 bg-black/85 z-0"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#f2bd46]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
                
                {/* --- HEADER (Glassmorphism) --- */}
                <header className="bg-black/60 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] sticky top-0 z-30 border-b border-gray-800/80 relative">
                    <div className="container mx-auto px-4 py-5 flex items-center gap-4">
                        <button 
                            onClick={() => setPage('home')} 
                            className="bg-black/40 hover:bg-white/10 p-2.5 rounded-full border border-gray-700/50 text-gray-300 hover:text-[#f2bd46] transition-all duration-300 backdrop-blur-md"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Meu <span className="text-[#f2bd46]">Carrinho</span></h1>
                    </div>
                </header>
                
                <main className="container mx-auto p-4 md:p-8 relative z-10">
                    {cart.length === 0 ? (
                        // --- CARD VAZIO (Estilo Premium Glassmorphism) ---
                        <div className="animate-surgir max-w-2xl mx-auto mt-10 text-center p-12 bg-black/40 backdrop-blur-2xl border border-gray-700/50 text-gray-400 rounded-3xl shadow-2xl flex flex-col items-center">
                            <div className="bg-gray-800/50 p-6 rounded-full mb-6 border border-gray-700/50 shadow-inner">
                                <ShoppingCart size={56} className="text-gray-500" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Seu carrinho está vazio</h2>
                            <p className="max-w-sm mx-auto text-sm md:text-base text-gray-400 leading-relaxed mb-8">
                                Parece que você ainda não escolheu nenhum produto. Explore nossa máquina e adicione seus itens favoritos!
                            </p>
                            <button 
                                onClick={() => setPage('home')} 
                                className="bg-[#f2bd46] hover:bg-[#e0af40] text-black font-extrabold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] hover:-translate-y-1"
                            >
                                Voltar para a Loja
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                            {/* --- LISTA DE ITENS VISUAL (Estilo Premium) --- */}
                            <div className="lg:col-span-2 flex flex-col gap-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                        <Package size={18} className="text-[#f2bd46]" /> Produtos Selecionados
                                    </h3>
                                    <span className="text-sm font-bold text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">{cart.length} item(s)</span>
                                </div>
                                
                                {cart.map((item, index) => (
                                    // --- CARD DO ITEM ---
                                    <div 
                                        key={item.id} 
                                        className="bg-black/40 backdrop-blur-xl border border-gray-700/50 hover:border-gray-500/80 hover:bg-black/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6 animate-surgir shadow-lg transition-all duration-300 group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Imagem */}
                                        <img 
                                            src={item.image_url || `https://placehold.co/120x120/1a1a1a/4B5563?text=Foto`} 
                                            alt={item.name} 
                                            className="w-full sm:w-28 sm:h-28 aspect-square rounded-xl object-cover border border-gray-700/50 shadow-md group-hover:scale-105 transition-transform duration-500" 
                                        />
                                        
                                        <div className="flex-grow min-w-0 flex flex-col justify-center text-center sm:text-left w-full">
                                            <h3 className="font-extrabold text-white text-lg sm:text-xl truncate">{item.name}</h3>
                                            <p className="text-2xl font-black text-[#f2bd46] mt-1 tracking-tight">R$ {parseFloat(item.sale_price).toFixed(2).replace('.', ',')}</p>
                                        </div>
                                        
                                        {/* Controles e Lixeira */}
                                        <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-auto gap-4 sm:gap-3 border-t sm:border-t-0 border-gray-800 pt-4 sm:pt-0 sm:pl-4 sm:border-l">
                                            {/* Botões de Quantidade Modernos */}
                                            <div className="flex items-center gap-1 bg-black/60 border border-gray-700 rounded-xl p-1 shadow-inner">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-2 sm:p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold w-8 text-center text-white text-lg">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-2 sm:p-2.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            
                                            <button 
                                                onClick={() => removeFromCart(item.id)} 
                                                className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-bold"
                                            >
                                                <Trash2 size={18} /> <span className="sm:hidden">Remover</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* --- RESUMO DO PEDIDO (Estilo de Vidro e Premium) --- */}
                            <div className="lg:col-span-1">
                                <div className="bg-black/40 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-6 sm:p-8 h-fit sticky top-28 animate-surgir shadow-2xl relative overflow-hidden group">
                                    {/* Ambient Glow no Resumo */}
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#f2bd46]/5 blur-[60px] rounded-full pointer-events-none z-0 group-hover:bg-[#f2bd46]/10 transition-colors duration-500"></div>
                                    
                                    <div className="relative z-10">
                                        <h2 className="text-xl font-extrabold mb-6 border-b border-gray-800 pb-4 text-white uppercase tracking-widest flex items-center gap-2">
                                            <FileText size={20} className="text-[#f2bd46]" /> Resumo
                                        </h2>
                                        
                                        <div className="flex justify-between mb-3 text-gray-400 font-medium">
                                            <span>Subtotal</span>
                                            <span className="text-white">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                        <div className="flex justify-between mb-6 text-gray-400 font-medium">
                                            <span>Taxas de conveniência</span>
                                            <span className="text-green-400 font-bold">Grátis</span>
                                        </div>
                                        
                                        {/* --- TOTAL (Neon Gold) --- */}
                                        <div className="flex justify-between text-white items-end font-black text-4xl mb-8 border-t border-gray-800 pt-6">
                                            <span className="text-lg text-gray-400 uppercase tracking-widest mb-1">Total</span>
                                            <span className="text-[#f2bd46] neon-text-gold tracking-tighter">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                        
                                        {/* --- SALDO DA CARTEIRA --- */}
                                        <div className="bg-black/50 border border-gray-800 p-4 rounded-2xl flex items-center justify-between mb-8 shadow-inner">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-500/10 p-2 rounded-lg">
                                                    <Wallet size={20} className="text-green-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Seu Saldo</span>
                                                    <span className="font-bold text-green-400 text-lg">R$ {userBalance.toFixed(2).replace('.', ',')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm font-medium p-3 rounded-xl mb-6 text-center flex items-center justify-center gap-2">
                                                <AlertTriangle size={16} /> {error}
                                            </div>
                                        )}
                                        
                                        {/* --- ALERTA DE SALDO INSUFICIENTE (Premium Look) --- */}
                                        {!canAfford && !isLoading && (
                                            <div className="p-5 bg-red-900/20 border border-red-500/30 rounded-2xl mb-6 shadow-lg backdrop-blur-sm">
                                                <div className="flex items-center gap-2 font-extrabold text-red-400 mb-2">
                                                    <AlertTriangle size={20} /> Saldo Insuficiente
                                                </div>
                                                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                                    Faltam <span className="font-bold text-white">R$ {difference.toFixed(2).replace('.', ',')}</span> para você concluir este pedido.
                                                </p>
                                                <button 
                                                    onClick={() => setPage('wallet')} 
                                                    className="w-full font-bold bg-white text-black rounded-xl py-3 text-sm hover:bg-gray-200 transition-colors shadow-md flex items-center justify-center gap-2"
                                                >
                                                    <PlusCircle size={18} /> Adicionar Saldo Agora
                                                </button>
                                            </div>
                                        )}

                                        {/* --- BOTÕES DE AÇÃO PRINCIPAIS --- */}
                                        <div className="flex flex-col gap-4">
                                            <button 
                                                onClick={() => setIsConfirmModalOpen(true)}
                                                className={neonButtonClass}
                                                disabled={isLoading || !canAfford}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="animate-spin" size={24} />
                                                ) : (
                                                    <> <CheckCircle2 size={22} /> {canAfford ? 'Finalizar Pagamento' : 'Saldo Bloqueado'} </>
                                                )}
                                            </button>
                                            
                                            <button 
                                                onClick={clearCart} 
                                                className="w-full text-sm bg-transparent border border-red-500/30 text-red-400 font-bold py-3.5 rounded-2xl hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} /> Limpar Carrinho
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};
// App.js -> SUBSTITUA o seu componente PixPaymentPage por este

const PixPaymentPage = ({ paymentData, setPage, onPaymentSuccess }) => {
    const [copySuccess, setCopySuccess] = React.useState(false);
    
    // ==========================================================
    // --- CORREÇÃO DO BUG AQUI ---
    // A verificação 'isDeposit' agora checa se 'amount' existe no paymentData.
    // (Depósitos têm 'amount', compras de produto não tinham).
    const isDeposit = paymentData && paymentData.amount > 0;
    // ==========================================================
    
    const cancelTargetPage = isDeposit ? 'wallet' : 'cart';

    // Efeito para a verificação do pagamento (polling)
    React.useEffect(() => {
        const interval = setInterval(async () => {
            if (document.visibilityState !== 'visible') return;
            const token = localStorage.getItem('token');
            try {
                // ==========================================================
                // --- CORREÇÃO DO BUG APLICADA AQUI TAMBÉM ---
                // 'isDepositCheck' agora usa a variável 'isDeposit' corrigida.
                const isDepositCheck = isDeposit;
                // ==========================================================

                const statusUrl = isDepositCheck
                    // Esta é a URL CORRETA que estávamos tentando chamar
                    ? `${API_URL}/api/wallet/deposit-status/${paymentData.orderId}`
                    // Esta é a URL ANTIGA (legado)
                    : `${API_URL}/api/orders/${paymentData.orderId}/status`;
                
                const response = await fetch(statusUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) return;
                
                const data = await response.json();
                
                if (data.status === 'paid') {
                    onPaymentSuccess();
                    clearInterval(interval);
                    // Agora 'isDepositCheck' será 'true' e irá para 'depositSuccess'
                    setPage(isDepositCheck ? 'depositSuccess' : 'postPayment');
                }
            } catch (error) {
                console.error("[Polling] Erro ao processar a resposta do status:", error);
            }
        }, 4000);
        return () => clearInterval(interval);
    // Adicionamos 'isDeposit' ao array de dependências
    }, [paymentData.orderId, setPage, onPaymentSuccess, isDeposit]);

    const handleCopy = () => {
        navigator.clipboard.writeText(paymentData.pix_qr_code_text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
    };

    const handleCancel = () => { setPage(cancelTargetPage); };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-lg bg-[#1a1a1a] p-6 md:p-8 rounded-2xl shadow-2xl">
                
                <div className="text-center mb-6">
                    <img 
                        src="https://i.postimg.cc/5yNYZHHp/Design-sem-nome-(1).png" 
                        alt="SmartFridge Logo" 
                        className="h-10 w-auto mx-auto mb-4"
                    />
                    <p className="text-lg text-gray-300 mt-1">Pagamento via PIX</p>
                </div>

                {/* Mostra o valor se for um depósito */}
                {isDeposit &&
                    <div className="bg-black p-4 rounded-xl text-center mb-6">
                        <p className="text-gray-400">Valor do depósito:</p>
                        <p className="text-3xl font-bold text-[#f2bd46]">R$ {parseFloat(paymentData.amount || 0).toFixed(2).replace('.', ',')}</p>
                    </div>
                }
                
                <div className="text-center mb-6">
                    <p className="text-gray-300">Pague com o seu banco preferido usando uma das opções abaixo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* OPÇÃO 1: QR CODE */}
                    <div className="flex flex-col items-center gap-4 p-4 bg-[#1a1a1a]/50 rounded-lg">
                        <h3 className="font-semibold text-white">1. Escanear o QR Code</h3>
                        <div className='p-2 bg-white rounded-lg inline-block'>
                            <img src={`data:image/jpeg;base64,${paymentData.pix_qr_code}`} alt="PIX QR Code" className="w-44 h-44 mx-auto" />
                        </div>
                        <p className="text-xs text-gray-400 text-center">Use a opção "Pagar com QR Code" no seu banco.</p>
                    </div>

                    {/* OPÇÃO 2: PIX COPIA E COLA */}
                    <div className="flex flex-col items-center gap-4 p-4 bg-[#1a1a1a]/50 rounded-lg">
                        <h3 className="font-semibold text-white">2. PIX Copia e Cola</h3>
                        <p className="text-xs text-gray-400 text-center mb-2">Use a opção "PIX Copia e Cola" no seu banco.</p>
                        <div className="w-full p-3 bg-black rounded-lg">
                            <p className="text-xs text-gray-300 break-words select-all">
                                {paymentData.pix_qr_code_text}
                            </p>
                        </div>
                        {/* Botão de Copiar (Estilo Neon) */}
                        <button 
                            onClick={handleCopy} 
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all duration-300 ease-in-out 
                                        ${copySuccess 
                                            ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' 
                                            : 'bg-[#f2bd46] hover:bg-[#f2bd46] text-white shadow-lg shadow-[#f2bd46]/30 transform hover:scale-105'
                                        }`}
                        >
                            {copySuccess ? (
                                <> <CheckCircle2 size={18} /> Código Copiado! </>
                            ) : (
                                <> <Copy size={18} /> Copiar Código PIX </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-700 pt-6">
                    <div className="flex justify-center items-center gap-3 text-[#f2bd46]">
                        <Loader2 className="animate-spin" />
                        <span>A aguardar confirmação do pagamento...</span>
                    </div>
                    <button 
                        onClick={handleCancel} 
                        className="w-full mt-4 bg-[#1a1a1a] hover:bg-[#1a1a1a] text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Cancelar e Voltar
                    </button>
                </div>
            </div>
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
        <div className="min-h-screen bg-black text-white">
            <header className="bg-[#1a1a1a] shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('cart')} className="text-[#f2bd46] hover:text-[#f2bd46]-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Pagamento com Cartão</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-[#1a1a1a] p-8 rounded-lg">
                    <p className="text-center text-lg text-gray-300 mb-4">Valor da compra: <span className="font-bold text-[#f2bd46]">R$ {cartTotal.toFixed(2).replace('.', ',')}</span></p>
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
        <div className="min-h-screen bg-black text-white">
            <header className="bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-gray-700/50 shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('wallet')} className="text-[#f2bd46] hover:text-[#f2bd46]-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Depositar com Cartão</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto">
                    <p className="text-center text-lg text-gray-300 mb-6">Valor do depósito: <span className="font-bold text-[#f2bd46]">R$ {depositAmount.toFixed(2).replace('.', ',')}</span></p>
                    
                    {/* Container do Brick (Glassmorphism) */}
                    <div className="border-gray-700 backdrop-blur-sm border border-gray-700/50 p-6 rounded-lg">
                        
                        {/* 1. O Brick será renderizado aqui */}
                        <div id="cardPaymentBrick_container"></div>
                        
                        {/* 2. Loader (controlado por DOIS estados) */}
                        {(isBrickLoading || isLoading) && (
                            <div className="flex flex-col justify-center items-center h-48 gap-4">
                                <Loader2 className="animate-spin text-[#f2bd46]" size={32} />
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

const PaymentPage = ({ paymentData, setPage, paymentMethod, user, cart, onPaymentSuccess, setPaymentData, fridgeId }) => {
    switch (paymentMethod) {
        case 'pix':
            return <PixPaymentPage paymentData={paymentData} setPage={setPage} onPaymentSuccess={(unlockToken) => { onPaymentSuccess(); setPaymentData({ unlockToken }); }} />;
        case 'card':
            // Esta chamada está correta, mas o componente CardPaymentPage foi removido ou está com problemas
            // Vamos assumir que CardPaymentPage existe em outro lugar ou será corrigido
             return <CardPaymentPage user={user} cart={cart} setPage={setPage} onPaymentSuccess={onPaymentSuccess} setPaymentData={setPaymentData} fridgeId={fridgeId} />;
        default:
            // Se nenhum método for definido, volta para o carrinho
            setPage('cart');
            return null;
    }
};

const PostPaymentStatusPage = ({ user, setPage }) => {
    // === CONSTANTES DE TEMPO (Lógica Intocada) ===
    const UNLOCK_TIME = 11; // 11 segundos para destravar
    const RELOCK_TIME = 20; // 20 segundos para retravar

    // === ESTADOS (Lógica Intocada) ===
    const [stage, setStage] = React.useState('processing'); // 'processing' | 'success'
    const [countdown, setCountdown] = React.useState(UNLOCK_TIME);
    const propsRef = React.useRef({ user, setPage });

    // === LÓGICA PRINCIPAL DE ESTADO E TEMPO (100% Intocada) ===
    React.useEffect(() => {
        propsRef.current = { user, setPage };
        
        // --- ESTÁGIO 1: PROCESSANDO ---
        if (stage === 'processing') {
            setCountdown(UNLOCK_TIME); 

            const interval = setInterval(() => {
                setCountdown(prev => Math.max(0, prev - 1));
            }, 1000);

            const stageTimeout = setTimeout(() => {
                setStage('success');
            }, UNLOCK_TIME * 1000);

            return () => {
                clearInterval(interval);
                clearTimeout(stageTimeout);
            };
            
        // --- ESTÁGIO 2: SUCESSO ---
        } else if (stage === 'success') {
            setCountdown(RELOCK_TIME); 

            const interval = setInterval(() => {
                setCountdown(prev => Math.max(0, prev - 1));
            }, 1000);

            const redirectTimeout = setTimeout(() => {
                propsRef.current.setPage('home');
            }, RELOCK_TIME * 1000);

            return () => {
                clearInterval(interval);
                clearTimeout(redirectTimeout);
            };
        }

    }, [stage, setPage, user]); 


    // ==============================================
    // --- ANIMAÇÕES (Premium Glassmorphism & Neon) ---
    // ==============================================
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-glow-gold {
            0%, 100% { text-shadow: 0 0 10px rgba(242, 189, 70, 0.4), 0 0 20px rgba(242, 189, 70, 0.4); }
            50% { text-shadow: 0 0 15px rgba(242, 189, 70, 0.8), 0 0 30px rgba(242, 189, 70, 0.8); }
        }
        @keyframes pulse-glow-green {
            0%, 100% { text-shadow: 0 0 10px rgba(74, 222, 128, 0.4), 0 0 20px rgba(74, 222, 128, 0.4); }
            50% { text-shadow: 0 0 15px rgba(74, 222, 128, 0.8), 0 0 30px rgba(74, 222, 128, 0.8); }
        }

        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-neon-text-[#f2bd46] {
            animation: pulse-glow-gold 1.5s ease-in-out infinite;
        }
        .animate-neon-text-green {
            animation: pulse-glow-green 1.5s ease-in-out infinite;
        }
    `;

    // --- COMPONENTE INTERNO: O CRONÔMETRO (Premium Clean com Neon Text) ---
    const TimerCircle = ({ duration, remaining, colorClass, textAnimationClass, filterId }) => {
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (remaining / duration) * circumference;

        return (
            <div className="relative w-56 h-56 mb-8 flex justify-center items-center mx-auto">
                {/* Glow de fundo do círculo */}
                <div className={`absolute inset-0 rounded-full blur-[40px] opacity-20 ${colorClass === 'text-[#f2bd46]' ? 'bg-[#f2bd46]' : 'bg-green-400'}`}></div>
                
                <svg className="w-full h-full relative z-10" viewBox="0 0 200 200">
                    <defs>
                        <filter id={filterId}>
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Círculo de Fundo (cinza escuro) */}
                    <circle
                        className="text-gray-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="100"
                        cy="100"
                    />
                    {/* Círculo de Progresso (Laranja ou Verde animado) */}
                    <circle
                        className={`transition-all duration-1000 ease-linear ${colorClass}`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="100"
                        cy="100"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        filter={`url(#${filterId})`}
                    />
                </svg>
                {/* Texto do Timer (Dentro do Círculo com Efeito Neon) */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className={`text-7xl font-black ${colorClass} ${textAnimationClass} tracking-tighter`}>
                        {countdown}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="min-h-screen text-white flex flex-col justify-center items-center p-4 text-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop')` }}
        >
            <style>{keyframes}</style>
            
            {/* Overlay Escuro */}
            <div className="absolute inset-0 bg-black/85 z-0"></div>
            
            {/* --- CARD PRINCIPAL (Premium Glassmorphism) --- */}
            <div className="w-full max-w-lg bg-black/60 backdrop-blur-2xl border border-gray-700/60 p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 animate-surgir flex flex-col items-center overflow-hidden min-h-[600px]">
                
                {/* Ambient Glow no Topo do Card */}
                <div className={`absolute -top-32 -left-32 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000 ${stage === 'processing' ? 'bg-[#f2bd46]/10' : 'bg-green-500/10'}`}></div>

                {/* --- CONTEÚDO DA ETAPA: PROCESSANDO --- */}
                <div className={`absolute w-full px-8 transition-all duration-700 ease-in-out flex flex-col items-center ${stage === 'processing' ? 'opacity-100 translate-y-0 relative' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
                    <TimerCircle 
                        duration={UNLOCK_TIME} 
                        remaining={countdown} 
                        colorClass="text-[#f2bd46]"
                        textAnimationClass="animate-neon-text-[#f2bd46]"
                        filterId="glow-[#f2bd46]-filter"
                    />
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">Pagamento <span className="text-[#f2bd46]">Aprovado!</span></h1>
                    <p className="text-gray-400 text-base sm:text-lg mb-8">
                        Prepare-se. Sua porta será destravada em <strong className="text-white text-xl">{countdown}</strong> segundos...
                    </p>
                </div>

                {/* --- CONTEÚDO DA ETAPA: SUCESSO --- */}
                <div className={`absolute w-full px-8 transition-all duration-700 ease-in-out flex flex-col items-center ${stage === 'success' ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                    <TimerCircle 
                        duration={RELOCK_TIME} 
                        remaining={countdown} 
                        colorClass="text-green-400"
                        textAnimationClass="animate-neon-text-green"
                        filterId="glow-green-filter"
                    />
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">Porta <span className="text-green-400">Destravada!</span></h1>
                    <p className="text-gray-400 text-base sm:text-lg mb-8">
                        Retire seus produtos. A porta travará novamente em <strong className="text-white text-xl">{countdown}</strong> segundos.
                    </p>
                </div>

                {/* --- ÁREA DE AVISOS IMPORTANTES (Sempre visível) --- */}
                <div className="w-full mt-auto pt-6 border-t border-gray-800/80">
                    <div className="bg-black/40 border border-gray-700/50 rounded-2xl p-5 space-y-4 text-left shadow-inner">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 mt-0.5">
                                <Shield size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5">Ambiente Monitorado</p>
                                <p className="text-xs text-gray-400 leading-relaxed">Para sua segurança, esta área possui vigilância por câmeras 24h.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <div className="bg-[#f2bd46]/10 p-2 rounded-lg border border-[#f2bd46]/20 mt-0.5">
                                <AlertTriangle size={18} className="text-[#f2bd46]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5">Atenção aos Produtos</p>
                                <p className="text-xs text-gray-400 leading-relaxed">Retire exclusivamente os itens que foram pagos. Evite transtornos e cobranças extras.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20 mt-0.5">
                                <CheckCircle2 size={18} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-0.5">Feche a Porta</p>
                                <p className="text-xs text-gray-400 leading-relaxed">Não se esqueça de fechar bem a porta da geladeira ao sair. Bom proveito!</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
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
        <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 text-center">
            <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-xl shadow-2xl">
                <Check size={80} className="text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Porta Destravada!</h1>
                <p className="text-gray-300 mb-6">Retire os seus produtos e feche a porta. Bom apetite!</p>
            </div>
        </div>
    );
};

const DepositSuccessPage = ({ setPage }) => {
    
    // --- LÓGICA INTOCADA ---
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setPage('wallet');
        }, 5000);
        return () => clearTimeout(timer);
    }, [setPage]);

    // --- DEFINIÇÃO DAS ANIMAÇÕES PREMIUM ---
    const keyframes = `
        @keyframes surgir {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes draw-check { 
            100% { stroke-dashoffset: 0; } 
        }
        @keyframes fade-in-scale { 
            0% { opacity: 0; transform: scale(0.5); } 
            60% { transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); } 
        }
        @keyframes fill-redirect-bar {
            from { width: 0%; }
            to { width: 100%; }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.1); }
            50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.3); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fill-redirect {
            animation: fill-redirect-bar 5s linear forwards;
        }
        .animate-glow {
            animation: pulse-glow 2.5s infinite ease-in-out;
        }
    `;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-4 text-center relative overflow-hidden">
            <style>{keyframes}</style>
            
            {/* --- GLOW AMBIENTAL NO FUNDO --- */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
            
            {/* --- CARD REDESENHADO (Glassmorphism Premium) --- */}
            <div className="w-full max-w-md 
                            bg-black/40 backdrop-blur-2xl 
                            border border-green-500/30 
                            p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                            flex flex-col items-center justify-center 
                            min-h-[420px] overflow-hidden relative 
                            animate-surgir z-10"
            >
                
                {/* --- ÍCONE DE CHECKMARK ANIMADO COM CÍRCULO GLOW --- */}
                <div 
                    className="w-32 h-32 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-8 animate-glow"
                    style={{ animation: `fade-in-scale 0.6s ease-out forwards` }}
                >
                    <svg className="w-16 h-16" viewBox="0 0 52 52">
                        <path d="M14 27l5.917 4.917L38 18"
                            fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                            className="stroke-current text-green-400"
                            style={{
                                filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.7))',
                                strokeDasharray: 48, strokeDashoffset: 48,
                                animation: `draw-check 0.6s ease-out 0.4s forwards`
                            }}
                        />
                    </svg>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 tracking-tight mb-3">
                    Depósito Aprovado!
                </h1>
                
                <p className="text-gray-300 text-lg font-medium mb-8">
                    O valor já está disponível na sua carteira.
                </p>
                
                <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">
                    Redirecionando...
                </p>
                
                {/* --- BARRA DE PROGRESSO DE REDIRECIONAMENTO (5s) --- */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-900/80">
                    <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 animate-fill-redirect"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.8))' }}
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
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
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
            <form onSubmit={handleSubmit} className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl shadow-2xl w-full max-w-md animate-surgir">
                
                {/* Ícone de Destaque */}
                <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User size={32} className="text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white text-center mb-6">Editar Meus Dados</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Nome Completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#1a1a1a]/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 mb-1">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#1a1a1a]/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" required />
                </div>
                
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="bg-[#1a1a1a] hover:bg-[#1a1a1a] py-3 px-6 rounded-lg font-medium">Cancelar</button>
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
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
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
            <form onSubmit={handleSubmit} className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl shadow-2xl w-full max-w-md animate-surgir">
                
                {/* Ícone de Destaque */}
                <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <KeyRound size={32} className="text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white text-center mb-6">Alterar Senha</h2>
                
                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Senha Atual</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#1a1a1a]/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Nova Senha</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Mínimo 6 caracteres" className="w-full bg-[#1a1a1a]/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 mb-1">Confirmar Nova Senha</label>
                    <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} placeholder="Repita a nova senha" className="w-full bg-[#1a1a1a]/80 border border-gray-600/50 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" required />
                </div>
                
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                {success && <p className="text-green-400 text-center mb-4">{success}</p>}
                
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onModalClose} className="bg-[#1a1a1a] hover:bg-[#1a1a1a] py-3 px-6 rounded-lg font-medium">Cancelar</button>
                    <button type="submit" disabled={isLoading} className={neonButtonClass}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Alterar Senha'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente MyAccountPage por este

const MyAccountPage = ({ user, setPage, onAccountUpdate, onLogout }) => {
    // Estados para controlar os modais
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);
    const token = localStorage.getItem('token');
    
    // --- ANIMAÇÃO "SURGIR" E NEON ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 15px rgba(242, 189, 70, 0.2); }
            50% { box-shadow: 0 0 30px rgba(242, 189, 70, 0.4); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
    `;

    // Função para pegar a inicial do nome
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    // Componente de item de perfil (REDESENHADO - Visual Premium)
    const ProfileItem = ({ label, value, icon }) => (
        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300 group">
            <div className="bg-black/50 p-3 rounded-xl border border-gray-800 group-hover:bg-[#f2bd46]/10 group-hover:border-[#f2bd46]/30 transition-all duration-300">
                <div className="text-gray-400 group-hover:text-[#f2bd46] transition-colors duration-300">
                    {icon}
                </div>
            </div>
            <div className="flex flex-col justify-center min-w-0">
                <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</label>
                <p className="text-white font-medium truncate text-lg">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <>
            <style>{keyframes}</style>
            
            {/* Os modais são renderizados aqui */}
            <EditProfileModal 
                user={user}
                isOpen={showEditModal} 
                onClose={() => setShowEditModal(false)}
                onSave={onAccountUpdate}
                token={token}
            />
            <ChangePasswordModal
                user={user}
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSave={onAccountUpdate}
                token={token}
            />
        
            <div 
                className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('https://i.ibb.co/N2Hh8yjt/Chat-GPT-Image-12-de-mai-de-2026-10-20-15.png')` }}
            >
                {/* Overlay Escuro e Ambient Glow */}
                <div className="absolute inset-0 bg-black/85 z-0"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#f2bd46]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
                
                {/* --- HEADER (Glassmorphism) --- */}
                <header className="bg-black/60 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] sticky top-0 z-30 border-b border-gray-800/80 relative">
                    <div className="container mx-auto px-4 py-5 flex items-center gap-4">
                        <button 
                            onClick={() => setPage('home')} 
                            className="bg-black/40 hover:bg-white/10 p-2.5 rounded-full border border-gray-700/50 text-gray-300 hover:text-[#f2bd46] transition-all duration-300 backdrop-blur-md"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Minha <span className="text-[#f2bd46]">Conta</span></h1>
                    </div>
                </header>
                
                <main className="container mx-auto p-4 md:p-8 relative z-10">
                    <div className="max-w-3xl mx-auto flex flex-col gap-8">
                    
                        {/* --- FOTO DE PERFIL E BOAS VINDAS (NOVO) --- */}
                        <div className="animate-surgir flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4" style={{ animationDelay: '50ms' }}>
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#f2bd46] to-[#d49f2b] p-1 flex items-center justify-center" style={{ animation: 'pulse-glow 3s infinite' }}>
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center border-4 border-black">
                                        <span className="text-5xl font-black text-[#f2bd46]">{getInitials(user?.name)}</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-[#1a1a1a] p-2 rounded-full border border-gray-700 shadow-lg text-[#f2bd46]">
                                    <Shield size={18} />
                                </div>
                            </div>
                            <div className="text-center sm:text-left mt-2">
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">{user?.name || 'Usuário'}</h2>
                                <p className="text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Conta Verificada e Ativa
                                </p>
                            </div>
                        </div>

                        {/* --- Seção 1: Meus Dados (Glassmorphism Premium) --- */}
                        <div className="animate-surgir bg-black/40 backdrop-blur-2xl border border-gray-700/50 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden group" style={{ animationDelay: '100ms' }}>
                            {/* Reflexo interno suave */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f2bd46]/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#f2bd46]/10 transition-colors duration-500"></div>
                            
                            <div className="flex justify-between items-center mb-8 relative z-10 border-b border-gray-800/80 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#f2bd46]/20 p-2 rounded-lg">
                                        <User size={24} className="text-[#f2bd46]" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-white tracking-tight">Dados Pessoais</h3>
                                </div>
                                {/* Botão Editar (Premium Dourado/Neon) */}
                                <button 
                                    onClick={() => setShowEditModal(true)} 
                                    className="flex items-center gap-2 text-[#f2bd46] hover:text-black transition-all duration-300
                                               bg-[#f2bd46]/10 hover:bg-[#f2bd46] 
                                               border border-[#f2bd46]/30 rounded-xl py-2 px-4 font-bold text-sm shadow-[0_0_15px_rgba(242,189,70,0.15)] hover:shadow-[0_0_20px_rgba(242,189,70,0.4)]"
                                >
                                    <Edit size={16} /> Editar
                                </button>
                            </div>
                            
                            {/* Grid de Informações */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 relative z-10">
                                <ProfileItem label="E-mail" value={user?.email} icon={<Mail size={22} />} />
                                <ProfileItem label="Telefone" value={user?.phone_number} icon={<Phone size={22} />} />
                                <ProfileItem label="CPF" value={user?.cpf} icon={<FileText size={22} />} />
                                <ProfileItem label="Apartamento" value={user?.apartment} icon={<Building2 size={22} />} />
                                <ProfileItem 
                                    label="Data de Nascimento" 
                                    value={user?.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'} 
                                    icon={<Calendar size={22} />} 
                                />
                            </div>
                        </div>
                        
                        {/* --- Seção 2: Segurança (Glassmorphism Premium) --- */}
                        <div className="animate-surgir bg-black/40 backdrop-blur-2xl border border-gray-700/50 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-500/20 p-2 rounded-lg">
                                    <Lock size={24} className="text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-white tracking-tight">Segurança da Conta</h3>
                            </div>
                            
                            {/* Botão Alterar Senha (Redesenhado e Imersivo) */}
                            <button 
                                onClick={() => setShowPasswordModal(true)} 
                                className="w-full bg-black/60 border border-gray-700/80 hover:border-blue-500/50 hover:bg-[#1a1a1a] 
                                           text-white font-bold py-5 px-6 rounded-2xl 
                                           flex justify-between items-center transition-all duration-300 group shadow-lg"
                            >
                                <span className="flex items-center gap-4">
                                    <div className="bg-black p-3 rounded-xl border border-gray-800 group-hover:bg-blue-500/10 transition-colors">
                                        <KeyRound size={22} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-lg">Alterar Senha</span>
                                        <span className="text-xs text-gray-500 font-medium">Mantenha sua conta segura atualizando sua senha regularmente.</span>
                                    </div>
                                </span>
                                <div className="bg-gray-800 group-hover:bg-blue-500 p-2 rounded-full transition-colors">
                                    <ArrowRight size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                                </div>
                            </button>
                        </div>
                        
                    </div>
                </main>
            </div>
        </>
    );
};
// App.js -> SUBSTITUA o seu componente Footer por este

const Footer = () => {
    // --- ESTADOS PARA OS MODAIS ---
    const [modalContent, setModalContent] = React.useState(null);

    // --- ANIMAÇÃO "SURGIR" REFINADA ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
    `;

    // --- AÇÕES ---
    const handleFranquiaClick = () => {
        const whatsappNumber = "5511999999999"; // Coloque seu número aqui
        const message = "Olá! Tenho interesse em ser dono de uma franquia do Daniel Marques Market. Podem me passar mais informações?";
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // --- CONTEÚDOS DOS MODAIS ---
    const renderModalContent = () => {
        switch (modalContent) {
            case 'como-comprar':
                return (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-extrabold text-[#f2bd46] flex items-center gap-3"><ShoppingCart size={28} /> Como Comprar</h2>
                        <p className="text-gray-300 text-sm">Siga os passos abaixo para realizar suas compras de forma rápida e segura:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="bg-[#1a1a1a]/50 p-4 rounded-xl border border-gray-700/50 flex flex-col gap-2">
                                <div className="bg-[#f2bd46]/20 w-10 h-10 rounded-full flex items-center justify-center text-[#f2bd46] font-bold">1</div>
                                <h4 className="font-bold text-white flex items-center gap-2"><Wallet size={16} className="text-[#f2bd46]"/> Adicione Saldo</h4>
                                <p className="text-xs text-gray-400">Deposite um saldo na sua carteira digital via PIX ou Cartão de Crédito.</p>
                            </div>
                            <div className="bg-[#1a1a1a]/50 p-4 rounded-xl border border-gray-700/50 flex flex-col gap-2">
                                <div className="bg-[#f2bd46]/20 w-10 h-10 rounded-full flex items-center justify-center text-[#f2bd46] font-bold">2</div>
                                <h4 className="font-bold text-white flex items-center gap-2"><Search size={16} className="text-[#f2bd46]"/> Escolha os Produtos</h4>
                                <p className="text-xs text-gray-400">Navegue pelo catálogo da máquina selecionada e adicione itens ao carrinho.</p>
                            </div>
                            <div className="bg-[#1a1a1a]/50 p-4 rounded-xl border border-gray-700/50 flex flex-col gap-2">
                                <div className="bg-[#f2bd46]/20 w-10 h-10 rounded-full flex items-center justify-center text-[#f2bd46] font-bold">3</div>
                                <h4 className="font-bold text-white flex items-center gap-2"><CheckCircle2 size={16} className="text-[#f2bd46]"/> Pague e Libere</h4>
                                <p className="text-xs text-gray-400">Finalize a compra com o seu saldo. A porta da geladeira será destrancada.</p>
                            </div>
                            <div className="bg-[#1a1a1a]/50 p-4 rounded-xl border border-gray-700/50 flex flex-col gap-2">
                                <div className="bg-[#f2bd46]/20 w-10 h-10 rounded-full flex items-center justify-center text-[#f2bd46] font-bold">4</div>
                                <h4 className="font-bold text-white flex items-center gap-2"><Package size={16} className="text-[#f2bd46]"/> Retire os Itens</h4>
                                <p className="text-xs text-gray-400">Abra a porta, retire exclusivamente os itens pagos e feche a porta. Bom proveito!</p>
                            </div>
                        </div>
                    </div>
                );
            case 'faq':
                return (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-extrabold text-[#f2bd46] flex items-center gap-3"><Info size={28} /> Dúvidas Frequentes</h2>
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#1a1a1a]/50 p-4 rounded-xl border border-gray-700/50">
                                <h4 className="font-bold text-white mb-1">Como peço reembolso?</h4>
                                <p className="text-xs text-gray-400">Você pode abrir um chamado na aba "Meus Tiquetes" informando o ID da transação. Nossa equipe analisará rapidamente.</p>
                            </div>
                            <div className="bg-[#1a1a1a]/50 p-4 rounded-xl border border-gray-700/50">
                                <h4 className="font-bold text-white mb-1">A porta não abriu, o que eu faço?</h4>
                                <p className="text-xs text-gray-400">Verifique sua conexão com a internet. Se o problema persistir, chame o suporte pelo botão de WhatsApp ou abra um Tíquete.</p>
                            </div>
                            <div className="bg-[#1a1a1a]/50 p-4 rounded-xl border border-gray-700/50">
                                <h4 className="font-bold text-white mb-1">Posso usar cartão de crédito direto?</h4>
                                <p className="text-xs text-gray-400">Sim, você pode recarregar sua carteira virtual utilizando seu cartão de crédito com total segurança.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'termos':
                return (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-extrabold text-[#f2bd46] flex items-center gap-3"><FileText size={28} /> Termos de Uso</h2>
                        <div className="h-64 overflow-y-auto pr-2 text-sm text-gray-400 space-y-4 custom-scrollbar">
                            <p>Bem-vindo ao Daniel Marques Market. Ao utilizar nossos serviços, você concorda com as regras abaixo descritas.</p>
                            <h4 className="font-bold text-white">1. Uso das Máquinas</h4>
                            <p>O usuário concorda em retirar apenas os produtos que foram devidamente pagos através do aplicativo. Qualquer tentativa de fraude ou furto será tratada de acordo com as leis vigentes, com auxílio das câmeras de segurança.</p>
                            <h4 className="font-bold text-white">2. Saldo na Carteira</h4>
                            <p>Os valores depositados na carteira virtual são de uso exclusivo dentro do ecossistema Daniel Marques Market e não sofrem reajustes ou juros.</p>
                            <h4 className="font-bold text-white">3. Responsabilidades</h4>
                            <p>É responsabilidade do usuário fechar corretamente a porta da máquina após a retirada dos produtos. Danos ao equipamento por mau uso podem ser repassados ao usuário cadastrado.</p>
                        </div>
                    </div>
                );
            case 'privacidade':
                return (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-extrabold text-[#f2bd46] flex items-center gap-3"><Shield size={28} /> Política de Privacidade</h2>
                        <div className="h-64 overflow-y-auto pr-2 text-sm text-gray-400 space-y-4 custom-scrollbar">
                            <p>Sua privacidade é nossa prioridade. Coletamos apenas as informações necessárias para garantir o funcionamento seguro do nosso mercado autônomo.</p>
                            <h4 className="font-bold text-white">1. Dados Coletados</h4>
                            <p>Coletamos nome, CPF, e-mail e telefone para identificação. Informações de pagamento são processadas diretamente por plataformas seguras (como o Mercado Pago) e não ficam armazenadas em nossos servidores.</p>
                            <h4 className="font-bold text-white">2. Monitoramento</h4>
                            <p>Para sua segurança e do condomínio/empresa, as áreas ao redor das máquinas possuem monitoramento por vídeo 24h.</p>
                            <h4 className="font-bold text-white">3. Compartilhamento</h4>
                            <p>Não vendemos ou compartilhamos seus dados pessoais com terceiros para fins publicitários sob nenhuma hipótese.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        // --- RODAPÉ REDESENHADO DO ZERO (Premium Corporate Glassmorphism) ---
        <footer className="relative mt-24 bg-black/90 backdrop-blur-3xl z-20 overflow-hidden text-left">
            <style>{keyframes}</style>
            
            {/* Modal Glassmorphism de Informações */}
            {modalContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setModalContent(null)}></div>
                    <div className="relative z-10 w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-700 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-3xl p-6 md:p-8 animate-surgir">
                        <button onClick={() => setModalContent(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                        {renderModalContent()}
                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setModalContent(null)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl transition-colors font-bold">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Linha Dourada de Separação com Glow Brilhante */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f2bd46] to-transparent shadow-[0_0_20px_rgba(242,189,70,0.8)]"></div>
            
            {/* Glow Ambiente de Fundo */}
            <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-[#f2bd46]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <div className="container mx-auto px-6 md:px-12 py-16 relative z-10 animate-surgir">
                
                {/* GRID DE ORGANIZAÇÃO: 1 Coluna (Mobile), 2 (Tablet), 4 (Desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* COLUNA 1: MARCA E SOBRE */}
                    <div className="flex flex-col gap-6 items-start">
                        <img 
                            src="https://i.postimg.cc/5yNYZHHp/Design-sem-nome-(1).png" 
                            alt="Daniel Marques Market Logo" 
                            className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(242,189,70,0.15)]" 
                        />
                        <p className="text-gray-400 text-sm leading-relaxed pr-4">
                            O <span className="text-[#f2bd46] font-bold">Daniel Marques Market</span> revoluciona a forma como você faz compras. Mercados autônomos de alta tecnologia, abertos 24h por dia, levando máxima conveniência para perto de você.
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <a href="https://instagram.com/pronto24h.oficial" target="_blank" rel="noopener noreferrer" className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800 hover:border-[#f2bd46]/50 hover:bg-[#f2bd46]/10 group transition-all duration-300">
                                <Instagram size={20} className="text-gray-400 group-hover:text-[#f2bd46] transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* COLUNA 2: NAVEGAÇÃO E LINKS ÚTEIS */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3 inline-block w-fit">
                            Institucional
                        </h3>
                        <ul className="flex flex-col gap-4">
                            <li><button onClick={() => setModalContent('como-comprar')} className="text-sm text-gray-400 hover:text-[#f2bd46] transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-gray-600 group-hover:text-[#f2bd46] transition-colors"/> Como comprar</button></li>
                            <li><button onClick={() => setModalContent('faq')} className="text-sm text-gray-400 hover:text-[#f2bd46] transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-gray-600 group-hover:text-[#f2bd46] transition-colors"/> Dúvidas Frequentes (FAQ)</button></li>
                            <li><button onClick={() => setModalContent('termos')} className="text-sm text-gray-400 hover:text-[#f2bd46] transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-gray-600 group-hover:text-[#f2bd46] transition-colors"/> Termos de Uso</button></li>
                            <li><button onClick={() => setModalContent('privacidade')} className="text-sm text-gray-400 hover:text-[#f2bd46] transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-gray-600 group-hover:text-[#f2bd46] transition-colors"/> Política de Privacidade</button></li>
                        </ul>
                    </div>

                    {/* COLUNA 3: ATENDIMENTO E ENDEREÇO */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3 inline-block w-fit">
                            Atendimento
                        </h3>
                        <ul className="flex flex-col gap-5">
                            <li>
                                <a href="tel:+5561992729183" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                                    <div className="bg-[#1a1a1a] p-2 rounded-lg border border-gray-800 group-hover:border-[#f2bd46]/50 group-hover:bg-[#f2bd46]/10 transition-colors">
                                        <Phone size={16} className="text-[#f2bd46]" />
                                    </div>
                                    <span className="text-sm font-medium">(61) 99272-9183</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:suporte@danielmarques.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                                    <div className="bg-[#1a1a1a] p-2 rounded-lg border border-gray-800 group-hover:border-[#f2bd46]/50 group-hover:bg-[#f2bd46]/10 transition-colors">
                                        <Mail size={16} className="text-[#f2bd46]" />
                                    </div>
                                    <span className="text-sm font-medium">suporte@danielmarques.com</span>
                                </a>
                            </li>
                            <li className="mt-2">
                                <div className="flex items-start gap-3 text-gray-400">
                                    <div className="bg-[#1a1a1a] p-2 rounded-lg border border-gray-800 mt-1 flex-shrink-0">
                                        <Building2 size={16} className="text-gray-500" />
                                    </div>
                                    <span className="text-sm leading-relaxed">
                                        Hotel S4<br/>
                                        R. 36 Sul, 15<br/>
                                        Águas Claras, Brasília - DF, 71931-360
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* COLUNA 4: SEJA FRANQUEADO (DESTAQUE) */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-[#f2bd46] uppercase tracking-widest border-b border-[#f2bd46]/30 pb-3 flex items-center gap-2">
                            <Building size={20} /> Expansão
                        </h3>
                        
                        <div className="bg-gradient-to-br from-[#f2bd46]/10 to-transparent border border-[#f2bd46]/30 p-6 rounded-2xl relative overflow-hidden group hover:border-[#f2bd46]/60 transition-colors duration-300">
                            {/* Brilho interno animado no hover */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f2bd46]/10 blur-[30px] rounded-full group-hover:bg-[#f2bd46]/20 transition-all duration-500"></div>
                            
                            <h4 className="text-white text-lg font-extrabold mb-2 relative z-10">Seja dono da sua franquia</h4>
                            <p className="text-xs text-gray-300 mb-5 leading-relaxed relative z-10">
                                Leve o Daniel Marques Market para o seu condomínio ou empresa e invista no modelo de negócio que mais cresce no Brasil.
                            </p>
                            <button 
                                onClick={handleFranquiaClick}
                                className="w-full bg-[#f2bd46] text-black font-extrabold py-3 px-4 rounded-xl text-sm flex justify-center items-center gap-2 hover:bg-[#e0af40] shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] transition-all duration-300 transform hover:-translate-y-1 relative z-10"
                            >
                                <MessageSquare size={18} /> Quero ser Franqueado
                            </button>
                        </div>
                    </div>

                </div>

                {/* PARTE DE BAIXO: DIREITOS AUTORAIS */}
                <div className="border-t border-gray-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500 font-medium text-center md:text-left">
                        &copy; {new Date().getFullYear()} <span className="text-gray-300 font-bold tracking-wide">Daniel Marques Market</span>. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-gray-600 font-medium text-center md:text-right">
                        Feito com tecnologia de ponta para sua comodidade.
                    </p>
                </div>

            </div>
        </footer>
    );
};

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
        <div className="min-h-screen bg-black text-white">
            <header className="bg-[#1a1a1a] shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-[#f2bd46] hover:text-[#f2bd46]-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Mudar de Condomínio</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-md mx-auto bg-[#1a1a1a] p-8 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Selecione o seu novo condomínio</h2>
                    <div className="flex flex-col gap-3">
                        {condos.map(condo => (
                            <button key={condo.id} onClick={() => setSelectedCondoId(condo.id)} className={`w-full text-left p-4 rounded-lg transition ${selectedCondoId === condo.id ? 'bg-[#f2bd46] font-bold' : 'bg-[#1a1a1a] hover:bg-[#1a1a1a]'}`}>
                                {condo.name}
                            </button>
                        ))}
                    </div>
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    <button onClick={handleUpdateCondo} disabled={isLoading || selectedCondoId === user.condoId} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-[#1a1a1a] disabled:cursor-not-allowed">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Mudança'}
                    </button>
                </div>
            </main>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente DepositModal por este

const DepositModal = ({ isOpen, onClose, onPix, onCard, depositAmount, setDepositAmount, formError }) => {
    // --- Keyframes para animação do card e botão (Neon Estático) ---
    const keyframes = `
        @keyframes surgir { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-surgir { animation: surgir 0.3s ease-out forwards; }
    `;
    
    // --- Classe do Botão Neon (PIX - Verde) ---
    const neonButtonPixClass = `
        bg-green-600 text-white font-bold py-3 px-4 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-green-500/40 hover:shadow-green-500/60
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
        transform hover:scale-105
    `;
    // --- Classe do Botão Neon (Cartão - Azul) ---
    const neonButtonCardClass = `
        bg-blue-600 text-white font-bold py-3 px-4 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
        transform hover:scale-105
    `;

    if (!isOpen) return null;

    const handlePix = () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            onPix(0); // Deixa o handler principal (onPix) mostrar o erro
            return;
        }
        onPix(parseFloat(depositAmount));
    };

    const handleCard = () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            onCard(0); // Deixa o handler principal (onCard) mostrar o erro
            return;
        }
        onCard(parseFloat(depositAmount));
    };
    
    // --- NOVO: Botões de Valor Rápido ---
    const quickValues = [20, 50, 100, 150, 200];

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <style>{keyframes}</style>
            {/* --- MODAL REDESENHADO (Glassmorphism e Animação) --- */}
            <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl shadow-2xl w-full max-w-md animate-surgir">
                
                {/* Ícone de Destaque */}
                <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ArrowDownToLine size={32} className="text-green-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white text-center mb-6">Depositar na Carteira</h2>
                
                {/* --- BOTÕES DE VALOR RÁPIDO --- */}
                <label className="block text-sm text-gray-200 mb-2">Valores rápidos (R$)</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                    {quickValues.map(value => (
                        <button
                            key={value}
                            onClick={() => setDepositAmount(value.toString())}
                            className={`py-3 px-2 font-bold rounded-lg transition
                                        ${parseFloat(depositAmount) === value 
                                            ? 'bg-[#f2bd46] text-white shadow-lg shadow-[#f2bd46]/30' 
                                            : 'bg-[#1a1a1a]/50 border border-gray-600/50 hover:bg-[#1a1a1a]'
                                        }`}
                        >
                            {value.toFixed(2).replace('.', ',')}
                        </button>
                    ))}
                </div>
                
                {/* --- CAMPO PERSONALIZADO --- */}
                <div className="relative mb-4">
                    <label className="block text-sm text-gray-200 mb-1">Ou digite um valor personalizado (R$)</label>
                    <DollarSign className="absolute left-3 top-1/2 mt-2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="number" 
                        placeholder="0,00" 
                        value={depositAmount} 
                        onChange={(e) => setDepositAmount(e.target.value)} 
                        className="w-full bg-[#1a1a1a]/50 border border-gray-600/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" 
                    />
                </div>
                {formError && <p className="text-red-400 text-sm text-center mb-4">{formError}</p>}
                
                {/* Botões de Ação (Neon) */}
                <div className="flex flex-col gap-4 mt-6">
                    <button 
                        onClick={handlePix} 
                        className={neonButtonPixClass} // Botão Neon Verde
                    >
                        <QrCode /> Pagar com PIX
                    </button>
                    <button 
                        onClick={handleCard} 
                        className={neonButtonCardClass} // Botão Neon Azul
                    >
                        <CreditCard /> Pagar com Cartão
                    </button>
                </div>
                
                <button type="button" onClick={onClose} className="w-full text-center text-gray-400 hover:text-white mt-6 transition">Cancelar</button>
            </div>
        </div>
    );
};

const TransferModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    recipientEmail, 
    setRecipientEmail, 
    transferAmount, 
    setTransferAmount, 
    formError, 
    isVerifying 
}) => {
    // --- Keyframes para animação do card e botão ---
    const keyframes = `
        @keyframes surgir { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes neon-pulse-shadow {
            0%, 100% { box-shadow: 0 0 8px rgba(249, 115, 22, 0.5), 0 0 12px rgba(249, 115, 22, 0.5); }
            50% { box-shadow: 0 0 12px rgba(249, 115, 22, 0.8), 0 0 20px rgba(249, 115, 22, 0.8); }
        }
        .animate-surgir { animation: surgir 0.3s ease-out forwards; }
        .neon-button-[#f2bd46] { animation: neon-pulse-shadow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    `;
    
    // --- Classe do Botão Neon (Verificar) ---
    const neonButtonClass = `
        bg-[#f2bd46] text-white font-bold py-3 px-4 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-[#f2bd46]/30 hover:shadow-[#f2bd46]/50
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
        neon-button-[#f2bd46]
    `;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            <style>{keyframes}</style>
            {/* --- MODAL REDESENHADO (Glassmorphism e Animação) --- */}
            <form onSubmit={onSubmit} className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl shadow-2xl w-full max-w-md animate-surgir">
                
                {/* Ícone de Destaque */}
                <div className="w-16 h-16 bg-[#f2bd46]/20 border-2 border-[#f2bd46] rounded-full flex items-center justify-center mx-auto mb-6">
                    <ArrowRightLeft size={32} className="text-[#f2bd46]" />
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-6">Transferir Saldo</h2>

                <div className="relative mb-4">
                    <label className="block text-sm text-white mb-1">E-mail do Destinatário</label>
                    <Mail className="absolute left-3 top-1/2 mt-2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="email" 
                        placeholder="email@exemplo.com" 
                        value={recipientEmail} 
                        onChange={(e) => setRecipientEmail(e.target.value)} 
                        className="w-full bg-[#1a1a1a]/80 border border-gray-600/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" 
                        required 
                    />
                </div>
                <div className="relative mb-4">
                    <label className="block text-sm text-white mb-1">Valor da Transferência (R$)</label>
                    <DollarSign className="absolute left-3 top-1/2 mt-2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="number" 
                        placeholder="0,00" 
                        value={transferAmount} 
                        onChange={(e) => setTransferAmount(e.target.value)} 
                        className="w-full bg-[#1a1a1a]/80 border border-gray-600/50 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#f2bd46]" 
                        required 
                    />
                </div>
                {formError && <p className="text-red-400 text-sm text-center mb-4">{formError}</p>}
                
                <button 
                    type="submit" 
                    disabled={isVerifying} 
                    className={`${neonButtonClass} w-full mt-4`} // Botão Neon
                >
                    {isVerifying ? <Loader2 className="animate-spin" /> : 'Verificar e Transferir'}
                </button>
                
                <button type="button" onClick={onClose} className="w-full text-center text-gray-400 hover:text-white mt-6 transition">Cancelar</button>
            </form>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente WalletPage por este

const WalletPage = ({ user, setPage, setPaymentData, setDepositData, setPaymentMethod, updateUserBalance, showToast, condos }) => {
    // --- ESTADOS (Logica 100% Intocada) ---
    const [showBalance, setShowBalance] = React.useState(true);
    const [recentTransactions, setRecentTransactions] = React.useState([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = React.useState(true);
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
    const [depositAmount, setDepositAmount] = React.useState('');
    const [transferAmount, setTransferAmount] = React.useState('');
    const [recipientEmail, setRecipientEmail] = React.useState('');
    const [formError, setFormError] = React.useState('');
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [isTransferring, setIsTransferring] = React.useState(false);
    const [recipientDetails, setRecipientDetails] = React.useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
    
    // --- DEFINIÇÃO DAS ANIMAÇÕES (Surgindo + Neon/Pulso Refinados) ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes neon-pulse-gold-text {
            0%, 100% { text-shadow: 0 0 5px rgba(242, 189, 70, 0.4), 0 0 10px rgba(242, 189, 70, 0.4); }
            50% { text-shadow: 0 0 10px rgba(242, 189, 70, 0.8), 0 0 20px rgba(242, 189, 70, 0.8); }
        }
        @keyframes neon-pulse-green-icon {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(74, 222, 128, 0.4)); }
            50% { filter: drop-shadow(0 0 12px rgba(74, 222, 128, 0.8)); }
        }
        @keyframes neon-pulse-red-icon {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(248, 113, 113, 0.4)); }
            50% { filter: drop-shadow(0 0 12px rgba(248, 113, 113, 0.8)); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .neon-text-gold {
            animation: neon-pulse-gold-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .neon-icon-green {
            animation: neon-pulse-green-icon 2s ease-in-out infinite;
        }
        .neon-icon-red {
            animation: neon-pulse-red-icon 2s ease-in-out infinite;
        }
    `;

    // --- FUNÇÕES DE LÓGICA (100% Intocadas) ---
    React.useEffect(() => {
        updateUserBalance();
        const fetchRecent = async () => {
            setIsLoadingTransactions(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/wallet/recent-transactions`, { headers: { 'Authorization': `Bearer ${token}` } });
                if(response.ok) {
                    const data = await response.json();
                    setRecentTransactions(data);
                }
            } catch (error) { console.error("Erro ao buscar transações recentes:", error); }
            finally { setIsLoadingTransactions(false); }
        };
        fetchRecent();
    }, [updateUserBalance]);

    const handleCreatePixDeposit = async (amount) => {
        if (!amount || amount <= 0) { setFormError('Por favor, insira um valor válido.'); return; }
        setFormError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/wallet/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao criar depósito PIX.');
            
            setPaymentData({ ...data, amount });
            setPaymentMethod('pix');
            setIsDepositModalOpen(false); 
            setPage('payment');
        } catch (err) { setFormError(err.message); }
    };
    
    const handleProceedToCardDeposit = (amount) => {
        if (!amount || amount <= 0) { setFormError('Por favor, insira um valor válido.'); return; }
        setFormError('');
        
        setDepositData({ amount: amount });
        setIsDepositModalOpen(false); 
        setPage('card-deposit');
    };

    const handleVerifyRecipient = async (e) => {
        e.preventDefault(); 
        if (!recipientEmail || !transferAmount || parseFloat(transferAmount) <= 0) {
            setFormError('Preencha o e-mail do destinatário e um valor válido.');
            return;
        }
        setIsVerifying(true);
        setFormError('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/wallet/verify-recipient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ recipientEmail })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setRecipientDetails(data);
            setIsTransferModalOpen(false); 
            setShowConfirmationModal(true); 
        } catch (err) {
            setFormError(err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleConfirmTransfer = async () => {
        setIsTransferring(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/wallet/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ recipientEmail, amount: parseFloat(transferAmount) })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            setShowConfirmationModal(false);
            showToast("Transferência realizada com sucesso!");
            await updateUserBalance(); 
            setRecipientEmail('');
            setTransferAmount('');
        } catch (err) {
            setFormError(err.message);
            setShowConfirmationModal(false); 
            setIsTransferModalOpen(true); 
        } finally {
            setIsTransferring(false);
        }
    };
    
    // ==========================================================
    // --- ATIVIDADE RECENTE (Visual Premium Glassmorphism) ---
    // ==========================================================
    const WalletActivityItem = ({ tx }) => {
        const isDeposit = tx.type === 'deposit' || tx.type === 'transfer_in';
        const iconClass = isDeposit ? 'neon-icon-green text-green-400' : 'neon-icon-red text-red-400';
        
        return (
            <div className="animate-surgir bg-black/40 backdrop-blur-md border border-gray-700/50 p-4 sm:p-5 rounded-2xl flex items-center gap-4 sm:gap-5 hover:bg-black/60 hover:border-gray-500/80 transition-all duration-300 shadow-lg group">
                {/* Ícone (Neon e Colorido) */}
                <div className={`flex-shrink-0 bg-black/50 p-3 rounded-xl border border-gray-800 group-hover:bg-[#1a1a1a] transition-colors ${iconClass}`}>
                    {React.cloneElement(getTransactionIcon(tx.type), { size: 24 })}
                </div>
                
                <div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    {/* Coluna da Esquerda (Nome e Data) */}
                    <div className="min-w-0">
                        <h4 className="font-extrabold capitalize text-white truncate text-lg group-hover:text-gray-200 transition-colors">
                            {tx.description || tx.type.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Calendar size={14} className="opacity-70" /> {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    
                    {/* Coluna da Direita (Valor) */}
                    <p className={`font-black text-xl flex-shrink-0 tracking-tight ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                    </p>
                </div>
            </div>
        );
    }
    
    // Componente de Botão de Ação (Visual Premium)
    const WalletActionCard = ({ icon, label, onClick }) => (
        <div 
            onClick={onClick} 
            className="animate-surgir bg-black/40 backdrop-blur-xl border border-gray-700/50 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-[#1a1a1a]/80 hover:border-[#f2bd46]/50 cursor-pointer transition-all duration-300 shadow-lg group"
        >
            <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800 group-hover:bg-[#f2bd46]/10 transition-colors duration-300">
                <div className="text-gray-400 group-hover:text-[#f2bd46] transition-colors duration-300 drop-shadow-[0_0_8px_rgba(242,189,70,0.1)] group-hover:drop-shadow-[0_0_12px_rgba(242,189,70,0.6)]">
                    {icon}
                </div>
            </div>
            <span className="font-bold text-gray-300 group-hover:text-white text-sm tracking-wide">{label}</span>
        </div>
    );

    // --- JSX (Logica e props intocadas) ---
    return (
        <>
            <style>{keyframes}</style>
            
            <TransferConfirmationModal 
                isOpen={showConfirmationModal} 
                onClose={() => setShowConfirmationModal(false)} 
                onConfirm={handleConfirmTransfer} 
                recipient={recipientDetails} 
                amount={transferAmount} 
                isTransferring={isTransferring} 
            />
            <DepositModal
                isOpen={isDepositModalOpen}
                onClose={() => { setIsDepositModalOpen(false); setFormError(''); setDepositAmount(''); }}
                onPix={handleCreatePixDeposit}
                onCard={handleProceedToCardDeposit}
                depositAmount={depositAmount}
                setDepositAmount={setDepositAmount}
                formError={formError}
            />
            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => { setIsTransferModalOpen(false); setFormError(''); setRecipientEmail(''); setTransferAmount(''); }}
                onSubmit={handleVerifyRecipient}
                recipientEmail={recipientEmail}
                setRecipientEmail={setRecipientEmail}
                transferAmount={transferAmount}
                setTransferAmount={setTransferAmount}
                formError={formError}
                isVerifying={isVerifying}
            />

            <div 
                className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('https://i.ibb.co/N2Hh8yjt/Chat-GPT-Image-12-de-mai-de-2026-10-20-15.png')` }}
            >
                {/* Overlay Escuro e Ambient Glow */}
                <div className="absolute inset-0 bg-black/85 z-0"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#f2bd46]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
                
                {/* --- HEADER (Glassmorphism) --- */}
                <header className="bg-black/60 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] sticky top-0 z-30 border-b border-gray-800/80 relative">
                    <div className="container mx-auto px-4 py-5 flex items-center gap-4">
                        <button 
                            onClick={() => setPage('home')} 
                            className="bg-black/40 hover:bg-white/10 p-2.5 rounded-full border border-gray-700/50 text-gray-300 hover:text-[#f2bd46] transition-all duration-300 backdrop-blur-md"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Minha <span className="text-[#f2bd46]">Carteira</span></h1>
                    </div>
                </header>
                
                <main className="container mx-auto p-4 md:p-8 flex flex-col gap-8 max-w-2xl relative z-10">
                    
                    {/* --- CARD DE SALDO (Premium Credit Card Look) --- */}
                    <div className="animate-surgir relative p-8 rounded-3xl shadow-2xl overflow-hidden group">
                        {/* Background Layers */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-2xl border border-gray-700/50 group-hover:border-[#f2bd46]/30 transition-colors duration-500 z-0"></div>
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#f2bd46]/10 blur-[60px] rounded-full z-0 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Wallet size={16} className="text-[#f2bd46]" /> Saldo Disponível
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowBalance(!showBalance)} 
                                    className="text-gray-400 hover:text-white bg-black/50 p-2.5 rounded-full border border-gray-700/50 transition-colors"
                                >
                                    {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            
                            <div className="flex items-baseline gap-2">
                                {showBalance ? (
                                    <>
                                        <span className="text-2xl text-gray-400 font-bold">R$</span>
                                        <p className="text-5xl sm:text-6xl font-black text-[#f2bd46] neon-text-gold tracking-tighter">
                                            {user?.wallet_balance ? parseFloat(user.wallet_balance).toFixed(2).replace('.', ',') : '0,00'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl text-gray-400 font-bold">R$</span>
                                        <p className="text-5xl sm:text-6xl font-black text-white tracking-tighter mt-1">●●●●,●●</p>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex justify-between items-end mt-8 border-t border-gray-700/50 pt-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Titular da Conta</p>
                                    <p className="text-lg font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs">{user?.name}</p>
                                </div>
                                <PiggyBank size={36} className="text-[#f2bd46]/30 group-hover:text-[#f2bd46]/60 transition-colors duration-500" />
                            </div>
                        </div>
                    </div>
                    
                    {/* --- BOTÕES DE AÇÃO (Glassmorphism) --- */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                        <WalletActionCard icon={<ArrowDownToLine size={24} />} label="Depositar" onClick={() => setIsDepositModalOpen(true)} />
                        <WalletActionCard icon={<ArrowRightLeft size={24} />} label="Transferir" onClick={() => setIsTransferModalOpen(true)} />
                        <WalletActionCard icon={<History size={24} />} label="Extrato" onClick={() => setPage('history')} />
                    </div>

                    {/* --- ATIVIDADE RECENTE --- */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Atividade Recente</h3>
                            <div className="h-px bg-gradient-to-r from-gray-700 to-transparent flex-grow"></div>
                        </div>
                        
                        {isLoadingTransactions ? (
                            <div className="flex flex-col justify-center items-center h-32 gap-3">
                                <Loader2 className="animate-spin text-[#f2bd46]" size={32} />
                                <span className="text-gray-400 text-sm font-bold tracking-widest animate-pulse">CARREGANDO...</span>
                            </div>
                        ) : recentTransactions.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {recentTransactions.map(tx => (
                                    <WalletActivityItem key={tx.id} tx={tx} />
                                ))}
                            </div>
                        ) : (
                            <div className="animate-surgir text-center p-8 bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-lg flex flex-col items-center">
                                <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                                    <History size={32} className="text-gray-500" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-1">Nenhuma atividade recente</h4>
                                <p className="text-sm text-gray-400">Suas transações recentes aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

const AdminStatCard = ({ icon, label, value, colorClass = 'text-[#f2bd46]' }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-lg flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-[#1a1a1a] ${colorClass}`}>{icon}</div>
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
        <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Flame className="text-[#f2bd46]" /> Promoções do Dia</h3>
            {isLoading ? <Loader2 className="animate-spin" /> : promotions.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {promotions.map(p => (
                        <div key={p.id} className="bg-[#1a1a1a] p-2 rounded-md text-center">
                            <img src={p.image_url || 'https://placehold.co/100x100/374151/ffffff?text=Sem+Foto'} alt={p.name} className="w-full h-20 object-cover rounded-md mb-2" />
                            <p className="text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-xs text-gray-400 line-through">R$ {parseFloat(p.sale_price).toFixed(2)}</p>
                            <p className="font-bold text-[#f2bd46]">R$ {parseFloat(p.promotional_price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-400">Nenhuma promoção ativa hoje.</p>}
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente EntradasVendasPage por este

const EntradasVendasPage = ({ condominiums, token }) => {
    const [reportData, setReportData] = React.useState({ log: [], summary: {}, pagination: {} });
    const [expandedRow, setExpandedRow] = React.useState(null);

    const getTodayInBrasilia = () => {
        const date = new Date();
        const [day, month, year] = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const [filterInputs, setFilterInputs] = React.useState({ condoId: condominiums[0]?.id || '', startDate: '', endDate: '' });
    const [activeFilters, setActiveFilters] = React.useState({ condoId: condominiums[0]?.id || '', startDate: '', endDate: '' });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const fetchLogData = React.useCallback(async (page = 1) => {
        if (!activeFilters.condoId) return;
        setIsLoading(true); setError(''); setCurrentPage(page);
        
        const params = new URLSearchParams({ condoId: activeFilters.condoId, page: page, limit: 10 });
        if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
        if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);

        try {
            const response = await fetch(`${API_URL}/api/admin/sales?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar dados.');
            const data = await response.json();
            setReportData({ log: data.log || [], summary: data.summary || {}, pagination: data.pagination || {} });
        } catch (err) {
            setError(err.message);
            setReportData({ log: [], summary: {}, pagination: {} });
        } finally {
            setIsLoading(false);
        }
    }, [activeFilters, token]);

    React.useEffect(() => { fetchLogData(currentPage); }, [activeFilters, currentPage, fetchLogData]);

    const handleInputChange = (e) => { setFilterInputs(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleApplyFilters = () => { setCurrentPage(1); setActiveFilters(filterInputs); };
    
    const handleFilterToday = () => {
        const today = getTodayInBrasilia();
        const newFilters = { ...filterInputs, startDate: today, endDate: today };
        setFilterInputs(newFilters);
        setActiveFilters(newFilters);
        setCurrentPage(1);
    };

    const toggleRow = (id) => {
        setExpandedRow(prev => prev === id ? null : id);
    };
    
    const handleRefund = async (orderId, amount) => {
        if (!window.confirm(`Tem certeza que deseja reembolsar o pedido #${orderId} no valor de R$ ${parseFloat(amount).toFixed(2)}?`)) return;

        try {
            const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/refund`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao processar reembolso.');
            alert(data.message);
            fetchLogData(currentPage);
        } catch (err) {
            alert(`Erro: ${err.message}`);
        }
    };

    const summary = reportData.summary;
    const ticketMedio = summary.total_orders > 0 ? summary.total_revenue / summary.total_orders : 0;

    // ==============================================
    // --- ANIMAÇÕES E COMPONENTES VISUAIS PREMIUM ---
    // ==============================================
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
    `;

    // Card de Estatística Premium Local (Substitui o AdminStatCard antigo visualmente)
    const StatCard = ({ icon, label, value, colorClass, delay }) => (
        <div 
            className="animate-surgir bg-black/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-gray-500/50 transition-all duration-300"
            style={{ animationDelay: delay }}
        >
            <div className={`absolute -right-10 -top-10 w-24 h-24 blur-[40px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${colorClass.replace('text-', 'bg-')}`}></div>
            <div className="flex items-start mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-black/50 border border-gray-800 ${colorClass} shadow-inner group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-2xl lg:text-3xl font-black tracking-tighter ${colorClass}`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 pb-12 relative z-10">
            <style>{keyframes}</style>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800/80 pb-6 animate-surgir">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-1">
                        Relatório de Vendas
                    </h2>
                    <p className="text-gray-400 font-medium text-sm">Acompanhamento detalhado de entradas e estornos</p>
                </div>
            </div>
            
            {/* --- FILTROS RESPONSIVOS (Painel Glassmorphism) --- */}
            <div className="bg-black/60 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl shadow-xl border border-gray-700/80 relative overflow-hidden animate-surgir" style={{ animationDelay: '50ms' }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2bd46]/50 to-transparent"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end relative z-10">
                    <div className="w-full">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Condomínio</label>
                        <select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="w-full bg-black/50 border border-gray-600 rounded-xl py-3 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all cursor-pointer">
                            {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={14}/> De</label>
                        <input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="w-full bg-black/50 border border-gray-600 rounded-xl py-3 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all [color-scheme:dark]" />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={14}/> Até</label>
                        <input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="w-full bg-black/50 border border-gray-600 rounded-xl py-3 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all [color-scheme:dark]" />
                    </div>
                    
                    <button onClick={handleFilterToday} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] flex justify-center items-center gap-2 border border-blue-400/50">
                        Hoje
                    </button>
                    <button onClick={handleApplyFilters} className="w-full bg-[#f2bd46] hover:bg-[#e0af40] text-black font-extrabold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] flex justify-center items-center gap-2">
                        <Filter size={18} /> Aplicar
                    </button>
                </div>
            </div>

            {/* --- CARDS DE RESUMO --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
                <StatCard icon={<DollarSign size={24} />} label="Faturamento" value={`R$ ${summary.total_revenue?.toFixed(2) || '0.00'}`} colorClass="text-green-400" delay="100ms" />
                <StatCard icon={<PiggyBank size={24} />} label="Lucro Líquido" value={`R$ ${summary.total_net_profit?.toFixed(2) || '0.00'}`} colorClass="text-teal-400" delay="150ms" />
                <StatCard icon={<ArrowRightLeft size={24} />} label="Reembolsado" value={`R$ ${summary.total_refunded?.toFixed(2) || '0.00'}`} colorClass="text-red-400" delay="200ms" />
                <StatCard icon={<ShoppingCart size={24} />} label="Vendas Pagas" value={summary.total_orders || 0} colorClass="text-blue-400" delay="250ms" />
                <StatCard icon={<UsersIcon size={24} />} label="Ticket Médio" value={`R$ ${ticketMedio.toFixed(2)}`} colorClass="text-purple-400" delay="300ms" />
            </div>

            {/* --- HISTÓRICO DE TRANSAÇÕES --- */}
            <div className="mt-4 animate-surgir" style={{ animationDelay: '350ms' }}>
                <h3 className="text-xl md:text-2xl font-extrabold flex items-center gap-3 mb-6 tracking-tight">
                    <div className="bg-gray-800 p-2 rounded-xl border border-gray-700">
                        <History className="text-white" size={24} />
                    </div>
                    Lista de Transações
                </h3>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-48 gap-4 bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl">
                        <Loader2 className="animate-spin text-[#f2bd46]" size={40} />
                        <span className="text-gray-400 font-bold tracking-widest text-sm animate-pulse">CARREGANDO DADOS...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-6 rounded-2xl flex items-center gap-3">
                        <AlertTriangle size={24} /> {error}
                    </div>
                ) : (
                    <>
                        {/* --- VERSÃO DESKTOP (Tabela Premium Glassmorphism) --- */}
                        <div className="hidden md:block bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-black/60 border-b border-gray-700/80 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="p-5 w-10"></th>
                                            <th className="p-5">Cliente</th>
                                            <th className="p-5">Data & Hora</th>
                                            <th className="p-5">Faturamento</th>
                                            <th className="p-5">Lucro Líquido</th>
                                            <th className="p-5">Status</th>
                                            <th className="p-5 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/80">
                                        {reportData.log?.length > 0 ? reportData.log.map(item => (
                                            <React.Fragment key={item.id}>
                                                <tr className={`transition-colors duration-300 ${item.status === 'refunded' ? 'bg-red-900/10' : 'hover:bg-white/5'}`}>
                                                    <td className="p-5">
                                                        <button onClick={() => toggleRow(item.id)} className="text-gray-500 hover:text-[#f2bd46] transition-colors bg-black/50 p-1.5 rounded-lg border border-gray-700">
                                                            {expandedRow === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="font-bold text-white block">{item.user_name}</span>
                                                        <span className="text-gray-500 text-xs font-mono mt-0.5 block">{item.user_cpf}</span>
                                                    </td>
                                                    <td className="p-5 text-sm text-gray-400 font-medium">
                                                        {new Date(item.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </td>
                                                    <td className={`p-5 font-black tracking-tight ${item.status === 'refunded' ? 'line-through text-gray-600' : 'text-white'}`}>
                                                        R$ {parseFloat(item.amount).toFixed(2)}
                                                    </td>
                                                    <td className={`p-5 font-black tracking-tight ${item.status === 'refunded' ? 'line-through text-gray-600' : 'text-teal-400'}`}>
                                                        R$ {parseFloat(item.net_profit).toFixed(2)}
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wider border ${item.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                                            {item.status === 'paid' ? 'PAGO' : 'ESTORNADO'}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <button 
                                                            onClick={() => handleRefund(item.id, item.amount)} 
                                                            disabled={item.status === 'refunded'} 
                                                            className="bg-transparent hover:bg-red-500/20 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold py-2 px-4 rounded-xl border border-red-500/30 transition-all duration-300 flex items-center gap-2 mx-auto"
                                                        >
                                                            <ArrowRightLeft size={14} /> Reembolsar
                                                        </button>
                                                    </td>
                                                </tr>
                                                
                                                {/* Detalhes da Linha Expandida */}
                                                {expandedRow === item.id && (
                                                    <tr className="bg-black/60 border-b border-gray-700/80 shadow-inner">
                                                        <td colSpan="7" className="p-6 pl-16">
                                                            <div className="bg-black/50 p-5 rounded-2xl border border-gray-700/50 shadow-lg">
                                                                <h4 className="font-black text-gray-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                    <Package size={14} /> Produtos do Pedido #{item.id}
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {item.items.map((prod, idx) => (
                                                                        <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                                                                            <span className="text-sm text-gray-300 font-medium flex items-center gap-2">
                                                                                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs font-bold">{prod.quantity}x</span> 
                                                                                {prod.product_name}
                                                                            </span>
                                                                            <span className="font-mono font-bold text-[#f2bd46]">R$ {parseFloat(prod.price).toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        )) : (
                                            <tr><td colSpan="7" className="text-center p-12 text-gray-500 font-medium">Nenhum registro encontrado neste período.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- VERSÃO MOBILE (Cards Premium Glassmorphism) --- */}
                        <div className="md:hidden flex flex-col gap-4">
                            {reportData.log?.length > 0 ? reportData.log.map(item => (
                                <div key={item.id} className={`bg-black/40 backdrop-blur-xl rounded-2xl p-5 shadow-lg border ${item.status === 'refunded' ? 'border-red-900/50 opacity-80' : 'border-gray-700/50'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-extrabold text-white text-lg tracking-tight">{item.user_name}</h4>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(item.created_at).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest border ${item.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                            {item.status === 'paid' ? 'PAGO' : 'ESTORNADO'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mb-5 bg-black/60 border border-gray-800 p-3.5 rounded-xl shadow-inner">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Faturamento</span>
                                            <span className={`font-black text-lg ${item.status === 'refunded' ? 'line-through text-gray-600' : 'text-white'}`}>R$ {parseFloat(item.amount).toFixed(2)}</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-700"></div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Lucro</span>
                                            <span className={`font-black text-lg ${item.status === 'refunded' ? 'line-through text-gray-600' : 'text-teal-400'}`}>R$ {parseFloat(item.net_profit).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Área Expansível Mobile */}
                                    {expandedRow === item.id && (
                                        <div className="mb-5 bg-black/50 p-4 rounded-xl border border-gray-800 shadow-inner animate-surgir">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2 border-b border-gray-800 pb-2">
                                                <Package size={14} /> Itens Comprados
                                            </p>
                                            <ul className="space-y-3">
                                                {item.items.map((prod, idx) => (
                                                    <li key={idx} className="flex justify-between items-center text-xs text-gray-300 font-medium">
                                                        <span className="flex items-center gap-2">
                                                            <span className="bg-gray-800 text-white px-1.5 py-0.5 rounded">{prod.quantity}x</span> {prod.product_name}
                                                        </span>
                                                        <span className="font-mono text-[#f2bd46] font-bold">R$ {parseFloat(prod.price).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button onClick={() => toggleRow(item.id)} className="flex-1 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors">
                                            {expandedRow === item.id ? 'Ocultar Itens' : 'Ver Produtos'}
                                        </button>
                                        <button 
                                            onClick={() => handleRefund(item.id, item.amount)} 
                                            disabled={item.status === 'refunded'}
                                            className="flex-1 bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-1"
                                        >
                                            <ArrowRightLeft size={14} /> {item.status === 'refunded' ? 'Estornado' : 'Reembolsar'}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 text-gray-500 font-medium">Nenhuma venda encontrada.</div>
                            )}
                        </div>
                        
                        {/* Paginação */}
                        <div className="mt-8 flex justify-center">
                            <Pagination currentPage={currentPage} totalPages={Math.ceil((reportData?.pagination?.total || 0) / (reportData?.pagination?.limit || 10))} onPageChange={fetchLogData} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const CentralCashierPage = ({ token }) => {
    // --- ESTADOS ---
    const [summary, setSummary] = React.useState({ net_profit: 0, cost_of_goods: 0, total_wallet_balance: 0 });
    const [history, setHistory] = React.useState([]); // Lista completa
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    
    // --- ESTADOS DA PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10; 

    // --- ESTADOS DO MODAL ---
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [withdrawalData, setWithdrawalData] = React.useState({ amount: '', type: 'net_profit', reason: '' });

    // --- BUSCA DE DADOS ---
    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const [summaryRes, historyRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/central-cashier`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/central-cashier/history`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!summaryRes.ok || !historyRes.ok) throw new Error('Falha ao buscar dados do caixa.');
            const summaryData = await summaryRes.json();
            const historyData = await historyRes.json();
            setSummary(summaryData);
            setHistory(historyData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- LÓGICA DE PAGINAÇÃO ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = history.slice(indexOfFirstItem, indexOfLastItem); 
    const totalPages = Math.ceil(history.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    // --- HANDLERS ---
    const handleWithdrawalChange = (e) => {
        setWithdrawalData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/admin/central-cashier/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...withdrawalData,
                    amount: parseFloat(withdrawalData.amount)
                })
            });
            if (!response.ok) throw new Error('Falha ao registrar retirada.');
            setIsModalOpen(false);
            setWithdrawalData({ amount: '', type: 'net_profit', reason: '' });
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    // ==============================================
    // --- ANIMAÇÕES E COMPONENTES VISUAIS ---
    // ==============================================
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 15px rgba(242, 189, 70, 0.2); }
            50% { box-shadow: 0 0 25px rgba(242, 189, 70, 0.5); }
        }
        .animate-surgir {
            animation: surgir 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(242, 189, 70, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(242, 189, 70, 0.6); }
    `;

    // Card Premium Local
    const StatCard = ({ icon, label, value, colorClass, delay }) => (
        <div 
            className="animate-surgir bg-black/40 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-gray-500/50 transition-all duration-300"
            style={{ animationDelay: delay }}
        >
            <div className={`absolute -right-10 -top-10 w-24 h-24 blur-[40px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${colorClass.replace('text-', 'bg-')}`}></div>
            <div className="flex items-start mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-black/50 border border-gray-800 ${colorClass} shadow-inner group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-2xl lg:text-3xl font-black tracking-tighter ${colorClass}`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 md:gap-8 pb-12 relative z-10">
            <style>{keyframes}</style>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800/80 pb-6 animate-surgir">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-1">
                        Caixa Central
                    </h2>
                    <p className="text-gray-400 font-medium text-sm">Controle financeiro, saldos e retiradas</p>
                </div>
            </div>
            
            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
                    <Loader2 className="animate-spin text-[#f2bd46] drop-shadow-[0_0_10px_rgba(242,189,70,0.5)]" size={56} />
                    <span className="text-[#f2bd46] font-bold tracking-widest animate-pulse text-sm">CARREGANDO CAIXA...</span>
                </div>
            ) : error ? (
                <div className="bg-red-900/10 border border-red-500/30 text-red-400 p-6 rounded-2xl flex items-center gap-3 animate-surgir">
                    <AlertTriangle size={24} /> {error}
                </div>
            ) : (
                <>
                    {/* --- CARDS DE RESUMO --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-2">
                        <StatCard icon={<DollarSign size={28} />} label="Lucro Líquido" value={`R$ ${parseFloat(summary.net_profit).toFixed(2)}`} colorClass="text-green-400" delay="0ms" />
                        <StatCard icon={<ShoppingCart size={28} />} label="Custo Mercadoria" value={`R$ ${parseFloat(summary.cost_of_goods).toFixed(2)}`} colorClass="text-yellow-400" delay="50ms" />
                        <StatCard icon={<Wallet size={28} />} label="Saldo em Carteiras" value={`R$ ${(summary.total_wallet_balance || 0).toFixed(2)}`} colorClass="text-cyan-400" delay="100ms" />
                    </div>

                    {/* --- HEADER DA SEÇÃO --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4 animate-surgir" style={{ animationDelay: '150ms' }}>
                        <h3 className="text-xl md:text-2xl font-extrabold flex items-center gap-3 tracking-tight">
                            <div className="bg-gray-800 p-2 rounded-xl border border-gray-700">
                                <History size={24} className="text-[#f2bd46]"/>
                            </div>
                            Histórico de Movimentações
                        </h3>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="w-full sm:w-auto bg-[#f2bd46] hover:bg-[#e0af40] text-black font-extrabold py-3.5 sm:py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] hover:-translate-y-0.5"
                        >
                            <PlusCircle size={20} /> Nova Retirada
                        </button>
                    </div>

                    {/* --- TABELA OTIMIZADA COM PAGINAÇÃO --- */}
                    <div className="animate-surgir" style={{ animationDelay: '200ms' }}>
                        
                        {/* --- VERSÃO DESKTOP (Tabela Glassmorphism) --- */}
                        <div className="hidden md:block bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 mb-6">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-black/60 border-b border-gray-700/80 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="p-5">Data & Hora</th>
                                            <th className="p-5">Tipo</th>
                                            <th className="p-5">Valor</th>
                                            <th className="p-5">Usuário/Origem</th>
                                            <th className="p-5">Condomínio</th>
                                            <th className="p-5">Detalhes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/80">
                                        {currentItems.length > 0 ? currentItems.map((item, index) => (
                                            <tr key={`${item.type}-${item.id}-${index}`} className="hover:bg-white/5 transition-colors duration-300">
                                                <td className="p-5 text-sm text-gray-300 font-medium">
                                                    {new Date(item.created_at).toLocaleDateString('pt-BR')} 
                                                    <span className="text-xs text-gray-500 font-mono ml-2">{new Date(item.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider border ${
                                                        item.type === 'entrada' 
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                                                    }`}>
                                                        {item.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className={`p-5 font-black tracking-tight ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {item.amount > 0 ? '+' : ''} R$ {parseFloat(item.amount).toFixed(2)}
                                                </td>
                                                <td className="p-5 text-gray-300 font-medium">{item.user_name || '-'}</td>
                                                <td className="p-5 text-gray-400">{item.condo_name || '-'}</td>
                                                <td className="p-5 text-sm text-gray-400 truncate max-w-[200px]" title={item.details}>
                                                    {item.details}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="text-center p-12 text-gray-500 font-medium">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Info size={32} className="opacity-50" />
                                                        <p>Nenhuma movimentação registrada.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- VERSÃO MOBILE (Cards Premium Glassmorphism) --- */}
                        <div className="md:hidden flex flex-col gap-4 mb-6">
                            {currentItems.length > 0 ? currentItems.map((item, index) => (
                                <div key={`${item.type}-${item.id}-${index}`} className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-lg">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`p-2 rounded-lg ${item.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {item.amount > 0 ? <ArrowDownToLine size={16} /> : <ArrowRightLeft size={16} />}
                                            </span>
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest border ${
                                                    item.type === 'entrada' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                                                }`}>
                                                    {item.type.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-black text-lg tracking-tight block ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {item.amount > 0 ? '+' : ''} R$ {parseFloat(item.amount).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium flex items-center justify-end gap-1 mt-1">
                                                <Calendar size={10} /> {new Date(item.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-black/50 border border-gray-800 p-3 rounded-xl shadow-inner space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold uppercase">Origem/Usuário:</span>
                                            <span className="text-gray-300 font-medium truncate max-w-[150px]">{item.user_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold uppercase">Condomínio:</span>
                                            <span className="text-gray-300 font-medium truncate max-w-[150px]">{item.condo_name || '-'}</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-gray-800">
                                            <p className="text-xs text-gray-400 leading-relaxed italic">"{item.details}"</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 text-gray-500 font-medium flex flex-col items-center gap-2">
                                    <Info size={32} className="opacity-50" />
                                    <p>Nenhuma movimentação registrada.</p>
                                </div>
                            )}
                        </div>

                        {/* --- RODAPÉ DE PAGINAÇÃO (Premium Look) --- */}
                        {history.length > 0 && (
                            <div className="bg-black/60 backdrop-blur-2xl p-4 sm:px-6 rounded-2xl border border-gray-700/80 shadow-xl flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-gray-400 font-medium">
                                    Página <span className="text-white font-black bg-gray-800 px-2 py-1 rounded">{currentPage}</span> de {totalPages}
                                </span>
                                <div className="flex gap-2 sm:gap-3">
                                    <button 
                                        onClick={prevPage} 
                                        disabled={currentPage === 1}
                                        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${currentPage === 1 ? 'bg-black/40 text-gray-600 cursor-not-allowed border border-gray-800' : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 shadow-md'}`}
                                    >
                                        Anterior
                                    </button>
                                    <button 
                                        onClick={nextPage} 
                                        disabled={currentPage === totalPages}
                                        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${currentPage === totalPages ? 'bg-black/40 text-gray-600 cursor-not-allowed border border-gray-800' : 'bg-[#f2bd46] text-black hover:bg-[#e0af40] border border-[#f2bd46]/50 shadow-[0_0_10px_rgba(242,189,70,0.2)]'}`}
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
            
            {/* --- MODAL DE RETIRADA (Premium Glassmorphism) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-surgir" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative z-10 bg-black/80 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-gray-700/80 w-full max-w-md animate-surgir overflow-hidden">
                        
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#f2bd46]/10 blur-[50px] rounded-full pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="bg-[#f2bd46]/20 p-2.5 rounded-xl border border-[#f2bd46]/30">
                                <PlusCircle size={24} className="text-[#f2bd46]" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">Registrar Saída</h2>
                        </div>
                        
                        <form onSubmit={handleWithdrawalSubmit} className="relative z-10">
                            <div className="mb-5">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Valor da Retirada (R$)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <DollarSign size={18} className="text-gray-500" />
                                    </div>
                                    <input type="number" step="0.01" name="amount" value={withdrawalData.amount} onChange={handleWithdrawalChange} className="w-full bg-black/50 border border-gray-600 focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] pl-10 pr-4 py-3.5 rounded-xl text-white font-bold text-lg outline-none transition-all placeholder-gray-700" placeholder="0.00" required />
                                </div>
                            </div>
                            
                            <div className="mb-5">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Origem do Saldo</label>
                                <select name="type" value={withdrawalData.type} onChange={handleWithdrawalChange} className="w-full bg-black/50 border border-gray-600 focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] p-3.5 rounded-xl text-white outline-none transition-all appearance-none cursor-pointer">
                                    <option value="net_profit">Lucro Líquido</option>
                                    <option value="cost_of_goods">Custo de Mercadoria</option>
                                </select>
                            </div>
                            
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Motivo / Descrição</label>
                                <input name="reason" value={withdrawalData.reason} onChange={handleWithdrawalChange} className="w-full bg-black/50 border border-gray-600 focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] p-3.5 rounded-xl text-white outline-none transition-all placeholder-gray-700" placeholder="Ex: Retirada de sócios, Pagamento de boleto..." required />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-gray-300 font-bold bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition-colors">Cancelar</button>
                                <button type="submit" className="w-full sm:w-auto bg-[#f2bd46] hover:bg-[#e0af40] px-8 py-3.5 rounded-xl text-black font-extrabold shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] hover:-translate-y-0.5 transition-all">Confirmar Retirada</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CriticalStockPage = ({ condominiums, token }) => {
    // --- ESTADOS ---
    const [selectedCondoId, setSelectedCondoId] = React.useState(condominiums[0]?.id || '');
    const [inventoryQuantities, setInventoryQuantities] = React.useState({});
    const [criticalItems, setCriticalItems] = React.useState([]); 
    const [expiringSoonItems, setExpiringSoonItems] = React.useState([]); 
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    // --- FETCH ---
    const fetchCriticalStock = React.useCallback(async () => {
        if (!selectedCondoId) {
            setCriticalItems([]); setExpiringSoonItems([]); setIsLoading(false); return;
        }
        setIsLoading(true); setError('');
        try {
            const response = await fetch(`${API_URL}/api/admin/critical-stock-page?condoId=${selectedCondoId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar dados.');
            
            const data = await response.json();
            setCriticalItems(data.criticalStock || []);
            setExpiringSoonItems(data.expiringSoon || []);
            
            const quantities = (data.criticalStock || []).reduce((acc, item) => {
                acc[item.product_id] = item.quantity;
                return acc;
            }, {});
            setInventoryQuantities(quantities);
            
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    }, [selectedCondoId, token]);

    React.useEffect(() => { fetchCriticalStock(); }, [fetchCriticalStock]); 

    // --- AÇÕES ---
    const handleInventoryChange = (productId, quantity) => {
        const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
        setInventoryQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    };

    const handleSaveInventory = async (productId) => {
        const quantity = inventoryQuantities[productId];
        try {
            const response = await fetch(`${API_URL}/api/admin/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ condo_id: selectedCondoId, product_id: productId, quantity })
            });
            if (!response.ok) throw new Error('Falha ao atualizar.');
            alert('Estoque atualizado!');
            fetchCriticalStock(); 
        } catch (err) { alert(err.message); }
    };
    
    // Cálculos
    const totalReorderCost = criticalItems.reduce((sum, item) => sum + parseFloat(item.reorder_cost || 0), 0);
    const totalReorderItems = criticalItems.reduce((sum, item) => sum + parseInt(item.suggested_reorder_quantity || 0), 0);

    return (
        <div className="flex flex-col gap-8 pb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Gestão de Riscos (Estoque/Validade)</h2>
            
            {/* --- SELETOR DE CONDOMÍNIO --- */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-md">
                <label className="text-sm text-gray-400 mb-1 block">Analisar Condomínio:</label>
                <select onChange={(e) => setSelectedCondoId(e.target.value)} value={selectedCondoId} className="w-full md:max-w-md bg-black border border-gray-600 rounded-lg py-3 px-4 text-white focus:border-[#f2bd46] outline-none transition">
                    {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {isLoading ? <Loader2 className="animate-spin mx-auto text-[#f2bd46]" size={40} /> : (
                <>
                    {/* ======================================================= */}
                    {/* --- SEÇÃO 1: VENCIMENTO (EXPIRATION) --- */}
                    {/* ======================================================= */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                            <Calendar className="text-red-500" /> Vencimento Próximo (30 dias)
                        </h3>
                        
                        {expiringSoonItems.length > 0 ? (
                            <>
                                {/* VISÃO PC */}
                                <div className="hidden md:block bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-700 shadow-md">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#1a1a1a] text-gray-200">
                                            <tr>
                                                <th className="p-4">Produto</th>
                                                <th className="p-4 text-center">Quantidade no Lote</th>
                                                <th className="p-4 text-center">Data de Vencimento</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {expiringSoonItems.map((item) => (
                                                <tr key={item.product_id} className="hover:bg-[#1a1a1a]/50 transition">
                                                    <td className="p-4 font-medium">{item.product_name}</td>
                                                    <td className="p-4 text-center">{item.quantity} un.</td>
                                                    <td className="p-4 text-center font-bold text-red-400 bg-red-900/10">
                                                        {new Date(item.nearest_expiration_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* VISÃO MOBILE (Cards de Alerta) */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {expiringSoonItems.map((item) => (
                                        <div key={item.product_id} className="bg-[#1a1a1a] border-l-4 border-red-500 rounded-r-lg p-4 shadow-md flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{item.product_name}</h4>
                                                <p className="text-sm text-gray-400">Lote com: <span className="text-white font-bold">{item.quantity} un.</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-red-400 font-bold uppercase mb-1">Vence em</p>
                                                <p className="text-lg font-bold text-white bg-red-600 px-2 py-1 rounded">
                                                    {new Date(item.nearest_expiration_date).toLocaleDateString('pt-BR', {day: '2-digit', month:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="border-gray-700 p-6 rounded-lg text-center border border-dashed border-gray-600">
                                <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                                <p className="text-gray-400">Tudo certo! Nenhum produto vencendo nos próximos 30 dias.</p>
                            </div>
                        )}
                    </div>

                    {/* ======================================================= */}
                    {/* --- SEÇÃO 2: REPOSIÇÃO (CRITICAL STOCK) --- */}
                    {/* ======================================================= */}
                    <div className="mt-4">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
                            <AlertTriangle className="text-yellow-500" /> Reposição Necessária
                        </h3>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                                <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400"><DollarSign size={24} /></div>
                                <div><p className="text-sm text-gray-400">Custo Est. Reposição</p><p className="text-xl font-bold text-white">R$ {totalReorderCost.toFixed(2)}</p></div>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><Package size={24} /></div>
                                <div><p className="text-sm text-gray-400">Itens a Comprar</p><p className="text-xl font-bold text-white">{totalReorderItems} un.</p></div>
                            </div>
                        </div>

                        {criticalItems.length > 0 ? (
                            <>
                                {/* VISÃO PC */}
                                <div className="hidden md:block bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-700 shadow-md">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#1a1a1a] text-gray-200">
                                            <tr>
                                                <th className="p-4">Produto</th>
                                                <th className="p-4 text-center">Nível Mínimo</th>
                                                <th className="p-4 text-center">Sugestão Compra</th>
                                                <th className="p-4 text-center">Custo Est.</th>
                                                <th className="p-4 w-48">Estoque Atual (Ajustar)</th>
                                                <th className="p-4 text-center">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {criticalItems.map((item) => (
                                                <tr key={item.product_id} className="hover:bg-[#1a1a1a]/50 transition">
                                                    <td className="p-4 font-medium">{item.product_name}</td>
                                                    <td className="p-4 text-center text-gray-400">{item.critical_stock_level}</td>
                                                    <td className="p-4 text-center font-bold text-blue-400">+{item.suggested_reorder_quantity}</td>
                                                    <td className="p-4 text-center text-yellow-400">R$ {parseFloat(item.reorder_cost).toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <input type="number" value={inventoryQuantities[item.product_id] || 0} onChange={(e) => handleInventoryChange(item.product_id, e.target.value)} className="w-full bg-black p-2 rounded border border-gray-600 focus:border-[#f2bd46] text-center text-white" />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button onClick={() => handleSaveInventory(item.product_id)} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"><Save size={18} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* VISÃO MOBILE (Action Cards) */}
                                <div className="md:hidden flex flex-col gap-4">
                                    {criticalItems.map((item) => (
                                        <div key={item.product_id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-lg relative">
                                            {/* Badge de Sugestão */}
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                                Comprar +{item.suggested_reorder_quantity}
                                            </div>

                                            <div className="mb-4 pr-16">
                                                <h4 className="font-bold text-white text-lg">{item.product_name}</h4>
                                                <p className="text-xs text-gray-400">Custo Est: <span className="text-yellow-400 font-bold">R$ {parseFloat(item.reorder_cost).toFixed(2)}</span></p>
                                            </div>
                                            
                                            <div className="bg-black/50 p-3 rounded-lg border border-gray-700/50 mb-3 flex justify-between items-center">
                                                <span className="text-xs text-gray-400">Mínimo Ideal: <strong className="text-gray-200">{item.critical_stock_level}</strong></span>
                                                <span className="text-xs text-red-400 font-bold flex items-center gap-1"><ArrowDownToLine size={12}/> Abaixo do nível</span>
                                            </div>

                                            <div className="flex items-end gap-3">
                                                <div className="flex-grow">
                                                    <label className="text-xs text-gray-500 block mb-1">Ajustar Estoque Real</label>
                                                    <input 
                                                        type="number" 
                                                        value={inventoryQuantities[item.product_id] || 0} 
                                                        onChange={(e) => handleInventoryChange(item.product_id, e.target.value)} 
                                                        className="w-full bg-black p-3 rounded-lg border border-gray-600 focus:border-[#f2bd46] text-white font-bold text-lg" 
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => handleSaveInventory(item.product_id)} 
                                                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg h-[52px] w-[52px] flex items-center justify-center shadow-lg shadow-green-600/20"
                                                >
                                                    <Save size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="border-gray-700 p-6 rounded-lg text-center border border-dashed border-gray-600">
                                <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                                <p className="text-gray-400">Estoque saudável! Nenhum produto abaixo do nível crítico.</p>
                            </div>
                        )}
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
    const [error, setError] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    // --- FETCH ---
    const fetchUsers = React.useCallback(async (page = 1) => {
        setIsLoading(true); setError(''); setCurrentPage(page);
        try {
            const response = await fetch(`${API_URL}/api/admin/users-paginated?page=${page}&limit=10`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (!response.ok) throw new Error('Falha ao buscar utilizadores.');
            const data = await response.json();
            setUsersData(data);
        } catch (err) {
            setError(err.message);
            setUsersData({ users: [], pagination: {} });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    React.useEffect(() => { fetchUsers(1); }, [fetchUsers]);

    const handleOpenModal = (user) => { setSelectedUser(user); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedUser(null); };
    const handleSaveUser = () => { fetchUsers(currentPage); };
    
    // Filtro local da página atual (para busca rápida)
    const filteredUsers = usersData.users?.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.cpf.includes(searchQuery)
    ) || [];

    return (
        <div className="flex flex-col gap-6">
            <UserEditModal user={selectedUser} isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveUser} token={token} />
            
            <h2 className="text-2xl md:text-3xl font-bold">Gestão de Utilizadores</h2>
            
            {/* --- BARRA DE PESQUISA RESPONSIVA --- */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-md">
                <label className="text-sm text-gray-400 mb-1 block">Procurar Utilizador</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Nome ou CPF..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[#f2bd46] outline-none transition"
                    />
                </div>
            </div>
            
            {isLoading ? <Loader2 className="animate-spin mx-auto text-[#f2bd46]" size={40} /> : error ? <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p> : (
                <>
                    {/* --- VISÃO PC (Tabela Detalhada) --- */}
                    <div className="hidden md:block bg-[#1a1a1a] rounded-lg overflow-x-auto shadow-md border border-gray-700">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-[#1a1a1a] text-gray-200">
                                <tr>
                                    <th className="p-4">Utilizador</th>
                                    <th className="p-4">CPF</th>
                                    <th className="p-4">Apartamento</th>
                                    <th className="p-4">Máquina</th>
                                    <th className="p-4">Saldo</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-[#1a1a1a]/50 transition">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-lg">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{user.name}</span>
                                        </td>
                                        <td className="p-4 text-gray-300">{user.cpf}</td>
                                        <td className="p-4 text-gray-300">{user.apartment || '-'}</td>
                                        <td className="p-4 text-gray-400 text-sm">{user.condo_name || 'N/A'}</td>
                                        <td className="p-4 font-bold text-green-400">R$ {parseFloat(user.wallet_balance || 0).toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            {user.is_active ? 
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">ATIVO</span> : 
                                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold flex items-center justify-center gap-1"><Ban size={12}/> BLOQ.</span>
                                            }
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleOpenModal(user)} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 font-bold py-1 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition mx-auto">
                                                <Edit size={14} /> Editar
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" className="text-center p-8 text-gray-500">Nenhum utilizador encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- VISÃO MOBILE (Cards de Perfil) --- */}
                    <div className="md:hidden flex flex-col gap-4">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <div key={user.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-lg relative">
                                {/* Status Dot */}
                                <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${user.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-2xl border-2 border-gray-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{user.name}</h3>
                                        <p className="text-sm text-gray-400">{user.cpf}</p>
                                        <p className="text-xs text-gray-500">{user.condo_name || 'Sem Condomínio'}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-black/50 p-3 rounded-lg border border-gray-700/50 mb-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Saldo em Carteira</p>
                                        <p className="text-xl font-bold text-green-400">R$ {parseFloat(user.wallet_balance || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase">Apartamento</p>
                                        <p className="text-lg font-bold text-white">{user.apartment || '-'}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleOpenModal(user)} 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20"
                                >
                                    <Edit size={18} /> Gerenciar Conta
                                </button>
                            </div>
                        )) : (
                            <div className="text-center p-8 bg-[#1a1a1a] rounded-xl text-gray-500 border border-gray-700">
                                <UsersIcon size={48} className="mx-auto mb-3 opacity-20" />
                                <p>Nenhum utilizador encontrado.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Paginação */}
                    <div className="mt-4">
                         <Pagination currentPage={currentPage} totalPages={Math.ceil((usersData?.pagination?.total || 0) / (usersData?.pagination?.limit || 10))} onPageChange={fetchUsers} />
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
                <button onClick={() => onAddNew()} className="bg-[#f2bd46] hover:bg-[#f2bd46] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <PlusCircle size={20} /> Novo Condomínio
                </button>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    {/* --- CABEÇALHOS DA TABELA RESTAURADOS --- */}
                    <thead className="bg-[#1a1a1a]">
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

const AddProductToInventoryModal = ({ isOpen, onClose, onSave, token, condoId, productsInInventory }) => {
    const [globalProducts, setGlobalProducts] = React.useState([]);
    const [selectedProductId, setSelectedProductId] = React.useState('');
    const [quantity, setQuantity] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    // Filtra a lista de produtos globais para mostrar apenas
    // aqueles que AINDA NÃO ESTÃO no inventário deste condomínio
    const productsNotInInventory = React.useMemo(() => {
        const inventoryProductIds = new Set(productsInInventory.map(p => p.id));
        return globalProducts.filter(p => !inventoryProductIds.has(p.id));
    }, [globalProducts, productsInInventory]);

    React.useEffect(() => {
        if (isOpen) {
            // Reseta os campos
            setSelectedProductId('');
            setQuantity(0);
            setError('');
            setIsLoading(true);

            // Busca a lista de produtos globais
            const fetchGlobalProducts = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/admin/products`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Falha ao buscar lista de produtos globais.');
                    const data = await response.json();
                    setGlobalProducts(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchGlobalProducts();
        }
    }, [isOpen, token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedProductId) {
            setError('Você deve selecionar um produto.');
            return;
        }
        
        // Chama a função onSave (que chamará a API)
        onSave({
            condo_id: condoId,
            product_id: selectedProductId,
            quantity: quantity
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-6">Adicionar Produto ao Inventário</h2>
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : error ? (
                    <p className="text-red-400">{error}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Produto</label>
                            <select 
                                value={selectedProductId} 
                                onChange={(e) => setSelectedProductId(e.target.value)} 
                                className="w-full bg-[#1a1a1a] p-2 rounded-md" 
                                required
                            >
                                <option value="">-- Selecione um produto global --</option>
                                {productsNotInInventory.length > 0 ? (
                                    productsNotInInventory.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Custo: R$ {p.purchase_price})</option>
                                    ))
                                ) : (
                                    <option disabled>Nenhum produto novo para adicionar.</option>
                                )}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Quantidade Inicial</label>
                            <input 
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="w-full bg-[#1a1a1a] p-2 rounded-md"
                            />
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-4">
                            <button type="button" onClick={onClose} className="bg-[#1a1a1a] hover:bg-[#1a1a1a] py-2 px-4 rounded-md">Cancelar</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md">Adicionar ao Inventário</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente StockManagement por este

const StockManagement = ({ condominiums, token }) => {
    const [selectedCondoId, setSelectedCondoId] = React.useState(condominiums[0]?.id || '');
    const [inventory, setInventory] = React.useState([]); 
    const [inventoryQuantities, setInventoryQuantities] = React.useState({}); 
    const [inventoryDates, setInventoryDates] = React.useState({}); 
    
    // --- NOVO: Estado de Pesquisa ---
    const [searchQuery, setSearchQuery] = React.useState('');

    const [isStockLoading, setIsStockLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false); 
    const [toast, setToast] = React.useState({ show: false, message: '' });
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

    // --- FETCH ---
    const fetchInventory = React.useCallback(async () => {
        if (selectedCondoId) {
            setIsStockLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/admin/inventory?condoId=${selectedCondoId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao buscar o inventário.');
                const data = await response.json();
                setInventory(data); 
                
                const quantities = {};
                const dates = {};
                data.forEach(item => {
                    quantities[item.id] = item.quantity;
                    dates[item.id] = item.nearest_expiration_date ? new Date(item.nearest_expiration_date).toISOString().split('T')[0] : '';
                });
                setInventoryQuantities(quantities);
                setInventoryDates(dates);
            } catch (err) { alert(err.message); } finally { setIsStockLoading(false); }
        } else {
            setInventory([]); setInventoryQuantities({}); setInventoryDates({});
        }
    }, [selectedCondoId, token]);
    
    React.useEffect(() => { fetchInventory(); }, [fetchInventory]);

    // --- FILTRAGEM (Pesquisa Local com Trava de Segurança) ---
    const filteredInventory = inventory.filter(item => 
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInventoryChange = (productId, quantity) => {
        const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
        setInventoryQuantities(prev => ({ ...prev, [productId]: newQuantity }));
    };

    const handleDateChange = (productId, date) => {
        setInventoryDates(prev => ({ ...prev, [productId]: date }));
    };

    const handleSaveAllChanges = async () => {
        setIsSaving(true);
        const changedItems = [];
        for (const product of inventory) {
            const originalQuantity = product.quantity;
            const newQuantity = inventoryQuantities[product.id];
            const originalDate = product.nearest_expiration_date ? new Date(product.nearest_expiration_date).toISOString().split('T')[0] : '';
            const newDate = inventoryDates[product.id];
            
            if (originalQuantity !== newQuantity || originalDate !== newDate) {
                changedItems.push({ product_id: product.id, quantity: newQuantity, nearest_expiration_date: newDate || null });
            }
        }

        if (changedItems.length === 0) { alert('Nenhuma alteração detectada.'); setIsSaving(false); return; }

        try {
            const response = await fetch(`${API_URL}/api/admin/inventory/bulk-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ condo_id: selectedCondoId, items: changedItems })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao salvar estoque.');
            
            setToast({ show: true, message: `${changedItems.length} produto(s) atualizado(s)!` });
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
            await fetchInventory(); 
        } catch (err) { alert(err.message); } finally { setIsSaving(false); }
    };
    
    const handleAddProduct = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Falha ao adicionar produto.');
            setToast({ show: true, message: 'Produto adicionado!' });
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
            setIsAddModalOpen(false); 
            await fetchInventory(); 
        } catch (err) { alert(err.message); }
    };
    
    const handleRemoveProduct = async (productId, productName) => {
        if (!window.confirm(`Tem certeza que deseja REMOVER "${productName}"?`)) return;
        try {
            const response = await fetch(`${API_URL}/api/admin/inventory?condo_id=${selectedCondoId}&product_id=${productId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao remover produto.');
            setToast({ show: true, message: 'Produto removido!' });
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
            await fetchInventory(); 
        } catch (err) { alert(err.message); }
    };

    // ==============================================
    // --- ANIMAÇÕES E CLASSES PREMIUM ---
    // ==============================================
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slide-down-toast {
            0% { opacity: 0; transform: translateY(-30px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-surgir {
            animation: surgir 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .animate-toast-premium {
            animation: slide-down-toast 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(242, 189, 70, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(242, 189, 70, 0.6); }
    `;

    return (
        <div className="flex flex-col gap-6 md:gap-8 pb-12 relative z-10">
            <style>{keyframes}</style>
            
            <AddProductToInventoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddProduct} token={token} condoId={selectedCondoId} productsInInventory={inventory} />
            
            {/* --- TOAST PREMIUM --- */}
            {toast.show && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 bg-black/80 backdrop-blur-xl border border-green-500/50 text-white py-3 px-5 sm:px-6 rounded-2xl shadow-[0_10px_40px_rgba(34,197,94,0.3)] flex items-center gap-3 z-[999] animate-toast-premium">
                    <div className="bg-green-500/20 p-1.5 rounded-full border border-green-500/30">
                        <CheckCircle2 size={18} className="text-green-400" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}
            
            {/* --- HEADER RESPONSIVO --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 border-b border-gray-800/80 pb-6 animate-surgir">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-1">
                        Gestão de Estoque
                    </h2>
                    <p className="text-gray-400 font-medium text-sm">Controle de entradas, quantidades e validades</p>
                </div>
                
                <div className="flex w-full md:w-auto gap-3">
                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        disabled={!selectedCondoId} 
                        className="flex-1 md:flex-none bg-black/40 hover:bg-white/10 text-white font-extrabold py-3.5 md:py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700/80"
                    >
                        <PlusCircle size={20} /> <span className="md:hidden">Adicionar</span> <span className="hidden md:inline">Adicionar Produto</span>
                    </button>
                    <button 
                        onClick={handleSaveAllChanges} 
                        disabled={isSaving || isStockLoading} 
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-white font-extrabold py-3.5 md:py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:opacity-50 shadow-[0_0_15px_rgba(22,163,74,0.4)] hover:shadow-[0_0_25px_rgba(22,163,74,0.6)] hover:-translate-y-0.5"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span className="md:hidden">Salvar</span> <span className="hidden md:inline">Salvar Alterações</span>
                    </button>
                </div>
            </div>
            
            {/* --- FILTROS E PESQUISA (Painel Glassmorphism) --- */}
            <div className="bg-black/60 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl shadow-xl border border-gray-700/80 relative overflow-hidden animate-surgir" style={{ animationDelay: '50ms' }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2bd46]/50 to-transparent"></div>
                
                <div className="flex flex-col md:flex-row gap-5 items-end relative z-10">
                    <div className="w-full md:w-1/3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Selecionar Condomínio</label>
                        <select 
                            onChange={(e) => setSelectedCondoId(e.target.value)} 
                            value={selectedCondoId} 
                            className="w-full bg-black/50 border border-gray-600 rounded-xl py-3.5 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all cursor-pointer appearance-none"
                        >
                            <option value="">-- Selecione o Condomínio --</option>
                            {condominiums.map(condo => <option key={condo.id} value={condo.id}>{condo.name}</option>)}
                        </select>
                    </div>
                    
                    <div className="w-full md:flex-grow">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Pesquisar no Estoque</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-500" size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Nome do produto..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={!selectedCondoId}
                                className="w-full bg-black/50 border border-gray-600 rounded-xl py-3.5 pl-11 pr-4 focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all text-white disabled:opacity-30 disabled:cursor-not-allowed placeholder-gray-600"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {isStockLoading ? (
                <div className="flex flex-col justify-center items-center h-64 gap-4 bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl animate-surgir">
                    <Loader2 className="animate-spin text-[#f2bd46]" size={48} />
                    <span className="text-gray-400 font-bold tracking-widest text-sm animate-pulse">CARREGANDO ESTOQUE...</span>
                </div>
            ) : selectedCondoId && (
                <div className="animate-surgir" style={{ animationDelay: '100ms' }}>
                    
                    {/* --- VISÃO PC (Tabela Detalhada Premium) --- */}
                    <div className="hidden md:block bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-black/60 border-b border-gray-700/80 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="p-5">Produto</th>
                                        <th className="p-5 w-48 text-center">Quantidade</th>
                                        <th className="p-5 w-48 text-center">Validade (Opcional)</th>
                                        <th className="p-5 w-24 text-center">Ações</th> 
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/80">
                                    {filteredInventory.length > 0 ? filteredInventory.map(product => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors duration-300">
                                            <td className="p-5 flex items-center gap-4">
                                                <img src={product.image_url || 'https://placehold.co/100x100/1a1a1a/4B5563?text=Img'} className="h-12 w-12 rounded-xl object-cover border border-gray-700/50 shadow-sm" alt=""/>
                                                <span className="font-extrabold text-white text-base truncate max-w-[250px]">{product.name}</span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-center">
                                                    <input 
                                                        type="number" 
                                                        value={inventoryQuantities[product.id] || 0} 
                                                        onChange={(e) => handleInventoryChange(product.id, e.target.value)} 
                                                        className={`w-24 bg-black/50 py-2.5 px-3 rounded-xl text-center border focus:ring-2 focus:outline-none font-bold text-lg transition-all ${inventoryQuantities[product.id] <= 5 ? 'border-red-500 text-red-400 focus:ring-red-500/50' : 'border-gray-600 text-white focus:border-[#f2bd46] focus:ring-[#f2bd46]/50'}`} 
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-center">
                                                    <input 
                                                        type="date" 
                                                        value={inventoryDates[product.id] || ''} 
                                                        onChange={(e) => handleDateChange(product.id, e.target.value)} 
                                                        className="w-40 bg-black/50 py-2.5 px-3 rounded-xl border border-gray-600 focus:border-[#f2bd46] focus:ring-2 focus:ring-[#f2bd46]/50 outline-none text-sm text-gray-300 font-medium transition-all [color-scheme:dark]" 
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <button 
                                                    onClick={() => handleRemoveProduct(product.id, product.name)} 
                                                    className="text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 p-2.5 rounded-xl transition-all"
                                                    title="Remover do Condomínio"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center p-12 text-gray-500 font-medium">Nenhum produto correspondente no estoque.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- VISÃO MOBILE (Cards de Edição Operacional Premium) --- */}
                    <div className="md:hidden flex flex-col gap-4">
                        {filteredInventory.length > 0 ? filteredInventory.map(product => (
                            <div key={product.id} className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/50 shadow-lg relative overflow-hidden flex flex-col">
                                
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex gap-4 items-start w-full pr-4">
                                        <img src={product.image_url || 'https://placehold.co/100x100/1a1a1a/4B5563?text=Img'} className="h-16 w-16 rounded-xl object-cover border border-gray-700/50 shadow-md shrink-0" alt=""/>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h3 className="font-extrabold text-white text-lg leading-tight tracking-tight mb-1">{product.name}</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">ID: {product.id}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveProduct(product.id, product.name)} 
                                        className="text-red-400 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-xl shrink-0 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <div className="bg-black/60 border border-gray-800 p-4 rounded-xl shadow-inner">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Package size={12} /> Qtde.
                                            </label>
                                            <input 
                                                type="number" 
                                                value={inventoryQuantities[product.id] || 0} 
                                                onChange={(e) => handleInventoryChange(product.id, e.target.value)} 
                                                className={`w-full bg-black/50 py-3 px-3 rounded-xl border text-center font-black text-xl transition-all focus:outline-none focus:ring-2 
                                                ${inventoryQuantities[product.id] <= 5 ? 'border-red-500/80 text-red-400 focus:ring-red-500/50' : 'border-gray-600 text-white focus:border-[#f2bd46] focus:ring-[#f2bd46]/50'}`} 
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Calendar size={12} /> Validade
                                            </label>
                                            <input 
                                                type="date" 
                                                value={inventoryDates[product.id] || ''} 
                                                onChange={(e) => handleDateChange(product.id, e.target.value)} 
                                                className="w-full h-full bg-black/50 py-3 px-2 rounded-xl border border-gray-600 focus:border-[#f2bd46] focus:ring-2 focus:ring-[#f2bd46]/50 text-xs text-gray-300 font-bold transition-all outline-none [color-scheme:dark]" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 text-gray-500 font-medium flex flex-col items-center gap-3">
                                <Package size={40} className="opacity-30" />
                                <p>Nenhum produto correspondente no estoque deste condomínio.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// App.js -> SUBSTITUA o seu componente FinanceReport por este

const FinanceReport = ({ condominiums, token }) => {
    // === ESTADOS ===
    const [reportData, setReportData] = React.useState([]);
    const [expenses, setExpenses] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [filterInputs, setFilterInputs] = React.useState({ condoId: 'all', startDate: '', endDate: '' });
    
    // Modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newExpense, setNewExpense] = React.useState({ description: '', amount: '', due_date: '', condo_id: '', recurrence_type: '' });
    const [modalError, setModalError] = React.useState('');

    const getTodayInBrasilia = () => {
        const date = new Date();
        const [day, month, year] = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    // === FETCH ===
    const fetchReport = React.useCallback(async () => {
        setIsLoading(true); setError('');
        const params = new URLSearchParams({ condoId: filterInputs.condoId });
        if (filterInputs.startDate) params.append('startDate', filterInputs.startDate);
        if (filterInputs.endDate) params.append('endDate', filterInputs.endDate);
        
        try {
            const response = await fetch(`${API_URL}/api/admin/finance/report?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao buscar relatório.');
            setReportData(data);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    }, [filterInputs, token]);

    const fetchExpenses = React.useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/finance/expenses`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar despesas.');
            const data = await response.json();
            setExpenses(data);
        } catch (err) { setError(err.message); }
    }, [token]);

    React.useEffect(() => { fetchReport(); fetchExpenses(); }, [fetchReport, fetchExpenses]);

    // === HANDLERS ===
    const handleInputChange = (e) => { setFilterInputs(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleFilterToday = () => {
        const today = getTodayInBrasilia();
        setFilterInputs(prev => ({ ...prev, startDate: today, endDate: today }));
        fetchReport(); 
    };
    const handleApplyFilters = () => { fetchReport(); };

    const handleExpenseChange = (e) => { setNewExpense(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleCreateExpense = async (e) => {
        e.preventDefault(); setModalError('');
        if (!newExpense.description || !newExpense.amount || !newExpense.due_date) { setModalError('Campos obrigatórios faltando.'); return; }
        try {
            const response = await fetch(`${API_URL}/api/admin/finance/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newExpense) 
            });
            if (!response.ok) throw new Error('Falha ao criar despesa.');
            setIsModalOpen(false);
            setNewExpense({ description: '', amount: '', due_date: '', condo_id: '', recurrence_type: '' });
            fetchExpenses(); 
        } catch (err) { setModalError(err.message); }
    };

    const handleMarkAsPaid = async (id) => {
        if (!window.confirm('Marcar como paga?')) return;
        try {
            await fetch(`${API_URL}/api/admin/finance/expenses/${id}/pay`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            fetchExpenses(); fetchReport();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Apagar esta despesa?')) return;
        try {
            await fetch(`${API_URL}/api/admin/finance/expenses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            fetchExpenses(); 
        } catch (err) { alert(err.message); }
    };

    // Cálculos
    const summaryCards = React.useMemo(() => {
        return reportData.reduce((acc, condo) => {
            acc.gross_revenue += parseFloat(condo.gross_revenue);
            acc.cost_of_goods_sold += parseFloat(condo.cost_of_goods_sold);
            acc.net_revenue += parseFloat(condo.net_revenue);
            acc.syndic_commission += parseFloat(condo.syndic_commission);
            acc.total_expenses += parseFloat(condo.total_expenses);
            acc.final_net_profit += parseFloat(condo.final_net_profit);
            return acc;
        }, { gross_revenue: 0, cost_of_goods_sold: 0, net_revenue: 0, syndic_commission: 0, total_expenses: 0, final_net_profit: 0 });
    }, [reportData]);
    
    const totalPendingExpenses = React.useMemo(() => {
        return expenses.filter(expense => expense.status === 'pending').reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    }, [expenses]);

    // Componente de Card
    const StatCard = ({ label, value, colorClass = 'text-white', icon: Icon, subLabel }) => (
        <div className="bg-[#1a1a1a] p-4 rounded-xl shadow-md border border-gray-700 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-400">{label}</p>
                {Icon && <Icon size={20} className="text-gray-500" />}
            </div>
            <div>
                <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
                {subLabel && <p className="text-xs text-gray-500 mt-1">{subLabel}</p>}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 pb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Relatórios Financeiros</h2>

            {/* --- FILTROS RESPONSIVOS --- */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="w-full">
                        <label className="text-sm text-gray-400 mb-1 block">Condomínio</label>
                        <select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="w-full bg-black border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#f2bd46] outline-none">
                            <option value="all">Todos</option>
                            {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="w-full">
                        <label className="text-sm text-gray-400 mb-1 block">De</label>
                        <input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="w-full bg-black border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#f2bd46] outline-none" />
                    </div>
                    <div className="w-full">
                        <label className="text-sm text-gray-400 mb-1 block">Até</label>
                        <input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="w-full bg-black border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#f2bd46] outline-none" />
                    </div>
                    <button onClick={handleFilterToday} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-lg shadow-blue-500/20">Hoje</button>
                    <button onClick={handleApplyFilters} className="w-full bg-[#f2bd46] hover:bg-[#f2bd46] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#f2bd46]/20">
                        <Filter size={16} /> Aplicar
                    </button>
                </div>
            </div>

            {/* --- RELATÓRIO DRE (CARDS) --- */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-[#f2bd46] border-b border-gray-700 pb-2">Demonstrativo (DRE)</h3>
                {isLoading ? <Loader2 className="animate-spin mx-auto text-[#f2bd46]" size={40} /> : error ? <p className="text-red-400">{error}</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard label="Faturamento Bruto" value={`R$ ${summaryCards.gross_revenue.toFixed(2)}`} colorClass="text-green-400" icon={DollarSign} />
                        <StatCard label="Custo Produtos (CMV)" value={`- R$ ${summaryCards.cost_of_goods_sold.toFixed(2)}`} colorClass="text-red-400" icon={ShoppingCart} />
                        <StatCard label="Lucro Bruto" value={`R$ ${summaryCards.net_revenue.toFixed(2)}`} colorClass="text-blue-400" subLabel="Faturamento - CMV" icon={PieChart} />
                        
                        <StatCard label="Comissões (Síndicos)" value={`- R$ ${summaryCards.syndic_commission.toFixed(2)}`} colorClass="text-red-400" icon={UsersIcon} />
                        <StatCard label="Despesas Pagas" value={`- R$ ${summaryCards.total_expenses.toFixed(2)}`} colorClass="text-red-400" icon={FileText} />
                        
                        {/* LUCRO LÍQUIDO DESTACADO */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg border-2 border-green-500/50 flex flex-col justify-center items-center h-full sm:col-span-2 lg:col-span-1">
                            <p className="text-sm text-gray-300 uppercase font-bold tracking-wider mb-1">Lucro Líquido Final</p>
                            <p className="text-3xl md:text-4xl font-extrabold text-green-400">R$ {summaryCards.final_net_profit.toFixed(2)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* --- SEÇÃO 2: DESPESAS --- */}
            <div className="mt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-700 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="text-[#f2bd46]" /> Contas a Pagar
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">Total Pendente: <span className="text-yellow-400 font-bold">R$ {totalPendingExpenses.toFixed(2)}</span></p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-[#f2bd46] hover:bg-[#f2bd46] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-[#f2bd46]/20 transition hover:scale-105">
                        <PlusCircle size={20} /> Nova Despesa
                    </button>
                </div>

                {/* VISÃO PC (Tabela) */}
                <div className="hidden md:block bg-[#1a1a1a] rounded-lg overflow-x-auto shadow-md border border-gray-700">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-[#1a1a1a] text-gray-200">
                            <tr>
                                <th className="p-4">Vencimento</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Condomínio</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {expenses.length > 0 ? expenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-[#1a1a1a]/50 transition">
                                    <td className="p-4 text-gray-300">{new Date(expense.due_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="p-4 font-medium">
                                        {expense.description}
                                        {expense.recurrence_type && <span className="text-xs text-cyan-400 ml-2 px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 uppercase">{expense.recurrence_type === 'monthly' ? 'Mensal' : 'Anual'}</span>}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">{expense.condo_name || 'Geral'}</td>
                                    <td className="p-4 font-bold text-white">R$ {parseFloat(expense.amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${expense.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {expense.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        {expense.status === 'pending' && <button onClick={() => handleMarkAsPaid(expense.id)} className="text-green-400 hover:bg-green-500/10 p-2 rounded" title="Pagar"><CheckCircle2 size={18} /></button>}
                                        <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded" title="Apagar"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6" className="text-center p-8 text-gray-500">Nenhuma despesa registrada.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* VISÃO MOBILE (Cards) */}
                <div className="md:hidden flex flex-col gap-4">
                    {expenses.length > 0 ? expenses.map(expense => (
                        <div key={expense.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-lg relative">
                            {/* Status Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${expense.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            
                            <div className="pl-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white text-lg">{expense.description}</h4>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${expense.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                        {expense.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between text-sm text-gray-400 mb-4">
                                    <span>Vence: {new Date(expense.due_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                                    <span className="font-bold text-white text-lg">R$ {parseFloat(expense.amount).toFixed(2)}</span>
                                </div>
                                
                                <div className="flex gap-2 border-t border-gray-700 pt-3">
                                    {expense.status === 'pending' && (
                                        <button onClick={() => handleMarkAsPaid(expense.id)} className="flex-1 bg-green-600/10 text-green-400 hover:bg-green-600/20 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition border border-green-600/20">
                                            <CheckCircle2 size={16} /> Pagar
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteExpense(expense.id)} className="flex-1 bg-red-600/10 text-red-400 hover:bg-red-600/20 py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition border border-red-600/20">
                                        <Trash2 size={16} /> Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-8 bg-[#1a1a1a] rounded-xl text-gray-500 border border-gray-700">
                            <FileText size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Nenhuma despesa encontrada.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Despesa */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-[#1a1a1a] p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-bold mb-6 text-white">Nova Despesa</h2>
                        <form onSubmit={handleCreateExpense}>
                            <div className="space-y-4">
                                <div><label className="text-sm text-gray-400 block mb-1">Descrição</label><input type="text" name="description" value={newExpense.description} onChange={handleExpenseChange} className="w-full bg-black border border-gray-600 rounded-lg p-3 text-white focus:border-[#f2bd46] outline-none" required /></div>
                                <div><label className="text-sm text-gray-400 block mb-1">Valor (R$)</label><input type="number" step="0.01" name="amount" value={newExpense.amount} onChange={handleExpenseChange} className="w-full bg-black border border-gray-600 rounded-lg p-3 text-white focus:border-[#f2bd46] outline-none" required /></div>
                                <div><label className="text-sm text-gray-400 block mb-1">Vencimento</label><input type="date" name="due_date" value={newExpense.due_date} onChange={handleExpenseChange} className="w-full bg-black border border-gray-600 rounded-lg p-3 text-white focus:border-[#f2bd46] outline-none" required /></div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Recorrência</label>
                                    <select name="recurrence_type" value={newExpense.recurrence_type} onChange={handleExpenseChange} className="w-full bg-black border border-gray-600 rounded-lg p-3 text-white outline-none">
                                        <option value="">Única</option>
                                        <option value="monthly">Mensal</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Condomínio (Opcional)</label>
                                    <select name="condo_id" value={newExpense.condo_id} onChange={handleExpenseChange} className="w-full bg-black border border-gray-600 rounded-lg p-3 text-white outline-none">
                                        <option value="">Geral</option>
                                        {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {modalError && <p className="text-red-400 text-sm mt-4 text-center">{modalError}</p>}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-[#1a1a1a]">Cancelar</button>
                                <button type="submit" className="bg-[#f2bd46] hover:bg-[#f2bd46] px-6 py-2 rounded-lg text-white font-bold">Salvar</button>
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
            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-6">{condo ? 'Editar' : 'Novo'} Condomínio</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Condomínio" className="bg-[#1a1a1a] p-2 rounded-md md:col-span-2" required />
                    <input name="fridge_id" value={formData.fridge_id || ''} onChange={handleChange} placeholder="ID da Geladeira (Ex: SF001)" className="bg-[#1a1a1a] p-2 rounded-md" required />
                    <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Endereço" className="bg-[#1a1a1a] p-2 rounded-md" />
                    <input name="syndic_name" value={formData.syndic_name || ''} onChange={handleChange} placeholder="Nome do Síndico" className="bg-[#1a1a1a] p-2 rounded-md" />
                    <input name="syndic_contact" value={formData.syndic_contact || ''} onChange={handleChange} placeholder="Contacto do Síndico" className="bg-[#1a1a1a] p-2 rounded-md" />
                    <input name="syndic_profit_percentage" type="number" step="0.01" value={formData.syndic_profit_percentage || ''} onChange={handleChange} placeholder="% Lucro Síndico" className="bg-[#1a1a1a] p-2 rounded-md" />
                    <input name="initial_investment" type="number" step="0.01" value={formData.initial_investment || ''} onChange={handleChange} placeholder="Investimento Inicial" className="bg-[#1a1a1a] p-2 rounded-md" />
                    <input name="monthly_fixed_cost" type="number" step="0.01" value={formData.monthly_fixed_cost || ''} onChange={handleChange} placeholder="Custo Fixo Mensal" className="bg-[#1a1a1a] p-2 rounded-md md:col-span-2" />
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="bg-[#1a1a1a] hover:bg-[#1a1a1a] py-2 px-4 rounded-md">Cancelar</button>
                        <button type="submit" className="bg-[#f2bd46] hover:bg-[#f2bd46] py-2 px-4 rounded-md">Salvar</button>
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
            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">{product ? 'Editar' : 'Novo'} Produto</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">Nome do Produto</label><input name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" required /></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">Descrição</label><textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" rows="3"></textarea></div>
                        <div className="md:col-span-2"><label className="text-sm text-gray-400">URL da Imagem</label><input name="image_url" value={formData.image_url || ''} onChange={handleChange} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" /></div>
                        
                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-[#f2bd46]">Precificação</div>
                        
                        <div><label className="text-sm text-gray-400">Preço de Compra (Custo)</label><input name="purchase_price" type="number" step="0.01" value={formData.purchase_price || ''} onChange={handleChange} placeholder="Ex: 5.50" className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" required /></div>
                        <div><label className="text-sm text-gray-400">Preço de Venda Padrão</label><input name="sale_price" type="number" step="0.01" value={formData.sale_price || ''} onChange={handleChange} placeholder="Ex: 9.99" className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" required /></div>
                        
                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-[#f2bd46]">Promoção (Opcional)</div>

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
                                className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" 
                            />
                        </div>
                        {/* --- CAMPO DE CATEGORIA (Já existia no seu modal) --- */}
                        <div><label className="text-sm text-gray-400">Categoria</label>
                            <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1">
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
                                <option value="Laticínios">Laticínios</option>
                                <option value="Higiene">Higiene</option>
                                <option value="Limpeza">Limpeza</option>
                                <option value="Sucos">Sucos</option>
                                <option value="Mercearia">Mercearia</option>
                            </select>
                        </div>
                        <div><label className="text-sm text-gray-400">Início da Promoção</label><input name="promotion_start_date" type="date" value={formData.promotion_start_date || ''} onChange={handleChange} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" /></div>
                        <div><label className="text-sm text-gray-400">Fim da Promoção</label><input name="promotion_end_date" type="date" value={formData.promotion_end_date || ''} onChange={handleChange} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" /></div>

                        <div className="md:col-span-2 border-t border-gray-700 mt-4 pt-4 font-bold text-[#f2bd46]">Estoque</div>
                        <div><label className="text-sm text-gray-400">Nível Crítico de Estoque</label><input name="critical_stock_level" type="number" value={formData.critical_stock_level || ''} onChange={handleChange} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" required /></div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-[#1a1a1a] hover:bg-[#1a1a1a] py-2 px-4 rounded-md">Cancelar</button>
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
        bg-[#f2bd46] text-white font-bold py-3 px-4 
        flex items-center justify-center gap-2 rounded-lg 
        shadow-lg shadow-[#f2bd46]/40 hover:shadow-[#f2bd46]/60 /* Sombra neon estática */
        transition-all disabled:bg-[#1a1a1a] disabled:shadow-none
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
        <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4">
            <style>{keyframes}</style>
            
            <div className="w-full max-w-md">

                {/* --- CARD DE VIDRO (Layout do Login) --- */}
                <div className="border-gray-700 backdrop-blur-sm 
                                border border-gray-700/50 
                                p-8 rounded-2xl shadow-2xl 
                                animate-surgir"
                >
                    
                    {/* Logo (Imagem) */}
                    <div className="text-center mb-8 animate-surgir" style={{ animationDelay: '100ms' }}>
                        <img 
                            src="https://i.postimg.cc/5yNYZHHp/Design-sem-nome-(1).png" // Caminho para a pasta /public
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
                                className="w-full bg-[#1a1a1a]/50 border border-gray-600/50 rounded-lg py-4 pl-12 pr-4 
                                           text-white text-base
                                           focus:outline-none focus:ring-2 focus:ring-[#f2bd46]
                                           appearance-none"
                                required
                                disabled={isLoading || condos.length === 0}
                            >
                                <option value="">{isLoading ? 'A carregar...' : 'Selecione um condomínio'}</option>
                                {condos.map(condo => (
                                    <option key={condo.id} value={condo.id} className="bg-[#1a1a1a]">{condo.name}</option>
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
                                className="h-4 w-4 text-[#f2bd46]-600 bg-[#1a1a1a] border-gray-600 rounded focus:ring-[#f2bd46] focus:ring-offset-gray-900"
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
            <div className="w-full bg-[#1a1a1a] rounded-full h-2.5">
                <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        );
    };

    // --- COMPONENTE DE INSIGHTS ATUALIZADO ---
    const AIInsights = ({ insights }) => (
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-[#f2bd46]">Insights do Assistente (Período)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Insight 1: Mais Vendidos (Unidades) */}
                <div>
                    <h4 className="font-semibold text-lg mb-2">🏆 Mais Vendidos (un.)</h4>
                    <div className="flex flex-col gap-2 text-sm">
                        {insights.topSellers?.length > 0 ? insights.topSellers.map(p => (
                            <p key={p.id} className="bg-[#1a1a1a] p-2 rounded-md">{p.name} <span className="font-bold float-right">{p.units_sold_in_period} un.</span></p>
                        )) : <p className="text-sm text-gray-500">Nenhuma venda no período.</p>}
                    </div>
                </div>
                
                {/* Insight 2: Mais Lucrativos (R$) */}
                <div>
                    <h4 className="font-semibold text-lg mb-2">💰 Mais Lucrativos (R$)</h4>
                     <div className="flex flex-col gap-2 text-sm">
                        {insights.topLucrative?.length > 0 ? insights.topLucrative.map(p => (
                            <p key={p.id} className="bg-[#1a1a1a] p-2 rounded-md">{p.name} 
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
                            <p key={p.id} className="font-bold text-[#f2bd46]-300 bg-[#1a1a1a] p-2 rounded-md">- {p.name} ({p.current_stock} un.)</p>
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
            <div className="bg-[#1a1a1a] p-4 rounded-lg mb-6 flex flex-wrap items-end gap-4">
                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Filtrar por Condomínio</label>
                    <select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="bg-[#1a1a1a] border border-gray-600 rounded-lg py-2 px-3">
                        {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div><label className="text-sm text-gray-400 mb-1 block">De</label><input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="bg-[#1a1a1a] border border-gray-600 rounded-lg py-2 px-3" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Até</label><input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="bg-[#1a1a1a] border border-gray-600 rounded-lg py-2 px-3" /></div>
                <button onClick={handleFilterToday} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Hoje</button>
                <button onClick={handleApplyFilters} className="bg-[#f2bd46] hover:bg-[#f2bd46] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Filter size={16} /> Aplicar</button>
            </div>
            {/* --- FIM DOS FILTROS --- */}

            
            {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#f2bd46]" size={48}/></div> : 
             error ? <p className="text-red-400 text-center">{error}</p> :
             (
                <>
                    {/* --- NOVOS CARDS DE RESUMO --- */}
                    <h3 className="text-2xl font-bold mb-4 text-[#f2bd46]">Resumo do Estoque (Total)</h3>
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
                            <div key={product.id} className="bg-[#1a1a1a] rounded-lg p-4 flex flex-col gap-4">
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
                                    <div className="bg-[#1a1a1a] p-2 rounded-md">
                                        <p className="text-xs text-gray-400">Custo Total em Stock</p>
                                        <p className="font-bold text-yellow-400">R$ {parseFloat(product.total_cost_in_stock).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-2 rounded-md">
                                        <p className="text-xs text-gray-400">Lucro Potencial</p>
                                        <p className="font-bold text-green-400">R$ {parseFloat(product.potential_net_profit).toFixed(2)}</p>
                                    </div>
                                    {/* --- DADOS ATUALIZADOS (Período) --- */}
                                    <div className="bg-[#1a1a1a] p-2 rounded-md">
                                        <p className="text-xs text-gray-400">Vendas (Período)</p>
                                        <p className="font-bold">{product.units_sold_in_period} un.</p>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-2 rounded-md">
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

const ExpiringSoonWidget = ({ token, condominiums }) => {
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [selectedCondoId, setSelectedCondoId] = React.useState('all'); // Estado para o filtro

    React.useEffect(() => {
        const fetchExpiringSoon = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Adiciona o filtro de condomínio à query
                const params = new URLSearchParams({ condoId: selectedCondoId });
                
                // --- CORREÇÃO: Chama a nova rota /api/admin/critical-stock (que agora é o widget) ---
                const response = await fetch(`${API_URL}/api/admin/critical-stock?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Falha ao buscar produtos.');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExpiringSoon();
    }, [token, selectedCondoId]); // Recarrega quando o filtro mudar

    return (
        <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#f2bd46] flex items-center gap-2">
                    {/* Ícone e Título Atualizados */}
                    <Calendar size={24} /> Próximo da Validade
                </h3>
                {/* Filtro de Condomínio Adicionado */}
                <select 
                    value={selectedCondoId} 
                    onChange={(e) => setSelectedCondoId(e.target.value)} 
                    className="bg-[#1a1a1a] border border-gray-600 rounded-lg py-1 px-2 text-xs"
                >
                    <option value="all">Todos os Condomínios</option>
                    {condominiums && condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            {isLoading && <div className="flex-grow flex justify-center items-center"><Loader2 className="animate-spin text-[#f2bd46]" size={32}/></div>}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {!isLoading && !error && (
                products.length > 0 ? (
                    <ul className="space-y-3 flex-grow overflow-auto scrollbar-hide">
                        {products.map(p => (
                            <li key={p.id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-md">
                                <img 
                                    src={p.image_url || `https://placehold.co/40x40/374151/ffffff?text=${p.name.replace(' ', '+').substring(0,2)}`} 
                                    alt={p.name} 
                                    className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                                />
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-gray-100 truncate">{p.name}</p>
                                    {/* UI Atualizada para mostrar Quantidade */}
                                    <p className="text-sm text-gray-400">{p.quantity} un.</p>
                                </div>
                                {/* UI Atualizada para mostrar Data de Vencimento */}
                                <span className="font-bold text-red-400 text-sm flex-shrink-0">
                                    {new Date(p.nearest_expiration_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex-grow flex flex-col justify-center items-center text-gray-500 text-center">
                        <CheckCircle2 size={48} className="mb-2 text-green-500"/>
                        <p className="text-lg font-semibold">Tudo em dia!</p>
                        <p className="text-sm">Nenhum produto vencendo nos próximos 30 dias.</p>
                    </div>
                )
            )}
        </div>
    );
};

const LatestOrdersWidget = ({ token, condominiums }) => {
    const [orders, setOrders] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [selectedCondoId, setSelectedCondoId] = React.useState('all'); // Estado para o filtro

    React.useEffect(() => {
        const fetchLatestOrders = async () => {
            setIsLoading(true);
            try {
                // Adiciona o filtro de condomínio à query
                const params = new URLSearchParams({ condoId: selectedCondoId });
                
                const response = await fetch(`${API_URL}/api/admin/latest-orders?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao buscar últimos pedidos.');
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLatestOrders();
    }, [token, selectedCondoId]); // Recarrega quando o filtro mudar

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                    <History size={24} /> Últimos Pedidos
                </h3>
                {/* Filtro de Condomínio Adicionado */}
                <select 
                    value={selectedCondoId} 
                    onChange={(e) => setSelectedCondoId(e.target.value)} 
                    className="bg-[#1a1a1a] border border-gray-600 rounded-lg py-1 px-2 text-xs"
                >
                    <option value="all">Todos os Condomínios</option>
                    {condominiums && condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            {isLoading && <div className="flex-grow flex justify-center items-center"><Loader2 className="animate-spin text-blue-500" size={32}/></div>}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {!isLoading && !error && (
                orders.length > 0 ? (
                    <ul className="space-y-3 flex-grow overflow-auto scrollbar-hide">
                        {orders.map(order => (
                            <li key={order.id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-md">
                                <div className="flex-grow min-w-0">
                                    {/* UI Atualizada para mostrar nomes dos produtos */}
                                    <p className="font-semibold text-gray-100 truncate" title={order.product_names}>
                                        {order.product_names || 'Itens Indefinidos'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {order.item_count} itens • {order.user_name}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-green-400">R$ {parseFloat(order.total_amount).toFixed(2).replace('.', ',')}</p>
                                    <p className="text-xs text-gray-500">{formatTime(order.created_at)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex-grow flex flex-col justify-center items-center text-gray-500 text-center">
                        <Info size={48} className="mb-2 text-gray-400"/>
                        <p className="text-lg font-semibold">Nenhum pedido recente.</p>
                        <p className="text-sm">Nenhuma venda registrada para este filtro.</p>
                    </div>
                )
            )}
        </div>
    );
};

const SalesPerformanceWidget = ({ title, data, type }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-xl h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold text-[#f2bd46] mb-4">{title}</h3>
                <p className="text-sm text-center text-gray-500">Nenhum dado de vendas no período.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-[#f2bd46] mb-4 flex items-center gap-2">
                {type === 'top' ? <Trophy size={20} /> : <ThumbsDown size={20} />} {title}
            </h3>
            <ul className="space-y-3 flex-grow overflow-auto scrollbar-hide">
                {data.map((p, index) => (
                    <li key={p.id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl transition-shadow hover:shadow-lg">
                        <span className={`text-lg font-extrabold ${type === 'top' ? 'text-green-400' : 'text-red-400'} w-6 flex-shrink-0`}>
                            {index + 1}.
                        </span>
                        <img 
                            src={p.image_url || `https://placehold.co/40x40/374151/ffffff?text=${p.name.replace(' ', '+').substring(0,2)}`} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-grow min-w-0">
                            <p className="font-semibold text-gray-100 truncate">{p.name}</p>
                        </div>
                        <span className="font-bold text-lg text-white flex-shrink-0">{p.units_sold} un.</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const InventoryValueWidget = ({ data }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-xl h-full flex flex-col justify-between">
        <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
            <Package size={24} /> Valor Global do Inventário
        </h3>
        <div className="space-y-3">
            <div className="bg-[#1a1a1a] p-4 rounded-xl">
                <p className="text-sm text-gray-400">Custo Total de estoque</p>
                <p className="text-2xl font-bold text-yellow-400">R$ {parseFloat(data.total_inventory_cost || 0).toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded-xl">
                <p className="text-sm text-gray-400">Lucro Potencial Bruto</p>
                <p className="text-2xl font-bold text-green-400">R$ {parseFloat(data.total_potential_profit_value || 0).toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    </div>
);


const AdminDashboardPage = ({ token, setActiveTab }) => {
    const [stats, setStats] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [condominiums, setCondominiums] = React.useState([]);
    
    // --- FILTROS (Lógica Intocada) ---
    const [filterInputs, setFilterInputs] = React.useState({ startDate: '', endDate: '', condoId: 'all' });
    
    const getTodayInBrasilia = () => {
        const date = new Date();
        const [day, month, year] = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    const fetchStats = React.useCallback(async () => {
        setIsLoading(true); setError('');
        const params = new URLSearchParams();
        if (filterInputs.startDate) params.append('startDate', filterInputs.startDate);
        if (filterInputs.endDate) params.append('endDate', filterInputs.endDate);
        if (filterInputs.condoId) params.append('condoId', filterInputs.condoId);

        try {
            const [statsRes, condoRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/dashboard-stats?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/condominiums`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            if (!statsRes.ok || !condoRes.ok) throw new Error('Falha ao buscar dados.');

            const data = await statsRes.json();
            const condoData = await condoRes.json();
            
            setStats(data);
            setCondominiums(condoData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [filterInputs, token]);

    React.useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleInputChange = (e) => { setFilterInputs(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    
    const handleFilterToday = () => {
        const today = getTodayInBrasilia();
        setFilterInputs(prev => ({ ...prev, startDate: today, endDate: today }));
    };
    
    const handleClearFilters = () => {
        setFilterInputs({ startDate: '', endDate: '', condoId: 'all' });
    };

    // ==============================================
    // --- ANIMAÇÕES (Premium Glassmorphism) ---
    // ==============================================
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        /* Custom Scrollbar para áreas com overflow */
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(242, 189, 70, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(242, 189, 70, 0.6); }
    `;

    // --- NOVO CARD DE ESTATÍSTICA (Visual Substitui o AdminStatCard antigo) ---
    const StatCard = ({ icon, label, value, colorClass, delay }) => (
        <div 
            className="animate-surgir bg-black/40 backdrop-blur-2xl border border-gray-700/50 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden group hover:border-gray-500/50 transition-all duration-300"
            style={{ animationDelay: delay }}
        >
            {/* Glow de fundo que acompanha a cor do card */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${colorClass.replace('text-', 'bg-')}`}></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-3.5 rounded-2xl bg-black/50 border border-gray-800 ${colorClass} group-hover:scale-110 group-hover:shadow-[0_0_15px_currentColor] transition-all duration-300 shadow-inner`}>
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-xs sm:text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-3xl sm:text-4xl font-black tracking-tighter ${colorClass} drop-shadow-md`}>{value}</p>
            </div>
        </div>
    );

    // --- TELAS DE LOADING E ERRO (Modernizadas) ---
    if (isLoading) return (
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
            <Loader2 className="animate-spin text-[#f2bd46] drop-shadow-[0_0_10px_rgba(242,189,70,0.5)]" size={56} />
            <span className="text-[#f2bd46] font-bold tracking-widest animate-pulse text-sm">SINCRONIZANDO DADOS...</span>
        </div>
    );
    
    if (error) return (
        <div className="flex justify-center items-center h-[50vh]">
            <div className="bg-red-900/10 border border-red-500/30 text-red-400 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center max-w-lg text-center animate-surgir">
                <AlertTriangle size={48} className="mb-4 text-red-500" />
                <h3 className="text-xl font-bold text-white mb-2">Erro de Conexão</h3>
                <p className="text-sm opacity-80">{error}</p>
                <button onClick={fetchStats} className="mt-6 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-2 px-6 rounded-xl transition-colors border border-red-500/30">Tentar Novamente</button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 pb-12 relative z-10">
            <style>{keyframes}</style>

            {/* Cabeçalho do Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800/80 pb-6 animate-surgir">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f2bd46] to-yellow-200 tracking-tight mb-1">
                        Dashboard de Gestão
                    </h2>
                    <p className="text-gray-400 font-medium text-sm">Visão geral e acompanhamento em tempo real</p>
                </div>
                <div className="bg-black/40 border border-gray-800 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 text-sm text-gray-300 font-bold">
                    <Calendar size={16} className="text-[#f2bd46]"/> {new Date().toLocaleDateString('pt-BR')}
                </div>
            </div>
            
            {/* --- CARDS DE MÉTRICAS (GRID RESPONSIVA REFINADA) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                <StatCard 
                    icon={<DollarSign size={28} />} 
                    label="Faturamento Hoje" 
                    value={`R$ ${(stats?.revenue_today || 0).toFixed(2).replace('.',',')}`} 
                    colorClass="text-green-400" 
                    delay="0ms"
                />
                <StatCard 
                    icon={<PiggyBank size={28} />} 
                    label="Lucro Líquido Hoje" 
                    value={`R$ ${(stats?.net_profit_today || 0).toFixed(2).replace('.',',')}`} 
                    colorClass="text-teal-400" 
                    delay="50ms"
                />
                <StatCard 
                    icon={<ShoppingCart size={28} />} 
                    label="Pedidos Hoje" 
                    value={stats?.orders_today || 0} 
                    colorClass="text-[#f2bd46]" 
                    delay="100ms"
                />
                <StatCard 
                    icon={<UsersIcon size={28} />} 
                    label="Total Utilizadores" 
                    value={stats?.total_users || 0} 
                    colorClass="text-purple-400" 
                    delay="150ms"
                />
            </div>

            {/* --- SEÇÃO OPERACIONAL --- */}
            <div className="mt-4 animate-surgir" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                        <LayoutDashboard size={24} className="text-blue-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Operacional e Inventário</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Wrappers com Glassmorphism para os Widgets existentes */}
                    <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-5 shadow-2xl hover:border-gray-600 transition-colors">
                        <InventoryValueWidget data={stats?.inventory_value || {}} />
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-5 shadow-2xl hover:border-gray-600 transition-colors"> 
                        <DailyPromotionsWidget token={token} />
                    </div>

                    <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-5 shadow-2xl hover:border-gray-600 transition-colors custom-scrollbar overflow-x-auto">
                        <ExpiringSoonWidget token={token} condominiums={condominiums} />
                    </div>
                </div>
            </div>
            
            {/* --- WIDGET ÚLTIMOS PEDIDOS --- */}
            <div className="mt-4 bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl animate-surgir custom-scrollbar overflow-x-auto" style={{ animationDelay: '250ms' }}>
                <LatestOrdersWidget token={token} condominiums={condominiums} />
            </div>
            
            {/* --- SEÇÃO DE VENDAS (PERFORMANCE) --- */}
            <div className="mt-8 animate-surgir" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#f2bd46]/10 p-2 rounded-xl border border-[#f2bd46]/20">
                        <BarChart size={24} className="text-[#f2bd46]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Performance de Vendas</h3>
                </div>

                {/* --- FILTROS RESPONSIVOS (Painel de Controle Glassmorphism) --- */}
                <div className="bg-black/60 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl shadow-xl border border-gray-700/80 mb-8 relative overflow-hidden">
                    {/* Detalhe visual de linha no topo do filtro */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2bd46]/50 to-transparent"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end relative z-10">
                        <div className="w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Condomínio</label>
                            <select name="condoId" onChange={handleInputChange} value={filterInputs.condoId} className="w-full bg-black/50 border border-gray-600 rounded-xl py-3 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all appearance-none cursor-pointer">
                                <option value="all">Geral (Todos)</option>
                                {condominiums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-2"><Calendar size={14}/> De</label>
                            <input name="startDate" type="date" onChange={handleInputChange} value={filterInputs.startDate} className="w-full bg-black/50 border border-gray-600 rounded-xl py-3 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all [color-scheme:dark]" />
                        </div>

                        <div className="w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block flex items-center gap-2"><Calendar size={14}/> Até</label>
                            <input name="endDate" type="date" onChange={handleInputChange} value={filterInputs.endDate} className="w-full bg-black/50 border border-gray-600 rounded-xl py-3 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all [color-scheme:dark]" />
                        </div>

                        <button onClick={handleFilterToday} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] flex justify-center items-center gap-2 border border-blue-400/50">
                            <Filter size={18} /> Filtrar Hoje
                        </button>

                        <button onClick={handleClearFilters} className="w-full bg-black/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 text-gray-300 font-bold py-3 px-4 rounded-xl transition-all border border-gray-600 flex justify-center items-center gap-2">
                            <Trash2 size={18} /> Limpar
                        </button>
                    </div>
                </div>
                
                {/* --- LISTAS TOP/LEAST --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-5 sm:p-6 shadow-2xl custom-scrollbar overflow-x-auto hover:border-[#f2bd46]/30 transition-colors group">
                        <SalesPerformanceWidget title="🏆 Mais Vendidos" data={stats?.top_sellers || []} type="top" />
                     </div>
                     <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-5 sm:p-6 shadow-2xl custom-scrollbar overflow-x-auto hover:border-red-500/30 transition-colors group">
                        <SalesPerformanceWidget title="📉 Menos Vendidos" data={stats?.least_sellers || []} type="least" />
                     </div>
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

    const ProductManager = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('all');
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10; // 10 produtos por página
    
    // 1. Filtragem (Lógica 100% Intocada)
    const filteredProducts = products.filter(product => {
        const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || !filterCategory || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });
    
    // 2. Paginação (Lógica 100% Intocada)
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Resetar página quando filtrar
    React.useEffect(() => { setCurrentPage(1); }, [searchQuery, filterCategory]);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    // ==============================================
    // --- ANIMAÇÕES E CLASSES PREMIUM ---
    // ==============================================
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-surgir {
            animation: surgir 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(242, 189, 70, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(242, 189, 70, 0.6); }
    `;

    return (
        <div className="flex flex-col gap-6 md:gap-8 pb-12 relative z-10">
            <style>{keyframes}</style>

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800/80 pb-6 animate-surgir">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-1">
                        Catálogo de Produtos
                    </h2>
                    <p className="text-gray-400 font-medium text-sm">Gerencie seu estoque, preços e disponibilidade</p>
                </div>
                <button 
                    onClick={() => handleOpenProductModal()} 
                    className="w-full md:w-auto bg-[#f2bd46] hover:bg-[#e0af40] text-black font-extrabold py-3.5 md:py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(242,189,70,0.3)] hover:shadow-[0_0_25px_rgba(242,189,70,0.6)] transition-all duration-300 hover:-translate-y-0.5"
                >
                    <PlusCircle size={20} /> Novo Produto
                </button>
            </div>
            
            {/* --- FILTROS RESPONSIVOS (Glassmorphism) --- */}
            <div className="bg-black/60 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl shadow-xl border border-gray-700/80 relative overflow-hidden animate-surgir" style={{ animationDelay: '50ms' }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f2bd46]/50 to-transparent"></div>
                
                <div className="flex flex-col md:flex-row gap-5 items-end relative z-10">
                    <div className="w-full md:flex-grow">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Pesquisar Produto</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-500" size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Nome, marca..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/50 border border-gray-600 rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all placeholder-gray-600"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-auto md:min-w-[280px]">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Filtrar por Categoria</label>
                        <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)} 
                            className="w-full bg-black/50 border border-gray-600 rounded-xl py-3.5 px-4 text-white focus:border-[#f2bd46] focus:ring-1 focus:ring-[#f2bd46] outline-none transition-all cursor-pointer appearance-none"
                        >
                            <option value="all">Todas as Categorias</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {isLoading && activeTab === 'products' ? (
                <div className="flex flex-col justify-center items-center h-64 gap-4 bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl animate-surgir">
                    <Loader2 className="animate-spin text-[#f2bd46]" size={48} />
                    <span className="text-gray-400 font-bold tracking-widest text-sm animate-pulse">CARREGANDO CATÁLOGO...</span>
                </div>
            ) : (
                <div className="animate-surgir" style={{ animationDelay: '100ms' }}>
                    
                    {/* --- VISÃO PC (Tabela Premium Glassmorphism) --- */}
                    <div className="hidden md:block bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-black/60 border-b border-gray-700/80 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="p-5">Produto</th>
                                        <th className="p-5">Categoria</th>
                                        <th className="p-5">Preço Venda</th>
                                        <th className="p-5 text-center">Promoção</th>
                                        <th className="p-5 text-center">Estoque Total</th>
                                        <th className="p-5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/80">
                                    {currentItems.length > 0 ? currentItems.map(product => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors duration-300">
                                            <td className="p-5 flex items-center gap-4">
                                                <img src={product.image_url || 'https://placehold.co/100x100/1a1a1a/4B5563?text=Img'} className="h-12 w-12 rounded-xl object-cover border border-gray-700/50 shadow-sm" alt={product.name}/>
                                                <span className="font-extrabold text-white text-base truncate max-w-[200px]">{product.name}</span>
                                            </td>
                                            <td className="p-5 text-gray-400 font-medium">
                                                <span className="bg-gray-800/50 px-3 py-1 rounded-full text-xs border border-gray-700/50">{product.category || 'Sem Categoria'}</span>
                                            </td>
                                            <td className="p-5">
                                                {product.promotional_price ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-500 line-through mb-0.5">R$ {parseFloat(product.sale_price).toFixed(2)}</span>
                                                        <span className="text-green-400 font-black tracking-tight text-lg shadow-green-400/20 drop-shadow-md">R$ {parseFloat(product.promotional_price).toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-white font-black tracking-tight text-lg">R$ {parseFloat(product.sale_price).toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-center">
                                                {product.promotional_price ? (
                                                    <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest">ATIVA</span>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${product.global_stock <= 5 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-gray-800/50 text-white border-gray-700/50'}`}>
                                                    {product.global_stock} un.
                                                </span>
                                            </td>
                                            <td className="p-5 flex justify-center gap-2">
                                                <button onClick={() => handleOpenProductModal(product)} className="text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 p-2.5 rounded-xl transition-all"><Edit size={18}/></button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 p-2.5 rounded-xl transition-all"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center p-12 text-gray-500 font-medium">Nenhum produto encontrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- VISÃO MOBILE (Cards Premium Reestilizados) --- */}
                    <div className="md:hidden flex flex-col gap-4">
                        {currentItems.length > 0 ? currentItems.map(product => (
                            <div key={product.id} className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/50 shadow-lg relative overflow-hidden flex flex-col">
                                
                                {/* Etiqueta de Promoção Absoluta */}
                                {product.promotional_price && (
                                    <div className="absolute top-0 right-0 bg-green-500/20 backdrop-blur-md border-b border-l border-green-500/30 text-green-400 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-bl-xl z-10 shadow-sm">
                                        OFERTA
                                    </div>
                                )}

                                <div className="flex gap-4 items-start">
                                    <img 
                                        src={product.image_url || 'https://placehold.co/120x120/1a1a1a/4B5563?text=Foto'} 
                                        className="h-24 w-24 rounded-xl object-cover border border-gray-700/50 shrink-0 shadow-md" 
                                        alt={product.name}
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col pt-1">
                                        <h3 className="font-extrabold text-white text-lg tracking-tight leading-tight mb-1">{product.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{product.category || 'Sem Categoria'}</p>
                                        
                                        <div className="flex items-end justify-between mt-auto">
                                            <div className="flex flex-col">
                                                {product.promotional_price ? (
                                                    <>
                                                        <span className="text-[10px] text-gray-500 line-through mb-0.5">R$ {parseFloat(product.sale_price).toFixed(2)}</span>
                                                        <span className="text-xl font-black text-green-400 tracking-tight leading-none drop-shadow-md">R$ {parseFloat(product.promotional_price).toFixed(2)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl font-black text-white tracking-tight leading-none">R$ {parseFloat(product.sale_price).toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Indicadores e Ações na parte inferior do Card */}
                                <div className="mt-4 pt-4 border-t border-gray-800/80 flex flex-col gap-3">
                                    <div className="flex justify-between items-center bg-black/60 border border-gray-800 p-3 rounded-xl shadow-inner">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Estoque:</span>
                                        <span className={`px-2 py-1 rounded-md text-xs font-black ${product.global_stock <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-white'}`}>
                                            {product.global_stock} unidades
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleOpenProductModal(product)} 
                                            className="flex-1 bg-transparent border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
                                        >
                                            <Edit size={16} /> Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteProduct(product.id)} 
                                            className="flex-1 bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
                                        >
                                            <Trash2 size={16} /> Apagar
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )) : (
                            <div className="text-center p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 text-gray-500 font-medium">
                                Nenhum produto encontrado.
                            </div>
                        )}
                    </div>

                    {/* --- PAGINAÇÃO (Visível em Mobile e Desktop) --- */}
                    {filteredProducts.length > itemsPerPage && (
                        <div className="mt-6 bg-black/60 backdrop-blur-2xl p-4 sm:px-6 rounded-2xl border border-gray-700/80 shadow-xl flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-400 font-medium">
                                Página <span className="text-white font-black bg-gray-800 px-2 py-1 rounded">{currentPage}</span> de {totalPages}
                            </span>
                            <div className="flex gap-2 sm:gap-3">
                                <button 
                                    onClick={prevPage} 
                                    disabled={currentPage === 1}
                                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${currentPage === 1 ? 'bg-black/40 text-gray-600 cursor-not-allowed border border-gray-800' : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 shadow-md'}`}
                                >
                                    Anterior
                                </button>
                                <button 
                                    onClick={nextPage} 
                                    disabled={currentPage === totalPages}
                                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${currentPage === totalPages ? 'bg-black/40 text-gray-600 cursor-not-allowed border border-gray-800' : 'bg-[#f2bd46] text-black hover:bg-[#e0af40] border border-[#f2bd46]/50 shadow-[0_0_10px_rgba(242,189,70,0.2)]'}`}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    )}
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
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Gestão de Condomínios</h2>
                    <button onClick={() => onAddNew()} className="bg-[#f2bd46] hover:bg-[#f2bd46] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <PlusCircle size={20} /> Novo Condomínio
                    </button>
                </div>
                {isLoading && activeTab === 'condominiums' ? <Loader2 className="animate-spin" /> : (
                    <div className="bg-[#1a1a1a] rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#1a1a1a]">
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

    // --- FUNÇÃO RENDERCONTENT ---
    const renderContent = () => {
        const isMainLoading = (isLoading && (products.length === 0 || condominiums.length === 0));
        if (isMainLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 text-[#f2bd46] animate-spin" /></div>;
        if (error) return <div className="text-red-400 bg-red-900/20 p-4 rounded-lg">Erro: {error}</div>;
        
        switch (activeTab) {
            case 'dashboard': return <AdminDashboardPage token={token} setActiveTab={setActiveTab} />;
            case 'sales': return <EntradasVendasPage condominiums={condominiums} token={token} />;
            case 'central-cashier': return <CentralCashierPage token={token} />;
            case 'critical-stock': return <CriticalStockPage condominiums={condominiums} token={token} />;
            case 'users': return <UserManagementPage condominiums={condominiums} token={token} />;
            case 'stock': return <StockManagement condominiums={condominiums} products={products} token={token} />;
            case 'condominiums': return <CondoManager condominiums={condominiums} onAddNew={handleOpenCondoModal} onEdit={handleOpenCondoModal} onDelete={handleDeleteCondo} token={token} />;
            case 'products': return <ProductManager />; 
            case 'finance': return <FinanceReport condominiums={condominiums} token={token} />;
            default: return <div>Selecione uma opção</div>;
        }
    };

    // Função para fechar o menu ao clicar num link (mobile)
    const handleNavClick = (tab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
            <CondoModal isOpen={isCondoModalOpen} onClose={handleCloseCondoModal} onSave={handleSaveCondo} condo={currentCondo} />
            <ProductModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} onSave={handleSaveProduct} product={currentProduct} />
            
            {/* --- HEADER MOBILE (Novo) --- */}
            <div className="md:hidden bg-[#1a1a1a] p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#f2bd46]">DM</span>
                    <span className="text-xl font-light">Admin</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-1">
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* --- OVERLAY PARA MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}
            
            {/* --- SIDEBAR RESPONSIVA --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1a1a] p-4 flex flex-col shrink-0 border-r border-gray-700
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:block
            `}>
                <div className="text-center mb-8 hidden md:block">
                    <span className="text-2xl font-bold text-[#f2bd46]">DM</span><span className="text-2xl font-light text-white">24h</span>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Painel Admin</p>
                </div>
                
                <nav className="flex flex-col gap-1 flex-grow overflow-y-auto">
                    <NavButton active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavButton active={activeTab === 'sales'} onClick={() => handleNavClick('sales')} icon={<DollarSign size={20} />} label="Entradas e Vendas" />
                    <NavButton active={activeTab === 'central-cashier'} onClick={() => handleNavClick('central-cashier')} icon={<PiggyBank size={20} />} label="Caixa Central" />
                    
                    <div className="my-2 border-t border-gray-700/50"></div>
                    
                    <NavButton active={activeTab === 'products'} onClick={() => handleNavClick('products')} icon={<Package size={20} />} label="Catálogo Produtos" />
                    <NavButton active={activeTab === 'stock'} onClick={() => handleNavClick('stock')} icon={<ShoppingCart size={20} />} label="Estoque Geral" />
                    <NavButton active={activeTab === 'critical-stock'} onClick={() => handleNavClick('critical-stock')} icon={<AlertTriangle size={20} />} label="Validade / Críticos" />
                    
                    <div className="my-2 border-t border-gray-700/50"></div>

                    <NavButton active={activeTab === 'condominiums'} onClick={() => handleNavClick('condominiums')} icon={<Building2 size={20} />} label="Condomínios" />
                    <NavButton active={activeTab === 'users'} onClick={() => handleNavClick('users')} icon={<UsersIcon size={20} />} label="Utilizadores" />
                    <NavButton active={activeTab === 'finance'} onClick={() => handleNavClick('finance')} icon={<BarChart size={20} />} label="Relatórios" />
                </nav>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <button onClick={onLogout} className="flex items-center w-full gap-3 p-3 rounded-md text-red-400 hover:bg-red-500/10 transition">
                        <LogOut size={20} /> Sair
                    </button>
                </div>
            </aside>
            
            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                {renderContent()}
            </main>
        </div>
    )
};

// Componente auxiliar para os botões do menu ficarem mais limpos
const NavButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-3 p-3 rounded-md transition text-sm font-medium
        ${active ? 'bg-[#f2bd46] text-white shadow-lg shadow-[#f2bd46]/20' : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'}`}
    >
        {icon} {label}
    </button>
);


const MyTicketsPage = ({ setPage }) => {
    const [tickets, setTickets] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const token = localStorage.getItem('token');

    // --- DEFINIÇÃO DAS ANIMAÇÕES (Surgindo + Premium) ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 15px rgba(242, 189, 70, 0.2); }
            50% { box-shadow: 0 0 25px rgba(242, 189, 70, 0.5); }
        }
        .animate-surgir {
            animation: surgir 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .animate-pulse-glow {
            animation: pulse-glow 2.5s infinite;
        }
    `;

    const fetchTickets = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/user/tickets`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar tiquetes.');
            const data = await response.json();
            setTickets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    
    React.useEffect(() => { fetchTickets(); }, [fetchTickets]);
    
    const handleMarkAsRead = async (ticketId) => {
        try {
            const response = await fetch(`${API_URL}/api/user/tickets/${ticketId}/read`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao marcar como lido.');
            // Atualiza o estado localmente para a UI responder na hora
            setTickets(prevTickets => prevTickets.map(t => t.id === ticketId ? { ...t, is_read: true } : t));
        } catch (err) {
            alert(err.message);
        }
    };
    
    return (
        <>
            {/* Injeta as animações */}
            <style>{keyframes}</style>

            <div 
                className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('https://i.ibb.co/N2Hh8yjt/Chat-GPT-Image-12-de-mai-de-2026-10-20-15.png')` }}
            >
                {/* Overlay Escuro e Ambient Glow */}
                <div className="absolute inset-0 bg-black/85 z-0"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#f2bd46]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
                
                {/* --- HEADER (Glassmorphism) --- */}
                <header className="bg-black/60 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] sticky top-0 z-30 border-b border-gray-800/80 relative">
                    <div className="container mx-auto px-4 py-5 flex items-center gap-4">
                        <button 
                            onClick={() => setPage('home')} 
                            className="bg-black/40 hover:bg-white/10 p-2.5 rounded-full border border-gray-700/50 text-gray-300 hover:text-[#f2bd46] transition-all duration-300 backdrop-blur-md"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Meus <span className="text-[#f2bd46]">Tiquetes</span></h1>
                    </div>
                </header>
                
                <main className="container mx-auto p-4 md:p-8 relative z-10">
                    <div className="max-w-3xl mx-auto flex flex-col gap-5">
                        
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center h-64 gap-4">
                                <Loader2 className="w-12 h-12 text-[#f2bd46] animate-spin drop-shadow-[0_0_10px_rgba(242,189,70,0.5)]" />
                                <span className="text-gray-400 font-bold tracking-widest animate-pulse text-sm">CARREGANDO...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center p-8 bg-red-900/10 border border-red-500/20 text-red-400 rounded-2xl backdrop-blur-md shadow-lg flex flex-col items-center gap-3">
                                <p className="font-bold text-lg">Oops! Algo deu errado.</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket, index) => (
                                
                                // --- CARD DE TICKET (Premium Glassmorphism) ---
                                <div 
                                    key={ticket.id} 
                                    className={`animate-surgir bg-black/40 backdrop-blur-xl border p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 transition-all duration-300 shadow-lg group hover:-translate-y-1
                                                ${ticket.is_read 
                                                    ? 'border-gray-700/50 hover:bg-black/60 hover:border-gray-500/50' // LIDO
                                                    : 'border-[#f2bd46]/40 animate-pulse-glow bg-[#f2bd46]/5' // NÃO LIDO
                                                }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Ícone de Status */}
                                    <div className="flex-shrink-0 flex items-start">
                                        <div className={`p-3 rounded-xl border ${ticket.is_read ? 'bg-black/50 border-gray-800' : 'bg-[#f2bd46]/20 border-[#f2bd46]/40 shadow-[0_0_15px_rgba(242,189,70,0.3)]'}`}>
                                            {ticket.is_read ? (
                                                <CheckCircle2 size={24} className="text-gray-500" />
                                            ) : (
                                                <Bell size={24} className="text-[#f2bd46]" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Conteúdo */}
                                    <div className="flex-grow min-w-0 flex flex-col justify-center">
                                        <p className={`text-base sm:text-lg leading-relaxed mb-2 ${ticket.is_read ? 'text-gray-300' : 'text-white font-medium'}`}>
                                            {ticket.message}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-auto">
                                            <Calendar size={14} className="opacity-70" /> 
                                            {new Date(ticket.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    
                                    {/* Botão de Marcar como Lido */}
                                    {!ticket.is_read && (
                                        <div className="flex-shrink-0 self-start sm:self-center w-full sm:w-auto mt-4 sm:mt-0">
                                            <button 
                                                onClick={() => handleMarkAsRead(ticket.id)} 
                                                className="w-full sm:w-auto bg-[#f2bd46]/10 text-[#f2bd46] hover:bg-[#f2bd46] hover:text-black border border-[#f2bd46]/30 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Check size={16} /> Marcar como lida
                                            </button>
                                        </div>
                                    )}
                                </div>
                            
                            ))
                        ) : (
                            // --- "Empty State" (Redesenhado) ---
                            <div className="animate-surgir text-center p-12 bg-black/40 backdrop-blur-xl border border-gray-700/50 text-gray-400 rounded-3xl shadow-xl flex flex-col items-center">
                                <div className="bg-gray-800/50 p-6 rounded-full mb-6 border border-gray-700/50 shadow-inner">
                                    <Ticket size={48} className="text-gray-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Nenhum tiquete por aqui</h2>
                                <p className="max-w-xs mx-auto text-sm text-gray-400 leading-relaxed">
                                    Você não recebeu nenhuma mensagem ou notificação do administrador recentemente.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

const UserEditModal = ({ user, isOpen, onClose, onSave, token }) => {
    // --- ESTADO ATUALIZADO ---
    const [formData, setFormData] = React.useState({});
    const [balanceToAdd, setBalanceToAdd] = React.useState('');
    const [balanceReason, setBalanceReason] = React.useState('');
    const [ticketMessage, setTicketMessage] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [modalError, setModalError] = React.useState('');
    const [modalSuccess, setModalSuccess] = React.useState('');
    // Campos de crédito e faturas REMOVIDOS

    const fetchUserData = React.useCallback(async () => {
        if (!user) return;

        setModalError(''); 
        setModalSuccess(''); 
        setTicketMessage(''); 
        setBalanceToAdd(''); 
        setBalanceReason('');

        // --- setFormData ATUALIZADO ---
        setFormData({ 
            name: user.name || '', 
            email: user.email || '', 
            apartment: user.apartment || '', 
            phone_number: user.phone_number || '', 
            cpf: user.cpf || '', 
            // Adiciona birth_date e formata para o input type="date"
            birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
            newPassword: '',
            confirmPassword: '' // Campo de confirmação
        });
        
        // --- Fetch de Faturas REMOVIDO ---

    }, [user]);

    React.useEffect(() => {
        if (isOpen) {
            fetchUserData();
        }
    }, [isOpen, fetchUserData]);

    if (!isOpen || !user) return null;

    const handleAction = async (action, successMessage) => {
        setIsSaving(true); setModalError(''); setModalSuccess('');
        try {
            const response = await action();
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Falha na operação: ${successMessage}`);
            }
            setModalSuccess(successMessage);
            onSave(); // Recarrega a lista de utilizadores na página principal
            fetchUserData(); // Recarrega os dados dentro do modal
        } catch (err) {
            setModalError(err.message);
        } finally {
            setIsSaving(false);
            setTimeout(() => { setModalSuccess(''); setModalError(''); }, 4000);
        }
    };

    const handleSaveInfo = () => {
        // --- Validação de Senha Adicionada ---
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setModalError('As novas senhas não coincidem.');
            return;
        }
        
        // --- Body ATUALIZADO (sem crédito, com birth_date) ---
        const body = { 
            name: formData.name,
            email: formData.email,
            apartment: formData.apartment,
            phone_number: formData.phone_number,
            birth_date: formData.birth_date,
            newPassword: formData.newPassword // O backend já sabe lidar com isso
        };
        
        handleAction(
            () => fetch(`${API_URL}/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            }),
            'Informações do usuário salvas com sucesso!'
        );
    };

    // (Função handleAdjustBalance (antiga addWallet) - sem alteração)
    const handleAdjustBalance = () => {
        const amount = parseFloat(balanceToAdd);
        if (amount === 0 || isNaN(amount)) {
            setModalError('Por favor, insira um valor diferente de zero.');
            return;
        }
        
        const body = { amount: amount, reason: balanceReason };
        const actionText = amount > 0 ? 'Adicionado' : 'Removido';

        handleAction(
            // Chama a mesma rota, mas o backend agora é inteligente
            () => fetch(`${API_URL}/api/admin/users/${user.id}/add-balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            }),
            `Saldo de R$ ${Math.abs(amount).toFixed(2)} ${actionText} com sucesso!`
        );
    };

    // (Função handleSendTicket - sem alteração)
    const handleSendTicket = () => {
        const body = { message: ticketMessage };
        handleAction(
            () => fetch(`${API_URL}/api/admin/users/${user.id}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            }),
            'Tíquete enviado com sucesso!'
        );
    };
    
    // (Função handleToggleUserStatus - sem alteração)
    const handleToggleUserStatus = () => {
        const action = user.is_active ? 'bloquear' : 'desbloquear';
        if (!window.confirm(`Tem certeza que deseja ${action} esta conta?`)) return;

        handleAction(
            () => fetch(`${API_URL}/api/admin/users/${user.id}/toggle-status`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            `Usuário ${action === 'bloquear' ? 'desbloqueado' : 'desbloqueado'} com sucesso!`
        );
    };
    
    // --- FUNÇÃO REMOVIDA ---
    // const handleCloseInvoice = () => { ... };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade-in-fast">
            {/* --- LAYOUT ATUALIZADO: max-w-2xl (coluna única) --- */}
            <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Editar Utilizador: <span className="text-[#f2bd46]">{user.name}</span></h2>
                        {!user.is_active && <p className="text-red-500 font-bold text-sm flex items-center gap-2"><Ban size={16}/> CONTA BLOQUEADA</p>}
                    </div>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>

                {isSaving && <div className="absolute top-4 right-8"><Loader2 className="animate-spin text-[#f2bd46]" /></div>}
                {modalSuccess && <p className="text-green-400 text-center mb-4">{modalSuccess}</p>}
                {modalError && <p className="text-red-400 text-center mb-4">{modalError}</p>}
                
                {/* --- LAYOUT ATUALIZADO: Coluna única --- */}
                <div>
                    {/* --- SEÇÃO DE INFORMAÇÕES ATUALIZADA --- */}
                    <div className="mb-6 pb-6 border-b border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">Informações do Utilizador</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400">Nome</label>
                                <input value={formData.name || ''} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">E-mail</label>
                                <input type="email" value={formData.email || ''} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">CPF</label>
                                <input value={formData.cpf || ''} disabled className="w-full bg-black p-2 rounded-md mt-1 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Telefone</label>
                                <input value={formData.phone_number || ''} onChange={(e) => setFormData(p => ({...p, phone_number: e.target.value}))} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-400">Apartamento</label>
                                <input value={formData.apartment || ''} onChange={(e) => setFormData(p => ({...p, apartment: e.target.value}))} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" />
                            </div>
                            
                            {/* --- CAMPO ADICIONADO: Data de Nascimento --- */}
                            <div>
                                <label className="text-sm text-gray-400">Data de Nascimento</label>
                                <input type="date" value={formData.birth_date || ''} onChange={(e) => setFormData(p => ({...p, birth_date: e.target.value}))} className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" />
                            </div>

                            {/* --- CAMPO ADICIONADO: Saldo em Carteira --- */}
                            <div>
                                <label className="text-sm text-gray-400">Saldo em Carteira (Atual)</label>
                                <div className="w-full bg-black p-2 rounded-md mt-1 text-green-400 font-bold">
                                    {/* --- INÍCIO DA CORREÇÃO --- */}
                                    {/* Adiciona parseFloat() para corrigir o erro */}
                                    R$ {parseFloat(user.wallet_balance || 0).toFixed(2)}
                                    {/* --- FIM DA CORREÇÃO --- */}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* --- SEÇÃO DE SENHA ADICIONADA --- */}
                    <div className="mb-6 pb-6 border-b border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-[#f2bd46]">Alterar Senha (Opcional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400">Nova Senha</label>
                                <input type="password" value={formData.newPassword || ''} onChange={(e) => setFormData(p => ({...p, newPassword: e.target.value}))} placeholder="Mínimo 6 caracteres" className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Confirmar Nova Senha</label>
                                <input type="password" value={formData.confirmPassword || ''} onChange={(e) => setFormData(p => ({...p, confirmPassword: e.target.value}))} placeholder="Repita a nova senha" className="w-full bg-[#1a1a1a] p-2 rounded-md mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* --- SEÇÃO DE CRÉDITO REMOVIDA --- */}
                    
                    {/* Botões de Ação (Salvar / Bloquear) */}
                    <div className="flex flex-wrap gap-4 items-center mb-6 pb-6 border-b border-gray-700">
                         <button onClick={handleSaveInfo} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:bg-[#1a1a1a]"> <Save size={18} /> Salvar Informações </button>
                         <button onClick={handleToggleUserStatus} disabled={isSaving} className={`font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:bg-[#1a1a1a] ${user.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                             {user.is_active ? <><Ban size={18} /> Bloquear Conta</> : <><CheckCircle2 size={18} /> Desbloquear Conta</>}
                         </button>
                    </div>

                    {/* --- SEÇÃO DE AÇÕES DA FATURA REMOVIDA --- */}
                    
                    {/* Seção Ajustar Saldo (sem alteração) */}
                    <div className="mb-6 pb-6 border-b border-gray-700">
                         <h3 className="text-lg font-semibold mb-4">Ajustar Saldo Manualmente</h3>
                         <div className="flex gap-4 mb-2">
                             <input 
                                 type="number" 
                                 step="0.01" 
                                 value={balanceToAdd} 
                                 onChange={e => setBalanceToAdd(e.target.value)} 
                                 placeholder="Valor (R$) (ex: -50.00)" 
                                 className="w-1/2 bg-[#1a1a1a] p-2 rounded-md" 
                             />
                             <input 
                                 value={balanceReason} 
                                 onChange={e => setBalanceReason(e.target.value)} 
                                 placeholder="Motivo (Ex: Estorno manual)" 
                                 className="w-1/2 bg-[#1a1a1a] p-2 rounded-md" 
                             />
                         </div>
                         <button 
                             onClick={handleAdjustBalance} 
                             disabled={isSaving || !balanceToAdd} 
                             className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-[#1a1a1a]"
                         >
                             <PlusCircle size={18} /> Ajustar Saldo
                         </button>
                    </div>

                    {/* Seção Enviar Tíquete (sem alteração) */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Enviar Tíquete / Notificação</h3>
                        <textarea value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} placeholder="Digite sua mensagem para o usuário aqui..." className="w-full bg-[#1a1a1a] p-2 rounded-md mb-2" rows="3"></textarea>
                        <button onClick={handleSendTicket} disabled={isSaving || !ticketMessage} className="w-full bg-[#f2bd46] hover:bg-[#f2bd46]-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-[#1a1a1a]"><Ticket size={18} /> Enviar Tíquete</button>
                    </div>
                </div>
                
                {/* --- COLUNA DA DIREITA (HISTÓRICO DE FATURAS) REMOVIDA --- */}
                
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
            <div className="min-h-screen bg-black flex justify-center items-center">
                <Loader2 className="animate-spin text-[#f2bd46]" size={48} />
            </div>
        );
    }
    
    // Estado de Erro
    if (error || !summary) {
        return (
             <div className="min-h-screen bg-black text-white">
                <header className="bg-[#1a1a1a] shadow-md">
                    <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => setPage('home')} className="text-[#f2bd46] hover-text-[#f2bd46]-300"><ArrowLeft size={24} /></button>
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
        <div className="min-h-screen bg-black text-white">
            <header className="bg-[#1a1a1a] shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => setPage('home')} className="text-[#f2bd46] hover:text-[#f2bd46]-300"><ArrowLeft size={24} /></button>
                    <h1 className="text-2xl font-bold">Meu Crédito SmartFridge</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8 max-w-2xl">
                <div className="bg-[#1a1a1a] p-6 rounded-lg">
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
                         <div className="w-full bg-[#1a1a1a] rounded-full h-2.5">
                             <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
                         </div>
                         <div className="flex justify-between text-xs mt-1 text-gray-400">
                             <span>Gasto Total: R$ {summary.creditUsed.toFixed(2).replace('.', ',')}</span>
                             <span>Limite Total: R$ {summary.creditLimit.toFixed(2).replace('.', ',')}</span>
                         </div>
                     </div>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-lg mt-8">
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

const HistoryPage = ({ setPage, token, showToast }) => {
    // === ESTADOS ===
    const [historyData, setHistoryData] = React.useState({ transactions: [], pagination: {} });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [showReceiptModal, setShowReceiptModal] = React.useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('compras'); 

    // --- Keyframes (Animações) ---
    const keyframes = `
        @keyframes surgir {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes neon-pulse-green-icon {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(74, 222, 128, 0.4)); }
            50% { filter: drop-shadow(0 0 12px rgba(74, 222, 128, 0.8)); }
        }
        @keyframes neon-pulse-red-icon {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(248, 113, 113, 0.4)); }
            50% { filter: drop-shadow(0 0 12px rgba(248, 113, 113, 0.8)); }
        }
        .animate-surgir {
            animation: surgir 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0; 
        }
        .neon-icon-green {
            animation: neon-pulse-green-icon 2s ease-in-out infinite;
        }
        .neon-icon-red {
            animation: neon-pulse-red-icon 2s ease-in-out infinite;
        }
    `;

    // --- Lógica de Fetch (Sem alteração) ---
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
    
    // --- Lógica de Cálculo (useMemo) (Sem alteração) ---
    const { purchases, walletActivity, summary } = React.useMemo(() => {
        const transactions = historyData.transactions || [];
        
        // 1. Listas (para as abas)
        const purchases = transactions.filter(tx => (tx.type === 'purchase' || tx.type === 'credit_purchase') && tx.items?.length > 0);
        const walletActivity = transactions.filter(tx => tx.type !== 'purchase' && tx.type !== 'credit_purchase');
        
        // 2. Cálculos de Resumo (para os cards)
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
            summary: {
                totalPurchases, // Para a Tab 1
                totalWalletIn,  // Para a Tab 2
                totalWalletOut  // Para a Tab 2
            }
        };
    }, [historyData.transactions]);

    // === RENDERIZAÇÃO ===

    // Componente de Item para a Aba "Minhas Compras" (VISUAL ATUALIZADO)
    const PurchaseItem = ({ tx }) => (
        <div 
            onClick={() => openReceiptModal(tx.id)} 
            className="animate-surgir bg-black/40 backdrop-blur-md border border-gray-700/50 p-4 sm:p-5 rounded-2xl flex items-center gap-4 sm:gap-5 cursor-pointer hover:bg-black/60 hover:border-[#f2bd46]/40 transition-all duration-300 group shadow-lg"
        >
            {/* Imagem */}
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative">
                <img 
                    src={tx.items[0].image_url || 'https://placehold.co/100x100/1a1a1a/4B5563?text=Foto'}
                    alt={tx.items[0].product_name}
                    className="w-full h-full rounded-xl object-cover border border-gray-700/50 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                {tx.items.length > 1 && (
                    <span className="absolute -bottom-2 -right-2 bg-[#f2bd46] text-black text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-black shadow-[0_0_10px_rgba(242,189,70,0.6)]">
                        +{tx.items.length - 1}
                    </span>
                )}
            </div>
            {/* Detalhes da Compra */}
            <div className="flex-grow min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="min-w-0">
                        <h3 className="font-extrabold text-white text-lg truncate group-hover:text-[#f2bd46] transition-colors">
                            {tx.items.length === 1 ? tx.items[0].product_name : `${tx.items.length} Itens Comprados`}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Calendar size={14} className="opacity-70" /> {new Date(tx.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                    </div>
                    <div className="bg-black/50 border border-gray-800 px-3 py-1.5 rounded-lg flex-shrink-0 inline-block w-fit">
                        <p className="font-bold text-lg sm:text-xl text-white tracking-tight">
                            <span className="text-gray-500 text-sm font-medium mr-1">R$</span>
                            {parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- CORREÇÃO DO LAYOUT DA "ATIVIDADE DA CARTEIRA" (VISUAL ATUALIZADO) ---
    const WalletActivityItem = ({ tx }) => {
        const isDeposit = tx.type === 'deposit' || tx.type === 'transfer_in';
        const iconClass = isDeposit ? 'neon-icon-green text-green-400' : 'neon-icon-red text-red-400';
        
        return (
            <div 
                onClick={() => openReceiptModal(tx.id)} 
                className="animate-surgir bg-black/40 backdrop-blur-md border border-gray-700/50 p-4 sm:p-5 rounded-2xl flex items-center gap-4 sm:gap-5 cursor-pointer hover:bg-black/60 hover:border-gray-500/80 transition-all duration-300 group shadow-lg"
            >
                {/* Ícone (Neon e Colorido) */}
                <div className={`flex-shrink-0 bg-black/50 p-3 rounded-xl border border-gray-800 group-hover:bg-[#1a1a1a] transition-colors ${iconClass}`}>
                    {React.cloneElement(getTransactionIcon(tx.type), { size: 24 })}
                </div>
                
                <div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="min-w-0">
                        <h3 className="font-extrabold text-white text-lg truncate">{tx.description}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Calendar size={14} className="opacity-70" /> {new Date(tx.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                    </div>
                    <p className={`font-black text-xl flex-shrink-0 tracking-tight ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
                        {isDeposit ? '+' : '-'} R$ {parseFloat(tx.amount).toFixed(2).replace('.', ',')}
                    </p>
                </div>
            </div>
        );
    }
    
    // --- CARD DE RESUMO DINÂMICO (VISUAL ATUALIZADO) ---
    const SummaryCard = ({ activeTab }) => {
        if (activeTab === 'compras') {
            return (
                <div className="animate-surgir mb-8 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f2bd46]/20 to-transparent rounded-3xl blur-xl transition-all duration-500 opacity-60"></div>
                    <div className="bg-black/50 backdrop-blur-xl border border-gray-700/50 p-6 sm:p-8 rounded-3xl relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                        <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-center sm:justify-start gap-2">
                                <History size={16}/> Resumo da Página
                            </p>
                            <div className="flex items-baseline justify-center sm:justify-start gap-2">
                                <span className="text-xl text-gray-500 font-bold">R$</span>
                                <p className="text-4xl sm:text-5xl font-black text-[#f2bd46] tracking-tighter drop-shadow-[0_0_15px_rgba(242,189,70,0.3)]">
                                    {summary.totalPurchases.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex p-5 bg-[#f2bd46]/10 rounded-2xl border border-[#f2bd46]/20 shadow-[0_0_20px_rgba(242,189,70,0.15)]">
                            <ShoppingCart size={40} className="text-[#f2bd46]" />
                        </div>
                    </div>
                </div>
            );
        }
        
        if (activeTab === 'carteira') {
            return (
                <div className="animate-surgir grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 relative">
                    {/* Card Entradas */}
                    <div className="bg-black/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-green-500/30 transition-all">
                        <div className="absolute -right-6 -top-6 bg-green-500/10 p-8 rounded-full blur-2xl"></div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ArrowDownToLine size={16} className="text-green-400"/> Entradas (pág.)
                        </p>
                        <p className="text-3xl font-black text-green-400 tracking-tighter">
                            + R$ {summary.totalWalletIn.toFixed(2).replace('.', ',')}
                        </p>
                    </div>
                    {/* Card Saídas */}
                    <div className="bg-black/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-red-500/30 transition-all">
                        <div className="absolute -right-6 -top-6 bg-red-500/10 p-8 rounded-full blur-2xl"></div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ArrowRightLeft size={16} className="text-red-400"/> Saídas (pág.)
                        </p>
                        <p className="text-3xl font-black text-red-400 tracking-tighter">
                            - R$ {summary.totalWalletOut.toFixed(2).replace('.', ',')}
                        </p>
                    </div>
                </div>
            );
        }
        
        return null;
    };
    
    return (
        <>
            <style>{keyframes}</style>
            <TransactionReceiptModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} transactionId={selectedTransactionId} token={token} />
            
            <div 
                className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('https://i.ibb.co/N2Hh8yjt/Chat-GPT-Image-12-de-mai-de-2026-10-20-15.png')` }}
            >
                {/* Overlay Escuro e Ambient Glow */}
                <div className="absolute inset-0 bg-black/85 z-0"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#f2bd46]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
                
                {/* --- HEADER (Glassmorphism) --- */}
                <header className="bg-black/60 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] sticky top-0 z-30 border-b border-gray-800/80 relative">
                    <div className="container mx-auto px-4 py-5 flex items-center gap-4">
                        <button 
                            onClick={() => setPage('home')} 
                            className="bg-black/40 hover:bg-white/10 p-2.5 rounded-full border border-gray-700/50 text-gray-300 hover:text-[#f2bd46] transition-all duration-300 backdrop-blur-md"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Meu <span className="text-[#f2bd46]">Histórico</span></h1>
                    </div>
                    
                    {/* --- ABAS (Segmented Control Refinado) --- */}
                    <div className="container mx-auto px-4 pb-5 max-w-3xl">
                        <div className="flex p-1.5 bg-black/80 border border-gray-800/80 rounded-xl relative shadow-inner">
                            <button 
                                onClick={() => setActiveTab('compras')}
                                className={`flex-1 py-3 rounded-lg text-sm sm:text-base font-bold text-center transition-all duration-300 z-10 flex items-center justify-center gap-2 ${activeTab === 'compras' ? 'bg-[#f2bd46] text-black shadow-[0_4px_15px_rgba(242,189,70,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <ShoppingCart size={18} className={activeTab === 'compras' ? 'text-black' : 'text-gray-500'} /> 
                                Minhas Compras
                            </button>
                            <button 
                                onClick={() => setActiveTab('carteira')}
                                className={`flex-1 py-3 rounded-lg text-sm sm:text-base font-bold text-center transition-all duration-300 z-10 flex items-center justify-center gap-2 ${activeTab === 'carteira' ? 'bg-[#f2bd46] text-black shadow-[0_4px_15px_rgba(242,189,70,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Wallet size={18} className={activeTab === 'carteira' ? 'text-black' : 'text-gray-500'} /> 
                                Carteira
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* --- CONTEÚDO PRINCIPAL --- */}
                <main className="container mx-auto p-4 md:p-8 relative z-10">
                    <div className="max-w-3xl mx-auto flex flex-col gap-6">
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center h-64 gap-4">
                                <Loader2 className="w-12 h-12 text-[#f2bd46] animate-spin drop-shadow-[0_0_10px_rgba(242,189,70,0.5)]" />
                                <span className="text-gray-400 font-bold tracking-widest animate-pulse text-sm">CARREGANDO...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center p-8 bg-red-900/10 border border-red-500/20 text-red-400 rounded-2xl backdrop-blur-md shadow-lg flex flex-col items-center gap-3">
                                <AlertTriangle size={32}/>
                                <p className="font-bold text-lg">Oops! Algo deu errado.</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        ) : (
                            <>
                                {/* --- CARD DE RESUMO DINÂMICO --- */}
                                <SummaryCard activeTab={activeTab} />
                            
                                {/* Renderização da Aba de Compras */}
                                {activeTab === 'compras' && (
                                    purchases.length > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {purchases.map(tx => <PurchaseItem key={tx.id} tx={tx} />)}
                                        </div>
                                    ) : (
                                        <div className="animate-surgir text-center p-12 bg-black/40 backdrop-blur-xl border border-gray-700/50 text-gray-400 rounded-3xl shadow-xl flex flex-col items-center">
                                            <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                                                <ShoppingCart size={48} className="text-gray-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Sem compras por aqui</h2>
                                            <p className="max-w-xs mx-auto text-sm">Seu histórico de pedidos aparecerá aqui assim que você fizer a primeira compra.</p>
                                        </div>
                                    )
                                )}
                                
                                {/* Renderização da Aba de Carteira */}
                                {activeTab === 'carteira' && (
                                    walletActivity.length > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {walletActivity.map(tx => <WalletActivityItem key={tx.id} tx={tx} />)}
                                        </div>
                                    ) : (
                                        <div className="animate-surgir text-center p-12 bg-black/40 backdrop-blur-xl border border-gray-700/50 text-gray-400 rounded-3xl shadow-xl flex flex-col items-center">
                                            <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                                                <Wallet size={48} className="text-gray-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Sem atividade na carteira</h2>
                                            <p className="max-w-xs mx-auto text-sm">Seu extrato de depósitos e transferências aparecerá aqui.</p>
                                        </div>
                                    )
                                )}
                                
                                {/* Paginação (Estilizada) */}
                                {historyData.transactions?.length > 0 && (
                                    <div className="flex justify-center items-center gap-4 mt-8 pb-12">
                                        <button 
                                            onClick={() => fetchHistoryData(historyData.pagination.page - 1)} 
                                            disabled={historyData.pagination.page === 1} 
                                            className="p-3 bg-black/50 border border-gray-700 hover:bg-[#f2bd46] hover:text-black hover:border-[#f2bd46] rounded-xl disabled:opacity-30 disabled:hover:bg-black/50 disabled:hover:text-white disabled:hover:border-gray-700 transition-all shadow-md"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                        
                                        <div className="bg-black/60 border border-gray-800 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide">
                                            <span className="text-gray-400">Pág.</span> <span className="text-white">{historyData.pagination.page}</span> <span className="text-gray-500 mx-1">/</span> <span className="text-gray-400">{Math.ceil((historyData?.pagination?.total || 0) / (historyData?.pagination?.limit || 10))}</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => fetchHistoryData(historyData.pagination.page + 1)} 
                                            disabled={historyData.pagination.page === Math.ceil((historyData?.pagination?.total || 0) / (historyData?.pagination?.limit || 10))} 
                                            className="p-3 bg-black/50 border border-gray-700 hover:bg-[#f2bd46] hover:text-black hover:border-[#f2bd46] rounded-xl disabled:opacity-30 disabled:hover:bg-black/50 disabled:hover:text-white disabled:hover:border-gray-700 transition-all shadow-md"
                                        >
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default function App() {
    const [page, setPage] = React.useState('login');
    const [user, setUser] = React.useState(null);
    const [cart, setCart] = React.useState([]);
    const [paymentData, setPaymentData] = React.useState(null);
    const [depositData, setDepositData] = React.useState(null);
    const [isInitializing, setIsInitializing] = React.useState(true);
    const [paymentMethod, setPaymentMethod] = React.useState(null);
    const [fridgeId, setFridgeId] = React.useState(null);
    const [toast, setToast] = React.useState({ show: false, message: '' });
    const [allCondos, setAllCondos] = React.useState([]);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

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
    
    // ==========================================================
    // --- CORREÇÃO 1: LÓGICA DE LOGIN ---
    // ==========================================================
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
            // --- ESTA É A CORREÇÃO ---
            // Não vá para 'fridgeSelection'. Vá para 'home'.
            // A HomePage agora sabe o que fazer.
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
    
    // --- CORREÇÃO 2: FLUXO DE CADASTRO ---
    // Agora chama o 'handleLogin' para ir direto para a HomePage
    const handleRegister = (token, userData) => { 
        handleLogin(token, userData);
    };
    
    const handleAccountUpdate = (updatedUser) => { setUser(prevUser => ({ ...prevUser, ...updatedUser })); };
    const handleCondoChanged = (updatedUser) => { setUser(updatedUser); };
    
    const addToCart = (productToAdd) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productToAdd.id);
            if (existingItem) {
                return prevCart.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                return [...prevCart, { ...productToAdd, quantity: 1 }];
            }
        });
        showToast('Produto adicionado ao carrinho!');
    };

    if (isInitializing) {
        return <div className="min-h-screen bg-black flex justify-center items-center"><Loader2 className="w-16 h-16 text-[#f2bd46] animate-spin" /></div>;
    }

    const pagesWithoutFooter = [
        'login', 
        'register', 
        'forgot-password', 
        'fridgeSelection', 
        'payment', 
        'card-deposit', 
        'postPayment',
        'depositSuccess',
        'admin'
    ];
    
    // O roteador principal
    const renderPage = () => {
        // Se não estiver logado, força o login
        if (!user && !['login', 'register', 'forgot-password', 'admin'].includes(page)) {
            return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
        }
        
        // --- CORREÇÃO 3: REMOVIDO O 'IF' QUE FORÇAVA O 'fridgeSelection' ---
        // if (user && user.name !== "Admin" && !fridgeId && !['fridgeSelection', 'admin'].includes(page)) {
        //      return <FridgeSelectionPage onCondoSelected={handleCondoSelect} setPage={setPage} user={user} onLogout={handleLogout} />;
        // }

        switch (page) {
            case 'register': return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPage('login')} />;
            
            // O 'fridgeSelection' só é chamado se o usuário for um NOVO cadastro
            // ou se o 'handleLogin' falhar (o que é raro)
            case 'fridgeSelection': return <FridgeSelectionPage onCondoSelected={handleCondoSelect} setPage={setPage} user={user} onLogout={handleLogout} />;
            
            case 'home': 
                return user
                    ? <HomePage 
                        user={user} 
                        onLogout={handleLogout} 
                        cart={cart} 
                        setCart={setCart} 
                        addToCart={addToCart} 
                        setPage={setPage} 
                        fridgeId={fridgeId} 
                        onCondoSelected={handleCondoSelect}
                        condos={allCondos}
                      /> 
                    : <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} onSwitchToRegister={() => setPage('register')} setPage={setPage} />;
            
            case 'cart': return <CartPage cart={cart} setCart={setCart} setPage={setPage} user={user} setPaymentData={setPaymentData} onPaymentSuccess={updateUserBalance} fridgeId={fridgeId} />;
            case 'payment': return <PaymentPage paymentData={paymentData} setPage={setPage} paymentMethod={paymentMethod} user={user} cart={cart} onPaymentSuccess={updateUserBalance} setPaymentData={setPaymentData} fridgeId={fridgeId}/>;
            case 'postPayment': return <PostPaymentStatusPage user={user} setPage={setPage} />;
            case 'my-account': return <MyAccountPage user={user} setPage={setPage} onAccountUpdate={handleAccountUpdate} onLogout={handleLogout} />;
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
            <Toast show={toast.show} message={toast.message} />
            <div className="flex flex-col min-h-screen bg-black text-white">
                <main className="flex-grow">
                    {renderPage()}
                </main>
                {!pagesWithoutFooter.includes(page) && <Footer />}
            </div>
        </>
    );
}
