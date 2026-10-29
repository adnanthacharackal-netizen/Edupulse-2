// src/components/dashboard/RecentAnnouncements.jsx
import React, { useState } from 'react';
import { AlertTriangle, User, ChevronRight, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function RecentAnnouncements() {
  const { announcements } = useApp();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="dashboard-card announcements-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Campus Announcements</h3>
          <p className="card-subtitle">Official university bulletins & notices</p>
        </div>
        <span className="announcement-total-badge">
          {announcements.length} Updates
        </span>
      </div>

      <div className="announcements-list">
        {announcements.slice(0, 3).map((ann) => (
          <article
            key={ann.id}
            className={`announcement-item ${ann.isUrgent ? 'announcement-urgent' : ''}`}
          >
            <div className="ann-item-header">
              <div className="ann-tag-group">
                <span className={`ann-category-tag cat-${ann.category.toLowerCase().replace(' ', '-')}`}>
                  {ann.category}
                </span>
                {ann.isUrgent && (
                  <span className="urgent-badge">
                    <AlertTriangle size={12} /> Urgent
                  </span>
                )}
              </div>
              <span className="ann-date">{ann.date}</span>
            </div>

            <h4 className="ann-title">{ann.title}</h4>
            <p className="ann-excerpt">{ann.excerpt}</p>

            <div className="ann-footer">
              <div className="ann-author-info">
                <User size={13} className="text-slate-400" />
                <span className="ann-author-name">{ann.author}</span>
              </div>
              <button
                className="ann-read-btn"
                onClick={() =>
                  setSelectedAnnouncement(
                    selectedAnnouncement === ann.id ? null : ann.id
                  )
                }
              >
                <span>{selectedAnnouncement === ann.id ? 'Close' : 'Read more'}</span>
                <ChevronRight
                  size={14}
                  className={`chevron-icon ${
                    selectedAnnouncement === ann.id ? 'chevron-rotated' : ''
                  }`}
                />
              </button>
            </div>

            {selectedAnnouncement === ann.id && (
              <div className="ann-expanded-box">
                <p className="expanded-text">
                  {ann.content ||
                    'For full documentation and instructions, please consult the student advisory cell.'}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="card-footer-action">
        <button
          className="link-btn-text"
          onClick={() => navigate('/announcements')}
        >
          <span>All Announcements & Post Notice</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
