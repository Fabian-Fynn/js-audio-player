var audioPlayer = window.audioPlayer || {};

(function(ns, window) {
  "use strict"
  var AbstractView = function(model, $element, controller) {
    this.model = model
    this.controller = controller

    $(model).on('change', this.render.bind(this))
  }

  AbstractView.prototype = {
    render: function() {
    }
  }

  var TrackView = function(model, $element, controller) {
    AbstractView.apply(this, arguments)
    var that = this
    var $track = $('<div id="track" ><div class="hslider"><div class="trail"></div></div></div>')
    $element.append($track)

    this._track = new ns.HSlider($('#track .hslider'), 0, 100, parseFloat(0.0), parseFloat(0.01));
    $(model).on('timeChange', this.render.bind(this))

    $(this._track).on('changeSlider', function(){
      controller.setTime(this.getValue())
    })

    $(this._track).on('seekOn', function(){
      controller.setSeek(true)
    })

    $(this._track).on('seekOff', function(){
      controller.setSeek(false)
    })

    $(this._track).on('seekClick', function(){
      controller.clickSeek()

    })
  }

  TrackView.prototype = Object.create(AbstractView.prototype)
  TrackView.prototype.constructor = TrackView

  TrackView.prototype.render = function() {

    var state = this.model.getState()
    if(!state.seek){
      if(state.time == 0){
        this._track.setValue(0)
      }
      else {
        this._track.setValue(state.time/(state.duration/100))
      }
    }
    else{
      var result = this.controller.formatTime(state.time)
      $('#track .tooltip').text(result)
    }
  }

  var ControlsView = function(model, $element, controller) {
    AbstractView.apply(this, arguments)
    var that = this
    this.controller = controller
    var $headline = $('<div id="title">Awesome Audio Player</div>')
    var $controls = $('<div id="controls"></div>')
    var $playBtn = $('<button id="play" class="btn pause" />')
    var $nextBtn = $('<button id="next" class="btn next" />')
    var $previousBtn = $('<button id="previous" class="btn previous" />')
    var $stopBtn = $('<button id="stop" class="btn stop" />')
    var $shuffleBtn = $('<button id="shuffle" class="btn shuffle" />')
    var $loopBtn = $('<button id="loop" class="btn loop" />')
    var $volume = $('<div id="volume" ><div class="vslider"><div class="trail"></div></div><button id="mute" class="btn mute"></button></div>')
    var $btns = [$previousBtn, $playBtn, $stopBtn, $nextBtn, $shuffleBtn, $loopBtn]
    $controls.append($btns)
    $controls.append($volume)
    $element.append($headline)
    $element.append($controls)

    $('#play').click(function(){
      that.controller.triggerPlay()
    })

    $('#stop').click(function(){
      that.controller.stop()
    })

    $('#next').click(function(){
      that.controller.nextSong()
    })

    $('#previous').click(function(){
      that.controller.previousSong()
    })

    $('#shuffle').click(function(){
      that.controller.shuffle()
    })

    $('#loop').click(function(){
      that.controller.loop()
    })

    $('#mute').click(function(){
      that.controller.triggerMute()
    })

    $(model).on('controlsChange', function() { that.render()})
  }

  ControlsView.prototype = Object.create(AbstractView.prototype)
  ControlsView.prototype.constructor = ControlsView

  ControlsView.prototype.render = function() {
    var state = this.model.getState()
    if(state.play) {
      $('#play').addClass('play')
      $('#play').removeClass('pause')
    }
    else{
      $('#play').addClass('pause')
      $('#play').removeClass('play')
    }
    if(state.loop){
      $('#loop').addClass('active')
    }
    else{
      $('#loop').removeClass('active')
    }

    if(state.shuffle){
      $('#shuffle').addClass('active')
    }
    else{
      $('#shuffle').removeClass('active')
    }

    if(state.volume == 0){
    }
    if(state.volume == 0 || state.mute){
      $('#mute').addClass('active')
      volume.setAnimate(true)
      volume.setValue(0)
    }
    else{
      volume.setValue(state.volume)
      $('#mute').removeClass('active')
    }
  }

  var InfoView = function(model, $element, controller) {
    AbstractView.apply(this, arguments)
    var that = this
    var $track = $('<div id="info"></div>')
    $element.append($track)
    $(model).on('timeChange', this.render.bind(this))
  }

  InfoView.prototype = Object.create(AbstractView.prototype)
  InfoView.prototype.constructor = InfoView

  InfoView.prototype.render = function() {

    var state = this.model.getState()
    var track = this.model.getCurrentSong()
    var timePlayed = this.controller.formatTime(state.time)
    var timeRemaining = this.controller.formatTime(track.duration - state.time)
    $('#info').empty()
    $('#info').append('<h1 class="title">' + track.title +'</h1>'+
                      '<p class="artist">' + track.artist +
                      '</p><p class="album">' + track.album + ' - ' + track.year +
                      '</p><p class="genre">' + track.genre +
                      '</p><p class="timePlayed">' + timePlayed +
                      '</p><p class="timeRemaining"> -' + timeRemaining + '</p>')

  }

  var PlaylistView = function(model, $element, controller) {
    AbstractView.apply(this, arguments)
    var that = this
    this.controller = controller
    this.model = model
    this._drag = false
    this._dragTarget = 0
    this._dragItem = 0
    var $playlist = $('<div id="playlist" ondragover="playlist.allowDrop(event)" ondrop="playlist.drop(event)" ondragend="playlist.cancelDrag(event)"></div>')
    $element.append($playlist)
    $(model).on('listChange', function() { that.render()})

  }

  PlaylistView.prototype = Object.create(AbstractView.prototype)
  PlaylistView.prototype.constructor = PlaylistView
  PlaylistView.prototype.drag = function(ev) {
    ev.dataTransfer.effectAllowed = "move";
    this._dragItem = +ev.target.id
    var posX = (ev.pageX - $('#'+this._dragItem).offset().left)
    var posY = (ev.pageY - $('#'+this._dragItem).offset().top)

    var $crt = $('#' + this._dragItem).clone(true);

    $crt.attr('id', 'ghost')
    $crt.css('background', '#C6527B')
    $crt.width($('#' + this._dragItem).outerWidth())
    $crt.height($('#' + this._dragItem).outerHeight())
    $('html').append($crt);

    var crt = document.getElementById('ghost');
    crt.style.left = 100000  + 'px'
    ev.dataTransfer.setDragImage(crt, posX, posY);
    this._drag = true
    ev.dataTransfer.setData("text", ev.target.id);


  }
  PlaylistView.prototype.cancelDrag = function(ev) {
    this._drag = false
    this.render()

  }
  PlaylistView.prototype.allowDrop = function(ev) {
    ev.preventDefault();

    var $underneath = $(ev.toElement).closest('div')

    if($underneath.attr('id') != 'playlist'){

      $('#' + this._dragTarget).removeClass('border-top')
      this._dragTarget = +$underneath.attr('id')

      //check if in lower half of track
      if(ev.pageY - $underneath.offset().top >= $underneath.height() / 2){
        this._dragTarget++
      }

      //hide drag item
      $('#' + this._dragItem).hide()
      //if moved to same spot select next trag as target
      if(this._dragTarget == this._dragItem){
        this._dragTarget++;
      }

      $('#' + this._dragTarget).addClass('border-top')
    }

  }
  PlaylistView.prototype.drop = function(ev) {
    ev.preventDefault();
    $('#' + this._dragTarget).removeClass('border-top')

    this.controller.setTrackPosition(this._dragItem, this._dragTarget)
    this._drag = false
    this.render()
  }
  PlaylistView.prototype.render = function() {
    $('#playlist').empty()
    $('#ghost').remove()
    this.playlist = this.model.getPlaylist()
    var currentClass = ''
    var position = 'before'
    var that = this
    for (var i = 0; i < this.playlist.length; i++) {
      var track = this.model.getTrack(i)

      if(track == this.model.getCurrentSong()){
        currentClass = ' current'
        position = 'after'
      }
      else if(position == 'before'){
        currentClass = ' played'
      }
      else{
        currentClass = ''
      }

      $('#playlist').append('<div id="' + i + '" class="track' + currentClass +
                            '" draggable="true" ondragstart="playlist.drag(event)"><h1>' + track.title + '</h1><p class="tracknumber">' + (track.nr + 1) +
                            '</p><p class="artist">' + track.artist +
                            '</p><p class="duration">' + this.controller.formatTime(track.duration) + '</p></div>')
    }

    $('#playlist .track').dblclick(function(){
      that.controller.setSong($(this).attr('id'), true)
    })

  }
  ns.PlaylistView = PlaylistView
  ns.ControlsView = ControlsView
  ns.InfoView = InfoView
  ns.TrackView = TrackView

})(audioPlayer, window)