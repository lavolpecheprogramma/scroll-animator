# Scroll animator

A lightweight ( ~ 100 lines of code) and dependency-free library to animate elements on your page as you scroll written in pure Javascript. 

## Setup

```js
var ScrollAnimator = require('YOURPATH/scroll-animator');

```

Be sure to polyfill:
- `window.requestAnimationFrame`


## How use it
You can add all "animators" that you want!

The basic configuration is:

```js
scroller.addAnimator({
	observed: elements,
	callback: function(el){
		// here you can add all what you want! 
		// for example set an attribute
		el.setAttribute('data-state', 'show');
		// or add a css class
		el.classList.add('myNewCssClass');
	},
});

```

or a complete configuration:
```js
scroller.addAnimator({
	observed: elements,
	animateOnce: true,
	position: "top",
	offset: 0,
	callback: function(el){
		el.setAttribute('data-state', 'show');
	},
});

```
## Parameters

Observed and callback are mandatory

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| observed | <code>Array</code> | Array of HTML nodes to animate||
| animateOnce | <code>boolean</code> | <code>true</code> if you want to execute the callback only once and <code>false</code> if you want to execute it until the HTML is in the position that you have defined| <code>true</code> |
| position | <code>String</code> | <code>"top"</code> if the animation start when the top of the element ( plus the offset ) reach the viewport and <code>"middle"</code> if you want that the animation start when the middle ( plus the offset )  of the element | <code>"top"</code>|
| offset | <code>number</code> | Pixel offset. | <code>0</code> |
| callback | <code>function</code> | Total scroll animation duration in milliseconds. ||


## Tips

If you want to get all nodes with the same class you can add this simple function:
```js
function getElementByClass(className){
	var elements = document.getElementsByClassName(className);
	//html collection into array
	return [].slice.call(elements);
}
```

and then

```js
var elements = getElementByClass('myCssClass');

scroller.addAnimator({
	observed: elements,
	callback: function(el){
		el.setAttribute('data-state', 'show');
	}
});
```


ENJOY!
