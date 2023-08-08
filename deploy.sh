# Env vars
export MY_RESOURCE_GROUP_NAME=myresourcegroup
export MY_LOCATION=westus
export MY_STORAGE_ACCOUNT_NAME=mystorageaccount
export MY_DATABASE_NAME=mydatabase
export MY_DATABASE_USERNAME=mydatabaseusername
export MY_DATABASE_PASSWORD=mydatabasepassword
export MY_COMPUTER_VISION_NAME=mycomputervisionname
export MY_CONTAINER_APP_NAME=mycontainerapp
export MY_CONTAINER_APP_ENV_NAME=mycontainerappenv

# Storage account
az storage account create --name $MY_STORAGE_ACCOUNT_NAME --resource-group $MY_RESOURCE_GROUP_NAME --location $MY_LOCATION --sku Standard_LRS

# Storage account key
export STORAGE_ACCOUNT_KEY=$(az storage account keys list --account-name $MY_STORAGE_ACCOUNT_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "[0].value" --output tsv)

# Storage container
az storage container create --name images --account-name $MY_STORAGE_ACCOUNT_NAME --account-key $STORAGE_ACCOUNT_KEY --public-access blob

# PSQL database
az postgres flexible-server create \
    --name $MY_DATABASE_NAME \
    --resource-group $MY_RESOURCE_GROUP_NAME \
    --location $MY_LOCATION \
    --tier Burstable \
    --sku-name Standard_B1ms \
    --storage-size 32 \
    --version 15 \
    --admin-user $MY_DATABASE_USERNAME \
    --admin-password $MY_DATABASE_PASSWORD \
    --yes

# PSQL database connection string
export DATABASE_URL="postgres://$MY_DATABASE_USERNAME:$MY_DATABASE_PASSWORD@$MY_DATABASE_NAME.postgres.database.azure.com/postgres"

# Prisma schema push
npx prisma db push

# Computer vision
az cognitiveservices account create \
    --name $MY_COMPUTER_VISION_NAME \
    --resource-group $MY_RESOURCE_GROUP_NAME \
    --kind ComputerVision \
    --sku S1 \
    --location $MY_LOCATION \
    --yes

# Computer vision endpoint
export COMPUTER_VISION_ENDPOINT=$(az cognitiveservices account show --name $MY_COMPUTER_VISION_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "properties.endpoint" --output tsv)

# Computer vision key
export COMPUTER_VISION_KEY=$(az cognitiveservices account keys list --name $MY_COMPUTER_VISION_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "key1" --output tsv)

# Container app
az containerapp up \
  --name $MY_CONTAINER_APP_NAME \
  --resource-group $MY_RESOURCE_GROUP_NAME \
  --location $MY_LOCATION \
  --environment $MY_CONTAINER_APP_ENV_NAME \
  --context-path . \
  --source . \
  --env-vars \
    DATABASE_URL=$DATABASE_URL \
    AZURE_COMPUTER_VISION_KEY=$COMPUTER_VISION_KEY \
    AZURE_COMPUTER_VISION_ENDPOINT=$COMPUTER_VISION_ENDPOINT \
    AZURE_STORAGE_ACCOUNT_NAME=$MY_STORAGE_ACCOUNT_NAME \
    AZURE_STORAGE_ACCOUNT_KEY=$STORAGE_ACCOUNT_KEY

# Container app IP address
export CONTAINER_APP_IP=$(az containerapp show --name $MY_CONTAINER_APP_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "properties.outboundIpAddresses[0]" --output tsv)

# Allow container app IP to access database
az postgres flexible-server firewall-rule create \
    --name $MY_DATABASE_NAME \
    --resource-group $MY_RESOURCE_GROUP_NAME \
    --rule-name allow-container-app \
    --start-ip-address $CONTAINER_APP_IP \
    --end-ip-address $CONTAINER_APP_IP
  
