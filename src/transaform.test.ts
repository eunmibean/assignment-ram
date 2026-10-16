import { describe, it, expect } from 'vitest';
import { cleanText, parseDate, toNumber, transformPermit } from './transform';

describe('cleanText', () => {
  it('collapses line breaks and extra spaces', () => {
    expect(cleanText('  900 W HASTINGS\r\n   STREET  ')).toBe('900 W HASTINGS STREET');
  });

  it('returns null for null, undefined, and blank strings', () => {
    expect(cleanText(null)).toBeNull();
    expect(cleanText(undefined)).toBeNull();
    expect(cleanText('   ')).toBeNull();
  });
});

describe('parseDate', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(parseDate('2026-06-03')).toBe('2026-06-03');
  });

  it('returns null for empty or wrongly formatted values', () => {
    expect(parseDate('')).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate('06/03/2026')).toBeNull();
  });
});

describe('toNumber', () => {
  it('converts numeric values and numeric strings', () => {
    expect(toNumber(260000)).toBe(260000);
    expect(toNumber('12.5')).toBe(12.5);
  });

  it('returns null for empty or non-numeric values', () => {
    expect(toNumber(null)).toBeNull();
    expect(toNumber('')).toBeNull();
    expect(toNumber('abc')).toBeNull();
  });
});

describe('transformPermit', () => {
  const raw = {
    permitnumber: 'BP-2026-01769',
    permitnumbercreateddate: '2026-05-28',
    issuedate: '2026-06-03',
    permitelapseddays: 6,
    projectvalue: 260000.0,
    typeofwork: 'Addition / Alteration',
    address: '900 W HASTINGS STREET,\r\n Vancouver, BC V6C 1E5',
    permitcategory: 'Renovation - Commercial/ Mixed Use - Lower Complexity',
    applicant: 'Patrice Graham DBA: UPG Property Group Inc',
    applicantaddress: '900 West Hastings Street\r\nSuite 500\r\nVancouver, BC  V6C 1E5',
    projectdescription: "Field Review - Addition / Alteration - #710 - 7th floor \n\nInterior alterations to provide improvements to this existing vacant office space on the 7th floor (#710) of this existing commercial heritage\nbuilding on this site.",
    propertyuse: ['Office Uses'],
    specificusecategory: ['General Office'],
    buildingcontractor: null,
    buildingcontractoraddress: null,
    geolocalarea: 'Downtown',
    geo_point_2d: { lon: -123.1162627, lat: 49.2864734 },
  };

  it('maps and cleans a full record', () => {
    expect(transformPermit(raw)).toEqual({
      permitNumber: 'BP-2026-01769',
      createdDate: '2026-05-28',
      issueDate: '2026-06-03',
      elapsedDays: 6,
      projectValue: 260000,
      typeOfWork: 'Addition / Alteration',
      address: '900 W HASTINGS STREET, Vancouver, BC V6C 1E5',
      permitCategory: 'Renovation - Commercial/ Mixed Use - Lower Complexity',
      applicant: 'Patrice Graham DBA: UPG Property Group Inc',
      applicantaddress: '900 West Hastings Street Suite 500 Vancouver, BC V6C 1E5',
      projectDescription: 'Field Review - Addition / Alteration - #710 - 7th floor Interior alterations to provide improvements to this existing vacant office space on the 7th floor (#710) of this existing commercial heritage building on this site.',
      propertyUse: 'Office Uses',
      specificUseCategory: 'General Office',
      buildingContractor: null,
      buildingContractorAddress: null,
      localArea: 'Downtown',
      latitude: 49.2864734,
      longitude: -123.1162627,
    });
  });

  it('returns null when the permit number is missing', () => {
    expect(transformPermit({ ...raw, permitnumber: null })).toBeNull();
    expect(transformPermit({ ...raw, permitnumber: '  ' })).toBeNull();
  });

  it('handles missing optional fields without crashing', () => {
    const result = transformPermit({ permitnumber: 'BP-1' });
    expect(result).toMatchObject({
      permitNumber: 'BP-1',
      issueDate: null,
      projectValue: null,
      propertyUse: null,
      latitude: null,
      longitude: null,
    });
  });

  it('joins multiple property uses into one string', () => {
    const result = transformPermit({ ...raw, propertyuse: ['Office Uses', 'Retail Uses'] });
    expect(result?.propertyUse).toBe('Office Uses, Retail Uses');
  });
});
