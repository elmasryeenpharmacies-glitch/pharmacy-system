
import { GoogleGenAI } from "@google/genai";
import { FormData, SubmissionResponse } from '../types';
import { GOOGLE_SCRIPT_URL } from '../constants';

/**
 * تحويل الملف إلى Base64 مع معلومات النوع والاسم
 */
const fileToBase64Data = (file: File): Promise<{ base64: string, type: string, name: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        base64: base64String,
        type: file.type,
        name: file.name
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * استخراج بيانات الروشتة باستخدام Gemini AI
 */
const extractPrescriptionData = async (file: File): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fileData = await fileToBase64Data(file);
    
    const prompt = `
      أنت مساعد صيدلي محترف. قم بتحليل صورة الروشتة الطبية المرفقة واستخرج المعلومات التالية بدقة وباللغة العربية:
      1. أسماء الأدوية المكتوبة.
      2. الجرعات وطريقة الاستخدام لكل دواء.
      3. اسم الطبيب والتخصص (إن وجد).
      نسق الإجابة في نقاط واضحة ومختصرة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: file.type, data: fileData.base64 } }
        ]
      }],
    });

    return response.text || "لم يتمكن الذكاء الاصطناعي من استخراج بيانات واضحة.";
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return "فشل التحليل الآلي للروشتة.";
  }
};

/**
 * إرسال البيانات إلى Google Cloud (Apps Script)
 */
export const submitToGoogleSheets = async (formData: FormData): Promise<SubmissionResponse> => {
  try {
    // 1. تحليل الروشتة بالذكاء الاصطناعي
    const aiResult = formData.prescriptionFile 
      ? await extractPrescriptionData(formData.prescriptionFile) 
      : "لا توجد روشتة";

    // 2. تحضير الملفات كـ Base64 للإرسال
    const [pFileData, cFileData, idFFileData, idBFileData] = await Promise.all([
      formData.prescriptionFile ? fileToBase64Data(formData.prescriptionFile) : Promise.resolve(null),
      formData.cardFile ? fileToBase64Data(formData.cardFile) : Promise.resolve(null),
      formData.idFrontFile ? fileToBase64Data(formData.idFrontFile) : Promise.resolve(null),
      formData.idBackFile ? fileToBase64Data(formData.idBackFile) : Promise.resolve(null)
    ]);

    const serial = `MS-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      serialNumber: serial,
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      locationUrl: formData.locationUrl,
      branch: formData.branch,
      insuranceCompany: formData.insuranceCompany,
      extractedAiData: aiResult,
      // بيانات الملفات ليتم رفعها لـ Drive
      prescription: pFileData,
      card: cFileData,
      idFront: idFFileData,
      idBack: idBFileData
    };

    // 3. الإرسال إلى Google Apps Script
    // ملاحظة: نستخدم mode: 'no-cors' لأن Apps Script لا يدعم CORS التقليدي في طلبات POST المباشرة
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      serialNumber: serial
    };
  } catch (error: any) {
    console.error("Submission error:", error);
    return { 
      success: false, 
      error: error.message || "حدث خطأ أثناء الإرسال لخدمات جوجل." 
    };
  }
};
