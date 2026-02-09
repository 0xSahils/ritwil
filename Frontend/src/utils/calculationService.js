/**
 * Centralized Calculation Service
 * Handles all business logic for calculations, transformations, and formatting.
 */

// Constants
export const QUALIFIER_DAYS = 90;
export const CURRENCY_LOCALE = 'en-US';
export const CURRENCY_CODE = 'USD';
export const INR_LOCALE = 'en-IN';
export const INR_CODE = 'INR';

/**
 * Formats a number as currency (USD by default)
 * @param {number|string} amount 
 * @param {string} currencyCode 
 * @returns {string}
 */
export const formatCurrency = (amount, currencyCode = CURRENCY_CODE) => {
  if (amount === undefined || amount === null || amount === '') return '-';
  const num = Number(amount);
  if (isNaN(num)) return '-';

  const locale = currencyCode === 'INR' ? INR_LOCALE : CURRENCY_LOCALE;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
};

/**
 * Formats a percentage
 * @param {number|string} value 
 * @returns {string}
 */
export const formatPercentage = (value) => {
  if (value === undefined || value === null || value === '') return '0%';
  const num = Number(value);
  if (isNaN(num)) return '0%';
  return `${Math.round(num)}%`;
};

/**
 * Calculates days between two dates
 * @param {string|Date} startDate 
 * @param {string|Date} endDate (defaults to now)
 * @returns {number}
 */
export const calculateDaysDifference = (startDate, endDate = new Date()) => {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Checks if qualifier period is completed
 * @param {number} daysCompleted 
 * @returns {boolean}
 */
export const checkQualifierStatus = (daysCompleted) => {
  return (Number(daysCompleted) || 0) >= QUALIFIER_DAYS;
};

/**
 * Calculates Target Achievement Percentage
 * @param {number} revenue 
 * @param {number} target 
 * @returns {number}
 */
export const calculateTargetAchievement = (revenue, target) => {
  const rev = Number(revenue) || 0;
  const tgt = Number(target) || 0;
  
  if (tgt === 0) return 0; // Avoid division by zero
  return (rev / tgt) * 100;
};

/**
 * Calculates Achieved Value from Target and Percentage
 * @param {number} target 
 * @param {number} percentage 
 * @returns {number}
 */
export const calculateAchievedValue = (target, percentage) => {
  const t = Number(target) || 0;
  const p = Number(percentage) || 0;
  return (p / 100) * t;
};

/**
 * Safe number parsing
 * @param {any} value 
 * @returns {number}
 */
export const safeParseNumber = (value) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  const clean = String(value).replace(/,/g, '').trim();
  const num = Number(clean);
  return isNaN(num) ? 0 : num;
};

/**
 * Parse Excel Date Serial Number or String
 * @param {string|number} val 
 * @returns {string|null} ISO Date String
 */
export const parseExcelDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
     // Excel date serial number conversion
     return new Date(Math.round((val - 25569)*86400*1000)).toISOString();
  }
  // Try parsing string date
  const date = new Date(val);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * Aggregates revenue from a list of placements
 * @param {Array} placements 
 * @returns {number}
 */
export const calculateTotalRevenue = (placements) => {
  if (!Array.isArray(placements)) return 0;
  return placements.reduce((sum, p) => sum + safeParseNumber(p.revenue), 0);
};

/**
 * Calculates Slab based on Achievement Percentage, Team, and Role
 * @param {number} achievementPercentage 
 * @param {string} teamName 
 * @param {string} level 
 * @returns {object} { label: string, color: string }
 */
export const calculateSlabFromAchievement = (achievementPercentage, teamName, level) => {
  const ach = Number(achievementPercentage) || 0;
  const isVantage = String(teamName || '').toLowerCase().includes('vantage');
  const isTeamLead = String(level || '').toLowerCase().includes('l2') || 
                     String(level || '').toLowerCase().includes('lead') ||
                     String(level || '').toLowerCase().includes('manager');

  let slab = 0;

  if (isVantage) {
    if (isTeamLead) {
      // Vantage Team Lead
      // 35-60% -> 1.00% (Slab 2)
      // 61-85% -> 1.50% (Slab 3)
      // >85% -> 2.00% (Slab 4)
      if (ach > 85) slab = 4;
      else if (ach > 60) slab = 3;
      else if (ach >= 35) slab = 2;
      else slab = 0; // Below 35%
    } else {
      // Vantage Recruiter
      // 1-50% -> 1.75% (Slab 1)
      // 51-70% -> 2.25% (Slab 2)
      // 71-85% -> 2.75% (Slab 3)
      // >85% -> 4.00% (Slab 4)
      if (ach > 85) slab = 4;
      else if (ach > 70) slab = 3;
      else if (ach > 50) slab = 2;
      else if (ach > 0) slab = 1;
      else slab = 0;
    }
  } else {
    // Others
    if (isTeamLead) {
      // Others Team Lead (L2)
      // 35-65% -> 1.25% (Slab 2)
      // 66-90% -> 1.75% (Slab 3)
      // 91-110% -> 2.50% (Slab 4)
      // >110% -> 5.00% (Slab 5)
      if (ach > 110) slab = 5;
      else if (ach > 90) slab = 4;
      else if (ach > 65) slab = 3;
      else if (ach >= 35) slab = 2;
      else slab = 0;
    } else {
      // Others Recruiter
      // 1-34% -> 0.00% (Slab 1)
      // 35-75% -> 3.00% (Slab 2)
      // 76-120% -> 4.00% (Slab 3)
      // >120% -> 5.00% (Slab 4)
      if (ach > 120) slab = 4;
      else if (ach > 75) slab = 3;
      else if (ach >= 35) slab = 2;
      else if (ach > 0) slab = 1;
      else slab = 0;
    }
  }

  const colors = {
    0: 'bg-gray-100 text-gray-700',
    1: 'bg-red-100 text-red-700',
    2: 'bg-amber-100 text-amber-700',
    3: 'bg-blue-100 text-blue-700',
    4: 'bg-green-100 text-green-700',
    5: 'bg-purple-100 text-purple-700'
  };

  const label = slab > 0 ? `Slab ${slab}` : 'Standard'; // Default to Standard if no slab met
  const color = colors[slab] || colors[0];
  
  return { label, color };
};

/**
 * Determines Slab based on Incentive Percentage from Sheet
 * @param {string|number} incentivePercentageStr 
 * @param {string} teamName 
 * @param {string} level 
 * @returns {object} { label: string, color: string }
 */
export const getSlabFromIncentivePercentage = (incentivePercentageStr, teamName, level) => {
  if (incentivePercentageStr === undefined || incentivePercentageStr === null || incentivePercentageStr === '') {
     return { label: 'Standard', color: 'bg-gray-100 text-gray-700' };
  }

  let pct = 0;
  
  if (typeof incentivePercentageStr === 'number') {
      pct = incentivePercentageStr;
      // Heuristic for Excel percentage (0.05 = 5%) vs raw number (5 = 5%)
      // If value is small (<= 1.0), assume it's a ratio and convert to percentage value.
      // Slabs are typically 1-5%. 
      if (pct <= 1.0 && pct > 0) {
          pct *= 100;
      }
  } else {
      // String
      const s = String(incentivePercentageStr).trim();
      if (s.includes('%')) {
          pct = parseFloat(s.replace(/[^0-9.]/g, ''));
      } else {
          pct = parseFloat(s);
          if (!isNaN(pct) && pct <= 1.0 && pct > 0) {
             pct *= 100;
          }
      }
  }
  
  const isVantage = String(teamName || '').toLowerCase().includes('vantage');
  const isTeamLead = String(level || '').toLowerCase().includes('l2') || 
                     String(level || '').toLowerCase().includes('lead') ||
                     String(level || '').toLowerCase().includes('manager');

  let slab = 0;

  // Logic based on exact matches or ranges of INCENTIVE percentage
  // We match the "Target Achievement" logic's output.
  
  if (isVantage) {
    if (isTeamLead) {
      // Vantage Team Lead
      // 1.00% -> Slab 2
      // 1.50% -> Slab 3
      // 2.00% -> Slab 4
      if (pct >= 2.0) slab = 4;
      else if (pct >= 1.5) slab = 3;
      else if (pct >= 1.0) slab = 2;
      else slab = 0;
    } else {
      // Vantage Recruiter
      // 1.75% -> Slab 1
      // 2.25% -> Slab 2
      // 2.75% -> Slab 3
      // 4.00% -> Slab 4
      if (pct >= 4.0) slab = 4;
      else if (pct >= 2.75) slab = 3;
      else if (pct >= 2.25) slab = 2;
      else if (pct >= 1.75) slab = 1;
      else slab = 0;
    }
  } else {
    // Others
    if (isTeamLead) {
      // Others Team Lead (L2)
      // 1.25% -> Slab 2
      // 1.75% -> Slab 3
      // 2.50% -> Slab 4
      // 5.00% -> Slab 5
      if (pct >= 5.0) slab = 5;
      else if (pct >= 2.5) slab = 4;
      else if (pct >= 1.75) slab = 3;
      else if (pct >= 1.25) slab = 2;
      else slab = 0;
    } else {
      // Others Recruiter
      // 0.00% -> Slab 1 (Wait, 0% is Slab 1? Logic says 1-34% ach -> 0.00% incentive -> Slab 1)
      // 3.00% -> Slab 2
      // 4.00% -> Slab 3
      // 5.00% -> Slab 4
      if (pct >= 5.0) slab = 4;
      else if (pct >= 4.0) slab = 3;
      else if (pct >= 3.0) slab = 2;
      else slab = 1; // Default to Slab 1 if 0% or low?
    }
  }

  const colors = {
    0: 'bg-gray-100 text-gray-700',
    1: 'bg-red-100 text-red-700',
    2: 'bg-amber-100 text-amber-700',
    3: 'bg-blue-100 text-blue-700',
    4: 'bg-green-100 text-green-700',
    5: 'bg-purple-100 text-purple-700'
  };

  const label = slab > 0 ? `Slab ${slab}` : 'Standard';
  const color = colors[slab] || colors[0];
  
  return { label, color };
};

export const CalculationService = {
  formatCurrency,
  formatPercentage,
  calculateDaysDifference,
  checkQualifierStatus, // Checks if qualifier period (90 days) is completed
  calculateTargetAchievement,
  calculateAchievedValue,
  safeParseNumber,
  parseExcelDate,
  calculateTotalRevenue,
  calculateSlab: calculateSlabFromAchievement,
  getSlabFromIncentivePercentage // New helper
};

export default CalculationService;
