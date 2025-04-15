/**
 * Export data to CSV file and download it
 * @param data Array of objects to export
 * @param fileName Name for the CSV file (without extension)
 */
export const exportToCSV = <T extends Record<string, any>>(data: T[], fileName: string): void => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  try {
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    let csvContent = headers.join(',') + '\n';
    
    // Create rows
    data.forEach(item => {
      const row = headers.map(header => {
        // Convert value to string and handle special cases
        let cellValue = item[header] === null || item[header] === undefined 
          ? '' 
          : item[header].toString();
        
        // Escape quotes and wrap in quotes if contains comma, newline or quotes
        if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
          cellValue = `"${cellValue.replace(/"/g, '""')}"`;
        }
        
        return cellValue;
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Setup the download link
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to document, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
  }
};

/**
 * Export data to Excel format
 * @param data Array of objects to export
 * @param fileName Name for the Excel file (without extension)
 * @param sheetName Name of the sheet
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[], 
  fileName: string,
  sheetName: string = 'Sheet1'
): void => {
  // Use a library like SheetJS/xlsx if needed for actual Excel export
  // For now, we'll just use CSV since it's simpler and works well for most cases
  exportToCSV(data, fileName);
};
