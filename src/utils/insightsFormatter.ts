
/**
 * Formats plain text from the webhook response into attractive HTML with styling
 */
export const formatInsightsText = (text: string): string => {
  if (!text) return "";
  
  // Handle simple markdown-like formatting
  let formattedText = text
    // Format headers
    .replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold mb-3 text-emerald-700">$1</h2>')
    .replace(/^## (.*$)/gm, '<h3 class="text-lg font-bold mb-2 text-emerald-600">$1</h3>')
    .replace(/^### (.*$)/gm, '<h4 class="text-base font-bold mb-2 text-emerald-500">$1</h4>')
    .replace(/^([A-Z\s]+)$/gm, '<h2 class="text-xl font-bold mb-3 text-emerald-700">$1</h2>')
    
    // Format bold, italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Format lists
    .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
    
    // Format paragraphs
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<li')) {
        return para;
      }
      // Wrap consecutive list items in a ul tag
      if (para.includes('<li')) {
        return `<ul class="mb-4">${para}</ul>`;
      }
      return `<p class="mb-3">${para}</p>`;
    })
    .join('\n')
    
    // Highlight important metrics
    .replace(/(\d+\.?\d*)\s?(kg|lbs)/g, '<span class="font-semibold text-emerald-700">$1 $2</span>')
    .replace(/(lost|gained)\s+(\d+\.?\d*)/gi, '$1 <span class="font-semibold text-emerald-700">$2</span>')
    
    // Create sections with borders
    .replace(/<h2/g, '<div class="border-t pt-3 mt-3 border-emerald-200 first:border-0 first:mt-0"><h2')
    .replace(/<\/p>\s*(?=<h2|$)/g, '</p></div>')
    
    // Normalize excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
  
  return formattedText;
};
