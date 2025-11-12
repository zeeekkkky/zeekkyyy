// Admin Dashboard Script
const adminDashboard = {
    // Initialize dashboard
    init: function() {
        // Check if user is logged in
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = 'login.html';
            return;
        }

        this.loadAdminInfo();
        this.setupEventListeners();
        this.loadDashboardData();
        this.updateDateTime();
        this.initializeCharts();
        
        // Update date/time every minute
        setInterval(() => this.updateDateTime(), 60000);
    },

    // Load admin information
    loadAdminInfo: function() {
        const username = localStorage.getItem('adminUsername') || 'Admin';
        const loginTime = localStorage.getItem('loginTime');
        
        const adminInfoHTML = `
            <div class="admin-info">
                <div class="admin-welcome">
                    <i class="fas fa-user-circle"></i>
                    <div class="admin-details">
                        <p>Selamat datang,</p>
                        <small>${username}</small>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.sidebar-header').insertAdjacentHTML('beforeend', adminInfoHTML);
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Tab navigation
        document.querySelectorAll('.sidebar-menu li[data-tab]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Logout button
        document.querySelector('.logout a').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Product form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Product filters
        const categoryFilter = document.getElementById('categoryFilter');
        const searchProduct = document.getElementById('searchProduct');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterProducts());
        }
        
        if (searchProduct) {
            searchProduct.addEventListener('input', () => this.filterProducts());
        }

        // Order filters
        const orderStatus = document.getElementById('orderStatus');
        const orderDate = document.getElementById('orderDate');
        
        if (orderStatus) {
            orderStatus.addEventListener('change', () => this.filterOrders());
        }
        
        if (orderDate) {
            orderDate.addEventListener('change', () => this.filterOrders());
        }

        // Image preview
        const productImage = document.getElementById('productImage');
        if (productImage) {
            productImage.addEventListener('change', (e) => this.previewImage(e));
        }
    },

    // Switch between tabs
    switchTab: function(tabName) {
        // Update active menu item
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding tab content
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        
        const activeTab = document.getElementById(tabName);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.display = 'block';
        }

        // Load specific tab data
        if (tabName === 'products') {
            this.loadProducts();
        } else if (tabName === 'orders') {
            this.loadOrders();
        } else if (tabName === 'settings') {
            this.loadSettings();
        }
    },

    // Update date and time
    updateDateTime: function() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const dateTimeStr = now.toLocaleDateString('id-ID', options);
        
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            dateTimeElement.textContent = dateTimeStr;
        }
    },

    // Load dashboard statistics
    loadDashboardData: function() {
        const products = this.getProducts();
        const orders = this.getOrders();

        // Calculate statistics
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalRevenue = orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        // Update dashboard stats
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalRevenue').textContent = this.formatCurrency(totalRevenue);

        // Load recent orders
        this.loadRecentOrders();
    },

    // Load recent orders
    loadRecentOrders: function() {
        const orders = this.getOrders();
        const recentOrders = orders.slice(0, 5); // Get 5 most recent
        
        const tbody = document.querySelector('#recentOrdersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>${this.formatCurrency(order.total)}</td>
                <td><span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>${this.formatDate(order.date)}</td>
                <td>
                    <button class="btn btn-sm" onclick="adminDashboard.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Initialize charts
    initializeCharts: function() {
        // Sales chart
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                    datasets: [{
                        label: 'Penjualan',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Category chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Fashion', 'Olahraga', 'Elektronik'],
                    datasets: [{
                        data: [30, 50, 20],
                        backgroundColor: ['#3498db', '#2ecc71', '#f1c40f']
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
    },

    // Load products
    loadProducts: function() {
        const products = this.getProducts();
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        grid.innerHTML = products.map(product => `
            <div class="product-card" data-category="${product.category}">
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p class="price">${this.formatCurrency(product.price)}</p>
                <p class="category">${product.category}</p>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="adminDashboard.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminDashboard.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Filter products
    filterProducts: function() {
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchProduct').value.toLowerCase();
        const cards = document.querySelectorAll('.product-card');

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardTitle = card.querySelector('h4').textContent.toLowerCase();
            
            const categoryMatch = category === 'all' || cardCategory === category;
            const searchMatch = cardTitle.includes(search);

            card.style.display = categoryMatch && searchMatch ? 'block' : 'none';
        });
    },

    // Show add product modal
    showAddProductModal: function() {
        document.getElementById('productForm').reset();
        document.querySelector('#productModal h3').textContent = 'Tambah Produk';
        document.getElementById('productModal').classList.add('active');
        document.getElementById('productModal').style.display = 'flex';
    },

    // Edit product
    editProduct: function(id) {
        const products = this.getProducts();
        const product = products.find(p => p.id === id);
        
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDescription').value = product.description || '';
            
            document.querySelector('#productModal h3').textContent = 'Edit Produk';
            document.getElementById('productForm').setAttribute('data-edit-id', id);
            document.getElementById('productModal').classList.add('active');
            document.getElementById('productModal').style.display = 'flex';
        }
    },

    // Save product
    saveProduct: function() {
        const form = document.getElementById('productForm');
        const editId = form.getAttribute('data-edit-id');
        
        const productData = {
            id: editId || 'prod_' + Date.now(),
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseInt(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('imagePreview').querySelector('img')?.src || '../images/placeholder.jpg',
            date: new Date().toISOString()
        };

        let products = this.getProducts();
        
        if (editId) {
            // Update existing product
            products = products.map(p => p.id === editId ? productData : p);
            this.showNotification('Produk berhasil diperbarui!', 'success');
        } else {
            // Add new product
            products.push(productData);
            this.showNotification('Produk berhasil ditambahkan!', 'success');
        }

        localStorage.setItem('products', JSON.stringify(products));
        this.closeModal();
        this.loadProducts();
        form.removeAttribute('data-edit-id');
    },

    // Delete product
    deleteProduct: function(id) {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            let products = this.getProducts();
            products = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(products));
            this.loadProducts();
            this.showNotification('Produk berhasil dihapus!', 'success');
        }
    },

    // Load orders
    loadOrders: function() {
        const orders = this.getOrders();
        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>${order.items.map(item => item.name).join(', ')}</td>
                <td>${this.formatCurrency(order.total)}</td>
                <td><span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="adminDashboard.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm" onclick="adminDashboard.updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Filter orders
    filterOrders: function() {
        const status = document.getElementById('orderStatus').value;
        const date = document.getElementById('orderDate').value;
        const rows = document.querySelectorAll('#ordersTable tbody tr');

        rows.forEach(row => {
            const statusBadge = row.querySelector('.status-badge');
            const rowStatus = statusBadge.className.split('status-')[1];
            
            const statusMatch = status === 'all' || rowStatus === status;
            // Add date filtering logic here if needed

            row.style.display = statusMatch ? '' : 'none';
        });
    },

    // View order details
    viewOrder: function(id) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === id);
        
        if (order) {
            const modal = document.getElementById('orderModal');
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detail Pesanan #${order.id}</h3>
                        <button class="close-btn" onclick="this.closest('.modal').style.display='none'">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="order-info">
                            <p><strong>Pelanggan:</strong> ${order.customerName}</p>
                            <p><strong>Email:</strong> ${order.email}</p>
                            <p><strong>Telepon:</strong> ${order.phone}</p>
                            <p><strong>Alamat:</strong> ${order.address}</p>
                            <p><strong>Tanggal:</strong> ${this.formatDate(order.date)}</p>
                            <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span></p>
                        </div>
                        <h4>Produk:</h4>
                        <table class="order-items">
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}x</td>
                                    <td>${this.formatCurrency(item.price)}</td>
                                </tr>
                            `).join('')}
                        </table>
                        <div class="order-total">
                            <strong>Total: ${this.formatCurrency(order.total)}</strong>
                        </div>
                    </div>
                </div>
            `;
            modal.style.display = 'flex';
        }
    },

    // Update order status
    updateOrderStatus: function(id) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === id);
        
        if (order) {
            const newStatus = prompt('Masukkan status baru (pending/processing/completed/cancelled):', order.status);
            if (newStatus && ['pending', 'processing', 'completed', 'cancelled'].includes(newStatus)) {
                order.status = newStatus;
                localStorage.setItem('orders', JSON.stringify(orders));
                this.loadOrders();
                this.showNotification('Status pesanan berhasil diperbarui!', 'success');
            }
        }
    },

    // Load settings
    loadSettings: function() {
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        
        document.getElementById('storeName').value = settings.storeName || 'Toko Zek';
        document.getElementById('storeDescription').value = settings.storeDescription || '';
        document.getElementById('themeColor').value = settings.themeColor || '#3498db';
    },

    // Save settings
    saveSettings: function() {
        const settings = {
            storeName: document.getElementById('storeName').value,
            storeDescription: document.getElementById('storeDescription').value,
            themeColor: document.getElementById('themeColor').value
        };

        localStorage.setItem('siteSettings', JSON.stringify(settings));
        this.showNotification('Pengaturan berhasil disimpan!', 'success');
        
        // Apply theme color
        document.documentElement.style.setProperty('--primary-color', settings.themeColor);
    },

    // Preview image
    previewImage: function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 200px; margin-top: 10px;">`;
            };
            reader.readAsDataURL(file);
        }
    },

    // Close modal
    closeModal: function() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
    },

    // Get products from localStorage
    getProducts: function() {
        const products = localStorage.getItem('products');
        if (!products) {
            // Initialize with sample data
            const sampleProducts = [
                {
                    id: 'prod_1',
                    name: 'Sepatu Sneakers',
                    category: 'fashion',
                    price: 350000,
                    image: '../images/product1.jpg',
                    description: 'Sepatu sneakers berkualitas'
                },
                {
                    id: 'prod_2',
                    name: 'Bola Futsal',
                    category: 'sports',
                    price: 250000,
                    image: '../images/product2.jpg',
                    description: 'Bola futsal profesional'
                },
                {
                    id: 'prod_3',
                    name: 'Headphone Wireless',
                    category: 'electronics',
                    price: 450000,
                    image: '../images/product3.jpg',
                    description: 'Headphone dengan kualitas suara jernih'
                }
            ];
            localStorage.setItem('products', JSON.stringify(sampleProducts));
            return sampleProducts;
        }
        return JSON.parse(products);
    },

    // Get orders from localStorage
    getOrders: function() {
        const orders = localStorage.getItem('orders');
        if (!orders) {
            // Initialize with sample data
            const sampleOrders = [
                {
                    id: 'ORD001',
                    customerName: 'John Doe',
                    email: 'john@example.com',
                    phone: '081234567890',
                    address: 'Jl. Contoh No. 123, Jakarta',
                    items: [
                        { name: 'Sepatu Sneakers', quantity: 1, price: 350000 }
                    ],
                    total: 350000,
                    status: 'pending',
                    date: new Date().toISOString()
                },
                {
                    id: 'ORD002',
                    customerName: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '081234567891',
                    address: 'Jl. Contoh No. 456, Bandung',
                    items: [
                        { name: 'Bola Futsal', quantity: 2, price: 250000 }
                    ],
                    total: 500000,
                    status: 'completed',
                    date: new Date().toISOString()
                }
            ];
            localStorage.setItem('orders', JSON.stringify(sampleOrders));
            return sampleOrders;
        }
        return JSON.parse(orders);
    },

    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Get status text in Indonesian
    getStatusText: function(status) {
        const statusMap = {
            'pending': 'Menunggu',
            'processing': 'Diproses',
            'completed': 'Selesai',
            'cancelled': 'Dibatalkan'
        };
        return statusMap[status] || status;
    },

    // Show notification
    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Logout
    logout: function() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('loginTime');
            window.location.href = 'login.html';
        }
    }
};

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard.init();
});

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: -300px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10000;
        transition: right 0.3s ease;
    }
    .notification.show { right: 20px; }
    .notification.success { border-left: 4px solid #2ecc71; }
    .notification.error { border-left: 4px solid #e74c3c; }
    .notification i { font-size: 1.2rem; }
    .notification.success i { color: #2ecc71; }
    .notification.error i { color: #e74c3c; }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    .modal.active { display: flex; }
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #eee;
    }
    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }
    .close-btn:hover { color: #333; }
    .modal-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    .product-card {
        background: white;
        padding: 1rem;
        border-radius: 15px;
        box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    }
    .product-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 1rem;
    }
    .product-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    .product-filters, .order-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    .product-filters select,
    .product-filters input,
    .order-filters select,
    .order-filters input {
        padding: 0.8rem;
        border: 2px solid #eee;
        border-radius: 10px;
        font-family: inherit;
    }
    .dashboard-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    .chart-container {
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    }
    .settings-form {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 2px 15px rgba(0,0,0,0.1);
        max-width: 600px;
    }
    .admin-tab {
        display: none;
    }
    .admin-tab.active {
        display: block;
    }
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    .view-all {
        color: #3498db;
        text-decoration: none;
        font-weight: 500;
    }
    .order-info p {
        margin-bottom: 0.5rem;
    }
    .order-items {
        margin: 1rem 0;
    }
    .order-total {
        text-align: right;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 2px solid #eee;
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);