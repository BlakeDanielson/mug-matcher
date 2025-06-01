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
        ring: 'ring-red-200',
        gradient: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30',
        borderGradient: 'border-red-300 dark:border-red-700',
        shadowColor: 'shadow-red-200/50 dark:shadow-red-900/30'
      };
    case 'Medium':
      return {
        bg: 'bg-orange-500',
        text: 'text-white',
        border: 'border-orange-500',
        bgLight: 'bg-orange-100',
        textLight: 'text-orange-800',
        ring: 'ring-orange-200',
        gradient: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30',
        borderGradient: 'border-orange-300 dark:border-orange-700',
        shadowColor: 'shadow-orange-200/50 dark:shadow-orange-900/30'
      };
    case 'Low':
      return {
        bg: 'bg-yellow-500',
        text: 'text-black',
        border: 'border-yellow-500',
        bgLight: 'bg-yellow-100',
        textLight: 'text-yellow-800',
        ring: 'ring-yellow-200',
        gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30',
        borderGradient: 'border-yellow-300 dark:border-yellow-700',
        shadowColor: 'shadow-yellow-200/50 dark:shadow-yellow-900/30'
      };
    case 'Unknown':
    default:
      return {
        bg: 'bg-gray-500',
        text: 'text-white',
        border: 'border-gray-500',
        bgLight: 'bg-gray-100',
        textLight: 'text-gray-800',
        ring: 'ring-gray-200',
        gradient: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
        borderGradient: 'border-gray-300 dark:border-gray-600',
        shadowColor: 'shadow-gray-200/50 dark:shadow-gray-700/30'
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

/**
 * Get integrated card styling for crime severity
 * @param severity The crime severity level
 * @param isSelected Whether the card is selected
 * @param isMatched Whether the card is matched
 * @returns Object with integrated styling for the entire card
 */
export function getSeverityCardStyling(severity?: CrimeSeverity, isSelected = false, isMatched = false) {
  const colors = getSeverityColors(severity);
  
  // Base styling
  let cardClasses = `${colors.gradient} ${colors.borderGradient} ${colors.shadowColor}`;
  
  // Override with selection/match states if needed
  if (isSelected || isMatched) {
    cardClasses = "border-blue-500 ring-2 ring-blue-200 shadow-lg bg-white dark:bg-gray-800";
  }
  
  return {
    cardClassName: cardClasses,
    severityDot: {
      className: `absolute top-3 right-3 w-3 h-3 rounded-full ${colors.bg} shadow-sm`,
      title: `Crime Severity: ${severity || 'Unknown'}`
    },
    severityText: {
      className: `text-xs font-medium ${colors.textLight} opacity-75`,
      text: severity || 'Unknown'
    }
  };
}

/**
 * Get subtle severity accent for crime text
 * @param severity The crime severity level
 * @returns Object with subtle accent styling
 */
export function getSeverityAccent(severity?: CrimeSeverity) {
  const colors = getSeverityColors(severity);
  return {
    borderLeft: `border-l-4 ${colors.border}`,
    textAccent: colors.textLight,
    bgAccent: colors.bgLight
  };
} 