import { randomBytes } from 'crypto';

const MIN_AMOUNT = 2_000;
const MAX_AMOUNT = 500_000_000;

export function parseCheckoutAmount(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < MIN_AMOUNT || n > MAX_AMOUNT) return null;
  return n;
}

export function sanitizeTransferMemo(input: string): string {
  const alnum = input.replace(/[^a-zA-Z0-9]/g, '');
  return alnum.slice(0, 48);
}

export function generateOrderCode(): string {
  const tail = randomBytes(2).readUInt16BE(0) % 1000;
  return `INV-${Date.now()}-${tail.toString().padStart(3, '0')}`;
}

export function generatePaymentMemo(): string {
  const hex = randomBytes(8).toString('hex').toUpperCase();
  return `PAY${hex}`;
}

export function buildVietQrImageUrl(opts: {
  bankBin: string;
  accountNo: string;
  amount: number;
  addInfo: string;
  accountName: string;
  template?: string;
}): string {
  const template = opts.template ?? 'compact2';
  const path = `${opts.bankBin}-${opts.accountNo}-${template}.png`;
  const q = new URLSearchParams();
  q.set('amount', String(opts.amount));
  q.set('addInfo', sanitizeTransferMemo(opts.addInfo));
  q.set('accountName', opts.accountName);
  return `https://img.vietqr.io/image/${path}?${q.toString()}`;
}

export function getCheckoutBankConfig(): {
  bankBin: string;
  accountNo: string;
  accountName: string;
  bankName: string;
  bankFullName: string;
  qrTemplate: string;
} | null {
  const bankBin = process.env.VIETQR_BANK_BIN?.trim();
  const accountNo = process.env.VIETQR_ACCOUNT_NUMBER?.trim();
  const accountName = process.env.VIETQR_ACCOUNT_NAME?.trim();
  if (!bankBin || !accountNo || !accountName) return null;
  return {
    bankBin,
    accountNo,
    accountName,
    bankName: process.env.VIETQR_BANK_NAME?.trim() || 'Bank',
    bankFullName:
      process.env.VIETQR_BANK_FULL_NAME?.trim() ||
      process.env.VIETQR_BANK_NAME?.trim() ||
      '',
    qrTemplate: process.env.VIETQR_QR_TEMPLATE?.trim() || 'compact2',
  };
}
