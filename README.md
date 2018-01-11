[![npm](https://img.shields.io/npm/v/react-native-audios.svg)](https://www.npmjs.com/package/react-native-audios)
[![npm](https://img.shields.io/npm/dm/react-native-audios.svg)](https://www.npmjs.com/package/react-native-audios)
[![npm](https://img.shields.io/npm/l/react-native-audios.svg)](https://www.npmjs.com/package/react-native-audios)

Record and play audio in iOS or Android React Native apps.

整合了[react-native-audio](https://github.com/jsierles/react-native-audio)和[react-native-sound](https://github.com/zmxv/react-native-sound)
修复了这两个库的一些兼容问题，ios端增加了转码功能，可以支持录播amr格式。

## Installation

```
npm install react-native-audios --save
```

Then link it automatically using:

```
react-native link react-native-audios
```

## Usage

record

```
import { AudioRecorder, AudioUtils, Sound } from 'react-native-audios';
let audioPath = AudioUtils.DocumentDirectoryPath + '/test.amr',

AudioRecorder.prepareRecordingAtPath(audioPath, {
	SampleRate: 22050,
	Channels: 1,
	AudioQuality: "Low",
	AudioEncoding: "amr",
	AudioEncodingBitRate: 32000
});
```

playing audio

```
var sound = new Sound(this.state.audioPath, '', (error) => {
	if (error) {
		console.log('failed to load the sound', error);
	}
});

sound.play((success) => {
	if (success) {
		console.log('successfully finished playing');
	} else {
		console.log('playback failed due to audio decoding errors');
	}
});
```

See [Example](https://github.com/dermvpure/react-native-audios/tree/master/Example) for detail

## THANKS

- [react-native-audio](https://github.com/jsierles/react-native-audio)
- [react-native-sound](https://github.com/zmxv/react-native-sound)
