export interface ScanCardDto {
  qrData: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  studentName?: string;
  institution?: string;
}
