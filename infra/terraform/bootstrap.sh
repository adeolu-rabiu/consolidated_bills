#!/bin/bash

BUCKET="consolidated-bills-terraform-state-571248596585"
TABLE="consolidated_bills-terraform-locks"
REGION="eu-west-2"

aws s3api create-bucket \
  --bucket $BUCKET \
  --region $REGION \
  --create-bucket-configuration LocationConstraint=$REGION || echo "✅ Bucket already exists"

aws s3api put-bucket-versioning \
  --bucket $BUCKET \
  --versioning-configuration Status=Enabled

aws dynamodb create-table \
  --table-name $TABLE \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION || echo "✅ Table already exists"

