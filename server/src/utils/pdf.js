// server/src/utils/pdf.js
const PDFDocument = require("pdfkit");

/**
 * Streams a fee payment receipt PDF directly to the HTTP response.
 */
function generateFeeReceiptPdf(res, payment) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${payment.receiptNo}.pdf`
  );

  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .fillColor("#4F46E5")
    .text("College ERP System", { align: "center" })
    .fontSize(12)
    .fillColor("#000000")
    .text("Fee Payment Receipt", { align: "center" })
    .moveDown(1.5);

  doc
    .strokeColor("#4F46E5")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke()
    .moveDown(1);

  const rows = [
    ["Receipt No.", payment.receiptNo],
    ["Date", new Date(payment.paidAt).toLocaleDateString("en-IN")],
    ["Student Name", `${payment.student.firstName} ${payment.student.lastName}`],
    ["Admission No.", payment.student.admissionNo],
    ["Payment Mode", payment.mode],
    ["Amount Paid", `Rs. ${Number(payment.amount).toFixed(2)}`],
  ];

  rows.forEach(([label, value]) => {
    doc
      .fontSize(11)
      .fillColor("#555555")
      .text(label, 50, doc.y, { continued: true, width: 200 })
      .fillColor("#000000")
      .text(`  ${value}`);
    doc.moveDown(0.5);
  });

  doc.moveDown(1);
  doc
    .strokeColor("#cccccc")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke()
    .moveDown(1);

  doc
    .fontSize(9)
    .fillColor("#888888")
    .text(
      "This is a system-generated receipt and does not require a signature.",
      { align: "center" }
    );

  doc.end();
}

module.exports = { generateFeeReceiptPdf };
