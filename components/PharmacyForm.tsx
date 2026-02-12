
import React, { useState } from 'react';
import { BRANCHES, INSURANCE_COMPANIES, MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from '../constants';
import { FormData, SubmissionResponse } from '../types';
import { submitToGoogleSheets } from '../services/api';

interface PharmacyFormProps {
  onSuccess: (result: SubmissionResponse) => void;
}

const PharmacyForm: React.FC<PharmacyFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<{ message: string; subMessage?: string } | null>(null);
  
  const [dragState, setDragState] = useState({
    P: false,
    C: false,
    IDF: false,
    IDB: false
  });

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    locationUrl: '',
    branch: '',
    insuranceCompany: '',
    prescriptionFile: null,
    cardFile: null,
    idFrontFile: null,
    idBackFile: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم خاصية تحديد الموقع.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, locationUrl: url }));
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        alert("تعذر تحديد الموقع. يرجى التأكد من تفعيل GPS ومنح الإذن للمتصفح.");
      }
    );
  };

  const validateAndSetFile = (file: File, name: string) => {
    if (file.size > MAX_FILE_SIZE) {
      setError({
        message: "حجم الملف كبير جداً",
        subMessage: `الملف "${file.name}" يتجاوز 5 ميجابايت. يرجى ضغط الصورة أو اختيار ملف آخر.`
      });
      return false;
    }
    if (!ALLOWED_EXTENSIONS.includes(file.type)) {
      setError({
        message: "نوع الملف غير مدعوم",
        subMessage: "يرجى رفع صور (JPG, PNG) أو ملفات PDF فقط."
      });
      return false;
    }
    setFormData(prev => ({ ...prev, [name]: file }));
    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (!validateAndSetFile(files[0], name)) {
        e.target.value = '';
      }
    }
  };

  const onDragOver = (e: React.DragEvent, type: keyof typeof dragState) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({ ...prev, [type]: true }));
  };

  const onDragLeave = (e: React.DragEvent, type: keyof typeof dragState) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({ ...prev, [type]: false }));
  };

  const onDrop = (e: React.DragEvent, name: keyof FormData, type: keyof typeof dragState) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0], name as string);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.fullName || 
      !formData.phone || 
      !formData.branch || 
      !formData.insuranceCompany || 
      !formData.prescriptionFile || 
      !formData.cardFile ||
      !formData.idFrontFile ||
      !formData.idBackFile
    ) {
      setError({
        message: "بيانات ناقصة",
        subMessage: "يرجى استكمال الحقول الإجبارية (الاسم، الهاتف، الفرع، الشركة، الروشتة، الكارنيه، وصورتي البطاقة الشخصية)."
      });
      return;
    }

    if (!/^01[0125][0-9]{8}$/.test(formData.phone)) {
      setError({
        message: "رقم هاتف غير صحيح",
        subMessage: "يجب أن يتكون رقم الهاتف من 11 رقماً ويبدأ بـ (010, 011, 012, 015)."
      });
      return;
    }

    setLoading(true);
    try {
      const result = await submitToGoogleSheets(formData);
      if (result.success) {
        onSuccess(result);
      } else {
        setError({
          message: "خطأ في الاتصال بالخادم",
          subMessage: result.error || "واجهنا مشكلة في معالجة طلبك."
        });
      }
    } catch (err) {
      setError({
        message: "فشل في إرسال الطلب",
        subMessage: "يرجى التأكد من اتصالك بالإنترنت وتوافر مفاتيح التشغيل."
      });
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({ label, name, file, type, icon, required }: { label: string, name: keyof FormData, file: File | null, type: keyof typeof dragState, icon: React.ReactNode, required?: boolean }) => (
    <div className="space-y-3 transition-all duration-300">
      <label className="text-[11px] font-black text-purple-900 uppercase tracking-widest text-center block flex items-center justify-center gap-2">
        <span className={file ? 'text-green-600' : 'text-purple-400'}>{icon}</span>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div 
        onDragOver={(e) => onDragOver(e, type)}
        onDragLeave={(e) => onDragLeave(e, type)}
        onDrop={(e) => onDrop(e, name, type)}
        className={`relative group p-7 rounded-[2.2rem] border-2 transition-all duration-500 flex flex-col items-center justify-center gap-3 shadow-sm overflow-hidden ${
          file 
            ? 'border-green-500 bg-green-50/30 ring-4 ring-green-500/10' 
            : dragState[type] 
              ? 'border-purple-600 border-solid bg-purple-50 scale-[1.03] ring-8 ring-purple-600/5 shadow-xl' 
              : 'border-purple-200 border-dashed hover:border-purple-400 bg-white hover:shadow-md'
        }`}
      >
        {file && <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none"></div>}

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm relative z-10 ${
          file 
            ? 'bg-green-600 text-white scale-100' 
            : dragState[type] 
              ? 'bg-purple-600 text-white scale-110 shadow-purple-200' 
              : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
        }`}>
          {file ? (
            <svg className="w-8 h-8 animate-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : icon}
        </div>
        
        <input type="file" name={name as string} accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
        
        <div className="text-center relative z-10">
          <span className={`text-[10px] font-black block truncate max-w-[150px] transition-colors duration-300 ${
            file ? 'text-green-700' : dragState[type] ? 'text-purple-700' : 'text-slate-500'
          }`}>
            {file ? file.name : (dragState[type] ? "أفلت الملف الآن" : "اضغط أو اسحب الملف")}
          </span>
          {!file && !dragState[type] && <span className="text-[9px] text-slate-400 font-bold">JPG, PNG, PDF</span>}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-5 text-red-700 text-sm rounded-2xl flex flex-col gap-1 animate-shake shadow-lg shadow-red-100">
          <div className="flex items-center gap-2 font-black">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error.message}
          </div>
          {error.subMessage && <p className="text-[12px] opacity-80 mr-7 leading-relaxed font-bold">{error.subMessage}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-focus-within:text-purple-700">
            الاسم بالكامل <span className="text-purple-600">*</span>
          </label>
          <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-purple-100 bg-purple-50/20 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all text-purple-700 placeholder:text-slate-400 font-bold shadow-sm" placeholder="ادخل الاسم ثلاثي" />
        </div>

        <div className="group space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-focus-within:text-purple-700">
            رقم الهاتف <span className="text-purple-600">*</span>
          </label>
          <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-purple-100 bg-purple-50/20 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all text-left text-purple-700 placeholder:text-slate-400 font-bold shadow-sm" placeholder="01xxxxxxxxx" dir="ltr" />
        </div>
      </div>

      <div className="group space-y-2">
        <div className="flex justify-between items-center mb-1">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors group-focus-within:text-purple-700">العنوان بالتفصيل</label>
          <button type="button" onClick={handleGetLocation} disabled={locating} className={`text-[10px] font-black flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all shadow-sm ${formData.locationUrl ? 'bg-green-600 text-white shadow-green-200' : 'bg-white text-purple-700 border-2 border-purple-100 hover:border-purple-300 hover:shadow-md active:scale-95'}`}>
            <svg className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              {formData.locationUrl && !locating ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              )}
            </svg>
            {locating ? 'جاري التحديد...' : formData.locationUrl ? 'تم تحديد موقعك' : 'تحديد موقعي التلقائي'}
          </button>
        </div>
        <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-5 py-3.5 rounded-2xl border-2 border-purple-100 bg-purple-50/20 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all text-purple-700 font-bold shadow-sm" placeholder="اكتب عنوانك بالتفصيل ليصلك المندوب بأسرع وقت"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">الفرع <span className="text-purple-600">*</span></label>
          <div className="relative">
            <select required name="branch" value={formData.branch} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-purple-200 bg-purple-50/40 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none appearance-none cursor-pointer transition-all text-purple-700 font-bold shadow-sm">
              <option value="">اختر الفرع الأقرب لك</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">شركة التأمين <span className="text-purple-600">*</span></label>
          <div className="relative">
            <select required name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-purple-200 bg-purple-50/40 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none appearance-none cursor-pointer transition-all text-purple-700 font-bold shadow-sm">
              <option value="">اختر شركة التأمين</option>
              {INSURANCE_COMPANIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-900/[0.03] p-6 rounded-[2.5rem] border-2 border-purple-100/50 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/30 blur-3xl rounded-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <FileUploadBox 
            label="صورة الروشتة" 
            name="prescriptionFile" 
            file={formData.prescriptionFile} 
            type="P" 
            icon={<svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" /></svg>} 
            required
          />
          <FileUploadBox 
            label="صورة كارنيه التأمين" 
            name="cardFile" 
            file={formData.cardFile} 
            type="C" 
            icon={<svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} 
            required
          />
        </div>

        <div className="pt-6 border-t border-purple-200/50 relative z-10">
          <h4 className="text-[10px] font-black text-purple-800 mb-6 text-center uppercase tracking-[0.2em]">مرفقات البطاقة الشخصية (إجباري)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadBox 
              label="وجه البطاقة" 
              name="idFrontFile" 
              file={formData.idFrontFile} 
              type="IDF" 
              icon={<svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>} 
              required
            />
            <FileUploadBox 
              label="ظهر البطاقة" 
              name="idBackFile" 
              file={formData.idBackFile} 
              type="IDB" 
              icon={<svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} 
              required
            />
          </div>
        </div>
      </div>

      <button 
        disabled={loading} 
        type="submit" 
        className={`w-full py-5 rounded-[2.5rem] text-white font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 group relative overflow-hidden ${
          loading 
            ? 'bg-purple-900/50 cursor-not-allowed scale-[0.98]' 
            : 'bg-purple-700 hover:bg-purple-800 active:scale-95 shadow-purple-900/20'
        }`}
      >
        {loading && <div className="absolute inset-0 animate-shimmer"></div>}
        <span className="relative z-10">
          {loading ? 'جاري تحليل الروشتة بالذكاء الاصطناعي...' : 'إرسال الطلب الآن'}
        </span>
        {!loading ? (
          <svg className="w-6 h-6 transform -rotate-180 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        ) : (
          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
        )}
      </button>

      <p className="text-center text-[10px] text-slate-400 font-bold">
        بالضغط على إرسال، فإنك توافق على معالجة بياناتك لصرف الروشتة.
      </p>
    </form>
  );
};

export default PharmacyForm;
