// https://github.com/HenrikJoreteg/extend-object
function extend(obj){
	var arr = [];
	arr.forEach.call(arr.slice.call(arguments, 1), function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
}

function ScrollAnimator(delay){
	this.animator = [];
	this.scrollY = 0;
	this.delay = delay || 100;
	this.lastCall = { scroll: 0, resize: 0 };
	this.timeout = { scroll: undefined, resize: undefined };

	this.default = {
		observed: [],
		position: "top",
		callback: undefined,
		animateOnce: true,
		offset: 0
	};

	this.onScroll = this.onScroll.bind(this);
	this.onRaf = this.onRaf.bind(this);
	this.recalculate = this.recalculate.bind(this);

	window.addEventListener('scroll', this.onScroll);
	window.addEventListener('resize', this.recalculate);
};

ScrollAnimator.prototype.addAnimator = function(animator){
	if(animator.observed.length <= 0 || animator.callback == undefined){ return; }
	
	var anim = extend({}, this.default, animator);

	this.animator.push(anim);
	this.recalculate();
	this.onScroll();
}

ScrollAnimator.prototype.recalculate = function(){
	if(this.checkDelay('resize', this.recalculate)){ return; }

	this.w_h = window.innerHeight;
	
	for (var i = this.animator.length - 1; i >= 0; i--) {
		for (var j = 0; j < this.animator[i].observed.length; j++) {
			var bc = this.animator[i].observed[j].getBoundingClientRect();
			this.animator[i].observed[j].ot = (bc.top + this.scrollY) + this.animator[i].offset - this.w_h;
			switch(this.animator[i].observed[j].position){
				case 'middle':
					this.animator[i].observed[j].ot += (bc.height/2)
					break;
			}
			// bitwise operator >> 0 is faster then parseInt
			this.animator[i].observed[j].ot = this.animator[i].observed[j].ot >> 0;
			this.animator[i].observed[j].ob = this.animator[i].observed[j].ot + bc.height + this.w_h;
			this.animator[i].observed[j].ob = this.animator[i].observed[j].ob >> 0;
		}
	}
};

ScrollAnimator.prototype.getScrollY = function() {
    return  window.pageYOffset;
}

ScrollAnimator.prototype.checkDelay = function(type, cb){
	clearTimeout(this.timeout[type]);

	var now = Date.now();
	if ( now - this.lastCall[type] < this.delay ){
		this.timeout[type] = setTimeout(cb, this.delay);
		return true; 
	};
	this.lastCall[type] = now;
	
	return false;
}

ScrollAnimator.prototype.onScroll = function(e){
	if(this.checkDelay('scroll', this.onScroll)){ return; }
	this.scrollY = this.getScrollY();	
};

ScrollAnimator.prototype.onRaf = function(){
	var animatorRunning = false;
	for (var i = this.animator.length - 1; i >= 0; i--) {
		for (var j = this.animator[i].observed.length - 1; j >= 0; j--) {
			animatorRunning = true;
			if( this.animator[i].observed[j].ot == undefined || 
				this.scrollY < this.animator[i].observed[j].ot ||
				this.scrollY > this.animator[i].observed[j].ob ) { continue; }
			
			this.animator[i].callback(this.animator[i].observed[j]);
			if(this.animator[i].animateOnce){
				this.animator[i].observed.splice(j, 1);
			}
		}
	}
	if(animatorRunning){
		requestAnimationFrame(this.onRaf);
	}
}

module.exports = new ScrollAnimator();