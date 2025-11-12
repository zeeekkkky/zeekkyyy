// checkout.js - Complete Checkout System with Modern Alerts

// Initialize
let currentStep = 1;
let cartItems = [];
let shippingCost = 15000;

// Load cart items from localStorage
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems = cart;
    displayOrderItems();
    updateOrderSummary();
}

// Display order items in summary
function displayOrderItems() {
    const orderItemsContainer = document.getElementById('orderItems');
    
    if (cartItems.length === 0) {
        orderItemsContainer.innerHTML = '<p style="text-align: center; color: #999;">Keranjang kosong</p>';
        return;
    }
    
    orderItemsContainer.innerHTML = cartItems.map(item => `
        <div class="order-item">
            <div class="item-info">
                <div style="font-weight: 600; margin-bottom: 0.3rem;">${item.name}</div>
                <div style="color: #666; font-size: 0.9rem;">Jumlah: ${item.quantity}</div>
            </div>
            <div style="font-weight: 700; color: var(--primary-color);">
                Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
            </div>
        </div>
    `).join('');
}

// Update order summary
function updateOrderSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost;
    
    document.getElementById('subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('shipping').textContent = `Rp ${shippingCost.toLocaleString('id-ID')}`;
    document.getElementById('total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Modern Alert Toast Function - ONLY FOR ERRORS
function showAlert(type, title, message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-toast');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-toast ${type}`;
    
    const iconMap = {
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    alertDiv.innerHTML = `
        <div class="alert-content">
            <i class="fas ${iconMap[type]} alert-icon"></i>
            <div class="alert-text">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Show alert with animation
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 400);
    }, 5000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    
    // Shipping method change
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'regular') {
                shippingCost = 15000;
            } else if (this.value === 'express') {
                shippingCost = 30000;
            }
            updateOrderSummary();
            
            // Update active class
            document.querySelectorAll('.shipping-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.closest('.shipping-option').classList.add('active');
        });
    });
    
    // Payment method change
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-method').forEach(opt => {
                opt.classList.remove('active');
            });
            this.closest('.payment-method').classList.add('active');
        });
    });
    
    // Set initial active states
    document.querySelector('input[name="shipping"]:checked').closest('.shipping-option').classList.add('active');
    document.querySelector('input[name="payment"]:checked').closest('.payment-method').classList.add('active');
    
    // Form submission
    document.getElementById('checkoutForm').addEventListener('submit', handleSubmit);
    
    // Phone number validation (numbers only)
    document.getElementById('phone').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Postal code validation (numbers only)
    document.getElementById('postalCode').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});

// Navigation functions
function nextStep(step) {
    if (validateStep(step)) {
        currentStep = step + 1;
        showStep(currentStep);
        updateProgressBar();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep(step) {
    currentStep = step - 1;
    showStep(currentStep);
    updateProgressBar();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
}

function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Validation - NO SUCCESS ALERTS
function validateStep(step) {
    if (step === 1) {
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!fullName) {
            showAlert('error', 'Data Tidak Lengkap', 'Mohon masukkan nama lengkap Anda');
            document.getElementById('fullName').focus();
            return false;
        }
        
        if (!email) {
            showAlert('error', 'Data Tidak Lengkap', 'Mohon masukkan alamat email Anda');
            document.getElementById('email').focus();
            return false;
        }
        
        if (!isValidEmail(email)) {
            showAlert('error', 'Email Tidak Valid', 'Format email tidak sesuai. Contoh: nama@email.com');
            document.getElementById('email').focus();
            return false;
        }
        
        if (!phone) {
            showAlert('error', 'Data Tidak Lengkap', 'Mohon masukkan nomor telepon Anda');
            document.getElementById('phone').focus();
            return false;
        }
        
        if (!isValidPhone(phone)) {
            showAlert('error', 'Nomor Telepon Tidak Valid', 'Nomor telepon harus 10-13 digit dan dimulai dengan 08');
            document.getElementById('phone').focus();
            return false;
        }
        
        // Data valid - no alert, just proceed
        return true;
    }
    
    if (step === 2) {
        const address = document.getElementById('address').value.trim();
        const province = document.getElementById('province').value.trim();
        const city = document.getElementById('city').value.trim();
        const postalCode = document.getElementById('postalCode').value.trim();
        
        if (!address) {
            showAlert('error', 'Data Tidak Lengkap', 'Mohon masukkan alamat lengkap Anda');
            document.getElementById('address').focus();
            return false;
        }
        
        if (!province) {
            showAlert('error', 'Data Tidak Lengkap', 'Mohon masukkan nama provinsi');
            document.getElementById('province').focus();
            return false;
        }
        
        if (!city) {
            showAlert('error', 'Data Tidak Lengkap', 'Mohon masukkan nama kota/kabupaten');
            document.getElementById('city').focus();
            return false;
        }
        
        if (!postalCode) {
            showAlert('error', 'Data Tidak Lengkap', 'Mohon masukkan kode pos');
            document.getElementById('postalCode').focus();
            return false;
        }
        
        if (postalCode.length !== 5) {
            showAlert('error', 'Kode Pos Tidak Valid', 'Kode pos harus terdiri dari 5 digit angka');
            document.getElementById('postalCode').focus();
            return false;
        }
        
        // Data valid - no alert, just proceed
        return true;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const phoneRegex = /^08[0-9]{8,11}$/;
    return phoneRegex.test(cleanPhone);
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    if (cartItems.length === 0) {
        showAlert('error', 'Keranjang Kosong', 'Silakan tambahkan produk ke keranjang terlebih dahulu');
        return;
    }
    
    // Collect order data
    const paymentMethodValue = document.querySelector('input[name="payment"]:checked').value;
    const paymentMethodNames = {
        'bca': 'Transfer Bank BCA',
        'mandiri': 'Transfer Bank Mandiri',
        'bni': 'Transfer Bank BNI',
        'bri': 'Transfer Bank BRI',
        'gopay': 'GoPay',
        'dana': 'DANA',
        'ovo': 'OVO',
        'shopeepay': 'ShopeePay',
        'qris': 'QRIS',
        'cod': 'Cash on Delivery (COD)'
    };
    
    const orderData = {
        orderId: 'ORD-' + Date.now(),
        personalInfo: {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        },
        shipping: {
            address: document.getElementById('address').value,
            province: document.getElementById('province').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            method: document.querySelector('input[name="shipping"]:checked').value
        },
        payment: {
            method: paymentMethodValue,
            methodName: paymentMethodNames[paymentMethodValue]
        },
        items: cartItems,
        subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shippingCost: shippingCost,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingCost,
        orderDate: new Date().toLocaleString('id-ID')
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Show success popup
    showSuccessPopup(orderData);
}

// Show success popup with receipt
function showSuccessPopup(orderData) {
    const shippingMethodText = orderData.shipping.method === 'regular' ? 'Regular (2-3 hari)' : 'Express (1 hari)';
    
    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h2>Pesanan Berhasil!</h2>
            <p style="color: #666; margin-bottom: 2rem;">Terima kasih atas pesanan Anda</p>
            
            <div class="receipt">
                <h3 style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px dashed #ddd;">
                    <i class="fas fa-receipt"></i> Nota Pemesanan
                </h3>
                
                <div class="receipt-section">
                    <div class="receipt-row">
                        <strong>No. Pesanan:</strong>
                        <span>${orderData.orderId}</span>
                    </div>
                    <div class="receipt-row">
                        <strong>Tanggal:</strong>
                        <span>${orderData.orderDate}</span>
                    </div>
                </div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-user"></i> Data Penerima</h4>
                    <div class="receipt-row">
                        <strong>Nama:</strong>
                        <span>${orderData.personalInfo.fullName}</span>
                    </div>
                    <div class="receipt-row">
                        <strong>Email:</strong>
                        <span>${orderData.personalInfo.email}</span>
                    </div>
                    <div class="receipt-row">
                        <strong>Telepon:</strong>
                        <span>${orderData.personalInfo.phone}</span>
                    </div>
                </div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-map-marker-alt"></i> Alamat Pengiriman</h4>
                    <p style="margin: 0; line-height: 1.6;">
                        ${orderData.shipping.address}<br>
                        ${orderData.shipping.city}, ${orderData.shipping.province}<br>
                        ${orderData.shipping.postalCode}
                    </p>
                </div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-box"></i> Daftar Pesanan</h4>
                    ${orderData.items.map(item => `
                        <div class="receipt-item">
                            <div>
                                <div style="font-weight: 600;">${item.name}</div>
                                <div style="color: #666; font-size: 0.9rem;">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</div>
                            </div>
                            <div style="font-weight: 700;">
                                Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="receipt-section">
                    <div class="receipt-row">
                        <strong>Subtotal:</strong>
                        <span>Rp ${orderData.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="receipt-row">
                        <strong>Pengiriman (${shippingMethodText}):</strong>
                        <span>Rp ${orderData.shippingCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="receipt-row total-row">
                        <strong>Total Pembayaran:</strong>
                        <strong style="color: var(--primary-color); font-size: 1.2rem;">
                            Rp ${orderData.total.toLocaleString('id-ID')}
                        </strong>
                    </div>
                </div>
                
                <div class="receipt-section">
                    <div class="receipt-row">
                        <strong>Metode Pembayaran:</strong>
                        <span>${orderData.payment.methodName}</span>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; padding: 1rem; background-color: #fff3cd; border-radius: 10px; text-align: left;">
                    <strong style="color: #856404;"><i class="fas fa-info-circle"></i> Informasi Pembayaran</strong>
                    <p style="margin: 0.5rem 0 0 0; color: #856404; font-size: 0.9rem;">
                        Silakan lakukan pembayaran sesuai metode yang dipilih. Pesanan akan diproses setelah pembayaran dikonfirmasi.
                    </p>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button onclick="printReceipt()" class="btn-secondary" style="flex: 1; padding: 1rem; border: 2px solid var(--primary-color); background: white; color: var(--primary-color); border-radius: 25px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-print"></i> Cetak Nota
                </button>
                <button onclick="window.location.href='index.html'" class="btn-primary" style="flex: 1; padding: 1rem; border: none; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border-radius: 25px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-home"></i> Kembali ke Beranda
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

// Print receipt function
function printReceipt() {
    window.print();
}