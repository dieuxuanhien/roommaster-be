# RoomMaster Backend - Azure Infrastructure Setup Guide

This guide provides step-by-step instructions for setting up the Azure infrastructure and CI/CD pipeline for the RoomMaster Backend application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Azure Setup](#azure-setup)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [Terraform Backend Storage](#terraform-backend-storage)
5. [Deployment](#deployment)
6. [Manual Deployment (Alternative)](#manual-deployment-alternative)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following:

- **Azure Account**: A valid Azure subscription ([Free trial available](https://azure.microsoft.com/free/))
- **Azure CLI**: Installed locally ([Installation guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- **GitHub Account**: With admin access to your repository
- **Terraform**: Installed locally for testing ([Installation guide](https://learn.hashicorp.com/tutorials/terraform/install-cli))
- **Database Connection String**: From your external database provider

---

## Azure Setup

### Step 1: Login to Azure

```bash
# Login to your Azure account
az login

# List available subscriptions
az account list --output table

# Set the subscription you want to use
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2: Create a Service Principal

A Service Principal is needed for GitHub Actions to authenticate with Azure.

```bash
# Create a service principal with Contributor role
# Replace YOUR_SUBSCRIPTION_ID with your actual subscription ID
az ad sp create-for-rbac \
  --name "roommaster-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
  --sdk-auth
```

**Expected Output:**

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**⚠️ IMPORTANT**: Save this entire JSON output! You'll need it for GitHub Secrets.

---

## Terraform Backend Storage

Terraform needs a place to store its state file. We'll use Azure Storage for this.

### Step 3: Create Storage Account for Terraform State

```bash
# Set variables (customize these)
RESOURCE_GROUP_NAME="tfstate-rg"
STORAGE_ACCOUNT_NAME="tfstateroommaster"  # Must be globally unique, 3-24 lowercase chars/numbers
CONTAINER_NAME="tfstate"
LOCATION="southeastasia"  # Change to your preferred region

# Create resource group for state storage
az group create \
  --name $RESOURCE_GROUP_NAME \
  --location $LOCATION

# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --location $LOCATION \
  --sku Standard_LRS \
  --encryption-services blob

# Create blob container
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT_NAME
```

**Important Notes:**

- The storage account name must be **globally unique** across all of Azure
- It must be **3-24 characters** long and contain only **lowercase letters and numbers**
- If you get an error that the name is taken, try a different name
- Update the `storage_account_name` in `terraform/providers.tf` if you use a different name

### Step 4: Verify Storage Setup

```bash
# List storage accounts to verify
az storage account list \
  --resource-group $RESOURCE_GROUP_NAME \
  --output table
```

---

## GitHub Secrets Configuration

Navigate to your GitHub repository settings to add secrets.

### Step 5: Add GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

#### 1. `AZURE_CREDENTIALS`

- **Value**: The entire JSON output from Step 2 (Service Principal creation)
- **Format**: Raw JSON (including curly braces)

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

#### 2. `ARM_CLIENT_ID`

- **Value**: The `clientId` from the Service Principal JSON

#### 3. `ARM_CLIENT_SECRET`

- **Value**: The `clientSecret` from the Service Principal JSON

#### 4. `ARM_SUBSCRIPTION_ID`

- **Value**: The `subscriptionId` from the Service Principal JSON

#### 5. `ARM_TENANT_ID`

- **Value**: The `tenantId` from the Service Principal JSON

#### 6. `DATABASE_URL`

- **Value**: Your database connection string
- **Example**: `postgresql://user:password@host:5432/database?sslmode=require`

### Step 6: Add GitHub Variables (Optional)

Go to: **Repository → Settings → Secrets and variables → Actions → Variables tab → New repository variable**

#### `APP_SERVICE_NAME`

- **Value**: `roommaster-backend` (or your custom app service name)
- This allows you to easily change the app name without modifying the workflow

---

## Deployment

### Step 7: Update Configuration (if needed)

Before deploying, you may want to customize:

1. **Storage Account Name** (if you used a different name):

   - Edit `terraform/providers.tf`
   - Update `storage_account_name` value

2. **App Service Name** (must be globally unique):

   - Edit `terraform/variables.tf`
   - Update `app_service_name` default value

3. **Azure Region**:

   - Edit `terraform/variables.tf`
   - Update `location` default value

4. **App Service Plan Tier** (for better performance):
   - Edit `terraform/main.tf`
   - Change `sku_name = "F1"` to `sku_name = "B1"` for Basic tier
   - Change `always_on = false` to `always_on = true` if using B1 or higher

### Step 8: Initial Terraform Deployment

For the first deployment, you can run Terraform locally to verify everything works:

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan \
  -var="database_url=$DATABASE_URL"

# Apply changes (type 'yes' when prompted)
terraform apply \
  -var="database_url=$DATABASE_URL"
```

**Alternative**: Just push to GitHub and let the Actions workflow handle it!

### Step 9: Trigger GitHub Actions

```bash
# Commit and push to main branch
git add .
git commit -m "Add Azure infrastructure and CI/CD"
git push origin main
```

The GitHub Actions workflow will automatically:

1. ✅ Validate Terraform configuration
2. 📋 Create an execution plan
3. 🚀 Deploy infrastructure to Azure (only on main branch)
4. 📦 Deploy application code to App Service

### Step 10: Monitor Deployment

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Watch the workflow progress
4. Once complete, click on the workflow run to see the deployment URL

---

## Verifying Deployment

### Check Azure Resources

```bash
# List all resources in the resource group
az resource list \
  --resource-group roommaster-rg \
  --output table

# Get App Service details
az webapp show \
  --name roommaster-backend \
  --resource-group roommaster-rg \
  --output table
```

### Test Your Application

```bash
# Get the App Service URL
APP_URL=$(az webapp show \
  --name roommaster-backend \
  --resource-group roommaster-rg \
  --query defaultHostName \
  --output tsv)

# Test the endpoint
curl https://$APP_URL

# Or open in browser
echo "https://$APP_URL"
```

---

## Manual Deployment (Alternative)

If you prefer to deploy manually from your local machine instead of using GitHub Actions:

### Quick Start - Manual Deployment

1. **Install Prerequisites**:

   - [Terraform](https://www.terraform.io/downloads)
   - [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)

2. **Authenticate**:

   ```bash
   az login
   az account set --subscription "YOUR_SUBSCRIPTION_ID"
   ```

3. **Configure Variables**:

   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your actual values
   ```

4. **Deploy**:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

For detailed manual deployment instructions, see **[MANUAL_DEPLOY.md](MANUAL_DEPLOY.md)**.

---

## Troubleshooting

### Common Issues

#### 1. Storage Account Name Already Exists

**Error**: `The storage account name is already taken.`

**Solution**: Choose a different name in Step 3 and update `terraform/providers.tf`.

#### 2. Service Principal Permission Denied

**Error**: `AuthorizationFailed` or `insufficient privileges`

**Solution**: Ensure the service principal has Contributor role:

```bash
az role assignment create \
  --assignee YOUR_CLIENT_ID \
  --role Contributor \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID
```

#### 3. Terraform State Lock

**Error**: `Error acquiring the state lock`

**Solution**: This happens when a previous operation didn't complete. Break the lock:

```bash
terraform force-unlock LOCK_ID
```

#### 4. App Service Name Not Available

**Error**: `The app service plan name is not available.`

**Solution**: App Service names must be globally unique. Change the name in `terraform/variables.tf`.

#### 5. Database Connection Issues

**Error**: Application can't connect to database

**Solution**:

- Verify `DATABASE_URL` secret is correctly formatted
- Check if your database allows connections from Azure IP addresses
- Review App Service logs: `az webapp log tail --name roommaster-backend --resource-group roommaster-rg`

### View Application Logs

```bash
# Stream logs in real-time
az webapp log tail \
  --name roommaster-backend \
  --resource-group roommaster-rg

# Download logs
az webapp log download \
  --name roommaster-backend \
  --resource-group roommaster-rg \
  --log-file app-logs.zip
```

### SSH into App Service (for debugging)

```bash
# Open SSH session
az webapp ssh \
  --name roommaster-backend \
  --resource-group roommaster-rg
```

---

## Useful Commands

### Terraform Commands

```bash
# Format Terraform files
terraform fmt -recursive

# Validate configuration
terraform validate

# Show current state
terraform show

# List all resources
terraform state list

# Destroy all resources (careful!)
terraform destroy
```

### Azure CLI Commands

```bash
# Restart App Service
az webapp restart \
  --name roommaster-backend \
  --resource-group roommaster-rg

# Update app settings
az webapp config appsettings set \
  --name roommaster-backend \
  --resource-group roommaster-rg \
  --settings KEY=VALUE

# Scale up/down
az appservice plan update \
  --name roommaster-plan \
  --resource-group roommaster-rg \
  --sku B1
```

---

## Cost Management

For a school project with minimal traffic:

- **Free Tier (F1)**: $0/month (recommended for testing)
- **Basic Tier (B1)**: ~$13/month (better performance)
- **Storage Account**: ~$0.20/month (for Terraform state)

**Total estimated cost**: $0-15/month depending on tier

### Cost Optimization Tips

1. Use Free tier (F1) for development/testing
2. Delete resources when not in use:
   ```bash
   terraform destroy
   ```
3. Set up Azure cost alerts
4. Use Azure's free tier for 12 months ([details](https://azure.microsoft.com/free/))

---

## Production Considerations

For production deployments, consider:

1. **Enable Always On**: Set `always_on = true` and use B1 or higher tier
2. **Add Application Insights**: For monitoring and diagnostics
3. **Configure Custom Domain**: Instead of `.azurewebsites.net`
4. **Enable Auto-scaling**: For handling traffic spikes
5. **Add Staging Slot**: For zero-downtime deployments
6. **Set up Azure Key Vault**: For secure secret management
7. **Configure Backup**: Regular automated backups
8. **Enable CORS**: If accessed from frontend applications

---

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs for error messages
3. Check Azure Portal for resource status
4. Review App Service logs for application errors

---

**Last Updated**: January 2026

**Maintained by**: RoomMaster DevOps Team
