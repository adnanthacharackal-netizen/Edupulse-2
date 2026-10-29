// src/components/common/EmptyState.jsx
import React from 'react';
import { Inbox, RotateCcw } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your current filters or criteria.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-circle">
        <Icon size={32} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button className="empty-state-btn" onClick={onAction}>
          <RotateCcw size={15} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
