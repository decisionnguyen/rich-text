import {
  RegistryClient,
  AuthenticationParams,
  Credentials,
  LoginPayload
} from "../types";
import LocalStorageHelper from "@base/core/helpers/LocalStorageHelper";
import Core from "@base/core/services/Core";
import Fetch from "@base/core/services/Fetch";
import { AuthResult } from "./AuthCheck";
import { AxiosResponse } from "axios";

const REGISTRY_CLIENT_URL = "@api/extapi/oauth/client";
const LOGIN_MOBILE_URL = "@api/ajax/mobile/login";
const LOGOUT_MOBILE_URL = "@api/ajax/mobile/logout";

class AuthServiceClass {
  static kCredentials = "@base-rn/credentials";

  async init() {
    await this.updateKeys();
  }

  getRegistryClient(): RegistryClient {
    const client: RegistryClient = {
      client_key: Core.clientKey,
      client_secret: Core.clientSecret
    };
    return client;
  }

  getAuthParams(): AuthenticationParams {
    const params: AuthenticationParams = {
      client_key: Core.clientKey,
      access_token: Core.accessToken,
      client_auth: 1
    };
    return params;
  }

  isValidParams(authParams: AuthenticationParams): boolean {
    return (
      !!authParams.access_token &&
      authParams.access_token.length > 0 &&
      !!authParams.client_key &&
      authParams.client_key.length > 0
    );
  }

  async updateKeys() {
    const credentials: Credentials | null = await LocalStorageHelper.getObject(
      AuthServiceClass.kCredentials
    );
    if (!!credentials) {
      const {
        clientKey,
        clientSecret,
        accessToken,
        sysUrl,
        systemName,
        intercomToken
      } = credentials;
      Core.clientKey = clientKey;
      Core.clientSecret = clientSecret;
      Core.accessToken = accessToken;
      Core.sysUrl = sysUrl;
      Core.intercomToken = intercomToken;
      Core.systemName = systemName;
    }
  }

  async clearKeys() {
    await LocalStorageHelper.remove(AuthServiceClass.kCredentials);
    Core.clientKey = "";
    Core.clientSecret = "";
    Core.accessToken = "";
    Core.sysUrl = "base.vn";
    Core.intercomToken = "";
    Core.systemName = "";
  }

  async saveAuthResult(authResult: AuthResult) {
    const {
      client_key,
      access_token,
      sys_url,
      intercom_token,
      system,
      socket_url,
      share_url
    } = authResult;
    const credentials: Credentials = {
      clientKey: client_key,
      accessToken: access_token,
      clientSecret: Core.clientSecret,
      sysUrl: sys_url,
      intercomToken: intercom_token,
      systemName: system
    };
    await LocalStorageHelper.setObject(
      AuthServiceClass.kCredentials,
      credentials
    );
    Core.clientKey = client_key;
    Core.accessToken = access_token;
    Core.clientSecret = credentials.clientSecret;
    Core.sysUrl = sys_url;
    Core.socketUrl = socket_url;
    Core.shareUrl = share_url;
    Core.intercomToken = intercom_token;
    Core.systemName = system;
  }

  async saveCredentials(credentials: Credentials) {
    await LocalStorageHelper.setObject(
      AuthServiceClass.kCredentials,
      credentials
    );
    Core.clientKey = credentials.clientKey;
    Core.accessToken = credentials.accessToken;
    Core.clientSecret = credentials.clientSecret;
    Core.sysUrl = credentials.sysUrl;
    Core.intercomToken = credentials.intercomToken;
    Core.systemName = credentials.systemName;
  }

  async saveCredentialsKey(key: keyof Credentials, value: string) {
    const credentials: Credentials = {
      clientKey: Core.clientKey,
      accessToken: Core.accessToken,
      clientSecret: Core.clientSecret,
      sysUrl: Core.sysUrl,
      intercomToken: Core.intercomToken,
      systemName: Core.systemName,
      [key]: value
    };
    await this.saveCredentials(credentials);
  }

  async saveClientKey(value: string) {
    await this.saveCredentialsKey("clientKey", value);
  }

  async saveClientSecret(value: string) {
    await this.saveCredentialsKey("clientSecret", value);
  }

  async saveAccessToken(value: string) {
    await this.saveCredentialsKey("accessToken", value);
  }

  async saveSysUrl(value: string) {
    await this.saveCredentialsKey("sysUrl", value);
  }

  async saveSystemName(value: string) {
    await this.saveCredentialsKey("systemName", value);
  }

  async saveIntercomToken(value: string) {
    await this.saveCredentialsKey("intercomToken", value);
  }

  async registryClient() {
    try {
      const response: AxiosResponse<any> = await Fetch.get(REGISTRY_CLIENT_URL);
      const data = response.data;
      if (data.code !== 1 || !data.client) {
        return [data.message, null];
      }
      const registryClient = data.client as RegistryClient;
      const credentials: Credentials = {
        clientKey: registryClient.client_key,
        accessToken: Core.accessToken,
        clientSecret: registryClient.client_secret,
        sysUrl: Core.sysUrl,
        intercomToken: Core.intercomToken,
        systemName: Core.systemName
      };
      await this.saveCredentials(credentials);
      return [null, data.client];
    } catch (error) {
      return [error.message, null];
    }
  }

  async login(email: string, password: string, twoFactorCode?: string) {
    try {
      const response: AxiosResponse<any> = await Fetch.post(LOGIN_MOBILE_URL, {
        ...this.getRegistryClient(),
        email,
        password,
        code_2fa: twoFactorCode
      });
      const { data } = response;
      if (!data) return ["INVALID_DATA", null];
      if (!data.client) {
        return [data.message, null];
      }
      const payload = data as LoginPayload;
      await this.saveAccessToken(payload.client.access_token);
      return [null, payload];
    } catch (error) {
      return [error ? error.message : error, null];
    }
  }

  async logout() {
    return Fetch.postWithToken(LOGOUT_MOBILE_URL);
  }
}
const AuthService = new AuthServiceClass();
export default AuthService;
