# Create a Container App leveraging Blob Store, SQL, and Computer Vision

In this guide, we'll be walking through deploying the necessary resources for a web app that allows users to cast votes using their name, email and an image. Users can vote for their preference of cat or dog, using an image of a cat or a dog that will be analyzed by our infrastructure. For this to work, we will need to deploy several different resources:

* **Azure Storage Account** to store the images
* **Azure Database for PostgreSQL** to store users and votes
* **Azure Computer Vision** to analyze the images for cats or dogs
* **Azure Container App** to deploy our code

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

Once cloned, navigate to the root of the repo in your terminal. To preserve saved environment variables, it's important that this terminal window stays open for the duration of the deployment.

## Define Environment Variables

The first step in this tutorial is to define environment variables. Replace the values with your own.

```bash
export MY_RESOURCE_GROUP_NAME=myresourcegroup
export MY_LOCATION=westus
export MY_STORAGE_ACCOUNT_NAME=mystorageaccount
export $MY_DATABASE_SERVER_NAME=mydatabaseserver
export $MY_DATABASE_NAME=mydatabase
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

Results:

```json
{
  "id": "/subscriptions/ab9d8365-2f65-47a4-8df4-7e40db70c8d2/resourceGroups/$MY_RESOURCE_GROUP_NAME",
  "location": "$MY_LOCATION",
  "managedBy": null,
  "name": "$MY_RESOURCE_GROUP_NAME",
  "properties": {
    "provisioningState": "Succeeded"
  },
  "tags": null,
  "type": "Microsoft.Resources/resourceGroups"
}
```

## Create the storage account

To create a storage account in this resource group we need to run a simple command. To this command, we are passing the name of the storage account, the resource group to deploy it in, the physical region to deploy it in, and the SKU of the storage account. All values are configured using environment variables.

```bash
az storage account create --name $MY_STORAGE_ACCOUNT_NAME --resource-group $MY_RESOURCE_GROUP_NAME --location $MY_LOCATION --sku Standard_LRS
```

Results:

```json
{
  "accessTier": "Hot",
  "allowBlobPublicAccess": false,
  "allowCrossTenantReplication": null,
  "allowSharedKeyAccess": null,
  "allowedCopyScope": null,
  "azureFilesIdentityBasedAuthentication": null,
  "blobRestoreStatus": null,
  "creationTime": "2023-08-10T14:37:41.276351+00:00",
  "customDomain": null,
  "defaultToOAuthAuthentication": null,
  "dnsEndpointType": null,
  "enableHttpsTrafficOnly": true,
  "enableNfsV3": null,
  "encryption": {
    "encryptionIdentity": null,
    "keySource": "Microsoft.Storage",
    "keyVaultProperties": null,
    "requireInfrastructureEncryption": null,
    "services": {
      "blob": {
        "enabled": true,
        "keyType": "Account",
        "lastEnabledTime": "2023-08-10T14:37:41.370163+00:00"
      },
      "file": {
        "enabled": true,
        "keyType": "Account",
        "lastEnabledTime": "2023-08-10T14:37:41.370163+00:00"
      },
      "queue": null,
      "table": null
    }
  },
  "extendedLocation": null,
  "failoverInProgress": null,
  "geoReplicationStats": null,
  "id": "/subscriptions/ab9d8365-2f65-47a4-8df4-7e40db70c8d2/resourceGroups/$MY_RESOURCE_GROUP_NAME/providers/Microsoft.Storage/storageAccounts/$MY_STORAGE_ACCOUNT_NAME",
  "identity": null,
  "immutableStorageWithVersioning": null,
  "isHnsEnabled": null,
  "isLocalUserEnabled": null,
  "isSftpEnabled": null,
  "keyCreationTime": {
    "key1": "2023-08-10T14:37:41.370163+00:00",
    "key2": "2023-08-10T14:37:41.370163+00:00"
  },
  "keyPolicy": null,
  "kind": "StorageV2",
  "largeFileSharesState": null,
  "lastGeoFailoverTime": null,
  "location": "$MY_LOCATION",
  "minimumTlsVersion": "TLS1_0",
  "name": "$MY_STORAGE_ACCOUNT_NAME",
  "networkRuleSet": {
    "bypass": "AzureServices",
    "defaultAction": "Allow",
    "ipRules": [],
    "resourceAccessRules": null,
    "virtualNetworkRules": []
  },
  "primaryEndpoints": {
    "blob": "https://$MY_STORAGE_ACCOUNT_NAME.blob.core.windows.net/",
    "dfs": "https://$MY_STORAGE_ACCOUNT_NAME.dfs.core.windows.net/",
    "file": "https://$MY_STORAGE_ACCOUNT_NAME.file.core.windows.net/",
    "internetEndpoints": null,
    "microsoftEndpoints": null,
    "queue": "https://$MY_STORAGE_ACCOUNT_NAME.queue.core.windows.net/",
    "table": "https://$MY_STORAGE_ACCOUNT_NAME.table.core.windows.net/",
    "web": "https://$MY_STORAGE_ACCOUNT_NAME.z22.web.core.windows.net/"
  },
  "primaryLocation": "$MY_LOCATION",
  "privateEndpointConnections": [],
  "provisioningState": "Succeeded",
  "publicNetworkAccess": null,
  "resourceGroup": "$MY_RESOURCE_GROUP_NAME",
  "routingPreference": null,
  "sasPolicy": null,
  "secondaryEndpoints": null,
  "secondaryLocation": null,
  "sku": {
    "name": "Standard_LRS",
    "tier": "Standard"
  },
  "statusOfPrimary": "available",
  "statusOfSecondary": null,
  "storageAccountSkuConversionStatus": null,
  "tags": {},
  "type": "Microsoft.Storage/storageAccounts"
}
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

Results:

```json
{
  "created": true
}
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

Results:

```json
{
  "connectionString": "postgresql://$MY_DATABASE_USERNAME:$MY_DATABASE_PASSWORD@$MY_DATABASE_NAME.postgres.database.azure.com/flexibleserverdb?sslmode=require",
  "databaseName": "$MY_DATABASE_NAME",
  "firewallName": "FirewallIPAddress_2023-8-10_10-53-21",
  "host": "$MY_DATABASE_NAME.postgres.database.azure.com",
  "id": "/subscriptions/ab9d8365-2f65-47a4-8df4-7e40db70c8d2/resourceGroups/$MY_RESOURCE_GROUP_NAME/providers/Microsoft.DBforPostgreSQL/flexibleServers/$MY_DATABASE_NAME",
  "location": "$MY_LOCATION",
  "password": "$MY_DATABASE_PASSWORD",
  "resourceGroup": "$MY_RESOURCE_GROUP_NAME",
  "skuname": "Standard_B1ms",
  "username": "$MY_DATABASE_USERNAME",
  "version": "15"
}
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

Results:

```json
{
  "etag": "\"090ac83c-0000-0700-0000-64d4fcd80000\"",
  "id": "/subscriptions/ab9d8365-2f65-47a4-8df4-7e40db70c8d2/resourceGroups/$MY_RESOURCE_GROUP_NAME/providers/Microsoft.CognitiveServices/accounts/$MY_COMPUTER_VISION_NAME",
  "identity": null,
  "kind": "ComputerVision",
  "location": "$MY_LOCATION",
  "name": "$MY_COMPUTER_VISION_NAME",
  "properties": {
    "allowedFqdnList": null,
    "apiProperties": null,
    "callRateLimit": {
      "count": null,
      "renewalPeriod": null,
      "rules": [
        {
          "count": 30.0,
          "dynamicThrottlingEnabled": true,
          "key": "vision.recognizeText",
          "matchPatterns": [
            {
              "method": "POST",
              "path": "vision/recognizeText"
            },
            {
              "method": "GET",
              "path": "vision/textOperations/*"
            },
            {
              "method": "*",
              "path": "vision/read/*"
            }
          ],
          "minCount": null,
          "renewalPeriod": 1.0
        },
        {
          "count": 15.0,
          "dynamicThrottlingEnabled": true,
          "key": "vision",
          "matchPatterns": [
            {
              "method": "*",
              "path": "vision/*"
            }
          ],
          "minCount": null,
          "renewalPeriod": 1.0
        },
        {
          "count": 500.0,
          "dynamicThrottlingEnabled": null,
          "key": "container.billing",
          "matchPatterns": [
            {
              "method": "*",
              "path": "billing/*"
            }
          ],
          "minCount": null,
          "renewalPeriod": 10.0
        },
        {
          "count": 20.0,
          "dynamicThrottlingEnabled": true,
          "key": "default",
          "matchPatterns": [
            {
              "method": "*",
              "path": "*"
            }
          ],
          "minCount": null,
          "renewalPeriod": 1.0
        }
      ]
    },
    "capabilities": [
      {
        "name": "DynamicThrottling",
        "value": null
      },
      {
        "name": "VirtualNetworks",
        "value": null
      },
      {
        "name": "Container",
        "value": "ComputerVision.VideoAnalytics,ComputerVision.ComputerVisionRead,ComputerVision.ocr,ComputerVision.readfile,ComputerVision.readfiledsd,ComputerVision.recognizetext,ComputerVision.ComputerVision,ComputerVision.ocrlayoutworker,ComputerVision.ocrcontroller,ComputerVision.ocrdispatcher,ComputerVision.ocrbillingprocessor,ComputerVision.ocranalyzer,ComputerVision.ocrpagesplitter,ComputerVision.ocrapi,ComputerVision.ocrengineworker"
      }
    ],
    "customSubDomainName": null,
    "dateCreated": "2023-08-10T15:06:00.4272845Z",
    "deletionDate": null,
    "disableLocalAuth": null,
    "dynamicThrottlingEnabled": null,
    "encryption": null,
    "endpoint": "https://$MY_LOCATION.api.cognitive.microsoft.com/",
    "endpoints": {
      "Computer Vision": "https://$MY_LOCATION.api.cognitive.microsoft.com/",
      "Container": "https://$MY_LOCATION.api.cognitive.microsoft.com/"
    },
    "internalId": "93645816f9594fe49a8f4023c0bf34b4",
    "isMigrated": false,
    "migrationToken": null,
    "networkAcls": null,
    "privateEndpointConnections": [],
    "provisioningState": "Succeeded",
    "publicNetworkAccess": "Enabled",
    "quotaLimit": null,
    "restore": null,
    "restrictOutboundNetworkAccess": null,
    "scheduledPurgeDate": null,
    "skuChangeInfo": null,
    "userOwnedStorage": null
  },
  "resourceGroup": "$MY_RESOURCE_GROUP_NAME",
  "sku": {
    "capacity": null,
    "family": null,
    "name": "S1",
    "size": null,
    "tier": null
  },
  "systemData": {
    "createdAt": "2023-08-10T15:06:00.107300+00:00",
    "createdBy": "username@domain.com",
    "createdByType": "User",
    "lastModifiedAt": "2023-08-10T15:06:00.107300+00:00",
    "lastModifiedBy": "username@domain.com",
    "lastModifiedByType": "User"
  },
  "tags": null,
  "type": "Microsoft.CognitiveServices/accounts"
}

```

To access our computer vision resource, we need both the endpoint and the key. With the Azure CLI, we have access to two `az cognitiveservices account` commands: `show` and `keys list`, which give us what we need.

```bash
export COMPUTER_VISION_ENDPOINT=$(az cognitiveservices account show --name $MY_COMPUTER_VISION_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "properties.endpoint" --output tsv)
export COMPUTER_VISION_KEY=$(az cognitiveservices account keys list --name $MY_COMPUTER_VISION_NAME --resource-group $MY_RESOURCE_GROUP_NAME --query "key1" --output tsv)
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

Results:

```plaintext
2023/08/10 15:12:27 Downloading source code...
2023/08/10 15:12:28 Finished downloading source code
2023/08/10 15:12:28 Using acb_vol_de03f52d-3cc4-46e1-8659-dfa393d36d86 as the home volume
2023/08/10 15:12:28 Setting up Docker configuration...
2023/08/10 15:12:29 Successfully set up Docker configuration
2023/08/10 15:12:29 Logging in to registry: ca0e09205e8dacr.azurecr.io

2023/08/10 15:12:39 Successfully logged into ca0e09205e8dacr.azurecr.io
2023/08/10 15:12:39 Executing step ID: build. Timeout(sec): 28800, Working directory: '', Network: ''
2023/08/10 15:12:39 Scanning for dependencies...
2023/08/10 15:12:40 Successfully scanned dependencies
2023/08/10 15:12:40 Launching container with name: build
Sending build context to Docker daemon  306.2kB
Step 1/29 : FROM node:18-alpine AS base
18-alpine: Pulling from library/node
7264a8db6415: Pulling fs layer
d68f2f1a5d31: Pulling fs layer
e7e6b7606c1a: Pulling fs layer
904e9a84b7a0: Pulling fs layer
904e9a84b7a0: Waiting
e7e6b7606c1a: Verifying Checksum
e7e6b7606c1a: Download complete
7264a8db6415: Verifying Checksum
7264a8db6415: Download complete
904e9a84b7a0: Verifying Checksum
904e9a84b7a0: Download complete
7264a8db6415: Pull complete
d68f2f1a5d31: Verifying Checksum
d68f2f1a5d31: Download complete
d68f2f1a5d31: Pull complete
e7e6b7606c1a: Pull complete
904e9a84b7a0: Pull complete
Digest: sha256:58878e9e1ed3911bdd675d576331ed8838fc851607aed3bb91e25dfaffab3267
Status: Downloaded newer image for node:18-alpine
 ---> f1fac320ae0c
Step 2/29 : FROM base AS deps
 ---> f1fac320ae0c
Step 3/29 : RUN apk add --no-cache libc6-compat
 ---> Running in a97424a59e0e
fetch https://dl-cdn.alpinelinux.org/alpine/v3.18/main/x86_64/APKINDEX.tar.gz
fetch https://dl-cdn.alpinelinux.org/alpine/v3.18/community/x86_64/APKINDEX.tar.gz
(1/1) Installing libc6-compat (1.2.4-r1)
OK: 10 MiB in 18 packages
Removing intermediate container a97424a59e0e
 ---> b47109d0602c
Step 4/29 : WORKDIR /app
 ---> Running in 1e578cec0445
Removing intermediate container 1e578cec0445
 ---> b3e0c67218c5
Step 5/29 : COPY package.json package-lock.json* ./
 ---> cce69fbefa7b
Step 6/29 : RUN npm ci
 ---> Running in d7a5118f5739


added 374 packages, and audited 375 packages in 16s

113 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
npm notice 
npm notice New minor version of npm available! 9.6.7 -> 9.8.1
npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.8.1>
npm notice Run `npm install -g npm@9.8.1` to update!
npm notice 
Removing intermediate container d7a5118f5739
 ---> 3be7677ef7c4
Step 7/29 : FROM base AS builder
 ---> f1fac320ae0c
Step 8/29 : WORKDIR /app
 ---> Running in 41e27770a98b
Removing intermediate container 41e27770a98b
 ---> f853a976153a
Step 9/29 : COPY --from=deps /app/node_modules ./node_modules

 ---> 3f2bc7cf46b7
Step 10/29 : COPY . .
 ---> a11cd0d806e7
Step 11/29 : RUN npm run build
 ---> Running in f70113419202

> next-auth-demo@0.1.0 build
> prisma generate && next build

Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (5.1.1 | library) to ./node_modules/@prisma/client in 78ms
You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client
\`\`\`
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
\`\`\`
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

- info Creating an optimized production build...


🌼 daisyUI 3.5.1 https://daisyui.com
╰╮
 ╰─ ✔︎ [ 29 ] themes are enabled. You can add more themes or make your own theme:
      https://daisyui.com/docs/themes

    ❤︎ Support daisyUI: https://opencollective.com/daisyui

- info Compiled successfully
- info Linting and checking validity of types...
- info Collecting page data...
- info Generating static pages (0/9)
Failed to generate SAS token: TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined
Error: Could not generate SAS token.
    at getAzureSasToken (/app/.next/server/app/api/azure-sas-token/route.js:203:19)
    at async /app/.next/server/chunks/778.js:8809:37
- info Generating static pages (2/9)
- info Generating static pages (4/9)
- info Generating static pages (6/9)
- info Generating static pages (9/9)
- info Finalizing page optimization...

Route (app)                                Size     First Load JS
┌ λ /                                      72.6 kB         164 kB
├ λ /api/azure-sas-token                   0 B                0 B
├ λ /api/signin                            0 B                0 B
├ λ /api/signup                            0 B                0 B
├ λ /api/vote                              0 B                0 B
├ λ /api/vote/[id]                         0 B                0 B
├ ○ /signin                                2.2 kB         99.5 kB
└ ○ /signup                                2.31 kB        99.6 kB
+ First Load JS shared by all              78.4 kB
  ├ chunks/596-2b24a9f242baedff.js         25.9 kB
  ├ chunks/fd9d1056-d281c0fa281e6dbb.js    50.5 kB
  ├ chunks/main-app-962e8316c057a8f8.js    214 B
  └ chunks/webpack-9459c2eb77343dec.js     1.73 kB

Route (pages)                              Size     First Load JS
─ ○ /404                                   182 B          75.7 kB
+ First Load JS shared by all              75.5 kB
  ├ chunks/framework-8883d1e9be70c3da.js   45 kB
  ├ chunks/main-59b1fca719d9ebda.js        28.6 kB
  ├ chunks/pages/_app-52924524f99094ab.js  195 B
  └ chunks/webpack-9459c2eb77343dec.js     1.73 kB

λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
○  (Static)  automatically rendered as static HTML (uses no initial props)

npm notice 
npm notice New minor version of npm available! 9.6.7 -> 9.8.1
npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.8.1>
npm notice Run `npm install -g npm@9.8.1` to update!
npm notice 
Removing intermediate container f70113419202
 ---> 15ca896f387e
Step 12/29 : FROM base AS runner
 ---> f1fac320ae0c
Step 13/29 : WORKDIR /app
 ---> Using cache
 ---> f853a976153a
Step 14/29 : COPY prisma prisma
 ---> f17f04dc97fb
Step 15/29 : COPY entrypoint.sh ./
 ---> d267e1577cbb
Step 16/29 : RUN chmod +x ./entrypoint.sh
 ---> Running in 13c20fff0f3a
Removing intermediate container 13c20fff0f3a
 ---> 89d2ca383bfd
Step 17/29 : RUN npm i -g prisma
 ---> Running in 353c3c121fb7

added 2 packages in 2s
npm notice 
npm notice New minor version of npm available! 9.6.7 -> 9.8.1
npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.8.1>
npm notice Run `npm install -g npm@9.8.1` to update!
npm notice 
Removing intermediate container 353c3c121fb7
 ---> 7ff33cdc2363
Step 18/29 : ENV NODE_ENV production
 ---> Running in 923b163d6fad
Removing intermediate container 923b163d6fad
 ---> d524b0932190
Step 19/29 : RUN addgroup --system --gid 1001 nodejs
 ---> Running in be29bdf1b2f7
Removing intermediate container be29bdf1b2f7
 ---> c46ee76bc1a2
Step 20/29 : RUN adduser --system --uid 1001 nextjs
 ---> Running in 0c3676935222
Removing intermediate container 0c3676935222
 ---> f0f3a76d764f
Step 21/29 : USER nextjs
 ---> Running in bb5ec9f7ffcf
Removing intermediate container bb5ec9f7ffcf
 ---> 8e017beaa982
Step 22/29 : COPY --from=builder /app/public ./public
 ---> 4063ebad868d
Step 23/29 : COPY --from=builder /app/.next/standalone ./
 ---> 5883b6413812
Step 24/29 : COPY --from=builder /app/.next/static ./.next/static
 ---> 1ffd6b69f876
Step 25/29 : EXPOSE 3000
 ---> Running in 3108e497e7e0
Removing intermediate container 3108e497e7e0
 ---> baf60a6c2219
Step 26/29 : ENV PORT 3000
 ---> Running in cdadd67a91dd
Removing intermediate container cdadd67a91dd
 ---> c6beb167ba54
Step 27/29 : ENV HOSTNAME localhost
 ---> Running in 7c77fce3472d
Removing intermediate container 7c77fce3472d
 ---> 5805d8b146b5
Step 28/29 : ENTRYPOINT ["./entrypoint.sh"]
 ---> Running in dc1473f2e02b
Removing intermediate container dc1473f2e02b
 ---> 3b338a89c49a
Step 29/29 : CMD ["node", "server.js"]
 ---> Running in d6d62d34dcea
Removing intermediate container d6d62d34dcea
 ---> ac777fcd7840
Successfully built ac777fcd7840
Successfully tagged ca0e09205e8dacr.azurecr.io/$MY_CONTAINER_APP_NAME:20230810111209328146
2023/08/10 15:14:53 Successfully executed container: build
2023/08/10 15:14:53 Executing step ID: push. Timeout(sec): 3600, Working directory: '', Network: ''
2023/08/10 15:14:53 Pushing image: ca0e09205e8dacr.azurecr.io/$MY_CONTAINER_APP_NAME:20230810111209328146, attempt 1
The push refers to repository [ca0e09205e8dacr.azurecr.io/$MY_CONTAINER_APP_NAME]
09769128f8fc: Preparing
756f2d9fbd26: Preparing
f888c6bb2d3e: Preparing
f92a569e8a75: Preparing
1390adbd2aaa: Preparing
e208ee5f0fef: Preparing
6acd493555c8: Preparing
4eaba9fb75ed: Preparing
6718c64a068a: Preparing
2b7ce5864aa1: Preparing
1c9b76bca5f3: Preparing
6e9a9d2ae104: Preparing
77967e5b75ee: Preparing
4693057ce236: Preparing
e208ee5f0fef: Waiting
6acd493555c8: Waiting
4eaba9fb75ed: Waiting
6718c64a068a: Waiting
2b7ce5864aa1: Waiting
1c9b76bca5f3: Waiting
6e9a9d2ae104: Waiting
77967e5b75ee: Waiting
4693057ce236: Waiting
f92a569e8a75: Pushed
f888c6bb2d3e: Pushed
1390adbd2aaa: Pushed
09769128f8fc: Pushed
756f2d9fbd26: Pushed
6acd493555c8: Pushed
6718c64a068a: Pushed
4eaba9fb75ed: Pushed
2b7ce5864aa1: Pushed
1c9b76bca5f3: Pushed
6e9a9d2ae104: Pushed
4693057ce236: Pushed
e208ee5f0fef: Pushed
77967e5b75ee: Pushed
20230810111209328146: digest: sha256:8249e74ca883b2e83c49d8ac62d9d1dad91bfa9c9f288183ea1cf0903610a6f6 size: 3242
2023/08/10 15:15:13 Successfully pushed image: ca0e09205e8dacr.azurecr.io/$MY_CONTAINER_APP_NAME:20230810111209328146
2023/08/10 15:15:13 Step ID: build marked as successful (elapsed time in seconds: 133.415554)
2023/08/10 15:15:13 Populating digests for step ID: build...
2023/08/10 15:15:14 Successfully populated digests for step ID: build
2023/08/10 15:15:14 Step ID: push marked as successful (elapsed time in seconds: 20.409741)
2023/08/10 15:15:14 The following dependencies were found:
2023/08/10 15:15:14 
- image:
    registry: ca0e09205e8dacr.azurecr.io
    repository: $MY_CONTAINER_APP_NAME
    tag: "20230810111209328146"
    digest: sha256:8249e74ca883b2e83c49d8ac62d9d1dad91bfa9c9f288183ea1cf0903610a6f6
  runtime-dependency:
    registry: registry.hub.docker.com
    repository: library/node
    tag: 18-alpine
    digest: sha256:58878e9e1ed3911bdd675d576331ed8838fc851607aed3bb91e25dfaffab3267
  git: {}

Run ID: cf1 was successful after 3m3s
Creating Containerapp $MY_CONTAINER_APP_NAME in resource group $MY_RESOURCE_GROUP_NAME
Adding registry password as a secret with name "ca0e09205e8dacrazurecrio-ca0e09205e8dacr"

Container app created. Access your app at https://$MY_CONTAINER_APP_NAME.kindocean-a506af76.$MY_LOCATION.azurecontainerapps.io/


Your container app $MY_CONTAINER_APP_NAME has been created and deployed! Congrats! 

Browse to your container app at: http://$MY_CONTAINER_APP_NAME.kindocean-a506af76.$MY_LOCATION.azurecontainerapps.io 

Stream logs for your container with: az containerapp logs show -n $MY_CONTAINER_APP_NAME -g $MY_RESOURCE_GROUP_NAME 

See full output using: az containerapp show -n $MY_CONTAINER_APP_NAME -g $MY_RESOURCE_GROUP_NAME 
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

Results:

```json
{
  "endIpAddress": "20.237.221.47",
  "id": "/subscriptions/ab9d8365-2f65-47a4-8df4-7e40db70c8d2/resourceGroups/$MY_RESOURCE_GROUP_NAME/providers/Microsoft.DBforPostgreSQL/flexibleServers/$MY_DATABASE_SERVER_NAME/firewallRules/allow-container-app",
  "name": "allow-container-app",
  "resourceGroup": "$MY_RESOURCE_GROUP_NAME",
  "startIpAddress": "20.237.221.47",
  "systemData": null,
  "type": "Microsoft.DBforPostgreSQL/flexibleServers/firewallRules"
}
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
