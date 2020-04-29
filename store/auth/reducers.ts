import { AUTH_STAGES, AuthState } from "../../types";
import { createReducer } from "typesafe-actions";
import { Reducer } from "redux";
import {
  onAuthTokenExpired,
  onBaseAccountLoggedIn,
  onBaseAccountLoggedOut,
  resetStoreData
} from "./actions";
import { defaultAuthResult } from "../../services/AuthCheck";
const authInitialState: AuthState = {
  stage: AUTH_STAGES.INITIAL,
  method: undefined,
  ...defaultAuthResult,
  client_key: undefined,
  access_token: undefined
};

const authReducer: Reducer<AuthState> = createReducer(authInitialState)
  .handleAction(onBaseAccountLoggedIn, (state, action) => {
    const { result, method } = action.payload;
    return {
      ...state,
      stage: AUTH_STAGES.SIGNED,
      method,
      client_key: result.client_key,
      access_token: result.access_token,
      sys_url: result.sys_url,
      share_url: result.share_url,
      socket_url: result.socket_url,
      intercom_token: result.intercom_token,
      firebase_token: result.firebase_token,
      system: result.system
    };
  })
  .handleAction(onBaseAccountLoggedOut, (state, action) => {
    return {
      ...authInitialState,
      stage: AUTH_STAGES.UNSIGNED
    };
  })
  .handleAction(resetStoreData, (state, action) => {
    return {
      ...authInitialState
    };
  })
  .handleAction(onAuthTokenExpired, (state, action) => {
    return {
      ...authInitialState,
      stage: AUTH_STAGES.EXPIRED
    };
  });

export default authReducer;
