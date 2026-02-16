/**
 * Helper functions for role display and filtering
 * Maps backend roles/levels to user-friendly frontend labels
 */

/**
 * Get friendly role display name from role and level
 * @param {string} role - Backend role (TEAM_LEAD, EMPLOYEE, etc.)
 * @param {string} level - Backend level (L2, L3, L4)
 * @returns {string} Friendly display name
 */
export const getRoleDisplayName = (role, level) => {
  // Normalize level to uppercase for comparison
  const normalizedLevel = level ? level.toUpperCase() : null;
  
  // Prioritize level checks first - level takes precedence over role
  if (normalizedLevel === 'L3') return 'Senior Recruiter';
  if (normalizedLevel === 'L4') return 'Recruiter';
  if (normalizedLevel === 'L2') return 'Team Lead';
  
  // Then check role if level is not set or doesn't match
  if (role === 'TEAM_LEAD') return 'Team Lead';
  if (role === 'EMPLOYEE') return 'Recruiter'; // Default to Recruiter for L4
  if (role === 'LIMITED_ACCESS') return 'Limited Access';
  if (role === 'SUPER_ADMIN') return 'Head';
  
  return role;
};

/**
 * Get filter value from display name (for dropdowns)
 * @param {string} displayName - Friendly display name
 * @returns {string} Filter value for backend query
 */
export const getFilterValueFromDisplayName = (displayName) => {
  switch (displayName) {
    case 'Team Lead': return 'TEAM_LEAD';
    case 'Senior Recruiter': return 'EMPLOYEE_L3';
    case 'Recruiter': return 'EMPLOYEE_L4';
    default: return '';
  }
};

/**
 * Get display name from filter value
 * @param {string} filterValue - Filter value (TEAM_LEAD, EMPLOYEE_L3, etc.)
 * @returns {string} Friendly display name
 */
export const getDisplayNameFromFilterValue = (filterValue) => {
  switch (filterValue) {
    case 'TEAM_LEAD': return 'Team Lead';
    case 'EMPLOYEE_L3': return 'Senior Recruiter';
    case 'EMPLOYEE_L4': return 'Recruiter';
    default: return filterValue;
  }
};

/**
 * Check if member matches role filter
 * @param {Object} member - Member object with role and level
 * @param {string} filterValue - Filter value to match against
 * @returns {boolean} Whether member matches filter
 */
export const matchesRoleFilter = (member, filterValue) => {
  if (!filterValue) return true;
  
  // Normalize level to uppercase for comparison, handle null/undefined
  const memberLevel = member.level ? member.level.toUpperCase() : null;
  
  switch (filterValue) {
    case 'TEAM_LEAD':
      // L2 level takes precedence, or TEAM_LEAD role without conflicting level
      return memberLevel === 'L2' || (member.role === 'TEAM_LEAD' && memberLevel !== 'L3' && memberLevel !== 'L4');
    case 'EMPLOYEE_L3':
      // Prioritize level - if level is L3, it's Senior Recruiter regardless of role
      return memberLevel === 'L3';
    case 'EMPLOYEE_L4':
      // L4 level takes precedence, or EMPLOYEE role without conflicting level
      return memberLevel === 'L4' || (member.role === 'EMPLOYEE' && !memberLevel);
    default:
      return true;
  }
};
