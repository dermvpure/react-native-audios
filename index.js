'use strict';

import React from "react";

import ReactNative, {
  NativeModules,
  NativeAppEventEmitter,
  DeviceEventEmitter,
  Platform
} from "react-native";

var AudioRecorderManager = NativeModules.AudioRecorderManager;

var AudioRecorder = {
  prepareRecordingAtPath: function(path, options) {
    if (this.progressSubscription) this.progressSubscription.remove();
    this.progressSubscription = NativeAppEventEmitter.addListener('recordingProgress',
      (data) => {
        if (this.onProgress) {
          this.onProgress(data);
        }
      }
    );

    if (this.finishedSubscription) this.finishedSubscription.remove();
    this.finishedSubscription = NativeAppEventEmitter.addListener('recordingFinished',
      (data) => {
        if (this.onFinished) {
          this.onFinished(data);
        }
      }
    );

    var defaultOptions = {
      SampleRate: 44100.0,
      Channels: 2,
      AudioQuality: 'High',
      AudioEncoding: 'ima4',
      OutputFormat: 'mpeg_4',
      MeteringEnabled: false,
      MeasurementMode: false,
      AudioEncodingBitRate: 32000
    };

    var recordingOptions = {...defaultOptions, ...options};

    if (Platform.OS === 'ios') {
      AudioRecorderManager.prepareRecordingAtPath(
        path,
        recordingOptions.SampleRate,
        recordingOptions.Channels,
        recordingOptions.AudioQuality,
        recordingOptions.AudioEncoding,
        recordingOptions.MeteringEnabled,
        recordingOptions.MeasurementMode
      );
    } else {
      return AudioRecorderManager.prepareRecordingAtPath(path, recordingOptions);
    }
  },
  startRecording: function() {
    return AudioRecorderManager.startRecording();
  },
  pauseRecording: function() {
    return AudioRecorderManager.pauseRecording();
  },
  stopRecording: function() {
    return AudioRecorderManager.stopRecording();
  },
  checkAuthorizationStatus: AudioRecorderManager.checkAuthorizationStatus,
  requestAuthorization: AudioRecorderManager.requestAuthorization,
  removeListeners: function() {
    if (this.progressSubscription) this.progressSubscription.remove();
    if (this.finishedSubscription) this.finishedSubscription.remove();
  },
};

let AudioUtils = {};

if (Platform.OS === 'ios') {
  AudioUtils = {
    MainBundlePath: AudioRecorderManager.MainBundlePath,
    CachesDirectoryPath: AudioRecorderManager.NSCachesDirectoryPath,
    DocumentDirectoryPath: AudioRecorderManager.NSDocumentDirectoryPath,
    LibraryDirectoryPath: AudioRecorderManager.NSLibraryDirectoryPath,
  };
} else if (Platform.OS === 'android') {
  AudioUtils = {
    MainBundlePath: AudioRecorderManager.MainBundlePath,
    CachesDirectoryPath: AudioRecorderManager.CachesDirectoryPath,
    DocumentDirectoryPath: AudioRecorderManager.DocumentDirectoryPath,
    LibraryDirectoryPath: AudioRecorderManager.LibraryDirectoryPath,
    PicturesDirectoryPath: AudioRecorderManager.PicturesDirectoryPath,
    MusicDirectoryPath: AudioRecorderManager.MusicDirectoryPath,
    DownloadsDirectoryPath: AudioRecorderManager.DownloadsDirectoryPath
  };
}


var RNSound = require('react-native').NativeModules.RNSound;
var IsAndroid = RNSound.IsAndroid;
var IsWindows = RNSound.IsWindows;
var resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");
var nextKey = 0;

function isRelativePath(path) {
  return !/^(\/|http(s?)|asset)/.test(path);
}

function Sound(filename, basePath, onError, options) {
  var asset = resolveAssetSource(filename);
  if (asset) {
    this._filename = asset.uri;
    onError = basePath;
  } else {
    this._filename = basePath ? basePath + '/' + filename : filename;

    if (IsAndroid && !basePath && isRelativePath(filename)) {
      this._filename = filename.toLowerCase().replace(/\.[^.]+$/, '');
    }
  }

  this._loaded = false;
  this._key = nextKey++;
  this._duration = -1;
  this._numberOfChannels = -1;
  this._volume = 1;
  this._pan = 0;
  this._numberOfLoops = 0;
  this._speed = 1;
  RNSound.prepare(this._filename, this._key, options || {}, (error, props) => {
    if (props) {
      if (typeof props.duration === 'number') {
        this._duration = props.duration;
      }
      if (typeof props.numberOfChannels === 'number') {
        this._numberOfChannels = props.numberOfChannels;
      }
    }
    if (error === null) {
      this._loaded = true;
    }
    onError && onError(error, props);
  });
}

Sound.prototype.isLoaded = function() {
  return this._loaded;
};

Sound.prototype.play = function(onEnd) {
  if (this._loaded) {
    RNSound.play(this._key, (successfully) => onEnd && onEnd(successfully));
  } else {
    onEnd && onEnd(false);
  }
  return this;
};

Sound.prototype.pause = function(callback) {
  if (this._loaded) {
    RNSound.pause(this._key, () => { callback && callback() });
  }
  return this;
};

Sound.prototype.stop = function(callback) {
  if (this._loaded) {
    RNSound.stop(this._key, () => { callback && callback() });
  }
  return this;
};

Sound.prototype.reset = function() {
  if (this._loaded && IsAndroid) {
    RNSound.reset(this._key);
  }
  return this;
};

Sound.prototype.release = function() {
  if (this._loaded) {
    RNSound.release(this._key);
    this._loaded = false;
  }
  return this;
};

Sound.prototype.getDuration = function() {
  return this._duration;
};

Sound.prototype.getNumberOfChannels = function() {
  return this._numberOfChannels;
};

Sound.prototype.getVolume = function() {
  return this._volume;
};

Sound.prototype.setVolume = function(value) {
  this._volume = value;
  if (this._loaded) {
    if (IsAndroid || IsWindows) {
      RNSound.setVolume(this._key, value, value);
    } else {
      RNSound.setVolume(this._key, value);
    }
  }
  return this;
};

Sound.prototype.getSystemVolume = function(callback) {
  if(IsAndroid) {
    RNSound.getSystemVolume(callback);
  }
  return this;
};

Sound.prototype.setSystemVolume = function(value) {
  if (IsAndroid) {
    RNSound.setSystemVolume(value);
  }
  return this;
};

Sound.prototype.getPan = function() {
  return this._pan;
};

Sound.prototype.setPan = function(value) {
  if (this._loaded) {
    RNSound.setPan(this._key, this._pan = value);
  }
  return this;
};

Sound.prototype.getNumberOfLoops = function() {
  return this._numberOfLoops;
};

Sound.prototype.setNumberOfLoops = function(value) {
  this._numberOfLoops = value;
  if (this._loaded) {
    if (IsAndroid || IsWindows) {
      RNSound.setLooping(this._key, !!value);
    } else {
      RNSound.setNumberOfLoops(this._key, value);
    }
  }
  return this;
};

Sound.prototype.setSpeed = function(value) {
  this._setSpeed = value;
  if (this._loaded) {
    if (!IsWindows) {
      RNSound.setSpeed(this._key, value);
    }
  }
  return this;
};

Sound.prototype.getCurrentTime = function(callback) {
  if (this._loaded) {
    RNSound.getCurrentTime(this._key, callback);
  }
};

Sound.prototype.setCurrentTime = function(value) {
  if (this._loaded) {
    RNSound.setCurrentTime(this._key, value);
  }
  return this;
};

// android only
Sound.prototype.setSpeakerphoneOn = function(value) {
  if (IsAndroid) {
    RNSound.setSpeakerphoneOn(this._key, value);
  }
};

// ios only

// This is deprecated.  Call the static one instead.

Sound.prototype.setCategory = function(value) {
  Sound.setCategory(value, false);
}

Sound.enable = function(enabled) {
  RNSound.enable(enabled);
};

Sound.enableInSilenceMode = function(enabled) {
  if (!IsAndroid && !IsWindows) {
    RNSound.enableInSilenceMode(enabled);
  }
};

Sound.setActive = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setActive(value);
  }
};

Sound.setCategory = function(value, mixWithOthers = false) {
  if (!IsWindows) {
    RNSound.setCategory(value, mixWithOthers);
  }
};

Sound.setMode = function(value) {
  if (!IsAndroid && !IsWindows) {
    RNSound.setMode(value);
  }
};

Sound.MAIN_BUNDLE = RNSound.MainBundlePath;
Sound.DOCUMENT = RNSound.NSDocumentDirectory;
Sound.LIBRARY = RNSound.NSLibraryDirectory;
Sound.CACHES = RNSound.NSCachesDirectory;


module.exports = {AudioRecorder, AudioUtils, Sound};
