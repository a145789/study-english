import qs from 'qs';
const fetchHandle = async (url: string, method: 'POST' | 'GET', data: any) => {
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
  };

  const options: { [key: string]: any } = {
    method,
    headers,
  };
  if (method === 'GET') {
    url = url + '?' + qs.stringify(data);
  }
  if (method === 'POST') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`/api/${url}`, options);
  console.log(await response.json());
  return response;
};

const postHandle = (url: string, data: any) => fetchHandle(url, 'POST', data);
const getHandle = (url: string, data: any) => fetchHandle(url, 'GET', data);

export { getHandle, postHandle };
