import React, { useEffect, useState, useRef } from 'react';
import './DeletedOrders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url } from '../../assets/assets';

/* ─── Mini Details Popup ─────────────────────────────────── */
const OrderDetailsPopup = ({ order, onClose, onDownload, downloading }) => {
    const overlayRef = useRef(null);
    const deliveryCharge = 5;
    const subtotal = order.amount - deliveryCharge;

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const pm = order.paymentMethod === 'cod'
        ? { icon: '💵', label: 'Cash on Delivery' }
        : order.paymentMethod === 'upi'
            ? { icon: '📱', label: 'UPI Payment' }
            : { icon: '💳', label: 'Card / Stripe' };

    // Close on backdrop click
    const handleBackdrop = (e) => { if (e.target === overlayRef.current) onClose(); };

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="odp-overlay" ref={overlayRef} onClick={handleBackdrop}>
            <div className="odp-popup">

                {/* Header */}
                <div className="odp-header">
                    <div className="odp-header-left">
                        <div className="odp-title-icon">📋</div>
                        <div>
                            <h2 className="odp-title">Order Details</h2>
                            <span className="odp-order-ref">#{order._id.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="odp-header-actions">
                        <button
                            className="odp-download-btn"
                            onClick={() => onDownload(order._id)}
                            disabled={downloading}
                            title="Download as PDF"
                        >
                            {downloading ? (
                                <span className="odp-spinner"></span>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download PDF
                                </>
                            )}
                        </button>
                        <button className="odp-close-btn" onClick={onClose} title="Close">✕</button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="odp-body">

                    {/* Status bar */}
                    <div className="odp-status-bar">
                        <div className="odp-status-pill delivered">✅ Delivered</div>
                        <div className="odp-status-pill deleted">🗑️ Archived {formatDate(order.deletedAt)}</div>
                        <div className="odp-status-pill payment">{pm.icon} {pm.label}</div>
                    </div>

                    {/* Items Table */}
                    <div className="odp-section">
                        <h3 className="odp-section-title">🛍️ Ordered Items</h3>
                        <table className="odp-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="odp-td-num">{i + 1}</td>
                                        <td className="odp-td-name">{item.name}</td>
                                        <td>
                                            <span className="odp-cat-badge">
                                                {item.category || item.type || 'General'}
                                            </span>
                                        </td>
                                        <td className="odp-td-center">{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        <td className="odp-td-total">₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="odp-tfoot-row">
                                    <td colSpan="5">Subtotal</td>
                                    <td>₹{subtotal}</td>
                                </tr>
                                <tr>
                                    <td colSpan="5">Delivery Charge</td>
                                    <td>₹{deliveryCharge}</td>
                                </tr>
                                <tr className="odp-grand-total">
                                    <td colSpan="5">Grand Total</td>
                                    <td>₹{order.amount}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Address + Order Info */}
                    <div className="odp-two-col">
                        <div className="odp-section">
                            <h3 className="odp-section-title">📦 Delivery Address</h3>
                            <div className="odp-address-box">
                                <p className="odp-addr-name">{order.address.firstName} {order.address.lastName}</p>
                                <p>{order.address.street}</p>
                                <p>{order.address.city}, {order.address.state} – {order.address.zipcode}</p>
                                <p>{order.address.country}</p>
                                <p className="odp-addr-phone">📞 {order.address.phone}</p>
                                {order.address.email && <p>✉️ {order.address.email}</p>}
                            </div>
                        </div>
                        <div className="odp-section">
                            <h3 className="odp-section-title">🔖 Order Summary</h3>
                            <div className="odp-info-grid">
                                {[
                                    ['Order ID', `#${order._id.slice(-6).toUpperCase()}`],
                                    ['Date Placed', formatDate(order.date)],
                                    ['Items', `${order.items.length} item${order.items.length !== 1 ? 's' : ''}`],
                                    ['Payment', `${pm.icon} ${pm.label}`],
                                    ['Status', '✅ Delivered'],
                                    ['Archived', formatDate(order.deletedAt)],
                                ].map(([label, value]) => (
                                    <div key={label} className="odp-info-row">
                                        <span className="odp-info-label">{label}</span>
                                        <span className="odp-info-value">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Main Page ─────────────────────────────────────────── */
const DeletedOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);   // popup target
    const [deletingId, setDeletingId] = useState(null);         // perm-delete spinner
    const [downloading, setDownloading] = useState(false);      // pdf spinner

    const fetchDeletedOrders = async () => {
        try {
            const res = await axios.get(`${url}/api/order/deleted`);
            if (res.data.success) setOrders(res.data.data);
            else toast.error('Error fetching deleted orders');
        } catch { toast.error('Cannot connect to server'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDeletedOrders(); }, []);

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    /* Download PDF (reuses existing /api/order/receipt endpoint) */
    const handleDownload = async (orderId) => {
        setDownloading(true);
        try {
            const res = await axios.post(
                `${url}/api/order/receipt`,
                { orderId },
                { responseType: 'blob' }
            );
            const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `order-details-${orderId.slice(-6).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
            toast.success('PDF downloaded successfully ✅');
        } catch {
            toast.error('Could not generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    /* Permanent delete */
    const handlePermanentDelete = async (orderId) => {
        if (!window.confirm(
            '⚠️  PERMANENT DELETE\n\nThis will completely erase this order from the database and CANNOT be undone.\n\nAre you absolutely sure?'
        )) return;

        setDeletingId(orderId);
        try {
            const res = await axios.post(`${url}/api/order/permanent-delete`, { orderId });
            if (res.data.success) {
                toast.success('Order permanently deleted');
                setOrders(prev => prev.filter(o => o._id !== orderId));
                if (selectedOrder?._id === orderId) setSelectedOrder(null);
            } else {
                toast.error(res.data.message || 'Failed to delete order');
            }
        } catch { toast.error('Network error — check backend'); }
        finally { setDeletingId(null); }
    };

    const paymentLabel = (m) =>
        m === 'cod' ? { icon: '💵', label: 'Cash on Delivery' } :
            m === 'upi' ? { icon: '📱', label: 'UPI Payment' } :
                { icon: '💳', label: 'Card / Stripe' };

    return (
        <div className='deleted-orders'>

            {/* Header */}
            <div className="deleted-orders-header">
                <div className="deleted-header-left">
                    <div className="deleted-icon-badge">🗑️</div>
                    <div>
                        <h3>Deleted Orders</h3>
                        <p className="deleted-subtitle">
                            {orders.length} delivered order{orders.length !== 1 ? 's' : ''} archived
                        </p>
                    </div>
                </div>
                <div className="deleted-count-badge">{orders.length}</div>
            </div>

            {/* States */}
            {loading ? (
                <div className="deleted-loading">
                    <div className="deleted-loader-ring"></div>
                    <p>Loading deleted orders…</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="deleted-empty">
                    <div className="deleted-empty-icon">📭</div>
                    <h4>No Deleted Orders</h4>
                    <p>Delivered orders that you archive will appear here.</p>
                </div>
            ) : (
                <div className="deleted-list">
                    {orders.map((order) => {
                        const pm = paymentLabel(order.paymentMethod);
                        return (
                            <div key={order._id} className="deleted-item">

                                <div className="deleted-ribbon">DELETED</div>

                                {/* Card grid */}
                                <div className="deleted-card-top">

                                    {/* Icon + ID */}
                                    <div className="deleted-item-header">
                                        <img src={assets.parcel_icon} alt="Parcel" />
                                        <div>
                                            <span className="deleted-order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                                            <span className="deleted-order-date">Placed: {formatDate(order.date)}</span>
                                        </div>
                                    </div>

                                    {/* Customer & items */}
                                    <div className="deleted-item-body">
                                        <p className="deleted-item-food">
                                            {order.items.map((it, i) =>
                                                `${it.name} x ${it.quantity}${i < order.items.length - 1 ? ', ' : ''}`
                                            )}
                                        </p>
                                        <p className="deleted-item-name">{order.address.firstName} {order.address.lastName}</p>
                                        <div className="deleted-item-address">
                                            <p>{order.address.street}, {order.address.city}</p>
                                            <p>{order.address.state}, {order.address.country}, {order.address.zipcode}</p>
                                        </div>
                                        <p className="deleted-item-phone">📞 {order.address.phone}</p>
                                    </div>

                                    {/* Right meta + actions */}
                                    <div className="deleted-item-footer">
                                        <div className="deleted-price-section">
                                            <span className="deleted-price">₹{order.amount}</span>
                                            <span className="deleted-items-count">
                                                {order.items.length} Item{order.items.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="deleted-meta">
                                            <div className="deleted-status-badge">
                                                <span className="status-dot delivered"></span>
                                                Delivered
                                            </div>
                                            <div className="deleted-timestamp">
                                                <span>🗑️ Deleted on</span>
                                                <strong>{formatDate(order.deletedAt)}</strong>
                                            </div>
                                            <div className="deleted-payment-badge">{pm.icon} {pm.label}</div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="deleted-action-btns">
                                            <button
                                                className="view-details-btn"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                                View Details
                                            </button>

                                            <button
                                                className="perm-delete-btn"
                                                onClick={() => handlePermanentDelete(order._id)}
                                                disabled={deletingId === order._id}
                                            >
                                                {deletingId === order._id ? (
                                                    <span className="perm-delete-spinner"></span>
                                                ) : (
                                                    <>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            <path d="M10 11v6M14 11v6" />
                                                            <path d="M9 6V4h6v2" />
                                                        </svg>
                                                        Permanently Delete
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Details Popup */}
            {selectedOrder && (
                <OrderDetailsPopup
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onDownload={handleDownload}
                    downloading={downloading}
                />
            )}
        </div>
    );
};

export default DeletedOrders;
