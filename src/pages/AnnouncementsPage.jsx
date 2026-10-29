// src/pages/AnnouncementsPage.jsx
import React, { useState } from 'react';
import {
  Megaphone,
  PlusCircle,
  Search,
  AlertTriangle,
  User,
  CheckCircle2,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { useAuth } from '../context/useAuth';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { Lock, ShieldCheck } from 'lucide-react';

const categoryOptions = ['All', 'Exams', 'Campus Life', 'Academic', 'Career'];

export default function AnnouncementsPage() {
  const {
    announcements,
    addAnnouncement,
    toggleAnnouncementRead,
    deleteAnnouncement,
    unreadCount,
  } = useApp();
  const { isStaff } = useAuth();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);

  // Expanded notice modal or item ID
  const [expandedId, setExpandedId] = useState(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');

  // Add Notice Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    author: 'Departmental Student Cell',
    excerpt: '',
    content: '',
    isUrgent: false,
  });
  const [formErrors, setFormErrors] = useState({});

  // Filtering
  const filteredAnnouncements = announcements.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (onlyUrgent && !item.isUrgent) {
      return false;
    }
    if (onlyUnread && item.isRead) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchExcerpt = item.excerpt.toLowerCase().includes(q);
      const matchAuthor = item.author.toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchAuthor) return false;
    }
    return true;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete announcement "${title}"?`)) {
      deleteAnnouncement(id);
      setToastMsg(`Deleted announcement.`);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Announcement title is required.';
    }
    if (!formData.author.trim()) {
      errors.author = 'Publishing authority or author is required.';
    }
    if (!formData.excerpt.trim()) {
      errors.excerpt = 'A short summary is required.';
    } else if (formData.excerpt.trim().length < 10) {
      errors.excerpt = 'Summary should be at least 10 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addAnnouncement({
      title: formData.title.trim(),
      category: formData.category,
      author: formData.author.trim(),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim() || formData.excerpt.trim(),
      isUrgent: formData.isUrgent,
    });

    setToastMsg(`Published announcement "${formData.title}"!`);
    setIsAddModalOpen(false);
    setFormErrors({});
    setFormData({
      title: '',
      category: 'Academic',
      author: 'Departmental Student Cell',
      excerpt: '',
      content: '',
      isUrgent: false,
    });
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="announcements-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Campus Announcements & Notices</h1>
          <p className="page-main-desc">
            Official university circulars, academic notifications, examination dates and alerts.
          </p>
        </div>
        {isStaff ? (
          <button
            className="btn-primary-action"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle size={17} />
            <span>Post Announcement</span>
          </button>
        ) : (
          <div
            className="btn-restricted-pill"
            title="Publishing announcements is restricted to Authorized Staff"
          >
            <Lock size={15} />
            <span>Staff-Published Bulletins</span>
          </div>
        )}
      </div>

      {/* Role-Based Access Indicator */}
      <div className={`role-permission-banner ${isStaff ? 'banner-staff' : 'banner-student'}`}>
        {isStaff ? (
          <>
            <ShieldCheck size={16} className="text-blue-600" />
            <span>
              <strong>Authorized Staff Mode:</strong> You can compose, publish, edit and delete official university announcements.
            </span>
          </>
        ) : (
          <>
            <Lock size={16} className="text-amber-600" />
            <span>
              <strong>Student Mode (Read-Only Bulletins):</strong> You can search, filter, and mark circulars as read. Publishing official bulletins requires authorized staff privileges.
            </span>
          </>
        )}
      </div>

      {/* Success Notification */}
      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Overview Metric Bar */}
      <div className="ann-summary-grid">
        <div className="ann-summary-card">
          <span className="ann-summary-label">Total Bulletins</span>
          <span className="ann-summary-val">{announcements.length}</span>
        </div>
        <div className="ann-summary-card">
          <span className="ann-summary-label">Unread Notices</span>
          <span className="ann-summary-val text-amber-600">{unreadCount}</span>
        </div>
        <div className="ann-summary-card">
          <span className="ann-summary-label">Urgent Alerts</span>
          <span className="ann-summary-val text-rose-600">
            {announcements.filter((a) => a.isUrgent).length}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="dashboard-card filters-control-card">
        <div className="asg-controls-row">
          <div className="asg-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search announcements, subjects, or circular keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input search-input"
            />
          </div>

          <div className="filter-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={onlyUrgent}
                onChange={(e) => setOnlyUrgent(e.target.checked)}
              />
              <span>Urgent Only</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => setOnlyUnread(e.target.checked)}
              />
              <span>Unread Only ({unreadCount})</span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="status-tabs-row">
          <span className="status-tabs-label">Category:</span>
          <div className="status-tabs-list">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                className={`status-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="tab-count-bubble">
                  {cat === 'All'
                    ? announcements.length
                    : announcements.filter((a) => a.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements found"
          description="We couldn't find any notices matching your current search and filter settings."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setOnlyUrgent(false);
            setOnlyUnread(false);
          }}
        />
      ) : (
        <div className="announcements-cards-list">
          {filteredAnnouncements.map((item) => (
            <article
              key={item.id}
              className={`announcement-full-card ${
                item.isUrgent ? 'ann-card-urgent' : ''
              } ${!item.isRead ? 'ann-card-unread' : ''}`}
            >
              <div className="ann-full-header">
                <div className="ann-tag-group">
                  <span className={`ann-category-tag cat-${item.category.toLowerCase().replace(' ', '-')}`}>
                    {item.category}
                  </span>
                  {item.isUrgent && (
                    <span className="urgent-badge">
                      <AlertTriangle size={12} /> Urgent Notice
                    </span>
                  )}
                  {!item.isRead && <span className="unread-pill">New</span>}
                </div>

                <div className="ann-actions-group">
                  <span className="ann-date">{item.date}</span>
                  {isStaff && (
                    <button
                      className="btn-action-delete"
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete notice"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="ann-full-title">{item.title}</h3>
              <p className="ann-full-excerpt">{item.excerpt}</p>

              {/* Expanded details */}
              {expandedId === item.id && (
                <div className="ann-expanded-body">
                  <h4 className="expanded-heading">Complete Notice Bulletin:</h4>
                  <p>{item.content || item.excerpt}</p>
                </div>
              )}

              <div className="ann-full-footer">
                <div className="ann-author-info">
                  <User size={14} className="text-slate-400" />
                  <span className="ann-author-name">Issued by: {item.author}</span>
                </div>

                <div className="ann-footer-buttons">
                  <button
                    className="ann-read-toggle-btn"
                    onClick={() => toggleAnnouncementRead(item.id)}
                  >
                    <CheckCircle2 size={14} />
                    <span>{item.isRead ? 'Mark as Unread' : 'Mark as Read'}</span>
                  </button>
                  <button
                    className="ann-expand-btn"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <BookOpen size={14} />
                    <span>{expandedId === item.id ? 'Hide Details' : 'Full Notice'}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Post Announcement */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Post Campus Announcement"
        subtitle="Broadcast an official notification or student society bulletin"
      >
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="ann-title">
              Announcement Title <span className="required-star">*</span>
            </label>
            <input
              id="ann-title"
              type="text"
              placeholder="e.g. End Semester Practical Examination Guidelines"
              className={`form-input ${formErrors.title ? 'form-input-error' : ''}`}
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (formErrors.title) setFormErrors({ ...formErrors, title: null });
              }}
            />
            {formErrors.title && <p className="form-error-msg">{formErrors.title}</p>}
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ann-category">
                Category
              </label>
              <select
                id="ann-category"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Academic">Academic</option>
                <option value="Exams">Exams</option>
                <option value="Campus Life">Campus Life</option>
                <option value="Career">Career</option>
                <option value="Facility">Facility</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ann-author">
                Issuing Department / Author <span className="required-star">*</span>
              </label>
              <input
                id="ann-author"
                type="text"
                placeholder="e.g. Dean of Academic Affairs"
                className={`form-input ${formErrors.author ? 'form-input-error' : ''}`}
                value={formData.author}
                onChange={(e) => {
                  setFormData({ ...formData, author: e.target.value });
                  if (formErrors.author) setFormErrors({ ...formErrors, author: null });
                }}
              />
              {formErrors.author && <p className="form-error-msg">{formErrors.author}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-excerpt">
              Brief Summary <span className="required-star">*</span>
            </label>
            <textarea
              id="ann-excerpt"
              rows="2"
              placeholder="Quick 1-2 sentence overview shown in the preview list..."
              className={`form-input form-textarea ${formErrors.excerpt ? 'form-input-error' : ''}`}
              value={formData.excerpt}
              onChange={(e) => {
                setFormData({ ...formData, excerpt: e.target.value });
                if (formErrors.excerpt) setFormErrors({ ...formErrors, excerpt: null });
              }}
            />
            {formErrors.excerpt && <p className="form-error-msg">{formErrors.excerpt}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-content">
              Detailed Notice Body
            </label>
            <textarea
              id="ann-content"
              rows="4"
              placeholder="Provide complete room numbers, reporting times, reference IDs, and instructions..."
              className="form-input form-textarea"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              />
              <span>Flag as Urgent / High Priority Notice</span>
            </label>
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-modal-save">
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
