console.log('ai.js loaded');


(function(){

const ai={
    created_at:Date.now()
}


if(typeof(define)!=='undefined'){ // loaded as a required object
    define(ai)
}else if(typeof(window)=='object'){ // regular web browser application
    window.ai=ai
    // check if intro is in order
    window.onload=function(){
        console.log('window loaded')
    }
}



})()