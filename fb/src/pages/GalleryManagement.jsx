import React, { useState, useEffect, useMemo } from 'react';
import { galleryService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import './GalleryManagement.css';

const GalleryManagement = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('ALL'); // ALL, PHOTO, VIDEO
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null); // Lightbox
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    eventName: '',
    eventDate: new Date().toISOString().split('T')[0],
    uploadedBy: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const { showToast } = useToast();

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await galleryService.getAll();
      setGalleryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.message || 'Failed to load gallery items';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  // Unique Events List
  const eventList = useMemo(() => {
    const events = galleryItems
      .map((item) => item.eventName)
      .filter((name) => Boolean(name && name.trim()));
    return ['ALL', ...Array.from(new Set(events))];
  }, [galleryItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      // Search
      const matchesSearch =
        !searchTerm ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.eventName && item.eventName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.uploadedBy && item.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()));

      // Event Filter
      const matchesEvent = selectedEvent === 'ALL' || item.eventName === selectedEvent;

      // Media Type
      const hasImage = Boolean(item.imageUrl && item.imageUrl.trim());
      const hasVideo = Boolean(item.videoUrl && item.videoUrl.trim());

      let matchesType = true;
      if (mediaTypeFilter === 'PHOTO') matchesType = hasImage && !hasVideo;
      else if (mediaTypeFilter === 'VIDEO') matchesType = hasVideo;

      // Active Status
      let matchesActive = true;
      if (activeFilter === 'ACTIVE') matchesActive = Boolean(item.isActive);
      else if (activeFilter === 'INACTIVE') matchesActive = !item.isActive;

      return matchesSearch && matchesEvent && matchesType && matchesActive;
    });
  }, [galleryItems, searchTerm, selectedEvent, mediaTypeFilter, activeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = galleryItems.length;
    const photos = galleryItems.filter((i) => i.imageUrl && !i.videoUrl).length;
    const videos = galleryItems.filter((i) => i.videoUrl).length;
    const active = galleryItems.filter((i) => i.isActive).length;
    return { total, photos, videos, active };
  }, [galleryItems]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      videoUrl: item.videoUrl || '',
      eventName: item.eventName || '',
      eventDate: item.eventDate || '',
      uploadedBy: item.uploadedBy || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(initialFormState);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await galleryService.update(editingItem.galleryId, formData);
        setGalleryItems((prev) =>
          prev.map((item) => (item.galleryId === editingItem.galleryId ? updated : item))
        );
        showToast('Gallery item updated successfully!', 'success');
      } else {
        const created = await galleryService.create(formData);
        setGalleryItems((prev) => [created, ...prev]);
        showToast('New media item added to gallery!', 'success');
      }
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Failed to save gallery item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await galleryService.delete(deletingId);
      setGalleryItems((prev) => prev.filter((item) => item.galleryId !== deletingId));
      showToast('Gallery item deleted successfully!', 'success');
      setDeletingId(null);
      if (viewingItem && viewingItem.galleryId === deletingId) {
        setViewingItem(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete gallery item', 'error');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const updatedPayload = { ...item, isActive: !item.isActive };
      const updated = await galleryService.update(item.galleryId, updatedPayload);
      setGalleryItems((prev) =>
        prev.map((i) => (i.galleryId === item.galleryId ? updated : i))
      );
      showToast(
        `Item marked as ${updated.isActive ? 'Active' : 'Inactive'}`,
        'info'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Video embed helper
  const renderMedia = (item, isLightbox = false) => {
    if (item.videoUrl) {
      // Check Youtube
      const ytMatch = item.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
      if (ytMatch && ytMatch[1]) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            title={item.title}
            className="card-media-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
      return (
        <video
          src={item.videoUrl}
          controls={isLightbox}
          className="card-media-video"
          poster={item.imageUrl || undefined}
        />
      );
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80';
    return (
      <img
        src={item.imageUrl || fallbackImg}
        alt={item.title}
        className="card-media-img"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImg;
        }}
      />
    );
  };

  return (
    <div className="gallery-page-container">
      {/* Header Section */}
      <div className="gallery-header glass-card">
        <div className="header-title-group">
          <h2>🖼️ Sports & Event Gallery</h2>
          <p>Browse media highlights, photo collections, and tournament videos from our PE events.</p>
        </div>

        <button className="add-media-btn" onClick={handleOpenCreateModal}>
          <span>➕</span> Add Media Item
        </button>
      </div>

      {/* Stats Quick Ribbon */}
      <div className="gallery-stats-grid">
        <div className="stat-card glass-card">
          <span className="stat-icon">📸</span>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Media</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <span className="stat-icon">🖼️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.photos}</span>
            <span className="stat-label">Photo Uploads</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <span className="stat-icon">🎥</span>
          <div className="stat-info">
            <span className="stat-value">{stats.videos}</span>
            <span className="stat-label">Video Clips</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active Items</span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="gallery-filter-bar glass-card">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, description, or uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ✖
            </button>
          )}
        </div>

        <div className="filter-select-group">
          {/* Event Filter */}
          <div className="filter-field">
            <label>Event:</label>
            <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
              {eventList.map((evt) => (
                <option key={evt} value={evt}>
                  {evt === 'ALL' ? 'All Events' : evt}
                </option>
              ))}
            </select>
          </div>

          {/* Media Type Tabs */}
          <div className="filter-pill-group">
            <button
              className={`pill-btn ${mediaTypeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setMediaTypeFilter('ALL')}
            >
              All Types
            </button>
            <button
              className={`pill-btn ${mediaTypeFilter === 'PHOTO' ? 'active' : ''}`}
              onClick={() => setMediaTypeFilter('PHOTO')}
            >
              📷 Photos
            </button>
            <button
              className={`pill-btn ${mediaTypeFilter === 'VIDEO' ? 'active' : ''}`}
              onClick={() => setMediaTypeFilter('VIDEO')}
            >
              📹 Videos
            </button>
          </div>

          {/* Status Filter */}
          <div className="filter-field">
            <label>Status:</label>
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <Spinner message="Fetching gallery media..." />
      ) : error ? (
        <div className="gallery-error-card glass-card">
          <p>⚠️ {error}</p>
          <button className="retry-btn" onClick={fetchGalleryItems}>
            🔄 Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-gallery-card glass-card">
          <div className="empty-illustration">🖼️</div>
          <h3>No Media Items Found</h3>
          <p>
            {galleryItems.length === 0
              ? "Your gallery is currently empty. Click 'Add Media Item' above to upload photo and video highlights!"
              : 'No items match your active search or filter criteria. Try adjusting your filters.'}
          </p>
          {galleryItems.length === 0 && (
            <button className="add-media-btn" onClick={handleOpenCreateModal}>
              ➕ Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredItems.map((item) => (
            <div
              key={item.galleryId}
              className={`gallery-card glass-card ${!item.isActive ? 'inactive-card' : ''}`}
            >
              <div className="card-media-wrapper" onClick={() => setViewingItem(item)}>
                {renderMedia(item)}

                {item.videoUrl && <div className="video-overlay-badge">🎥 Video</div>}
                {item.eventName && <div className="event-overlay-badge">{item.eventName}</div>}

                <div className="media-hover-overlay">
                  <span className="overlay-view-text">🔍 View Details</span>
                </div>
              </div>

              <div className="card-body">
                <div className="card-header-row">
                  <h3 className="card-title" title={item.title}>
                    {item.title}
                  </h3>
                  <span className={`status-badge ${item.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {item.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>

                {item.description && (
                  <p className="card-description">
                    {item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description}
                  </p>
                )}

                <div className="card-meta">
                  {item.eventDate && (
                    <span className="meta-tag">
                      📅 {new Date(item.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {item.uploadedBy && <span className="meta-tag">👤 {item.uploadedBy}</span>}
                </div>

                <div className="card-actions">
                  <button
                    className="action-icon-btn view-btn"
                    title="View Media"
                    onClick={() => setViewingItem(item)}
                  >
                    👁️
                  </button>
                  <button
                    className="action-icon-btn edit-btn"
                    title="Edit Item"
                    onClick={() => handleOpenEditModal(item)}
                  >
                    ✏️
                  </button>
                  <button
                    className={`action-icon-btn toggle-btn ${item.isActive ? 'active' : ''}`}
                    title={item.isActive ? 'Deactivate' : 'Activate'}
                    onClick={() => handleToggleStatus(item)}
                  >
                    {item.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button
                    className="action-icon-btn delete-btn"
                    title="Delete Item"
                    onClick={() => setDeletingId(item.galleryId)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / View Modal */}
      {viewingItem && (
        <div className="modal-overlay" onClick={() => setViewingItem(null)}>
          <div className="lightbox-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setViewingItem(null)}>
              ✖
            </button>

            <div className="lightbox-media-container">
              {renderMedia(viewingItem, true)}
            </div>

            <div className="lightbox-details">
              <div className="lightbox-header">
                <h3>{viewingItem.title}</h3>
                <div className="lightbox-badges">
                  {viewingItem.eventName && <span className="event-badge">{viewingItem.eventName}</span>}
                  <span className={`status-badge ${viewingItem.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {viewingItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {viewingItem.description && (
                <p className="lightbox-description">{viewingItem.description}</p>
              )}

              <div className="lightbox-meta-grid">
                <div>
                  <strong>Event Date:</strong> {viewingItem.eventDate || 'N/A'}
                </div>
                <div>
                  <strong>Uploaded By:</strong> {viewingItem.uploadedBy || 'Anonymous'}
                </div>
                {viewingItem.createdAt && (
                  <div>
                    <strong>Added On:</strong> {new Date(viewingItem.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="lightbox-actions">
                <button
                  className="secondary-btn"
                  onClick={() => {
                    const item = viewingItem;
                    setViewingItem(null);
                    handleOpenEditModal(item);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="danger-btn"
                  onClick={() => {
                    const id = viewingItem.galleryId;
                    setViewingItem(null);
                    setDeletingId(id);
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="form-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? '✏️ Edit Media Item' : '➕ Add Gallery Media'}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} className="gallery-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="required-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Annual Football Finals Trophy Ceremony"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Brief highlights or description of the media..."
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.imageUrl}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Video URL (YouTube or Direct Link)</label>
                  <input
                    type="url"
                    name="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Event Name</label>
                  <input
                    type="text"
                    name="eventName"
                    placeholder="e.g. Inter-College Championship 2026"
                    value={formData.eventName}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Uploaded By</label>
                  <input
                    type="text"
                    name="uploadedBy"
                    placeholder="e.g. Admin / Sports Coordinator"
                    value={formData.uploadedBy}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <span>Active / Visible in Public Gallery</span>
                  </label>
                </div>
              </div>

              {/* Media Preview in Form */}
              {(formData.imageUrl || formData.videoUrl) && (
                <div className="form-preview-box">
                  <label>Preview:</label>
                  {renderMedia(formData)}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={handleCloseModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : editingItem ? 'Update Media' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="confirm-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirm Deletion</h3>
            <p>Are you sure you want to delete this gallery item? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="secondary-btn" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button className="danger-btn" onClick={handleDelete}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
