import React, { useState, useEffect } from 'react';
import './User.css';
import Sidebar from './Sidebar';
import Header from './Header.jsx';
import { personService } from '../services/personService';

const User = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [editForm, setEditForm] = useState({ id: null, name: '', email: '' });

    useEffect(() => {
        loadPersons();
    }, []);

    const loadPersons = async () => {
        try {
            setLoading(true);
            const data = await personService.getAll();
            setPersons(data);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (createForm.password !== createForm.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const created = await personService.register(createForm);
            setPersons(prev => [...prev, created]);
            setCreateForm({ name: '', email: '', username: '', password: '', confirmPassword: '' });
            setShowCreateModal(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user.');
        }
    };

    const openEditModal = (person) => {
        setEditingPerson(person);
        setEditForm({ id: person.id, name: person.name, email: person.email });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await personService.update(editForm.id, { id: editForm.id, name: editForm.name, email: editForm.email });
            setPersons(prev => prev.map(p => p.id === editForm.id ? { ...p, name: editForm.name, email: editForm.email } : p));
            setEditingPerson(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await personService.delete(id);
            setPersons(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError('Failed to delete user.');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="dashboard-main">
                <Header
                    title="Users"
                    subtitle="Manage users and their accounts"
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                    actions={
                        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
                            <i className="bi bi-person-plus me-2"></i>
                            Add User
                        </button>
                    }
                />

                <div className="dashboard-content">
                    {error && (
                        <div className="alert alert-danger alert-dismissible" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    )}

                    <div className="user-table-card">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" style={{ width: '50px' }}>#</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Email</th>
                                            <th scope="col" style={{ width: '120px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {persons.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted py-4">
                                                    No users found.
                                                </td>
                                            </tr>
                                        ) : (
                                            persons.map((person, index) => (
                                                <tr key={person.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="user-avatar-sm">
                                                                <i className="bi bi-person"></i>
                                                            </div>
                                                            <span className="fw-medium">{person.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{person.email}</td>
                                                    <td>
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                title="Edit"
                                                                onClick={() => openEditModal(person)}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Delete"
                                                                onClick={() => handleDelete(person.id)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New User</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={createForm.name}
                                            onChange={handleCreateChange}
                                            required
                                            minLength={2}
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={createForm.email}
                                            onChange={handleCreateChange}
                                            required
                                            maxLength={150}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={createForm.username}
                                            onChange={handleCreateChange}
                                            required
                                            minLength={4}
                                            maxLength={50}
                                            pattern="^[a-zA-Z0-9._-]{4,50}$"
                                            title="Letters, numbers, dots, underscores, and hyphens only"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={createForm.password}
                                            onChange={handleCreateChange}
                                            required
                                            minLength={8}
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="confirmPassword"
                                            value={createForm.confirmPassword}
                                            onChange={handleCreateChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingPerson && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button type="button" className="btn-close" onClick={() => setEditingPerson(null)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditChange}
                                            required
                                            minLength={2}
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditChange}
                                            required
                                            maxLength={150}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingPerson(null)}>
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

export default User;
