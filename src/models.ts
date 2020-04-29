import * as Quill from 'quill';

export interface WebViewBaseJSProps {
    content?: Quill.Delta | string | object | null;
    defaultContent?: Quill.Delta | string | object;
    isReadOnly?: boolean;
    isCreate?: boolean;
    onError?: (syntheticEvent: any) => void;
    onLoadEnd?: () => void;
    onLoadStart?: () => void;
    onMessageReceived?: (message: any) => void;
}

export enum WebviewBaseJSEvents {
    BASEJS_COMPONENT_MOUNTED = 'BASEJS_COMPONENT_MOUNTED',
    BASEJS_IMAGE_HANDLE = 'BASEJS_IMAGE_HANDLE',
    DOCUMENT_EVENT_LISTENER_ADDED = 'DOCUMENT_EVENT_LISTENER_ADDED',
    WINDOW_EVENT_LISTENER_ADDED = 'WINDOW_EVENT_LISTENER_ADDED',
    UNABLE_TO_ADD_EVENT_LISTENER = 'UNABLE_TO_ADD_EVENT_LISTENER',
    DOCUMENT_EVENT_LISTENER_REMOVED = 'DOCUMENT_EVENT_LISTENER_REMOVED',
    WINDOW_EVENT_LISTENER_REMOVED = 'WINDOW_EVENT_LISTENER_REMOVED',
    ON_CHANGE = 'ON_CHANGE',
    ON_CHANGE_SELECTION = 'ON_CHANGE_SELECTION',
    ON_FOCUS = 'ON_FOCUS',
    ON_BLUR = 'ON_BLUR',
    ON_KEY_PRESS = 'ON_KEY_PRESS',
    ON_KEY_DOWN = 'ON_KEY_DOWN',
    ON_KEY_UP = 'ON_KEY_UP',
}

export type WebviewBaseJSMessage = {
    event?: WebviewBaseJSEvents;
    msg?: string;
    error?: string;
    payload?: any;
};

export type StartupMessage = {
    content?: Quill.Delta | string | object;
    defaultContent?: Quill.Delta | string | object;
    isReadOnly?: boolean;
};
