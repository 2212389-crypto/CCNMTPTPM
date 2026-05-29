type IconName =
  | 'dashboard'
  | 'wallet'
  | 'exchange'
  | 'chart'
  | 'target'
  | 'shield'
  | 'settings'
  | 'user'
  | 'logout'
  | 'menu'
  | 'edit'
  | 'trash'
  | 'file-pdf'
  | 'table-export'
  | 'download'
  | 'image';

const pathMap: Record<IconName, string> = {
  dashboard: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v3A1.5 1.5 0 0 1 8.5 10h-3A1.5 1.5 0 0 1 4 8.5v-3Zm10 0A1.5 1.5 0 0 1 15.5 4h3A1.5 1.5 0 0 1 20 5.5v3A1.5 1.5 0 0 1 18.5 10h-3A1.5 1.5 0 0 1 14 8.5v-3ZM4 15.5A1.5 1.5 0 0 1 5.5 14h3A1.5 1.5 0 0 1 10 15.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3Zm10 0A1.5 1.5 0 0 1 15.5 14h3A1.5 1.5 0 0 1 20 15.5v3A1.5 1.5 0 0 1 18.5 20h-3A1.5 1.5 0 0 1 14 18.5v-3Z',
  wallet: 'M3.5 7A2.5 2.5 0 0 1 6 4.5h12A2.5 2.5 0 0 1 20.5 7v10A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V7Zm4-1.5A1.5 1.5 0 1 0 9 8.5a1.5 1.5 0 0 0-1.5-3Z M14 11h3',
  exchange: 'M7 6h12M15 3l4 3-4 3M17 18H5m4 3-4-3 4-3',
  chart: 'M5 19.5h14M7 16v-4m4 4V8m4 8v-6',
  target: 'M12 20a8 8 0 1 1 8-8m-8 0a4 4 0 1 1 4 4m-4-4h8',
  shield: 'M12 3.5 19 6.5v5.5c0 4.6-3.1 8.7-7 9.5-3.9-.8-7-4.9-7-9.5V6.5L12 3.5Z',
  settings: 'M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0-5 1.2 2.4 2.8.4.3 2.8 2.4 1.2-1.2 2.4 1.2 2.4-2.4 1.2-.3 2.8-2.8.4L12 21l-1.2-2.4-2.8-.4-.3-2.8-2.4-1.2 1.2-2.4-1.2-2.4 2.4-1.2.3-2.8 2.8-.4L12 3.5Z',
  user: 'M12 12.5a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-6.5 7a6.5 6.5 0 0 1 13 0',
  logout: 'M10 17.5H6.5A2.5 2.5 0 0 1 4 15V9A2.5 2.5 0 0 1 6.5 6.5H10M14 8l4 4-4 4M18 12H9',
  edit: 'M4 20.5v-3.1L14.9 6.5l3.1 3.1L7.1 20.5H4Zm10.4-13.1l3.1 3.1',
  trash: 'M6.5 7.5h11M8 7.5V18.5M16 7.5V18.5M9.5 7.5V5.5h5V7.5M5.5 5.5h13',
  'file-pdf': 'M14 3.5h-6A2.5 2.5 0 0 0 5.5 6v12A2.5 2.5 0 0 0 8 20.5h8A2.5 2.5 0 0 0 18.5 18V8l-6-4.5ZM14 3.5v4h4',
  'table-export': 'M4 7h16M4 12h16M4 17h16M8 4v16M16 4v16',
  download: 'M12 4v10m0 0l-4-4m4 4l4-4M4 18h16',
  image: 'M4 6.5h16v11H4v-11Zm1.5 2.5 3 3 2-2 4 4 3-3 3 3',
  menu: 'M4 7h16M4 12h16M4 17h16'
};

export function AppIcon({ name, className = '' }: { name: IconName; className?: string }) {
  const stroke = name === 'shield' ? 1.8 : 1.9;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={pathMap[name]} />
    </svg>
  );
}

export type { IconName };