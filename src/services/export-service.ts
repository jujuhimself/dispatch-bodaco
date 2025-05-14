import { saveAs } from 'file-saver';
import { parseISO, format } from 'date-fns';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Define supported export formats
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

// Generic data export function
export async function exportData<T>(
  data: T[],
  format: ExportFormat,
  filename: string,
  options?: {
    headers?: string[];
    title?: string;
    dateFields?: string[];
    transformer?: (item: T) => any;
  }
) {
  if (!data.length) {
    throw new Error('No data to export');
  }
  
  const now = new Date();
  const timestamp = format(now, 'yyyy-MM-dd_HH-mm');
  const fullFilename = `${filename}_${timestamp}`;
  
  try {
    switch (format) {
      case 'csv':
        return exportCSV(data, fullFilename, options);
      case 'excel':
        return exportExcel(data, fullFilename, options);
      case 'json':
        return exportJSON(data, fullFilename, options);
      case 'pdf':
        return exportPDF(data, fullFilename, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

// CSV Export
function exportCSV<T>(data: T[], filename: string, options?: { headers?: string[]; transformer?: (item: T) => any; dateFields?: string[] }) {
  // Transform data if needed
  let processedData = data;
  if (options?.transformer) {
    processedData = data.map(options.transformer);
  }
  
  // Format date fields
  if (options?.dateFields) {
    processedData = processedData.map(item => {
      const newItem = { ...item };
      options.dateFields!.forEach(field => {
        if ((newItem as any)[field]) {
          try {
            const date = parseISO((newItem as any)[field]);
            (newItem as any)[field] = format(date, 'yyyy-MM-dd HH:mm:ss');
          } catch (e) {
            // Keep original if parsing fails
          }
        }
      });
      return newItem;
    });
  }
  
  const csv = Papa.unparse({
    fields: options?.headers || Object.keys(processedData[0] || {}),
    data: processedData
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
  
  return Promise.resolve(true);
}

// Excel Export
function exportExcel<T>(data: T[], filename: string, options?: { headers?: string[]; transformer?: (item: T) => any; dateFields?: string[] }) {
  // Transform data if needed
  let processedData = data;
  if (options?.transformer) {
    processedData = data.map(options.transformer);
  }
  
  // Format date fields
  if (options?.dateFields) {
    processedData = processedData.map(item => {
      const newItem = { ...item };
      options.dateFields!.forEach(field => {
        if ((newItem as any)[field]) {
          try {
            const date = parseISO((newItem as any)[field]);
            (newItem as any)[field] = format(date, 'yyyy-MM-dd HH:mm:ss');
          } catch (e) {
            // Keep original if parsing fails
          }
        }
      });
      return newItem;
    });
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(processedData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
  
  return Promise.resolve(true);
}

// JSON Export
function exportJSON<T>(data: T[], filename: string, options?: { transformer?: (item: T) => any }) {
  // Transform data if needed
  let processedData = data;
  if (options?.transformer) {
    processedData = data.map(options.transformer);
  }
  
  const json = JSON.stringify(processedData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
  
  return Promise.resolve(true);
}

// PDF Export
async function exportPDF<T>(data: T[], filename: string, options?: { title?: string; transformer?: (item: T) => any }) {
  // For PDF export, we'll use a dynamic import to reduce initial bundle size
  try {
    const { jsPDF } = await import('jspdf');
    const { autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Add title if provided
    if (options?.title) {
      doc.text(options.title, 14, 15);
    }
    
    // Transform data if needed
    let processedData = data;
    if (options?.transformer) {
      processedData = data.map(options.transformer);
    }
    
    // Prepare data for autotable
    const tableData = processedData.map(item => Object.values(item));
    const headers = Object.keys(processedData[0] || {});
    
    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: options?.title ? 20 : 10,
    });
    
    // Save PDF
    doc.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('PDF export failed. PDF generation library could not be loaded.');
  }
}
