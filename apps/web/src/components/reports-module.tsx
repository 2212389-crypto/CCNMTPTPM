'use client';

import { useMemo, useState } from 'react';
import type { Database } from '@/lib/database.types';
import { fmtCurrency, fmtDate, getRangeMonths, monthLabel } from '@/lib/expense';
import { AppIcon } from '@/components/icons';
import { EmptyState, Spinner } from '@/components/ui-kit';
import Button from '@/components/button';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];

type Bucket = {
  label: string;
  income: number;
  expense: number;
};

function parseDate(value: string | null | undefined) {
  const date = new Date(value ?? '');
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function monthKey(value: string | null | undefined) {
  const date = parseDate(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function csvEscape(value: string | number | null | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function ReportsModule({ transactions }: { transactions: TransactionRow[] }) {
  const current = new Date();
  const [year, setYear] = useState(String(current.getFullYear()));
  const [month, setMonth] = useState(String(current.getMonth() + 1).padStart(2, '0'));
  const [exporting, setExporting] = useState(false);

  const months = useMemo(() => getRangeMonths(12), []);

  const filteredTransactions = useMemo(() => {
    const selectedKey = `${year}-${month}`;
    return transactions.filter((transaction) => monthKey(transaction.date ?? transaction.occurred_at) === selectedKey);
  }, [month, transactions, year]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (accumulator, transaction) => {
        const amount = Number(transaction.amount || 0);
        if (transaction.type === 'income') accumulator.income += amount;
        if (transaction.type === 'expense') accumulator.expense += amount;
        if (transaction.type === 'transfer') accumulator.transfer += amount;
        return accumulator;
      },
      { income: 0, expense: 0, transfer: 0 }
    );
  }, [filteredTransactions]);

  const lineData = useMemo<Bucket[]>(() => {
    return months.map(({ year: monthYear, month: monthNumber, label }) => {
      const key = `${monthYear}-${String(monthNumber).padStart(2, '0')}`;
      const monthTransactions = transactions.filter((transaction) => monthKey(transaction.date ?? transaction.occurred_at) === key);
      return {
        label,
        income: monthTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
        expense: monthTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
      };
    });
  }, [months, transactions]);

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filteredTransactions.forEach((transaction) => {
      if (transaction.type !== 'expense') return;
      const category = transaction.category ?? 'Khác';
      totals.set(category, (totals.get(category) ?? 0) + Number(transaction.amount || 0));
    });
    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6);
  }, [filteredTransactions]);

  const exportRows = filteredTransactions.map((transaction) => ({
    date: fmtDate(transaction.date ?? transaction.occurred_at),
    account: transaction.account_id,
    type: transaction.type,
    category: transaction.category ?? '',
    note: transaction.note ?? '',
    amount: Number(transaction.amount || 0)
  }));

  const exportCsv = () => {
    const header = ['date', 'account', 'type', 'category', 'note', 'amount'];
    const rows = [header.join(','), ...exportRows.map((row) => [row.date, row.account, row.type, row.category, row.note, row.amount].map(csvEscape).join(','))].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `expense-report-${year}-${month}.csv`);
  };

  const exportXlsx = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    downloadBlob(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `expense-report-${year}-${month}.xlsx`);
  };

  const exportPdf = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(`Expense Report ${monthLabel(Number(year), Number(month))}`, 14, 18);
    pdf.setFontSize(11);
    pdf.text(`Income: ${fmtCurrency(summary.income)} | Expense: ${fmtCurrency(summary.expense)} | Balance: ${fmtCurrency(summary.income - summary.expense)}`, 14, 28);
    autoTable(pdf, {
      startY: 36,
      head: [['Date', 'Account', 'Type', 'Category', 'Note', 'Amount']],
      body: exportRows.map((row) => [row.date, row.account, row.type, row.category, row.note, fmtCurrency(row.amount)]),
      styles: { fontSize: 9 }
    });
    pdf.save(`expense-report-${year}-${month}.pdf`);
  };

  const exportJpg = async () => {
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 900;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Cannot create canvas.');
      context.fillStyle = '#f8fafc';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#0f172a';
      context.font = 'bold 42px sans-serif';
      context.fillText(`Expense Report ${monthLabel(Number(year), Number(month))}`, 60, 90);
      context.font = '28px sans-serif';
      context.fillText(`Income: ${fmtCurrency(summary.income)}`, 60, 160);
      context.fillText(`Expense: ${fmtCurrency(summary.expense)}`, 60, 210);
      context.fillText(`Balance: ${fmtCurrency(summary.income - summary.expense)}`, 60, 260);
      context.font = '24px sans-serif';
      context.fillText('Top categories', 60, 330);
      categoryTotals.forEach((item, index) => {
        context.fillText(`${index + 1}. ${item.name} - ${fmtCurrency(item.value)}`, 80, 380 + index * 44);
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      downloadDataUrl(dataUrl, `expense-report-${year}-${month}.jpg`);
    } finally {
      setExporting(false);
    }
  };

  if (transactions.length === 0) {
    return <EmptyState title="Chưa có dữ liệu báo cáo" description="Tạo giao dịch đầu tiên để xem thống kê, biểu đồ và xuất báo cáo." icon={<AppIcon name="chart" className="h-7 w-7" />} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(236,72,153,0.08),rgba(14,165,233,0.08))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f766e]">Reports</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-main)]">Báo cáo chi tiêu</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Chọn tháng/năm để xem dòng tiền, biểu đồ theo tháng và xuất dữ liệu ra PDF, Excel, CSV hoặc JPG.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" leftIcon={<AppIcon name="file-pdf" className="h-4 w-4" />} onClick={exportPdf}>
              PDF
            </Button>
            <Button variant="secondary" leftIcon={<AppIcon name="table-export" className="h-4 w-4" />} onClick={exportXlsx}>
              Excel
            </Button>
            <Button variant="ghost" leftIcon={<AppIcon name="download" className="h-4 w-4" />} onClick={exportCsv}>
              CSV
            </Button>
            <Button variant="secondary" leftIcon={<AppIcon name="image" className="h-4 w-4" />} onClick={exportJpg} disabled={exporting}>
              {exporting ? <span className="inline-flex items-center gap-2"><Spinner /> Đang xuất JPG</span> : 'JPG'}
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric title="Tổng thu" value={fmtCurrency(summary.income)} />
          <Metric title="Tổng chi" value={fmtCurrency(summary.expense)} />
          <Metric title="Cân đối" value={fmtCurrency(summary.income - summary.expense)} />
          <Metric title="Số giao dịch" value={String(filteredTransactions.length)} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectCard label="Năm" value={year} onChange={setYear} options={[...new Set(months.map((item) => String(item.year)))].reverse()} />
        <SelectCard label="Tháng" value={month} onChange={setMonth} options={Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'))} />
        <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Bộ lọc hiện tại</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-main)]">{monthLabel(Number(year), Number(month))}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Dữ liệu đã lọc: {filteredTransactions.length} giao dịch</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">Dòng tiền 12 tháng</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">So sánh thu và chi theo tháng</p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(value) => fmtCurrency(Number(value))} />
                <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#ea580c" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">Danh mục chi tiêu</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Top 6 danh mục của tháng đang chọn</p>
            </div>
          </div>
          <div className="mt-6 h-80">
            {categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTotals} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                  <XAxis type="number" tickFormatter={(value) => fmtCurrency(Number(value))} />
                  <YAxis type="category" dataKey="name" width={110} />
                  <Tooltip formatter={(value) => fmtCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#0f766e" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="Chưa có chi tiêu" description="Không có giao dịch chi tiêu trong tháng này." icon={<AppIcon name="chart" className="h-7 w-7" />} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--text-main)]">{value}</p>
    </div>
  );
}

function SelectCard({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:bg-white/5">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
