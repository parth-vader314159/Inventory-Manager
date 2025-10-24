let products = JSON.parse(localStorage.getItem('products')) || [];
let nextId = parseInt(localStorage.getItem('nextId')) || 1;

document.addEventListener('DOMContentLoaded', function() {
    if (products.length === 0) {
        products = [
            {
                id: 1,
                productName: 'Laptop',
                category: 'Electronics',
                quantity: 15,
                price: 45000,
                supplier: 'Tech Suppliers Ltd',
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                productName: 'Mouse',
                category: 'Electronics',
                quantity: 50,
                price: 500,
                supplier: 'Tech Suppliers Ltd',
                dateAdded: new Date().toISOString()
            },
            {
                id: 3,
                productName: 'Notebook',
                category: 'Stationery',
                quantity: 8,
                price: 50,
                supplier: 'Paper Co',
                dateAdded: new Date().toISOString()
            }
        ];
        nextId = 4;
        saveToLocalStorage();
    }
    loadProducts();
});

function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('nextId', nextId.toString());
}

function loadProducts() {
    displayProducts(products);
    updateStats();
}

function displayProducts(productsToDisplay) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No products found. Add your first product!</td></tr>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        const date = new Date(product.dateAdded).toLocaleDateString('en-IN');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.productName}</td>
            <td>${product.category}</td>
            <td class="${product.quantity < 10 ? 'low-stock' : ''}">${product.quantity}</td>
            <td>₹${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.supplier}</td>
            <td>${date}</td>
            <td>
                <button onclick="editProduct(${product.id})" class="btn btn-edit">Edit</button>
                <button onclick="deleteProduct(${product.id})" class="btn btn-delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    
    const totalItems = products.reduce((sum, p) => sum + parseInt(p.quantity), 0);
    document.getElementById('totalItems').textContent = totalItems;
    
    const lowStock = products.filter(p => p.quantity < 10).length;
    document.getElementById('lowStock').textContent = lowStock;
    
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    document.getElementById('totalValue').textContent = '₹' + totalValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function showAddForm() {
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('formModal').style.display = 'block';
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.productName;
    document.getElementById('category').value = product.category;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('price').value = product.price;
    document.getElementById('supplier').value = product.supplier;
    document.getElementById('formModal').style.display = 'block';
}

function saveProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('productId').value;
    const productData = {
        productName: document.getElementById('productName').value.trim(),
        category: document.getElementById('category').value.trim(),
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value),
        supplier: document.getElementById('supplier').value.trim()
    };
    
    if (!productData.productName || !productData.category || !productData.supplier) {
        alert('Please fill in all required fields!');
        return;
    }
    
    if (productData.quantity < 0 || productData.price < 0) {
        alert('Quantity and price must be positive numbers!');
        return;
    }
    
    if (id) {
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { 
                ...products[index], 
                ...productData,
                lastUpdated: new Date().toISOString()
            };
        }
    } else {
        productData.id = nextId++;
        productData.dateAdded = new Date().toISOString();
        products.push(productData);
    }
    
    saveToLocalStorage();
    loadProducts();
    closeModal();
    
    const message = id ? 'Product updated successfully!' : 'Product added successfully!';
    alert(message);
}

function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${product.productName}"?`)) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        loadProducts();
        alert('Product deleted successfully!');
    }
}

function closeModal() {
    document.getElementById('formModal').style.display = 'none';
    document.getElementById('productForm').reset();
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayProducts(products);
        return;
    }
    
    const filtered = products.filter(product => 
        product.productName.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.supplier.toLowerCase().includes(searchTerm) ||
        product.id.toString().includes(searchTerm)
    );
    
    displayProducts(filtered);
}

function exportData() {
    if (products.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    alert('Data exported successfully!');
}

function clearAllData() {
    if (products.length === 0) {
        alert('No data to clear!');
        return;
    }
    
    if (confirm('⚠️ Are you sure you want to delete ALL products? This cannot be undone!')) {
        if (confirm('🚨 Really sure? All data will be permanently deleted!')) {
            products = [];
            nextId = 1;
            saveToLocalStorage();
            loadProducts();
            alert('All data cleared successfully!');
        }
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedProducts = JSON.parse(event.target.result);
                
                if (!Array.isArray(importedProducts)) {
                    alert('Invalid file format!');
                    return;
                }
                
                const isValid = importedProducts.every(p => 
                    p.id && p.productName && p.category && 
                    typeof p.quantity === 'number' && typeof p.price === 'number'
                );
                
                if (!isValid) {
                    alert('Invalid data structure in file!');
                    return;
                }
                
                if (confirm(`Import ${importedProducts.length} products? This will replace current data.`)) {
                    products = importedProducts;
                    nextId = Math.max(...products.map(p => p.id)) + 1;
                    saveToLocalStorage();
                    loadProducts();
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function sortProducts(column) {
    const sortOrder = localStorage.getItem('sortOrder') || 'asc';
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    
    products.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];
        
        if (typeof valA === 'number' && typeof valB === 'number') {
            return newOrder === 'asc' ? valA - valB : valB - valA;
        }
        
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
        
        if (newOrder === 'asc') {
            return valA < valB ? -1 : valA > valB ? 1 : 0;
        } else {
            return valA > valB ? -1 : valA < valB ? 1 : 0;
        }
    });
    
    localStorage.setItem('sortOrder', newOrder);
    displayProducts(products);
}

function filterByCategory(category) {
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

function getCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
}

window.onclick = function(event) {
    const modal = document.getElementById('formModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showAddForm();
    }
    
    if (e.key === 'Escape') {
        closeModal();
    }
});

function printReport() {
    window.print();
}

function getLowStockProducts() {
    return products.filter(p => p.quantity < 10);
}

function getStatistics() {
    return {
        totalProducts: products.length,
        totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
        totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
        lowStockCount: products.filter(p => p.quantity < 10).length,
        categories: getCategories().length,
        averagePrice: products.length > 0 
            ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
            : 0
    };
}