import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, PieChart, TrendingUp, ArrowUpCircle, 
  ArrowDownCircle, Plus, Trash2, Save, History 
} from 'lucide-react';

const WealthManager = () => {
  // --- 核心邏輯：從手機儲存空間 (LocalStorage) 載入資料 ---
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('wealth_assets');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '現金/銀行', amount: 0, color: 'bg-blue-500' },
      { id: 2, name: '股票/基金', amount: 0, color: 'bg-green-500' },
      { id: 3, name: '虛擬貨幣', amount: 0, color: 'bg-purple-500' }
    ];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('wealth_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTrans, setNewTrans] = useState({ title: '', amount: '', type: 'expense', assetId: 1 });

  // --- 核心邏輯：當資料變動時，自動存入手機儲存空間 ---
  useEffect(() => {
    localStorage.setItem('wealth_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('wealth_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // 計算總資產
  const totalWealth = useMemo(() => 
    assets.reduce((sum, asset) => sum + Number(asset.amount), 0), [assets]
  );

  // 處理資產金額手動修改
  const handleAssetChange = (id, value) => {
    setAssets(assets.map(a => a.id === id ? { ...a, amount: value } : a));
  };

  // 新增交易並自動連動資產
  const addTransaction = () => {
    if (!newTrans.amount || !newTrans.title) return;
    
    const amount = Number(newTrans.amount);
    const trans = {
      ...newTrans,
      id: Date.now(),
      date: new Date().toLocaleDateString()
    };

    setTransactions([trans, ...transactions]);
    
    // 連動修改資產金額
    setAssets(assets.map(a => {
      if (a.id === newTrans.assetId) {
        return {
          ...a,
          amount: newTrans.type === 'income' ? Number(a.amount) + amount : Number(a.amount) - amount
        };
      }
      return a;
    }));

    setNewTrans({ title: '', amount: '', type: 'expense', assetId: assets[0].id });
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-20 font-sans">
      {/* 頂部總覽 */}
      <div className="bg-emerald-600 p-6 text-white rounded-b-3xl shadow-lg">
        <p className="opacity-80 text-sm">總資產淨值 (TWD)</p>
        <h1 className="text-3xl font-bold mt-1">
          ${totalWealth.toLocaleString()}
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 資產配置區 */}
        <section className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center mb-4 text-slate-700">
            <PieChart className="w-5 h-5 mr-2 text-emerald-500" />
            <h2 className="font-bold">資產快照 (手動校準)</h2>
          </div>
          <div className="space-y-3">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-8 ${asset.color} rounded-full mr-3`} />
                  <span className="text-slate-600">{asset.name}</span>
                </div>
                <input
                  type="number"
                  value={asset.amount}
                  onChange={(e) => handleAssetChange(asset.id, e.target.value)}
                  className="w-28 text-right font-semibold text-slate-800 bg-slate-50 rounded px-2 py-1 outline-none border-b-2 border-transparent focus:border-emerald-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 快速記帳 */}
        <section className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center mb-4 text-slate-700">
            <Plus className="w-5 h-5 mr-2 text-emerald-500" />
            <h2 className="font-bold">新增交易 (連動資產)</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button 
              onClick={() => setNewTrans({...newTrans, type: 'expense'})}
              className={`py-2 rounded-xl text-sm font-medium transition ${newTrans.type === 'expense' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-400'}`}
            >
              支出
            </button>
            <button 
              onClick={() => setNewTrans({...newTrans, type: 'income'})}
              className={`py-2 rounded-xl text-sm font-medium transition ${newTrans.type === 'income' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-50 text-slate-400'}`}
            >
              收入
            </button>
          </div>
          <div className="space-y-3">
            <input
              placeholder="項目名稱 (如：午餐)"
              value={newTrans.title}
              onChange={(e) => setNewTrans({...newTrans, title: e.target.value})}
              className="w-full bg-slate-50 p-3 rounded-xl outline-none"
            />
            <div className="flex gap-2">
              <select 
                value={newTrans.assetId}
                onChange={(e) => setNewTrans({...newTrans, assetId: Number(e.target.value)})}
                className="bg-slate-50 p-3 rounded-xl outline-none text-sm w-1/3"
              >
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="金額"
                value={newTrans.amount}
                onChange={(e) => setNewTrans({...newTrans, amount: e.target.value})}
                className="w-2/3 bg-slate-50 p-3 rounded-xl outline-none font-bold"
              />
            </div>
            <button 
              onClick={addTransaction}
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold active:scale-95 transition"
            >
              確認記錄
            </button>
          </div>
        </section>

        {/* 歷史紀錄 */}
        <section>
          <div className="flex items-center mb-3 text-slate-700 px-1">
            <History className="w-5 h-5 mr-2 text-emerald-500" />
            <h2 className="font-bold">最近紀錄</h2>
          </div>
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-medium text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-400">{t.date} · {assets.find(a => a.id === t.assetId)?.name}</p>
                </div>
                <span className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-slate-400 py-10">尚無交易紀錄</p>
            )}
          </div>
        </section>
      </div>

      {/* 手機版底欄 - 模擬 App 導覽 */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 px-6 py-3 flex justify-around items-center shadow-2xl">
        <div className="flex flex-col items-center text-emerald-600">
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold">資產</span>
        </div>
        <div className="flex flex-col items-center text-slate-300">
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] mt-1">分析</span>
        </div>
        <div className="flex flex-col items-center text-slate-300">
          <Plus className="w-8 h-8 bg-slate-800 text-white rounded-full p-1" />
        </div>
        <div className="flex flex-col items-center text-slate-300">
          <History className="w-6 h-6" />
          <span className="text-[10px] mt-1">流水</span>
        </div>
      </div>
    </div>
  );
};

export default WealthManager;
