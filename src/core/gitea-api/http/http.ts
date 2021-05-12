import localforage from 'localforage';
import axios from 'axios';
import { setup } from 'axios-cache-adapter';
import { authorizationHeaders } from '../authentication';
import { APIConfig } from './http.d';
export const apiPath = 'api/v1';
const DEFAULT_MAX_AGE = 1000;
const SERVER_ONLINE_STATUS = 200;
export const ERROR_SERVER_UNREACHABLE = 'ERR_SERVER_UNREACHABLE';
export const ERROR_NETWORK_DISCONNECTED = 'ERR_NETWORK_DISCONNECTED';
export const ERROR_NETWORK_ERROR = 'Network Error';

const cacheStore = localforage.createInstance({
  driver: [localforage.INDEXEDDB],
  name: 'web-cache',
});

const api = setup({
  crossDomain: true,
  cache: {
    store: cacheStore,
    maxAge: 1 * 1 * 1 * 1 * DEFAULT_MAX_AGE,
    exclude: { query: false },
    key: req => {
      const serialized = req.params instanceof URLSearchParams ?
        req.params.toString() : JSON.stringify(req.params) || '';
      return req.url + serialized;
    },
  },
});

interface RestAPI {
  config: ExtendConfig;
  url: string;
  payload: object;
}

export interface ExtendConfig {
  token?: string;
  tokenid?: string;
  headers?: object;
  server?: string;
  data?: object;
}

export const extendConfig = (config: ExtendConfig): APIConfig => {
  let headers = { ...config.headers };

  if (config && config.token) {
    const authHeaders = authorizationHeaders({ token: config.token });
    headers = { ...config.headers, ...authHeaders };
  }

  const _config = {
    baseURL: config.server, ...config, headers,
  };
  return _config;
};

interface Get {
  config: APIConfig | ExtendConfig;
  url: string;
  params?: object;
  noCache?: number | boolean;
  fullResponse?: boolean;
}

export const checkIfServerOnline = async (serverUrl): Promise<void> => {
  if (!navigator.onLine) {
    throw new Error(ERROR_NETWORK_DISCONNECTED);
  }

  try {
    const response = await axios.get(`${serverUrl}/${apiPath}/version`);
    const serverIsResponding = response.status === SERVER_ONLINE_STATUS;

    if (!serverIsResponding) {
      throw new Error(ERROR_SERVER_UNREACHABLE);
    }
  } catch (e) {
    const errorMessage = e && e.message ? e.message : '';

    if (errorMessage.match(/network error/ig)) {
      throw new Error(ERROR_SERVER_UNREACHABLE);
    } else {
      throw e;
    }
  }
};

/**
 * do http get
 * @param {string} url
 * @param {object} params
 * @param {object} config - config parameters
 * @param {boolean} [noCache] optional flag to disable caching
 * @param {boolean} [fullResponse] optional flag to return full http response including data and statusCode, useful if you want specifics such as http codes
 */
export const get = async ({
  url, params, config, noCache, fullResponse,
}: Get): Promise<any> => {
  const _config = config ? extendConfig(config) : {};
  let response: any;

  try {
    if (noCache || config.noCache) {
      const _params = { noCache: Math.random(), ...params };
      response = await axios.get(url, { ..._config, params: _params });
    } else {
      response = await api.get(url, { ..._config, params });
    }
  } catch {
    await checkIfServerOnline(config.server);
  }

  if (fullResponse) {
    return response;
  }
  const data = response ? response.data : null;
  return data;
};

export const post = async ({
  url, payload, config,
}: RestAPI): Promise<any> => {
  const _config = extendConfig(config);
  const { data } = await axios.post(url, payload, _config);
  return data;
};

export const put = async ({
  url, payload, config,
}: RestAPI): Promise<any> => {
  const _config = extendConfig(config);
  const { data } = await axios.put(url, payload, _config);
  return data;
};

export const patch = async ({
  url, payload, config,
}: RestAPI): Promise<any> => {
  const _config = extendConfig(config);
  const { data } = await axios.patch(url, payload, _config);
  return data;
};

export const del = async ({
  url, payload, config,
}: RestAPI): Promise<any> => {
  const _config = extendConfig(config);
  _config.data = payload;
  const { data } = await axios.delete(url, _config);
  return data;
};

export const defaultErrorMessages = {
  actionText: 'Login',
  genericError: 'Something went wrong, please try again.',
  usernameError: 'Username does not exist.',
  passwordError: 'Password is invalid.',
  networkError: 'There is an issue with your network connection. Please try again.',
  serverError: 'There is an issue with the server please try again.',
};

export const parseError = ({ error, messages = defaultErrorMessages }) => {
  const errorMessage = error && error.message ? error.message : '';
  let friendlyError = {};

  if (errorMessage.match(ERROR_SERVER_UNREACHABLE)) {
    friendlyError = {
      errorMessage: messages.serverError,
      isRecoverable: false
    };
  }
  else if (errorMessage.match(ERROR_NETWORK_DISCONNECTED) || errorMessage.match(ERROR_NETWORK_ERROR)) {
    friendlyError = {
      errorMessage: messages.networkError,
      isRecoverable: false,
    };
  }
  else {
    friendlyError = {
      errorMessage: messages.genericError,
      isRecoverable: true,
    };
  }

  return friendlyError;
};