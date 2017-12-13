import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation'
import AudioDemo from './AudioDemo.js';
import SoundDemo from './SoundDemo.js';


const MainStack = StackNavigator({
  AudioDemo: {
    screen: AudioDemo
  },
  SoundDemo: {
    screen: SoundDemo
  }
})

AppRegistry.registerComponent('Example', () => MainStack);

