console.log('ai.js loaded');


(async function(){

const ai={}

ai.created_at=Date.now()

ai.getIris = async function(){
    return (await fetch('https://episphere.github.io/ai/data/iris.json')).json()
}
ai.getCars = async function(){
    return (await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json')).json()
}

ai.getScript=async function(url){
    url=url||'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0/dist/tf.min.js'
    return new Promise(function(resolve, reject) {
        let s = document.createElement('script')
        s.src=url
        s.onload=resolve
        s.onerror=reject
        document.head.appendChild(s)
    })
}

ai.codeLab=async function(){ // https://codelabs.developers.google.com/codelabs/tfjs-training-regression
    let cars = await ai.getCars()
    let values = cars.map(c=>{return{
        //debugger
        x:c.Horsepower,
        y:c.Miles_per_Gallon
    }})
    tfvis.render.scatterplot(
        {name: 'Horsepower v MPG'},
        {values}, 
        {
          xLabel: 'Horsepower',
          yLabel: 'MPG',
          height: 300
        }
      )
}





if(typeof(window)=='object'){ // regular web browser application
    window.onload=async function(){
        await ai.getScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0/dist/tf.min.js')
        ai.tf=tf
        await ai.getScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis@1.0.2/dist/tfjs-vis.umd.min.js')
        ai.tfvis=tfvis
        window.ai=ai
        // check if intro is in order
        console.log('window loaded')
        ai.codeLab()
        //define(ai)
    }
}
if(typeof(define)!=='undefined'){ // loaded as a required object
    define(ai)
}

})()