import { useState } from 'react';
import useQueryState from "../hooks/useQueryState";
import { useListAccountsQuery, useCreateAccountMutation, useDeleteAccountMutation } from '../api/accounts.api';
import type { Account } from '../types';
import DataTable, { Column } from '../components/tables/DataTable';

interface AccountForm {
  id?: string;
  name: string;
  currency: string;
}

export default function Accounts() {
  const { page, setPage, limit, setLimit, sortBy, setSortBy, sortOrder, setSortOrder, q, setQ } =
    useQueryState({ page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc", q: "" });

  const { data, isFetching, refetch } = useListAccountsQuery({ page, limit, sortBy, sortOrder, q });
  const [createAccount] = useCreateAccountMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AccountForm>({
    name: '',
    currency: 'VND'
  });

  const rows: Account[] = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const handleOpenModal = () => {
    setForm({
      name: '',
      currency: 'VND'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount({
        ...form,
        currency: 'VND' // Luôn gửi VND
      }).unwrap();
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Lỗi khi lưu tài khoản:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await deleteAccount(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Lỗi khi xóa tài khoản:', error);
        alert('Có lỗi xảy ra khi xóa tài khoản');
      }
    }
  };

  const columns: Column<Account & { actions?: string } & Record<string, unknown>>[] = [
    { 
      key: "name", 
      header: "Tên tài khoản", 
      sortable: true,
      render: (r) => (
        <span style={{ fontWeight: '500', color: '#374151' }}>
          {r.name}
        </span>
      )
    },
    { 
      key: "currency", 
      header: "Tiền tệ", 
      sortable: true,
      render: (r) => (
        <span style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: '#F3F4F6',
          color: '#374151'
        }}>
          {r.currency}
        </span>
      )
    },
    { 
      key: "createdAt", 
      header: "Ngày tạo", 
      sortable: true, 
      render: (r) => new Date(r.createdAt).toLocaleDateString("vi-VN") 
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (r) => (
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
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>Tài khoản</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm tài khoản..."
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
            + Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
        <DataTable<Account & Record<string, unknown>>
          columns={columns}
          data={rows as (Account & Record<string, unknown>)[]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(key, order) => { setSortBy(key); setSortOrder(order); }}
          emptyText={isFetching ? "Đang tải..." : "Không có tài khoản nào"}
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
            Tổng: {total.toLocaleString("vi-VN")} tài khoản
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
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#374151' }}>
              Thêm tài khoản mới
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Tên tài khoản
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required
                  placeholder="Ví dụ: Tiền mặt, Ngân hàng..."
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
                  Tiền tệ
                </label>
                <input
                  type="text"
                  value="VND - Việt Nam Đồng"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280'
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
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
