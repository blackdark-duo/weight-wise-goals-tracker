
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
  
  return `# ${type.toUpperCase()}\n${header}\n${rows.join('\n')}`;
};

// Function to parse CSV data
export const parseCSV = (csv: string) => {
  const result: { weightEntries: any[], goals: any[] } = {
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
      if (line.includes('WEIGHT')) {
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
    
    if (currentSection) {
      const values = line.split(',');
      
      // Check if it's a header row or data row
      if ((currentSection === 'weightEntries' && result.weightEntries.length === 0) ||
          (currentSection === 'goals' && result.goals.length === 0)) {
        // It's a header row, store it for reference
        result[`${currentSection}Columns`] = values;
      } else {
        // It's a data row
        const dataObject = {};
        if (result[`${currentSection}Columns`]) {
          result[`${currentSection}Columns`].forEach((column, index) => {
            if (index < values.length) {
              dataObject[column] = values[index];
            }
          });
          result[currentSection].push(dataObject);
        }
      }
    }
  }
  
  return result;
};

// Create a complete CSV with both weight entries and goals
export const createCompleteCSV = (weightEntries: any[], goals: any[]) => {
  // Define fields for each section
  const weightFields = ['id', 'user_id', 'date', 'time', 'weight', 'unit', 'description', 'created_at'];
  const goalFields = ['id', 'user_id', 'start_weight', 'target_weight', 'target_date', 'unit', 'achieved', 'created_at', 'updated_at'];
  
  // Create CSV for each section
  const weightCSV = convertToCSV(weightEntries, weightFields, 'WEIGHT ENTRIES');
  const goalsCSV = convertToCSV(goals, goalFields, 'GOALS');
  
  // Combine both sections
  return `${weightCSV}\n\n${goalsCSV}`;
};
