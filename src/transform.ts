// API Response
export interface RawPermit {
  permitnumber?: string | null;
  permitnumbercreateddate?: string | null;
  issuedate?: string | null;
  permitelapseddays?: number | null;
  projectvalue?: number | null;
  typeofwork?: string | null;
  address?: string | null;
  projectdescription?: string | null;
  permitcategory?: string | null;
  applicant?: string | null;
  applicantaddress?: string | null;
  propertyuse?: string[] | null;
  specificusecategory?: string[] | null;
  buildingcontractor?: string | null;
  buildingcontractoraddress?: string | null;
  issueyear?: string | null;    
  geolocalarea?: string | null;
  yearmonth?: string | null;
  geo_point_2d?: { lat: number; lon: number } | null;
}

// for database
export interface Permit {
  permitNumber: string;
  createdDate: string | null;
  issueDate: string | null;
  elapsedDays: number | null;
  projectValue: number | null;
  typeOfWork: string | null;
  address: string | null;
  projectDescription: string | null;
  permitCategory: string | null;
  applicant: string | null;
  applicantaddress?: string | null;
  propertyUse: string | null;
  specificusecategory?: string | null;
  buildingContractor: string | null;
  buildingcontractoraddress?: string | null;
  issueyear?: string | null;    
  yearmonth?: string | null;
  localArea: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function cleanText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned === '' ? null : cleaned;
}

// 'YYYY-MM-DD'
export function parseDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function transformPermit(raw: RawPermit): Permit | null {
  const permitNumber = cleanText(raw.permitnumber);
  if (!permitNumber) return null;

  return {
    permitNumber,
    createdDate: parseDate(raw.permitnumbercreateddate),
    issueDate: parseDate(raw.issuedate),
    elapsedDays: toNumber(raw.permitelapseddays),
    projectValue: toNumber(raw.projectvalue),
    typeOfWork: cleanText(raw.typeofwork),
    address: cleanText(raw.address),
    projectDescription: cleanText(raw.projectdescription),
    permitCategory: cleanText(raw.permitcategory),
    applicant: cleanText(raw.applicant),
    applicantaddress: cleanText(raw.applicantaddress),
    specificusecategory: cleanText(raw.specificusecategory?.join(', ')),
    propertyUse: cleanText(raw.propertyuse?.join(', ')),
    buildingContractor: cleanText(raw.buildingcontractor),
    buildingcontractoraddress: cleanText(raw.buildingcontractoraddress),
    issueyear: cleanText(raw.issueyear),
    yearmonth: cleanText(raw.yearmonth),
    localArea: cleanText(raw.geolocalarea),
    latitude: toNumber(raw.geo_point_2d?.lat),
    longitude: toNumber(raw.geo_point_2d?.lon),
  };
}