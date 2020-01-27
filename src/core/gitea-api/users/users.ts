import Path from 'path';
import { APIConfig } from '../core.d';
import { apiPath, get } from '../core';

export const getUser = async ({ username, config }: {
  username: string;
  config: APIConfig;
}): Promise<{ id: object; } | null> => {
  let user;
  const url = Path.join(apiPath, 'users', username);

  try {
    user = await get({ url, config });
  } catch (e) {
    const errorMessage = e && e.message ? e.message : '';
    const errorResponse = e && e.response;

    if (!errorResponse && errorMessage.match(/network/ig) && !navigator.onLine) {
      throw new Error('ERR_INTERNET_DISCONNECTED');
    } else {
      user = null;
    }
  }
  return user;
};

export const getUID = async ({ username, config }: {
  username: string;
  config: APIConfig;
}): Promise<string> => {
  let uid;

  try {
    const user = await getUser({ username, config });

    if (user) {
      uid = user.id;
    }
  } catch {
    uid = null;
  }
  return uid;
};
