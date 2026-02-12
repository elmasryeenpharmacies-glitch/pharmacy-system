
import React from 'react';
import { PHARMACY_NAME } from '../constants';

interface HeaderProps {
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer group select-none" 
          onClick={onHomeClick}
          title="العودة للرئيسية وتصفير البيانات"
        >
          {/* Logo Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 blur-2xl opacity-10 group-hover:opacity-40 transition-all duration-500 scale-110"></div>
            
            <div className="relative z-10 w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-white group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ring-4 ring-purple-50 group-hover:ring-purple-100/50 bg-white">
              <img 
                src="logo.png" 
                alt={PHARMACY_NAME}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  const parent = target.parentElement;
                  if (parent) {
                    target.style.display = 'none';
                    parent.classList.add('bg-gradient-to-br', 'from-purple-600', 'to-purple-800', 'flex', 'items-center', 'justify-center');
                    parent.innerHTML = '<span class="text-white font-black text-xl">M</span>';
                  }
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-purple-950 leading-none tracking-tight group-hover:text-purple-700 transition-colors">
              {PHARMACY_NAME}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-purple-600 font-bold tracking-widest uppercase">
                رعايتكم هي مهمتنا الأولى
              </span>
            </div>
          </div>
        </div>
        
        {/* شارة الخدمة الفورية */}
        <div className="hidden sm:flex items-center gap-2.5 bg-purple-50/50 px-4 py-2 rounded-2xl border border-purple-100 shadow-sm hover:bg-purple-100/50 transition-colors cursor-default">
          <div className="bg-purple-600 p-1.5 rounded-xl shadow-md shadow-purple-200">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-purple-950 font-black text-[10px] leading-tight">خدمة فورية</span>
            <span className="text-purple-500 text-[9px] font-bold">متصل الآن</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
