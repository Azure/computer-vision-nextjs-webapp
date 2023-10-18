# Env vars
export MY_RESOURCE_GROUP_NAME=dasha-vision-test
export MY_LOCATION=westus
export MY_STORAGE_ACCOUNT_NAME=dashastoragevision
export MY_DATABASE_SERVER_NAME=dasha-server-vision3
export MY_DATABASE_NAME=demo
export MY_DATABASE_USERNAME=postgres
export MY_DATABASE_PASSWORD=Sup3rS3cr3t!
export MY_COMPUTER_VISION_NAME=dasha-vision-test
export MY_CONTAINER_APP_NAME=dasha-container-vision
export MY_CONTAINER_APP_ENV_NAME=dasha-environment-vision
export AKS_SUBNET_NAME=AKSSubnet
export POSTGRES_SUBNET_NAME=PostgreSQLSubnet
export MY_VNET_NAME=vision-vnet
export MY_CONTAINER_REGISTRY=dashavisionacr
export MY_CLUSTER_NAME=vision-cluster
export DIR="$(dirname "$0")"

# Resource group
az group create --name $MY_RESOURCE_GROUP_NAME --location $MY_LOCATION

# Creating Vnet with AKS and Postgres Subnet
az network vnet create \
  --resource-group $MY_RESOURCE_GROUP_NAME \
  --location $MY_LOCATION \
  --name $MY_VNET_NAME \
  --address-prefix 10.0.0.0/16 \
  --subnet-name $AKS_SUBNET_NAME \
  --subnet-prefix 10.0.1.0/24 \
  --subnets "[{'name':'$POSTGRES_SUBNET_NAME', 'addressPrefix':'10.0.2.0/24'}]"

# Getting AKS Subnet ID
subnetId=$(az network vnet subnet show --name $AKS_SUBNET_NAME --resource-group $MY_RESOURCE_GROUP_NAME --vnet-name $MY_VNET_NAME --query "id" -o tsv)  

# Adding Microsoft.Storage Endpoint to Subnet so it can access postgres later
az network vnet subnet update \
  --name $AKS_SUBNET_NAME \
  --resource-group $MY_RESOURCE_GROUP_NAME \
  --vnet-name $MY_VNET_NAME \
  --service-endpoints Microsoft.Storage

# Storage account
az storage account create --name $MY_STORAGE_ACCOUNT_NAME --resource-group $MY_RESOURCE_GROUP_NAME --location $MY_LOCATION --sku Standard_LRS --vnet-name $MY_VNET_NAME --subnet $AKS_SUBNET_NAME

# Storage account key
export STORAGE_ACCOUNT_KEY=$(az storage account keys list --account-name $MY_STORAGE_ACCOUNT_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "[0].value" --output tsv)

# Storage container
az storage container create --name images --account-name $MY_STORAGE_ACCOUNT_NAME --account-key $STORAGE_ACCOUNT_KEY --public-access blob

# PSQL database created in Vnet in Postgres Subnet
az postgres flexible-server create \
  --name $MY_DATABASE_SERVER_NAME \
  --database-name $MY_DATABASE_NAME \
  --resource-group $MY_RESOURCE_GROUP_NAME \
  --location $MY_LOCATION \
  --tier Burstable \
  --sku-name Standard_B1ms \
  --storage-size 32 \
  --version 15 \
  --admin-user $MY_DATABASE_USERNAME \
  --admin-password $MY_DATABASE_PASSWORD \
  --vnet $MY_VNET_NAME \
  --subnet $POSTGRES_SUBNET_NAME \
  --yes

# PSQL database connection string
export DATABASE_URL="postgres://$MY_DATABASE_USERNAME:$MY_DATABASE_PASSWORD@$MY_DATABASE_SERVER_NAME.postgres.database.azure.com/$MY_DATABASE_NAME"

# Create ACR to contain the application
az acr create -n $MY_CONTAINER_REGISTRY -g $MY_RESOURCE_GROUP_NAME --sku basic  

# Log into ACR
az acr login --name $MY_CONTAINER_REGISTRY  

# Create AKS in AKS subnet with connection to ACR
az aks create -n $MY_CLUSTER_NAME -g  $MY_RESOURCE_GROUP_NAME --generate-ssh-keys --attach-acr $MY_CONTAINER_REGISTRY --vnet-subnet-id $subnetId  --network-plugin azure  --service-cidr 10.1.0.0/16  --dns-service-ip 10.1.0.10  

az aks get-credentials -g $MY_RESOURCE_GROUP_NAME -n $MY_CLUSTER_NAME  

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


# Name of the image to build and deploy to ACR
export IMAGE=$MY_CONTAINER_REGISTRY.azurecr.io/vision-demo:v1

# Building the image. TODO: You may need to update this to remove "buildx" since that is for M1 Mac's only that I'm developing on
docker buildx build --platform=linux/amd64 \
    --build-arg AZURE_DATABASE_URL=$DATABASE_URL \
    --build-arg AZURE_COMPUTER_VISION_KEY=$COMPUTER_VISION_KEY \
    --build-arg AZURE_COMPUTER_VISION_ENDPOINT=$COMPUTER_VISION_ENDPOINT \
    --build-arg AZURE_STORAGE_ACCOUNT_NAME=$MY_STORAGE_ACCOUNT_NAME \
    --build-arg AZURE_STORAGE_ACCOUNT_KEY=$STORAGE_ACCOUNT_KEY \
    -t $IMAGE .

# Pushing image to ACR
docker push $IMAGE 

# Install Nginx ingress controller TODO: May want to update to App Gateway
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx   
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --create-namespace \
  --namespace ingress-basic \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz 

# Replacing environment variables in the deployment template with variables in script and creating new deployment template to deploy on AKS
sed -e "s|<IMAGE_NAME>|${IMAGE}|g" \
  -e "s|<DATABASE_URL>|${DATABASE_URL}|g" \
  -e "s|<COMPUTER_VISION_KEY>|${COMPUTER_VISION_KEY}|g" \
  -e "s|<COMPUTER_VISION_ENDPOINT>|${COMPUTER_VISION_ENDPOINT}|g" \
  -e "s|<MY_STORAGE_ACCOUNT_NAME>|${MY_STORAGE_ACCOUNT_NAME}|g" \
  -e "s|<STORAGE_ACCOUNT_KEY>|${STORAGE_ACCOUNT_KEY}|g" $DIR/deployment-template.yaml > $DIR/deployment.yaml

kubectl apply -f $DIR/deployment.yaml

# Waiting for the ingress controller to be deployed. Will keep checking until it's deployed
while true; do
    aks_cluster_ip=$(kubectl get ingress ingress -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [[ -n "$aks_cluster_ip" ]]; then
        echo "AKS Ingress IP Address is: $aks_cluster_ip"
        break
    else
        echo "Waiting for AKS Ingress IP Address to be assigned..."
        sleep 150s
    fi
done

# Issue: Dumb that you have to put the Http for the origin. Should just work with IP Address
export CLUSTER_INGRESS_URL="http://$aks_cluster_ip" 
# Add container endpoint to allowed CORS origin for storage account
az storage cors add \
  --services b \
  --methods DELETE GET HEAD MERGE OPTIONS POST PUT \
  --origins $CLUSTER_INGRESS_URL \
  --allowed-headers '*' \
  --max-age 3600 \
  --account-name $MY_STORAGE_ACCOUNT_NAME \
  --account-key $STORAGE_ACCOUNT_KEY


echo "---------- Deployment Complete ----------"
echo "AKS Ingress IP Address: $aks_cluster_ip"
echo "To access the AKS cluster, use the following command:"
echo "az aks get-credentials -g $MY_RESOURCE_GROUP_NAME -n aks-terraform-cluster"
echo ""