import { NextRequest, NextResponse } from 'next/server';
import { generateApiResponse } from '@/api/_lib/generateApiResponse';
import { generateAzureStorageSasToken } from '@/_lib/server/generateAzureStorageSasToken';

export type ApiGetSasTokenResp = {
  sasToken: string;
  storageUri: string;
};

export const getAzureSasToken = async (req: NextRequest) => {
  try {
    const { sasToken, storageUri } = await generateAzureStorageSasToken('images');

    if (!sasToken) {
      throw Error('Could not generate SAS token.');
    }

    return generateApiResponse<ApiGetSasTokenResp>({
      status: 200,
      data: {
        sasToken,
        storageUri,
      },
    });
  } catch (e) {
    console.error(e);
    return generateApiResponse({
      status: 500,
      error: `Error: ${e}`,
    });
  }
};
