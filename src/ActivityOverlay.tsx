import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

interface Props {}

export default class ActivityOverlay extends React.Component<Props, {}> {
    render() {
        return (
            <View style={styles.activityOverlayStyle}>
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="small" />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    activityOverlayStyle: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, .5)',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 5,
    },
    activityIndicatorContainer: {
        backgroundColor: 'lightgray',
        padding: 10,
        borderRadius: 50,
        alignSelf: 'center',
    },
});
