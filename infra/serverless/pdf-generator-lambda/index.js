const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');
const s3 = new AWS.S3();
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

exports.handler = async (event) => {
  try {
    // Process SQS messages with invoice generation requests
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const { 
        invoiceId, 
        invoiceNumber, 
        userId, 
        email, 
        amount, 
        breakdown, 
        dueDate,
        billingPeriod,
        address
      } = message;
      
      // Generate PDF buffer
      const pdfBuffer = await generateInvoicePDF({
        invoiceId, 
        invoiceNumber, 
        userId, 
        amount, 
        breakdown, 
        dueDate,
        billingPeriod,
        address
      });
      
      // Upload PDF to S3
      const pdfKey = `invoices/${invoiceId}.pdf`;
      await s3.putObject({
        Bucket: process.env.INVOICE_BUCKET,
        Key: pdfKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf'
      }).promise();
      
      // Send message to email queue
      await sqs.sendMessage({
        QueueUrl: process.env.EMAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          email,
          invoiceId,
          invoiceNumber,
          amount,
          dueDate
        })
      }).promise();
      
      console.log(`Generated PDF for invoice #${invoiceNumber} and queued for email`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "PDFs generated successfully"
      })
    };
  } catch (error) {
    console.error('Error generating PDFs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error generating PDFs",
        error: error.message
      })
    };
  }
};

// Helper function to generate PDF
const generateInvoicePDF = ({ invoiceId, invoiceNumber, userId, amount, breakdown, dueDate, billingPeriod, address }) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    
    // Header
    doc.fontSize(20).text('BillFusion', { align: 'center' });
    doc.fontSize(16).text('Your Utility Bill', { align: 'center' });
    doc.moveDown();
    
    // Invoice Info
    doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(dueDate).toLocaleDateString()}`);
    doc.text(`Billing Period: ${billingPeriod}`);
    doc.moveDown();
    
    // Customer Info
    doc.fontSize(14).text('Customer Information');
    doc.fontSize(12).text(`Customer ID: ${userId}`);
    doc.text(`Billing Address: ${address}`);
    doc.moveDown();
    
    // Bill Breakdown
    doc.fontSize(14).text('Bill Breakdown');
    doc.moveDown(0.5);
    
    // Create table for bill items
    let y = doc.y;
    doc.fontSize(12).text('Service', 50, y);
    doc.text('Amount', 350, y);
    
    // Underline for table header
    y += 15;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.moveDown();
    
    y += 10;
    
    // Add each utility to the table
    Object.entries(breakdown).forEach(([utility, utilityAmount]) => {
      doc.text(utility.charAt(0).toUpperCase() + utility.slice(1), 50, y);
      doc.text(`£${utilityAmount.toFixed(2)}`, 350, y);
      y += 20;
    });
    
    // Underline for table footer
    doc.moveTo(50, y).lineTo(550, y).stroke();
    
    // Total
    doc.fontSize(14).text('Total', 50, y + 20);
    doc.text(`£${amount.toFixed(2)}`, 350, y + 20);
    
    // Footer
    doc.fontSize(10).text('Thank you for using BillFusion!', 50, 700);
    doc.text('If you have any questions, please contact support@billfusion.example.com', 50, 715);
    
    doc.end();
  });
};

