#!/bin/bash
aws s3api create-bucket \
  --bucket consolidated_bills-terraform-state \
  --region eu-west-2 \
  --create-bucket-configuration LocationConstraint=eu-west-2

aws s3api put-bucket-versioning \
  --bucket consolidated_bills-terraform-state \
  --versioning-configuration Status=Enabled

aws dynamodb create-table \
  --table-name consolidated_bills-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-2
