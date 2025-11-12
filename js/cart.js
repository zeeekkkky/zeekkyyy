/**
 * cart.js
 * Shopping Cart functionality for Toko Zek
 * Author: Zak
 * Last Updated: 2025-11-10
 */

class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.shipping = {
            regular: 15000,
            express: 30000
        };
        this.currentShipping = this.shipping.regular;
    }

    init() {
        if (document.querySelector('.cart-container')) {
            this.displayCart();
            this.updateCartCount();
            this.setupEventListeners();
        }
    }

    displayCart() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const cartContent = document.querySelector('.cart-content');

        if (!this.cart.length) {
            emptyCart.style.display = 'block';
            cartContent.style.display = 'none';
            return;
        }

        emptyCart.style.display = 'none';
        cartContent.style.display = 'grid';
        cartItems.innerHTML = '';

        this.cart.forEach((item, index) => {
            const cartItem = this.createCartItemElement(item, index);
            cartItems.appendChild(cartItem);
        });

        this.updateSummary();
    }

    createCartItemElement(item, index) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                <div class="item-quantity">
                    <button class="quantity-btn minus" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <p class="item-subtotal">
                    Total: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
            </div>
            <button class="remove-item" data-index="${index}" aria-label="Hapus item">
                <i class="fas fa-trash"></i>
            </button>
        `;

        return cartItem;
    }

    updateSummary() {
        const subtotal = this.calculateSubtotal();
        const total = subtotal + this.currentShipping;
        const totalItems = this.getTotalItems();

        document.getElementById('totalItems').textContent = 
            `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        document.getElementById('subtotal').textContent = 
            `Rp ${subtotal.toLocaleString('id-ID')}`;
        document.getElementById('shipping').textContent = 
            `Rp ${this.currentShipping.toLocaleString('id-ID')}`;
        document.getElementById('total').textContent = 
            `Rp ${total.toLocaleString('id-ID')}`;

        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = !this.cart.length;
            checkoutBtn.style.opacity = this.cart.length ? '1' : '0.5';
        }
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateQuantity(index, change) {
        const item = this.cart[index];
        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            if (confirm('Hapus produk ini dari keranjang?')) {
                this.removeItem(index);
            }
            return;
        }

        if (newQuantity > 10) {
            this.showNotification('Maksimum 10 item per produk', 'warning');
            return;
        }

        item.quantity = newQuantity;
        this.saveCart();
        this.displayCart();
        this.showNotification('Jumlah produk diperbarui');
    }

    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.displayCart();
        this.updateCartCount();
        this.showNotification('Produk dihapus dari keranjang');
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    setupEventListeners() {
        // Quantity buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.quantity-btn');
            if (btn) {
                const index = parseInt(btn.dataset.index);
                const change = btn.classList.contains('plus') ? 1 : -1;
                this.updateQuantity(index, change);
            }
        });

        // Remove buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-item');
            if (btn) {
                const index = parseInt(btn.dataset.index);
                this.removeItem(index);
            }
        });

        // Shipping method
        const shippingInputs = document.querySelectorAll('input[name="shipping"]');
        shippingInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentShipping = this.shipping[e.target.value];
                this.updateSummary();
            });
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (!this.cart.length) {
                    this.showNotification('Keranjang belanja masih kosong', 'warning');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }
    }
}

// Initialize shopping cart
document.addEventListener('DOMContentLoaded', () => {
    const shoppingCart = new ShoppingCart();
    shoppingCart.init();
});