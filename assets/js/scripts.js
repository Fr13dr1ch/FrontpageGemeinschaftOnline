// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};


/* JS Utility Classes */
(function() {
  // make focus ring visible only for keyboard navigation (i.e., tab key) 
  var focusTab = document.getElementsByClassName('js-tab-focus');
  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusTabs(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusTabs(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
  };

  function resetFocusTabs(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };
  window.addEventListener('mousedown', detectClick);
}());
// File#: _1_3d-drawer
// Usage: codyhouse.co/license
(function() {
  var TdDrawer = function(element) {
    this.element = element;
    this.mianContent = document.getElementsByClassName('js-td-drawer-main');
    this.content = document.getElementsByClassName('js-td-drawer__body');
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.selectedTrigger = null;
    this.showClass = "td-drawer--is-visible";
    this.showMainClass = "td-drawer-main--drawer-is-visible";
    initDrawer(this);
  };
  
  function initDrawer(drawer) {
    // open drawer when clicking on trigger buttons
    if ( drawer.triggers ) {
      for(var i = 0; i < drawer.triggers.length; i++) {
        drawer.triggers[i].addEventListener('click', function(event) {
          event.preventDefault();
          if(Util.hasClass(drawer.element, drawer.showClass)) return;
          drawer.selectedTrigger = event.target;
          showDrawer(drawer);
          initDrawerEvents(drawer);
        });
      }
    }
  };

  function showDrawer(drawer) {
    if(drawer.content.length  > 0 ) drawer.content[0].scrollTop = 0;
    if(drawer.mianContent.length  > 0 ) Util.addClass(drawer.mianContent[0], drawer.showMainClass);
    Util.addClass(drawer.element, drawer.showClass);
    getFocusableElements(drawer);
    Util.moveFocus(drawer.element);
    // wait for the end of transitions before moving focus
    drawer.element.addEventListener("transitionend", function cb(event) {
      Util.moveFocus(drawer.element);
      drawer.element.removeEventListener("transitionend", cb);
    });
    emitDrawerEvents(drawer, 'drawerIsOpen');
  };

  function closeDrawer(drawer) {
    if(drawer.mianContent.length  > 0 ) Util.removeClass(drawer.mianContent[0], drawer.showMainClass);
    Util.removeClass(drawer.element, drawer.showClass);
    drawer.firstFocusable = null;
    drawer.lastFocusable = null;
    if(drawer.selectedTrigger) drawer.selectedTrigger.focus();
    //remove listeners
    cancelDrawerEvents(drawer);
    emitDrawerEvents(drawer, 'drawerIsClose');
  };

  function initDrawerEvents(drawer) {
    //add event listeners
    drawer.element.addEventListener('keydown', handleEvent.bind(drawer));
    drawer.element.addEventListener('click', handleEvent.bind(drawer));
  };

  function cancelDrawerEvents(drawer) {
    //remove event listeners
    drawer.element.removeEventListener('keydown', handleEvent.bind(drawer));
    drawer.element.removeEventListener('click', handleEvent.bind(drawer));
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'click': {
        initClick(this, event);
      }
      case 'keydown': {
        initKeyDown(this, event);
      }
    }
  };

  function initKeyDown(drawer, event) {
    if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
      //close drawer window on esc
      closeDrawer(drawer);
    } else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
      //trap focus inside drawer
      trapFocus(drawer, event);
    }
  };

  function initClick(drawer, event) {
    //close drawer when clicking on close button or drawer bg layer 
    if( !event.target.closest('.js-td-drawer__close') && !Util.hasClass(event.target, 'js-td-drawer') ) return;
    event.preventDefault();
    closeDrawer(drawer);
  };

  function trapFocus(drawer, event) {
    if( drawer.firstFocusable == document.activeElement && event.shiftKey) {
      //on Shift+Tab -> focus last focusable element when focus moves out of drawer
      event.preventDefault();
      drawer.lastFocusable.focus();
    }
    if( drawer.lastFocusable == document.activeElement && !event.shiftKey) {
      //on Tab -> focus first focusable element when focus moves out of drawer
      event.preventDefault();
      drawer.firstFocusable.focus();
    }
  };

  function getFocusableElements(drawer) {
    //get all focusable elements inside the drawer
    var allFocusable = drawer.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
    getFirstVisible(drawer, allFocusable);
    getLastVisible(drawer, allFocusable);
  };

  function getFirstVisible(drawer, elements) {
    //get first visible focusable element inside the drawer
    for(var i = 0; i < elements.length; i++) {
      if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
        drawer.firstFocusable = elements[i];
        return true;
      }
    }
  };

  function getLastVisible(drawer, elements) {
    //get last visible focusable element inside the drawer
    for(var i = elements.length - 1; i >= 0; i--) {
      if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
        drawer.lastFocusable = elements[i];
        return true;
      }
    }
  };

  function emitDrawerEvents(drawer, eventName) {
    var event = new CustomEvent(eventName, {detail: drawer.selectedTrigger});
    drawer.element.dispatchEvent(event);
  };

  //initialize the Drawer objects
  var drawer = document.getElementsByClassName('js-td-drawer');
  if( drawer.length > 0 ) {
    for( var i = 0; i < drawer.length; i++) {
      (function(i){new TdDrawer(drawer[i]);})(i);
    }
  }
}());


// File#: _1_chameleonic-header
// Usage: codyhouse.co/license
(function() {
  var ChaHeader = function(element) {
    this.element = element;
    this.sections = document.getElementsByClassName('js-cha-section');
    this.header = this.element.getElementsByClassName('js-cha-header')[0];
    // handle mobile behaviour
    this.headerTrigger = this.element.getElementsByClassName('js-cha-header__trigger');
    this.modal = document.getElementsByClassName('js-cha-modal');
    this.focusMenu = false;
    this.firstFocusable = null;
    this.lastFocusable = null;
    initChaHeader(this);
  };

  function initChaHeader(element) {
    // set initial status
    for(var j = 0; j < element.sections.length; j++) {
      initSection(element, j);
    }

    // handle mobile behaviour
    if(element.headerTrigger.length > 0) {
      initMobileVersion(element);
    }

    // make sure header element is visible when in focus
    element.header.addEventListener('focusin', function(event){
      checkHeaderVisible(element);
    });
  };

  function initSection(element, index) {
    // clone header element inside each section
    var cloneItem = (index == 0) ? element.element : element.element.cloneNode(true);
    Util.removeClass(cloneItem, 'js-cha-header-clip');
    var customClasses = element.sections[index].getAttribute('data-header-class');
    // hide clones to SR
    cloneItem.setAttribute('aria-hidden', 'true');
    if( customClasses ) Util.addClass(cloneItem.getElementsByClassName('js-cha-header')[0], customClasses);
    // keyborad users - make sure cloned items are not tabbable
    if(index != 0) {
      // reset tab index
      resetTabIndex(cloneItem);
      element.sections[index].insertBefore(cloneItem, element.sections[index].firstChild);
    }
  }

  function resetTabIndex(clone) {
    var focusable = clone.querySelectorAll('[href], button, input');
    for(var i = 0; i < focusable.length; i++) {
      focusable[i].setAttribute('tabindex', '-1');
    }
  };

  function initMobileVersion(element) {
    //detect click on nav trigger
    var triggers = document.getElementsByClassName('js-cha-header__trigger');
    for(var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function(event) {
        event.preventDefault();
        var ariaExpanded = !Util.hasClass(element.modal[0], 'is-visible');
        //show nav and update button aria value
        Util.toggleClass(element.modal[0], 'is-visible', ariaExpanded);
        element.headerTrigger[0].setAttribute('aria-expanded', ariaExpanded);
        if(ariaExpanded) { //opening menu -> move focus to first element inside nav
          getFocusableElements(element);
          element.firstFocusable.focus();
        } else if(element.focusMenu) {
          if(window.scrollY < element.focusMenu.offsetTop) element.focusMenu.focus();
          element.focusMenu = false;
        }
      });
    }

    // close modal on click
    element.modal[0].addEventListener("click", function(event) {
      if(!event.target.closest('.js-cha-modal__close')) return;
      closeModal(element);
    });
    
    // listen for key events
    window.addEventListener('keydown', function(event){
      // listen for esc key
      if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
        // close navigation on mobile if open
        if(element.headerTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(element.headerTrigger[0])) {
          closeModal(element);
        }
      }
      // listen for tab key
      if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
        trapFocus(element, event);
      }
    });
  };

  function closeModal(element) {
    element.focusMenu = element.headerTrigger[0]; // move focus to menu trigger when menu is close
    element.headerTrigger[0].click();
  };

  function trapFocus(element, event) {
    if( element.firstFocusable == document.activeElement && event.shiftKey) {
      //on Shift+Tab -> focus last focusable element when focus moves out of modal
      event.preventDefault();
      element.lastFocusable.focus();
    }
    if( element.lastFocusable == document.activeElement && !event.shiftKey) {
      //on Tab -> focus first focusable element when focus moves out of modal
      event.preventDefault();
      element.firstFocusable.focus();
    }
  };

  function getFocusableElements(element) {
    //get all focusable elements inside the modal
    var allFocusable = element.modal[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
    getFirstVisible(element, allFocusable);
    getLastVisible(element, allFocusable);
  };

  function getFirstVisible(element, elements) {
    //get first visible focusable element inside the modal
    for(var i = 0; i < elements.length; i++) {
      if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
        element.firstFocusable = elements[i];
        return true;
      }
    }
  };

  function getLastVisible(element, elements) {
    //get last visible focusable element inside the modal
    for(var i = elements.length - 1; i >= 0; i--) {
      if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
        element.lastFocusable = elements[i];
        return true;
      }
    }
  };
  
  function checkHeaderVisible(element) {
    if(window.scrollY > element.sections[0].offsetHeight - element.header.offsetHeight) window.scrollTo(0, 0);
  };

  function isVisible(element) {
    return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  };

  // init the ChaHeader Object
  var chaHader = document.getElementsByClassName('js-cha-header-clip'),
    clipPathSupported = Util.cssSupports('clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)') || Util.cssSupports('-webkit-clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
  if(chaHader.length > 0 && clipPathSupported) {
    for(var i = 0; i < chaHader.length; i++) {
      new ChaHeader(chaHader[i]);
    }
  }
}());


// File#: _1_choice-buttons
// Usage: codyhouse.co/license
(function() {
  var ChoiceButton = function(element) {
    this.element = element;
    this.btns = this.element.getElementsByClassName('js-choice-btn');
    this.inputs = getChoiceInput(this);
    this.isRadio = this.inputs[0].type.toString() == 'radio';
    resetCheckedStatus(this); // set initial classes
    initChoiceButtonEvent(this); // add listeners
  };

  function getChoiceInput(element) { // store input elements in an object property
    var inputs = [];
    for(var i = 0; i < element.btns.length; i++) {
      inputs.push(element.btns[i].getElementsByTagName('input')[0]);
    }
    return inputs;
  };

  function initChoiceButtonEvent(choiceBtn) {
    choiceBtn.element.addEventListener('click', function(event){ // update status on click
      if(Util.getIndexInArray(choiceBtn.inputs, event.target) > -1) return; // triggered by change in input element -> will be detected by the 'change' event

      var selectedBtn = event.target.closest('.js-choice-btn');
      if(!selectedBtn) return;
      var index = Util.getIndexInArray(choiceBtn.btns, selectedBtn);
      if(choiceBtn.isRadio && choiceBtn.inputs[index].checked) { // radio input already checked
        choiceBtn.inputs[index].focus(); // move focus to input element
        return; 
      }

      choiceBtn.inputs[index].checked = !choiceBtn.inputs[index].checked;
      choiceBtn.inputs[index].dispatchEvent(new CustomEvent('change')); // trigger change event
      choiceBtn.inputs[index].focus(); // move focus to input element
    });

    for(var i = 0; i < choiceBtn.btns.length; i++) {(function(i){ // change + focus events
      choiceBtn.inputs[i].addEventListener('change', function(event){
        choiceBtn.isRadio ? resetCheckedStatus(choiceBtn) : resetSingleStatus(choiceBtn, i);
      });

      choiceBtn.inputs[i].addEventListener('focus', function(event){
        resetFocusStatus(choiceBtn, i, true);
      });

      choiceBtn.inputs[i].addEventListener('blur', function(event){
        resetFocusStatus(choiceBtn, i, false);
      });
    })(i);}
  };

  function resetCheckedStatus(choiceBtn) {
    for(var i = 0; i < choiceBtn.btns.length; i++) {
      resetSingleStatus(choiceBtn, i);
    }
  };

  function resetSingleStatus(choiceBtn, index) { // toggle .choice-btn--checked class
    Util.toggleClass(choiceBtn.btns[index], 'choice-btn--checked', choiceBtn.inputs[index].checked);
  };

  function resetFocusStatus(choiceBtn, index, bool) { // toggle .choice-btn--focus class
    Util.toggleClass(choiceBtn.btns[index], 'choice-btn--focus', bool);
  };

  //initialize the ChoiceButtons objects
  var choiceButton = document.getElementsByClassName('js-choice-btns');
  if( choiceButton.length > 0 ) {
    for( var i = 0; i < choiceButton.length; i++) {
      (function(i){new ChoiceButton(choiceButton[i]);})(i);
    }
  };
}());
// File#: _1_header
// Usage: codyhouse.co/license
(function() {
  var mainHeader = document.getElementsByClassName('js-header')[0];
  if( mainHeader ) {
    var trigger = mainHeader.getElementsByClassName('js-header__trigger')[0],
      nav = mainHeader.getElementsByClassName('js-header__nav')[0];

    // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
    var focusMenu = false;

    //detect click on nav trigger
    trigger.addEventListener("click", function(event) {
      event.preventDefault();
      var ariaExpanded = !Util.hasClass(nav, 'header__nav--is-visible');
      //show nav and update button aria value
      Util.toggleClass(nav, 'header__nav--is-visible', ariaExpanded);
      trigger.setAttribute('aria-expanded', ariaExpanded);
      if(ariaExpanded) { //opening menu -> move focus to first element inside nav
        nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
      } else if(focusMenu) {
        focusMenu.focus();
        focusMenu = false;
      }
    });
    // listen for key events
    window.addEventListener('keyup', function(event){
      // listen for esc key
      if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
        // close navigation on mobile if open
        if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger)) {
          focusMenu = trigger; // move focus to menu trigger when menu is close
          trigger.click();
        }
      }
      // listen for tab key
      
      if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
        // close navigation on mobile if open when nav loses focus
        if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger) && !document.activeElement.closest('.js-header')) trigger.click();
      }
    });
  }

  function isVisible(element) {
    return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  };
}());
// File#: _1_pre-header
// Usage: codyhouse.co/license
(function() {
  var preHeader = document.getElementsByClassName('js-pre-header');
  if(preHeader.length > 0) {
    for(var i = 0; i < preHeader.length; i++) {
      (function(i){ addPreHeaderEvent(preHeader[i]);})(i);
    }

    function addPreHeaderEvent(element) {
      var close = element.getElementsByClassName('js-pre-header__close-btn')[0];
      if(close) {
        close.addEventListener('click', function(event) {
          event.preventDefault();
          Util.addClass(element, 'pre-header--is-hidden');
        });
      }
    }
  }
}());