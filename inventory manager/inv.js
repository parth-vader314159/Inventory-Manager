const API_URL = 'http://localhost:8888/inventory%20manager/api.php';
document.addEventListener('DOMContentLoaded', loadProducts);

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}?action=all`);
        const products = await response.json();
        displayProducts(products);
        updateStats(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${product.product_name}</td>
                <td>${product.category}</td>
                <td class="${product.quantity < 10 ? 'low-stock' : ''}">${product.quantity}</td>
                <td>₹${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.supplier}</td>
                <td>
                    <button onclick="editProduct(${product.id})" class="btn btn-edit">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="btn btn-delete">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateStats(products) {
    document.getElementById('totalProducts').textContent = products.length;
    const totalItems = products.reduce((sum, p) => sum + parseInt(p.quantity), 0);
    document.getElementById('totalItems').textContent = totalItems;
    const lowStock = products.filter(p => p.quantity < 10).length;
    document.getElementById('lowStock').textContent = lowStock;
}

function showAddForm() {
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('formModal').style.display = 'block';
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}?action=single&id=${id}`);
        const product = await response.json();
        
        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.product_name;
        document.getElementById('category').value = product.category;
        document.getElementById('quantity').value = product.quantity;
        document.getElementById('price').value = product.price;
        document.getElementById('supplier').value = product.supplier;
        document.getElementById('formModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const data = {
        product_name: document.getElementById('productName').value,
        category: document.getElementById('category').value,
        quantity: document.getElementById('quantity').value,
        price: document.getElementById('price').value,
        supplier: document.getElementById('supplier').value
    };
    
    try {
        if (id) {
            data.id = id;
            await fetch(`${API_URL}?action=update`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } else {
            // Add
            await fetch(`${API_URL}?action=add`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }
        
        closeModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
    }
});

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await fetch(`${API_URL}?action=delete&id=${id}`, {
                method: 'DELETE'
            });
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
}

function closeModal() {
    document.getElementById('formModal').style.display = 'none';
}

function searchProducts() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}
