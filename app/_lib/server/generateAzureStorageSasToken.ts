import {
  AccountSASPermissions,
  AccountSASResourceTypes,
  AccountSASServices,
  generateAccountSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

export const generateAzureStorageSasToken = async (
  containerName: string,
): Promise<{
  sasToken?: string;
  storageUri: string;
}> => {
  const { AZURE_STORAGE_ACCOUNT_NAME: accountName, AZURE_STORAGE_ACCOUNT_KEY: accountKey } = process.env;

  const storageUri = `https://${accountName}.blob.core.windows.net/${containerName}`;

  try {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasOptions = {
      services: AccountSASServices.parse('btqf').toString(), // blobs, tables, queues, files
      resourceTypes: AccountSASResourceTypes.parse('sco').toString(), // service, container, object
      permissions: AccountSASPermissions.parse('rwdlacupi'), // permissions
      protocol: SASProtocol.Https,
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 72 * 60 * 60 * 1000), // 3 days
    };

    const sasToken = generateAccountSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    return {
      storageUri,
      sasToken: sasToken[0] === '?' ? sasToken : `?${sasToken}`,
    };
  } catch (error) {
    console.error(`Failed to generate SAS token: ${error}`);
    return {
      storageUri,
    };
  }
};
