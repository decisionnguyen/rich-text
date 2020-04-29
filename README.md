# base-auth

## Installation
#### Base core
`$ npm install --save git+https://gitlab.base.vn/base-rn/base-core.git` 

or 

`$ yarn add git+https://gitlab.base.vn/base-rn/base-core.git`

#### Base auth
`$ npm install --save git+https://gitlab.base.vn/base-rn/base-auth.git` 

or 

`$ yarn add git+https://gitlab.base.vn/base-rn/base-auth.git`
`$ cd ios && pod install`


### If you are using redux
import authReducers from '@base/auth/store/rootReducers';


const reducers = combineReducers({
    ...authReducers,
    // your reducers here
});


### Integrate with existing RN app

#### iOS
1. Select your project on the left navigation of Xcode
2. Go to `Capabilities`
3. Enable `Keychain Sharing`
4. Add `share.access.token` keychain group
5. Go to General, select `$PROJECT_NAME` target and make sure `Signing` - `Team` is `Base Enterprise Company Limited`
6. Edit `info.plist` as below
```xml
    ...
    <key>LSApplicationQueriesSchemes</key>
	<array>
		<string>baseShareUrlScheme</string>
	</array>
    ...
```

#### Android
path: `Project/android/app/src/main/java/com/meetup/MainActivity.java`

```java
package $YOUR_APP_PACKAGE_NAME;

+import android.os.Bundle;
import com.facebook.react.ReactActivity;

+import android.content.SharedPreferences;
+import android.database.Cursor;
+import android.net.Uri;

+import android.app.LoaderManager;
+import android.content.CursorLoader;
+import android.content.Loader;

//Implement LoaderManager.LoaderCallbacks<Cursor>
public class MainActivity extends ReactActivity implements LoaderManager.LoaderCallbacks<Cursor> {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ModuleBuilder";
    }

	//Add this
    @Override
    protected void onResume() {
        super.onResume();
        getLoaderManager().initLoader(1, null,this);
    }

	//Add this
    @Override
    public Loader<Cursor> onCreateLoader(int id, Bundle args) {
        CursorLoader cursorLoader = new CursorLoader(this, Uri.parse("content://vn.base.message/cte"), null, null, null, null);

        return cursorLoader;
    }

	//Add this
    @Override
    public void onLoadFinished(Loader<Cursor> loader, Cursor cursor) {
        if (cursor != null) {
            cursor.moveToFirst();
            String key = "";
            final SharedPreferences prefs = this.getSharedPreferences("base.wework", MODE_PRIVATE);
            prefs.edit().remove("access_token").apply();
            prefs.edit().remove("client_key").apply();
            prefs.edit().remove("sys_url").apply();
            prefs.edit().remove("share_url").apply();
            prefs.edit().remove("socket_url").apply();
            while (!cursor.isAfterLast()) {
                key = cursor.getString(cursor.getColumnIndex("key"));
                if ("client_key".equals(key)) {
                    prefs.edit().putString("client_key", cursor.getString(cursor.getColumnIndex("value"))).apply();
                }
                if ("access_token".equals(key)) {
                    prefs.edit().putString("access_token", cursor.getString(cursor.getColumnIndex("value"))).apply();
                }
                if ("sys_url".equals(key)) {
                    prefs.edit().putString("sys_url", cursor.getString(cursor.getColumnIndex("value"))).apply();
                }
                if ("share_url".equals(key)) {
                    prefs.edit().putString("share_url", cursor.getString(cursor.getColumnIndex("value"))).apply();
                }
                if ("socket_url".equals(key)) {
                    prefs.edit().putString("socket_url", cursor.getString(cursor.getColumnIndex("value"))).apply();
                }
                cursor.moveToNext();
            }
            getLoaderManager().destroyLoader(1);
        }
    }
		
	//Add this
    @Override
    public void onLoaderReset(Loader<Cursor> loader) {

    }
}
```


## Usage

1. Create `AuthCheckerWrapper` component like example below
```javascript
import React, { memo, useCallback } from 'react';
import AuthCheckerContainer from '@base/auth/components/AuthCheckerContainer';
import { AUTH_EVENTS } from '@base/auth/types';
import { AuthResult } from '@base/auth/services/AuthCheck';

interface Props {}

export const AuthCheckerWrapper = memo((props: Props) => {
  const onEvent = useCallback((event: AUTH_EVENTS, authResult?: AuthResult) => {
    if (event === AUTH_EVENTS.LOGGED_OUT) {
		//TODO: alert logged out
    } else if (event === AUTH_EVENTS.LOGGED_IN_OTHER) {
		//TODO: alert logged in another account
    } else if (event === AUTH_EVENTS.LOGGED_IN) {
		//TODO: alert logged in
    }
  }, []);
  return <AuthCheckerContainer onEvent={onEvent} />;
});
```

2. Add `AuthCheckerWrapper` to your `App.tsx`

```javascript
import React, { FunctionComponent } from 'react';

interface OwnProps {}

type Props = OwnProps;

export const App: FunctionComponent<Props> = (props) => {
  return (
		<>
			...
			<AuthCheckerWrapper />
			...
		</>
  )
};
```

3. If you are using redux in your RN project and inject base auth like example below:
    
```javascript
const rootReducer = combineReducers({
  ...coreReducers,
  ...authReducers,
  otherReducers,
});

export default rootReducer;
```
Now, when base auth detect logout event from Base Message. It will dispatch `RESET_STORE_DATA` action.
So if you want reset your root reducer state to initial state (before loggend in),
Make a change as example below:

```javascript
const appReducer = combineReducers({
  ...coreReducers,
  ...authReducers,
  otherReducers,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_STORE_DATA') {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
```
