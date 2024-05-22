document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:8080/getNames')
    .then(response => response.json())
    .then(data => loadCustomerNames(data['data']));
    fetch('http://localhost:8080/getProducts')
    .then(response => response.json())
    .then(data => loadProducts(data['data']));

    const customerNames = document.getElementById('customer_names');
    const customerId = document.getElementById('customer-id');
    const customerCompany = document.getElementById('customer-company');
    const customerCity = document.getElementById('customer-city');
    const orderId = document.getElementById('order_id');
    const orderDate = document.getElementById('order-date');
    const shipDate = document.getElementById('shipment-date');
    const productTable = document.getElementById('products_table');

    //buttons
    const createOrder = document.getElementById('create_order');
    const viewOrder = document.getElementById('view_order');
    const cancelTransaction = document.getElementById('cancel');
    const saveOrder = document.getElementById('save_order');
    const addProduct = document.getElementById('add_product');
    var saveProduct = document.getElementById('save_product');

    //product
    const products = document.getElementById('product_list'); 
    const productId = document.getElementById('product_id');
    const productQuantity = document.getElementById('product_quantity');
    const productPrice = document.getElementById('product_price');
    const productDiscount = document.getElementById('product_discount');
    const productAmount = document.getElementById('product_amount');

    //total
    const _total_amount = document.getElementById('total_amount');
    const _total_discount_price = document.getElementById('total_discount');
    const _total_discounted_price = document.getElementById('total_discounted_amount');

    _total_amount.textContent = '0.00';
    _total_discount_price.textContent = '0.00';
    _total_discounted_price.textContent = '0.00';

     customerNames.disabled = true;
     orderId.disabled = true;
     cancelTransaction.hidden = true;
     saveOrder.hidden = true;

     products.disabled = true;
     productId.disabled = true;
     productPrice.disabled = true;
     productAmount.disabled = true;
     productQuantity.disabled = true;
     productDiscount.disabled = true;
     addProduct.disabled = true;

     function getFormattedDate(days) {
        const today = new Date();
        today.setDate(today.getDate() + days);
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        };
      
        return today.toLocaleDateString('en-US', options);
      }

     createOrder.addEventListener('click', function () {
        customerNames.disabled = false;
        createOrder.disabled = true;
        viewOrder.disabled = true;
        orderDate.value = getFormattedDate(0);
        shipDate.value = getFormattedDate(5);
        cancelTransaction.hidden = false;
        saveOrder.hidden = false;

        fetch('http://localhost:8080/getLatestOrder')
        .then(response => response.json())
        .then(data => { 
            getLatestOrderId(data);
        });

     });

     viewOrder.addEventListener('click', function () {
        orderId.disabled = false;
    });

    orderId.addEventListener('change', function () {
        fetch('http://localhost:8080/getOrder/' + orderId.value)
        .then(response => response.json())
        .then(data => { 
             displayCustomerOrder(data);
        });
    });

        cancelTransaction.addEventListener('click', function () {
            //window.location.reload();
            if (confirm('Are you sure you want to cancel this transaction?')) {
                customerNames.disabled = true;
                createOrder.disabled = false;
                viewOrder.disabled = false;
                orderId.value = '';
                orderDate.value = '';
                shipDate.value = '';
                customerId.value = '';
                customerNames.value = '';
                customerCompany.value = '';
                customerCity.value = '';
                cancelTransaction.hidden = true;
                saveOrder.hidden = true;

                products.disabled = true;
                var tbody = productTable.getElementsByTagName('tbody')[0];
                tbody.innerHTML = '';
                _total_amount.textContent = '0.00';
                _total_discount_price.textContent = '0.00';
                _total_discounted_price.textContent = '0.00';

            }
          

            
        });

    customerNames.addEventListener('change', function () {
        products.disabled = false;
        fetch('http://localhost:8080/getCustomer/' + customerNames.value)
        .then(response => response.json())
        .then(data => { 
            displayCustomerData(data);
        });
    });

    products.addEventListener('change', function () {
        addProduct.disabled = false;
        productQuantity.disabled = false;
        productDiscount.disabled = false;
        productQuantity.value = 1;
        productDiscount.value = 0;

        fetch('http://localhost:8080/getProductData/' + products.value)
        .then(response => response.json())
        .then(data => { 
            displayProduct(data);
        });
    });

    productQuantity.addEventListener('change', function () {
        var price = parseFloat(productPrice.value.replace('₱ ', '').replace(',', ''));
        var quantity = parseInt(productQuantity.value);
        var amount = price * quantity;
        var discount = parseInt(productDiscount.value);
        var total_discount = (discount / 100) * amount;
        var discounted_value = amount - total_discount;
        var formattedDiscountedValue = discounted_value.toFixed(2);
        formattedDiscountedValue = formattedDiscountedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        productAmount.value = '₱ ' + formattedDiscountedValue;
    });

    productDiscount.addEventListener('change', function () {
        var price = parseFloat(productPrice.value.replace('₱ ', '').replace(',', ''));
        var quantity = parseInt(productQuantity.value);
        var discount = parseInt(productDiscount.value);
        var amount = price * quantity;
        var total_discount = (discount / 100) * amount;
        var discounted_value = amount - total_discount;
        var formattedDiscountedValue = discounted_value.toFixed(2);
        formattedDiscountedValue = formattedDiscountedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        productAmount.value = '₱ ' + formattedDiscountedValue;
    });

    //add product to table
    addProduct.addEventListener('click', function () {
     
        const table = document.getElementById('products_table');
        const tbody = table.getElementsByTagName('tbody')[0];
        const rows = tbody.getElementsByTagName('tr');
        const product_id = products.value;
        const product_code = productId.value;
        const product_description = products.options[products.selectedIndex].text;
        const product_price = productPrice.value;
        const product_quantity = productQuantity.value;
        const product_discount = productDiscount.value;

        let existingRow = null;

        // Check if the product already exists in the table
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowProductId = row.cells[0].textContent;
            if (rowProductId === product_code) {
                existingRow = row;
                break;
            }
        }

        if (existingRow) {
          
            // If the product already exists, update the quantity
            const existingQuantity = parseInt(existingRow.cells[2].textContent);
            const newQuantity = existingQuantity + parseInt(product_quantity);
            //the amount must be recalculated
            const amount = parseFloat(product_price.replace('₱ ', '').replace(',', '')) * newQuantity;
            const value = amount * (parseInt(product_discount) / 100);
            const discount_value = '₱ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const discount_amount = amount - value;
            const discounted_amount = '₱ ' + discount_amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const product_amount = '₱ ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            existingRow.cells[2].textContent = newQuantity;
            existingRow.cells[3].textContent = product_price;
            existingRow.cells[4].textContent = product_amount;
            existingRow.cells[5].textContent = product_discount + ' %';
            existingRow.cells[6].textContent = discount_value;
            existingRow.cells[7].textContent = discounted_amount;

        } else {
            // If the product doesn't exist, add a new row
            const row = tbody.insertRow();
            const amount = parseFloat(product_price.replace('₱ ', '').replace(',', '')) * parseInt(product_quantity);
            const value = amount * (parseInt(product_discount) / 100);
            const discount_value = '₱ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const discount_amount = amount - value;
            const discounted_amount = '₱ ' + discount_amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const product_amount = '₱ ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const discount_percent = product_discount + ' %';

            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            const cell5 = row.insertCell(4);
            const cell6 = row.insertCell(5);
            const cell7 = row.insertCell(6);
            const cell8 = row.insertCell(7);

            const cellEdit = row.insertCell(8);
            const cellDelete = row.insertCell(9);
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('rounded-md', 'bg-green-800', 'px-3', 'py-2', 'text-sm', 'font-semibold', 'text-white','shadow-sm'); // Add your desired button styles
          
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('rounded-md', 'bg-red-800', 'px-3', 'py-2', 'text-sm', 'font-semibold', 'text-white','shadow-sm');

            cellEdit.appendChild(editButton);
            cellDelete.appendChild(deleteButton);

            editButton.addEventListener('click', function() {
                products.value = product_id;
                saveProduct.hidden = false;
                productQuantity.disabled = false;
                productQuantity.value = cell3.textContent;
                productDiscount.disabled = false;
                productDiscount.value = cell6.textContent.replace(' %', '');
                
                productId.value = product_code;
                productPrice.value = cell4.textContent;
                productAmount.value = cell8.textContent;

                 // Remove any previous event listener to prevent multiple updates
                saveProduct.replaceWith(saveProduct.cloneNode(true));
                saveProduct = document.getElementById('save_product');

                saveProduct.addEventListener('click', function() {
                    const amount = parseFloat(productPrice.value.replace('₱ ', '').replace(',', '')) * parseInt(productQuantity.value);
                    const value = amount * (parseInt(productDiscount.value) / 100);
                    const discount_value = '₱ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    const discount_amount = amount - value;
                    const discounted_amount = '₱ ' + discount_amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    const product_amount = '₱ ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
                    cell3.textContent = productQuantity.value;
                    cell4.textContent = productPrice.value;
                    cell5.textContent = product_amount;
                    cell6.textContent = productDiscount.value + ' %';
                    cell7.textContent = discount_value;
                    cell8.textContent = discounted_amount;
                    saveProduct.hidden = true;
    
    
    
                    let totalAmount = 0;
                    let totalDiscount = 0;
                    let totalDiscountedAmount = 0;
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const amount = parseFloat(row.cells[4].textContent.replace('₱ ', '').replace(',', ''));
                        const discount = parseFloat(row.cells[6].textContent.replace('₱ ', '').replace(',', ''));
                        const discountedAmount = parseFloat(row.cells[7].textContent.replace('₱ ', '').replace(',', ''));
                        totalAmount += amount;
                        totalDiscount += discount;
                        totalDiscountedAmount += discountedAmount;
                    }
            
                    _total_amount.textContent = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    _total_discount_price.textContent = totalDiscount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    _total_discounted_price.textContent = totalDiscountedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    
                    clearProductFields();
                });
            });
          
            deleteButton.addEventListener('click', function() {
                //confirm delete
                if (confirm('Are you sure you want to delete this product?')) {
                    row.remove();
                    let totalAmount = 0;
                    let totalDiscount = 0;
                    let totalDiscountedAmount = 0;
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const amount = parseFloat(row.cells[4].textContent.replace('₱ ', '').replace(',', ''));
                        const discount = parseFloat(row.cells[6].textContent.replace('₱ ', '').replace(',', ''));
                        const discountedAmount = parseFloat(row.cells[7].textContent.replace('₱ ', '').replace(',', ''));
                        totalAmount += amount;
                        totalDiscount += discount;
                        totalDiscountedAmount += discountedAmount;
                    }
            
                    _total_amount.textContent = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    _total_discount_price.textContent = totalDiscount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    _total_discounted_price.textContent = totalDiscountedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    
                    clearProductFields();
                }
            });



            cell1.textContent = product_code;
            cell2.textContent = product_description;
            cell3.textContent = product_quantity;
            cell4.textContent = product_price;
            cell5.textContent = product_amount;
            cell6.textContent = discount_percent;
            cell7.textContent = discount_value;
            cell8.textContent = discounted_amount;

            cell1.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell2.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell3.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell4.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell5.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell6.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell7.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell8.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
        }

        // Calculate the total amount, total discount, and total discounted amount
        let totalAmount = 0;
        let totalDiscount = 0;
        let totalDiscountedAmount = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const amount = parseFloat(row.cells[4].textContent.replace('₱ ', '').replace(',', ''));
            const discount = parseFloat(row.cells[6].textContent.replace('₱ ', '').replace(',', ''));
            const discountedAmount = parseFloat(row.cells[7].textContent.replace('₱ ', '').replace(',', ''));
            totalAmount += amount;
            totalDiscount += discount;
            totalDiscountedAmount += discountedAmount;
        }

        _total_amount.textContent = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        _total_discount_price.textContent = totalDiscount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        _total_discounted_price.textContent = totalDiscountedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        clearProductFields();
    });
})


function clearProductFields()
{
    const products = document.getElementById('product_list'); 
    const productId = document.getElementById('product_id');
    const productQuantity = document.getElementById('product_quantity');
    const productPrice = document.getElementById('product_price');
    const productDiscount = document.getElementById('product_discount');
    const productAmount = document.getElementById('product_amount');
    const addProduct = document.getElementById('add_product');

    addProduct.disabled = true;
    products.value = '';
    productId.value = '';
    productQuantity.value = '';
    productPrice.value = '';
    productDiscount.value = '';
    productAmount.value = '';
    productQuantity.disabled = true;
    productDiscount.disabled = true;
}

function loadCustomerNames(data)
{
    const customerNames = document.getElementById('customer_names');
    if(data.length === 0)
    {
        document.getElementById('customer_names').innerHTML = '<option value="" disabled>No customer found</option>';
        return;
    }
  for (const name of data) {
    const option = document.createElement('option');
    option.value = name.id; 
    option.textContent = name.name; 
    customerNames.appendChild(option);
  }
}

function loadProducts(data)
{
    const products = document.getElementById('product_list');
    if(data.length === 0)
    {
        document.getElementById('product_list').innerHTML = '<option value="" disabled>No products found</option>';
        return;
    }
  for (const product of data) {
    const option = document.createElement('option');
    option.value = product.id; 
    option.textContent = product.product_name; 
    products.appendChild(option);
  }

}

function displayCustomerData(data)
{
    document.getElementById('customer-id').value = data['data'][0].id;
    document.getElementById('customer-company').value = data['data'][0].company;
    document.getElementById('customer-city').value = data['data'][0].city;
}

function displayProduct(data)
{
    document.getElementById('product_id').value = data['data'][0].product_code;
    //convert data['data'][0].list_price to currency format
    var price = parseFloat(data['data'][0].list_price);
    var formattedPrice = price.toFixed(2);
    formattedPrice = formattedPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById('product_price').value = '₱ ' + formattedPrice;
    document.getElementById('product_amount').value = '₱ ' + formattedPrice;
}

function getLatestOrderId(data)
{
    const orderId = document.getElementById('order_id');
    orderId.value = data['data'][0].maxOrderId + 1;
}

function displayCustomerOrder(data)
{
    document.getElementById('customer-id').value = data['data'][0].cid;
    document.getElementById('customer-company').value = data['data'][0].com;
    document.getElementById('customer-city').value = data['data'][0].city;
    document.getElementById('customer_names').value = data['data'][0].cid;
    const orderDate = new Date(data['data'][0].od);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    document.getElementById('order-date').value = formattedDate;
    const shipDate = new Date(data['data'][0].sd);
    const formattedShipDate = shipDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    document.getElementById('shipment-date').value = formattedShipDate;
}

// function displayCustomerOrders(data)
// {
//     const table = document.getElementById('order_table');
//     const product_table = document.getElementById('products_table');
//     const order_count_label = document.getElementById('order_count');
//     const product_count_label = document.getElementById('product_count');

//     if(data['data'].length === 0)
//     {
//         table.innerHTML = '<thead class="bg-gray-50">'
//                         +'<tr>'
//                         +'<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Order ID</th>'
//                         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Order Date</th>'
//                         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ship Country</th>'
//                         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ship City</th>'
//                         +'</tr>'
//                         +'</thead>' 
//                         +'<tbody class="divide-y divide-gray-200 bg-white">'
//                         + '<tr><td colspan="4" class="text-center p-4 text-semibold text-md italic">No orders found</td></tr>'
//                         +'</tbody>';
//         order_count_label.textContent = "---";
//         product_table.innerHTML = '<thead class="bg-gray-50">'
//                         +'<tr>'
//                         +'<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product ID</th>'
//                         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit Price</th>'
//                         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>'
//                         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">% Discount</th>'
//                         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>'
//                         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discount</th>'
//                         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discounted Value</th>'
//                         +'</tr>'
//                         +'</thead>' 
//                         +'<tbody class="divide-y divide-gray-200 bg-white">'
//                         + '<tr><td colspan="7" class="text-center p-4 text-semibold text-md italic">No products found</td></tr>'
//                         +'</tbody>';
//         product_count_label.textContent = "---";
//         return;
//     }
//         table.innerHTML = ''; 
//         product_table.innerHTML = '<thead class="bg-gray-50">'
//         +'<tr>'
//         +'<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product ID</th>'
//         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit Price</th>'
//         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>'
//         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">% Discount</th>'
//         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>'
//         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discount</th>'
//         +'<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discounted Value</th>'
//         +'</tr>'
//         +'</thead>' 
//         +'<tbody class="divide-y divide-gray-200 bg-white">'
//         + '<tr><td colspan="7" class="text-center p-4 text-semibold text-md italic">No orders selected</td></tr>'
//         +'</tbody>';
//         // Create table header only when data is present
//         const thead = document.createElement('thead');
//         thead.classList.add('bg-gray-50');
//         const headerRow = document.createElement('tr');
//         headerRow.innerHTML = `
//         <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Order ID</th>
//         <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Order Date</th>
//         <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ship Country</th>
//         <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ship City</th>
//       `;
//       thead.appendChild(headerRow);
//       table.appendChild(thead);
//       const tbody = document.createElement('tbody');
//       let selectedRow = null;
//         for (const order of data['data']) {
//             const orderDate = new Date(order.order_date);
//             const formattedDate = orderDate.toLocaleDateString('en-US', {
//             month: 'long', 
//             day: 'numeric',  
//             year: 'numeric'   
//             });

//             const row = tbody.insertRow();
//     row.addEventListener('click', function() {
//         if (selectedRow) {
//             selectedRow.classList.remove('bg-gray-300'); 
//           }
//           selectedRow = this;
//           this.classList.add('bg-gray-300');
//           //call function 
//           fetch('http://localhost:8080/getProducts/' + order.id)
//           .then(response => response.json())
//           .then(data => { 
//             displayOrderProducts(data);
//           });
//       });


            
//     for (let i = 0; i < 4; i++) { 
//         const cell = row.insertCell(i);
//         cell.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-sm', 'font-medium', 'text-gray-900');
//         cell.textContent =  (i === 1) ? formattedDate : (i === 2) ? order.ship_address : (i === 3) ? order.ship_city : order.id;
//       }
//     }
//         table.appendChild(tbody);
//         order_count_label.textContent = "There are "+ data['data'].length + " sales order record(s) for Customer ID: " + customerIds.value;
// }

// function displayOrderProducts(data)
// {
//     const table = document.getElementById('products_table');
//     const product_count_label = document.getElementById('product_count');
//     if(data['data'].length === 0)
//     {
//         table.innerHTML = '<thead class="bg-gray-50">'
//         +'<tr>'
//         +'<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product ID</th>'
//         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit Price</th>'
//         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>'
//         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">% Discount</th>'
//         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>'
//         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discount</th>'
//         +'<th scope="col" class="px-3 pr-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discounted Value</th>'
//         +'</tr>'
//         +'</thead>' 
//         +'<tbody class="divide-y divide-gray-200 bg-white">'
//         + '<tr><td colspan="7" class="text-center p-4 text-semibold text-md italic">No products found</td></tr>'
//         +'</tbody>';
//         product_count_label.textContent = "---";
//         return;
       
//     }
//     table.innerHTML = '';   

//     const thead = document.createElement('thead');
//     thead.classList.add('bg-gray-50');
//     const headerRow = document.createElement('tr');
//     headerRow.innerHTML = `
//     <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product ID</th>
//     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit Price</th>
//     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
//     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">% Discount</th>
//     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
//     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discount</th>
//     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Discounted Value</th>
//     `;
//     thead.appendChild(headerRow);
//     table.appendChild(thead);
//     const tbody = document.createElement('tbody');
//     var total_amount = 0;
//         var total_discount_price = 0;
//         var total_discounted_value = 0;
//     for (const product of data['data']) {
//         const row = tbody.insertRow();

//         var u_price = parseFloat(product.unit_price);
//         var formattedPrice = u_price.toFixed(2);
//         formattedPrice = formattedPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//         var discount = parseInt(product.discount);
//         var formattedDiscount = discount.toFixed(2);
//         formattedDiscount = formattedDiscount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//         var quantity = parseInt(product.quantity);
//         var amount = u_price * quantity;
//         var formattedAmount = amount.toFixed(2);
//         formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//         var total_discount = (discount / 100) * amount;
//         var formattedTotalDiscount = total_discount.toFixed(2);
//         formattedTotalDiscount = formattedTotalDiscount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//         var discounted_value = amount - total_discount;
//         var formattedDiscountedValue = discounted_value.toFixed(2);
//         formattedDiscountedValue = formattedDiscountedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        
//         total_amount += amount;
//         total_discount_price += total_discount;
//         total_discounted_value += discounted_value;

//         for (let i = 0; i < 7; i++) { 
          

//             const cell = row.insertCell(i);
//             cell.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-sm', 'font-medium', 'text-gray-900', 'text-right');
//             cell.textContent =  (i === 1) ? '₱ '+ formattedPrice : (i === 2) ? quantity : (i === 3) ? formattedDiscount : 
//             (i === 4) ? '₱ '+ formattedAmount : (i === 5) ? '₱ '+ formattedTotalDiscount : (i === 6) ? '₱ '+ formattedDiscountedValue : product.id;
//         }
//     }

//     total = total_amount.toFixed(2);
//     total = total.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     total_discount_price = total_discount_price.toFixed(2);
//     total_discount_price = total_discount_price.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     total_discounted_value = total_discounted_value.toFixed(2);
//     total_discounted_value = total_discounted_value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//     var t_amount = document.getElementById('total_amount');
//     t_amount.value = '₱ '+ total;
//     var t_discount = document.getElementById('total_discount_price');
//     t_discount.value = '₱ '+ total_discount_price;
//     var t_discounted_value = document.getElementById('total_discounted_price');
//     t_discounted_value.value = '₱ '+ total_discounted_value;
//     table.appendChild(tbody);
//     product_count_label.textContent = "There are "+ data['data'].length + " product(s) for Order ID: " + data['data'][0].order_id;
// }