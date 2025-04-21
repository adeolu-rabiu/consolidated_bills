terraform {
  backend "s3" {
    bucket         = "consolidated-bills-terraform-state-571248596585"
    key            = "consolidated-bills.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "consolidated_bills-terraform-locks"
    encrypt        = true
  }
}

