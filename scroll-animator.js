function ScrollAnimator(delay) {
	this.animator = [];
	this.scrollY = 0;
	this.delay = delay || 100;
	this.lastCall = { scroll: 0, resize: 0 };
	this.timeout = { scroll: undefined, resize: undefined };

	this.default = {
		observed: [],
		position: "top",
		callback: undefined,
		callbackExit: undefined,
		animateOnce: true,
		offset: 0
	};

	this.onScroll = this.onScroll.bind(this);
	this.onRaf = this.onRaf.bind(this);
	this.recalculate = this.recalculate.bind(this);
	window.addEventListener('scroll', this.onScroll);
	window.addEventListener('resize', this.recalculate);
};

ScrollAnimator.prototype.addAnimator = function(animator) {
	if (animator.observed.length <= 0 || animator.callback == undefined) { return; }

	this.animator.push(this.extendConfig(animator));
	this.recalculate(true);
	this.onScroll();
}

ScrollAnimator.prototype.extendConfig = function(userConfig){
	var newConfig = JSON.parse(JSON.stringify(this.default));
	for(var k in userConfig){
		if(k == 'observed'){
			for (var i = 0; i < userConfig[k].length; i++) {
				newConfig[k].push({
					el: userConfig[k][i]
				});
			}
		}else{
			newConfig[k] = userConfig[k];
		}
	}
	return newConfig;
}

ScrollAnimator.prototype.spliceOne = function (arr, index) {
	var len=arr.length;
	if (!len) { return }
	while (index<len) {
		arr[index] = arr[index+1];
		index++;
	}
	arr.length--;
}

ScrollAnimator.prototype.recalculate = function(onlyLast) {
	if (this.checkDelay('resize', this.recalculate)) { return; }
	this.w_h = window.innerHeight;
	window.requestAnimationFrame(() => {
		var i = onlyLast ? this.animator.length - 1 : 0;
		for (; i <= this.animator.length - 1; i++) {
			var j = 0;
			for (; j <= this.animator[i].observed.length-1; j++) {
				var bc = this.animator[i].observed[j].el.getBoundingClientRect();
				this.animator[i].observed[j].ot = (bc.top + this.scrollY) - this.w_h;
				this.animator[i].observed[j].ob = this.animator[i].observed[j].ot + bc.height + this.w_h;
				this.animator[i].observed[j].ol = bc.left;
				this.animator[i].observed[j].or = bc.left + bc.width;
				this.animator[i].observed[j].bc = bc;
				switch(this.animator[i].position){
					case 'middle':
						this.animator[i].observed[j].ot += (bc.height/2);
						break;
					case 'bottom':
						this.animator[i].observed[j].ot += bc.height;
						break;
				}
				// bitwise operator >> 0 is faster then parseInt
				this.animator[i].observed[j].ot = this.animator[i].observed[j].ot + this.animator[i].offset >> 0;
				this.animator[i].observed[j].ob = this.animator[i].observed[j].ob >> 0;
			}
		}
	});
};

ScrollAnimator.prototype.getScrollY = function() {
	return window.pageYOffset;
}

ScrollAnimator.prototype.checkDelay = function(type, cb) {
	clearTimeout(this.timeout[type]);

	var now = Date.now();
	if ( now - this.lastCall[type] < this.delay ) {
		this.timeout[type] = setTimeout(cb, this.delay);
		return true;
	};
	this.lastCall[type] = now;

	return false;
}

ScrollAnimator.prototype.onScroll = function(e){
	this.scrollY = this.getScrollY();
};

ScrollAnimator.prototype.onRaf = function(){
	var animatorRunning = false;
	var i = this.animator.length - 1;
	for (; i >= 0; i--) {
		var j = this.animator[i].observed.length - 1;
		for (; j >= 0; j--) {
			animatorRunning = true;
			if ( this.animator[i].observed[j].ot == undefined ||
				this.scrollY < this.animator[i].observed[j].ot ||
				this.scrollY > this.animator[i].observed[j].ob ) {
				if (this.animator[i].observed[j].animated){
					this.animator[i].observed[j].animated = false;
					if(this.animator[i].callbackExit){
						this.animator[i].callbackExit(this.animator[i].observed[j], this.scrollY);
					}
				}
				continue;
			}

			this.animator[i].callback(this.animator[i].observed[j], this.scrollY);
			if (this.animator[i].animateOnce) {
				this.spliceOne(this.animator[i].observed, j);
			}else{
				this.animator[i].observed[j].animated = true;
			}
		}
	}
	if (animatorRunning) { this.idRaf = requestAnimationFrame(this.onRaf); }
}

ScrollAnimator.prototype.reset = function(){
	this.animator.length = 0;
}

ScrollAnimator.prototype.stop = function(){
	if(!this.idRaf) return;
	cancelAnimationFrame(this.idRaf);
}

module.exports = new ScrollAnimator();
