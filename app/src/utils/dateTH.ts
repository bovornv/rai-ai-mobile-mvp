/**
 * Thai date formatting utilities
 * Formats dates in Thai Buddhist Era (BE) format
 */

export function formatThaiDateBE(date = new Date()): string {
  try {
    // Validate date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }
    
    // th-TH locale shows Buddhist Era automatically
    try {
      return date.toLocaleDateString("th-TH", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      });
    } catch (error) {
      // Fallback if locale string fails
      return `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear() + 543}`;
    }
  } catch (error) {
    console.error('Error formatting Thai date:', error);
    return new Date().toLocaleDateString("th-TH");
  }
}

export function formatThaiTime(date = new Date()): string {
  try {
    // Validate date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }
    
    try {
      return date.toLocaleTimeString("th-TH", { 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: false 
      });
    } catch (error) {
      // Fallback if locale string fails
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  } catch (error) {
    console.error('Error formatting Thai time:', error);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
