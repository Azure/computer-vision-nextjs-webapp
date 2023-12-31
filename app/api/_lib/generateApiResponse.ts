import { NextResponse } from 'next/server';

const SUCCESS_STATUSES = [200] as const;
const FAIL_STATUSES = [500, 404, 401, 403, 400, 409] as const;

export type SuccessStatus = (typeof SUCCESS_STATUSES)[number];
export type FailStatus = (typeof FAIL_STATUSES)[number];

type ApiResponseSuccess<T> = {
  status: SuccessStatus;
  data: T;
};

type ApiResponseFail = {
  status: FailStatus;
  error: string;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseFail;

export const generateApiResponse = <T = {}>(response: ApiResponse<T>) => {
  if (SUCCESS_STATUSES.includes(response.status as any)) {
    const { data } = response as ApiResponseSuccess<T>;
    return NextResponse.json(data);
  }

  if (FAIL_STATUSES.includes(response.status as any)) {
    const { error, status } = response as ApiResponseFail;
    return NextResponse.json({ error }, { status });
  }
};
