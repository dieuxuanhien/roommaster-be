# Manual Deployment Guide with Terraform

This guide shows you how to deploy the infrastructure manually using Terraform from your local machine, as an alternative to the automated GitHub Actions workflow.

## Quick Start with Script 🚀

For automated deployment, use the provided script:

```bash
# Run the deployment script
./scripts/manual-deploy.sh

# Preview changes only (no apply)
./scripts/manual-deploy.sh --plan-only

# Destroy infrastructure
./scripts/manual-deploy.sh --destroy

# View all options
./scripts/manual-deploy.sh --help
```

The script will:

- ✅ Check all prerequisites
- ✅ Verify Azure authentication
- ✅ Validate Terraform configuration
- ✅ Create backend storage if needed
- ✅ Run terraform init, plan, and apply
- ✅ Display deployment outputs

**For manual step-by-step deployment, continue reading below.**

---

## Prerequisites

1. **Terraform** installed ([Download](https://www.terraform.io/downloads))
2. **Azure CLI** installed and configured ([Installation guide](https://docs.microsoft.com/cli/azure/install-azure-cli))
3. **Azure Storage Account** for Terraform state (see [INFRASTRUCTURE.md](INFRASTRUCTURE.md#terraform-backend-storage))

## Setup Steps

### 1. Authenticate with Azure

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Verify current subscription
az account show
```

### 2. Create Your Variables File

```bash
# Navigate to terraform directory
cd terraform

# Copy the example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your actual values
nano terraform.tfvars  # or use your preferred editor
```

### 3. Configure terraform.tfvars

Edit `terraform.tfvars` with your actual configuration:

```hcl
# Required: Basic Configuration
resource_group_name    = "roommaster-rg"
location              = "Southeast Asia"
app_service_name      = "roommaster-backend-dev"  # Must be globally unique!
app_service_plan_name = "roommaster-plan"
node_version          = "20-lts"

# Required: Database Connection (SENSITIVE!)
database_url = "postgresql://user:pass@host:5432/db?sslmode=require"

# Optional: Custom Tags
tags = {
  Environment = "Development"
  Project     = "RoomMaster"
  ManagedBy   = "Terraform"
  Owner       = "Your Name"
}
```

**⚠️ SECURITY WARNING**: Never commit `terraform.tfvars` to git! It's already in `.gitignore`.

### 4. Initialize Terraform

```bash
# Initialize Terraform (downloads providers and configures backend)
terraform init

# You should see: "Terraform has been successfully initialized!"
```

If you get backend errors, ensure:

- The storage account exists (created in [INFRASTRUCTURE.md](INFRASTRUCTURE.md#step-3-create-storage-account-for-terraform-state))
- You're authenticated to Azure (`az login`)
- The storage account name in `providers.tf` matches your actual storage account

### 5. Plan Your Deployment

```bash
# Preview what will be created
terraform plan

# Save the plan to a file (optional)
terraform plan -out=tfplan

# Review the output carefully!
```

The plan will show:

- Resources to be created (green `+`)
- Resources to be modified (yellow `~`)
- Resources to be destroyed (red `-`)

### 6. Apply Changes

```bash
# Apply without saving a plan
terraform apply

# Or apply a saved plan
terraform apply tfplan

# Type 'yes' when prompted to confirm
```

**This will**:

1. Create the Resource Group
2. Create the App Service Plan
3. Create the App Service
4. Configure environment variables

### 7. Get Deployment Information

```bash
# Show all outputs
terraform output

# Get specific values
terraform output app_service_url
terraform output app_service_default_hostname

# Copy the URL and test it
curl $(terraform output -raw app_service_url)
```

## Common Commands

### View Current State

```bash
# Show all resources in state
terraform state list

# Show detailed info about a resource
terraform state show azurerm_linux_web_app.main

# Show current infrastructure
terraform show
```

### Update Infrastructure

```bash
# After changing variables or configuration
terraform plan
terraform apply
```

### Format and Validate

```bash
# Format all .tf files
terraform fmt -recursive

# Validate configuration
terraform validate
```

### Destroy Infrastructure

```bash
# Preview what will be destroyed
terraform plan -destroy

# Destroy all resources (CAREFUL!)
terraform destroy

# Type 'yes' to confirm
```

**⚠️ WARNING**: This will delete ALL resources managed by Terraform!

## Deploy Application Code

After infrastructure is created, deploy your application:

### Option 1: Using Azure CLI

```bash
# From your project root
cd ..

# Deploy from local files
az webapp up \
  --name roommaster-backend \
  --resource-group roommaster-rg \
  --runtime "NODE:20-lts"
```

### Option 2: Using Azure Web App Deploy

```bash
# Create a deployment package
yarn install
yarn run build  # if you have a build step
zip -r app.zip . -x "node_modules/*" ".git/*"

# Deploy the zip
az webapp deployment source config-zip \
  --name roommaster-backend \
  --resource-group roommaster-rg \
  --src app.zip
```

### Option 3: Using Git

```bash
# Configure local git deployment
az webapp deployment source config-local-git \
  --name roommaster-backend \
  --resource-group roommaster-rg

# Add Azure as a git remote
git remote add azure <GIT_URL_FROM_ABOVE>

# Deploy
git push azure main
```

## Environment-Specific Deployments

You can create multiple `.tfvars` files for different environments:

```bash
# Development environment
terraform apply -var-file="terraform.dev.tfvars"

# Staging environment
terraform apply -var-file="terraform.staging.tfvars"

# Production environment
terraform apply -var-file="terraform.prod.tfvars"
```

**Example**: `terraform.dev.tfvars`

```hcl
resource_group_name = "roommaster-dev-rg"
app_service_name    = "roommaster-backend-dev"
database_url        = "postgresql://dev-user:pass@dev-host:5432/dev-db"
tags = {
  Environment = "Development"
}
```

## Workspace Management (Advanced)

Terraform workspaces allow managing multiple environments:

```bash
# Create and switch to dev workspace
terraform workspace new dev
terraform workspace select dev

# Create and switch to prod workspace
terraform workspace new prod
terraform workspace select prod

# List all workspaces
terraform workspace list

# Show current workspace
terraform workspace show
```

Each workspace maintains separate state files.

## Troubleshooting

### Issue: Storage Account Not Found

**Error**: `Error: storage account "tfstateroommaster" not found`

**Solution**: Create the storage account first (see [INFRASTRUCTURE.md](INFRASTRUCTURE.md#step-3-create-storage-account-for-terraform-state))

### Issue: App Service Name Taken

**Error**: `The app service name is not available`

**Solution**: Change `app_service_name` in `terraform.tfvars` to something unique

### Issue: Authentication Errors

**Error**: `Error building AzureRM Client: obtain subscription...`

**Solution**: Re-authenticate with Azure

```bash
az logout
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Issue: State Lock

**Error**: `Error acquiring the state lock`

**Solution**: Another process is using the state. Wait or force unlock:

```bash
terraform force-unlock LOCK_ID
```

### Issue: Database Connection Failed

**Problem**: App deployed but can't connect to database

**Solution**:

1. Verify `database_url` format in `terraform.tfvars`
2. Check database firewall allows Azure connections
3. View app logs:

```bash
az webapp log tail --name roommaster-backend --resource-group roommaster-rg
```

## State Management

### Backup State

```bash
# State is stored in Azure, but you can backup locally
terraform state pull > terraform.tfstate.backup

# List all resources
terraform state list
```

### Import Existing Resources

If you created resources manually and want Terraform to manage them:

```bash
# Import a resource group
terraform import azurerm_resource_group.main /subscriptions/SUB_ID/resourceGroups/roommaster-rg

# Import an app service
terraform import azurerm_linux_web_app.main /subscriptions/SUB_ID/resourceGroups/roommaster-rg/providers/Microsoft.Web/sites/roommaster-backend
```

## Security Best Practices

1. **Never commit `terraform.tfvars`** - It's in `.gitignore`
2. **Use environment variables for secrets**:
   ```bash
   export TF_VAR_database_url="postgresql://..."
   terraform apply
   ```
3. **Limit access** to the storage account containing state files
4. **Enable state locking** (already configured via Azure Storage)
5. **Review plans** before applying changes
6. **Use separate service principals** for different environments

## Cost Management

Monitor your Azure spending:

```bash
# Check current costs
az consumption usage list --output table

# Set up budget alerts (optional)
az consumption budget create \
  --amount 50 \
  --budget-name "roommaster-monthly" \
  --category "Cost" \
  --time-grain "Monthly"
```

## Next Steps

- Set up [GitHub Actions automated deployment](.github/workflows/deploy.yml)
- Configure [custom domain](https://docs.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain)
- Add [Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview) monitoring
- Set up [deployment slots](https://docs.microsoft.com/azure/app-service/deploy-staging-slots) for zero-downtime deployments

## Additional Resources

- [Terraform Azure Provider Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Terraform CLI Commands](https://www.terraform.io/cli/commands)

---

**Need help?** See the main [INFRASTRUCTURE.md](INFRASTRUCTURE.md) guide or check the [Troubleshooting](#troubleshooting) section above.
