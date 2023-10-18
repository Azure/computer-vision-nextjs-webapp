  
az group delete --name $MY_RESOURCE_GROUP_NAME --yes --no-wait

az cognitiveservices account purge \
  --name $MY_COMPUTER_VISION_NAME \
  --resource-group $MY_RESOURCE_GROUP_NAME \
  --location $MY_LOCATION

