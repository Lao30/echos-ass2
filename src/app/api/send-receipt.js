// pages/api/send-receipt.js
import { jsPDF } from "jspdf";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const {
    name,
    email,
    eventTitle,
    venue,
    date,
    time,
    category,
    seat,
    paymentMethod,
    amount,
  } = req.body;

  // Validasi
  if (
    !name ||
    !email ||
    !eventTitle ||
    !seat ||
    !paymentMethod ||
    !amount
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Buat PDF
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("Payment Receipt", 20, y);
    y += 20;
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 20, y);
    y += 10;
    doc.text(`Email: ${email}`, 20, y);
    y += 10;
    doc.text(`Event: ${eventTitle}`, 20, y);
    y += 10;
    if (venue) { doc.text(`Venue: ${venue}`, 20, y); y += 10; }
    if (date)  { doc.text(`Date: ${new Date(date).toLocaleDateString()}`, 20, y); y += 10; }
    if (time)  { doc.text(`Time: ${time}`, 20, y); y += 10; }
    if (category) { doc.text(`Category: ${category}`, 20, y); y += 10; }
    doc.text(`Seat: ${seat}`, 20, y); y += 10;
    doc.text(`Payment: ${paymentMethod}`, 20, y); y += 10;
    doc.text(`Total: Rp ${Number(amount).toLocaleString()}`, 20, y);

    // Kirim PDF
    const pdfBytes = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${seat}.pdf`
    );
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("PDF gen error:", err);
    return res.status(500).json({ message: "Failed to generate receipt" });
  }
}
