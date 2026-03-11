import React from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const Navbar = ({ setToken }) => {

    const handleLogout = () => {
        setToken("");
        localStorage.removeItem('token');
        toast.success("Logged out successfully!");
    };

    return (
        <nav className='navbar'>
            <div className="navbar-brand">
                <img
                    src={assets.mat_logo}
                    alt="MAT Logo"
                    className="navbar-logo"
                />
                <span className="navbar-title">Admin Panel</span>
            </div>

            <div className='navbar-profile'>
                <div className="profile-info">
                    <span className="profile-role">Administrator</span>
                </div>
                <img src={assets.profile_image} alt="Profile" className='profile-avatar' />
                <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="profile-dropdown">
                    <div className="dropdown-header">
                        <img src={assets.profile_image} alt="Profile" className='dropdown-avatar' />
                        <div className="dropdown-user-info">
                            <span className="dropdown-name">Admin User</span>
                            <span className="dropdown-email">admin@mattextile.com</span>
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="logout-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
