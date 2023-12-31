type GetProps = {
  method: 'GET' | 'DELETE';
};

type OtherMethodsProps<Body> = {
  method: 'POST' | 'PUT' | 'BATCH';
  body: Body;
};

type BaseProps<QueryParams> = {
  url: string;
  queryParams?: QueryParams;
};

type Props<QueryParams, Body> = BaseProps<QueryParams> & (GetProps | OtherMethodsProps<Body>);

export const callBackend = async <ReturnType, Body = {}, QueryParams extends Record<string, string> = {}>(
  params: Props<QueryParams, Body>,
) => {
  const { url, method, queryParams } = params;
  const urlWithParams = queryParams ? addSearchParams(url, queryParams) : url;
  let res;

  if (method === 'GET' || method === 'DELETE') {
    res = await fetch(urlWithParams, {
      method,
    });
  } else {
    const { body } = params as any;
    res = await fetch(urlWithParams, {
      method,
      body: JSON.stringify(body),
    });
  }

  const data = await res.json();

  if (!res.ok) {
    console.error(`Error fetching ${urlWithParams}: ${data.error}`);
    throw data.error as string;
  }

  return data as ReturnType;
};

const addSearchParams = (url: string, params: Record<string, string>) => {
  let urlWithParams = new URL(url);

  for (const [key, value] of Object.entries(params)) {
    urlWithParams.searchParams.append(key, value);
  }

  return urlWithParams.toString();
};
