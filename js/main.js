var audioPlayer = window.audioPlayer || {};
(function (ns) {
  var player = new ns.PlayerModel()


  var controller = new ns.PlayerController(player)
  var controls = new ns.ControlsView(player, $('#output'), controller)
  var info = new ns.InfoView(player, $('#output'), controller)
  var volume = new ns.VSlider($('#volume .vslider'), 0, 1, parseFloat(0.75), parseFloat(0.01));
  var track = new ns.TrackView(player, $('#output'), controller);
  var playlist = new ns.PlaylistView(player, $('#output'), controller)


  player.setPlaylist('tracklist')

  $(volume).on('changeSlider', function(){
    controller.setVolume(this.getValue())
  })

  window.player = player
  window.playlist = playlist
  window.controller = controller
  window.volume = volume

})(audioPlayer)