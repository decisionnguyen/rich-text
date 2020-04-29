import React, { memo, useRef, useCallback } from "react";
import { AuthChecker } from "./AuthChecker";
import { AuthResult, defaultAuthResult } from "../services/AuthCheck";
import AuthService from "../services/Auth";
import {
  AUTH_STAGES,
  AUTH_EVENTS,
  LoginMethod,
  LoginMethodEnum
} from "../types";
import { Platform } from "react-native";
import {
  useResetStoreData,
  useAuth,
  useLoggedIn,
  useLoggedOut,
  useInstalled
} from "../hooks";
import useMount from "react-use/lib/useMount";
import Core from "@base/core/services/Core";

interface Props {
  onEvent: (event: AUTH_EVENTS, authResult?: AuthResult) => void;
}

const AuthCheckerContainer = memo(({ onEvent }: Props) => {
  const { stage, access_token, client_key, method, sys_url } = useAuth();
  const checkerRef = useRef<AuthChecker>(null);
  const resetStoreData = useResetStoreData();
  const useLoggedInCb = useLoggedIn();
  const useLoggedOutCb = useLoggedOut();
  const useInstalledCb = useInstalled();

  const startCheck = useCallback(() => {
    if (!!checkerRef.current) checkerRef.current.startCheckFromOutside();
  }, [checkerRef]);

  const onLoggedIn = useCallback(
    async (auth: AuthResult, method?: LoginMethod) => {
      await AuthService.saveAuthResult(auth);
      onEvent(AUTH_EVENTS.LOGGED_IN, auth);
      useLoggedInCb(auth, method);
    },
    [onEvent, useLoggedInCb]
  );

  useMount(async () => {
    if (Platform.OS === "ios") {
      const installed = await useInstalledCb();
      if (!installed) {
        await AuthService.init();
        const authParams = AuthService.getAuthParams();
        const { access_token, client_key } = authParams;
        if (AuthService.isValidParams(authParams)) {
          onLoggedIn(
            {
              ...defaultAuthResult,
              access_token,
              client_key,
              intercom_token: Core.intercomToken,
              system: Core.systemName
            },
            LoginMethodEnum.MANUALLY
          );
          return;
        }
        await AuthService.clearKeys();
        useLoggedOutCb();
        return;
      }
    }
    await AuthService.clearKeys();
    resetStoreData();
    startCheck();
  });

  const onLogout = useCallback(async () => {
    if (Platform.OS === "ios") {
      const installed = await useInstalledCb();
      if (!installed) {
        return;
      }
    }
    await AuthService.clearKeys();
    resetStoreData();
    useLoggedOutCb();
    onEvent(AUTH_EVENTS.LOGGED_OUT);
  }, [onEvent, useLoggedOutCb]);

  const onGuest = useCallback(async () => {
    await AuthService.clearKeys();
    useLoggedOutCb();
  }, [useLoggedOutCb, onLoggedIn]);

  const onLoggedInAnotherAccount = useCallback(
    async (auth: AuthResult) => {
      await AuthService.clearKeys();
      resetStoreData();
      await AuthService.saveAuthResult(auth);
      onEvent(AUTH_EVENTS.LOGGED_IN_OTHER, auth);
      useLoggedInCb(auth, LoginMethodEnum.AUTO);
    },
    [onEvent, useLoggedInCb, resetStoreData]
  );

  const onStartCheck = useCallback(() => {
    onEvent(AUTH_EVENTS.START_CHECK);
  }, [onEvent]);

  return (
    <AuthChecker
      ref={checkerRef}
      method={method}
      loggedIn={stage === AUTH_STAGES.SIGNED}
      accessToken={access_token}
      clientKey={client_key}
      sysUrl={sys_url}
      onGuest={onGuest}
      onLogout={onLogout}
      onLoggedIn={onLoggedIn}
      onLoggedInAnotherAccount={onLoggedInAnotherAccount}
      onStartCheck={onStartCheck}
    />
  );
});

AuthCheckerContainer.displayName = "AuthCheckerContainer";

export default AuthCheckerContainer;
