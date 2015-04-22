//namespace for all components
var audioPlayer = window.audioPlayer || {};

//namespace for controls within components
(function(ns, window) {
  "use strict"
//Constructor of Slider
  function AbstractSlider(slider, min, max, value, step) {
    var _$slider = slider;

        //add track, thumb and label to HTML
        _$slider.append("<div class='track'></div><div class='thumb'></div><div class='tooltip hidden'>00:00</div>");

        //get thumb and track from DOM-elements
        var _$track = _$slider.find('.track');
        var _$thumb = _$slider.find('.thumb');
        var _$tooltip = _$slider.find('.tooltip');

        var _min = (isNaN(min) ? 0 : min);
        var _max = (isNaN(max) ? 0 : max);
        var _value = (isNaN(value) ? 0 : value);
        var _step = step;

        var _offset = 0;

        var _length = 0;

        var _animate = false;
        //get and set functions
        this.getMin = function() { return _min; };
        this.getMax = function() { return _max;  };
        this.getRange = function() { return _max - _min; };

        this.getThumb = function() { return _$thumb; };
        this.getTrack = function() { return _$track; };
        this.getSlider = function() { return _$slider; };
        this.getTooltip = function() { return _$tooltip; };

        this.getValue = function() { return _value};
        this.setVal = function(value) { _value = value; };

        this.getOffset = function() { return _offset; };
        this.setOffset = function(value) {_offset = value; };

        this.getLength = function() { return _length; };
        this.setLength = function(value) { _length = value; };

        this.getStep =  function() { return _step; };
        //Data interface
      _$slider.data('interface', {
          setValue: this.setValue.bind(this),
          getValue: this.getValue.bind(this)
      });

        //_$slider.data('interface', sliderInterface);

        this.setValue(_value);
        _$slider.find('.value').html(_value.toFixed(2));

        //initialize onMouseDownHandler
        _$slider.on('mousedown', this.onMouseDownHandler.bind(this));
  }

  AbstractSlider.prototype.setValueByPageX = function(x, offset) {
    //calculate position in regard to the offset of track and thumb to track
    var position = Math.max(0, Math.min(x - this.getOffset() - offset, this.getLength() - this.getThumb().width()));
    this.setValue(Math.round(this.valueToPosition(position) / this.getStep()) * this.getStep());
  };

  AbstractSlider.prototype.setValue = function(newVal) {
    newVal = Math.round(newVal / this.getStep()) * this.getStep();
    this.setVal(newVal);
    //trigger change event for label etc.
    $(this).trigger('changeSlider')
  };

  //Get Position to given Value
  AbstractSlider.prototype.positionToValue = function(value) {
    return (value - this.getMin())/(this.getMax() - this.getMin()) * (this.getLength() - this.getThumb().width());
  };

  //Get Value to given Position
  AbstractSlider.prototype.valueToPosition = function(position) {
    return position/(this.getLength() - this.getThumb().width()) * (this.getMax() - this.getMin()) + this.getMin();
  };

  AbstractSlider.prototype.getRange = function(){

    if(this.min < 0)
      return this.max + (this.min * (-1));
    else
      return this.max - this.min;
  };

  function HSlider(slider, min, max, value, step) {
        AbstractSlider.call(this, slider, min, max, value, step);
        this.setOffset(this.getTrack().offset().left);
        this.setLength(this.getTrack().width());
        this.setValue(value);
        this.getSlider().find('.output').html(value.toFixed(2));
  };
  HSlider.prototype = Object.create(AbstractSlider.prototype);

  HSlider.prototype.setValue = function setValue(newValue) {
        AbstractSlider.prototype.setValue.call(this,newValue);
        if(this._animate) {
          var that = this
          this.getThumb().animate({ left: Math.round(this.positionToValue(newValue)) }, 500, function() {});
          $('.hslider .trail').animate({width: that.positionToValue(newValue)}, 500, function() {})

          this.getTooltip().addClass('hidden');
          this.getSlider().removeClass('active');
          this._animate = false
        }
        else {
          this.getThumb().css('left', this.positionToValue(newValue));
          $('.hslider .trail').css('width', this.positionToValue(newValue))

        }
        // this.getTooltip().text(Math.round(this.getValue()));
        this.getTooltip().css('left', this.positionToValue(newValue)-16);
    };

  HSlider.prototype.onMouseDownHandler = function(e) {
    var offset = 0;
    this.getSlider().addClass('active');

    //thumb clicked?
    if(e.target === this.getThumb()[0]) {
      offset = e.pageX - this.getThumb().offset().left;
       this.getTooltip().removeClass('hidden');
       this._animate = false;

       $(this).trigger('seekOn')
      //cache 'this'
      var that = this;
      $(window).on('mousemove', function(e) {
        that.setValueByPageX(e.pageX, offset);
      });

      $(window).on('mouseup', function(e) {
        $(that).trigger('seekOff')
        //turn off mousemove
        $(window).off('mousemove');
        $(window).off('mouseup');
        that.getTooltip().addClass('hidden');
        that.getSlider().removeClass('active');

      });
    }
    //track clicked
    else{
      $(this).trigger('seekClick')
      this._animate = true;
      offset = this.getThumb().width()/2;
      this.setValueByPageX(e.pageX, offset);

    }
    e.preventDefault();
  }


  function VSlider(slider, max, min, value, step) {
        AbstractSlider.call(this, slider, min, max, value, step);
        this.setOffset(this.getTrack().offset().top);
        this.setLength(this.getTrack().outerHeight());
        this.setValue(value);
        this.getSlider().find('.output').html(value.toFixed(2));
  };
  VSlider.prototype = Object.create(AbstractSlider.prototype);

  //Get Position to given Value
  VSlider.prototype.positionToValue = function(value) {
    return (value - this.getMin())/(this.getMax() - this.getMin()) * (this.getLength() - this.getThumb().height());
  };

  VSlider.prototype.setValue = function setValue(newValue) {
        AbstractSlider.prototype.setValue.call(this,newValue);
        if(this._animate) {
          this.getThumb().animate({ top: this.positionToValue(newValue) }, 500, function() {});
          this.getTooltip().addClass('hidden');
          this.getSlider().removeClass('active');
          $('.vslider .trail').animate({height: this.positionToValue(-newValue) + $('.vslider .thumb').height() - $('.vslider').height()}, 500, function() {})
        }
        else {
          this.getThumb().css('top', this.positionToValue(newValue));
          $('.vslider .trail').css('height', this.positionToValue(-newValue) + $('.vslider .thumb').height() - $('.vslider').height())
        }
    };
  VSlider.prototype.setAnimate = function(animate) {
    this._animate = animate
  }
  VSlider.prototype.onMouseDownHandler = function(e) {
    var offset = 0;
    this.getSlider().addClass('active');

    //thumb clicked?
    if(e.target === this.getThumb()[0]) {
      offset = e.pageY - this.getThumb().offset().top;
      this._animate = false;

      //cache 'this'
      var that = this;

      $(window).on('mousemove', function(e) {
        that.setValueByPageX(e.pageY, offset);
      });

      $(window).on('mouseup', function(e) {
        //turn off mousemove
        $(window).off('mousemove');
        that.getSlider().removeClass('active');
        //that.getTooltip().addClass('hidden');
      });
    }
    //track clicked
    else {
      this._animate = true;
      offset = this.getThumb().width()/2;
      this.setValueByPageX(e.pageY, offset);
    }

    e.preventDefault();
  }
  ns.HSlider = HSlider
  ns.VSlider = VSlider


})(audioPlayer, window)