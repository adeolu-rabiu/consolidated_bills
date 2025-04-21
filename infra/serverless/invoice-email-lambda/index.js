const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'eu-west-2' });
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    // Process SQS messages
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      
      // Get customer email and invoice details
      const { email, invoiceId, invoiceNumber, amount, dueDate } = message;
      
      // Get invoice PDF from S3
      const pdfKey = `invoices/${invoiceId}.pdf`;
      const s3Response = await s3.getObject({
        Bucket: process.env.INVOICE_BUCKET,
        Key: pdfKey
      }).promise();
      
      // Convert PDF to base64
      const pdfBase64 = s3Response.Body.toString('base64');
      
      // Send email with PDF attachment
      const emailParams = {
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Body: {
            Html: {
              Data: `
                <h1>Your consolidated_bills Invoice #${invoiceNumber}</h1>
                <p>Dear Customer,</p>
                <p>Your monthly utility bill is now available. Details:</p>
                <ul>
                  <li>Invoice Number: ${invoiceNumber}</li>
                  <li>Amount: £${amount.toFixed(2)}</li>
                  <li>Due Date: ${new Date(dueDate).toLocaleDateString()}</li>
                </ul>
                <p>Please see the attached PDF for full details.</p>
                <p>Thank you for using BillFusion!</p>
              `
            }
          },
          Subject: {
            Data: `consolidated_bills - Invoice #${invoiceNumber} - £${amount.toFixed(2)}`
          }
        },
        Source: process.env.FROM_EMAIL,
        Attachments: [
          {
            Filename: `Invoice-${invoiceNumber}.pdf`,
            Content: pdfBase64,
            ContentType: 'application/pdf'
          }
        ]
      };
      
      await ses.sendEmail(emailParams).promise();
      console.log(`Email sent for invoice #${invoiceNumber} to ${email}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Emails processed successfully"
      })
    };
  } catch (error) {
    console.error('Error processing invoice emails:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing emails",
        error: error.message
      })
    };
  }
};

