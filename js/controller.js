var audioPlayer = window.audioPlayer || {};

(function(ns, window) {
  "use strict"
  var PlayerController = function(model) {
    this._audio = model.getAudio()
    this.model = model
  }

  PlayerController.prototype = {
    triggerPlay: function(){
      if(!this.model.getState().play){
        this.model.play()
      }
      else{
        this.model.pause()
      }
    },
    stop: function(){
      this.model.stop()
    },
    nextSong: function(){
      this.model.next()
    },
    previousSong: function(){
      this.model.previous()
    },
    shuffle: function(){
      this.model.shuffle()
    },
    loop: function(){
      this.model.loop()
    },
    setSong: function(trackNumber, start){
      this.model.setSong(trackNumber)
      if(start){
        this.model.play()
      }
    },
    setVolume: function(value){
      this.model.setVolume(value)
    },
    triggerMute: function(){
      this.model.setMute()
    },
    setTime: function(percent){
      var time = this.model.getState().duration/100*percent
      this.model.setTime(time)
    },
    setSeek: function(seeking){
      this.model.setSeek(seeking)
    },
    clickSeek: function(){
      this.model.setSeek(true)
      var that = this
      setTimeout(function(){
        that.model.setSeek(false)
      }, 510);
    },
    formatTime: function(seconds){
      var min = Math.floor(seconds / 60 );
      var sec = Math.floor(seconds - (min * 60));

      return (min < 10 ? "0" + min : min) + ":" + (sec  < 10 ? "0" + sec : sec);
    },
    setTrackPosition: function(item, target){
      this.model.setTrackPosition(item, target)
    }
  }
  ns.PlayerController = PlayerController
})(audioPlayer, window)