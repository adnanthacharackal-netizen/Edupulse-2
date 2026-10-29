// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading EduPulse...' }) {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-icon-wrap">
        <Loader2 size={32} className="spin-animation text-blue-600" />
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
