// import React, { useContext } from 'react'
// import './Cart.css'
// import { StoreContext } from '../../Context/StoreContext'
// import { useNavigate } from 'react-router-dom';

// const Cart = () => {

//   const {cartItems, product_list, removeFromCart,getTotalCartAmount,url} = useContext(StoreContext);
//   const navigate = useNavigate();

//   return (
//     <div className='cart'>
//       <div className="cart-items">
//         <div className="cart-items-title">
//           <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
//         </div>
//         <br />
//         <hr />
//         {product_list.map((item, index) => {
//           if (cartItems[item._id]>0) {
//             return (<div key={index}>
//               <div className="cart-items-title cart-items-item">
//                 <img src={url+"/images/"+item.image} alt="" />
//                 <p>{item.name}</p>
//                 <p>₹{item.price}</p>
//                 <div>{cartItems[item._id]}</div>
//                 <p>₹{item.price*cartItems[item._id]}</p>
//                 <p className='cart-items-remove-icon' onClick={()=>removeFromCart(item._id)}>x</p>
//               </div>
//               <hr />
//             </div>)
//           }
//         })}
//       </div>
//       <div className="cart-bottom">
//         <div className="cart-total">
//           <h2>Cart Totals</h2>
//           <div>
//             <div className="cart-total-details"><p>Subtotal</p><p>₹{getTotalCartAmount()}</p></div>
//             <hr />
//             <div className="cart-total-details"><p>Delivery Fee</p><p>₹{getTotalCartAmount()===0?0:5}</p></div>
//             <hr />
//             <div className="cart-total-details"><b>Total</b><b>₹{getTotalCartAmount()===0?0:getTotalCartAmount()+5}</b></div>
//           </div>
//           <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default Cart


// import React, { useContext } from 'react';
// import './Cart.css';
// import { StoreContext } from '../../Context/StoreContext';
// import { useNavigate } from 'react-router-dom';

// const Cart = () => {
//   const { cartItems, product_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
//   const navigate = useNavigate();

//   return (
//     <div className='cart'>
//       <div className="cart-items">
//         <div className="cart-items-title">
//           <p>Item</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
//         </div>
//         {product_list.map((item, index) => {
//           if (cartItems[item._id] > 0) {
//             return (
//               <div key={index} className="cart-item-card">
//                 <div className="cart-item-details">
//                   <img src={url + "/images/" + item.image} alt={item.name} className="cart-item-image" />
//                   <p>{item.name}</p>
//                   <p>₹{item.price}</p>
//                   <div>{cartItems[item._id]}</div>
//                   <p>₹{item.price * cartItems[item._id]}</p>
//                   <p className='cart-item-remove' onClick={() => removeFromCart(item._id)}>Remove</p>
//                 </div>
//                 <hr />
//               </div>
//             );
//           }
//         })}
//       </div>

//       <div className="cart-bottom">
//         <div className="cart-total">
//           <h2>Cart Totals</h2>
//           <div>
//             <div className="cart-total-details">
//               <p>Subtotal</p>
//               <p>₹{getTotalCartAmount()}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <p>Delivery Fee</p>
//               <p>₹{getTotalCartAmount() === 0 ? 0 : 5}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <b>Total</b>
//               <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 5}</b>
//             </div>
//           </div>
//           <button onClick={() => navigate('/order')} className="cart-checkout-btn">PROCEED TO CHECKOUT</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Cart;


import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, product_list, removeFromCart, getTotalCartAmount, updateCartItemQuantity, url } = useContext(StoreContext);
  const navigate = useNavigate();

  // Function to increase the quantity of a cart item
  const increaseQuantity = (itemId, stock) => {
    if (cartItems[itemId] >= stock) {
      toast.warning(`Only ${stock} items available in stock!`);
      return;
    }
    updateCartItemQuantity(itemId, cartItems[itemId] + 1);
  };

  // Function to decrease the quantity of a cart item
  const decreaseQuantity = (itemId) => {
    if (cartItems[itemId] > 1) {
      updateCartItemQuantity(itemId, cartItems[itemId] - 1);
    }
  };

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Item</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
        </div>
        {product_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            const exceedsStock = cartItems[item._id] >= item.stock;
            const isLowStock = item.stock <= 10 && item.stock > 0;
            return (
              <div key={index} className="cart-item-card">
                <div className="cart-item-details">
                  <img src={url + "/images/" + item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-name">
                    <p>{item.name}</p>
                    {isLowStock && (
                      <span className="cart-low-stock-tag">⚠️ Only {item.stock} left</span>
                    )}
                  </div>
                  <p>₹{item.price}</p>
                  <div className="cart-item-quantity">
                    <button onClick={() => decreaseQuantity(item._id)} className="qty-btn">-</button>
                    <span>{cartItems[item._id]}</span>
                    <button
                      onClick={() => increaseQuantity(item._id, item.stock)}
                      className={`qty-btn ${exceedsStock ? 'disabled' : ''}`}
                      disabled={exceedsStock}
                    >+</button>
                  </div>
                  <p>₹{item.price * cartItems[item._id]}</p>
                  <p className='cart-item-remove' onClick={() => removeFromCart(item._id)}>Remove</p>
                </div>
                {exceedsStock && (
                  <div className="cart-stock-warning">
                    ⚠️ You've reached the maximum available stock for this item
                  </div>
                )}
                <hr />
              </div>
            );
          }
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 50}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 50}</b>
            </div>
          </div>
          <button onClick={() => navigate('/order')} className="cart-checkout-btn">PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;

