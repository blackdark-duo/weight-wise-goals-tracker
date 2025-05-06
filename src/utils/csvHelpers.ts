
// Function to convert JSON to CSV
export const convertToCSV = (data: any[], fields: string[], type: string) => {
  // Create header row
  const header = fields.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return fields.map(field => {
      let value = item[field] || '';
      // If the value contains commas, quotes, or newlines, wrap it in quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

// Function to parse CSV data
export const parseCSV = (csv: string) => {
  const result: { weightEntries: any[], goals: any[], weightEntriesColumns?: string[], goalsColumns?: string[] } = {
    weightEntries: [],
    goals: []
  };
  
  let currentSection = '';
  const lines = csv.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for section headers
    if (line.startsWith('#')) {
      if (line.includes('WEIGHT ENTRIES')) {
        currentSection = 'weightEntries';
        continue;
      } else if (line.includes('GOALS')) {
        currentSection = 'goals';
        continue;
      } else {
        // Skip other comments
        continue;
      }
    }
    
    // Process data lines
    if (currentSection) {
      // First line after section header is the column names
      if (result[currentSection].length === 0) {
        // Store column names
        result[`${currentSection}Columns`] = line.split(',');
      } else {
        // Parse data row
        const values = line.split(',');
        
        if (values.length > 1) { // Make sure it's a valid data row
          const dataObject = {};
          result[`${currentSection}Columns`].forEach((column, index) => {
            dataObject[column] = values[index] || '';
          });
          result[currentSection].push(dataObject);
        }
      }
    }
  }
  
  return result;
};
