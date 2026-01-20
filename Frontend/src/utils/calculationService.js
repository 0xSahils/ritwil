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
 * Determines if a placement qualifies based on duration
 * @param {number} daysCompleted 
 * @returns {boolean}
 */
export const checkQualifierStatus = (daysCompleted) => {
  return (daysCompleted || 0) >= QUALIFIER_DAYS;
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

export const CalculationService = {
  formatCurrency,
  formatPercentage,
  calculateDaysDifference,
  checkQualifierStatus,
  calculateTargetAchievement,
  calculateAchievedValue,
  safeParseNumber,
  parseExcelDate,
  calculateTotalRevenue
};

export default CalculationService;
