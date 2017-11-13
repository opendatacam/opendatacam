import { Howl } from 'howler';

class SoundsManager {

  constructor() {
    this.sounds = {};
    this.currentAmbientSound = null;

    console.log('Instantiate SoundsManager');

    // Add sounds used everywhere, TODO optimize loading by adding when when needed
    // load intro first
    // add events of sounds loaded ... 
    this.addSound("ambient","intro", "/static/assets/sounds/intro.mp3");
    
    setTimeout(() => {
      this.addSound("ambient", "main", "/static/assets/sounds/main.mp3", {
        loop: true
      });
      this.addSound("ambient", "nextlevel", "/static/assets/sounds/nextlevel.mp3");
      this.addSound("punctual", "popA", "/static/assets/sounds/popA.mp3");
      this.addSound("punctual", "popB", "/static/assets/sounds/popB.mp3");
      this.addSound("punctual", "puffA", "/static/assets/sounds/puffA.mp3");
      this.addSound("ambient", "youlose", "/static/assets/sounds/youlose.mp3");
      this.addSound("ambient", "youwin", "/static/assets/sounds/youwina.mp3");
      this.addSound("ambient", "alert", "/static/assets/sounds/alert.mp3", {
        loop: true
      });
    }, 1000);
  }

  addSound(soundType, soundName, soundSrc, options) {
    this.sounds[soundName] = {
      sound: new Howl({
        src: [soundSrc],
        ...options
      }),
      type: soundType
    }
  }

  playSound(soundName, playbackRate = 1) {
    const soundToPlay = this.sounds[soundName];
    if(this.sounds[soundName]) {
      if(soundToPlay.type === 'ambient') {
        // We can only play on ambient sound at a time
        // stop crossfade them
        if(this.currentAmbientSound) {
          // Fade off
          // this.currentAmbientSound.sound.fade(1, 0, 1000);
          // TODO IF WE FADE LIKE THAT, we need to make sure to stop the sound
          // on the end of the fade, if not there is a bug if you load another level and
          // game over and retry, simply stop for now
          this.currentAmbientSound.sound.stop();
        }
        // Fade entry
        soundToPlay.sound.seek(0); // if previously not stopped
        soundToPlay.sound.rate(playbackRate);
        soundToPlay.sound.fade(0, 1, 500);
        soundToPlay.sound.play();
        this.currentAmbientSound = soundToPlay;
      } else {
        // It's a punctual sound, we can play it on top of anything
        this.sounds[soundName].sound.play();
      }
    } else {
      console.log(`Sound ${soundName} undefined`);
    }
  }

  pauseSound(soundName) {
    if(this.sounds[soundName]) {
      this.sounds[soundName].sound.pause();
    } else {
      console.log(`Sound ${soundName} undefined`);
    }
  }

  stopSound(soundName) {
    if(this.sounds[soundName]) {
      this.sounds[soundName].sound.stop();
    } else {
      console.log(`Sound ${soundName} undefined`);
    }
  }

  changePlaybackRate(soundName, newRate) {
    if(this.sounds[soundName]) {
      this.sounds[soundName].sound.rate(newRate);
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
