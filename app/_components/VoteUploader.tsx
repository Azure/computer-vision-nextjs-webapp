'use client';

import { useState } from 'react';
import { UploadInput } from './inputs/UploadInput';
import { Image } from './Image';
import { useToast } from '@/_hooks/useToast';
import { callBackend } from '@/_lib/server/callBackend';
import { ApiPostVoteBody, ApiPostVoteResp } from '@/api/vote/_handlers/postVote';
import { ApiGetSasTokenResp } from '@/api/azure-sas-token/_handlers/getAzureSasToken';
import { BlockBlobClient } from '@azure/storage-blob';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';

type Props = {
  userId: string;
  imageUrl?: string;
};

export function VoteUploader({ imageUrl, userId }: Props) {
  const showToast = useToast();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onUploadImage = async (file?: File) => {
    if (!file) return;

    setIsLoading(true);
    setImageFile(file);

    try {
      // 1. Call backend to generate an Azure SAS token for temporary blob access
      const { sasToken, storageUri } = await callBackend<ApiGetSasTokenResp>({
        method: 'GET',
        url: '/api/azure-sas-token',
      });

      // 2. Use SAS token to upload video to default azure container
      const blobUrl = `${storageUri}/${file.name}-${uuid()}`;
      const blobUrlWithSasToken = `${blobUrl}${sasToken}`;

      const blobClient = new BlockBlobClient(blobUrlWithSasToken);
      await blobClient.uploadData(file);

      await callBackend<ApiPostVoteResp, ApiPostVoteBody>({
        method: 'POST',
        url: '/api/vote',
        body: {
          userId,
          blobUrl,
        },
      });
    } catch (e) {
      showToast({ type: 'danger', text: `Error casting vote: ${e}` });
    }

    setIsLoading(false);
    router.refresh();
  };

  return imageUrl ? (
    <Image src={imageUrl} alt="Voting image" className="sm:max-h-md h-auto w-auto max-w-xs" />
  ) : (
    <UploadInput file={imageFile} onChangeFile={onUploadImage} className="!mt-5" isLoading={isLoading} />
  );
}
