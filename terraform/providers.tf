# terraform/providers.tf
# Configure the Terraform version and required providers

terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
  }

  # # Backend configuration for storing Terraform state in Azure Storage
  # # This ensures state is stored remotely and can be shared across team members
  # backend "azurerm" {
  #   resource_group_name  = "tfstate-rg"        # Resource group for state storage
  #   storage_account_name = "tfstateroommaster" # Must be globally unique (3-24 lowercase letters/numbers)
  #   container_name       = "tfstate"
  #   key                  = "terraform.tfstate"
  # }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}

  # Workaround for environments where the ARM Resource Providers listing call
  # intermittently returns a truncated response ("unexpected end of JSON input").
  # If you hit missing provider registration errors later, register them via:
  # `az provider register -n Microsoft.Web` (and other namespaces as needed).
  skip_provider_registration = true
}
