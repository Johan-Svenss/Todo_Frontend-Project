import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from './Sidebar';
import Header from './Header.jsx';
import { taskService } from '../services/taskService';
import { personService } from '../services/personService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const now = new Date();

    const pendingTasks = tasks.filter(t => !t.completed && !(t.dueDate && new Date(t.dueDate) < now));
    const completedTasks = tasks.filter(t => t.completed);
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
    const recentTasks = tasks
        .filter(t => !t.completed)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

    const handleMarkComplete = async (task) => {
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

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    const getStatusBadgeClass = (task) => {
        if (task.completed) return 'bg-success';
        if (task.dueDate && new Date(task.dueDate) < now) return 'bg-danger';
        return 'bg-warning text-dark';
    };

    const getStatusLabel = (task) => {
        if (task.completed) return 'Completed';
        if (task.dueDate && new Date(task.dueDate) < now) return 'Overdue';
        return 'Pending';
    };

    const getPersonName = (personId) => {
        if (!personId) return '-';
        const person = persons.find(p => p.id === personId);
        return person ? person.name : '-';
    };

    const TaskTable = ({ tasks: tableTasks, title, isOverdue }) => (
        <div className="tasks-section">
            <div className="section-header">
                <h2>
                    <span className={isOverdue ? 'text-danger' : ''}>
                        {title}
                    </span>
                    {isOverdue && <span className="badge bg-danger ms-2">{tableTasks.length}</span>}
                </h2>
                <button
                    className="btn btn-link text-decoration-none"
                    onClick={() => navigate('/dashboard/tasks')}
                >
                    View All
                    <i className="bi bi-arrow-right ms-2"></i>
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th scope="col" style={{ width: '40px' }}>#</th>
                            <th scope="col">Task</th>
                            <th scope="col">Assigned To</th>
                            <th scope="col">Due Date</th>
                            <th scope="col" style={{ width: '120px' }}>Status</th>
                            <th scope="col" style={{ width: '60px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableTasks.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-3">
                                    No tasks to show.
                                </td>
                            </tr>
                        ) : (
                            tableTasks.map((task, index) => (
                                <tr key={task.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="fw-medium">{task.title}</div>
                                        {task.description && (
                                            <small className="text-muted">{task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}</small>
                                        )}
                                    </td>
                                    <td>{getPersonName(task.personId)}</td>
                                    <td>
                                        <div className={isOverdue ? 'text-danger' : ''}>
                                            {formatDate(task.dueDate)}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(task)}`}>
                                            {getStatusLabel(task)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="dropdown">
                                            <button className="btn btn-link btn-sm p-0" data-bs-toggle="dropdown">
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                {!task.completed && (
                                                    <li>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => handleMarkComplete(task)}
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    </li>
                                                )}
                                                <li>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => navigate('/dashboard/tasks')}
                                                    >
                                                        Edit
                                                    </button>
                                                </li>
                                                {isAdmin() && (
                                                    <>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDelete(task.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="dashboard-main">
                <Header
                    title="Dashboard"
                    subtitle="Welcome back! Here's your tasks overview"
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                />

                <div className="dashboard-content">
                    {error && (
                        <div className="alert alert-danger alert-dismissible" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon pending">
                                        <i className="bi bi-hourglass-split"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>Pending</h3>
                                        <p className="stat-number">{pendingTasks.length}</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon in-progress">
                                        <i className="bi bi-list-task"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>Total Tasks</h3>
                                        <p className="stat-number">{tasks.length}</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon completed">
                                        <i className="bi bi-check2-circle"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>Completed</h3>
                                        <p className="stat-number">{completedTasks.length}</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon overdue">
                                        <i className="bi bi-exclamation-circle"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>Overdue</h3>
                                        <p className="stat-number">{overdueTasks.length}</p>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon info">
                                        <i className="bi bi-people"></i>
                                    </div>
                                    <div className="stat-info">
                                        <h3>Users</h3>
                                        <p className="stat-number">{persons.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="tasks-grid">
                                <TaskTable
                                    tasks={recentTasks}
                                    title="Recent Tasks"
                                    isOverdue={false}
                                />
                                <TaskTable
                                    tasks={overdueTasks}
                                    title="Overdue Tasks"
                                    isOverdue={true}
                                />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
