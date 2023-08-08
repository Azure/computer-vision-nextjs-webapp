# Create a Container App leveraging Blob Store, SQL, and Computer Vision

In this guide, we'll be walking through deploying the necessary resources for a web app that allows users to cast votes using their name, email and an image. Users can vote for their preference of cat or dog, using an image of a cat or a dog that will be analyzed by our infrastructure. For this to work, we will need to deploy several different resources:

* **Azure Storage Account** to store the images
* **Azure Database for PostgreSQL** to store users and votes
* **Azure Computer Vision** to analyze the images for cats or dogs
* **Azure Container App** to host our code

## Clone the sample repository

First, we're going to clone this repository onto our local machines. This will provide the starter code required to provide the functionality for the simple application outlined above. We can clone with a simple git command.

**With HTTPS**

```bash
git clone https://github.com/ralphr123/cn-app.git
```

**With SSH**

```bash
git clone git@github.com:ralphr123/cn-app.git
```

Once cloned, navigate to the root of the repo in your terminal. To preserve saved environment variables, it's important that this terminal stay open for the duration of the deployment.

## Define Environment Variables

The first step in this tutorial is to define environment variables. Replace the values with your own.

```bash
export MY_RESOURCE_GROUP_NAME=myresourcegroup
export MY_LOCATION=westus
export MY_STORAGE_ACCOUNT_NAME=mystorageaccount
export MY_DATABASE_NAME=mydatabase
export MY_DATABASE_USERNAME=mydatabaseusername
export MY_DATABASE_PASSWORD=mydatabasepassword
export MY_COMPUTER_VISION_NAME=mycomputervisionname
export MY_CONTAINER_APP_NAME=mycontainerapp
export MY_CONTAINER_APP_ENV_NAME=mycontainerappenv
```

## Login to Azure using the CLI

In order to run commands against Azure using [the CLI ](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)you need to login. This is done, though the `az login` command:

## Create a resource group

A resource group is a container for related resources. All resources must be placed in a resource group. We will create one for this tutorial. The following command creates a resource group with the previously defined $MY_RESOURCE_GROUP_NAME and $MY_LOCATION parameters.

```bash
az group create --name $MY_RESOURCE_GROUP_NAME --location $MY_LOCATION
```

## Create the storage account

To create a storage account in this resource group we need to run a simple command. To this command, we are passing the name of the storage account, the resource group to deploy it in, the physical region to deploy it in, and the SKU of the storage account. All values are configured using environment variables.

```bash
az storage account create --name $MY_STORAGE_ACCOUNT_NAME --resource-group $MY_RESOURCE_GROUP_NAME --location $MY_LOCATION --sku Standard_LRS
```

We also need to store one of the API keys for the storage account into an environment variable for later use (to create a container, and put it into an environment file for the code). We are calling the `keys list` command on the storage account and storing the first one in a `STORAGE_ACCOUNT_KEY` environment variable.

```bash
export STORAGE_ACCOUNT_KEY=$(az storage account keys list --account-name $MY_STORAGE_ACCOUNT_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "[0].value" --output tsv)
```

## Create a container in the storage account

Run the following command to create an `images` container in the storage account we just created. User uploaded images will be stored as blobs in this container.

```bash
az storage container create --name images --account-name $MY_STORAGE_ACCOUNT_NAME --account-key $STORAGE_ACCOUNT_KEY --public-access blob
```

## Create a database

We will be creating an Azure Database for PostgreSQL flexible server for the application to store users and their votes. We are passing several arguments to the `create` command:

- The basics: database name, resource group, and physical region to deploy in.
- The tier (which determines the capabilities of the server) as `burstable`, which is for workloads that don't need full CPU continuously.
- The SKU as `Standard_B1ms`.
  - `Standard` for the performance tier.
  - `B` for burstable workload.
  - `1` for a single vCore.
  - `ms` for memory optimized.
- The storage size, 32 GiB
- The PostgreSQL major version, 15
- The datatabase credentials: username and password

```bash
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
```

We also need to store the connection string to the database into an environment variable for later use. This URL will allow us to access the database within the resource we just created.

```bash
export DATABASE_URL="postgres://$MY_DATABASE_USERNAME:$MY_DATABASE_PASSWORD@$MY_DATABASE_NAME.postgres.database.azure.com/postgres"
```

## Create a Computer Vision resource

We will be creating a Computer Vision resource to be able to identify cats or dogs in the pictures users upload. Creating a Computer Vision resource can be done with a single command. We are passing several arguments to the `create` command:

- The basics: resource name, resource group, the region, and to create a Computer Vision resource.
- The SKU as `S1`, or the most cost-effective paid performance tier.

```bash
az cognitiveservices account create \
    --name $MY_COMPUTER_VISION_NAME \
    --resource-group $MY_RESOURCE_GROUP_NAME \
    --location $MY_LOCATION \
    --kind ComputerVision \
    --sku S1 \
    --yes
```

To access our computer vision resource, we need both the endpoint and the key. With the Azure CLI, we have access to two `az cognitiveservices account` commands: `show` and `keys list`, which give us what we need.

```bash
export COMPUTER_VISION_ENDPOINT=$(az cognitiveservices account show --name $MY_COMPUTER_VISION_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "properties.endpoint" --output tsv)
export COMPUTER_VISION_KEY=$(az cognitiveservices account keys list --name $MY_COMPUTER_VISION_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "key1" --output tsv)
```

## Set environment variables for the code

The Next.js sample code provided relies on a `.env` file that includes the environment variables for all the resources we just created. We can use a simple command to put them into a file.

```bash
cat > .env <<EOL
AZURE_DATABASE_URL=${DATABASE_URL}
AZURE_COMPUTER_VISION_KEY=${COMPUTER_VISION_KEY}
AZURE_COMPUTER_VISION_ENDPOINT=${COMPUTER_VISION_ENDPOINT}
AZURE_STORAGE_ACCOUNT_NAME=${MY_STORAGE_ACCOUNT_NAME}
AZURE_STORAGE_ACCOUNT_KEY=${STORAGE_ACCOUNT_KEY}
EOL
```

## Apply our database schema

By this point, we've successfully created the database that will be used to store our users and votes for the app. However, we need to push the actual schema (tables, columns, and relationships). This schema will define the structure of our data. To simplify this process, we are using the [Prisma ORM](https://www.prisma.io/) (Object-relational mapping). We've stored our schema in the `prisma/schema.prisma` file, which defines our tables and relationships. All we need is one command to push the schema from this file to the database in the remote server.

```bash
npx prisma db push
```

## Deploy the code into a Container App

Now that we've got our storage, database, and Computer Vision resources all set up, we are ready to deploy the application code. To do this, we're going to use Azure Container Apps to host a containerized build of our Next.js app. The `Dockerfile` is already created at the root of the repository, so all we need to do is run a single command to deploy the code. This command will create an Azure Container Registry resource to host our Docker image, an Azure Container App resource which runs the image, and an Azure Container App Environment resource for our image. Let's break down what we're passing into the command.

- The basics: resource name, resource group, and the region
- The name of the Azure Container App Environment resource to use or create
- The path to the source code

```bash
az containerapp up \
  --name $MY_CONTAINER_APP_NAME \
  --resource-group $MY_RESOURCE_GROUP_NAME \
  --location $MY_LOCATION \
  --environment $MY_CONTAINER_APP_ENV_NAME \
  --source .
```

## Create a database firewall rule

By default, our database is configured to allow traffic from an allowlist of IP addresses. We need to add the IP of our newly deployed Container App to this allowlist. We can get the IP from the `az containerapp show` command.

```bash
export CONTAINER_APP_IP=$(az containerapp show --name $MY_CONTAINER_APP_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "properties.outboundIpAddresses[0]" --output tsv)
```

We can now add this IP as a firewall rule with this command:

```bash
az postgres flexible-server firewall-rule create \
    --name $MY_DATABASE_NAME \
    --resource-group $MY_RESOURCE_GROUP_NAME \
    --rule-name allow-container-app \
    --start-ip-address $CONTAINER_APP_IP \
    --end-ip-address $CONTAINER_APP_IP
```

## Create a storage CORS rule

Web browsers implement a security restriction known as same-origin policy that prevents a web page from calling APIs in a different domain. CORS provides a secure way to allow one domain (the origin domain) to call APIs in another domain. We need to add a CORS rule on the URL of our web app to our storage account. First, let's get the URL with a similar `az containerapp show` command as earlier.

```bash
export CONTAINER_APP_URL=https://$(az containerapp show --name $MY_CONTAINER_APP_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "properties.configuration.ingress.fqdn" --output tsv)
```

Next, we're ready to add a CORS rule with the following command. Let's break down the different parts of this command.

- We are specifying blob service as the storage type to add the rule to.
- We are allowing all operations to be performed.
- We are allowing only the container app URL we just saved.
- We are allowing all HTTP headers from this URL.
- Max age is the amount of time, in seconds, that a browser should cache the preflight response for a specific request.
- We are passing the storage account name and key from earlier.

```bash
az storage cors add \
  --services b \
  --methods DELETE GET HEAD MERGE OPTIONS POST PUT PATCH \
  --origins $CONTAINER_APP_URL \
  --allowed-headers '*' \
  --max-age 3600 \
  --account-name $MY_STORAGE_ACCOUNT_NAME \
  --account-key $STORAGE_ACCOUNT_KEY
```

That's it! Feel free to access the newly deployed web app in your browser using the $CONTAINER_APP_URL environment variable.

## Next Steps

* [Azure Container Apps documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
* [Azure Database for PostgreSQL documentation](https://learn.microsoft.com/en-us/azure/postgresql/)
* [Azure Blob Storage documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)
* [Azure Computer (AI) Vision Documentation](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/)
