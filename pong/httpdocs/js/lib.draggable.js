/*!
 * Draggable JavaScript Library v1.0
 * http://www.jstween.org/
 *
 * Copyright 2011, Marco Wolfsheimer
 * Draggable by Marco Wolfsheimer is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.
 *
 * Date: Sun Mar 13 12:46:40 2011 -0000
 */
 
 var Draggable = function( target, config ) {	

	var __bind = function( element, event, callback ) {
			return ( element.addEventListener || element.attachEvent ).call( element, event, callback );
		},
		
		__unbind = function( element, event, callback ) {
			return ( element.removeEventListener || element.detachEvent ).call( element, event, callback );
		},
		
		__getEvent = function( event ) {
		
				if( __mobileDevice ) {
			
					if( event.touches && event.touches.length ) {
						return event.touches[0];
					} else if( event.changedTouches && event.changedTouches.length ) {
						return event.changedTouches[0];
					} else {
						return event;
					}
					
				} else {
					return event;
				}
			},
		
		__mobileDevice = ( 
			/iPad/i.test( navigator.userAgent ) || 
			/iPhone OS/i.test( navigator.userAgent ) || 
			/android/i.test( navigator.userAgent )
		),
		__state = {},
		__positionHistory = [],
		__addToHistory = function( state ) {
				
			if( __positionHistory.length >= 100 ) {
				__positionHistory.shift();
			}
			
			__positionHistory.push({
				date: new Date().getTime(),
				startX: state.startX, 
				startY: state.startY, 
				pageX: state.pageX, 
				pageY: state.pageY, 
				offsetX: state.offsetX, 
				offsetY: state.offsetY
			});
		},
		__decay = 0.35,
		__drag = 3,
		__scaleStart = 1,
		__rotationStart = 0;
				
	// Make this animatable, just in case
	jQuery.JSTween.register( target );
		
	var __start = function( event ){
			
		var touchEvent = __getEvent( event );
		
		if( __mobileDevice ) {
			__bind( document, 'touchmove', __change );
			__bind( document, 'touchend', __stop );
		} else {
			jQuery( document ).bind( 'mousemove', __change );
			jQuery( document ).bind( 'mouseup', __stop );
		}
		
		__state = {
			startX: target.offsetLeft,
			startY: target.offsetTop,
			pageX: touchEvent.pageX,
			pageY: touchEvent.pageY,
			offsetX: 0,
			offsetY: 0,
			scale: 1,
			scaleOffset: 0,
			rotation: 0,
			rotationOffset: 0
		};

		jQuery( target ).clear('dummyDrag');

		if( typeof config.onStart === 'function' ) {
			config.onStart( target, __state, touchEvent )
		}
					
		if( typeof config.ghost === 'number' ) {
			jQuery.JSTween.action( target.__animate.id, 'alpha', config.ghost, false, [], true );
		}

		__positionHistory = [];
			
		if( config.ease === true ) {
			__addToHistory( __state );
		}
		
		event.preventDefault();
		return false;
	};
	
	var __change = function( event ){

		var touchEvent = __getEvent( event );

		__state.offsetX = touchEvent.pageX - __state.pageX;
		__state.offsetY = touchEvent.pageY - __state.pageY;

		if( config.move !== false ) {
			jQuery.JSTween.action( target.__animate.id, 'left', __state.offsetX + __state.startX, 'px', [], true );
			jQuery.JSTween.action( target.__animate.id, 'top', __state.offsetY + __state.startY, 'px', [], true );	
		}					
							
		if( typeof config.onChange === 'function' ) {
			config.onChange( target, __state, touchEvent )
		}

		__addToHistory( __state );
						
		event.preventDefault();
		return false;
	};

	var __stop = function( event ){

		var isClick = ( __state.offsetX > 3 || __state.offsetX < -3 || __state.offsetY > 3 || __state.offsetY < -3 ) ? false : true,
			now = new Date().getTime(),
			touchEvent = __getEvent( event );

		__positionHistory = _.select( __positionHistory, function( state, key ){ 
			return state.date > now - ( 1000 * ( __decay / __drag ) ); 
		});

		var first = __positionHistory[ 0 ],
			last = __positionHistory[ __positionHistory.length - 1 ];

		if( config.ease === true && !isClick && first && last ) {

				if( typeof config.onCoast === 'function' ) {
					config.onCoast( target, __state, touchEvent )
				}
				
				var start = {
					offsetX: __state.offsetX,
					offsetY: __state.offsetY,
					pageX: __state.pageX,
					pageY: __state.pageY,
					startX: __state.startX,
					startY: __state.startY
				};
								
				var diff = {
					offsetX: last.offsetX - first.offsetX,
					offsetY: last.offsetY - first.offsetY,
					pageX: last.pageX - first.pageX,
					pageY: last.pageY - first.pageY,
					startX: last.startX - first.startX,
					startY: last.startY - first.startY
				};
				
				var distance = Math.sqrt( ( last.offsetX * last.offsetX ) + ( first.offsetX * first.offsetX ) );
				
				//TODO: the time probably should use the speed / velocity to be more dynamicly set. Good enough for most circumstances
				
				jQuery( target ).clear('dummyDrag').tween({
					dummyDrag: {
						start: 0,
						stop: 1,
						duration: __decay,
						time: 0,
						effect: 'easeOut',
						onFrame:function( elem, state ){
						
							// Create a fake event			
							var e = {
								offsetX: start.offsetX + ( diff.offsetX * state.value ),
								offsetY: start.offsetY + ( diff.offsetY * state.value ),
								pageX: start.pageX + ( diff.pageX * state.value ),
								pageY: start.pageY + ( diff.pageY * state.value ),
								startX: start.startX + ( diff.startX * state.value ),
								startY:	start.startY + ( diff.startY * state.value	),
								currentTarget: target,				
								preventDefault: function(){},
								scale: __state.scale,
								scaleOffset: __state.scale,
								rotation: __state.rotation,
								rotationOffset: __state.rotation
							};

							if( config.move !== false ) {
								jQuery.JSTween.action( target.__animate.id, 'left', e.offsetX + e.startX, 'px', [], true );
								jQuery.JSTween.action( target.__animate.id, 'top', e.offsetY + e.startY, 'px', [], true );	
							}					
												
							if( typeof config.onChange === 'function' ) {
								config.onChange( target, e, e )
							}
						},
						onStop: function( elem, state ){
							
							// Create a fake event	
							var e = {
								offsetX: start.offsetX + ( diff.offsetX * state.value ),
								offsetY: start.offsetY + ( diff.offsetY * state.value ),
								pageX: start.pageX + ( diff.pageX * state.value ),
								pageY: start.pageY + ( diff.pageY * state.value ),
								startX: start.startX + ( diff.startX * state.value ),
								startY:	start.startY + ( diff.startY * state.value	),
								currentTarget: target,				
								preventDefault: function(){},
								scale: __state.scale,
								scaleOffset: __state.scale,
								rotation: __state.rotation,
								rotationOffset: __state.rotation
							};								
							
							if( typeof config.onStop === 'function' ) {
								config.onStop( target, e, e )
							}
				
							if( typeof config.ghost === 'number' ) {
								jQuery.JSTween.action( target.__animate.id, 'alpha', 100, false, [], true );
							}
						}
					}
				}).play();

		} else if( typeof config.onStop === 'function' && !isClick ) {

			config.onStop( target, __state, touchEvent );
				
		}  else if( typeof config.onClick === 'function' && isClick ) {
			
			config.onClick( target, __state, touchEvent )
		}
		
		if( __mobileDevice ) {

			__unbind( document, 'touchmove', __change );
			__unbind( document, 'touchend', __stop );
				
		} else {
		
			jQuery( document ).unbind( 'mousemove', __change );
			jQuery( document ).unbind( 'mouseup', __stop );
		}
				
		event.preventDefault();
		return false;
	};	
	
	//gesturestart
	var __gestureStart = function( touchEvent ) {

		__state.scale = __scaleStart + touchEvent.scale;
		__state.scaleOffset = touchEvent.scale;
		__state.rotation = __rotationStart + touchEvent.rotation;
		__state.rotationOffset = touchEvent.rotation;
		
		if( typeof config.onGestureStart === 'function' ) {
			config.onGestureStart( target, __state, touchEvent )
		}
	};
	
	//gesturechange
	var __gestureChange = function( touchEvent ) {

		__state.scale = __scaleStart + touchEvent.scale;
		__state.scaleOffset = touchEvent.scale;
		__state.rotation = __rotationStart + touchEvent.rotation;
		__state.rotationOffset = touchEvent.rotation;
								
		if( typeof config.onGestureChange === 'function' ) {
			config.onGestureChange( target, __state, touchEvent )
		}	
	};

	//ongestureend
	var __gestureStop = function( touchEvent ) {

		__state.scale = __scaleStart + touchEvent.scale;
		__state.scaleOffset = touchEvent.scale;
		__state.rotation = __rotationStart + touchEvent.rotation;
		__state.rotationOffset = touchEvent.rotation;
		
		if( typeof config.onGestureStop === 'function' ) {
			config.onGestureStop( target, __state, touchEvent )
		}
		
		__scaleStart = __state.scale;
		__rotationStart = __state.rotation;
	};

	if( __mobileDevice ) {

		__bind( target, 'touchstart', __start );
		
		__bind( target, 'gesturestart', __gestureStart );
		__bind( target, 'gesturechange', __gestureChange );
		__bind( target, 'gestureend', __gestureStop );
		
	} else {
	
		jQuery( target ).bind( 'mousedown', __start );
	}
};

jQuery.fn.draggable=function( options ){
	jQuery( this ).each( function( index, elem ){
		var drag = new Draggable( elem, options );
	});
	return this;
};
