// import React, { useState, useContext, useEffect } from 'react';
// import { StoreContext } from '../../Context/StoreContext';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import './PlaceOrder.css'; // Ensure you add styles for alignment

// const PlaceOrder = () => {
//   const [data, setData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     street: '',
//     city: '',
//     state: '',
//     zipcode: '',
//     country: '',
//     phone: '',
//     cardNumber: '',
//     expiryDate: '',
//     cvc: '',
//   });

//   const [paymentMethod, setPaymentMethod] = useState(''); // Track selected payment method
//   const { getTotalCartAmount, token, product_list, cartItems, url, setCartItems } = useContext(StoreContext);
//   const navigate = useNavigate();

//   const onChangeHandler = (event) => {
//     const { name, value } = event.target;
//     setData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const placeOrder = async (e) => {
//     e.preventDefault();

//     if (!paymentMethod) {
//       toast.error('Please select a payment method');
//       return;
//     }

//     let orderItems = [];
//     product_list.forEach((item) => {
//       if (cartItems[item._id] > 0) {
//         let itemInfo = { ...item, quantity: cartItems[item._id] };
//         orderItems.push(itemInfo);
//       }
//     });

//     const orderData = {
//       userId: 'USER_ID', // Replace with actual user ID
//       items: orderItems,
//       amount: getTotalCartAmount() + 5, // Include delivery fee
//       address: data,
//       paymentMethod: paymentMethod,
//       cardDetails: paymentMethod === 'stripe' ? {
//         cardNumber: data.cardNumber,
//         expiryDate: data.expiryDate,
//         cvc: data.cvc,
//       } : null,
//     };

//     try {
//       const response = await fetch(`${url}/api/order/place`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           token: token,
//         },
//         body: JSON.stringify(orderData),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setCartItems({});
//         toast.success('Order placed successfully!');
//         navigate('/order-success');
//       } else {
//         toast.error('Error placing the order. Please try again.');
//       }
//     } catch (error) {
//       toast.error('There was an error while placing the order.');
//       console.error(error);
//     }
//   };

//   const handleCashOnDelivery = () => {
//     setPaymentMethod('cod'); // Set payment method to Cash on Delivery
//     placeOrder({ preventDefault: () => {} }); // Trigger placeOrder directly
//   };

//   useEffect(() => {
//     if (!token) {
//       toast.error('To place an order, sign in first');
//       navigate('/cart');
//     } else if (getTotalCartAmount() === 0) {
//       navigate('/cart');
//     }
//   }, [token, getTotalCartAmount, navigate]);

//   return (
//     <form onSubmit={placeOrder} className='place-order'>
//       <div className='place-order-container'>

//         {/* Left Section - Delivery Info */}
//         <div className='place-order-left'>
//           <h2>Delivery Information</h2>
//           <div className='multi-field'>
//             <input type='text' name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First name' required />
//             <input type='text' name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last name' required />
//           </div>
//           <input type='email' name='email' onChange={onChangeHandler} value={data.email} placeholder='Email address' required />
//           <input type='text' name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' required />
//           <div className='multi-field'>
//             <input type='text' name='city' onChange={onChangeHandler} value={data.city} placeholder='City' required />
//             <input type='text' name='state' onChange={onChangeHandler} value={data.state} placeholder='State' required />
//           </div>
//           <div className='multi-field'>
//             <input type='text' name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Zip code' required />
//             <input type='text' name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' required />
//           </div>
//           <input type='text' name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />
//         </div>

//         {/* Right Section - Payment & Order Summary */}
//         <div className='place-order-right'>
//           <div className='cart-total'>
//             <h2>Cart Totals</h2>
//             <div>
//               <div className='cart-total-details'><p>Subtotal</p><p>₹{getTotalCartAmount()}</p></div>
//               <hr />
//               <div className='cart-total-details'><p>Delivery Fee</p><p>₹{getTotalCartAmount() === 0 ? 0 : 5}</p></div>
//               <hr />
//               <div className='cart-total-details'><b>Total</b><b>₹{getTotalCartAmount() + 5}</b></div>
//             </div>
//           </div>

//           {/* Payment Method Selection */}
//           <div className='payment-method'>
//             <h3>Select Payment Method</h3>
//             <button type='button' className={`payment-btn ${paymentMethod === 'stripe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('stripe')}>
//               Pay with Stripe
//             </button>
//             <button type='button' className={`payment-btn ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={handleCashOnDelivery}>
//               Cash on Delivery
//             </button>
//           </div>

//           {/* Card Details (Only Show if Stripe is Selected) */}
//           {paymentMethod === 'stripe' && (
//             <div className='card-details'>
//               <h3>Enter Card Details</h3>
//               <input type="text" name="cardNumber" onChange={onChangeHandler} value={data.cardNumber} placeholder="Card Number" maxLength="19" required />
//               <div className="multi-field">
//                 <input type="text" name="expiryDate" onChange={onChangeHandler} value={data.expiryDate} placeholder="Expiry Date (MM/YY)" maxLength="5" required />
//                 <input type="text" name="cvc" onChange={onChangeHandler} value={data.cvc} placeholder="CVC" maxLength="3" required />
//               </div>
//             </div>
//           )}

//           {/* Place Order Button (Only Show if Stripe is Selected) */}
//           {paymentMethod === 'stripe' && (
//             <button className='place-order-submit' type='submit'>
//               Place Order
//             </button>
//           )}
//         </div>

//       </div>
//     </form>
//   );
// };

// export default PlaceOrder;



import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import 'react-toastify/dist/ReactToastify.css';
import './PlaceOrder.css';
import UPIPaymentPopup from '../../components/UPIPaymentPopup/UPIPaymentPopup';
import PageLoader from '../../components/PageLoader/PageLoader';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51P5LmBSAiWvaX8MZviUgOKLw5TAcK6uGvYq1yTXhb9MnPWWjRfiPymGzW0cg61mFItd7Wrowucvzz5WfDIhWvCH600SXFCoCo8'); // Using environment variable with hardcoded fallback for local testing

const PlaceOrder = () => {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    upiId: '', // Added UPI ID field
  });

  const [paymentMethod, setPaymentMethod] = useState(''); // Track selected payment method
  const [showUPIPopup, setShowUPIPopup] = useState(false); // UPI popup visibility
  const [pendingOrderId, setPendingOrderId] = useState(null); // Store order ID for UPI payment
  const [isProcessing, setIsProcessing] = useState(false); // Loading state
  const isSubmittingRef = React.useRef(false); // Hard lock against double-submission
  const { getTotalCartAmount, token, product_list, cartItems, url, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCashOnDelivery = () => {
    if (isProcessing || isSubmittingRef.current) return; // block double-click
    setPaymentMethod('cod');
    submitOrder('cod');
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    submitOrder(paymentMethod);
  };

  const submitOrder = async (method) => {
    // ── Hard duplicate-submission guard ──
    if (isSubmittingRef.current || isProcessing) return;
    isSubmittingRef.current = true;

    if (!method) {
      toast.error('Please select a payment method');
      isSubmittingRef.current = false;
      return;
    }

    // Validate UPI ID if UPI is selected
    if (method === 'upi' && !data.upiId.trim()) {
      toast.error('Please enter your UPI ID');
      isSubmittingRef.current = false;
      return;
    }

    // Validate UPI ID format (basic validation)
    if (method === 'upi' && !data.upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g., yourname@upi)');
      isSubmittingRef.current = false;
      return;
    }

    // START LOADING ANIMATION
    setIsProcessing(true);

    // Simulate a small delay for user experience ("Hang tight")
    await new Promise(resolve => setTimeout(resolve, 2000));

    let orderItems = [];
    product_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    const orderData = {
      items: orderItems,
      amount: getTotalCartAmount() + 50, // Include delivery fee (Sync with backend)
      address: data, // The address data collected from the form
      paymentMethod: method,
      upiId: method === 'upi' ? data.upiId : '', // Include UPI ID if UPI payment
    };

    try {
      const response = await fetch(`${url}/api/order/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        if (method === 'stripe') {
          setCartItems({});
          window.location.href = result.session_url; // Redirect to Stripe's checkout page
        } else if (method === 'upi') {
          setIsProcessing(false); // Stop main loader for popup
          setPendingOrderId(result.orderId);
          setShowUPIPopup(true);
          isSubmittingRef.current = false;
        } else {
          setCartItems({});
          setIsProcessing(false);
          isSubmittingRef.current = false;
          toast.success('Order placed successfully!');
          navigate('/myorders');
        }
      } else {
        setIsProcessing(false);
        isSubmittingRef.current = false;
        toast.error('Error placing the order. Please try again.');
      }
    } catch (error) {
      setIsProcessing(false);
      isSubmittingRef.current = false;
      toast.error('There was an error while placing the order.');
      console.error(error);
    }
  };

  // Handle UPI payment completion
  const handleUPIPaymentComplete = async () => {
    try {
      // Show loader again for verification
      setIsProcessing(true);

      const response = await fetch(`${url}/api/order/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: pendingOrderId,
          success: 'true',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCartItems({});
        setShowUPIPopup(false);
        toast.success('Payment successful! Order placed.');
        navigate('/myorders');
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      toast.error('Error verifying payment.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle UPI popup close
  const handleUPIPopupClose = () => {
    setShowUPIPopup(false);
    toast.info('Payment not completed. Your order is pending.');
  };




  useEffect(() => {
    if (!token) {
      toast.error('To place an order, sign in first');
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <>
      {isProcessing && <PageLoader message="Hang on tight..." />}

      <form onSubmit={placeOrder} className='place-order'>
        <div className='place-order-container'>
          <div className='place-order-left'>
            <h2>Delivery Information</h2>
            {/* Delivery fields go here */}

            <div className='multi-field'>
              <input type='text' name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First name' required />
              <input type='text' name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last name' required />
            </div>
            <input type='email' name='email' onChange={onChangeHandler} value={data.email} placeholder='Email address' required />
            <input type='text' name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' required />
            <div className='multi-field'>
              <input type='text' name='city' onChange={onChangeHandler} value={data.city} placeholder='City' required />
              <input type='text' name='state' onChange={onChangeHandler} value={data.state} placeholder='State' required />
            </div>
            <div className='multi-field'>
              <input type='text' name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Zip code' required />
              <input type='text' name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' required />
            </div>
            <input type='text' name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />

          </div>

          <div className='place-order-right'>
            <div className='cart-total'>
              <h2>Cart Totals</h2>
              <div>
                <div className='cart-total-details'>
                  <p>Subtotal</p>
                  <p>₹{getTotalCartAmount()}</p>
                </div>
                <hr />
                <div className='cart-total-details'>
                  <p>Delivery Fee</p>
                  <p>₹{getTotalCartAmount() === 0 ? 0 : 50}</p>
                </div>
                <hr />
                <div className='cart-total-details'>
                  <b>Total</b>
                  <b>₹{getTotalCartAmount() + 50}</b>
                </div>
              </div>
            </div>

            <div className='payment-method'>
              <h3>Select Payment Method</h3>
              <button
                type='button'
                className={`payment-btn ${paymentMethod === 'stripe' ? 'selected' : ''}`}
                onClick={() => !isProcessing && setPaymentMethod('stripe')}
                disabled={isProcessing}
              >
                Pay with Stripe
              </button>
              <button
                type='button'
                className={`payment-btn ${paymentMethod === 'upi' ? 'selected' : ''}`}
                onClick={() => !isProcessing && setPaymentMethod('upi')}
                disabled={isProcessing}
              >
                <span className='upi-icon'>📱</span> Pay with UPI
              </button>
              <button
                type='button'
                className={`payment-btn ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={handleCashOnDelivery}
                disabled={isProcessing}
              >
                Cash on Delivery
              </button>
            </div>

            {/* UPI Details (Only Show if UPI is Selected) */}
            {paymentMethod === 'upi' && (
              <div className='upi-details'>
                <h3>Enter UPI Details</h3>
                <div className='upi-input-container'>
                  <input
                    type="text"
                    name="upiId"
                    onChange={onChangeHandler}
                    value={data.upiId}
                    placeholder="Enter your UPI ID (e.g., yourname@paytm)"
                    className='upi-input'
                  />
                  <p className='upi-hint'>Examples: yourname@paytm, yourname@gpay, yourname@ybl</p>
                </div>
              </div>
            )}

            {(paymentMethod === 'stripe' || paymentMethod === 'upi') && (
              <button className='place-order-submit' type='submit'>
                Place Order
              </button>
            )}
          </div>
        </div>

        {/* UPI Payment Popup */}
        <UPIPaymentPopup
          isOpen={showUPIPopup}
          onClose={handleUPIPopupClose}
          onPaymentComplete={handleUPIPaymentComplete}
          upiId={data.upiId}
          amount={getTotalCartAmount() + 5}
          merchantName="ECommerce Store"
          orderId={pendingOrderId}
        />
      </form>
    </>
  );
};

export default PlaceOrder;
