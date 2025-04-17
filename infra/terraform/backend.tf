terraform {
  backend "s3" {
    bucket         = "consolidated_bills-terraform-state"
    key            = "global/s3/terraform.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "consolidated_bills-terraform-locks"
    encrypt        = true
  }
}
