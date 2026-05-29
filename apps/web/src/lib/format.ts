export const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

export function formatVnd(value: number) {
  return currencyFormatter.format(value);
}

export function formatShortMoney(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) return `${(absolute / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B đ`;
  if (absolute >= 1_000_000) return `${(absolute / 1_000_000).toFixed(1).replace(/\.0$/, '')}M đ`;
  if (absolute >= 1_000) return `${(absolute / 1_000).toFixed(0)}K đ`;
  return `${absolute.toLocaleString('vi-VN')} đ`;
}

export function formatVietnameseDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatDateShort(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('vi-VN').format(date);
}

export function formatRelativeTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  return `${diffDays} ngày trước`;
}