import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <h1 className="display-1 fw-bold">404</h1>
                <h2 className="mb-4">Page Not Found</h2>
                <div className="d-flex gap-3 justify-content-center">
                    <button
                        onClick={handleGoBack}
                        className="btn btn-secondary"
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Go Back
                    </button>
                    <Link to="/login" className="btn btn-dark">
                        <i className="bi bi-house me-2"></i>
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;