
import React from 'react';

interface SuccessModalProps {
  serialNumber: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ serialNumber, onClose }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(serialNumber);
    alert("تم نسخ رقم الروشتة بنجاح");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-purple-950/60 backdrop-blur-xl transition-all duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full text-center shadow-3xl transform transition-all animate-in fade-in zoom-in-95 duration-500 border border-purple-100 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-60"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-2">شكراً لثقتكم!</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed px-4 font-medium">لقد استلمنا طلبكم بنجاح وسنقوم بمعالجته فوراً. يرجى الاحتفاظ بالرقم المرجعي:</p>
          
          <div className="bg-purple-50 rounded-3xl p-6 border-2 border-dashed border-purple-200 mb-6 group relative overflow-hidden transition-all hover:border-purple-400">
            <div className="absolute top-0 right-0 p-2 text-purple-200 pointer-events-none opacity-30 group-hover:rotate-12 transition-transform">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            </div>
            <span className="text-4xl font-black text-purple-700 tracking-tighter block mb-3 font-mono">{serialNumber}</span>
            <button 
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-full text-xs font-black hover:bg-purple-700 transition-all active:scale-95 shadow-md hover:shadow-purple-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              نسخ رقم الروشتة
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-amber-800 bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-8 text-right">
            <svg className="w-5 h-5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            <span className="font-bold">يرجى تصوير الشاشة (Screenshot) لضمان حفظ رقم الطلب للمتابعة.</span>
          </div>

          {/* Buttons: Repeat and Home */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl font-black text-base transition-all shadow-lg shadow-purple-200 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              إرسال طلب جديد (كرر العملية)
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white border-2 border-purple-100 text-purple-700 hover:bg-purple-50 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
