import { Howl } from 'howler';

class SoundsManager {

  constructor() {
    this.sounds = {};

    // Add sounds used everywhere, TODO optimize loading by adding when when needed
    // load intro first
    // add events of sounds loaded ... 
    this.addSound("intro", "/static/assets/sounds/intro.mp3");
    
    setTimeout(() => {
      this.addSound("main", "/static/assets/sounds/main.mp3");
      this.addSound("nextlevel", "/static/assets/sounds/nextlevel.mp3");
      this.addSound("popA", "/static/assets/sounds/popA.mp3");
      this.addSound("popB", "/static/assets/sounds/popB.mp3");
      this.addSound("puffA", "/static/assets/sounds/puffA.mp3");
      this.addSound("youlose", "/static/assets/sounds/youlose.mp3");
      this.addSound("youwina", "/static/assets/sounds/youwina.mp3");
      this.addSound("youwinb", "/static/assets/sounds/youwinb.mp3");
      this.addSound("alert", "/static/assets/sounds/alert.mp3");
    }, 1000);
  }

  addSound(soundName, soundSrc, options) {
    this.sounds[soundName] = new Howl({
      src: [soundSrc],
      ...options
    })
  }

  playSound(soundName) {
    if(this.sounds[soundName]) {
      this.sounds[soundName].play();
    } else {
      console.log(`Sound ${soundName} undefined`);
    }
  }

  pauseSound(soundName) {
    if(this.sounds[soundName]) {
      this.sounds[soundName].pause();
    } else {
      console.log(`Sound ${soundName} undefined`);
    }
  }

  stopSound(soundName) {
    if(this.sounds[soundName]) {
      this.sounds[soundName].stop();
    } else {
      console.log(`Sound ${soundName} undefined`);
    }
  }

  muteAll() {
    Howler.mute(true);
  }

  unMuteAll() {
    Howler.mute(false);
  }
}

const SoundsManagerInstance = new SoundsManager();

export default SoundsManagerInstance;
