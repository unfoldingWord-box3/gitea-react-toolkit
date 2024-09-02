/// <reference types="jest" />
import * as helpers from './tokens';
// jest.mock('../core');
// import * as core from '../http/http';

const headers = {
  'Authorization': 'basic 123456789',
  'Content-Type': 'application/json',
};

// TODO: these tests have been failing for years, need to fix

describe.skip('getTokens', () => {
  const params = {
    username: 'username',
    config: {
      token: {
        sha1: 'string',
        id: 'string',
        name: 'string',
      },
      tokenid: 'test-id',
    },
  };

  it('should not get tokens without headers.config', async () => {
    const res = await helpers.getTokens(params);
    expect(res).toEqual(null);
  });

  it('should get tokens with headers.config', async () => {
    params.config.headers = headers;
    const expected = [{
      'id': params.config.tokenid, 'name': 'user-token', 'sha1': 'encrypted123456789',
    }];
    const res = await helpers.getTokens(params);
    return expect(res).toEqual(expected);
  });
});

describe.skip('createTokens', () => {
  const params = {
    username: 'username',
    config: {
      headers,
      token: {
        sha1: 'string',
        id: 'string',
        name: 'string',
      },
      tokenid: 'token-id',
    },
  };
  const expected = [{
    'id': 'test-id', 'name': 'user-token', 'sha1': 'encrypted123456789',
  }];

  it('should create tokens from a user', async () => {
    const res = await helpers.createToken(params);
    expect(res).toEqual(expected);
  });
  it('should not create tokens from an invalid user', async () => {
    params.username = 'fail';
    const res = await helpers.createToken(params);
    return expect(res).toEqual([]);
  });
});

describe.skip('deleteToken', () => {
  const params = {
    username: 'username',
    config: {
      headers,
      token: {
        sha1: 'string',
        id: 'string',
        name: 'string',
      },
      tokenid: 'token-id',
    },
    token: {
      sha1: 'string',
      id: 'string',
      name: 'string',
    },
  };

  it('should delete the token', async () => {
    const res = await helpers.deleteToken(params);
    expect(res).toEqual(true);
  });
  it('should not delete tokens from an invalid user', async () => {
    params.username = 'fail';
    const res = await helpers.deleteToken(params);
    expect(res).toEqual(false);
  });
});

describe.skip('ensureTokens', () => {
  const params = {
    username: 'username',
    config: {
      headers,
      token: {
        sha1: 'string',
        id: 'string',
        name: 'string',
      },
      tokenid: 'token-id',
    },
  };

  it('should delete tokens from match', async () => {
    const expected = [{
      'id': 'test-id', 'name': 'user-token', 'sha1': 'encrypted123456789',
    }];
    const res = await helpers.ensureToken(params);
    expect(res).toEqual(expected);
  });
});