// src/pages/GradesPage.jsx
import React, { useState } from 'react';
import { CheckCircle, Download } from 'lucide-react';
import { useApp } from '../context/useApp';

export default function GradesPage() {
  const { student } = useApp();
  const [downloadToast, setDownloadToast] = useState('');

  const gradeList = [
    { code: 'CS 301', name: 'Database Management Systems', credits: 4, grade: 'A', gpa: '4.0', status: 'Passed' },
    { code: 'CS 310', name: 'Data Structures & Algorithms', credits: 4, grade: 'A-', gpa: '3.7', status: 'Passed' },
    { code: 'MATH 240', name: 'Linear Algebra & Applications', credits: 3, grade: 'B+', gpa: '3.3', status: 'Passed' },
    { code: 'CS 335', name: 'Web Applications Engineering', credits: 4, grade: 'A', gpa: '4.0', status: 'Passed' },
    { code: 'HUM 120', name: 'Technical Communication & Ethics', credits: 3, grade: 'A', gpa: '4.0', status: 'Passed' },
  ];

  const handleDownloadTranscript = () => {
    setDownloadToast('Official unofficial transcript generated and saved to your downloads!');
    setTimeout(() => setDownloadToast(''), 4000);
  };

  return (
    <div className="grades-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Academic Grades & GPA Transcript</h1>
          <p className="page-main-desc">
            Review your semester grade history, cumulative GPA standing, and credit fulfillment.
          </p>
        </div>
        <button className="btn-primary-action" onClick={handleDownloadTranscript}>
          <Download size={16} />
          <span>Download PDF Transcript</span>
        </button>
      </div>

      {downloadToast && (
        <div className="feedback-toast">
          <CheckCircle size={16} />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grades-summary-grid">
        <div className="grades-metric-card">
          <h4>Cumulative GPA</h4>
          <p className="text-blue-600">{student.gpa} / {student.gpaScale}</p>
          <span className="card-subtitle">Top 10% of School of Engineering</span>
        </div>
        <div className="grades-metric-card">
          <h4>Credits Earned</h4>
          <p>{student.creditsCompleted} Credits</p>
          <span className="card-subtitle">{student.totalCredits - student.creditsCompleted} credits left to graduate</span>
        </div>
        <div className="grades-metric-card">
          <h4>Academic Standing</h4>
          <p className="text-emerald-600">Dean's Honor List</p>
          <span className="card-subtitle">Active Full-Time Enrollment</span>
        </div>
      </div>

      {/* Grade Table */}
      <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">Current Semester Course Performance (Fall 2026)</h3>
        <p className="card-subtitle" style={{ marginBottom: '1rem' }}>
          Official midterm grade points recorded by department faculties
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="grades-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credit Hours</th>
                <th>Letter Grade</th>
                <th>Grade Point</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {gradeList.map((g) => (
                <tr key={g.code}>
                  <td><strong>{g.code}</strong></td>
                  <td>{g.name}</td>
                  <td>{g.credits} Credits</td>
                  <td>
                    <span className="grade-badge">{g.grade}</span>
                  </td>
                  <td>{g.gpa}</td>
                  <td>
                    <span className="status-pill pill-completed">{g.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
