/**
 * script.js
 * Main JavaScript file for Toko Zek
 * Author: Zak
 * Last Updated: 2025-11-10
 */

// Data Produk
const products = {
    fashion: [
        {
            id: 'f1',
            name: 'Casual White T-Shirt',
            price: 159000,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            category: 'fashion',
            description: ''
        },
        {
            id: 'f2',
            name: 'Classic Denim Jeans',
            price: 399000,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
            category: 'fashion',
            description: ''
        },
        {
            id: 'f3',
            name: 'Premium Leather Jacket',
            price: 899000,
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
            category: 'fashion',
            description: ''
        },
        {
            id: 'f4',
            name: 'Designer Sunglasses',
            price: 299000,
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
            category: 'fashion',
            description: ''
        },
        {
            id: 'f5',
            name: 'Urban Backpack',
            price: 459000,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
            category: 'fashion',
            description: ''
        }
    ],
    sports: [
        {
            id: 's1',
            name: 'Pro Running Shoes',
            price: 1299000,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
            category: 'sports',
            description: ''
        },
        {
            id: 's2',
            name: 'Competition Basketball',
            price: 299000,
            image: 'https://images.unsplash.com/photo-1544450804-9e5f64cb18de?w=500',
            category: 'sports',
            description: ''
        },
        {
            id: 's3',
            name: 'Premium Yoga Mat',
            price: 259000,
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
            category: 'sports',
            description: ''
        },
        {
            id: 's4',
            name: 'Professional Dumbbell Set',
            price: 799000,
            image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500',
            category: 'sports',
            description: ''
        },
        {
            id: 's5',
            name: 'Sports Water Bottle',
            price: 159000,
            image: 'https://images.unsplash.com/photo-1550505095-81378a674395?w=500',
            category: 'sports',
            description: ''
        }
    ],
    electronics: [
        {
            id: 'e1',
            name: 'Pro Wireless Earbuds',
            price: 1599000,
            image: 'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=500',
            category: 'electronics',
            description: ''
        },
        {
            id: 'e2',
            name: 'Smart Watch Pro',
            price: 2999000,
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
            category: 'electronics',
            description: ''
        },
        {
            id: 'e3',
            name: 'Bluetooth Speaker',
            price: 899000,
            image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
            category: 'electronics',
            description: ''
        },
        {
            id: 'e4',
            name: 'Gaming Mouse RGB',
            price: 599000,
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
            category: 'electronics',
            description: ''
        },
    ]
};

class Store {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.displayProducts('all');
        this.setupEventListeners();
        this.updateCartCount();
        this.initMobileMenu();
    }

    displayProducts(category) {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;

        productGrid.innerHTML = '';
        let productsToShow = [];

        if (category === 'all') {
            productsToShow = Object.values(products).flat();
        } else {
            productsToShow = products[category] || [];
        }

        productsToShow.forEach(product => {
            const productCard = this.createProductCard(product);
            productGrid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p>${product.description}</p>
                <button class="add-to-cart" onclick="store.addToCart('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> 
                    Tambah ke Keranjang
                </button>
            </div>
        `;
        return card;
    }

    addToCart(productId) {
        const product = this.findProduct(productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            if (existingItem.quantity >= 10) {
                this.showNotification('Maksimum 10 item per produk', 'warning');
                return;
            }
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Produk ditambahkan ke keranjang');
    }

    findProduct(productId) {
        return Object.values(products).flat().find(p => p.id === productId);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((total, item) => total + (item.quantity || 1), 0);
            cartCount.textContent = totalItems;
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
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.displayProducts(button.dataset.filter);
            });
        });
    }

    initMobileMenu() {
        const hamburger = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');

        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                }
            });
        }
    }
}

// Initialize store
const store = new Store();

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});