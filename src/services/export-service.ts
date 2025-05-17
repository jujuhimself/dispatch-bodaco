
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv'
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
}

export interface TableData {
  headers: string[];
  data: any[][];
}

export function exportData(data: TableData, format: ExportFormat, options: ExportOptions = {}) {
  const { filename = 'export', sheetName = 'Sheet1' } = options;
  
  switch (format) {
    case ExportFormat.PDF:
      return exportToPdf(data, options);
    case ExportFormat.EXCEL:
      return exportToExcel(data, filename, sheetName);
    case ExportFormat.CSV:
      return exportToCsv(data, filename);
    default:
      throw new Error('Unsupported export format');
  }
}

// Export emergency data in various formats
export function exportEmergenciesData(emergencies: any[], format: ExportFormat, options: ExportOptions = {}) {
  const headers = [
    'ID',
    'Type',
    'Location',
    'Status',
    'Priority',
    'Reported At',
    'Resolved At'
  ];
  
  const data = emergencies.map(emergency => [
    emergency.id,
    emergency.type,
    emergency.location,
    emergency.status,
    emergency.priority,
    formatDate(emergency.reported_at),
    emergency.resolved_at ? formatDate(emergency.resolved_at) : 'N/A'
  ]);
  
  return exportData({ headers, data }, format, {
    filename: 'emergencies-report',
    sheetName: 'Emergencies',
    title: 'Emergency Reports',
    ...options
  });
}

// Export responder data in various formats
export function exportRespondersData(responders: any[], format: ExportFormat, options: ExportOptions = {}) {
  const headers = [
    'ID',
    'Name',
    'Type',
    'Status',
    'Location',
    'Last Active'
  ];
  
  const data = responders.map(responder => [
    responder.id,
    responder.name,
    responder.type,
    responder.status,
    responder.current_location || 'Unknown',
    formatDate(responder.last_active)
  ]);
  
  return exportData({ headers, data }, format, {
    filename: 'responders-report',
    sheetName: 'Responders',
    title: 'Responder Status Report',
    ...options
  });
}

// Helper function to format dates
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Export to PDF
function exportToPdf(data: TableData, options: ExportOptions): void {
  const { 
    filename = 'export', 
    title = 'Report', 
    subtitle = '', 
    orientation = 'portrait',
    pageSize = 'a4'
  } = options;
  
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, 14, 30);
  }
  
  // Add date
  const dateText = `Generated: ${new Date().toLocaleString()}`;
  doc.setFontSize(10);
  doc.text(dateText, 14, orientation === 'portrait' ? 40 : 35);
  
  // Add table
  doc.autoTable({
    head: [data.headers],
    body: data.data,
    startY: orientation === 'portrait' ? 45 : 40,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    styles: {
      cellPadding: 3,
      fontSize: 10
    }
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
}

// Export to Excel
function exportToExcel(data: TableData, filename: string, sheetName: string): void {
  const worksheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.data]);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(dataBlob, `${filename}.xlsx`);
}

// Export to CSV
function exportToCsv(data: TableData, filename: string): void {
  const csvData = [data.headers, ...data.data];
  const csvString = Papa.unparse(csvData);
  const csvBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Save file
  saveAs(csvBlob, `${filename}.csv`);
}
