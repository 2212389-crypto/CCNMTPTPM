import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            😵
          </div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Có lỗi xảy ra
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '24px',
            maxWidth: '400px'
          }}>
            Ứng dụng đã gặp lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </p>
          <button
            onClick={() => window.location.reload()}
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
            Tải lại trang
          </button>
          {this.state.error && (
            <details style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              maxWidth: '600px'
            }}>
              <summary style={{
                fontSize: '12px',
                color: '#6B7280',
                cursor: 'pointer',
                marginBottom: '8px'
              }}>
                Chi tiết lỗi
              </summary>
              <pre style={{
                fontSize: '11px',
                color: '#374151',
                overflow: 'auto',
                textAlign: 'left'
              }}>
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}