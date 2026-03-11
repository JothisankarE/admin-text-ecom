import React, { useEffect, useState } from 'react'
import './List.css'
import { url } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {

  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState("");
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`)
    if (response.data.success) {
      setList(response.data.data);
    }
    else {
      toast.error("Error")
    }
  }

  const removeItem = async (foodId) => {
    const response = await axios.post(`${url}/api/food/remove`, {
      id: foodId
    })
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    }
    else {
      toast.error("Error")
    }
  }

  const updatePriceValue = async (id) => {
    try {
      const response = await axios.post(`${url}/api/food/update-price`, {
        id: id,
        price: editPrice
      })
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingPriceId(null);
        await fetchList();
      } else {
        toast.error("Error updating price");
      }
    } catch (error) {
      toast.error("Network Error");
    }
  }

  const updateStockValue = async (id) => {
    try {
      const response = await axios.post(`${url}/api/food/update-stock`, {
        id: id,
        stock: editStock
      })
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingId(null);
        await fetchList();
      } else {
        toast.error("Error updating stock");
      }
    } catch (error) {
      toast.error("Network Error");
    }
  }

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    tax: "",
    deliveryCharge: "",
    image: null
  });

  const handleEditClick = (item) => {
    setEditData({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      stock: item.stock,
      tax: item.tax || 0,
      deliveryCharge: item.deliveryCharge || 0,
      image: null // Current image filename is already in item.image
    });
    setEditingId(null); // Close inline stock edit if open
    setEditingPriceId(null); // Close inline price edit if open
    setShowEditModal(true);
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", editData.id);
    formData.append("name", editData.name);
    formData.append("description", editData.description);
    formData.append("price", Number(editData.price));
    formData.append("category", editData.category);
    formData.append("stock", Number(editData.stock));
    formData.append("tax", Number(editData.tax));
    formData.append("deliveryCharge", Number(editData.deliveryCharge));

    // Check for images
    if (e.target.image && e.target.image.files.length > 0) {
      for (let i = 0; i < e.target.image.files.length; i++) {
        formData.append("image", e.target.image.files[i]);
      }
    }

    try {
      const response = await axios.post(`${url}/api/food/update`, formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setShowEditModal(false);
        await fetchList();
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      const serverMsg = error.response?.data?.message;
      toast.error(serverMsg || "Error updating product - Connection Issue");
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  return (
    <div className='list'>
      <div className="list-header">
        <div className="list-header-left">
          <p className="title">Product Inventory</p>
          <span className="item-count-badge">{list.length} items found</span>
        </div>
      </div>

      <div className='list-table'>
        <div className="list-table-format title">
          <b>Preview</b>
          <b>Product Details</b>
          <b>Category</b>
          <b>Base Price</b>
          <b>Selling Price (Inc. GST)</b>
          <b>Stock Status</b>
          <b>Actions</b>
        </div>
        {list.map((item, index) => {
          const isLowStock = item.stock < 10;
          return (
            <div key={index} className='list-table-format' style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="product-images-cell">
                <img src={`${url}/images/` + item.image} alt={item.name} className="main-img" />
              </div>

              <div className="product-info-cell">
                <p className="product-name">{item.name}</p>
                <div className="product-tax-info">
                  <span>GST: {item.tax || 0}%</span>
                  <span>Delivery: ₹{item.deliveryCharge || 0}</span>
                </div>
              </div>

              <div className="category-cell">
                <span className="category-tag">{item.category}</span>
              </div>

              <div className="price-cell">
                {editingPriceId === item._id ? (
                  <div className="price-edit-container">
                    <input
                      type="number"
                      className="price-input"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      autoFocus
                    />
                    <button className="price-action-btn save" onClick={() => updatePriceValue(item._id)}>✓</button>
                    <button className="price-action-btn cancel" onClick={() => setEditingPriceId(null)}>✕</button>
                  </div>
                ) : (
                  <p
                    className="price-text clickable"
                    onClick={() => {
                      setEditingPriceId(item._id);
                      setEditPrice(item.price);
                    }}
                    title="Click to edit price"
                  >
                    ₹{item.price}
                  </p>
                )}
              </div>

              <div className="selling-price-cell">
                <p className="final-selling-price">
                  ₹{(Number(item.price) + (Number(item.price) * (item.tax || 0) / 100) + (item.deliveryCharge || 0)).toFixed(2)}
                </p>
              </div>

              <div className="stock-cell">
                {editingId === item._id ? (
                  <div className="stock-edit-container">
                    <input
                      type="number"
                      className="stock-input"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      autoFocus
                    />
                    <button className="stock-action-btn save" onClick={() => updateStockValue(item._id)}>✓</button>
                    <button className="stock-action-btn cancel" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                ) : (
                  <span
                    className={`stock-badge ${isLowStock ? 'low' : 'good'}`}
                    onClick={() => {
                      setEditingId(item._id);
                      setEditStock(item.stock || 0);
                    }}
                    title="Click to edit stock"
                  >
                    <span className="stock-dot"></span>
                    {item.stock || 0} {isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                )}
              </div>

              <div className="actions-cell">
                <button className="edit-btn" onClick={() => handleEditClick(item)} title="Edit Product">
                  <span role="img" aria-label="edit">✏️</span>
                </button>
                <button className="delete-btn" onClick={() => removeItem(item._id)} title="Delete Product">
                  <span role="img" aria-label="delete">🗑️</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit Product Details</h2>
              <button className="close-modal-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    required
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  >
                    <option value="Salwar">Salwar</option>
                    <option value="Saree">Saree</option>
                    <option value="Towels">Towels</option>
                    <option value="Nighty">Nighty</option>
                    <option value="Dhoti">Dhoti</option>
                    <option value="Inskirt">Inskirt</option>
                    <option value="Lungi">Lungi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={editData.stock}
                    onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>GST Percentage (%)</label>
                  <input
                    type="number"
                    value={editData.tax}
                    onChange={(e) => setEditData({ ...editData, tax: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Charge (₹)</label>
                  <input
                    type="number"
                    value={editData.deliveryCharge}
                    onChange={(e) => setEditData({ ...editData, deliveryCharge: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group full-width">
                <label>Replace Images (Optional)</label>
                <input
                  type="file"
                  name="image"
                  multiple
                  accept="image/*"
                />
                <p className="helper-text">Leave empty to keep existing images.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
