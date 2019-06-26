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

ai.codeLabCars=async function(div){ // https://codelabs.developers.google.com/codelabs/tfjs-training-regression
    // Plotly so we have a persistent UI
    ai.codeLabIris.div=div||document.getElementById('codeLabCarsDiv')||document.createElement('div')
    ai.codeLabIris.div.innerHTML='<p>Loading data ...</p>'
    ai.codeLabCars.data=await (await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json')).json()
    ai.codeLabIris.div.innerHTML='<div id="codeLabCarsDataPlot" style="width:500;height:500"></div>'
    ai.codeLabIris.divDataPlot=ai.codeLabIris.div.querySelector('#codeLabCarsDataPlot')
    // ploting MPG vs horsepower uing tfvis
    let trace = {
        x:ai.codeLabCars.data.map(d=>d.Horsepower),
        y:ai.codeLabCars.data.map(d=>d.Miles_per_Gallon),
        type:'scatter',
        mode:'markers',
    }
    let layout={
        title:'MPG vs HorsePower',
        xaxis: {
            title: 'Horsepower'
        },
        yaxis: {
            title: 'Miles_per_Gallon'
        }
    }
    ai.plot(ai.codeLabIris.divDataPlot,[trace],layout)

    // plot it also with tfVis
    let values = ai.codeLabCars.data.map(c=>{return{
        //debugger
        x:c.Horsepower,
        y:c.Miles_per_Gallon
    }})
    tfvis.render.scatterplot(
        {name:'MPG vs HorsePower'},
        {values},
        {
            xLabel: 'Horsepower',
            yLabel: 'MPG',
            height: 300
        }
    )
    // Model architecture
    // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/#3
    const model = ai.codeLabCars.createModel();
    tfvis.show.modelSummary({name: 'Model Summary'}, model);
    // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/#5
    // Convert the data to a form we can use for training.
    const tensorData = ai.codeLabCars.convertToTensor(ai.codeLabCars.data)
    const {inputs, labels} = tensorData;
    // Train the model  
    await ai.codeLabCars.trainModel(model, inputs, labels);
    console.log('Done Training');

    return ai.codeLabIris.div // in case this is a module being required in another env, such as an observable notebook
}

ai.codeLabCars.createModel=function() {
    // https://codelabs.developers.google.com/codelabs/tfjs-training-regression/#3
    // Create a sequential model
    const model = tf.sequential(); 

    // Add a single hidden layer
    model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));

    // Add an output layer
    model.add(tf.layers.dense({units: 1, useBias: true}));

    return model;
}

ai.codeLabCars.convertToTensor=function(data) {
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  
  return tf.tidy(() => { // clean memory use https://js.tensorflow.org/api/0.11.7/#tidy
    // Step 1. Shuffle the data    
    tf.util.shuffle(data);

    // Step 2. Convert data to Tensor
    const inputs = data.map(d => d.horsepower)
    const labels = data.map(d => d.mpg);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();  
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    }
  });  
}

ai.codeLabCars.trainModel = async function (model, inputs, labels) {
  // Prepare the model for training.  
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    //metrics: ['mse'], // <-- needed?
  });
  
  const batchSize = 32; // <-- discuss how this could lead to a federated learning implementation
  const epochs = 50;
  
  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      //['loss', 'mse'],
      ['loss'], 
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });
}


ai.codeLabIris=async function(div){
    ai.codeLabIris.div=div||document.getElementById('codeLabIrisDiv')||document.createElement('div')
    ai.codeLabIris.div.innerHTML='<div id="codeLabIrisMsg"><p>iris data loading ...</p></div>'
    ai.codeLabIris.data=await (await fetch('https://episphere.github.io/ai/data/iris.json')).json()
    ai.codeLabIris.parms = Object.keys(ai.codeLabIris.data[0]).slice(0,-1)
    let n = ai.codeLabIris.parms.length
    ai.codeLabIris.table=document.createElement('table')
    ai.codeLabIris.div.appendChild(ai.codeLabIris.table)
    // wrangle the data
    let sp={};ai.codeLabIris.data.forEach(d=>{
        if(!sp[d.species]){sp[d.species]=0}
        sp[d.species]+=1
    })
    // for each species generate a trace
    ai.codeLabIris.speciesData={}
    ai.codeLabIris.species=Object.keys(sp)
    ai.codeLabIris.species.forEach(s=>{
        ai.codeLabIris.speciesData[s]=ai.codeLabIris.data.filter(d=>(d.species==s))
    })

    for(var i = 0; i<n ; i++){
        let tr = document.createElement('tr')
        ai.codeLabIris.table.appendChild(tr)
        for(var j=0 ; j<n ; j++){
            let td = document.createElement('td')
            let div = document.createElement('div')
            div.i=i
            div.j=i
            div.id=`${i}_${j}`
            //div.innerHTML=`div(${i},${j})`
            // preparind dt for ploting
            if(j<i){
                let traces = []
                ai.codeLabIris.species.forEach(s=>{
                    traces.push({
                        x:ai.codeLabIris.speciesData[s].map(d=>d[ai.codeLabIris.parms[i]]),
                        y:ai.codeLabIris.speciesData[s].map(d=>d[ai.codeLabIris.parms[j]]),
                        type:'scatter',
                        mode:'markers',
                        name: s
                    })
                })
                // debugger
                // ai.plot(div)
                // style="width:600px;height:250px;"
                div.style.width=400
                div.style.height=400
                td.appendChild(div)
                tr.appendChild(td)
                layout={
                    xaxis: {
                        title: ai.codeLabIris.parms[j]
                    },
                    yaxis: {
                        title: ai.codeLabIris.parms[i]
                    }
                }
                ai.plot(div,traces,layout)
            }
        }
    }
    //return ai.codeLabIris.table
    setTimeout(_=>{codeLabIrisMsg.innerHTML=''},2000)

    
    return ai.codeLabIris.div
}

ai.cleanIrisData

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
        try{
            document.getElementById('codeLabCars').disabled=false
            document.getElementById('codeLabCars').click() // run https://codelabs.developers.google.com/codelabs/tfjs-training-regression if available
        }catch (err){

        }
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