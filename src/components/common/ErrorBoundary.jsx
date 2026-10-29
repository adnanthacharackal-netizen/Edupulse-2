// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EduPulse caught an unhandled UI error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper">
          <div className="error-boundary-card">
            <div className="error-icon-circle">
              <AlertTriangle size={36} className="text-rose-600" />
            </div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              EduPulse encountered an unexpected application error. Your data has not been lost.
            </p>
            {this.state.error && (
              <pre className="error-details">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="error-actions">
              <button className="btn-primary-action" onClick={this.handleReset}>
                <Home size={16} />
                <span>Return to Dashboard</span>
              </button>
              <button
                className="btn-modal-cancel"
                onClick={() => window.location.reload()}
              >
                <RotateCcw size={16} />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
