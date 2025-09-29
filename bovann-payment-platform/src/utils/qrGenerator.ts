import QRCode from 'qrcode';

export const generateQR = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data);
  } catch (err) {
    throw new Error('Failed to generate QR code');
  }
};