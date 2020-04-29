package vn.base.module.auth;

import android.content.Context;
import android.content.SharedPreferences;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class BaseAuthModule extends ReactContextBaseJavaModule {
    private int accessToken = 1;
    private final ReactApplicationContext context;

    public BaseAuthModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return "BaseAuth";
    }

    @ReactMethod
    public void getAccessToken(Promise promise) {
        try {
            SharedPreferences sharedPreferences = context.getSharedPreferences("base.wework", Context.MODE_PRIVATE);
            String accessToken = sharedPreferences.getString("access_token", "");
            String clientKey = sharedPreferences.getString("client_key", "");
            String sysUrl = sharedPreferences.getString("sys_url", "base.vn");
            String shareUrl = sharedPreferences.getString("share_url", "https://share-main.basecdn.net");
            String socketUrl = sharedPreferences.getString("socket_url", "wss://socket-00.basecdn.net:1310");
            String intercomToken = sharedPreferences.getString("intercom_token", "");
            String firebaseToken = sharedPreferences.getString("firebase_token", "");
            String systemSecure = sharedPreferences.getString("system_secure", "");
            WritableMap keyLogin = Arguments.createMap();
            keyLogin.putString("access_token", accessToken);
            keyLogin.putString("client_key", clientKey);
            keyLogin.putString("sys_url", sysUrl);
            keyLogin.putString("share_url", shareUrl);
            keyLogin.putString("socket_url", socketUrl);
            keyLogin.putString("intercom_token", intercomToken);
            keyLogin.putString("firebase_token", firebaseToken);
            keyLogin.putString("system", systemSecure);
            promise.resolve(keyLogin);
        } catch (Exception e) {
            promise.reject("Error", e.getMessage());

        }
    }
}
