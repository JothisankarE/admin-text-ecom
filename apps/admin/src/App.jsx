import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Content from './pages/Home/Content';
import ChatQueries from './pages/ChatQueries/ChatQueries';
import DeletedOrders from './pages/DeletedOrders/DeletedOrders';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || "");

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div className='app'>
      <ToastContainer />

      {token === "" ? (
        <AdminLogin setToken={setToken} />
      ) : (
        <div className="dashboard-layout">
          <Navbar setToken={setToken} />
          <div className="app-content">
            <Sidebar />
            <div className="main-content-wrapper">
              <div className="glass-content-area">
                <Routes>
                  <Route path="/" element={<Content />} />
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                  <Route path="/queries" element={<ChatQueries />} />
                  <Route path="/deleted-orders" element={<DeletedOrders />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
