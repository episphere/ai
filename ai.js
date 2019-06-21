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

ai.plot=async function(div,traces,layout){
    if(typeof(Plotly)=='undefined'){
        await ai.getScript('https://cdn.plot.ly/plotly-latest.min.js')
    }
    div=div||document.createElement('div')
    traces=traces||[{x: [1, 2, 3, 4, 5],y: [1, 2, 4, 8, 16]}]
    layout=layout||{margin: { t: 0 } };

	Plotly.plot(div,traces,layout)
	return div
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
        //ai.codeLab()
        //define(ai)
    }
}
if(typeof(define)!=='undefined'){ // loaded as a required object
    define(ai)
}

})()



// MIS
/*
(async function(){
    cars = await ai.getCars()
    trace={
        x:[],
        y:[]
    }
    cars.filter(c=>c.Miles_per_Gallon).forEach((c,i)=>{
        trace.x[i]=c.Horsepower;
        trace.y[i]=c.Miles_per_Gallon
    })
    
})()

*/