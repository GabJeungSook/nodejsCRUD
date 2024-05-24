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
    const viewReport = document.getElementById('report_view');
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
        // saveOrder.hidden = false;

        fetch('http://localhost:8080/getLatestOrder')
        .then(response => response.json())
        .then(data => { 
            getLatestOrderId(data);
        });

     });

     viewOrder.addEventListener('click', function () {
        orderId.disabled = false;
        createOrder.disabled = true;
        viewOrder.disabled = true;
        cancelTransaction.hidden = false;
    });

    viewReport.addEventListener('click', function() {
        window.location.href = "../client/report.html";
    })

    orderId.addEventListener('change', function () {
        fetch('http://localhost:8080/getOrder/' + orderId.value)
        .then(response => response.json())
        .then(data => { 
            if(data['data'].length === 0)
            {
                alert('No order found');
                orderId.value = '';
                orderDate.value = '';
                shipDate.value = '';
                customerId.value = '';
                customerNames.value = '';
                customerCompany.value = '';
                customerCity.value = '';
                return;
            }
            else
            {
                displayCustomerOrder(data);
                fetch('http://localhost:8080/getOrderDetails/' + orderId.value)
                .then(response => response.json())
                .then(data => { 
                        displayOrderDetails(data);
                });
            }
        });
    });

        cancelTransaction.addEventListener('click', function () {
            if (confirm('Are you sure you want to clear this form?')) {
                customerNames.disabled = true;
                createOrder.disabled = false;
                viewOrder.disabled = false;
                orderId.disabled = true;
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
        saveOrder.hidden = false;

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
            existingRow.cells[3].textContent = newQuantity;
            existingRow.cells[4].textContent = product_price;
            existingRow.cells[5].textContent = product_amount;
            existingRow.cells[6].textContent = product_discount + ' %';
            existingRow.cells[7].textContent = discount_value;
            existingRow.cells[8].textContent = discounted_amount;

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
            const cell9 = row.insertCell(8);

            const cellEdit = row.insertCell(9);
            const cellDelete = row.insertCell(10);
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
                productQuantity.value = cell4.textContent;
                productDiscount.disabled = false;
                productDiscount.value = cell7.textContent.replace(' %', '');
                
                productId.value = product_code;
                productPrice.value = cell5.textContent;
                productAmount.value = cell9.textContent;

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
    
                    cell4.textContent = productQuantity.value;
                    cell5.textContent = productPrice.value;
                    cell6.textContent = product_amount;
                    cell7.textContent = productDiscount.value + ' %';
                    cell8.textContent = discount_value;
                    cell9.textContent = discounted_amount;
                    saveProduct.hidden = true;
    
    
    
                    let totalAmount = 0;
                    let totalDiscount = 0;
                    let totalDiscountedAmount = 0;
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const amount = parseFloat(row.cells[5].textContent.replace('₱ ', '').replace(',', ''));
                        const discount = parseFloat(row.cells[7].textContent.replace('₱ ', '').replace(',', ''));
                        const discountedAmount = parseFloat(row.cells[8].textContent.replace('₱ ', '').replace(',', ''));
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
                if(rows.length === 1)
                {
                    saveOrder.hidden = true;
                }

                if (confirm('Are you sure you want to delete this product?')) {
                    row.remove();
                    let totalAmount = 0;
                    let totalDiscount = 0;
                    let totalDiscountedAmount = 0;
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const amount = parseFloat(row.cells[5].textContent.replace('₱ ', '').replace(',', ''));
                        const discount = parseFloat(row.cells[7].textContent.replace('₱ ', '').replace(',', ''));
                        const discountedAmount = parseFloat(row.cells[8].textContent.replace('₱ ', '').replace(',', ''));
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


            cell1.textContent = product_id;
            cell2.textContent = product_code;
            cell3.textContent = product_description;
            cell4.textContent = product_quantity;
            cell5.textContent = product_price;
            cell6.textContent = product_amount;
            cell7.textContent = discount_percent;
            cell8.textContent = discount_value;
            cell9.textContent = discounted_amount;

            cell1.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell2.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell3.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell4.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell5.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell6.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell7.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell8.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
            cell9.classList.add('whitespace-nowrap', 'py-4', 'pl-4', 'pr-3', 'text-center', 'text-sm', 'font-medium', 'text-gray-900');
        }

        // Calculate the total amount, total discount, and total discounted amount
        let totalAmount = 0;
        let totalDiscount = 0;
        let totalDiscountedAmount = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const amount = parseFloat(row.cells[5].textContent.replace('₱ ', '').replace(',', ''));
            const discount = parseFloat(row.cells[7].textContent.replace('₱ ', '').replace(',', ''));
            const discountedAmount = parseFloat(row.cells[8].textContent.replace('₱ ', '').replace(',', ''));
            totalAmount += amount;
            totalDiscount += discount;
            totalDiscountedAmount += discountedAmount;
        }

        _total_amount.textContent = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        _total_discount_price.textContent = totalDiscount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        _total_discounted_price.textContent = totalDiscountedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        clearProductFields();
    });


    saveOrder.addEventListener('click', function () {
        const custId = customerId.value;
        const custName = customerNames.options[customerNames.selectedIndex].text;
        const custComp = customerCompany.value;
        const custCity = customerCity.value;
        const orderId = document.getElementById('order_id').value;
        var orderDate = document.getElementById('order-date').value;
        var shipDate = document.getElementById('shipment-date').value;
        const shipCountry = 'Philippines';
        const shipCity = custCity;

      

        orderDate = convertDateTime(orderDate);  
        shipDate = convertDateTime(shipDate);


        const table = document.getElementById('products_table');
        //get table row data
        const tbody = table.getElementsByTagName('tbody')[0];
        const rows = tbody.getElementsByTagName('tr');
        const products = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const product_id = row.cells[0].textContent;
            const product_code = row.cells[1].textContent;
            const product_description = row.cells[2].textContent;
            const product_quantity = row.cells[3].textContent;
            const product_price = row.cells[4].textContent;
            const product_amount = row.cells[5].textContent;
            const product_discount = row.cells[6].textContent;
            const discount_value = row.cells[7].textContent;
            const discounted_amount = row.cells[8].textContent;

            const price = parseFloat(row.cells[4].textContent.replace('₱ ', '').replace(',', ''));
            const discount = parseFloat(row.cells[6].textContent.replace('₱ ', '').replace(',', ''));
            products.push({
                product_id,
                product_code,
                product_description,
                product_quantity,
                price,
                product_amount,
                discount,
                discount_value,
                discounted_amount
            });
        }

        if (confirm('Are you sure you want to save this order?')) {

            fetch('http://localhost:8080/insertCustomerOrder/', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ custId, custName, custComp, custCity, orderId, orderDate, shipDate, shipCountry, shipCity, products}),
            })
            .then((response) => response.json())
            .then((data) => {
                let orderId = document.getElementById('order_id');
                let orderDate = document.getElementById('order-date');
                let shipDate = document.getElementById('shipment-date');
                let products = document.getElementById('product_list');

                customerNames.disabled = true;
                createOrder.disabled = false;
                viewOrder.disabled = false;
                orderId.disabled = true;
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

                alert('Order saved successfully');
            })
            .catch((error) => {
                alert('Error saving order');
            console.error('Error inserting customer', error);
            });

        }
       

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

function convertDateTime(input) {
    // Parse the input date string
    const dateTimeParts = input.split(' at ');
    const datePart = dateTimeParts[0].trim();
    const timePart = dateTimeParts[1].trim();
    
    // Create a new Date object from the parsed parts
    const date = new Date(`${datePart} ${timePart}`);
  
    // Function to pad single digit numbers with leading zero
    const pad = (num) => String(num).padStart(2, '0');
  
    // Extract the components from the Date object
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
  
    // Format the output string
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
    return formattedDateTime;
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

// function displayOrderDetails(data)
// {
//     const product_table = document.getElementById('products_table');

//     if(data['data'].length === 0)
//     {
//         product_table.innerHTML = '<thead class="bg-gray-50">'
//                         +'<tr>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product ID</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Code</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Description</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Quantity</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Unit Price</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Amount</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Percentage</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Value</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Amount</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>'
//                         +'</tr>'
//                         +'</thead>' 
//                         +'<tbody class="bg-white divide-y divide-gray-200">'
//                         + '<tr><td colspan="11" class="text-center p-4 text-semibold text-md italic">No products found</td></tr>'
//                         +'</tbody>';
//         return;
//     }

//     product_table.innerHTML = '<thead class="bg-gray-50">'
//                         +'<tr>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product ID</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Code</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Description</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Quantity</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Unit Price</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Amount</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Percentage</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Value</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Amount</th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>'
//                         +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>'
//                         +'</tr>'
//                         +'</thead>'
//                         +'<tbody class="bg-white divide-y divide-gray-200">';
//                         for (const product of data['data']) {
//                             const row = document.createElement('tr');
//                             const product_id = product.pid;
//                             const product_code = product.pc;
//                             const product_description = product.pn;
//                             const product_quantity = product.q;
//                             const product_price = product.up;
//                             const product_amount = product.amount;
//                             const product_discount = product.d;
//                             const discount_value = product.discount_value;
//                             const discounted_amount = product.discounted_amount;
//                             const discount_percent = product_discount + ' %';
//                             product_table.innerHTML += '<tr>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+product_id+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+product_code+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+product_description+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+product_quantity+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+product_price+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+product_amount+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+discount_percent+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+discount_value+'</td>'
//                             +'<td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">'+discounted_amount+'</td>'
//                             +'</tr>';
                    
//                         }
//                         product_table.innerHTML += '</tbody>';

// }

function displayOrderDetails(data) {
    const product_table = document.getElementById('products_table');

    if(data['data'].length === 0)
        {
            product_table.innerHTML = '<thead class="bg-gray-50">'
                            +'<tr>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product ID</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Code</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Description</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Quantity</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Unit Price</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Amount</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Percentage</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Value</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Amount</th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>'
                            +'<th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>'
                            +'</tr>'
                            +'</thead>' 
                            +'<tbody class="bg-white divide-y divide-gray-200">'
                            + '<tr><td colspan="11" class="text-center p-4 text-semibold text-md italic">No products found</td></tr>'
                            +'</tbody>';
            return;
        }

    // Clear the table content first
    product_table.innerHTML = '';

    // Create the table header
    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-50');
    thead.innerHTML = `
        <tr>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product ID</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Code</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Product Description</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Quantity</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Unit Price</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Amount</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Percentage</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Value</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Discount Amount</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider"></th>
        </tr>
    `;
    product_table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');
    tbody.classList.add('bg-white', 'divide-y', 'divide-gray-200');
    if (data['data'].length === 0) {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 11;
        noDataCell.classList.add('text-center', 'p-4', 'text-semibold', 'text-md', 'italic');
        noDataCell.textContent = 'No products found';
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
    } else {
        
       
        for (const product of data['data']) {
            const row = document.createElement('tr');
            const productQuantity = parseInt(product.q);

            const price = parseFloat(product.up.replace('₱ ', '').replace(',', ''));
            const unitPrice = '₱ ' + price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const amount = price * productQuantity;
            const value = amount * (parseInt(product.d) / 100);
            const discount_value = '₱ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const discount_amount = amount - value;
            const discounted_amount = '₱ ' + discount_amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const product_amount = '₱ ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const discount_percent = product.d + ' %';

            row.innerHTML = `
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${product.pid}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${product.pc}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${product.pn}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${productQuantity}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${unitPrice}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${product_amount}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${discount_percent}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${discount_value}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">${discounted_amount}</td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900"></td>
                <td class="pl-4 pr-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900"></td>
            `;
            tbody.appendChild(row);
        }

        // Calculate the total amount, total discount, and total discounted amount
        const _total_amount = document.getElementById('total_amount');
        const _total_discount_price = document.getElementById('total_discount');
        const _total_discounted_price = document.getElementById('total_discounted_amount');
        let totalAmount = 0;
        let totalDiscount = 0;
        let totalDiscountedAmount = 0;
        const rows = tbody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const amount = parseFloat(row.cells[5].textContent.replace('₱ ', '').replace(',', ''));
            const discount = parseFloat(row.cells[7].textContent.replace('₱ ', '').replace(',', ''));
            const discountedAmount = parseFloat(row.cells[8].textContent.replace('₱ ', '').replace(',', ''));
            totalAmount += amount;
            totalDiscount += discount;
            totalDiscountedAmount += discountedAmount;
        }

        _total_amount.textContent = totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        _total_discount_price.textContent = totalDiscount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        _total_discounted_price.textContent = totalDiscountedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    product_table.appendChild(tbody);
}
