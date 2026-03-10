import React, { useState } from 'react'
import './Add.css'
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {

    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Lungi",
        stock: "",
        tax: "0",
        deliveryCharge: "0"
    });

    const [image, setImage] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("stock", Number(data.stock));
        formData.append("tax", Number(data.tax));
        formData.append("deliveryCharge", Number(data.deliveryCharge));

        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await axios.post(`${url}/api/food/add`, formData);
            if (response.data.success) {
                setShowSuccessPopup(true);
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: "Lungi",
                    stock: "",
                    tax: "0",
                    deliveryCharge: "0"
                })
                setImage(false);
                setTimeout(() => setShowSuccessPopup(false), 3000);
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error("Error adding product");
        }
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Name,Description,Category,Price,Stock,Image\nSample Product,This is a sample description,Lungi,100,50,sample.jpg";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "product_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        if (!bulkFile) {
            toast.error("Please select a file to upload");
            return;
        }

        const formData = new FormData();
        formData.append("file", bulkFile);

        try {
            const response = await axios.post(`${url}/api/food/bulk-add`, formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setBulkFile(null);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        }
    }

    return (
        <div className='add-page'>
            {showSuccessPopup && (
                <div className="success-popup-overlay">
                    <div className="success-popup">
                        <div className="popup-icon">✅</div>
                        <h3>Product Added!</h3>
                        <p>The product has been successfully added to your inventory.</p>
                        <button onClick={() => setShowSuccessPopup(false)}>Close</button>
                    </div>
                </div>
            )}

            <div className="page-header">
                <h3>Add New Product</h3>
                <p>Fill in the details below to add a new item to your collection.</p>
            </div>

            <div className="add-container">
                <form className='add-form' onSubmit={onSubmitHandler}>
                    <div className="form-left">
                        <div className="card-section">
                            <p className="section-title">Product Visual</p>
                            <div className="image-upload-wrapper">
                                <label htmlFor="image" className="main-upload-area">
                                    {image ? (
                                        <div className="main-preview">
                                            <img src={URL.createObjectURL(image)} alt="Preview" />
                                            <div className="preview-overlay">
                                                <span>Change Photo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="placeholder">
                                            <div className="icon-circle">
                                                <i className="upload-icon">📸</i>
                                            </div>
                                            <p className="primary-text">Upload Image</p>
                                            <p className="secondary-text">PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                </label>
                                <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
                            </div>
                        </div>
                    </div>

                    <div className="form-right">
                        <div className="card-section">
                            <p className="section-title">General Information</p>
                            <div className='input-block'>
                                <label>Product Name</label>
                                <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='e.g. Premium Silk Lungi' required />
                            </div>
                            <div className='input-block'>
                                <label>Description</label>
                                <textarea name='description' onChange={onChangeHandler} value={data.description} rows={5} placeholder='Provide a detailed description of the product...' required />
                            </div>
                        </div>

                        <div className="card-section spacer">
                            <p className="section-title">Pricing & Inventory</p>
                            <div className="form-grid">
                                <div className='input-block'>
                                    <label>Category</label>
                                    <select name='category' onChange={onChangeHandler} value={data.category}>
                                        <option value="Lungi">Lungi</option>
                                        <option value="Dhoti">Dhoti</option>
                                        <option value="Bed Spread">Bed Spread</option>
                                        <option value="Bed Covers">Bed Covers</option>
                                        <option value="Pillow Covers">Pillow Covers</option>
                                        <option value="Hand Kerchiefs">Hand Kerchiefs</option>
                                        <option value="Towels">Towels</option>
                                    </select>
                                </div>
                                <div className='input-block'>
                                    <label>Base Price (₹)</label>
                                    <input type="Number" name='price' onChange={onChangeHandler} value={data.price} placeholder='0.00' required />
                                </div>
                                <div className='input-block'>
                                    <label>Tax (%) [GST]</label>
                                    <input type="Number" name='tax' onChange={onChangeHandler} value={data.tax} placeholder='0' required />
                                </div>
                                <div className='input-block'>
                                    <label>Delivery Fee (₹)</label>
                                    <input type="Number" name='deliveryCharge' onChange={onChangeHandler} value={data.deliveryCharge} placeholder='0' required />
                                </div>
                                <div className='input-block'>
                                    <label>Stock Quantity</label>
                                    <input type="Number" name='stock' onChange={onChangeHandler} value={data.stock} placeholder='0' required />
                                </div>
                            </div>

                            <div className="pricing-summary">
                                <div className="summary-row">
                                    <span>GST Amount ({data.tax}%):</span>
                                    <span>₹{((Number(data.price) * Number(data.tax)) / 100).toFixed(2)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Final Selling Price:</span>
                                    <span className="final-price">₹{(Number(data.price) + (Number(data.price) * Number(data.tax) / 100) + Number(data.deliveryCharge)).toFixed(2)}</span>
                                </div>
                                <p className="summary-note">* Includes base price + GST + delivery charges</p>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type='submit' className='submit-btn'>
                                <span>Add Product to Store</span>
                            </button>
                        </div>
                    </div>
                </form>

                <div className="bulk-card card-section">
                    <div className="bulk-header">
                        <div>
                            <p className="section-title">Bulk Operations</p>
                            <p className="section-subtitle">Efficiency matters. Upload multiple products at once using a CSV or Excel file.</p>
                        </div>
                        <button type="button" onClick={downloadTemplate} className="download-btn">
                            <span>Get Template</span>
                        </button>
                    </div>

                    <form onSubmit={handleBulkSubmit} className="bulk-row">
                        <div className="bulk-input-wrapper">
                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                onChange={(e) => setBulkFile(e.target.files[0])}
                                className="custom-file-input"
                                id="bulk-file"
                            />
                            <label htmlFor="bulk-file" className="file-label">
                                {bulkFile ? bulkFile.name : "Select your spreadsheet file..."}
                            </label>
                        </div>
                        <button type="submit" className="upload-btn">
                            Proceed with Upload
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Add
