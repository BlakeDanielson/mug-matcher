/**
 * Utility functions for crime severity styling and color coding
 */

export type CrimeSeverity = 'High' | 'Medium' | 'Low' | 'Unknown';

/**
 * Get the color classes for a crime severity level
 * @param severity The crime severity level
 * @returns Object with background and text color classes
 */
export function getSeverityColors(severity?: CrimeSeverity) {
  switch (severity) {
    case 'High':
      return {
        bg: 'bg-red-500',
        text: 'text-white',
        border: 'border-red-500',
        bgLight: 'bg-red-100',
        textLight: 'text-red-800',
        ring: 'ring-red-200'
      };
    case 'Medium':
      return {
        bg: 'bg-orange-500',
        text: 'text-white',
        border: 'border-orange-500',
        bgLight: 'bg-orange-100',
        textLight: 'text-orange-800',
        ring: 'ring-orange-200'
      };
    case 'Low':
      return {
        bg: 'bg-yellow-500',
        text: 'text-black',
        border: 'border-yellow-500',
        bgLight: 'bg-yellow-100',
        textLight: 'text-yellow-800',
        ring: 'ring-yellow-200'
      };
    case 'Unknown':
    default:
      return {
        bg: 'bg-gray-500',
        text: 'text-white',
        border: 'border-gray-500',
        bgLight: 'bg-gray-100',
        textLight: 'text-gray-800',
        ring: 'ring-gray-200'
      };
  }
}

/**
 * Get a severity badge component props
 * @param severity The crime severity level
 * @returns Object with className and text for the badge
 */
export function getSeverityBadge(severity?: CrimeSeverity) {
  const colors = getSeverityColors(severity);
  return {
    className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`,
    text: severity || 'Unknown'
  };
}

/**
 * Get severity indicator for crime cards
 * @param severity The crime severity level
 * @returns Object with styling for crime severity indicators
 */
export function getSeverityIndicator(severity?: CrimeSeverity) {
  const colors = getSeverityColors(severity);
  return {
    className: `w-3 h-3 rounded-full ${colors.bg} border-2 border-white shadow-sm`,
    title: `Crime Severity: ${severity || 'Unknown'}`
  };
} 