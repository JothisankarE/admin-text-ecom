import React, { useEffect, useState } from "react";
import './Content.css';
import axios from 'axios';
import { url } from '../../assets/assets';
import { toast } from "react-toastify";

const Content = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: "0",
    users: 0,
    tickets: 0
  });

  const fetchDashboardData = async (isManual = false) => {
    setLoading(true);
    try {
      const [statsRes, activityRes, chatsRes] = await Promise.all([
        axios.get(`${url}/api/order/stats`),
        axios.get(`${url}/api/user/activity`),
        axios.get(`${url}/api/chat/list`) // Fetch chats to count them
      ]);

      let ticketCount = 0;
      if (chatsRes.data.success) {
        // Filter chats that have issueType (meaning they are tickets) or just count all pending
        ticketCount = chatsRes.data.data.filter(c => c.issueType || c.status === 'Pending').length;
      }

      if (statsRes.data.success) {
        setStats({ ...statsRes.data.data, tickets: ticketCount });
      }
      if (activityRes.data.success) {
        setActivity(activityRes.data.data);
      }

      if (isManual) {
        toast.success("Dashboard data refreshed!");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to refresh dashboard");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        const response = await axios.post(`${url}/api/user/remove`, { id: userId });
        if (response.data.success) {
          toast.success("User removed successfully");
          fetchDashboardData();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Error removing user");
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <main className="dashboard-container">
      <div className="dashboard-header animate-slide-down">
        <div className="header-text">
          <h2>Admin Dashboard</h2>
          <p>Real-time overview of your store's performance</p>
        </div>
        <button
          className={`refresh-btn ${loading ? 'loading' : ''}`}
          onClick={() => fetchDashboardData(true)}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon products-icon">📦</div>
          <div>
            <h3>Total Products</h3>
            <p className="stat-number">{stats.products}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon orders-icon">🛒</div>
          <div>
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.orders}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon revenue-icon">💰</div>
          <div>
            <h3>Revenue (₹)</h3>
            <p className="stat-number">{stats.revenue}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="stat-icon users-icon">👥</div>
          <div>
            <h3>Total Users</h3>
            <p className="stat-number">{stats.users}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="stat-icon revenue-icon" style={{ background: '#fff3e0', color: '#ff9800' }}>🎫</div>
          <div>
            <h3>Open Tickets</h3>
            <p className="stat-number">{stats.tickets}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section animate-slide-up">
        <h3>Recent Customer Activity</h3>
        <div className="activity-table">
          <div className="activity-header regular">
            <span>User</span>
            <span>Email</span>
            <span>Last Login</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>
          {activity.length > 0 ? (
            activity.map((user, index) => {
              const isSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
              return (
                <div key={index} className="activity-row regular fade-in">
                  <div className="user-info">
                    <div className="user-avatar">{user.name ? user.name.charAt(0) : '?'}</div>
                    <div className="user-name-wrapper">
                      <span>{user.name}</span>
                      {isSuspended && <span className="suspended-badge">Suspended</span>}
                    </div>
                  </div>
                  <span>{user.email}</span>
                  <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                  <div className="user-actions" style={{ textAlign: 'right' }}>
                    <button className="user-remove-btn" onClick={() => deleteUser(user._id)} title="Remove User">
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-activity">
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Content;
