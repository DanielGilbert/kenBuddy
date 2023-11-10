/*!
 * Durationpicker Component for Twitter Bootstrap
 *
 * bootstrap-durationpicker v1.0.0
 * 
 * http://bilbous.github.com/bootstrap-durationpicker
 * 
 * Copyright 2015 Yannick Cenatiempo
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function($, window, document, undefined) {
  'use strict';

  // DURATIONPICKER PUBLIC CLASS DEFINITION
  var Durationpicker = function(element, options) {
    this.widget = '';
    this.$element = $(element);
    this.defaultDuration = options.defaultDuration;
    this.disableFocus = options.disableFocus;
    this.disableMousewheel = options.disableMousewheel;
    this.isOpen = options.isOpen;
    this.minuteStep = options.minuteStep;
    this.modalBackdrop = options.modalBackdrop;
    this.orientation = options.orientation;
    this.secondStep = options.secondStep;
    this.showInputs = options.showInputs;
    this.showSeconds = options.showSeconds;
    this.template = options.template;
    this.customTemplateContent = options.customTemplateContent;
    this.appendWidgetTo = options.appendWidgetTo;
    this.showWidgetOnAddonClick = options.showWidgetOnAddonClick;

    this._init();
  };

  Durationpicker.prototype = {

    constructor: Durationpicker,
    _init: function() {
      var self = this;

      if (this.showWidgetOnAddonClick && (this.$element.parent().hasClass('input-append') || this.$element.parent().hasClass('input-prepend') || this.$element.parent().hasClass('input-group'))) {
        this.$element.parent('.input-append, .input-prepend, .input-group').find('.input-group-text, .input-group-addon').on({
          'click.durationpicker': $.proxy(this.showWidget, this)
        });
        this.$element.on({
          'focus.durationpicker': $.proxy(this.highlightUnit, this),
          'click.durationpicker': $.proxy(this.highlightUnit, this),
          'keydown.durationpicker': $.proxy(this.elementKeydown, this),
          'blur.durationpicker': $.proxy(this.blurElement, this),
          'mousewheel.durationpicker DOMMouseScroll.durationpicker': $.proxy(this.mousewheel, this)
        });
      } else {
        if (this.template) {
          this.$element.on({
            'focus.durationpicker': $.proxy(this.showWidget, this),
            'click.durationpicker': $.proxy(this.showWidget, this),
            'blur.durationpicker': $.proxy(this.blurElement, this),
            'mousewheel.durationpicker DOMMouseScroll.durationpicker': $.proxy(this.mousewheel, this)
          });
        } else {
          this.$element.on({
            'focus.durationpicker': $.proxy(this.highlightUnit, this),
            'click.durationpicker': $.proxy(this.highlightUnit, this),
            'keydown.durationpicker': $.proxy(this.elementKeydown, this),
            'blur.durationpicker': $.proxy(this.blurElement, this),
            'mousewheel.durationpicker DOMMouseScroll.durationpicker': $.proxy(this.mousewheel, this)
          });
        }
      }

      if (this.template !== false) {
        this.$widget = $(this.getTemplate()).on('click', $.proxy(this.widgetClick, this));
      } else {
        this.$widget = false;
      }

      if (this.showInputs && this.$widget !== false) {
        this.$widget.find('input').each(function() {
          $(this).on({
            'click.durationpicker': function() { $(this).select(); },
            'keydown.durationpicker': $.proxy(self.widgetKeydown, self),
            'keyup.durationpicker': $.proxy(self.widgetKeyup, self)
          });
        });
      }

      this.setDefaultDuration(this.defaultDuration);
    },

    blurElement: function() {
      this.highlightedUnit = null;
      this.updateFromElementVal();
    },

    clear: function() {
      this.hour = '';
      this.minute = '';
      this.second = '';

      this.$element.val('');
    },

    decrementHour: function() {
      if (this.hour <= 0) {
        this.hour = 0;
      } else {
        this.hour--;
      }
    },

    decrementMinute: function(step) {
      var newVal;

      if (step) {
        newVal = this.minute - step;
      } else {
        newVal = this.minute - this.minuteStep;
      }

      if (newVal < 0) {
        this.decrementHour();
        this.minute = newVal + 60;
      } else {
        this.minute = newVal;
      }
    },

    decrementSecond: function() {
      var newVal = this.second - this.secondStep;

      if (newVal < 0) {
        this.decrementMinute(true);
        this.second = newVal + 60;
      } else {
        this.second = newVal;
      }
    },

    elementKeydown: function(e) {
      switch (e.keyCode) {
      case 9: //tab
      case 27: // escape
        this.updateFromElementVal();
        break;
      case 37: // left arrow
        e.preventDefault();
        this.highlightPrevUnit();
        break;
      case 38: // up arrow
        e.preventDefault();
        switch (this.highlightedUnit) {
        case 'hour':
          this.incrementHour();
          this.highlightHour();
          break;
        case 'minute':
          this.incrementMinute();
          this.highlightMinute();
          break;
        case 'second':
          this.incrementSecond();
          this.highlightSecond();
          break;
        }
        this.update();
        break;
      case 39: // right arrow
        e.preventDefault();
        this.highlightNextUnit();
        break;
      case 40: // down arrow
        e.preventDefault();
        switch (this.highlightedUnit) {
        case 'hour':
          this.decrementHour();
          this.highlightHour();
          break;
        case 'minute':
          this.decrementMinute();
          this.highlightMinute();
          break;
        case 'second':
          this.decrementSecond();
          this.highlightSecond();
          break;
        }

        this.update();
        break;
      }
    },

    getCursorPosition: function() {
      var input = this.$element.get(0);

      if ('selectionStart' in input) {// Standard-compliant browsers

        return input.selectionStart;
      } else if (document.selection) {// IE fix
        input.focus();
        var sel = document.selection.createRange(),
          selLen = document.selection.createRange().text.length;

        sel.moveStart('character', - input.value.length);

        return sel.text.length - selLen;
      }
    },

    getTemplate: function() {
      var template,
        hourTemplate,
        minuteTemplate,
        secondTemplate,
        templateContent;

      if (this.showInputs) {
        hourTemplate = '<input type="text" class="bootstrap-durationpicker-hour" maxlength="3"/>';
        minuteTemplate = '<input type="text" class="bootstrap-durationpicker-minute" maxlength="2"/>';
        secondTemplate = '<input type="text" class="bootstrap-durationpicker-second" maxlength="2"/>';
      } else {
        hourTemplate = '<span class="bootstrap-durationpicker-hour"></span>';
        minuteTemplate = '<span class="bootstrap-durationpicker-minute"></span>';
        secondTemplate = '<span class="bootstrap-durationpicker-second"></span>';
      }

      templateContent = (this.customTemplateContent !== false) ? this.customTemplateContent : '<table>'+
         '<tr>'+
           '<td><a href="#" data-action="incrementHour"><i class="bi bi-chevron-up"></i></a></td>'+
           '<td class="separator">&nbsp;</td>'+
           '<td><a href="#" data-action="incrementMinute"><i class="bi bi-chevron-up"></i></a></td>'+
           (this.showSeconds ?
             '<td class="separator">&nbsp;</td>'+
             '<td><a href="#" data-action="incrementSecond"><i class="bi bi-chevron-up"></i></a></td>'
           : '') +
         '</tr>'+
         '<tr>'+
           '<td>'+ hourTemplate +'</td> '+
           '<td class="separator">:</td>'+
           '<td>'+ minuteTemplate +'</td> '+
           (this.showSeconds ?
            '<td class="separator">:</td>'+
            '<td>'+ secondTemplate +'</td>'
           : '') +
         '</tr>'+
         '<tr>'+
           '<td><a href="#" data-action="decrementHour"><i class="bi bi-chevron-down"></i></a></td>'+
           '<td class="separator"></td>'+
           '<td><a href="#" data-action="decrementMinute"><i class="bi bi-chevron-down"></i></a></td>'+
           (this.showSeconds ?
            '<td class="separator">&nbsp;</td>'+
            '<td><a href="#" data-action="decrementSecond"><i class="bi bi-chevron-down"></i></a></td>'
           : '') +
         '</tr>'+
       '</table>';

      switch(this.template) {
      case 'modal':
        template = '<div class="bootstrap-durationpicker-widget modal hide fade in" data-backdrop="'+ (this.modalBackdrop ? 'true' : 'false') +'">'+
          '<div class="modal-header">'+
            '<a href="#" class="close" data-dismiss="modal">×</a>'+
            '<h3>Pick a Duration</h3>'+
          '</div>'+
          '<div class="modal-content">'+
            templateContent +
          '</div>'+
          '<div class="modal-footer">'+
            '<a href="#" class="btn btn-primary" data-dismiss="modal">OK</a>'+
          '</div>'+
        '</div>';
        break;
      case 'dropdown':
        template = '<div class="bootstrap-durationpicker-widget dropdown-menu">'+ templateContent +'</div>';
        break;
      }

      return template;
    },

    getDuration: function() {
      if (this.hour === '') {
        return '';
      }

      return (this.hour.toString().length === 1 ? '0' + this.hour : this.hour) + ':' + (this.minute.toString().length === 1 ? '0' + this.minute : this.minute) + (this.showSeconds ? ':' + (this.second.toString().length === 1 ? '0' + this.second : this.second) : '');
    },

    hideWidget: function() {
      if (this.isOpen === false) {
        return;
      }

      this.$element.trigger({
        'type': 'hide.durationpicker',
        'duration': {
          'value': this.getDuration(),
          'hours': this.hour,
          'minutes': this.minute,
          'seconds': this.second,
        }
      });

      if (this.template === 'modal' && this.$widget.modal) {
        this.$widget.modal('hide');
      } else {
        this.$widget.removeClass('open');
      }

      $(document).off('mousedown.durationpicker, touchend.durationpicker');

      this.isOpen = false;
      // show/hide approach taken by datepicker
      this.$widget.detach();
    },

    highlightUnit: function() {
      var hourLength = 2;
      if (this.hour >= 100) {
        hourLength = 3;
      }

      this.position = this.getCursorPosition();
      if (this.position >= 0 && this.position <= hourLength) {
        this.highlightHour();
      } else if (this.position >= hourLength+1 && this.position <= hourLength+3) {
        this.highlightMinute();
      } else if (this.position >= hourLength+4 && this.position <= hourLength+6) {
        if (this.showSeconds) {
          this.highlightSecond();
        }
      }
    },

    highlightNextUnit: function() {
      switch (this.highlightedUnit) {
      case 'hour':
        this.highlightMinute();
        break;
      case 'minute':
        if (this.showSeconds) {
          this.highlightSecond();
        } else {
          this.highlightHour();
        }
        break;
      case 'second':
          this.highlightHour();
        break;
      }
    },

    highlightPrevUnit: function() {
      switch (this.highlightedUnit) {
      case 'hour':
        if (this.showSeconds) {
          this.highlightSecond();
        } else {
          this.highlightMinute();
        }
        break;
      case 'minute':
        this.highlightHour();
        break;
      case 'second':
        this.highlightMinute();
        break;
      }
    },

    highlightHour: function() {
      var $element = this.$element.get(0),
          self = this;

      this.highlightedUnit = 'hour';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          if (self.hour >= 100) {
            $element.setSelectionRange(0,3);
          } else {
            $element.setSelectionRange(0,2);
          }
        }, 0);
      }
    },

    highlightMinute: function() {
      var $element = this.$element.get(0),
          self = this;

      this.highlightedUnit = 'minute';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          if (self.hour >= 100) {
            $element.setSelectionRange(4,6);
          } else {
            $element.setSelectionRange(3,5);
          }
        }, 0);
      }
    },

    highlightSecond: function() {
      var $element = this.$element.get(0),
          self = this;

      this.highlightedUnit = 'second';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          if (self.hour >= 100) {
            $element.setSelectionRange(7,9);
          } else {
            $element.setSelectionRange(6,8);
          }
        }, 0);
      }
    },

    incrementHour: function() {
      this.hour++;
    },

    incrementMinute: function(step) {
      var newVal;

      if (step) {
        newVal = this.minute + step;
      } else {
        newVal = this.minute + this.minuteStep - (this.minute % this.minuteStep);
      }

      if (newVal > 59) {
        this.incrementHour();
        this.minute = newVal - 60;
      } else {
        this.minute = newVal;
      }
    },

    incrementSecond: function() {
      var newVal = this.second + this.secondStep - (this.second % this.secondStep);

      if (newVal > 59) {
        this.incrementMinute(true);
        this.second = newVal - 60;
      } else {
        this.second = newVal;
      }
    },

    mousewheel: function(e) {
      if (this.disableMousewheel) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail,
          scrollTo = null;

      if (e.type === 'mousewheel') {
        scrollTo = (e.originalEvent.wheelDelta * -1);
      }
      else if (e.type === 'DOMMouseScroll') {
        scrollTo = 40 * e.originalEvent.detail;
      }

      if (scrollTo) {
        e.preventDefault();
        $(this).scrollTop(scrollTo + $(this).scrollTop());
      }

      switch (this.highlightedUnit) {
      case 'minute':
        if (delta > 0) {
          this.incrementMinute();
        } else {
          this.decrementMinute();
        }
        this.highlightMinute();
        break;
      case 'second':
        if (delta > 0) {
          this.incrementSecond();
        } else {
          this.decrementSecond();
        }
        this.highlightSecond();
        break;
      default:
        if (delta > 0) {
          this.incrementHour();
        } else {
          this.decrementHour();
        }
        this.highlightHour();
        break;
      }

      return false;
    },

    // This method was adapted from bootstrap-datepicker.
    place : function() {
      if (this.isInline) {
        return;
      }
      var widgetWidth = this.$widget.outerWidth(), widgetHeight = this.$widget.outerHeight(), visualPadding = 10, windowWidth =
        $(window).width(), windowHeight = $(window).height(), scrollTop = $(window).scrollTop();

      var zIndex = parseInt(this.$element.parents().filter(function() {}).first().css('z-index'), 10) + 10;
      var offset = this.component ? this.component.parent().offset() : this.$element.offset();
      var height = this.component ? this.component.outerHeight(true) : this.$element.outerHeight(false);
      var width = this.component ? this.component.outerWidth(true) : this.$element.outerWidth(false);
      var left = offset.left, top = offset.top;

      this.$widget.removeClass('durationpicker-orient-top durationpicker-orient-bottom durationpicker-orient-right durationpicker-orient-left');

      if (this.orientation.x !== 'auto') {
        this.picker.addClass('datepicker-orient-' + this.orientation.x);
        if (this.orientation.x === 'right') {
          left -= widgetWidth - width;
        }
      } else{
        // auto x orientation is best-placement: if it crosses a window edge, fudge it sideways
        // Default to left
        this.$widget.addClass('durationpicker-orient-left');
        if (offset.left < 0) {
          left -= offset.left - visualPadding;
        } else if (offset.left + widgetWidth > windowWidth) {
          left = windowWidth - widgetWidth - visualPadding;
        }
      }
      // auto y orientation is best-situation: top or bottom, no fudging, decision based on which shows more of the widget
      var yorient = this.orientation.y, topOverflow, bottomOverflow;
      if (yorient === 'auto') {
        topOverflow = -scrollTop + offset.top - widgetHeight;
        bottomOverflow = scrollTop + windowHeight - (offset.top + height + widgetHeight);
        if (Math.max(topOverflow, bottomOverflow) === bottomOverflow) {
          yorient = 'top';
        } else {
          yorient = 'bottom';
        }
      }
      this.$widget.addClass('durationpicker-orient-' + yorient);
      if (yorient === 'top'){
        top += height;
      } else{
        top -= widgetHeight + parseInt(this.$widget.css('padding-top'), 10);
      }

      this.$widget.css({
        top : top,
        left : left,
        zIndex : zIndex
      });
    },

    remove: function() {
      $('document').off('.durationpicker');
      if (this.$widget) {
        this.$widget.remove();
      }
      delete this.$element.data().durationpicker;
    },

    setDefaultDuration: function(defaultDuration) {
      if (!this.$element.val()) {
        if (defaultDuration === false) {
          this.hour = 0;
          this.minute = 0;
          this.second = 0;
        } else {
          this.setDuration(defaultDuration);
        }
      } else {
        this.updateFromElementVal();
      }
    },

    setDuration: function(duration, ignoreWidget) {
      if (!duration) {
        this.clear();
        return;
      }

      var durationArray,
          hour,
          minute,
          second;

      duration = duration.replace(/[^0-9\:]/g, '');

      durationArray = duration.split(':');

      hour = durationArray[0] ? durationArray[0].toString() : durationArray.toString();
      minute = durationArray[1] ? durationArray[1].toString() : '';
      second = durationArray[2] ? durationArray[2].toString() : '';

      hour = parseInt(hour, 10);
      minute = parseInt(minute, 10);
      second = parseInt(second, 10);

      if (isNaN(hour)) {
        hour = 0;
      }
      if (isNaN(minute)) {
        minute = 0;
      }
      if (isNaN(second)) {
        second = 0;
      }

      if (hour < 0) {
        hour = 0;
      }

      if (minute < 0) {
        minute = 0;
      } else if (minute >= 60) {
        minute = 59;
      }

      if (this.showSeconds) {
        if (isNaN(second)) {
        second = 0;
        } else if (second < 0) {
        second = 0;
        } else if (second >= 60) {
         second = 59;
        }
      }

      this.hour = hour;
      this.minute = minute;
      this.second = second;

      this.update(ignoreWidget);
    },

    showWidget: function() {
      if (this.isOpen) {
        return;
      }

      if (this.$element.is(':disabled')) {
        return;
      }

      // show/hide approach taken by datepicker
      this.$widget.appendTo(this.appendWidgetTo);
      var self = this;
      $(document).on('mousedown.durationpicker, touchend.durationpicker', function (e) {
        // This condition was inspired by bootstrap-datepicker.
        // The element the durationpicker is invoked on is the input but it has a sibling for addon/button.
        if (!(self.$element.parent().find(e.target).length ||
            self.$widget.is(e.target) ||
            self.$widget.find(e.target).length)) {
          self.hideWidget();
        }
      });

      this.$element.trigger({
        'type': 'show.durationpicker',
        'duration': {
          'value': this.getDuration(),
          'hours': this.hour,
          'minutes': this.minute,
          'seconds': this.second
        }
      });

      this.place();
      if (this.disableFocus) {
        this.$element.blur();
      }

      // widget shouldn't be empty on open
      if (this.hour === '') {
        if (this.defaultDuration) {
          this.setDefaultDuration(this.defaultDuration);
        } else {
          this.setDuration('0:0:0');
        }
      }

      if (this.template === 'modal' && this.$widget.modal) {
        this.$widget.modal('show').on('hidden', $.proxy(this.hideWidget, this));
      } else {
        if (this.isOpen === false) {
          this.$widget.addClass('open');
        }
      }

      this.isOpen = true;
    },

    update: function(ignoreWidget) {
      this.updateElement();
      if (!ignoreWidget) {
        this.updateWidget();
      }

      this.$element.trigger({
        'type': 'changeDuration.durationpicker',
        'duration': {
          'value': this.getDuration(),
          'hours': this.hour,
          'minutes': this.minute,
          'seconds': this.second
        }
      });
    },

    updateElement: function() {
      this.$element.val(this.getDuration()).change();
    },

    updateFromElementVal: function() {
      this.setDuration(this.$element.val());
    },

    updateWidget: function() {
      if (this.$widget === false) {
        return;
      }

      var hour = this.hour.toString().length === 1 ? '0' + this.hour : this.hour,
          minute = this.minute.toString().length === 1 ? '0' + this.minute : this.minute,
          second = this.second.toString().length === 1 ? '0' + this.second : this.second;

      if (this.showInputs) {
        this.$widget.find('input.bootstrap-durationpicker-hour').val(hour);
        this.$widget.find('input.bootstrap-durationpicker-minute').val(minute);

        if (this.showSeconds) {
          this.$widget.find('input.bootstrap-durationpicker-second').val(second);
        }
      } else {
        this.$widget.find('span.bootstrap-durationpicker-hour').text(hour);
        this.$widget.find('span.bootstrap-durationpicker-minute').text(minute);

        if (this.showSeconds) {
          this.$widget.find('span.bootstrap-durationpicker-second').text(second);
        }
      }
    },

    updateFromWidgetInputs: function() {
      if (this.$widget === false) {
        return;
      }

      var t = this.$widget.find('input.bootstrap-durationpicker-hour').val() + ':' +
              this.$widget.find('input.bootstrap-durationpicker-minute').val() +
              (this.showSeconds ? ':' + this.$widget.find('input.bootstrap-durationpicker-second').val() : '')
      ;

      this.setDuration(t, true);
    },

    widgetClick: function(e) {
      e.stopPropagation();
      e.preventDefault();

      var $input = $(e.target),
          action = $input.closest('a').data('action');

      if (action) {
        this[action]();
      }
      this.update();
      if ($input.is('input')) {
        if ($input.get(0).setSelectionRange) {
          $input.get(0).setSelectionRange(0, $input.val().length);
        }
      }
    },

    widgetKeydown: function(e) {
      var $input = $(e.target),
          name = $input.attr('class').replace('bootstrap-durationpicker-', '');

      switch (e.keyCode) {
      case 9: //tab
        if ((this.showSeconds && name === 'second') || (!this.showSeconds && name === 'minute')) {
          return this.hideWidget();
        }
        break;
      case 27: // escape
        this.hideWidget();
        break;
      case 38: // up arrow
        e.preventDefault();
        switch (name) {
        case 'hour':
          this.incrementHour();
          break;
        case 'minute':
          this.incrementMinute();
          break;
        case 'second':
          this.incrementSecond();
          break;
        }
        this.setDuration(this.getDuration());
        if ($input.get(0).setSelectionRange) {
          $input.get(0).setSelectionRange(0, $input.val().length);
        }
        break;
      case 40: // down arrow
        e.preventDefault();
        switch (name) {
        case 'hour':
          this.decrementHour();
          break;
        case 'minute':
          this.decrementMinute();
          break;
        case 'second':
          this.decrementSecond();
          break;
        }
        this.setDuration(this.getDuration());
        if ($input.get(0).setSelectionRange) {
          $input.get(0).setSelectionRange(0, $input.val().length);
        }
        break;
      }
    },

    widgetKeyup: function(e) {
      if ((e.keyCode === 65) || (e.keyCode === 77) || (e.keyCode === 80) || (e.keyCode === 46) || (e.keyCode === 8) || (e.keyCode >= 46 && e.keyCode <= 57)) {
        this.updateFromWidgetInputs();
      }
    }
  };

  //DURATIONPICKER PLUGIN DEFINITION
  $.fn.durationpicker = function(option) {
    var args = Array.apply(null, arguments);
    args.shift();
    return this.each(function() {
      var $this = $(this),
        data = $this.data('durationpicker'),
        options = typeof option === 'object' && option;

      if (!data) {
        $this.data('durationpicker', (data = new Durationpicker(this, $.extend({}, $.fn.durationpicker.defaults, options, $(this).data()))));
      }

      if (typeof option === 'string') {
        data[option].apply(data, args);
      }
    });
  };

  $.fn.durationpicker.defaults = {
    defaultDuration: false,
    disableFocus: false,
    disableMousewheel: false,
    isOpen: false,
    minuteStep: 10,
    modalBackdrop: false,
    orientation: { x: 'auto', y: 'auto'},
    secondStep: 15,
    showSeconds: false,
    showInputs: true,
    template: 'dropdown',
    customTemplateContent: false,
    appendWidgetTo: 'body',
    showWidgetOnAddonClick: true
  };

  $.fn.durationpicker.Constructor = Durationpicker;

})(jQuery, window, document);