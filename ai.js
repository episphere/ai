console.log('ai.js loaded');


(function(){

const ai={}

ai.created_at=Date.now()

ai.getIris = async function(){
    return (await fetch('https://episphere.github.io/ai/data/iris.json')).json()
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