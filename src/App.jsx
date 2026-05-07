import React, { useState, useMemo, useEffect, useRef } from 'react'; 
import { 
  ShoppingCart, 
  ShoppingBag,
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Receipt,
  Minus,
  Edit2,
  X,
  Save,
  AlertTriangle,
  PieChart,
  FileText,
  Share2
} from 'lucide-react';

const CATEGORIAS = [
  { id: 'hortifruti', nome: 'Hortifruti', cor: 'bg-emerald-100 text-emerald-800 border-emerald-200', corGrafico: 'bg-emerald-600' },
  { id: 'laticinios', nome: 'Laticínios', cor: 'bg-blue-100 text-blue-800 border-blue-200', corGrafico: 'bg-blue-600' },
  { id: 'carnes', nome: 'Açougue', cor: 'bg-red-100 text-red-800 border-red-200', corGrafico: 'bg-red-600' },
  { id: 'limpeza', nome: 'Limpeza', cor: 'bg-cyan-100 text-cyan-800 border-cyan-200', corGrafico: 'bg-cyan-600' },
  { id: 'higiene', nome: 'Higiene', cor: 'bg-pink-100 text-pink-800 border-pink-200', corGrafico: 'bg-pink-600' },
  { id: 'bebidas', nome: 'Bebidas', cor: 'bg-purple-100 text-purple-800 border-purple-200', corGrafico: 'bg-purple-600' },
  { id: 'mercearia', nome: 'Mercearia', cor: 'bg-amber-100 text-amber-800 border-amber-200', corGrafico: 'bg-amber-600' },
  { id: 'outros', nome: 'Outros', cor: 'bg-slate-100 text-slate-800 border-slate-200', corGrafico: 'bg-slate-600' },
];

function getCategoriaInfo(id) {
  return CATEGORIAS.find(c => c.id === id) || CATEGORIAS[7];
}

export default function App() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('@SuperLista:items_v3');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[6].id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const receiptRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('@SuperLista:items_v3', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!document.getElementById('html2canvas-script')) {
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const parsePrecoSeguro = (valor) => {
    if (!valor) return 0;
    let str = valor.toString().trim();
    if (str.includes(',')) {
      str = str.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(str) || 0;
  };

  const adicionarItem = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    const novoItem = {
      id: "id-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      nome: nome.trim(),
      quantidade: parseInt(quantidade) || 1,
      preco: parsePrecoSeguro(preco),
      categoria: categoria,
      comprado: false,
    };
    setItems(prev => [novoItem, ...prev]);
    setNome('');
    setQuantidade(1);
    setPreco('');
  };

  const alternarComprado = (id) => {
    setItems(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.map(item => 
        item && item.id === id ? { ...item, comprado: !item.comprado } : item
      );
    });
  };

  const removerItem = (id) => {
    setItems(prev => prev.filter(item => item && item.id !== id));
  };

  const alterarQuantidade = (id, delta) => {
    setItems(prev => prev.map(item => {
      if (item && item.id === id) {
        return { ...item, quantidade: Math.max(1, item.quantidade + delta) };
      }
      return item;
    }));
  };

  const atualizarItem = (id, dados) => {
    setItems(prev => prev.map(item => item && item.id === id ? { ...item, ...dados } : item));
  };

  const confirmarLimpeza = () => {
    console.log('Limpando lista...');
    setItems([]);
    setIsModalOpen(false);
    localStorage.removeItem('@SuperLista:items_v3');
  };

  const totalGeral = useMemo(() => {
    return Array.isArray(items) ? items.reduce((acc, item) => acc + (item.preco * item.quantidade), 0) : 0;
  }, [items]);

  const analiseCategorias = useMemo(() => {
    if (totalGeral === 0 || !Array.isArray(items)) return [];
    const totais = {};
    items.forEach(item => {
      if (!item) return;
      const sub = item.preco * item.quantidade;
      if (sub > 0) {
        totais[item.categoria] = (totais[item.categoria] || 0) + sub;
      }
    });
    return Object.entries(totais).map(([id, total]) => ({
      id,
      info: CATEGORIAS.find(c => c.id === id) || CATEGORIAS[7],
      total,
      percentual: (total / totalGeral) * 100
    })).sort((a, b) => b.total - a.total);
  }, [items, totalGeral]);

  const compartilharRecibo = () => {
    console.log('Iniciando compartilhamento...');
    if (!receiptRef.current) {
      alert('Erro: Recibo não encontrado');
      return;
    }
    setIsGenerating(true);
    
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => gerarRecibo();
      script.onerror = () => {
        alert('Erro ao carregar biblioteca. Tente novamente.');
        setIsGenerating(false);
      };
      document.head.appendChild(script);
    } else {
      gerarRecibo();
    }
  };

  const gerarRecibo = async () => {
    try {
      const canvas = await window.html2canvas(receiptRef.current, { 
        scale: 2, 
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = 'Recibo_SuperLista.png';
      link.href = canvas.toDataURL();
      link.click();
      
      setIsReceiptOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar recibo');
    }
    setIsGenerating(false);
  };

  return (
    <>
      <style>
        {`
          body { font-family: 'Outfit', sans-serif; background-color: #f8fafc; }
          .font-black { font-weight: 800; }
          
          @keyframes driveCart {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(-2px) rotate(-3deg); }
            50% { transform: translateX(3px) rotate(3deg); }
            75% { transform: translateX(-1px) rotate(-2deg); }
          }
          .animate-cart { animation: driveCart 2.5s ease-in-out infinite; }
          
          @keyframes bounceBag {
            0%, 100% { transform: translateY(0) scale(1); }
            30% { transform: translateY(-10px) scale(1.1); }
            50% { transform: translateY(0) scale(0.95); }
            70% { transform: translateY(-5px) scale(1.05); }
          }
          .animate-bounce-bag { animation: bounceBag 2s ease-in-out infinite; animation-delay: 0.3s; }
          
          @keyframes floatHeader {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-header { animation: floatHeader 5s ease-in-out infinite; }
          
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); background-size: 200% 100%; animation: shimmer 3s linear infinite; }
          
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}
      </style>
      <div className="min-h-screen pb-20 selection:bg-[#20b2aa]/20 relative">
        
        {/* HEADER */}
        <header className="bg-gradient-to-r from-[#20B2AA] via-[#1ea39b] to-[#18a090] text-white sticky top-0 z-40 shadow-lg animate-header">
          <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            <div className="flex items-end gap-1">
              <ShoppingCart className="w-9 h-9 text-white/90 animate-cart drop-shadow-lg" strokeWidth={2.5} />
              <div className="relative -mb-1">
                <ShoppingBag className="w-6 h-6 text-white/80 animate-bounce-bag drop-shadow-md" strokeWidth={2} />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">SuperLista</h1>
              <span className="text-[10px] font-medium opacity-70 tracking-wider uppercase">Lista de Compras</span>
            </div>
            <div className="flex gap-2">
              {items.length > 0 && (
                <>
                  <button onClick={() => setIsReceiptOpen(true)} className="p-2 bg-[#821A4F] rounded-xl shadow-md active:scale-95 transition-all">
                    <FileText size={22} />
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="p-2 bg-black/10 rounded-xl">
                    <Trash2 size={22} />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 mt-5">
          
          {/* TOTAL PANEL */}
          <div 
            className="rounded-[2rem] p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden mb-6 bg-cover bg-center text-white"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(32, 178, 170, 0.45) 0%, rgba(20, 120, 115, 0.5) 100%), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000')`
            }}
          >
            <p className="text-sm font-black text-white uppercase tracking-widest mb-1 drop-shadow-md">Total Previsto</p>
            <p className="text-5xl sm:text-6xl font-black drop-shadow-2xl tracking-tighter">{formatarMoeda(totalGeral)}</p>
            <div className="mt-4 flex items-center gap-2 px-5 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/20">
              <ShoppingBag size={16} />
              <span className="font-bold text-xs uppercase tracking-wider">{items.length} ITENS</span>
            </div>
          </div>

          {/* ANÁLISE DE GASTOS */}
          {analiseCategorias.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <PieChart size={16} className="text-[#821A4F]" /> Gastos por Categoria
              </h2>
              <div className="w-full h-2.5 rounded-full flex overflow-hidden mb-4 bg-slate-100">
                {analiseCategorias.map(cat => (
                  <div key={cat.id} style={{ width: `${cat.percentual}%` }} className={`h-full ${cat.info.corGrafico} transition-all duration-700`} />
                ))}
              </div>
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                {analiseCategorias.map(cat => (
                  <div key={cat.id} className="flex flex-col flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl p-3 min-w-[110px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${cat.info.corGrafico}`} />
                      <span className="text-xs font-bold uppercase text-slate-500 truncate">{cat.info.nome}</span>
                    </div>
                    <p className="text-base font-bold text-slate-800 leading-none">{formatarMoeda(cat.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FORMULÁRIO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
            <h2 className="text-xs font-black text-[#20B2AA] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={18} strokeWidth={3} /> Adicionar Novo Item
            </h2>
            <form onSubmit={adicionarItem} className="space-y-3">
              <input
                type="text"
                placeholder="Nome do produto"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-lg px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#20B2AA] outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                required
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">R$</span>
                  <input type="text" inputMode="decimal" placeholder="0,00" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-[#20B2AA] outline-none font-bold text-base" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 text-xs font-bold uppercase">Qtd</span>
                  <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-[#20B2AA] outline-none font-bold text-base" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-base text-slate-700 appearance-none bg-white">
                    {CATEGORIAS.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#20B2AA] hover:bg-[#1a9c94] text-white font-black text-lg py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all uppercase">Adicionar à Lista</button>
            </form>
          </div>

          {/* LISTA */}
          <div className="space-y-3">
            {Array.isArray(items) && items.map(item => item && (
              <ItemRow 
                key={item.id} 
                item={item} 
                onToggle={() => alternarComprado(item.id)}
                onRemove={() => removerItem(item.id)}
                onQtdChange={(d) => alterarQuantidade(item.id, d)}
                onUpdate={(d) => atualizarItem(item.id, d)}
                cat={getCategoriaInfo(item.categoria)}
                format={formatarMoeda}
                parse={parsePrecoSeguro}
              />
            ))}
          </div>
        </main>

        {/* MODAL RECIBO */}
        {isReceiptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-sm text-slate-800 flex items-center gap-2 uppercase tracking-tighter"><Receipt size={18} className="text-[#20B2AA]" /> Recibo de Compra</h3>
                <button onClick={() => setIsReceiptOpen(false)} className="p-1.5 bg-white rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
                <div ref={receiptRef} className="bg-white p-6 shadow-sm mx-auto w-full border border-slate-200">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">SuperLista</h2>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 border-t pt-2 border-slate-100">Documento de Conferência</div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-4 border-b pb-2 border-slate-100">
                      <span>DATA: {new Date().toLocaleDateString('pt-BR')}</span>
                      <span>HORA: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {items.map((item, i) => item && (
                      <div key={item.id} className="flex flex-col border-b border-slate-50 pb-2">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-[11px] font-bold text-slate-800 uppercase leading-tight flex-1">
                            {i + 1}. {item.nome}
                          </span>
                          <span className="text-[11px] font-black text-slate-900">{formatarMoeda(item.preco * item.quantidade)}</span>
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                          <span>{item.quantidade} UN X {formatarMoeda(item.preco)}</span>
                          <span>{getCategoriaInfo(item.categoria).nome}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-900 text-white p-4 rounded-xl mb-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total</span>
                      <span className="text-2xl font-black text-[#20B2AA] tracking-tighter leading-none">{formatarMoeda(totalGeral)}</span>
                    </div>
                  </div>
                  <div className="text-center opacity-30 mt-4">
                    <div className="flex justify-center gap-1 mb-2">
                      {[...Array(12)].map((_, i) => <div key={i} className="w-2 h-6 bg-black" />)}
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest">Obrigado pela preferência!</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white border-t">
                <button 
                  onClick={compartilharRecibo}
                  disabled={isGenerating}
                  className="w-full bg-[#25D366] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all uppercase text-sm"
                >
                  <Share2 size={18} /> {isGenerating ? 'PROCESSANDO...' : 'ENVIAR WHATSAPP'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL LIMPAR */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
              <h3 className="text-lg font-black text-center mb-2 text-slate-800">Esvaziar tudo?</h3>
              <p className="text-center text-slate-500 text-xs font-bold mb-6">Todos os itens serão removidos da lista.</p>
              <div className="flex gap-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 bg-slate-100 uppercase text-xs">Não</button>
                <button onClick={confirmarLimpeza} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 shadow-md uppercase text-xs">Sim</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ItemRow({ item, onToggle, onRemove, onQtdChange, onUpdate, cat, format, parse }) {
  const [isEdit, setIsEdit] = useState(false);
  const [nome, setNome] = useState(item.nome);
  const [preco, setPreco] = useState(item.preco > 0 ? item.preco.toString().replace('.', ',') : '');
  const [categoria, setCategoria] = useState(item.categoria);

  const salvar = () => {
    onUpdate({ nome: nome.trim() || item.nome, preco: parse(preco), categoria });
    setIsEdit(false);
  };

  if (isEdit) {
    return (
      <div className="bg-white p-4 rounded-2xl border-2 border-[#821A4F]/20 shadow-md space-y-3 animate-in zoom-in-95">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black text-[#821A4F] uppercase flex items-center gap-2"><Edit2 size={12}/> Editar</h4>
          <button onClick={() => setIsEdit(false)} className="p-1 bg-slate-50 rounded-full"><X size={14}/></button>
        </div>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="0,00" />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm bg-white">
            {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <button onClick={salvar} className="w-full bg-[#821A4F] text-white font-black py-2 rounded-xl uppercase text-xs flex items-center justify-center gap-2">
          <Save size={14} /> Salvar
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-2xl border transition-all ${item.comprado ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 shadow-sm'} ${item.comprado ? 'opacity-75' : ''}`}>
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="flex-shrink-0 text-slate-300 active:scale-90 transition-transform">
          {item.comprado ? <CheckCircle2 className="text-emerald-500" size={32} /> : <Circle size={32} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-lg text-slate-800 truncate ${item.comprado ? 'line-through' : ''}`}>{item.nome}</span>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md border ${cat.cor}`}>{cat.nome}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
            <span>{format(item.preco)}</span>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2">
              <button onClick={() => onQtdChange(-1)} className="p-1 text-slate-400 hover:text-slate-600 active:scale-90"><Minus size={14} /></button>
              <span className="min-w-[24px] text-center">{item.quantidade}</span>
              <button onClick={() => onQtdChange(1)} className="p-1 text-slate-400 hover:text-slate-600 active:scale-90"><Plus size={14} /></button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-black text-lg text-slate-800">{format(item.preco * item.quantidade)}</span>
          <div className="flex gap-1">
            <button onClick={() => setIsEdit(true)} className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-[#821A4F] active:scale-90 transition-all">
              <Edit2 size={16} />
            </button>
            <button onClick={onRemove} className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 active:scale-90 transition-all">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}