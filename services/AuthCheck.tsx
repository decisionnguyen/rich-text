import { Platform, NativeModules, Linking } from "react-native";
const { BaseAuth } = NativeModules;

type Options = {
  accessGroup?: string;
  service?: string;
};

const defaultOptions: Options = {
  accessGroup: "ZKH63VCT4Y.share.access.token"
};

const ACCESS_TOKEN = "access_token";
const CLIENT_KEY = "client_key";
const SHARE_URL_KEY = "share_url";
const SOCKET_URL_KEY = "socket_url";
const SYS_URL_KEY = "sys_url";
const INTERCOM_TOKEN_KEY = "intercom_token";
const FIREBASE_TOKEN_KEY = "firebase_token";
const SYSTEM_KEY = "system";

const BASE_MESSAGE_IOS_URL = "baseShareUrlScheme://app";
const BASE_MESSAGE_IOS_APP_STORE_URL =
  "itms-apps://itunes.apple.com/us/app/id1365505175?mt=8";

const BASE_MESSAGE_ANDROID_URL = "vn.base.message://vn.base.message";
const BASE_MESSAGE_GOOGLE_PLAY_URL = "market://details?id=vn.base.message";

const DEFAULT_SHARE_URL = "https://share-main.basecdn.net";
const DEFAULT_SOCKET_URL = "wss://socket-00.basecdn.net:1310";
const DEFAULT_SYS_URL = "base.vn";

export interface AuthResult {
  access_token: string;
  client_key: string;
  share_url: string;
  socket_url: string;
  sys_url: string;
  intercom_token: string;
  firebase_token: string;
  system: string;
}

export const defaultAuthResult: AuthResult = {
  access_token: "",
  client_key: "",
  share_url: DEFAULT_SHARE_URL,
  socket_url: DEFAULT_SOCKET_URL,
  sys_url: DEFAULT_SYS_URL,
  intercom_token: "",
  firebase_token: "",
  system: ""
};

class AuthCheckService {
  getAuth = async (): Promise<false | AuthResult> => {
    if (Platform.OS === "android") {
      return this._getAuthAndroid();
    } else {
      return this._getAuthIOS();
    }
  };

  isStillGood = async (result: AuthResult | any) => {
    const currentAuthResult = await this.getAuth();
    if (!currentAuthResult) return false;
    try {
      return (
        currentAuthResult.access_token === result.access_token &&
        currentAuthResult.client_key === result.client_key &&
        currentAuthResult.sys_url === result.sys_url
      );
    } catch (error) {
      return false;
    }
  };

  _getAuthAndroid = async (): Promise<false | AuthResult> => {
    try {
      const authToken = await BaseAuth.getAccessToken();
      //Only get system name
      if (authToken && authToken.system) {
        try {
          const systemJson = JSON.parse(authToken.system);
          if (systemJson && typeof systemJson.name === "string") {
            authToken.system = systemJson.name;
          }
        } catch (error2) {}
      }
      return await this._handleResult(authToken);
    } catch (error) {
      return false;
    }
  };

  _getAuthIOS = async (): Promise<false | AuthResult> => {
    try {
      const accessToken = await this._getDataWithKey(
        ACCESS_TOKEN,
        defaultOptions
      );
      const clientKey = await this._getDataWithKey(CLIENT_KEY, defaultOptions);
      const shareUrl = await this._getDataWithKey(
        SHARE_URL_KEY,
        defaultOptions
      );
      const socketUrl = await this._getDataWithKey(
        SOCKET_URL_KEY,
        defaultOptions
      );
      const sysUrl = await this._getDataWithKey(SYS_URL_KEY, defaultOptions);
      const intercomToken = await this._getDataWithKey(
        INTERCOM_TOKEN_KEY,
        defaultOptions
      );
      const firebaseToken = await this._getDataWithKey(
        FIREBASE_TOKEN_KEY,
        defaultOptions
      );
      const system = await this._getDataWithKey(SYSTEM_KEY, defaultOptions);
      return await this._handleResult({
        [ACCESS_TOKEN]: accessToken,
        [CLIENT_KEY]: clientKey,
        [SHARE_URL_KEY]: shareUrl,
        [SOCKET_URL_KEY]: socketUrl,
        [SYS_URL_KEY]: sysUrl,
        [INTERCOM_TOKEN_KEY]: intercomToken,
        [FIREBASE_TOKEN_KEY]: firebaseToken,
        [SYSTEM_KEY]: system
      });
    } catch (error) {
      return false;
    }
  };

  _getDataWithKey(
    key: string,
    serviceOrOptions?: string | Options
  ): Promise<false | string> {
    return BaseAuth.getDataWithKey(
      this._getOptionsArgument(serviceOrOptions),
      key
    );
  }

  _getOptionsArgument = (serviceOrOptions?: string | Options) => {
    return typeof serviceOrOptions === "string"
      ? { service: serviceOrOptions }
      : serviceOrOptions;
  };

  _handleResult = async (result): Promise<false | AuthResult> => {
    if (!result) {
      return false;
    } else if (!result[ACCESS_TOKEN] || result[ACCESS_TOKEN].length === 0) {
      return false;
    } else if (!result[CLIENT_KEY] || result[CLIENT_KEY].length === 0) {
      return false;
    } else {
      return {
        ...result,
        [SHARE_URL_KEY]:
          typeof result[SHARE_URL_KEY] === "string" &&
          result[SHARE_URL_KEY].length > 0
            ? result[SHARE_URL_KEY]
            : DEFAULT_SHARE_URL,
        [SOCKET_URL_KEY]:
          typeof result[SOCKET_URL_KEY] === "string" &&
          result[SOCKET_URL_KEY].length > 0
            ? result[SOCKET_URL_KEY]
            : DEFAULT_SOCKET_URL,
        [SYS_URL_KEY]:
          typeof result[SYS_URL_KEY] === "string" &&
          result[SYS_URL_KEY].length > 0
            ? result[SYS_URL_KEY]
            : DEFAULT_SYS_URL,
        [INTERCOM_TOKEN_KEY]:
          typeof result[INTERCOM_TOKEN_KEY] === "string" &&
          result[INTERCOM_TOKEN_KEY].length > 0
            ? result[INTERCOM_TOKEN_KEY]
            : "",
        [FIREBASE_TOKEN_KEY]:
          typeof result[FIREBASE_TOKEN_KEY] === "string" &&
          result[FIREBASE_TOKEN_KEY].length > 0
            ? result[FIREBASE_TOKEN_KEY]
            : "",
        [SYSTEM_KEY]:
          typeof result[SYSTEM_KEY] === "string" &&
          result[SYSTEM_KEY].length > 0
            ? result[SYSTEM_KEY]
            : ""
      };
    }
  };

  goToMasterApp = () => {
    if (Platform.OS === "ios") {
      this._goToIOSMasterApp();
    } else {
      this._goToAndroidMasterApp();
    }
  };

  canOpenIosApp = async () => {
    try {
      const supported = await Linking.canOpenURL(BASE_MESSAGE_IOS_URL);
      return supported;
    } catch (err) {
      return false;
    }
  };

  _goToIOSMasterApp = async () => {
    try {
      const supported = await Linking.canOpenURL(BASE_MESSAGE_IOS_URL);
      if (!supported) {
        Linking.openURL(BASE_MESSAGE_IOS_APP_STORE_URL);
      } else {
        Linking.openURL(BASE_MESSAGE_IOS_URL);
      }
    } catch (err) {
      Linking.openURL(BASE_MESSAGE_IOS_APP_STORE_URL);
    }
  };
  _goToAndroidMasterApp = async () => {
    try {
      const supported = await Linking.canOpenURL(BASE_MESSAGE_ANDROID_URL);
      if (!supported) {
        Linking.openURL(BASE_MESSAGE_GOOGLE_PLAY_URL);
      } else {
        Linking.openURL(BASE_MESSAGE_ANDROID_URL);
      }
    } catch (err) {
      Linking.openURL(BASE_MESSAGE_GOOGLE_PLAY_URL);
    }
  };
}

const AuthCheckServiceInstance = new AuthCheckService();
export { AuthCheckServiceInstance as AuthCheckService };
