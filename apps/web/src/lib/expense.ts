export type AccountTypeKey = 'cash' | 'bank' | 'credit' | 'e_wallet' | 'savings';
export type TransactionTypeKey = 'income' | 'expense' | 'transfer';

export const ACCOUNT_TYPES: Array<{ value: AccountTypeKey; label: string; description: string; accent: string }> = [
  { value: 'cash', label: 'Tiền mặt', description: 'Dòng tiền sẵn có', accent: 'bg-emerald-500' },
  { value: 'bank', label: 'Ngân hàng', description: 'Tài khoản thanh toán', accent: 'bg-sky-500' },
  { value: 'credit', label: 'Tín dụng', description: 'Thẻ tín dụng / hạn mức', accent: 'bg-rose-500' },
  { value: 'e_wallet', label: 'Ví điện tử', description: 'Momo, ZaloPay, VNPay', accent: 'bg-violet-500' },
  { value: 'savings', label: 'Tiết kiệm', description: 'Khoản dự phòng', accent: 'bg-amber-500' }
] as const;

export const TRANSACTION_TYPES: Array<{ value: TransactionTypeKey; label: string; accent: string }> = [
  { value: 'income', label: 'Thu nhập', accent: 'text-emerald-600' },
  { value: 'expense', label: 'Chi tiêu', accent: 'text-rose-600' },
  { value: 'transfer', label: 'Chuyển khoản', accent: 'text-sky-600' }
] as const;

export const CATEGORY_OPTIONS: Array<{ value: string; label: string; accent: string }> = [
  { value: 'Ăn uống', label: 'Ăn uống', accent: 'bg-orange-500' },
  { value: 'Di chuyển', label: 'Di chuyển', accent: 'bg-sky-500' },
  { value: 'Mua sắm', label: 'Mua sắm', accent: 'bg-fuchsia-500' },
  { value: 'Giải trí', label: 'Giải trí', accent: 'bg-indigo-500' },
  { value: 'Y tế', label: 'Y tế', accent: 'bg-emerald-500' },
  { value: 'Học tập', label: 'Học tập', accent: 'bg-cyan-500' },
  { value: 'Nhà ở', label: 'Nhà ở', accent: 'bg-violet-500' },
  { value: 'Tiết kiệm', label: 'Tiết kiệm', accent: 'bg-amber-500' },
  { value: 'Khác', label: 'Khác', accent: 'bg-slate-500' }
] as const;

export const BUDGET_SCOPES = [
  { value: 'monthly', label: 'Theo tháng' },
  { value: 'yearly', label: 'Theo năm' },
  { value: 'category', label: 'Theo danh mục' }
] as const;

export function fmtCurrency(value: number | string | null | undefined, currency = 'VND') {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function fmtDate(value: string | null | undefined) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
}

export function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

export function getRangeMonths(count = 12) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (count - index - 1));
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
    };
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
