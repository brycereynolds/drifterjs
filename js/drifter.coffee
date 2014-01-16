###

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

###
# log = do () -> console.log arguments

class Drifter
  constructor: (el, options) ->
    @el = $(el)

    @defaults =
      # Configs
      divisionPercentage: 0.02
      effectPace: 35

      # 1 - 100 the amount of variance between placements
      varianceChance: 50

      # Outer boundaries for distance variance will have (in pixels)
      varianceBoundary: 25

      # When a lot of elements need to be cloned it may be wise to
      # clone them at initialization instead of when the animation
      # starts
      delayPlacement: true

      # By default we do not provide a fancy show or hide effect
      showEffect: false
      hideEffect: false

      # By default we do nothing after an element is shown or hidden
      onShow: (el, remaining) ->
      onHide: (el) ->
      onComplete: (el) -> console.log("Drifter complete")

    # All of our cloned elements
    @clones = []

    # Positions
    @startPosition = @el.position()

    # Take the options passed by into constructor
    # and apply to our Drifter class. Defaults are
    # overridden via $.extend
    {
      @divisionPercentage
      @effectPace
      @varianceChance
      @varianceBoundary
      @parent
      @end
      @transition
      @showEffect
      @hideEffect
      @onReady
      @onShow
      @onHide
      @onStart
      @onComplete
      @delayPlacement
    } = $.extend(@defaults, @effect(options.effect), options)


    @varianceFuncs = [@_addVarianceNo, @_addVarianceYes]

    if not @delayPlacement
      @amount = 0;
      while @amount < 1 then @placeAll()


  ### Showing elements ###

  start: ->

    # Place elements - this may be delayed using delayPlacement
    if @delayPlacement
      @amount = 0;
      while @amount < 1 then @placeAll()

    @startPosition = @el.position()
    @_clones = @clones.slice(0)

    # Immediately start the effect then follow with
    # an interval based no our desired effectPace
    @show()

    @timer = setInterval @show, @effectPace

  # When an element is shown we trigger the show effect
  # and then once all fx are done on that element we
  # trigger the onShow event
  show: =>
    clone = @_clones.shift()
    if clone

      if $.isFunction(@showEffect)
        @showEffect.apply(@, clone );
        clone.promise().done(@onShow(clone, @_clones.length));
      else
        clone.show()

    else
      clearInterval @timer
      $('.drifter').promise().done do () =>
        # $('.drifter').remove()
        @onComplete()

  # When an element is hidden it will trigger the hideEffect
  # function and once all fx are done on that element then 
  # the onHide function is triggered
  hide: (clone) =>
    if clone
      if $.isFunction(@hideEffect)
        @hideEffect.apply(@, clone );
        clone.promise().done(@onHide(clone));
      else
        clone.hide()

  ### Placing of objects before showing them ###

  placeAll: () ->
    @amount += @divisionPercentage;
    @amount = 1 if @amount > 1

    # Find new position
    deltaX = @lerp(@startPosition.left, @end.left, @amount)
    deltaY = @lerp(@startPosition.top, @end.top, @amount)

    if @varianceChance == 0 || @amount == 1
      @placeOne(deltaX, deltaY)
    else
      @placeOneWithVariance(deltaX, deltaY)

    # If we are at the end and have not placed an item on our final spot place it
    # always placed without variance
    if @amount == 1 and deltaY != @end.top
      @placeOne(deltaX, deltaY)

  placeOne: (posX, posY, className) ->
    # Position element at new spot
    clone = @el.clone().hide()
    @clones.push clone

    # Always remove this class
    clone.removeClass('variance')

    if className then clone.addClass(className)
    clone.addClass('drifter clone-' + @clones.length)
    clone.removeAttr("id")
    clone.css({'top': posY + 'px', 'left': posX + 'px'}).appendTo(@parent)

  placeOneWithVariance: (posX, posY) ->
    randomNumber = Math.random() * 100;

    # In the event our random number is greater than our variance allowance
    # then return a normally placed element (ie. variance is 70% then 30% of the items
    # will not be placed with variance)
    return @placeOne posX, posY if randomNumber > @varianceChance

    evenX = randomNumber % 2
    evenY = Math.floor(Math.random() * 100) % 2 # Rolling a new random for Y - further increasing the spread

    # Compute variance - keep in mind the limits user requested
    varianceX = Math.floor((Math.random() * @currentVarianceBoundary() ) + 1);
    varianceY = Math.floor((Math.random() * @currentVarianceBoundary() ) + 1);

    if evenX then newPosX = posX + varianceX else newPosX = posX - varianceX
    if evenY then newPosY = posY + varianceY else newPosY = posY - varianceY

    # Position element at new spot with variance
    @placeOne newPosX, newPosY, 'variance'

  currentVarianceBoundary: () ->
    if @amount < 0.5 then @amount * (@varianceBoundary * 2) else (1 - @amount) * (@varianceBoundary * 2)

  lerp: (val1, val2, amt) ->
    (val2 - val1) * amt + val1;



  # Prepackaged default effects - save the user some time with defaults
  effect: (effect) ->
    switch effect
      when "baloon"
        {
          varianceChance      : 100,
          divisionPercentage  : 0.15,
          effectPace  : 800,
          varianceBoundary : 75,
          showEffect: (el) -> $(el).fadeIn 800
          hideEffect: (el) -> $(el).fadeOut 800
          onShow: (el, remaining) ->
            if remaining >= 1
              setTimeout =>
                @hide el
              , 1500
        }
      when "speedy_trails"
        {
          varianceChance      : 0,
          divisionPercentage  : 0.02,
          effectPace  : 10,
          showEffect: (el) -> $(el).fadeIn 300
          hideEffect: (el) -> $(el).fadeOut 300
          onShow: (el, remaining) -> @hide el
        }
      else {}
