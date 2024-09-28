import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import PaystackPop from '@paystack/inline-js'

const CheckoutForm = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    // Prepopulate user email if logged in
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        mobileNo: '',
        country: '',
        email: '',
        shippingCost: 1000,  // Default shipping cost
    });

    // Fetch cart items from localStorage
    const [cartItems, setCartItems] = useState(() => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    });

    const [error, setError] = useState('');
    const [msg, setMsg] = useState('')
    const [loading, setLoading] = useState(false);

    const subtotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity, 0
    );
    const totalAmount = subtotal + formData.shippingCost

    const handlePayment = async (mail, amount, order) => {
        console.log('Payment data:\nEmail: ', mail, 'Order ID: ', order, 'Total amount: ', amount);
    
        try {
            const response = await fetch('https://backend-tesmi.vercel.app/checkout/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order,
                    email: mail,
                    totalAmount: amount,
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Server error: ${response.message} ${response.statusText}`);
            }
    
            const paymentJson = await response.json();
            console.log('Payment data:', paymentJson);

            
            // const popup = new PaystackPop();
            // popup.resumeTransaction(paymentJson.access_code);
            // Use Paystack inline to open the payment popup
            const handler = PaystackPop.setup({
                key: 'pk_test_f9f7ce87205e570cc61c87806e4c0e1a57668324',  // Replace with your Paystack public key
                email: mail,
                amount: amount * 100,  // Paystack expects the amount in kobo
                ref: paymentJson.paymentReference,  // Use the payment reference from your backend
                onClose: () => {
                    alert('Transaction was not completed, window closed.');
                },
                callback: function (response) {
                    // Handle the payment verification on successful transaction
                    alert('Payment completed! Reference: ' + response.reference);

                    // Optionally, you can call your backend to verify the payment here
                    navigate('/payment-success');  // Redirect user to success page
                },
            });

        handler.openIframe(); 
    
        } catch (err) {
            console.error('Error: ', err);
        }
    };
    

    useEffect(() => {
        // Calculate subtotal based on cart items
        const subtotal = cartItems.reduce(
            (acc, item) => acc + item.price * item.quantity, 0
        );
        setFormData((prevData) => ({
            ...prevData,
            subtotal,
            totalAmount: subtotal + formData.shippingCost
        }));
    }, [cartItems, formData.shippingCost]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('https://backend-tesmi.vercel.app/checkout/place-order', {
                userId: user ? user.id : null,  // For guest checkout
                items: cartItems.map((item) => ({
                    productId: item._id, // Assuming each item has an `_id` from the database
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                })),
                subtotal: formData.subtotal,
                shippingCost: formData.shippingCost,
                totalAmount: totalAmount,
                shippingAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    mobileNo: formData.mobileNo,
                    country: formData.country,
                    email: formData.email
                },
            });

            const { orderId, message } = response.data;
            console.log('order id: ', orderId)
            setMsg(message)
            alert(message);
            handlePayment(formData.email, totalAmount, orderId)
            
        } catch (err) {
            console.log(
                'userid: ', user.id,  // For guest checkout
                "cart items: ", cartItems.map((item) => ({
                    productId: item._id, // Assuming each item has an `_id` from the database
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price
                })),
                'subtotal: ', formData.subtotal,
                "shipping cost: ", formData.shippingCost,
                'total amount: ', formData.totalAmount,
                "shipping address: ", {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    mobileNo: formData.mobileNo,
                    country: formData.country,
                    email: formData.email
                },
            )
            console.error('error messages: ', err.response || err.message);
            setError(err.response?.data.err || 'Error placing order');
        } finally {
            setLoading(false);
            setMsg('')
        }
    };

    return (
        <div className='checkout-page'>
            <div className="left-checkout">
                <h2>Checkout</h2>
                {error && <p className='checkout-error'>{error}</p>}
                {msg && <p className='checkout-error'>{msg}</p>}
                <div className="form-hero">
                    <h2>Shipping Address</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-inputs">
                            <div>
                                <label>Street:</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    placeholder='street'
                                    required
                                />
                            </div>
                            <div className='city-state'>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder='city'
                                    required
                                />
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder='state'
                                    required
                                />
                            </div>
                            <div className='city-state'>
                                <input
                                    type="number"
                                    name="mobileNo"
                                    value={formData.mobileNo}
                                    onChange={handleInputChange}
                                    placeholder='phone number'
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder='email'
                                    required
                                />
                            </div>
                            <div>
                                <label>Country:</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder='country'
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Placing order...' : 'Place Order'}
                        </button>
                    </form>
                </div>
                <div className='shipping'>
                    <span>Shipping cost is </span><i className="fa-solid fa-naira-sign"></i>{formData.shippingCost}
                </div>
            </div>

            <div className="right-checkout">
                <h3>Order summary</h3>
                <div className="line"></div>
                <div className="product-price">
                    <span>Item's total - {cartItems.length}</span>
                    <span><i className="fa-solid fa-naira-sign"></i>{subtotal}</span>
                </div>
                <div className="real-price">
                    <span>Total</span>
                    <span><i className="fa-solid fa-naira-sign"></i>{totalAmount}</span>   
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;