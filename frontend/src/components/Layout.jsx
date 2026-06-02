import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, ShoppingCart, Menu, X, Briefcase, Sparkles, BrainCircuit } from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: ShoppingBag },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/orders", label: "Orders", icon: ShoppingCart },
  ];

  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/products': return 'Products Inventory';
      case '/customers': return 'Customer Directory';
      case '/orders': return 'Order Management';
      default: return 'Apex Ledger';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Briefcase className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500 tracking-tight">Apex Ledger</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">Enterprise</p>
          </div>
        </div>
        
        <div className="px-4 py-2 flex-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {navItems.map(tab => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`
                }
                id={`nav-${tab.label.toLowerCase()}`}
              >
                {({ isActive }) => (
                  <>
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {tab.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">System Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar panel */}
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-50">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none ring-2 ring-inset ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500 tracking-tight">Apex Ledger</h1>
              </div>
            </div>
            
            <div className="px-4 py-2 flex-1 overflow-y-auto">
              <nav className="space-y-1">
                {navItems.map(tab => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.to === '/'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <tab.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        {tab.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 capitalize hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
             {/* Sparkles / Gemini API Status Mock */}
             <div className="hidden sm:flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
               <BrainCircuit className="w-4 h-4 text-purple-600" />
               <span className="text-xs font-semibold text-purple-700">Apex AI Active</span>
             </div>
             
             <div className="relative">
               <img 
                 className="w-9 h-9 rounded-full border-2 border-indigo-100 object-cover"
                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=e2e8f0" 
                 alt="Avatar" 
               />
               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
