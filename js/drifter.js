// Generated by CoffeeScript 1.6.2
/*

1. Give an object and a config...
    - parent: bounding box for animations to be placed in
    - points: collection of points (?)
    - transition: type of transition between points (rigid, smooth, somewhere in between)
    - showEffect: show effect
    - hideEffect: hide effect
    - onShow
    - onHide
    - onStart
    - onComplete
*/

var Drifter,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Drifter = (function() {
  function Drifter(el, options) {
    this.hide = __bind(this.hide, this);
    this.show = __bind(this.show, this);
    var _ref;

    this.el = $(el);
    this.defaults = {
      divisionPercentage: 0.02,
      effectPace: 35,
      varianceChance: 50,
      varianceBoundary: 25,
      delayPlacement: true,
      showEffect: false,
      hideEffect: false,
      onShow: function(el, remaining) {},
      onHide: function(el) {},
      onComplete: function(el) {
        return console.log("Drifter complete");
      }
    };
    this.clones = [];
    this.startPosition = this.el.position();
    _ref = $.extend(this.defaults, this.effect(options.effect), options), this.divisionPercentage = _ref.divisionPercentage, this.effectPace = _ref.effectPace, this.varianceChance = _ref.varianceChance, this.varianceBoundary = _ref.varianceBoundary, this.parent = _ref.parent, this.end = _ref.end, this.transition = _ref.transition, this.showEffect = _ref.showEffect, this.hideEffect = _ref.hideEffect, this.onReady = _ref.onReady, this.onShow = _ref.onShow, this.onHide = _ref.onHide, this.onStart = _ref.onStart, this.onComplete = _ref.onComplete, this.delayPlacement = _ref.delayPlacement;
    this.varianceFuncs = [this._addVarianceNo, this._addVarianceYes];
    if (!this.delayPlacement) {
      this.amount = 0;
      while (this.amount < 1) {
        this.placeAll();
      }
    }
  }

  /* Showing elements
  */


  Drifter.prototype.start = function() {
    if (this.delayPlacement) {
      this.amount = 0;
      while (this.amount < 1) {
        this.placeAll();
      }
    }
    this.startPosition = this.el.position();
    this._clones = this.clones.slice(0);
    this.show();
    return this.timer = setInterval(this.show, this.effectPace);
  };

  Drifter.prototype.show = function() {
    var clone,
      _this = this;

    clone = this._clones.shift();
    if (clone) {
      if ($.isFunction(this.showEffect)) {
        this.showEffect.apply(this, clone);
        return clone.promise().done(this.onShow(clone, this._clones.length));
      } else {
        return clone.show();
      }
    } else {
      clearInterval(this.timer);
      return $('.drifter').promise().done((function() {
        return _this.onComplete();
      })());
    }
  };

  Drifter.prototype.hide = function(clone) {
    if (clone) {
      if ($.isFunction(this.hideEffect)) {
        this.hideEffect.apply(this, clone);
        return clone.promise().done(this.onHide(clone));
      } else {
        return clone.hide();
      }
    }
  };

  /* Placing of objects before showing them
  */


  Drifter.prototype.placeAll = function() {
    var deltaX, deltaY;

    this.amount += this.divisionPercentage;
    if (this.amount > 1) {
      this.amount = 1;
    }
    deltaX = this.lerp(this.startPosition.left, this.end.left, this.amount);
    deltaY = this.lerp(this.startPosition.top, this.end.top, this.amount);
    if (this.varianceChance === 0 || this.amount === 1) {
      this.placeOne(deltaX, deltaY);
    } else {
      this.placeOneWithVariance(deltaX, deltaY);
    }
    if (this.amount === 1 && deltaY !== this.end.top) {
      return this.placeOne(deltaX, deltaY);
    }
  };

  Drifter.prototype.placeOne = function(posX, posY, className) {
    var clone;

    clone = this.el.clone().hide();
    this.clones.push(clone);
    clone.removeClass('variance');
    if (className) {
      clone.addClass(className);
    }
    clone.addClass('drifter clone-' + this.clones.length);
    clone.removeAttr("id");
    return clone.css({
      'top': posY + 'px',
      'left': posX + 'px'
    }).appendTo(this.parent);
  };

  Drifter.prototype.placeOneWithVariance = function(posX, posY) {
    var evenX, evenY, newPosX, newPosY, randomNumber, varianceX, varianceY;

    randomNumber = Math.random() * 100;
    if (randomNumber > this.varianceChance) {
      return this.placeOne(posX, posY);
    }
    evenX = randomNumber % 2;
    evenY = Math.floor(Math.random() * 100) % 2;
    varianceX = Math.floor((Math.random() * this.currentVarianceBoundary()) + 1);
    varianceY = Math.floor((Math.random() * this.currentVarianceBoundary()) + 1);
    if (evenX) {
      newPosX = posX + varianceX;
    } else {
      newPosX = posX - varianceX;
    }
    if (evenY) {
      newPosY = posY + varianceY;
    } else {
      newPosY = posY - varianceY;
    }
    return this.placeOne(newPosX, newPosY, 'variance');
  };

  Drifter.prototype.currentVarianceBoundary = function() {
    if (this.amount < 0.5) {
      return this.amount * (this.varianceBoundary * 2);
    } else {
      return (1 - this.amount) * (this.varianceBoundary * 2);
    }
  };

  Drifter.prototype.lerp = function(val1, val2, amt) {
    return (val2 - val1) * amt + val1;
  };

  Drifter.prototype.effect = function(effect) {
    switch (effect) {
      case "baloon":
        return {
          varianceChance: 100,
          divisionPercentage: 0.15,
          effectPace: 800,
          varianceBoundary: 75,
          showEffect: function(el) {
            return $(el).fadeIn(800);
          },
          hideEffect: function(el) {
            return $(el).fadeOut(800);
          },
          onShow: function(el, remaining) {
            var _this = this;

            if (remaining >= 1) {
              return setTimeout(function() {
                return _this.hide(el);
              }, 1500);
            }
          }
        };
      case "speedy_trails":
        return {
          varianceChance: 0,
          divisionPercentage: 0.02,
          effectPace: 10,
          showEffect: function(el) {
            return $(el).fadeIn(300);
          },
          hideEffect: function(el) {
            return $(el).fadeOut(300);
          },
          onShow: function(el, remaining) {
            return this.hide(el);
          }
        };
      default:
        return {};
    }
  };

  return Drifter;

})();
