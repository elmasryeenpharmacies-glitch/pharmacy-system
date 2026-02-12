
import React, { useState } from 'react';
import Header from './components/Header';
import PharmacyForm from './components/PharmacyForm';
import SuccessModal from './components/SuccessModal';
import WhatsAppButton from './components/WhatsAppButton';
import { SubmissionResponse } from './types';

const App: React.FC = () => {
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0); // مفتاح لإعادة تهيئة النموذج

  const handleSubmissionSuccess = (result: SubmissionResponse) => {
    setSubmissionResult(result);
    setShowSuccess(true);
  };

  const handleReset = () => {
    setShowSuccess(false);
    setSubmissionResult(null);
    setFormKey(prev => prev + 1); // تغيير المفتاح يجبر النموذج على البدء من الصفر (تصفير الخانات)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-purple-200 selection:text-purple-900">
      <Header onHomeClick={handleReset} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-purple-900/5 p-8 md:p-12 border border-purple-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

          <div className="mb-10 text-center relative z-10">
            <div className="inline-block px-4 py-1.5 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm">
              خدمة العملاء
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">طلب صرف روشتة تأمين</h1>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              خطوات بسيطة تفصلك عن استلام أدويتك. ارفع بياناتك وسنتولى الباقي.
            </p>
          </div>

          {/* استخدام key يضمن تصفير النموذج بالكامل عند تغيير المفتاح */}
          <PharmacyForm key={formKey} onSuccess={handleSubmissionSuccess} />
        </div>
      </main>

      <footer className="py-8 text-center border-t border-purple-100 bg-white">
        <p className="text-slate-400 text-xs font-bold">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} <span className="text-purple-600 font-black">صيدليات المصريين</span>
        </p>
      </footer>

      {showSuccess && submissionResult && (
        <SuccessModal 
          serialNumber={submissionResult.serialNumber || ''} 
          onClose={handleReset} 
        />
      )}

      <WhatsAppButton />
    </div>
  );
};

export default App;
