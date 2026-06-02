import React, { useState, useEffect } from 'react';
import { getDashboard } from '../api/api';
import { ShoppingBag, Users, ShoppingCart, AlertTriangle, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';

const callGemini = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not configured.");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to fetch from Gemini");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockCount: 0,
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await getDashboard();
      setMetrics({
        totalProducts: data.total_products,
        totalCustomers: data.total_customers,
        totalOrders: data.total_orders,
        lowStockCount: data.low_stock_products.length,
        lowStockItems: data.low_stock_products
      });
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const prompt = `
        Act as an expert Chief Operating Officer. Analyze the following business metrics and provide a brief, actionable, and encouraging 2-3 sentence performance summary.
        Metrics:
        - Total Products: ${metrics.totalProducts}
        - Low Stock Items: ${metrics.lowStockCount}
        - Total Customers: ${metrics.totalCustomers}
        - Total Orders: ${metrics.totalOrders}
        Tone: Professional, strategic, visionary. Do not use markdown.
      `;
      const result = await callGemini(prompt);
      setAiInsight(result);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setAiError("AI insights are currently unavailable. " + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: metrics.totalProducts, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Total Customers', value: metrics.totalCustomers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Total Orders', value: metrics.totalOrders, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Low Stock Alerts', value: metrics.lowStockCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border ${stat.border}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <BrainCircuit className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Executive Performance Briefing</h3>
              <p className="text-indigo-200 text-sm font-medium">Powered by Apex AI</p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-6 min-h-[100px] flex items-center shadow-inner">
            {aiLoading ? (
              <div className="flex items-center gap-3 text-indigo-200">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium animate-pulse">Analyzing operational metrics...</span>
              </div>
            ) : aiError ? (
              <p className="text-rose-300 text-sm">{aiError}</p>
            ) : aiInsight ? (
              <p className="text-slate-100 leading-relaxed text-sm sm:text-base font-medium">{aiInsight}</p>
            ) : (
              <p className="text-indigo-200/60 italic text-sm">Click generate to synthesize an executive summary of current metrics.</p>
            )}
          </div>
          
          <button
            onClick={generateInsight}
            disabled={aiLoading}
            className="group flex items-center gap-2 bg-white text-indigo-900 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 group-hover:text-purple-600 transition-colors" />
            {aiLoading ? 'Generating...' : 'Generate Insight'}
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {metrics.lowStockCount > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-rose-50/30">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Low Stock Alerts</h3>
              <p className="text-sm text-slate-500">Items requiring immediate reorder</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-auto">
            {metrics.lowStockItems.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {item.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200 shadow-sm">
                    {item.quantity_in_stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
