import { useState } from "react";
import { useMonthlySummaryQuery } from "../api/reports.api";
import { useListTransactionsQuery } from "../api/transactions.api";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function Reports() {
  const yearNow = new Date().getFullYear();
  const [year, setYear] = useState(yearNow);
  const { data } = useMonthlySummaryQuery({ year });
  const { data: transactionsData } = useListTransactionsQuery({ page: 1, limit: 1000 }); // Lấy tất cả transactions

  // Tính số dư tích lũy theo tháng
  let cumulativeBalance = 0;
  const rows = (data ?? []).map((d) => {
    const monthIncome = Number(d.income ?? 0);
    const monthExpense = Number(d.expense ?? 0);
    const monthNet = monthIncome - monthExpense;
    cumulativeBalance += monthNet; // Cộng dồn số dư

    return {
      month: `Tháng ${d.month}`,
      income: monthIncome,
      expense: monthExpense,
      net: monthNet,
      balance: cumulativeBalance, // Số dư tích lũy
    };
  });

  const totalIncome = rows.reduce((s, r) => s + r.income, 0);
  const totalExpense = rows.reduce((s, r) => s + r.expense, 0);
  const totalNet = totalIncome - totalExpense;

  // Dữ liệu cho biểu đồ tròn
  const pieData = [
    { name: 'Thu nhập', value: totalIncome, color: '#10B981' },
    { name: 'Chi tiêu', value: totalExpense, color: '#EF4444' },
    { name: 'Tiết kiệm', value: totalNet > 0 ? totalNet : 0, color: '#F59E0B' }
  ];

  // Dữ liệu cho biểu đồ cột
  const barData = rows.map(row => ({
    ...row,
    savings: row.income - row.expense
  }));

  // Tính số giao dịch thật theo thời gian được chọn
  const allTransactions = transactionsData?.items ?? [];
  
  // Filter transactions theo year (tất cả giao dịch trong năm được chọn)
  const filteredTransactions = allTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.occurredAt);
    const transactionYear = transactionDate.getFullYear();
    return transactionYear === year;
  });
  
  const totalTransactions = filteredTransactions.length;
  


  // Tính toán các chỉ số

  // Tìm tháng có thu nhập cao nhất và thấp nhất
  const maxIncomeMonth = rows.reduce((max, row) => row.income > max.income ? row : max, rows[0] || { month: '', income: 0 });
  const maxExpenseMonth = rows.reduce((max, row) => row.expense > max.expense ? row : max, rows[0] || { month: '', expense: 0 });

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#374151' }}>Báo cáo tài chính</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginRight: '8px' }}>
              Năm:
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min="2020"
              max="2030"
              style={{
                padding: '6px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                width: '100px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <h3 style={{ color: '#10B981', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Tổng thu nhập
          </h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>
            {totalIncome.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <h3 style={{ color: '#EF4444', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Tổng chi tiêu
          </h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#EF4444' }}>
            {totalExpense.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <h3 style={{ color: totalNet >= 0 ? '#10B981' : '#EF4444', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Tiết kiệm
          </h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: totalNet >= 0 ? '#10B981' : '#EF4444' }}>
            {totalNet.toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <h3 style={{ color: '#6366F1', fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Giao dịch
          </h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366F1' }}>
            {totalTransactions}
          </p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Biểu đồ đường - Thu chi theo tháng */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
            Phân tích tài chính chi tiết năm {year}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toLocaleString('vi-VN')} VNĐ`, 
                  name === 'income' ? 'Thu nhập' : name === 'expense' ? 'Chi tiêu' : name === 'net' ? 'Tiết kiệm' : name
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} name="Thu nhập" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} name="Chi tiêu" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="net" stroke="#F59E0B" strokeWidth={3} name="Tiết kiệm" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ tròn - Tỷ lệ thu chi và tiết kiệm */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
            Tỷ lệ thu chi và tiết kiệm
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: entry.color, 
                    marginRight: '8px', 
                    borderRadius: '2px' 
                  }}></div>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{entry.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phân tích chi tiết */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Top tháng */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
            Phân tích chi tiết
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>
                Tháng thu nhập cao nhất
              </h4>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#15803D' }}>
                {maxIncomeMonth?.month}: {maxIncomeMonth?.income.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            
            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#991B1B', marginBottom: '4px' }}>
                Tháng chi tiêu cao nhất
              </h4>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#DC2626' }}>
                {maxExpenseMonth?.month}: {maxExpenseMonth?.expense.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            

          </div>
        </div>

        {/* Biểu đồ cột - So sánh thu chi */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
            So sánh thu chi và tiết kiệm
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData.slice(-6)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toLocaleString('vi-VN')} VNĐ`, 
                  name === 'income' ? 'Thu nhập' : name === 'expense' ? 'Chi tiêu' : name === 'savings' ? 'Tiết kiệm' : name
                ]}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
              />
              <Bar dataKey="income" fill="#10B981" name="Thu nhập" />
              <Bar dataKey="expense" fill="#EF4444" name="Chi tiêu" />
              <Bar dataKey="savings" fill="#6366F1" name="Tiết kiệm" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
          Chi tiết theo tháng
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Tháng
                </th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Thu nhập
                </th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Chi tiêu
                </th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Tiết kiệm
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                      {row.month}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#10B981', textAlign: 'right' }}>
                      {row.income.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#EF4444', textAlign: 'right' }}>
                      {row.expense.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td style={{ 
                      padding: '12px 8px', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      textAlign: 'right',
                      color: row.net >= 0 ? '#10B981' : '#EF4444'
                    }}>
                      {row.net.toLocaleString('vi-VN')} VNĐ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
