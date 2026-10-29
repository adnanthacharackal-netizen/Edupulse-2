// src/pages/NotesPage.jsx
import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  PlusCircle,
  Search,
  Pin,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/common/Modal';

const subjects = [
  'All',
  'CS 301',
  'CS 310',
  'MATH 240',
  'CS 335',
  'HUM 120',
  'General',
];

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useApp();

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    courseCode: 'CS 301',
    tags: '',
    pinned: false,
    content: '',
  });

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (selectedSubject !== 'All' && note.courseCode !== selectedSubject) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchCourse = note.courseCode.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          if (!matchTitle && !matchCourse && !matchContent) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes come first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [notes, selectedSubject, searchQuery]);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      courseCode: selectedSubject !== 'All' ? selectedSubject : 'CS 301',
      tags: '',
      pinned: false,
      content: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      courseCode: note.courseCode,
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
      pinned: Boolean(note.pinned),
      content: note.content,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNote) {
      updateNote(editingNote.id, {
        title: formData.title.trim(),
        courseCode: formData.courseCode,
        tags: tagsArray,
        pinned: formData.pinned,
        content: formData.content,
      });
      setToastMsg('Note updated successfully!');
    } else {
      addNote({
        title: formData.title.trim(),
        courseCode: formData.courseCode,
        tags: tagsArray,
        pinned: formData.pinned,
        content: formData.content,
      });
      setToastMsg('New study note saved!');
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete note "${title}"?`)) {
      deleteNote(id);
      setToastMsg('Note deleted.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="notes-page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Subject-Wise Study Notes</h1>
          <p className="page-main-desc">
            Capture lecture summaries, formula sheets, algorithm notes, and revision cheat sheets.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleOpenAdd}>
          <PlusCircle size={16} />
          <span>New Note</span>
        </button>
      </div>

      {toastMsg && (
        <div className="feedback-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Toolbar: Search & Subject Filters */}
      <div className="notes-toolbar dashboard-card">
        <div className="notes-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notes by title, topic, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {subjects.map((sub) => (
            <button
              key={sub}
              className={`filter-pill ${selectedSubject === sub ? 'active' : ''}`}
              onClick={() => setSelectedSubject(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state-box dashboard-card text-center p-8 col-span-3">
            <BookOpen size={40} className="mx-auto text-slate-400 mb-2" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-200">No notes found</h4>
            <p className="text-slate-500 text-sm">
              Create your first study note for this course to start organizing your revision.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`note-card dashboard-card ${note.pinned ? 'note-pinned' : ''}`}
            >
              <div className="note-card-header">
                <span className="task-chip chip-course">{note.courseCode}</span>
                <div className="flex items-center gap-1">
                  <button
                    className={`note-pin-btn ${note.pinned ? 'active' : ''}`}
                    onClick={() => togglePinNote(note.id)}
                    title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin size={15} />
                  </button>
                  <button
                    className="task-action-btn edit"
                    onClick={() => handleOpenEdit(note)}
                    title="Edit note"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="task-action-btn delete"
                    onClick={() => handleDelete(note.id, note.title)}
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="note-title">{note.title}</h3>

              <div className="note-body-preview">
                <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                  {note.content}
                </p>
              </div>

              {Array.isArray(note.tags) && note.tags.length > 0 && (
                <div className="note-tags-row">
                  {note.tags.map((tag) => (
                    <span key={tag} className="note-tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="note-footer">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {note.updatedAt
                    ? new Date(note.updatedAt).toLocaleDateString()
                    : 'Recently'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Note Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingNote ? 'Edit Study Note' : 'Create Study Note'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Note Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B-Tree Balancing Theorems, Matrix Eigenspaces..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Subject / Course</label>
                <select
                  className="form-select"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                >
                  <option value="CS 301">CS 301 - Database Systems</option>
                  <option value="CS 310">CS 310 - Data Structures</option>
                  <option value="MATH 240">MATH 240 - Linear Algebra</option>
                  <option value="CS 335">CS 335 - Web Applications</option>
                  <option value="HUM 120">HUM 120 - Tech Communication</option>
                  <option value="General">General / Notes</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. trees, exam-prep, formulas"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                />
                <span>Pin this note to the top of the list</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Note Content / Markdown</label>
              <textarea
                className="form-textarea"
                rows={8}
                placeholder="Write your study notes, key formulas, lecture summary, or code snippets here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingNote ? 'Save Changes' : 'Save Note'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
