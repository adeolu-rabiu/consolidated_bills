const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

exports.handler = async (event) => {
  try {
    // Process SQS messages
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      
      // Get notification details
      const { phoneNumber, notificationType, content } = message;
      
      // Skip if phone number is not provided
      if (!phoneNumber) {
        console.log('Phone number not provided, skipping SMS notification');
        continue;
      }
      
      let smsMessage;
      
      // Create appropriate message based on notification type
      switch (notificationType) {
        case 'BILL_READY':
          smsMessage = `Consolidated_bills: Your new utility bill is ready. Amount: £${content.amount.toFixed(2)}. Due on: ${new Date(content.dueDate).toLocaleDateString()}. Log in to view details.`;
          break;
        case 'PAYMENT_REMINDER':
          smsMessage = `Consolidated_bills: Reminder - your payment of £${content.amount.toFixed(2)} is due in ${content.daysRemaining} days. Log in to make payment.`;
          break;
        case 'PAYMENT_CONFIRMATION':
          smsMessage = `Consolidated_bills: Payment received - £${content.amount.toFixed(2)}. Thank you for your payment.`;
          break;
        default:
          smsMessage = `Consolidated_bills: ${content.message}`;
      }
      
      // Send SMS via SNS
      const params = {
        Message: smsMessage,
        PhoneNumber: phoneNumber
      };
      
      await sns.publish(params).promise();
      console.log(`SMS sent to ${phoneNumber} for notification type: ${notificationType}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "SMS notifications processed successfully"
      })
    };
  } catch (error) {
    console.error('Error sending SMS notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error sending SMS notifications",
        error: error.message
      })
    };
  }
};
