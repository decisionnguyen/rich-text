import React, {memo, useCallback, useState} from 'react';
import {StyleSheet, Text, TextInput, View, Platform} from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import WebViewBaseJS from "./WebViewBaseJSContainer";
import {WebviewBaseJSEvents} from "./models";


interface Props {
    content: string,
    showToolBar: boolean,
    onFocus?: () => void,
    onBlur?: () => void,
    onContentChange: (value: string) => void
}

interface StateInterface {
    html: '',
    text: '',
}


const RichTextEditor = memo((props: Props) => {
    const {onFocus, onBlur, content, showToolBar, onContentChange} = props;

    const onLoadEnd = useCallback(() => {

    }, []);

    const onLoadStart = useCallback(() => {

    }, []);


    const onMessageReceived = useCallback((message: { msg: string, payload: any }) => {
        const {msg, payload} = message;
        switch (msg) {
            case WebviewBaseJSEvents.ON_CHANGE:
                if (payload?.html) {
                    onContentChange(payload.html)
                }
                break;
            case WebviewBaseJSEvents.ON_BLUR:
                onBlur && onBlur();
                break;
            case WebviewBaseJSEvents.ON_FOCUS:
                onFocus && onFocus();
                break;
            default:
                break;

        }
    }, [onContentChange, onFocus, onBlur]);

    return (
        <View style={styles.container}>
            <WebViewBaseJS
                content={content}
                showToolBar={showToolBar}
                isReadOnly={false}
                onLoadStart={onLoadStart}
                onLoadEnd={onLoadEnd}
                onMessageReceived={onMessageReceived}
            />
            {/*{Platform.OS === 'ios' && <KeyboardSpacer/>}*/}
        </View>
    );
});

export default RichTextEditor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
    },
    richText: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderStyle: 'solid',
    },
    ouputs: {
        backgroundColor: '#f5f5f5',
        color: '#000000',
        height: 100,
        width: '100%',
        borderTopWidth: 1,
        borderColor: '#C8C8C8',
    },
});
