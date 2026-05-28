interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export default function Loading({ size = 'medium', text = 'Đang tải...' }: LoadingProps) {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px',
      gap: '12px'
    }}>
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: '2px solid #F3F4F6',
          borderTop: '2px solid #3B82F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <p style={{ 
        fontSize: '14px', 
        color: '#6B7280',
        margin: 0
      }}>
        {text}
      </p>
    </div>
  );
}