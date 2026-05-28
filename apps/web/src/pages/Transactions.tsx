import { useState } from "react";
import useQueryState from "../hooks/useQueryState";
import { useListTransactionsQuery, useCreateTransactionMutation, useUpdateTransactionMutation, useDeleteTransactionMutation } from "../api/transactions.api";
import { useListAccountsQuery } from "../api/accounts.api";
import type { Transaction } from "../types";
import DataTable, { Column } from "../components/tables/DataTable";

interface TransactionForm {
  id?: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  note: string;
  occurredAt: string;
  accountId: string;
}

export default function Transactions() {
  const { page, setPage, limit, setLimit, sortBy, setSortBy, sortOrder, setSortOrder, q, setQ } =
    useQueryState({ page: 1, limit: 10, sortBy: "occurredAt", sortOrder: "desc", q: "" });

  const { data, isFetching, refetch } = useListTransactionsQuery({ page, limit, sortBy, sortOrder, q });
  const { data: accountsData } = useListAccountsQuery({ page: 1, limit: 100 });
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TransactionForm>({
    type: 'EXPENSE',
    amount: 0,
    note: '',
    occurredAt: new Date().toISOString().split('T')[0],
    accountId: ''
  });

  const rows: Transaction[] = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const accounts = accountsData?.items ?? [];

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setForm({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        note: transaction.note || '',
        occurredAt: new Date(transaction.occurredAt).toISOString().split('T')[0],
        accountId: transaction.accountId
      });
    } else {
      setEditingTransaction(null);
      setForm({
        type: 'EXPENSE',
        amount: 0,
        note: '',
        occurredAt: new Date().toISOString().split('T')[0],
        accountId: accounts[0]?.id || ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await updateTransaction({
          id: editingTransaction.id,
          ...form,
          occurredAt: new Date(form.occurredAt).toISOString()
        }).unwrap();
      } else {
        await createTransaction({
          ...form,
          occurredAt: new Date(form.occurredAt).toISOString()
        }).unwrap();
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Lỗi khi lưu giao dịch:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      try {
        await deleteTransaction(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Lỗi khi xóa giao dịch:', error);
        alert('Có lỗi xảy ra khi xóa giao dịch');
      }
    }
  };

  const columns: Column<Transaction & { actions?: string } & Record<string, unknown>>[] = [
    { 
      key: "occurredAt", 
      header: "Ngày", 
      sortable: true, 
      render: (r) => new Date(r.occurredAt).toLocaleDateString("vi-VN") 
    },
    { 
      key: "type", 
      header: "Loại", 
      sortable: true,
      render: (r) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: r.type === 'INCOME' ? '#DCFCE7' : '#FEE2E2',
          color: r.type === 'INCOME' ? '#166534' : '#991B1B'
        }}>
          {r.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
        </span>
      )
    },
    { 
      key: "amount", 
      header: "Số tiền", 
      sortable: true, 
      render: (r) => (
        <span style={{ 
          fontWeight: '500',
          color: r.type === 'INCOME' ? '#10B981' : '#EF4444'
        }}>
          {r.type === 'INCOME' ? '+' : '-'}{r.amount.toLocaleString("vi-VN")} VNĐ
        </span>
      )
    },
    { key: "note", header: "Ghi chú" },
    {
      key: "actions",
      header: "Thao tác",
      render: (r) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleOpenModal(r)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Xóa
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>Giao dịch</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm giao dịch..."
            style={{
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            + Thêm giao dịch
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
        <DataTable<Transaction & Record<string, unknown>>
          columns={columns}
          data={rows as (Transaction & Record<string, unknown>)[]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(key, order) => { setSortBy(key); setSortOrder(order); }}
          emptyText={isFetching ? "Đang tải..." : "Không có giao dịch nào"}
        />

        {/* Pagination */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #F3F4F6',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            Tổng: {total.toLocaleString("vi-VN")} giao dịch
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page <= 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: page <= 1 ? '#F9FAFB' : 'white',
                color: page <= 1 ? '#9CA3AF' : '#374151',
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Trước
            </button>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              Trang {page} / {totalPages}
            </span>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page >= totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: page >= totalPages ? '#F9FAFB' : 'white',
                color: page >= totalPages ? '#9CA3AF' : '#374151',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sau
            </button>
            <select 
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              style={{
                marginLeft: '12px',
                padding: '6px 8px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#374151' }}>
              {editingTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Loại giao dịch
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value as 'INCOME' | 'EXPENSE'})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="EXPENSE">Chi tiêu</option>
                  <option value="INCOME">Thu nhập</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: Number(e.target.value)})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Ngày giao dịch
                </label>
                <input
                  type="date"
                  value={form.occurredAt}
                  onChange={(e) => setForm({...form, occurredAt: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Tài khoản
                </label>
                <select
                  value={form.accountId}
                  onChange={(e) => setForm({...form, accountId: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Chọn tài khoản</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Ghi chú
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({...form, note: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {editingTransaction ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
