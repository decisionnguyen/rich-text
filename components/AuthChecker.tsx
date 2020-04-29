import React from "react";
import { AppStateStatus, AppState, Platform } from "react-native";
import { AuthCheckService, AuthResult } from "../services/AuthCheck";
import { LoginMethod, LoginMethodEnum } from "../types";

const DEFAULT_DELAY_BACK_TO_FOREGROUND_IN_MS =
  Platform.OS === "ios" ? 100 : 300;

interface OwnProps {
  accessToken: string | null | undefined;
  clientKey: string | null | undefined;
  sysUrl: string | null | undefined;
  method: LoginMethod;
  loggedIn: boolean;
  onGuest: () => void;
  onLogout: () => void;
  onLoggedIn: (auth: AuthResult) => void;
  onLoggedInAnotherAccount: (auth: AuthResult) => void;
  onStartCheck: () => void;
}

type Props = OwnProps;

type State = Readonly<{
  appState: AppStateStatus;
}>;

export class AuthChecker extends React.PureComponent<Props, State> {
  timeout;
  readonly state: State = {
    appState: AppState.currentState
  };

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  startCheckFromOutside = () => {
    this.props.onStartCheck();
    this._startCheck();
  };

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      this._startCheckTimer();
    } else {
      this._clearCheckTimer();
    }
    this.setState({ appState: nextAppState });
  };

  _startCheckTimer = () => {
    this.props.onStartCheck();
    this._clearCheckTimer();
    this.timeout = setTimeout(() => {
      this._startCheck();
    }, DEFAULT_DELAY_BACK_TO_FOREGROUND_IN_MS);
  };

  _clearCheckTimer = () => {
    if (!!this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  };

  _startCheck = async () => {
    const baseAuth: false | AuthResult = await AuthCheckService.getAuth();
    let installed = false;
    if (Platform.OS === "ios") {
      installed = await AuthCheckService.canOpenIosApp();
      if (!installed) return;
      if (
        this.props.loggedIn &&
        this.props.method === LoginMethodEnum.MANUALLY &&
        !baseAuth
      )
        return;
    }
    if (!baseAuth) {
      if (!this.props.loggedIn) {
        this.props.onGuest();
      } else {
        this.props.onLogout();
      }
    } else {
      if (!this.props.loggedIn) {
        this.props.onLoggedIn(baseAuth);
      } else {
        if (
          baseAuth.access_token !== this.props.accessToken ||
          baseAuth.client_key !== this.props.clientKey ||
          baseAuth.sys_url !== this.props.sysUrl
        ) {
          this.props.onLoggedInAnotherAccount(baseAuth);
        }
      }
    }
  };

  render() {
    return null;
  }
}
