import React, {Component} from 'react';
import {
    View, StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    Text,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
    TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';

import CNEditor,  {
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

class WrapRichText extends Component {
    private readonly customStyles: any;
    private state: any;
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
            value: ""
        };

        this.editor = null;

    }

    componentDidMount() {
        if (this.props.value) {
            this.setState({
                value: this.props.value
            })
        }
    }
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
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                this.insertImage(response.uri);
            }
        });
    };

    useCameraHandler = async () => {
        ImagePicker.launchCamera({}, (response) => {
            this.insertImage(response.uri);
        });
    };

    onImageSelectorClicked = (value) => {
        if (value == 1) {
            this.useCameraHandler();
        } else if (value == 2) {
            this.useLibraryHandler();
        }

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

    renderImageSelector() {
        return (
            <Menu renderer={SlideInMenu} onSelect={this.onImageSelectorClicked}>
                <MenuTrigger>
                    <View>
                        <Image
                            source={IC_FORMAT_PHOTO}
                            style={{
                                width: 28,
                                height: 28,
                                tintColor: '#737373',
                            }}/>
                    </View>
                </MenuTrigger>
                <MenuOptions>
                    <MenuOption value={1}>
                        <Text style={styles.menuOptionText}>
                            Take Photo
                        </Text>
                    </MenuOption>
                    <View style={styles.divider}/>
                    <MenuOption value={2}>
                        <Text style={styles.menuOptionText}>
                            Photo Library
                        </Text>
                    </MenuOption>
                    <View style={styles.divider}/>
                    <MenuOption value={3}>
                        <Text style={styles.menuOptionText}>
                            Cancel
                        </Text>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        );

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

        let selectedColor = '#737373';
        if (defaultStyles[this.state.selectedColor]) {
            selectedColor = defaultStyles[this.state.selectedColor].color;
        }
        return (
            <Menu renderer={SlideInMenu} onSelect={this.onColorSelectorClicked}>
                <MenuTrigger>
                    <Image source={IC_COLOR_TEXT} style={[styles.btnAction, {tintColor: selectedColor}]}/>
                </MenuTrigger>
                <MenuOptions customStyles={optionsStyles}>
                    {this.renderColorMenuOptions()}
                </MenuOptions>
            </Menu>
        );
    }

    renderHighlight() {
        let selectedColor = '#737373';
        if (defaultStyles && defaultStyles[this.state.selectedHighlight]) {
            selectedColor = defaultStyles[this.state.selectedHighlight].backgroundColor || '#737373';
        }
        return (
            <Menu renderer={SlideInMenu} onSelect={this.onHighlightSelectorClicked}>
                <MenuTrigger>
                    <Image source={IC_COLOR_FILL}
                           style={[styles.btnAction, {tintColor: selectedColor}]}/>
                </MenuTrigger>
                <MenuOptions customStyles={highlightOptionsStyles}>
                    {this.renderHighlightMenuOptions()}
                </MenuOptions>
            </Menu>
        );
    }

    render() {
        const iconSet = [
            {
                type: 'tool',
                iconArray: [{
                    toolTypeText: 'bold',
                    buttonTypes: 'style',
                    iconComponent: <Image source={IC_FORMAT_BOLD} style={styles.btnAction}/>,
                },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'italic',
                        buttonTypes: 'style',
                        iconComponent: <Image source={IC_FORMAT_ITALIC} style={styles.btnAction}/>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'underline',
                        buttonTypes: 'style',
                        iconComponent: <Image source={IC_FORMAT_UNDERLINE} style={styles.btnAction}/>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'lineThrough',
                        buttonTypes: 'style',
                        iconComponent: <Image source={IC_FORMAT_STRIKE} style={styles.btnAction}/>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'body',
                        buttonTypes: 'tag',
                        iconComponent: <Text style={styles.actionText}>T</Text>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'title',
                        buttonTypes: 'tag',
                        iconComponent: <Text style={styles.actionText}>H1</Text>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'heading',
                        buttonTypes: 'tag',
                        iconComponent: <Text style={styles.actionText}>H3</Text>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'ul',
                        buttonTypes: 'tag',
                        iconComponent: <Image source={IC_LIST_BULLET} style={styles.btnAction}/>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'ol',
                        buttonTypes: 'tag',
                        iconComponent: <Image source={IC_LIST_NUMBER} style={styles.btnAction}/>,
                    },
                ],
            },
            {
                type: 'tool',
                iconArray: [
                    {
                        toolTypeText: 'image',
                        iconComponent: this.renderImageSelector(),
                    },
                    {
                        toolTypeText: 'color',
                        iconComponent: this.renderColorSelector(),
                    },
                    {
                        toolTypeText: 'highlight',
                        iconComponent: this.renderHighlight(),
                    }],
            },

        ];

        return (
            <KeyboardAvoidingView
                enabled
                keyboardVerticalOffset={IS_IOS ? 0 : 0}
                style={styles.root}
                behavior={'padding'}
            >
                <MenuProvider style={styles.container}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.main}>
                            <CNEditor
                                ref={input => this.editor = input}
                                onSelectedTagChanged={this.onSelectedTagChanged}
                                onSelectedStyleChanged={this.onSelectedStyleChanged}
                                value={this.state.value}
                                style={styles.editor}
                                styleList={this.customStyles}
                                onValueChanged={this.onValueChanged}
                                onRemoveImage={this.onRemoveImage}
                                placeholder={'Placeholder'}
                            />
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={styles.toolbarContainer}>

                        <CNToolbar
                            style={styles.toolbarStyle}
                            iconSetContainerStyle={styles.iconSetContainerStyle}
                            size={28}
                            iconSet={iconSet}
                            selectedTag={this.state.selectedTag}
                            selectedStyles={this.state.selectedStyles}
                            onStyleKeyPress={this.onStyleKeyPress}
                            backgroundColor={defaultBackgroundColorBtn} // optional (will override default backgroundColor)
                            color="gray" // optional (will override default color)
                            selectedBackgroundColor={defaultSelectedBackgroundColorBtn} // optional (will override default selectedBackgroundColor)
                        />
                    </View>
                </MenuProvider>
            </KeyboardAvoidingView>
        );
    }

}

const toolbarActionWidth = 28;
var styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#eee',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    container: {
        flex: 1,
    },
    toolbarStyle: {
        height: 35,
    },
    iconSetContainerStyle: {
        flexGrow: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 20,
        width: toolbarActionWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        marginHorizontal: 4,
        fontWeight: 'bold',
        color: '#737373',
    },
    main: {
        flex: 1,
        paddingBottom: 1,
        alignItems: 'stretch',
        backgroundColor: '#fff',
        paddingHorizontal: 20

    },
    editor: {

    },
    toolbarContainer: {
        minHeight: 35,
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
    btnAction: {
        width: 24,
        height: 24,
        marginHorizontal: 6,
    },
});

const optionsStyles = {
    optionsContainer: {
        backgroundColor: 'yellow',
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
