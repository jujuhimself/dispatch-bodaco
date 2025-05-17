
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

// Define export formats
export type ExportFormat = 'pdf' | 'csv' | 'xlsx';

// Define a generic function to export data
export const exportData = async <T extends Record<string, any>>(
  data: T[],
  format: ExportFormat,
  options: {
    filename?: string;
    title?: string;
    sheetName?: string;
    headers?: {key: string, label: string}[];
  } = {}
) => {
  // Default options
  const filename = options.filename || `export-${new Date().toISOString().slice(0, 10)}`;
  const title = options.title || 'Exported Data';
  
  // Choose the export function based on format
  switch (format) {
    case 'pdf':
      return exportToPdf(data, {
        ...options,
        filename: filename + '.pdf',
        title
      });
    case 'csv':
      return exportToCsv(data, {
        ...options,
        filename: filename + '.csv'
      });
    case 'xlsx':
      return exportToExcel(data, {
        ...options,
        filename: filename + '.xlsx',
        sheetName: options.sheetName || 'Sheet1'
      });
    default:
      throw new Error('Unsupported export format');
  }
};

// Export to PDF
const exportToPdf = <T extends Record<string, any>>(
  data: T[],
  options: {
    filename: string;
    title: string;
    headers?: {key: string, label: string}[];
  }
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.text(options.title, 14, 15);
  
  // Prepare headers and table data
  const headers = options.headers || 
    Object.keys(data[0] || {}).map(key => ({
      key, 
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  
  const tableData = data.map(item => 
    headers.map(header => item[header.key]?.toString() || '')
  );
  
  // Create table
  (doc as any).autoTable({
    head: [headers.map(header => header.label)],
    body: tableData,
    startY: 20,
    margin: { top: 20 }
  });
  
  // Save the PDF
  doc.save(options.filename);
};

// Export to CSV
const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  options: {
    filename: string;
    headers?: {key: string, label: string}[];
  }
) => {
  // Prepare headers
  const headers = options.headers || 
    Object.keys(data[0] || {}).map(key => ({
      key, 
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  
  // Create header row
  const headerRow = headers.map(header => `"${header.label}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => 
    headers.map(header => {
      const value = item[header.key];
      return `"${value !== undefined && value !== null ? value.toString().replace(/"/g, '""') : ''}"`;
    }).join(',')
  ).join('\n');
  
  // Combine header and data
  const csvContent = `${headerRow}\n${dataRows}`;
  
  // Create file and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  FileSaver.saveAs(blob, options.filename);
};

// Export to Excel
const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  options: {
    filename: string;
    sheetName: string;
    headers?: {key: string, label: string}[];
  }
) => {
  // Prepare headers
  const headers = options.headers || 
    Object.keys(data[0] || {}).map(key => ({
      key, 
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  
  // Create worksheet data
  const worksheetData = [
    // Header row
    headers.map(header => header.label),
    // Data rows
    ...data.map(item => 
      headers.map(header => item[header.key])
    )
  ];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName);
  
  // Create file and download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  FileSaver.saveAs(blob, options.filename);
};
