// Menú móvil
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navMenu').classList.toggle('active');
});

// Formulario de producto
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productName = document.getElementById('productName').value;
    const productCategory = document.getElementById('productCategory').value;
    const productPrice = document.getElementById('productPrice').value;
    const productStock = document.getElementById('productStock').value;
    
    if(productName && productCategory && productPrice && productStock) {
        alert(`Producto "${productName}" agregado correctamente a la categoría ${productCategory}.\nPrecio: $${productPrice}\nStock: ${productStock} unidades`);
        document.getElementById('productForm').reset();
        
        // agregar lógica para actualizar la tabla de productos
        // x ej nueva fila a la tabla
    } else {
        alert('Por favor complete todos los campos obligatorios.');
    }
});

// Simulación de datos en tiempo real
function updateStats() {
    const stats = document.querySelectorAll('.stat-value');
    
   
    stats.forEach(stat => {
        const currentValue = parseInt(stat.textContent.replace('$', '').replace(',', ''));
        if(!isNaN(currentValue)) {
            const change = Math.floor(Math.random() * 10) - 3; // Cambio entre -3 y +6
            const newValue = Math.max(0, currentValue + change);
            
            if(stat.textContent.includes('$')) {
                stat.textContent = '$' + newValue.toLocaleString();
            } else {
                stat.textContent = newValue;
            }
        }
    });
}

// Actualiza estadísticas cada 10 segundos
setInterval(updateStats, 10000);

// Función para mostrar/ocultar detalles de productos
document.addEventListener('DOMContentLoaded', function() {
    const tableRows = document.querySelectorAll('tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            alert(`Detalles del producto: ${this.cells[0].textContent}`);
        });
    });
});

// Función para filtrar productos (ejemplo básico)
function filterProducts() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Buscar productos...';
    input.style.marginBottom = '1rem';
    input.style.padding = '0.5rem';
    input.style.width = '100%';
    
    const productsTable = document.querySelector('.card table');
    productsTable.parentNode.insertBefore(input, productsTable);
    
    input.addEventListener('keyup', function() {
        const filter = input.value.toLowerCase();
        const rows = productsTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const productName = row.cells[0].textContent.toLowerCase();
            if (productName.indexOf(filter) > -1) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Llamar a la función de filtrado después de cargar la página
window.onload = function() {
    filterProducts();
};