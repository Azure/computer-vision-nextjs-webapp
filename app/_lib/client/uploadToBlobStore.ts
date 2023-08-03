import { callBackend } from '@/_lib/server/callBackend';
import { ApiGetSasTokenResp } from '@/api/azure-sas-token/_handlers/getAzureSasToken';
import { BlockBlobClient } from '@azure/storage-blob';

export const uploadToBlobStore = async ({
  file,
  onProgress,
}: {
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<string> => {
  // 1. Call backend to generate an Azure SAS token for temporary blob access
  const { sasToken, storageUri } = await callBackend<ApiGetSasTokenResp>({
    method: 'GET',
    url: '/api/azure/sas-token',
  });

  // 2. Use SAS token to upload video to default azure container
  const blobUrlWithSasToken = `${storageUri}/${file.name}${sasToken}`;

  const blobClient = new BlockBlobClient(blobUrlWithSasToken);
  await blobClient.uploadData(file, {
    onProgress: progressEvent => onProgress?.((progressEvent.loadedBytes / file.size) * 100),
  });

  return `${storageUri}/${file.name}`;
};
