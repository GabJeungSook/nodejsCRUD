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

function loadOrders(data)
{
    console.log(data);
}