var audioPlayer = window.audioPlayer || {};

(function(ns, window) {
  "use strict"

  var PlayerModel = function() {
    var that = this
    var _audio = new Audio()
    _audio.autoplay = false
    _audio.controls = false
    _audio.preload = 'metadata'
    window.document.body.appendChild(_audio)

    var _playing = false
    var _shuffle = false
    this._loop = false
    this._tracks = [] //songs as objects
    this._originalOrder = [] //original order
    this._playlist = [] //editable runningOrder
    this._tracknumber = 0
    this._currentSong = undefined
    this._volume = 0.75
    this._mute = false
    this._seek = false

    _audio.addEventListener('ended', function(e) {
      that.next();
    });

    $(ns.TrackView).on('seeking', function(){
      console.log('seek')
    })
    this._audio = _audio
    this.setVolume(this._volume)
  }

  PlayerModel.prototype = {
    _readJson: function(filename) {
      return $.getJSON('data/_' + filename + '.json')
    },
    setPlaylist: function(list) {

      var that = this
      this._readJson(list).done(function(json){
        $.each(json.tracks, function(key, track) {
          track.nr = key
          var time = track.duration.split(':')
          track.duration = +time[0] * 60 + +time[1]
          that._tracks.push(track)
          that._originalOrder.push(key)
        })
        that._playlist = that._originalOrder
        that._currentSong = that._tracks[that._playlist[0]]
        that._audio.src = that._currentSong.url
        $(that).trigger('change')
      })

    },
    getPlaylist: function() {
      return this._playlist
    },
    getCurrentSong: function(){
      return this._currentSong
    },
    getAudio: function() {
      return this._audio
    },
    play: function() {
      this._audio.play()
      this._playing = true
      $(this).trigger('change')
      this._tick()
    },
    pause: function() {
      this._audio.pause()
      this._playing = false
      $(this).trigger('change')

    },
    stop: function() {
      if(this._playing){
        this._audio.pause()
        this._audio.currentTime = 0
        this._playing = false
        $(this).trigger('change')
      }
    },
    _tick: function() {

      if(this._playing){
        setTimeout(this._tick.bind(this), 100);
        if(this._playing){
          $(this).trigger('timeChange');
        }
      }
    },
    next: function(){
      if(!this._seek){
        if(this._tracknumber < this._playlist.length - 1){
          this._tracknumber++
          this.setSong(this._tracknumber)
        }
        else{
          this._tracknumber = 0
          this.setSong(this._tracknumber)
          if(!this._loop){
            this.stop()
            $(this).trigger('timeChange');
          }
        }
      }

    },
    previous: function(){
      if(this._tracknumber > 0){
        this._tracknumber--
        this.setSong(this._tracknumber)
      }
      else{
        this._tracknumber = 0
        this.setSong(this._tracknumber)
        this.stop()
      }

    },
    setTime: function(time){
      // console.log('this._audio.buffered.length')
      if(this._seek){
        if(time >= this._audio.duration - 1){
          this._audio.currentTime = time - 2
        }
        else{
          this._audio.currentTime = time
        }

        $(this).trigger('timeChange')
      }
    },
    setSong: function(trackNumber){
      this._currentSong = this._tracks[this._playlist[trackNumber]]
      this._tracknumber = trackNumber
      this._audio.src = this._currentSong.url

      if(this._playing){
        this.stop()
        this.play()
      }
      $(this).trigger('change')
    },
    getState: function() {
      return {play: this._playing, shuffle: this._shuffle, loop: this._loop,
                volume: this._volume, mute: this._mute, duration: this._audio.duration,
                time: this._audio.currentTime, seek: this._seek}
    },
    getTrack: function(trackNumber){
      return this._tracks[this._playlist[trackNumber]]
    },
    shuffle: function(){
      if(this._shuffle){
        this._shuffle = false
        this._playlist = this._originalOrder
        this._tracknumber = _.indexOf(this._tracks, this._currentSong)
      }
      else{
        this._tracknumber = 0
        this._shuffle = true
        this._playlist = _.shuffle(this._originalOrder)

        if(this._playing){
          //current song in shuffle in first slot
          var swapElement = this._playlist[_.indexOf(this._playlist, _.indexOf(this._tracks, this._currentSong))]
          this._playlist[_.indexOf(this._playlist, _.indexOf(this._tracks, this._currentSong))] = this._playlist[0]
          this._playlist[0] = swapElement
        }

      }

      if(!this._playing){
        this.setSong(0)
      }
      $(this).trigger('change')
    },
    loop: function(){
      if(!this._loop){
        this._loop = true
      }
      else{
        this._loop = false
      }
      $(this).trigger('controlsChange')
    },
    setVolume: function(value){
      if((this._volume != value && !this._mute) || (this._mute && value != 0)){
        this._audio.volume = value
        this._volume = value
        this._mute = false
        $(this).trigger('controlsChange')
      }

    },
    setMute: function(){
      if(this._mute == true){
        this._mute = false
        this._audio.volume = this._volume
      }
      else{
        this._mute = true
        this._audio.volume = 0
      }
      $(this).trigger('controlsChange')
    },
    setSeek: function(seeking) {
      if(seeking){
        this._seek = true
        this._audio.volume = 0
      }
      else{
        this._seek = false
        this._audio.volume = this._volume
      }

    },
    setTrackPosition: function(item, target){
      if(target > item){
        var dragItem = this._playlist[item]
        for (var i = item; i < target; i++) {
          this._playlist[i] = this._playlist[i + 1]
        };
        this._playlist[target - 1] = dragItem
        this._tracknumber = _.indexOf( this._playlist, _.indexOf(this._tracks, this._currentSong))
      }
      else if(target < item){
        var dragItem = this._playlist[item]
        for (var i = item; i > target; i--) {
          this._playlist[i] = this._playlist[i - 1]
        };
        this._playlist[target] = dragItem
        this._tracknumber = _.indexOf( this._playlist, _.indexOf(this._tracks, this._currentSong))

      }
      $(this).trigger('change')

    }
  }

  ns.PlayerModel = PlayerModel
})(audioPlayer, window)