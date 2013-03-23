var KeyBindings = ( function ( that ) {

   // Keyboard mappings
   var __keys = { '8':'backspace','9':'tab','33':'pageup','27':'escape','34':'pagedown','36':'home','35':'end','37':'left','38':'up','39':'right','40':'down','16':'shift','17':'control','18':'option','91':'command','93':'command','32':'space','20':'capslock','13':'return','186':';','222':'\'','220':'\\','219':'[','221':']','188':',','190':'.','191':'/','189':'-','187':'=','192':'`','48':'0','49':'1','50':'2','51':'3','52':'4','53':'5','54':'6','55':'7','56':'8','57':'9','65':'a','66':'b','67':'c','68':'d','69':'e','70':'f','71':'g','72':'h','73':'i','74':'j','75':'k','76':'l','77':'m','78':'n','79':'o','80':'p','81':'q','82':'r','83':'s','84':'t','85':'u','86':'v','87':'w','88':'x','89':'y','90':'z' },
       __keysReverse = { 'backspace':'8','tab':'9','pageup':'33','escape':'27','pagedown':'34','home':'36','end':'35','left':'37','up':'38','right':'39','down':'40','shift':'16','control':'17','option':'18','command':'91','command':'93','space':'32','capslock':'20','return':'13',';':'186','\'':'222','\\':'220','[':'219',']':'221',',':'188','.':'190','/':'191','-':'189','=':'187','`':'192','0':'48','1':'49','2':'50','3':'51','4':'52','5':'53','6':'54','7':'55','8':'56','9':'57','a':'65','b':'66','c':'67','d':'68','e':'69','f':'70','g':'71','h':'72','i':'73','j':'74','k':'75','l':'76','m':'77','n':'78','o':'79','p':'80','q':'81','r':'82','s':'83','t':'84','u':'85','v':'86','w':'87','x':'88','y':'89','z':'90' },
       __shift = { '18':'alt','186':':','222':'"','220':'|','219':'{','221':'}','188':'<','190':'>','191':'?','189':'_','187':'+','192':'~','48':')','49':'!','50':'@','51':'?','52':'$','53':'%','54':'^','55':'&','56':'*','57':'(','65':'A','66':'B','67':'C','68':'D','69':'E','70':'F','71':'G','72':'H','73':'I','74':'J','75':'K','76':'L','77':'M','78':'N','79':'O','80':'P','81':'Q','82':'R','83':'S','84':'T','85':'U','86':'V','87':'W','88':'X','89':'Y','90':'Z' },
       __shiftReverse = { 'alt':'18',':':'186','"':'222','|':'220','{':'219','}':'221','<':'188','>':'190','?':'191','_':'189','+':'187','~':'192',')':'48','!':'49','@':'50','?':'51','$':'52','%':'53','^':'54','&':'55','*':'56','(':'57','A':'65','B':'66','C':'67','D':'68','E':'69','F':'70','G':'71','H':'72','I':'73','J':'74','K':'75','L':'76','M':'77','N':'78','O':'79','P':'80','Q':'81','R':'82','S':'83','T':'84','U':'85','V':'86','W':'87','X':'88','Y':'89','Z':'90' },
       __pressed = {};

   that.bindKey = function( keys, callbackDown, callbackUp ) {

       if( typeof keys === 'string' ) { keys = [ keys ]; }

       jQuery( this ).bind( 'keydown', function( event ){

           that.keyDown( event );

			if( typeof callbackDown === 'function' ) {
			
				if( that.testKeys( keys ) ) {
					
					callbackDown( event );
					event.preventDefault();
				}
			}
       });

       jQuery( this ).bind( 'keyup', function( event ){

			if( typeof callbackUp === 'function' ) {
			
				if( that.testKeys( keys ) ) {
				
					callbackUp( event );
					event.preventDefault();
				}
			}
			
			that.keyUp( event );
       });
       
       return this;
   };

   that.testKeys = function( keys ) {

       if( typeof keys === 'string' ){ keys = [ keys ]; }

       for( var i = 0; i < keys.length; i++ ) {
               if( __pressed[ that.getCode( keys[i] ) ] === undefined ) {
                       return false;
               }
       }
       return true;
   };

   that.getKey = function( keyCode ) {

       if( __pressed[ 'shift' ] === true && __shift[ keyCode ] !== undefined ) {
               return __shift[ keyCode ];
       } else if( __keys[ keyCode ] !== undefined ) {
               return __keys[ keyCode ];
       } else {
               return keyCode;
       }
   };

   that.getCode = function( key ) {

       if( __shiftReverse[ key ] !== undefined ) {
               return parseInt( __shiftReverse[ key ], 10 );
       } else if ( __keysReverse[ key ] !== undefined) {
               return parseInt( __keysReverse[ key ], 10 );
       } else {
               return -1;
       }
   };

   that.keyUp = function( event ) {

       var key = that.getKey( event.keyCode );
       
       delete __pressed[ key ];
       delete __pressed[ that.getCode( key ) ];
   };

   that.keyDown = function( event ) {

       var key = that.getKey( event.keyCode );

       __pressed[ key ] = true;
       __pressed[ event.keyCode ] = true;
   };

   jQuery.fn.bindKey = that.bindKey;

       return that;

}( KeyBindings || {} ) );