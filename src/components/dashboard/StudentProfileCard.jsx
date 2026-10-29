// src/components/dashboard/StudentProfileCard.jsx
import React from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StudentProfileCard() {
  const { student } = useApp();

  const creditsPercent = Math.round(
    (student.creditsCompleted / student.totalCredits) * 100
  );

  return (
    <div className="dashboard-card profile-card">
      <div className="profile-card-header">
        <h3 className="card-title">Student Profile</h3>
        <span className="profile-status-badge">
          <span className="online-indicator" /> Active
        </span>
      </div>

      <div className="profile-hero">
        <div className="avatar-container">
          <img
            src={student.avatar}
            alt={student.name}
            className="profile-avatar-img"
          />
          <div className="avatar-badge" title="Enrolled & Active">
            <CheckCircle size={14} color="#ffffff" />
          </div>
        </div>

        <div className="profile-hero-info">
          <h2 className="student-full-name">{student.name}</h2>
          <p className="student-id-tag">{student.id}</p>
          <span className="major-pill">{student.major}</span>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="profile-detail-item">
          <span className="detail-label">Current Term</span>
          <span className="detail-value">{student.semester}</span>
        </div>
        <div className="profile-detail-item">
          <span className="detail-label">Class Standing</span>
          <span className="detail-value">{student.year}</span>
        </div>
        <div className="profile-detail-item">
          <span className="detail-label">Cumulative GPA</span>
          <div className="gpa-display">
            <span className="gpa-number">{student.gpa}</span>
            <span className="gpa-scale">/ {student.gpaScale}</span>
            <span className="gpa-tag">Honor Roll</span>
          </div>
        </div>
        <div className="profile-detail-item">
          <span className="detail-label">Academic Advisor</span>
          <span className="detail-value text-blue-700">{student.academicAdvisor}</span>
        </div>
      </div>

      {/* Degree Progress Bar */}
      <div className="degree-progress-box">
        <div className="progress-box-top">
          <span className="progress-box-label">Degree Completion</span>
          <span className="progress-box-percent">{creditsPercent}%</span>
        </div>
        <div className="degree-track">
          <div
            className="degree-fill"
            style={{ width: `${creditsPercent}%` }}
          />
        </div>
        <div className="degree-meta">
          <span>{student.creditsCompleted} credits earned</span>
          <span>{student.totalCredits - student.creditsCompleted} credits remaining</span>
        </div>
      </div>

      <div className="profile-contact-row">
        <a
          href={`mailto:${student.email}`}
          className="profile-email-link"
        >
          <Mail size={15} />
          <span>{student.email}</span>
        </a>
      </div>
    </div>
  );
}
