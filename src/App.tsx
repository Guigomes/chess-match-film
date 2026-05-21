import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {RootNavigator} from './navigation/RootNavigator';
import {initDatabase} from './services/storage/gameStorage';
import {onnxSession} from './services/onnx/OnnxSession';

export default function App() {
  useEffect(() => {
    initDatabase().catch(console.error);
    onnxSession.initialize().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});
