// import React from 'react';
// import './Sidebar.css';
// import { assets } from '../../assets/assets';
// import { NavLink } from 'react-router-dom';

// const Sidebar = () => {
//   return (
//     <div className="sidebar">
//       <div className="sidebar-options">
//         <NavLink to="/add" className="sidebar-option">
//           <img src={assets.add_icon} alt="" />
//           <p>Add Items</p>
//         </NavLink>
//         <NavLink to="/list" className="sidebar-option">
//           <img src={assets.order_icon} alt="" />
//           <p>List Items</p>
//         </NavLink>
//         <NavLink to="/orders" className="sidebar-option">
//           <img src={assets.order_icon} alt="" />
//           <p>Orders</p>
//         </NavLink>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { assets } from '../../assets/assets'; // Adjust import based on your assets path

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Admin Dashboard</h3>
      </div>
      <div className="sidebar-options">
        <NavLink to="/" className="sidebar-option">
          <img src={assets.order_icon} alt="Dashboard" className="sidebar-icon" />
          <p>Dashboard</p>
        </NavLink>
        <NavLink to="/add" className="sidebar-option">
          <img src={assets.add_icon} alt="Add Icon" className="sidebar-icon" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to="/list" className="sidebar-option">
          <img src={assets.order_icon} alt="Order Icon" className="sidebar-icon" />
          <p>List Items</p>
        </NavLink>
        <NavLink to="/orders" className="sidebar-option">
          <img src={assets.order_icon} alt="Orders Icon" className="sidebar-icon" />
          <p>Orders</p>
        </NavLink>
        <NavLink to="/queries" className="sidebar-option">
          <span className="sidebar-icon" style={{ fontSize: '20px' }}>💬</span>
          <p>Queries</p>
        </NavLink>
        <NavLink to="/deleted-orders" className="sidebar-option">
          <span className="sidebar-icon" style={{ fontSize: '20px' }}>🗑️</span>
          <p>Deleted Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;

