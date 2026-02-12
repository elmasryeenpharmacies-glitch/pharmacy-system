
export interface FormData {
  fullName: string;
  phone: string;
  address: string;
  locationUrl?: string;
  branch: string;
  insuranceCompany: string;
  prescriptionFile: File | null;
  cardFile: File | null;
  idFrontFile: File | null;
  idBackFile: File | null;
}

export interface SubmissionResponse {
  success: boolean;
  serialNumber?: string;
  message?: string;
  error?: string;
}

export enum Branch {
  SALAM = "مدينة السلام",
  AIN_SHAMS_MASAKEN = "فرع مساكن عين شمس",
  ABU_EL_FETOUH = "فرع أبو الفتوح عبدالله – عين شمس",
  IBRAHIM_ABD_EL_RAZEQ = "فرع إبراهيم عبد الرازق – عين شمس",
  SHERATON = "فرع الشيراتون"
}

export enum InsuranceCompany {
  AXA = "شركة أكسا",
  GLOBE_MED = "شركة جلوب ميد",
  METLIFE = "شركة ميت لايف",
  LIMITLESS = "شركة ليمتليس كير",
  MED_RIGHT = "شركة ميد رايت",
  SEHHA = "شركة صحة",
  NEXT_CARE = "شركة نيكست كير",
  ELECTRICITY = "شركة الكهرباء"
}
