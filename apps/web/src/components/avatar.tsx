import { AppIcon } from '@/components/icons';

export default function Avatar({ name, imageUrl, size = 56 }: { name: string; imageUrl?: string | null; size?: number }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (imageUrl) {
    return <img src={imageUrl} alt={name} width={size} height={size} className="rounded-2xl object-cover shadow-[0_10px_30px_rgba(15,23,42,0.12)]" />;
  }

  return (
    <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0ea5e9] via-[#14b8a6] to-[#f59e0b] font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]" style={{ width: size, height: size }}>
      {initials || <AppIcon name="user" className="h-5 w-5" />}
    </div>
  );
}
