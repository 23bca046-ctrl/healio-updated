/**
 * Utility function to merge CSS class names
 * Similar to clsx or classnames library
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter((cls): cls is string => {
      return typeof cls === 'string' && cls.length > 0;
    })
    .map((cls) => cls.trim())
    .filter((cls) => cls.length > 0)
    .join(' ');
}

/**
 * Example usage:
 * cn('px-4 py-2', isDarkMode && 'bg-dark text-white', error && 'border-red-500')
 * => "px-4 py-2 bg-dark text-white border-red-500"
 */
