import { createStandardAction } from "typesafe-actions";
import { AuthResultPayload } from "../../types";

export enum Type {
  RESET_STORE_DATA = "RESET_STORE_DATA",
  LOGGED_OUT = "auth/LOGGED_OUT",
  LOGGED_IN = "auth/LOGGED_IN",
  TOKEN_EXPIRED = "auth/TOKEN_EXPIRED"
}

export const resetStoreData = createStandardAction(Type.RESET_STORE_DATA)<
  undefined
>();

export const onBaseAccountLoggedOut = createStandardAction(Type.LOGGED_OUT)<
  undefined
>();

export const onBaseAccountLoggedIn = createStandardAction(Type.LOGGED_IN)<
  AuthResultPayload
>();

export const onAuthTokenExpired = createStandardAction(Type.TOKEN_EXPIRED)<
  undefined
>();
