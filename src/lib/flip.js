const $ = document.querySelector,
	PI = Math.PI,
	A90 = PI/2

const flipMethods = {

	// Constructor

	init: function(opts) {

		if (opts.gradients) {
			opts.frontGradient = true;
			opts.backGradient = true;
		}

		this.data({f: {}});
		this.flip('options', opts);

		flipMethods._addPageWrapper.call(this);

		return this;
	},

	setData: function(d) {
		
		var data = this.data();

		data.f = $.extend(data.f, d);

		return this;
	},

	options: function(opts) {
		
		var data = this.data().f;

		if (opts) {
			flipMethods.setData.call(this, {opts: $.extend({}, data.opts || flipOptions, opts) });
			return this;
		} else
			return data.opts;

	},

	z: function(z) {

		var data = this.data().f;
		data.opts['z-index'] = z;
		data.fwrapper.css({'z-index': z || parseInt(data.parent.css('z-index'), 10) || 0});

		return this;
	},

	_cAllowed: function() {

		return corners[this.data().f.opts.corners] || this.data().f.opts.corners;

	},

	_cornerActivated: function(e) {
		if (e.originalEvent === undefined) {
			return false;
		}		

		e = (isTouch) ? e.originalEvent.touches : [e];

		var data = this.data().f,
			pos = data.parent.offset(),
			width = this.width(),
			height = this.height(),
			c = {x: Math.max(0, e[0].pageX-pos.left), y: Math.max(0, e[0].pageY-pos.top)},
			csz = data.opts.cornerSize,
			allowedCorners = flipMethods._cAllowed.call(this);

			if (c.x<=0 || c.y<=0 || c.x>=width || c.y>=height) return false;

			if (c.y<csz) c.corner = 't';
			else if (c.y>=height-csz) c.corner = 'b';
			else return false;
			
			if (c.x<=csz) c.corner+= 'l';
			else if (c.x>=width-csz) c.corner+= 'r';
			else return false;

		return ($.inArray(c.corner, allowedCorners)==-1) ? false : c;

	},

	_c: function(corner, opts) {

		opts = opts || 0;
		return ({tl: point2D(opts, opts),
				tr: point2D(this.width-opts, opts),
				bl: point2D(opts, this.height-opts),
				br: point2D(this.width-opts, this.height-opts)})[corner];

	},

	_c2: function(corner) {

		return {tl: point2D(this.width*2, 0),
				tr: point2D(-this.width, 0),
				bl: point2D(this.width*2, this.height),
				br: point2D(-this.width, this.height)}[corner];

	},

	_foldingPage: function(corner) {

		var opts = this.data().f.opts;
		
		if (opts.folding) return opts.folding;
		else if(opts.turn) {
			var data = opts.turn.data();
			if (data.display == 'single')
				return (data.pageObjs[opts.next]) ? data.pageObjs[0] : null;
			else
				return data.pageObjs[opts.next];
		}

	},

	_backGradient: function() {

		var data =	this.data().f,
			turn = data.opts.turn,
			gradient = data.opts.backGradient &&
						(!turn || turn.data().display=='single' || (data.opts.page!=2 && data.opts.page!=turn.data().totalPages-1) );


		if (gradient && !data.bshadow)
			data.bshadow = $('<div/>', divAtt(0, 0, 1)).
				css({'position': '', width: this.width(), height: this.height()}).
					appendTo(data.parent);

		return gradient;

	},

	resize: function(full) {
		
		var data = this.data().f,
			width = this.width(),
			height = this.height(),
			size = Math.round(Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2)));

		if (full) {
			data.wrapper.css({width: size, height: size});
			data.fwrapper.css({width: size, height: size}).
				children(':first-child').
					css({width: width, height: height});

			data.fpage.css({width: height, height: width});

			if (data.opts.frontGradient)
				data.ashadow.css({width: height, height: width});

			if (flipMethods._backGradient.call(this))
				data.bshadow.css({width: width, height: height});
		}

		if (data.parent.is(':visible')) {
			data.fwrapper.css({top: data.parent.offset().top,
				left: data.parent.offset().left});

			if (data.opts.turn)
				data.fparent.css({top: -data.opts.turn.offset().top, left: -data.opts.turn.offset().left});
		}

		this.flip('z', data.opts['z-index']);

	},

	// Prepares the page by adding a general wrapper and another objects

	_addPageWrapper: function() {

		var att,
			data = this.data().f,
			parent = this.parent();

		if (!data.wrapper) {

			var left = this.css('left'),
				top = this.css('top'),
				width = this.width(),
				height = this.height(),
				size = Math.round(Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2)));
			
			data.parent = parent;
			data.fparent = (data.opts.turn) ? data.opts.turn.data().fparent : $('#turn-fwrappers');

			if (!data.fparent) {
				var fparent = $('<div/>', {css: {'pointer-events': 'none'}}).hide();
					fparent.data().flips = 0;

				if (data.opts.turn) {
					fparent.css(divAtt(-data.opts.turn.offset().top, -data.opts.turn.offset().left, 'auto', 'visible').css).
							appendTo(data.opts.turn);
					
					data.opts.turn.data().fparent = fparent;
				} else {
					fparent.css(divAtt(0, 0, 'auto', 'visible').css).
						attr('id', 'turn-fwrappers').
							appendTo($('body'));
				}

				data.fparent = fparent;
			}

			this.css({position: 'absolute', top: 0, left: 0, bottom: 'auto', right: 'auto'});

			data.wrapper = $('<div/>', divAtt(0, 0, this.css('z-index'))).
								appendTo(parent).
									prepend(this);

			data.fwrapper = $('<div/>', divAtt(parent.offset().top, parent.offset().left)).
								hide().
									appendTo(data.fparent);

			data.fpage = $('<div/>', {css: {cursor: 'default'}}).
					appendTo($('<div/>', divAtt(0, 0, 0, 'visible')).
								appendTo(data.fwrapper));

			if (data.opts.frontGradient)
				data.ashadow = $('<div/>', divAtt(0, 0,  1)).
					appendTo(data.fpage);

			// Save data

			flipMethods.setData.call(this, data);

			// Set size
			flipMethods.resize.call(this, true);
		}

	},

	// Takes a 2P point from the screen and applies the transformation

	_fold: function(point) {
		
		var that = this,
			a = 0,
			alpha = 0,
			beta,
			px,
			gradientEndPointA,
			gradientEndPointB,
			gradientStartV,
			gradientSize,
			gradientOpacity,
			mv = point2D(0, 0),
			df = point2D(0, 0),
			tr = point2D(0, 0),
			width = this.width,
			height = this.height,
			// folding = flipMethods._foldingPage.call(this),
			tan = Math.tan(alpha),
			// data = this.data().f,
			// ac = data.opts.acceleration,
			ac = true,
			h = this.height,
			o = flipMethods._c.call(this, point.corner),
			top = point.corner.substr(0, 1) == 't',
			left = point.corner.substr(1, 1) == 'l',

			compute = function() {
				var rel = point2D((o.x) ? o.x - point.x : point.x, (o.y) ? o.y - point.y : point.y),
					tan = (Math.atan2(rel.y, rel.x)),
					middle;

				alpha = A90 - tan;
				a = deg(alpha);
				middle = point2D((left) ? width - rel.x/2 : point.x + rel.x/2, rel.y/2);

				var gamma = alpha - Math.atan2(middle.y, middle.x),
					distance =  Math.max(0, Math.sin(gamma) * Math.sqrt(Math.pow(middle.x, 2) + Math.pow(middle.y, 2)));

					tr = point2D(distance * Math.sin(alpha), distance * Math.cos(alpha));

					if (alpha > A90) {
					
						tr.x = tr.x + Math.abs(tr.y * Math.tan(tan));
						tr.y = 0;

						if (Math.round(tr.x*Math.tan(PI-alpha)) < height) {

							point.y = Math.sqrt(Math.pow(height, 2)+2 * middle.x * rel.x);
							if (top) point.y =  height - point.y;
							return compute();

						}
					}
			
				if (alpha>A90) {
					var beta = PI-alpha, dd = h - height/Math.sin(beta);
					mv = point2D(Math.round(dd*Math.cos(beta)), Math.round(dd*Math.sin(beta)));
					if (left) mv.x = - mv.x;
					if (top) mv.y = - mv.y;
				}

				px = Math.round(tr.y/Math.tan(alpha) + tr.x);
			
				var side = width - px,
					sideX = side*Math.cos(alpha*2),
					sideY = side*Math.sin(alpha*2);
					df = point2D(Math.round( (left ? side -sideX : px+sideX)), Math.round((top) ? sideY : height - sideY));
					
				
				// GRADIENTS

					gradientSize = side*Math.sin(alpha);
						var endingPoint = flipMethods._c2.call(that, point.corner),
						far = Math.sqrt(Math.pow(endingPoint.x-point.x, 2)+Math.pow(endingPoint.y-point.y, 2));

					gradientOpacity = (far<width) ? far/width : 1;


				if (false && data.opts.frontGradient) {

					gradientStartV = gradientSize>100 ? (gradientSize-100)/gradientSize : 0;
					gradientEndPointA = point2D(gradientSize*Math.sin(A90-alpha)/height*100, gradientSize*Math.cos(A90-alpha)/width*100);
				
					if (top) gradientEndPointA.y = 100-gradientEndPointA.y;
					if (left) gradientEndPointA.x = 100-gradientEndPointA.x;
				}

				if (false && flipMethods._backGradient.call(that)) {

					gradientEndPointB = point2D(gradientSize*Math.sin(alpha)/width*100, gradientSize*Math.cos(alpha)/height*100);
					if (!left) gradientEndPointB.x = 100-gradientEndPointB.x;
					if (!top) gradientEndPointB.y = 100-gradientEndPointB.y;
				}
				//

				tr.x = Math.round(tr.x);
				tr.y = Math.round(tr.y);

				return true;
			},

			transform = function(tr, c, x, a) {
			
				var f = ['0', 'auto'], mvW = (width-h)*x[0]/100, mvH = (height-h)*x[1]/100,
					v = {left: f[c[0]], top: f[c[1]], right: f[c[2]], bottom: f[c[3]]},
					aliasingFk = (a!=90 && a!=-90) ? (left ? -1 : 1) : 0;

					x = x[0] + '% ' + x[1] + '%';

				// console.log(v);
				return;
				that.css(v).transform(rotate(a) + translate(tr.x + aliasingFk, tr.y, ac), x);

				data.fpage.parent().css(v);
				data.wrapper.transform(translate(-tr.x + mvW-aliasingFk, -tr.y + mvH, ac) + rotate(-a), x);

				data.fwrapper.transform(translate(-tr.x + mv.x + mvW, -tr.y + mv.y + mvH, ac) + rotate(-a), x);
				data.fpage.parent().transform(rotate(a) + translate(tr.x + df.x - mv.x, tr.y + df.y - mv.y, ac), x);

				if (data.opts.frontGradient)
					gradient(data.ashadow,
							point2D(left?100:0, top?100:0),
							point2D(gradientEndPointA.x, gradientEndPointA.y),
							[[gradientStartV, 'rgba(0,0,0,0)'],
							[((1-gradientStartV)*0.8)+gradientStartV, 'rgba(0,0,0,'+(0.2*gradientOpacity)+')'],
							[1, 'rgba(255,255,255,'+(0.2*gradientOpacity)+')']],
							3,
							alpha);
		
				if (flipMethods._backGradient.call(that))
					gradient(data.bshadow,
							point2D(left?0:100, top?0:100),
							point2D(gradientEndPointB.x, gradientEndPointB.y),
							[[0.8, 'rgba(0,0,0,0)'],
							[1, 'rgba(0,0,0,'+(0.3*gradientOpacity)+')'],
							[1, 'rgba(0,0,0,0)']],
							3);
				
			};

		switch (point.corner) {
			case 'tl' :
				point.x = Math.max(point.x, 1);
				compute();
				transform(tr, [1,0,0,1], [100, 0], a);
				data.fpage.transform(translate(-height, -width, ac) + rotate(90-a*2) , '100% 100%');
				folding.transform(rotate(90) + translate(0, -height, ac), '0% 0%');
			break;
			case 'tr' :
				point.x = Math.min(point.x, width-1);
				compute();
				transform(point2D(-tr.x, tr.y), [0,0,0,1], [0, 0], -a);
				console.log(ac,-90+a*2)
				// data.fpage.transform(translate(0, -width, ac) + rotate(-90+a*2) , '0% 100%');
				// folding.transform(rotate(270) + translate(-width, 0, ac), '0% 0%');
			break;
			case 'bl' :
				point.x = Math.max(point.x, 1);
				compute();
				transform(point2D(tr.x, -tr.y), [1,1,0,0], [100, 100], -a);
				data.fpage.transform(translate(-height, 0, ac) + rotate(-90+a*2), '100% 0%');
				folding.transform(rotate(270) + translate(-width, 0, ac), '0% 0%');
			break;
			case 'br' :
				point.x = Math.min(point.x, width-1);
				compute();
				transform(point2D(-tr.x, -tr.y), [0,1,1,0], [0, 100], a);
				data.fpage.transform(rotate(90-a*2), '0% 0%');
				folding.transform(rotate(90) + translate(0, -height, ac), '0% 0%');

			break;
		}

		// data.point = point;
	
	},

	_moveFoldingPage: function(bool) {

		var data = this.data().f,
			folding = flipMethods._foldingPage.call(this);

		if (folding) {
			if (bool) {
				if (!data.fpage.children()[data.ashadow? '1' : '0']) {
					flipMethods.setData.call(this, {backParent: folding.parent()});
					data.fpage.prepend(folding);
				}
			} else {
				if (data.backParent)
					data.backParent.prepend(folding);

			}
		}

	},

	_showFoldedPage: function(c, animate) {

		var folding = flipMethods._foldingPage.call(this),
			dd = this.data(),
			data = dd.f;

		if (!data.point || data.point.corner!=c.corner) {
			var event = $.Event('start');
			this.trigger(event, [data.opts, c.corner]);

			if (event.isDefaultPrevented())
				return false;
		}


		if (folding) {

			if (animate) {

				var that = this, point = (data.point && data.point.corner==c.corner) ? data.point : flipMethods._c.call(this, c.corner, 1);
			
				this.animatef({from: [point.x, point.y], to:[c.x, c.y], duration: 500, frame: function(v) {
					c.x = Math.round(v[0]);
					c.y = Math.round(v[1]);
					flipMethods._fold.call(that, c);
				}});

			} else	{

				flipMethods._fold.call(this, c);
				if (dd.effect && !dd.effect.turning)
					this.animatef(false);

			}

			if (!data.fwrapper.is(':visible')) {
				data.fparent.show().data().flips++;
				flipMethods._moveFoldingPage.call(this, true);
				data.fwrapper.show();

				if (data.bshadow)
					data.bshadow.show();
			}

			return true;
		}

		return false;
	},

	hide: function() {

		var data = this.data().f,
			folding = flipMethods._foldingPage.call(this);

		if ((--data.fparent.data().flips)===0)
			data.fparent.hide();

		this.css({left: 0, top: 0, right: 'auto', bottom: 'auto'}).transform('', '0% 100%');

		data.wrapper.transform('', '0% 100%');

		data.fwrapper.hide();

		if (data.bshadow)
			data.bshadow.hide();

		folding.transform('', '0% 0%');

		return this;
	},

	hideFoldedPage: function(animate) {

		var data = this.data().f;

		if (!data.point) return;

		var that = this,
			p1 = data.point,
			hide = function() {
				data.point = null;
				that.flip('hide');
				that.trigger('end', [false]);
			};

		if (animate) {
			var p4 = flipMethods._c.call(this, p1.corner),
				top = (p1.corner.substr(0,1)=='t'),
				delta = (top) ? Math.min(0, p1.y-p4.y)/2 : Math.max(0, p1.y-p4.y)/2,
				p2 = point2D(p1.x, p1.y+delta),
				p3 = point2D(p4.x, p4.y-delta);
		
			this.animatef({
				from: 0,
				to: 1,
				frame: function(v) {
					var np = bezier(p1, p2, p3, p4, v);
					p1.x = np.x;
					p1.y = np.y;
					flipMethods._fold.call(that, p1);
				},
				complete: hide,
				duration: 800,
				hiding: true
				});

		} else {
			this.animatef(false);
			hide();
		}
	},

	turnPage: function(corner) {

		var that = this,
			data = this.data().f;

		corner = {corner: (data.corner) ? data.corner.corner : corner || flipMethods._cAllowed.call(this)[0]};

		var p1 = data.point || flipMethods._c.call(this, corner.corner, (data.opts.turn) ? data.opts.turn.data().opts.elevation : 0),
			p4 = flipMethods._c2.call(this, corner.corner);

			this.trigger('flip').
				animatef({
					from: 0,
					to: 1,
					frame: function(v) {
						var np = bezier(p1, p1, p4, p4, v);
						corner.x = np.x;
						corner.y = np.y;
						flipMethods._showFoldedPage.call(that, corner);
					},
					
					complete: function() {
						that.trigger('end', [true]);
					},
					duration: data.opts.duration,
					turning: true
				});

			data.corner = null;
	},

	moving: function() {

		return 'effect' in this.data();
	
	},

	isTurning: function() {

		return this.flip('moving') && this.data().effect.turning;
	
	},

	_eventStart: function(e) {

		var data = this.data().f;

		if (!data.disabled && !this.flip('isTurning')) {
			data.corner = flipMethods._cornerActivated.call(this, e);
			if (data.corner && flipMethods._foldingPage.call(this, data.corner)) {
				flipMethods._moveFoldingPage.call(this, true);
				this.trigger('pressed', [data.point]);
				return false;
			} else
				data.corner = null;
		}

	},

	_eventMove: function(e) {

		var data = this.data().f;

		if (!data.disabled) {
			e = (isTouch) ? e.originalEvent.touches : [e];
		
			if (data.corner) {

				var pos = data.parent.offset();

				data.corner.x = e[0].pageX-pos.left;
				data.corner.y = e[0].pageY-pos.top;

				flipMethods._showFoldedPage.call(this, data.corner);
			
			} else if (!this.data().effect && this.is(':visible')) { // roll over
				
				var corner = flipMethods._cornerActivated.call(this, e[0]);
				if (corner) {
					var origin = flipMethods._c.call(this, corner.corner, data.opts.cornerSize/2);
					corner.x = origin.x;
					corner.y = origin.y;
					flipMethods._showFoldedPage.call(this, corner, true);
				} else
					flipMethods.hideFoldedPage.call(this, true);

			}
		}
	},

	_eventEnd: function() {

		var data = this.data().f;

		if (!data.disabled && data.point) {
			var event = $.Event('released');
			this.trigger(event, [data.point]);
			if (!event.isDefaultPrevented())
				flipMethods.hideFoldedPage.call(this, true);
		}

		data.corner = null;

	},

	disable: function(disable) {

		flipMethods.setData.call(this, {'disabled': disable});
		return this;

	}
}

export default flipMethods;


function point2D(x, y) {
	return {x: x, y: y};
}

function deg(radians) {
	return radians/PI*180;
}