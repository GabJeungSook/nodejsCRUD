document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:8080/getOrders')
    .then(response => response.json())
    .then(data => loadOrders(data['data']));



    const print = document.getElementById('print');
    const generatePDF = document.getElementById('generate_pdf');

    print.addEventListener('click', function () {
        printReport();
    });

    generatePDF.addEventListener('click', function () {
        generate();
    });
})

function printReport() {
    var printContents = document.getElementById('printable').innerHTML;
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}

function generate() {
    const { jsPDF } = window.jspdf;

    html2canvas(document.querySelector("#printable")).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();

        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save("download.pdf");
    });
}

function getFormattedDate(date_to_convert) {
    const date = new Date(date_to_convert);
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = date.toLocaleString('en-US', options);
  
    return formattedDate;
  }

function loadOrders(data)
{
    //load data into table
    const table = document.querySelector('table tbody');
    //add data to table
    if(data.length === 0)
    {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }
    let tableHtml = "";
    data.forEach(function ({order_id, name, order_date, shipped_date, ship_address, ship_city, ship_region}) {
        tableHtml += `<tr class="divide-x divide-gray-200">`;
        tableHtml += `<td class="whitespace-nowrap p-4 text-sm text-gray-500">${order_id}</td>`;
        tableHtml += `<td class="whitespace-nowrap p-4 text-sm text-gray-500">${name}</td>`;
        tableHtml += `<td class="whitespace-nowrap p-4 text-sm text-gray-500">${getFormattedDate(order_date)}</td>`;
        tableHtml += `<td class="whitespace-nowrap p-4 text-sm text-gray-500">${getFormattedDate(shipped_date)}</td>`;
        tableHtml += `<td class="whitespace-nowrap p-4 text-sm text-gray-500">${ship_address}</td>`;
        tableHtml += `<td class="whitespace-nowrap p-4 text-sm text-gray-500">${ship_city}</td>`;
        tableHtml += `<td class="whitespace-nowrap p-4 text-sm text-gray-500">${ship_region}</td>`;
        tableHtml += "</tr>";
    });
    table.innerHTML = tableHtml;
}