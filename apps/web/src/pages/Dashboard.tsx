import { useMonthlySummaryQuery } from "../api/reports.api";
import { useListTransactionsQuery } from "../api/transactions.api";
import { useListAccountsQuery } from "../api/accounts.api";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const year = new Date().getFullYear();
  const { data: monthlyData } = useMonthlySummaryQuery({ year });
  const { data: transactionsData } = useListTransactionsQuery({ page: 1, limit: 5, sortBy: "occurredAt", sortOrder: "desc" });
  const { data: accountsData } = useListAccountsQuery({ page: 1, limit: 10 });

  // Tính số dư tích lũy cho Dashboard
  let cumulativeBalance = 0;
  const chartData = (monthlyData ?? []).map(d => {
    const monthIncome = Number(d.income ?? 0);
    const monthExpense = Number(d.expense ?? 0);
    
    // Cộng vào số dư tích lũy nếu tháng có dữ liệu thực tế
    if (monthIncome > 0 || monthExpense > 0) {
      cumulativeBalance += (monthIncome - monthExpense);
    }
    
    return {
      month: `Tháng ${d.month}`,
      income: monthIncome,
      expense: monthExpense,
      balance: cumulativeBalance, // Luôn hiển thị số dư tích lũy (giữ nguyên giá trị cuối)
    };
  });

  // Tính tổng thu chi
  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = chartData.reduce((sum, item) => sum + item.expense, 0);
  const balance = totalIncome - totalExpense;

  // Dữ liệu cho biểu đồ tròn
  const pieData = [
    { name: 'Thu nhập', value: totalIncome, color: '#10B981' },
    { name: 'Chi tiêu', value: totalExpense, color: '#EF4444' },
    { name: 'Số dư', value: balance > 0 ? balance : 0, color: '#6366F1' }
  ];

  const recentTransactions = transactionsData?.items ?? [];
  const accounts = accountsData?.items ?? [];

  return (
    <div className="space-y-6" style={{ padding: '24px' }}>
      {/* Thống kê tổng quan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h3 style={{ color: '#10B981', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>TỔNG THU NHẬP</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
            {totalIncome.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h3 style={{ color: '#EF4444', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>TỔNG CHI TIÊU</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>
            {totalExpense.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h3 style={{ color: balance >= 0 ? '#10B981' : '#EF4444', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>SỐ DƯ</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: balance >= 0 ? '#10B981' : '#EF4444' }}>
            {balance.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <h3 style={{ color: '#6B7280', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>TÀI KHOẢN</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151' }}>
            {accounts.length}
          </p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Biểu đồ đường */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Thu chi và số dư theo tháng
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toLocaleString('vi-VN')} VNĐ`, 
                  name === 'income' ? 'Thu nhập' : name === 'expense' ? 'Chi tiêu' : name === 'balance' ? 'Số dư' : name
                ]}
              />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Thu nhập" />
              <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name="Chi tiêu" />
              <Line type="monotone" dataKey="balance" stroke="#6366F1" strokeWidth={2} strokeDasharray="3 3" name="Số dư" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ tròn */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            Tỷ lệ thu chi và số dư
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} VNĐ`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px' }}>
            {pieData.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: entry.color, marginRight: '8px', borderRadius: '2px' }}></div>
                <span style={{ fontSize: '14px', color: '#374151' }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Giao dịch gần đây */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
          Giao dịch gần đây
        </h3>
        {recentTransactions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Ngày</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Loại</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Tài khoản</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Số tiền</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => {
                  const account = accounts.find(a => a.id === transaction.accountId);
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                        {new Date(transaction.occurredAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: transaction.type === 'INCOME' ? '#DCFCE7' : '#FEE2E2',
                          color: transaction.type === 'INCOME' ? '#166534' : '#991B1B'
                        }}>
                          {transaction.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                        {account?.name || 'N/A'}
                      </td>
                      <td style={{ 
                        padding: '12px 8px', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        textAlign: 'right',
                        color: transaction.type === 'INCOME' ? '#10B981' : '#EF4444'
                      }}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{transaction.amount.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6B7280' }}>
                        {transaction.note || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6B7280', padding: '32px' }}>Chưa có giao dịch nào</p>
        )}
      </div>
    </div>
  );
}
