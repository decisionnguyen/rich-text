import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Keyboard,
    StatusBar,
    TouchableWithoutFeedback,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
    TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';

import CNRichTextEditor, {
    CNToolbar,
    getDefaultStyles,
    getInitialObject,
} from './index';

import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
    MenuProvider,
    renderers, MenuOptionsCustomStyle,
} from 'react-native-popup-menu';

import {
    IC_COLOR_FILL,
    IC_COLOR_TEXT,
    IC_FORMAT_BOLD,
    IC_FORMAT_ITALIC,
    IC_FORMAT_PHOTO,
    IC_FORMAT_STRIKE,
    IC_FORMAT_UNDERLINE, IC_LIST_BULLET, IC_LIST_NUMBER,
} from './icons/icons';

const {SlideInMenu} = renderers;

const IS_IOS = Platform.OS === 'ios';
const {width, height} = Dimensions.get('window');
const defaultStyles = getDefaultStyles();
const defaultBackgroundColorBtn = 'aliceblue';
const defaultSelectedBackgroundColorBtn = 'deepskyblue';
const toolbarActionWidth = 28;

interface Props {
    value: string,
    onValueChanged?: (value: string) => void,
    placeHolder?: string,
    toolbarItem?: string[], // ['bold', 'italic', 'underline', 'lineThrough', 'h1', 'h2', 'ul', 'ol', 'image', 'color']
    onInsertImage?: (uri: string) => void,
    autoFocus?: boolean,

}

interface State {
    selectedTag: string,
    selectedColor: string,
    selectedHighlight: string,
    colors: string[],
    highlights: string[],
    selectedStyles: any[],
    value: string,
    placeholder: string,
    iconSet: any[]
}

const styleBtnAction = {
    width: 24,
    height: 24,
    marginHorizontal: 6,
};
const styleActionText = {
    fontSize: 20,
    width: toolbarActionWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginHorizontal: 4,
    fontWeight: 'bold',
    color: '#737373',
};

const initIconSet = {
    'bold': {
        type: 'tool',
        iconArray: [{
            toolTypeText: 'bold',
            buttonTypes: 'style',
            iconComponent: <Image source={IC_FORMAT_BOLD} style={styleBtnAction}/>,
        },
        ],
    },
    'italic': {
        type: 'tool',
        iconArray: [
            {
                toolTypeText: 'italic',
                buttonTypes: 'style',
                iconComponent: <Image source={IC_FORMAT_ITALIC} style={styleBtnAction}/>,
            },
        ],
    },
    'underline': {
        type: 'tool',
        iconArray: [
            {
                toolTypeText: 'underline',
                buttonTypes: 'style',
                iconComponent: <Image source={IC_FORMAT_UNDERLINE} style={styleBtnAction}/>,
            },
        ],
    },
    'lineThrough': {
        type: 'tool',
        iconArray: [
            {
                toolTypeText: 'lineThrough',
                buttonTypes: 'style',
                iconComponent: <Image source={IC_FORMAT_STRIKE} style={styleBtnAction}/>,
            },
        ],
    },
    'h1': {
        type: 'tool',
        iconArray: [
            {
                toolTypeText: 'title',
                buttonTypes: 'tag',
                iconComponent: <Text style={styleActionText}>H1</Text>,
            },
        ],
    },
    'h2': {
        type: 'tool',
        iconArray: [
            {
                toolTypeText: 'heading',
                buttonTypes: 'tag',
                iconComponent: <Text style={styleActionText}>H2</Text>,
            },
        ],
    },
    'ul': {
        type: 'tool',
        iconArray: [
            {
                toolTypeText: 'ul',
                buttonTypes: 'tag',
                iconComponent: <Image source={IC_LIST_BULLET} style={styleBtnAction}/>,
            },
        ],
    },
    'ol': {
        type: 'tool',
        iconArray: [
            {
                toolTypeText: 'ol',
                buttonTypes: 'tag',
                iconComponent: <Image source={IC_LIST_NUMBER} style={styleBtnAction}/>,
            },
        ],
    }
};

class WrapRichText extends Component<Props, State> {
    private readonly customStyles: any;
    private editor: null;

    constructor(props) {
        super(props);
        this.customStyles = {
            ...defaultStyles,
            body: {fontSize: 14},
            heading: {fontSize: 16},
            title: {fontSize: 20},
            ol: {fontSize: 14},
            ul: {fontSize: 14},
            bold: {fontSize: 14, fontWeight: 'bold', color: ''},
        };
        this.state = {
            selectedTag: 'body',
            selectedColor: 'default',
            selectedHighlight: 'default',
            colors: ['red', 'green', 'blue', 'black'],
            highlights: ['yellow_hl', 'pink_hl', 'orange_hl', 'green_hl', 'purple_hl', 'blue_hl'],
            selectedStyles: [],
            value: "",
            placeholder: "",
            iconSet: []
        };

        this.editor = null;

    }

    UNSAFE_componentWillMount = () => {
        let {value, placeHolder, toolbarItem} = this.props;

        if (!toolbarItem) {
            toolbarItem = []
        }

        let listIconSet = [];
        for (let i = 0; i < toolbarItem.length; i++) {
            const _iconName = toolbarItem[i];
            const _iconSet = initIconSet[_iconName];
            if (_iconSet) {
                listIconSet = listIconSet.concat(_iconSet)
            }
        }

        this.setState({
            value,
            placeHolder,
            iconSet: listIconSet
        })
    };

    componentDidMount = () => {
        if (this.props.autoFocus) {
            this.editor && this.editor.focus()
        }
        Keyboard.addListener('keyboardWillShow', this.onKeyboardShowHide);
        Keyboard.addListener('keyboardWillHide', this.onKeyboardShowHide);
        StatusBar.setBarStyle('dark-content');
    };

    componentWillUnmount() {
        Keyboard.removeListener('keyboardWillShow', this.onKeyboardShowHide);
        Keyboard.removeListener('keyboardWillHide', this.onKeyboardShowHide);
        StatusBar.setBarStyle('dark-content');
    }

    onKeyboardShowHide = () => {
        setTimeout(() => {
            StatusBar.setBarStyle('dark-content');
        }, 100)
    };


    onStyleKeyPress = (toolType) => {

        if (toolType == 'image') {
            return;
        } else {
            this.editor && this.editor.applyToolbar(toolType);
        }

    };

    onSelectedTagChanged = (tag: string) => {
        this.setState({
            selectedTag: tag,
        });
    };

    onSelectedStyleChanged = (styles: any) => {
        const colors = this.state.colors;
        const highlights = this.state.highlights;
        let sel = styles.filter(x => colors.indexOf(x) >= 0);

        let hl = styles.filter(x => highlights.indexOf(x) >= 0);
        this.setState({
            selectedStyles: styles,
            selectedColor: (sel.length > 0) ? sel[sel.length - 1] : 'default',
            selectedHighlight: (hl.length > 0) ? hl[hl.length - 1] : 'default',
        });

    };

    onValueChanged = (value: string) => {
        this.setState({
            value: value,
        });
        this.props.onValueChanged && this.props.onValueChanged(value)
    };

    insertImage(url: string) {
        this.editor && this.editor.insertImage(url);
    }

    useLibraryHandler = async () => {
        let options = {};
        ImagePicker.showImagePicker(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                if (this.props.onInsertImage) {
                    new Promise(this.props.onInsertImage(response.uri)).then((url: string) => {
                        this.insertImage(url);
                    })
                }
            }
        });
    };

    onColorSelectorClicked = (value) => {

        if (value === 'default') {
            this.editor.applyToolbar(this.state.selectedColor);
        } else {
            this.editor.applyToolbar(value);

        }

        this.setState({
            selectedColor: value,
        });
    };

    onHighlightSelectorClicked = (value: string) => {
        if (value === 'default') {
            this.editor && this.editor.applyToolbar(this.state.selectedHighlight);
        } else {
            this.editor && this.editor.applyToolbar(value);

        }
        this.setState({
            selectedHighlight: value,
        });
    };

    onRemoveImage = (value: any) => {
        const {url, id} = value;
        // do what you have to do after removing an image
        console.log(`image removed (url : ${url})`);
    };

    getOtherTool = (icons = []) => {
        let _result = {
            type: 'tool',
            iconArray: [],
        };
        let hasData = false;
        if (icons.indexOf('image') > -1) {
            _result.iconArray = [{
                toolTypeText: 'image',
                iconComponent: this.renderImageSelector(),
            }];
            hasData = true
        }
        if (icons.indexOf('color') > -1) {
            _result.iconArray = [
                ..._result.iconArray,
                {
                    toolTypeText: 'color',
                    iconComponent: this.renderColorSelector(),
                },
                {
                    toolTypeText: 'highlight',
                    iconComponent: this.renderHighlight(),
                }];
            hasData = true
        }
        if (!hasData) {
            return null
        }
        return _result
    };

    renderImageSelector() {
        return (
            <TouchableOpacity onPress={this.useLibraryHandler}>
                <Image
                    source={IC_FORMAT_PHOTO}
                    style={styleBtnAction}/>
            </TouchableOpacity>
        )
    }

    renderColorMenuOptions = () => {
        let lst = [];

        if (defaultStyles[this.state.selectedColor]) {
            lst = this.state.colors.filter((_color: string) => _color !== this.state.selectedColor);
            lst.push('default');
            lst.push(this.state.selectedColor);
        } else {
            lst = this.state.colors.filter((_color: string) => true);
            lst.push('default');
        }

        return (
            lst.map((item: any) => {
                let color = defaultStyles[item] ? defaultStyles[item].color : 'black';
                return (
                    <MenuOption value={item} key={item}>
                        <Image source={IC_COLOR_TEXT} style={[styles.btnAction, {tintColor: color}]}/>
                    </MenuOption>
                );
            })

        );
    };

    renderHighlightMenuOptions = () => {
        let lst = [];

        if (defaultStyles[this.state.selectedHighlight]) {
            lst = this.state.highlights.filter((_color: any) => _color !== this.state.selectedHighlight);
            lst.push('default');
            lst.push(this.state.selectedHighlight);
        } else {
            lst = this.state.highlights.filter((_color: any) => true);
            lst.push('default');
        }

        return (
            lst.map((item: any) => {
                let bgColor = defaultStyles[item] ? defaultStyles[item].backgroundColor : 'black';
                return (
                    <MenuOption value={item} key={item}>
                        <Image source={IC_COLOR_FILL} style={[styles.btnAction, {tintColor: bgColor}]}/>
                    </MenuOption>
                );
            })

        );
    };

    renderColorSelector() {

        let selectedColor = '#333333';
        if (defaultStyles[this.state.selectedColor]) {
            selectedColor = defaultStyles[this.state.selectedColor].color;
        }
        return (
            <Menu renderer={SlideInMenu} onSelect={this.onColorSelectorClicked}>
                <MenuTrigger>
                    <Image source={IC_COLOR_TEXT} style={[styleBtnAction, {tintColor: selectedColor}]}/>
                </MenuTrigger>
                <MenuOptions customStyles={optionsStyles}>
                    {this.renderColorMenuOptions()}
                </MenuOptions>
            </Menu>
        );
    }

    renderHighlight() {
        let selectedColor = '#333333';
        if (defaultStyles && defaultStyles[this.state.selectedHighlight]) {
            selectedColor = defaultStyles[this.state.selectedHighlight].backgroundColor || '#333333';
        }
        return (
            <Menu renderer={SlideInMenu} onSelect={this.onHighlightSelectorClicked}>
                <MenuTrigger>
                    <Image source={IC_COLOR_FILL}
                           style={[styleBtnAction, {tintColor: selectedColor}]}/>
                </MenuTrigger>
                <MenuOptions customStyles={highlightOptionsStyles}>
                    {this.renderHighlightMenuOptions()}
                </MenuOptions>
            </Menu>
        );
    }

    render() {
        const _result = this.getOtherTool(this.props.toolbarItem || []);

        let newIconSet = [
            ...this.state.iconSet,
            _result ? _result : null
        ];
        return (
            <KeyboardAvoidingView
                enabled
                style={styles.root}
                behavior={'padding'}
            >
                <MenuProvider style={styles.container}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.main}>
                            <CNRichTextEditor
                                ref={input => this.editor = input}
                                onSelectedTagChanged={this.onSelectedTagChanged}
                                onSelectedStyleChanged={this.onSelectedStyleChanged}
                                initialHtml={this.state.value}
                                style={styles.editor}
                                styleList={this.customStyles}
                                onValueChanged={this.onValueChanged}
                                onRemoveImage={this.onRemoveImage}
                                placeholder={this.state.placeHolder}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                    {
                        this.state.iconSet.length
                            ? <View style={styles.toolbarContainer}>
                                <CNToolbar
                                    style={styles.toolbarStyle}
                                    iconSetContainerStyle={styles.iconSetContainerStyle}
                                    size={28}
                                    iconSet={newIconSet}
                                    selectedTag={this.state.selectedTag}
                                    selectedStyles={this.state.selectedStyles}
                                    onStyleKeyPress={this.onStyleKeyPress}
                                    backgroundColor="aliceblue" // optional (will override default backgroundColor)
                                    color="#333333" // optional (will override default color)
                                    selectedColor='white' // optional (will override default selectedColor)
                                    selectedBackgroundColor='deepskyblue' // optional (will override default selectedBackgroundColor)
                                />
                            </View>
                            : null
                    }
                </MenuProvider>
            </KeyboardAvoidingView>
        );
    }

}

var styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    toolbarStyle: {
        height: 40,
    },
    iconSetContainerStyle: {
        flexGrow: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    main: {
        flex: 1,
        paddingBottom: 1,
        alignItems: 'stretch',
        backgroundColor: '#fff',
        paddingHorizontal: 20

    },
    editor: {},
    toolbarContainer: {
        minHeight: 40,
    },
    menuOptionText: {
        textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 5,
    },
    divider: {
        marginVertical: 0,
        marginHorizontal: 0,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
});

const optionsStyles = {
    optionsContainer: {
        padding: 0,
        width: 40,
        marginLeft: width - 40 - 30,
        alignItems: 'flex-end',
    },
    optionsWrapper: {
        //width: 40,
        backgroundColor: 'white',
    },
    optionWrapper: {
        //backgroundColor: 'yellow',
        margin: 2,
    },
    optionTouchable: {
        underlayColor: 'gold',
        activeOpacity: 70,
    },
    // optionText: {
    //   color: 'brown',
    // },
};

const highlightOptionsStyles: MenuOptionsCustomStyle = {
    optionsContainer: {
        backgroundColor: 'transparent',
        padding: 0,
        width: 40,
        marginLeft: width - 40,

        alignItems: 'flex-end',
    },
    optionsWrapper: {
        //width: 40,
        backgroundColor: 'white',
    },
    optionWrapper: {
        //backgroundColor: 'yellow',
        margin: 2,
    },
    optionTouchable: {
        underlayColor: 'gold',
        activeOpacity: 70,
    },
// optionText: {
//   color: 'brown',
// },
};

export default WrapRichText;
