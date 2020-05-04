import React from 'react';
import {WebView} from 'react-native-webview';
import ImagePicker from 'react-native-image-picker';
import WebViewBaseJSComponent from './WebViewBaseJSComponent';
import ActivityOverlay from './ActivityOverlay';
import {
    WebviewBaseJSMessage,
    WebviewBaseJSEvents,
    StartupMessage,
    WebViewBaseJSProps,
} from './models';
import _ from 'lodash';

interface State {
    uploadImage: boolean;
    isLoading: boolean;
}

class WebViewBaseJS extends React.PureComponent<WebViewBaseJSProps, State> {
    private webViewRef: any;
    static defaultProps = {
        content: null,
        showToolBar: false,
        defaultContent: null,
        isReadOnly: false,
        onLoadEnd: () => {
        },
        onLoadStart: () => {
        },
    };

    constructor(props: any) {
        super(props);
        this.state = {
            uploadImage: false,
            isLoading: true,
        };
        this.webViewRef = null;
    }

    componentDidMount() {
        const {content, defaultContent} = this.props;
        if (content) {
            this.sendMessage({content});
        }
        if (defaultContent) {
            this.sendMessage({defaultContent});
        }
    }

    componentDidUpdate(prevProps: WebViewBaseJSProps) {
        const {content, defaultContent, isReadOnly, showToolBar} = this.props;
        if (content !== prevProps.content) {
            this.sendMessage({content});
            this.receivedContent = content;
        }
        if (showToolBar !== prevProps.showToolBar) {
            this.sendMessage({showToolBar, content})
        }
        if (defaultContent !== prevProps.defaultContent) {
            this.sendMessage({defaultContent});
            this.receivedContent = defaultContent;
        }
        if (isReadOnly !== prevProps.isReadOnly) {
            this.sendMessage({
                isReadOnly,
            });
        }
    }

    private uploadImageToBaseCDN = (range, content) => {
        this.setState({uploadImage: true});
        fetch('https://reactnative.dev/movies.json')
            .then((response) => {
                this.sendMessage({
                    type: 'INSERT_IMAGE',
                    range,
                    content,
                    imageUrl: 'https://octodex.github.com/images/labtocat.png',
                });
            })
            .catch((error) => console.error(error))
            .finally(() => {
                this.setState({uploadImage: false});
            });
    };

    // Handle messages received from webview contents
    private handleMessage = (data: string) => {
        const {onMessageReceived} = this.props;
        if (onMessageReceived) {
            let message: WebviewBaseJSMessage = JSON.parse(data);
            if (message.msg === WebviewBaseJSEvents.BASEJS_COMPONENT_MOUNTED) {
                this.sendStartupMessage();
            }
            if (message.msg === WebviewBaseJSEvents.BASEJS_IMAGE_HANDLE) {
                const range = message.payload?.range;
                const content = message.payload?.content;
                const options = {
                    title: 'Select Image',
                    customButtons: [],
                    storageOptions: {
                        skipBackup: true,
                        path: 'images',
                    },
                };
                ImagePicker.showImagePicker(options, (response) => {
                    if (response.didCancel) {
                        console.log('User cancelled image picker');
                    } else if (response.error) {
                        console.log('ImagePicker Error: ', response.error);
                    } else {
                        this.uploadImageToBaseCDN(range, content);
                    }
                });
            }
            if (message.msg === WebviewBaseJSEvents.ON_CHANGE) {
                this.receivedContent = message.payload.delta;
            }
            onMessageReceived(message);
        }
    };

    // Send message to webview
    private sendMessage = _.debounce((payload: object) => {
        this.webViewRef.injectJavaScript(
            `window.postMessage(${JSON.stringify(payload)}, '*');`,
        );
    }, 500);

    // Send a startup message with initalizing values to the map
    private sendStartupMessage = () => {
        const {
            content,
            defaultContent,
            isReadOnly
        } = this.props;
        const startupMessage: StartupMessage = {
            content,
            defaultContent,
            isReadOnly
        };
        this.webViewRef.injectJavaScript(
            `window.postMessage(${JSON.stringify(startupMessage)}, '*');`,
        );
    };

    private onError = (syntheticEvent: any) => {
        this.props.onError && this.props.onError(syntheticEvent);
    };

    private onLoadEnd = () => {
        this.setState({isLoading: false});
        this.props.onLoadEnd && this.props.onLoadEnd();
        if (this.props.isCreate) {
            this.sendMessage({
                type: 'CREATE_NEW_NOTE',
            });
        }
    };

    private onLoadStart = () => {
        this.setState({isLoading: true});
        this.props.onLoadStart && this.props.onLoadStart();
    };

    // Output rendered item to screen
    render() {
        const {uploadImage, isLoading} = this.state;
        const {isLoadingNote, isReadOnly} = this.props;
        return (
            <>
                <WebViewBaseJSComponent
                    handleMessage={this.handleMessage}
                    onError={this.onError}
                    onLoadEnd={this.onLoadEnd}
                    onLoadStart={this.onLoadStart}
                    setWebViewRef={(ref: WebView) => {
                        this.webViewRef = ref;
                    }}
                    isLoadingNote={isLoadingNote}
                />
                {isLoading && <ActivityOverlay/>}
                {isLoadingNote && <ActivityOverlay/>}
                {uploadImage && <ActivityOverlay/>}
            </>
        );
    }
}

export default WebViewBaseJS;
