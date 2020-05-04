import React from 'react';
import {StyleSheet, NativeSyntheticEvent, Platform, View, StatusBar} from 'react-native';
import {WebView} from 'react-native-webview';
import {WebViewError} from 'react-native-webview/lib/WebViewTypes';

const IOS_PATH = require('./index.html');
const ANDROID_PATH = 'file:///android_asset/index.html';

export interface Props {
    handleMessage: (data: string) => void;
    onError: (syntheticEvent: NativeSyntheticEvent<WebViewError>) => void;
    onLoadEnd: () => void;
    onLoadStart: () => void;
    setWebViewRef: (ref: WebView) => void;
}

class WebViewQuillJSView extends React.Component<Props> {
    componentWillUnmount() {
        StatusBar.setBarStyle('dark-content');
      }

    render() {
        const {
            handleMessage,
            onError,
            onLoadEnd,
            onLoadStart,
            setWebViewRef,
        } = this.props;

        return (
            <View style={styles.container}>
                <WebView
                    ref={component => {
                        setWebViewRef(component);
                    }}
                    containerStyle={styles.containerStyle}
                    onLoadEnd={onLoadEnd}
                    onLoadStart={onLoadStart}
                    onMessage={event => {
                        if (
                            event &&
                            event.nativeEvent &&
                            event.nativeEvent.data
                        ) {
                            handleMessage(event.nativeEvent.data);
                        }
                    }}
                    onError={onError}
                    source={
                        Platform.OS === 'ios' ? IOS_PATH : {uri: ANDROID_PATH}
                    }
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowFileAccess={true}
                    allowUniversalAccessFromFileURLs={true}
                    allowFileAccessFromFileURLs={true}
                    scrollEnabled={false}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    containerStyle: {
        flex: 0,
        height: '100%',
        width: '100%',
    },
});

export default WebViewQuillJSView;
