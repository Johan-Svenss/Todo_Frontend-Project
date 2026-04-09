import React, { useState, useEffect } from 'react';
import './Task.css';
import Sidebar from './Sidebar';
import Header from './Header.jsx';
import { taskService } from '../services/taskService';
import { personService } from '../services/personService';
import { useAuth } from '../context/AuthContext';

const Task = () => {
    const { isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [editFiles, setEditFiles] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        personId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, personsData] = await Promise.all([
                taskService.getAll(),
                personService.getAll()
            ]);
            setTasks(tasksData);
            setPersons(personsData);
        } catch (err) {
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const clearFiles = () => {
        setSelectedFiles([]);
        const input = document.getElementById('todoAttachments');
        if (input) input.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const todoDto = {
                title: formData.title,
                description: formData.description,
                completed: false,
                dueDate: formData.dueDate ? formData.dueDate + ':00' : null,
                personId: formData.personId ? Number(formData.personId) : null
            };
            const created = await taskService.create(todoDto, selectedFiles);
            setTasks(prev => [created, ...prev]);
            setFormData({ title: '', description: '', dueDate: '', personId: '' });
            setSelectedFiles([]);
            const input = document.getElementById('todoAttachments');
            if (input) input.value = '';
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task. Please try again.');
        }
    };

    const handleComplete = async (task) => {
        try {
            const todoDto = {
                id: task.id,
                title: task.title,
                description: task.description,
                completed: true,
                dueDate: task.dueDate || null,
                personId: task.personId || null
            };
            const updated = await taskService.update(task.id, todoDto);
            setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
        } catch (err) {
            setError('Failed to update task.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setError('Failed to delete task.');
        }
    };

    const openEditModal = (task) => {
        setEditingTask({ ...task });
        setEditFiles([]);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingTask(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEditFilesChange = (e) => {
        setEditFiles(Array.from(e.target.files));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const dueDate = editingTask.dueDate
                ? (editingTask.dueDate.length === 16 ? editingTask.dueDate + ':00' : editingTask.dueDate)
                : null;
            const todoDto = {
                id: editingTask.id,
                title: editingTask.title,
                description: editingTask.description,
                completed: editingTask.completed,
                dueDate: dueDate,
                personId: editingTask.personId ? Number(editingTask.personId) : null
            };
            const updated = await taskService.update(editingTask.id, todoDto, editFiles);
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            setEditingTask(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update task.');
        }
    };

    const getFilteredTasks = () => {
        const now = new Date();
        switch (filter) {
            case 'pending':
                return tasks.filter(t => !t.completed);
            case 'completed':
                return tasks.filter(t => t.completed);
            case 'overdue':
                return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
            default:
                return tasks;
        }
    };

    const isOverdue = (task) => {
        return !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    const getPersonName = (personId) => {
        const person = persons.find(p => p.id === personId);
        return person ? person.name : null;
    };

    const formatDueDateForInput = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.substring(0, 16);
    };

    const filteredTasks = getFilteredTasks();

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="dashboard-main">
                <Header
                    title="Tasks"
                    subtitle="Manage and organize your tasks"
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                />

                <div className="dashboard-content">
                    {error && (
                        <div className="alert alert-danger alert-dismissible" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-8 mx-auto">

                            <div className="card shadow-sm task-form-section">
                                <div className="card-body">
                                    <h2 className="card-title mb-4">Add New Task</h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="title" className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                minLength={2}
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                maxLength={500}
                                            ></textarea>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="dueDate" className="form-label">Due Date</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    id="dueDate"
                                                    value={formData.dueDate}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="personId" className="form-label">Assign to Person</label>
                                                <select
                                                    className="form-select"
                                                    id="personId"
                                                    value={formData.personId}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">-- Select Person (Optional) --</option>
                                                    {persons.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Attachments</label>
                                            <div className="input-group mb-3">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="todoAttachments"
                                                    multiple
                                                    onChange={handleFileChange}
                                                />
                                                <button className="btn btn-outline-secondary" type="button" onClick={clearFiles}>
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                            {selectedFiles.length > 0 && (
                                                <div className="file-list">
                                                    {selectedFiles.map((f, i) => (
                                                        <small key={i} className="d-block text-muted">
                                                            <i className="bi bi-paperclip me-1"></i>{f.name}
                                                        </small>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <button type="submit" className="btn btn-primary">
                                                <i className="bi bi-plus-lg me-2"></i>
                                                Add Task
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="card shadow-sm tasks-list mt-4">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Tasks</h5>
                                    <div className="btn-group">
                                        <button
                                            className={`btn btn-outline-secondary btn-sm ${filter === 'all' ? 'active' : ''}`}
                                            onClick={() => setFilter('all')}
                                        >All</button>
                                        <button
                                            className={`btn btn-outline-warning btn-sm ${filter === 'pending' ? 'active' : ''}`}
                                            onClick={() => setFilter('pending')}
                                        >Pending</button>
                                        <button
                                            className={`btn btn-outline-success btn-sm ${filter === 'completed' ? 'active' : ''}`}
                                            onClick={() => setFilter('completed')}
                                        >Completed</button>
                                        <button
                                            className={`btn btn-outline-danger btn-sm ${filter === 'overdue' ? 'active' : ''}`}
                                            onClick={() => setFilter('overdue')}
                                        >Overdue</button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : filteredTasks.length === 0 ? (
                                        <p className="text-muted text-center py-3">No tasks found.</p>
                                    ) : (
                                        <div className="list-group">
                                            {filteredTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={`list-group-item list-group-item-action ${task.completed ? 'task-completed' : ''}`}
                                                >
                                                    <div className="d-flex w-100 justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between">
                                                                <h6 className={`mb-1 ${task.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                                                                    {task.title}
                                                                </h6>
                                                                {task.createdAt && (
                                                                    <small className="text-muted ms-2">
                                                                        Created: {formatDate(task.createdAt)}
                                                                    </small>
                                                                )}
                                                            </div>
                                                            {task.description && (
                                                                <p className="mb-1 text-muted small">{task.description}</p>
                                                            )}
                                                            <div className="d-flex align-items-center flex-wrap gap-1">
                                                                {task.dueDate && (
                                                                    <small className={`me-2 ${isOverdue(task) ? 'text-danger' : 'text-muted'}`}>
                                                                        <i className="bi bi-calendar-event"></i> Due: {formatDate(task.dueDate)}
                                                                    </small>
                                                                )}
                                                                {task.personId && (
                                                                    <span className="badge bg-info me-2">
                                                                        <i className="bi bi-person"></i> {getPersonName(task.personId)}
                                                                    </span>
                                                                )}
                                                                <span className={`badge me-2 ${task.completed ? 'bg-success' : isOverdue(task) ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                                    {task.completed ? 'Completed' : isOverdue(task) ? 'Overdue' : 'Pending'}
                                                                </span>
                                                                {task.numberOfAttachments > 0 && (
                                                                    <small className="text-muted">
                                                                        <i className="bi bi-paperclip"></i> {task.numberOfAttachments}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="btn-group ms-3">
                                                            {!task.completed && (
                                                                <button
                                                                    className="btn btn-outline-success btn-sm"
                                                                    title="Mark Complete"
                                                                    onClick={() => handleComplete(task)}
                                                                >
                                                                    <i className="bi bi-check-lg"></i>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                title="Edit"
                                                                onClick={() => openEditModal(task)}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            {isAdmin() && (
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    title="Delete"
                                                                    onClick={() => handleDelete(task.id)}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {editingTask && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Task</h5>
                                <button type="button" className="btn-close" onClick={() => setEditingTask(null)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={editingTask.title || ''}
                                            onChange={handleEditChange}
                                            required
                                            minLength={2}
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            rows="3"
                                            value={editingTask.description || ''}
                                            onChange={handleEditChange}
                                            maxLength={500}
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Due Date</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                name="dueDate"
                                                value={formatDueDateForInput(editingTask.dueDate)}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Assign to Person</label>
                                            <select
                                                className="form-select"
                                                name="personId"
                                                value={editingTask.personId || ''}
                                                onChange={handleEditChange}
                                            >
                                                <option value="">-- Select Person (Optional) --</option>
                                                {persons.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="editCompleted"
                                            name="completed"
                                            checked={editingTask.completed}
                                            onChange={handleEditChange}
                                        />
                                        <label className="form-check-label" htmlFor="editCompleted">
                                            Mark as Completed
                                        </label>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Add Attachments</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            multiple
                                            onChange={handleEditFilesChange}
                                        />
                                        {editingTask.numberOfAttachments > 0 && (
                                            <small className="text-muted">
                                                Currently has {editingTask.numberOfAttachments} attachment(s)
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingTask(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Task;
