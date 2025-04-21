resource "aws_s3_bucket" "invoices" {
  bucket = "consolidated_bills-invoices-${var.environment}"
}

resource "aws_s3_bucket_versioning" "invoices" {
  bucket = aws_s3_bucket.invoices.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "invoices" {
  bucket = aws_s3_bucket.invoices.id
  
  rule {
    id     = "invoice-expiration"
    status = "Enabled"
    
    expiration {
      days = 365
    }
  }
}

# SQS Queues for Lambda triggers
resource "aws_sqs_queue" "invoice_generation" {
  name                      = "consolidated_bills-invoice-generation-${var.environment}"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.invoice_generation_dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_sqs_queue" "invoice_generation_dlq" {
  name = "consolidated_bills-invoice-generation-dlq-${var.environment}"
}

resource "aws_sqs_queue" "invoice_email" {
  name                      = "consolidated_bills-invoice-email-${var.environment}"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.invoice_email_dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_sqs_queue" "invoice_email_dlq" {
  name = "consolidated_bills-invoice-email-dlq-${var.environment}"
}

resource "aws_sqs_queue" "sms_notification" {
  name                      = "consolidated_bills-sms-notification-${var.environment}"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.sms_notification_dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_sqs_queue" "sms_notification_dlq" {
  name = "consolidated_bills-sms-notification-dlq-${var.environment}"
}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_exec" {
  name = "consolidated_bills-lambda-exec-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# PDF Generator Lambda
resource "aws_lambda_function" "pdf_generator" {
  function_name    = "consolidated_bills-pdf-generator-${var.environment}"
  filename         = data.archive_file.pdf_generator_zip.output_path
  source_code_hash = data.archive_file.pdf_generator_zip.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 30
  memory_size      = 256
  
  environment {
    variables = {
      INVOICE_BUCKET   = aws_s3_bucket.invoices.bucket
      EMAIL_QUEUE_URL  = aws_sqs_queue.invoice_email.url
    }
  }
}

# Lambda event source from SQS
resource "aws_lambda_event_source_mapping" "pdf_generator_trigger" {
  event_source_arn = aws_sqs_queue.invoice_generation.arn
  function_name    = aws_lambda_function.pdf_generator.function_name
  batch_size       = 10
}

# Email Notification Lambda
resource "aws_lambda_function" "email_notification" {
  function_name    = "consolidated_bills-email-notification-${var.environment}"
  filename         = data.archive_file.email_notification_zip.output_path
  source_code_hash = data.archive_file.email_notification_zip.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 30
  memory_size      = 256
  
  environment {
    variables = {
      INVOICE_BUCKET = aws_s3_bucket.invoices.bucket
      FROM_EMAIL     = "billing@consolidated_bills.example.com"
    }
  }
}

# Lambda event source from SQS
resource "aws_lambda_event_source_mapping" "email_notification_trigger" {
  event_source_arn = aws_sqs_queue.invoice_email.arn
  function_name    = aws_lambda_function.email_notification.function_name
  batch_size       = 10
}

# SMS Notification Lambda
resource "aws_lambda_function" "sms_notification" {
  function_name    = "consolidated_bills-sms-notification-${var.environment}"
  filename         = data.archive_file.sms_notification_zip.output_path
  source_code_hash = data.archive_file.sms_notification_zip.output_base64sha256
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 30
  memory_size      = 128
}

# Lambda event source from SQS
resource "aws_lambda_event_source_mapping" "sms_notification_trigger" {
  event_source_arn = aws_sqs_queue.sms_notification.arn
  function_name    = aws_lambda_function.sms_notification.function_name
  batch_size       = 10
}

# Archive files for Lambda functions
data "archive_file" "pdf_generator_zip" {
  type        = "zip"
  output_path = "${path.module}/files/pdf-generator.zip"
  source_dir  = "${path.module}/../../serverless/pdf-generator-lambda"
}

data "archive_file" "email_notification_zip" {
  type        = "zip"
  output_path = "${path.module}/files/email-notification.zip"
  source_dir  = "${path.module}/../../serverless/invoice-email-lambda"
}

data "archive_file" "sms_notification_zip" {
  type        = "zip"
  output_path = "${path.module}/files/sms-notification.zip"
  source_dir  = "${path.module}/../../serverless/sms-notification-lambda"
}

# IAM policy for Lambda to access S3, SQS, SES, and SNS
resource "aws_iam_policy" "lambda_permissions" {
  name        = "consolidated_bills-lambda-permissions-${var.environment}"
  description = "IAM policy for consolidated_bills Lambda functions"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.invoices.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:SendMessage"
        ]
        Resource = [
          aws_sqs_queue.invoice_generation.arn,
          aws_sqs_queue.invoice_email.arn,
          aws_sqs_queue.sms_notification.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_permissions.arn
}

# Variables
variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

# Outputs
output "invoice_bucket_name" {
  value = aws_s3_bucket.invoices.bucket
}

output "invoice_generation_queue_url" {
  value = aws_sqs_queue.invoice_generation.url
}

output "invoice_email_queue_url" {
  value = aws_sqs_queue.invoice_email.url
}

output "sms_notification_queue_url" {
  value = aws_sqs_queue.sms_notification.url
}
