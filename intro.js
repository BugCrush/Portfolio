function InteractiveParticles(canvas, args){
    var that = this;
    this.canvas = canvas;
    this.args = args;
    this.density = 1;
    this.produceDistance = 2;
    this.baseRadius = 2.377;
    this.reactionSensitivity = 5;
    this.particleRecessSpeed = 0.3;
    this.canvasPadding = 70
    this.ignoreColors = [];
    this.particles = [];
    this.mouse = {
        x: -1000,
        y: -1000,
        down: true
    };
    this.animation = null;
    this.context = null;
    this.bgImage = null;
    this.bgCanvas = null;
    this.bgContext = null;
    this.bgContextPixelData = null;
  
    for (var key in args) {
      this[key] = args[key];
    }
  
    this.add = function() {
        that.context = that.canvas.getContext('2d', { alpha: true });
  
        if(that.size.length){
          that.canvas.width = that.size[0] + (that.canvasPadding*2);
          that.canvas.height = that.size[1] + (that.canvasPadding*2);
        }else{
          that.canvas.width = that.canvas.clientWidth + (that.canvasPadding*2);
          that.canvas.height = that.canvas.clientHeight + (that.canvasPadding*2);
        }
  
        that.canvas.style.display = 'block'
        that.canvas.addEventListener('mousemove', that.pointerMove, false);
        that.canvas.addEventListener('mouseout', that.pointerOut, false);
        that.canvas.addEventListener('touchstart', that.pointerMove, false);
        that.canvas.addEventListener('ontouchend', that.pointerOut, false);
  
        window.onresize = function(event) {
          if(that.size.length){
            that.canvas.width = that.size[0];
            that.canvas.height = that.size[1];
          }else{
            that.canvas.width = that.canvas.clientWidth;
            that.canvas.height = that.canvas.clientHeight;
          }
          that.onWindowResize();
        }
  
        that.getImageData(that.image);
    };
  
    this.makeParticles = function() {
        // remove the current particles
        that.particles = [];
        var width, height, i, j;
        var colors = that.bgContextPixelData.data;
  
        for (i = 0; i < that.canvas.height; i += that.density) {
  
            for (j = 0; j < that.canvas.width; j += that.density) {
  
  
                var pixelPosition = (j + i * that.bgContextPixelData.width) * 4;
  
                var ignoreColor = false;
                if(that.ignoreColors.length){
                    for (var ckey in that.ignoreColors){
                        if (colors[pixelPosition] == that.ignoreColors[ckey][0] && (colors[pixelPosition + 1]) == that.ignoreColors[ckey][1] && (colors[pixelPosition + 2]) == that.ignoreColors[ckey][2]) {
                            ignoreColor = true;
                        }
                    }
                    if(ignoreColor) continue;
                }
  
                var color = 'rgba(' + colors[pixelPosition] + ',' + colors[pixelPosition + 1] + ',' + colors[pixelPosition + 2] + ',' + '1)';
                that.particles.push({
                    x: j,
                    y: i,
                    originalX: j,
                    originalY: i,
                    color: color
                });
            }
        }
    };
  
    this.updateparticles = function() {
  
        var i, currentPoint, theta, distance;
  
        for (i = 0; i < that.particles.length; i++) {
  
            currentPoint = that.particles[i];
  
            theta = Math.atan2(currentPoint.y - that.mouse.y, currentPoint.x - that.mouse.x);
  
            if (that.mouse.down) {
                distance = that.reactionSensitivity * 200 / Math.sqrt((that.mouse.x - currentPoint.x) * (that.mouse.x - currentPoint.x) +
                    (that.mouse.y - currentPoint.y) * (that.mouse.y - currentPoint.y));
            } else {
                distance = that.reactionSensitivity * 100 / Math.sqrt((that.mouse.x - currentPoint.x) * (that.mouse.x - currentPoint.x) +
                    (that.mouse.y - currentPoint.y) * (that.mouse.y - currentPoint.y));
            }
  
  
            currentPoint.x += Math.cos(theta) * distance + (currentPoint.originalX - currentPoint.x) * that.particleRecessSpeed;
            currentPoint.y += Math.sin(theta) * distance + (currentPoint.originalY - currentPoint.y) * that.particleRecessSpeed;
  
        }
    };
  
    this.produceparticles = function() {
  
        var i, currentPoint;
  
        for (i = 0; i < that.particles.length; i++) {
  
            currentPoint = that.particles[i];
  
            // produce the dot.
            that.context.fillStyle = currentPoint.color;
            that.context.strokeStyle = currentPoint.color;
  
            that.context.beginPath();
            that.context.arc(currentPoint.x, currentPoint.y, that.baseRadius, 0, Math.PI * 2, true);
            that.context.closePath();
            that.context.fill();
  
        }
    };
  
    this.produce = function() {
        that.animation = requestAnimationFrame(function() {
            that.produce()
        });
  
        that.remove();
        that.updateparticles();
        that.produceparticles();
  
    };
  
    this.remove = function() {
      that.canvas.width = that.canvas.width;
    };
  
    this.getImageData = function(data) {
  
      that.bgImage = new Image;
      that.bgImage.src = data;
  
      that.bgImage.onload = function() {
  
          that.produceInteractiveParticles();
      }
    };
  
    this.produceInteractiveParticles = function() {
  
      that.bgCanvas = document.createElement('canvas');
      that.bgCanvas.width = that.canvas.width;
      that.bgCanvas.height = that.canvas.height;
  
        var newWidth, newHeight;
  
            newWidth = that.bgImage.width;
            newHeight = that.bgImage.height;
        
        that.bgContext = that.bgCanvas.getContext('2d', { alpha: false });
        that.bgContext.drawImage(that.bgImage, Math.round((that.canvas.width - newWidth) / 2), Math.round((that.canvas.height - newHeight) / 2), Math.round(newWidth), Math.round(newHeight));
        that.bgContextPixelData = that.bgContext.getImageData(0, 0, Math.round(that.bgCanvas.width), Math.round(that.bgCanvas.height));
  
        that.makeParticles();
        that.produce();
    };
  
    this.pointerMove = function(event) {
        that.mouse.x = event.offsetX || (event.layerX - that.canvas.offsetLeft);
        that.mouse.y = event.offsetY || (event.layerY - that.canvas.offsetTop);
    };
  
    this.pointerOut = function(event) {
        that.mouse.x = -1000;
        that.mouse.y = -1000;
        that.mouse.down = false;
    };
  
    this.onWindowResize = function() {
        cancelAnimationFrame(that.animation);
        that.produceInteractiveParticles();
    };
  
    this.add(this.canvas, this.args);
  }
  
  (function() {
    var dots = new InteractiveParticles(document.getElementById('dots'), {
      size: [800,170],
      density: 3,
      baseRadius: 1,
      ignoreColors: [
        [0,0,0]
      ],
      image: "data:image/png;base64,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"
    });
  })();