//global variables for different layers
var gen,st,sc

//style for highlighted feature 
var highlightStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'red',
    lineDash: [4],
    width: 7,
  }),
  fill: new ol.style.Fill({
    color: 'yellow',
  }),
})

//style based on PC_NO 
var stylefunction =function (feature) {
  var category = feature.get('PC_NO');
    var color;
  if (category == '1') {
    color = 'red';
  } else if (category == '2') {
    color = 'blue';
  }
  else if (category == '4') {
    color = 'green';
  }

  var retStyle = new ol.style.Style({
       stroke: new ol.style.Stroke({
         color: color,
         lineDash: [4],
         width: 3,
       }),
       fill: new ol.style.Fill({
         color: 'yellow',
       }),
     })
  return retStyle;

} 

//map render style
  var stylefunction2 = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      lineDash: [4],
      width: 3,
    }),
    fill: new ol.style.Fill({
      color: 'yellow',
    }),
  })

// Define view layer
var view =  new ol.View({
    center:[9538352.345209183, 2955053.554721712],
    zoom:8,
    
    })

//define source 
var datasource=new ol.source.Vector()

// Basemap layer
var basemapLayer = new ol.layer.Tile({
    source: new ol.source.OSM
  })

//define bihar json layer
var biharlayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'bihar.json',      
      format: new ol.format.GeoJSON(),
      
    }),
    style: stylefunction2,

  })


 
// Layers Array
var layerArray = [basemapLayer,biharlayer]


// Initiating Map
var map = new ol.Map({
  target : 'mymap',
  view :view,
  layers:layerArray,

})


//function for style based on PC_NO
function setstyle(){
  biharlayer.setStyle(stylefunction)
}

//change mouse cursor on layer
map.on('pointermove', function(e) {
    if (e.dragging) return;
       
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    
    document.getElementById(map.getTarget()).style.cursor = hit ? 'pointer' : '';
});


/**
 * Popup
 **/
 var container = document.getElementById('popup'),
  content_element = document.getElementById('popup-content'),
  closer = document.getElementById('popup-closer');

  //function for closing of popup
  closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};
 
//container popup
var  overlay = new ol.Overlay({
 element: container,
 autoPan: true,
 offset: [0, -10]
});
map.addOverlay(overlay);

//on click function
map.on('click', function(evt){
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
        
      });
      
    if (feature) {
        //feature.setStyle(highlightStyle);
      
        var content = '<h5>' + '<h5>District Name:</h5>'+ feature.get('DIST_NAME') + '</h5>';
        content += '<h5>'  +'<h5>Category:</h5>'+ feature.get('STATUS') + '</h5>';
        overlay.setPosition(feature.getGeometry().getFirstCoordinate());

        content_element.innerHTML = content;
        
       // console.log(feature.get('STATUS') );
    }
});


//seperate geojson based on STATUS
var filteredGeoJSON_sc = { 
  "type": "FeatureCollection",
  "features":[ ]
}
var filteredGeoJSON_st = { 
  "type": "FeatureCollection",
  "features":[ ]
}
var filteredGeoJSON_gen = { 
  "type": "FeatureCollection",
  "features":[ ]
}

//getting data from json for filter operation
 var url='bihar.json'
 $.getJSON(url).done(function(data){

     data.features.forEach(function(feature){

      if (feature.properties.STATUS=="SC") {
        filteredGeoJSON_sc.features.push(feature);
        }
      else if (feature.properties.STATUS=="ST") {
        filteredGeoJSON_st.features.push(feature);
        }
      else if (feature.properties.STATUS=="General") {
        filteredGeoJSON_gen.features.push(feature);
        }
    });

    //creating "SC" category layer
    var sc= new ol.layer.Vector({
     source: new ol.source.Vector({
       features: (new ol.format.GeoJSON()).readFeatures(
        filteredGeoJSON_sc, 
         {featureProjection: ol.proj.get('EPSG:3857')}
       )
     }),
     style: stylefunction2,
   
   })  
   map.addLayer(sc)
   //making layer invisible
   sc.setVisible(false)

   //creating "ST category layer
   var st= new ol.layer.Vector({
    source: new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(
       filteredGeoJSON_st, 
        {featureProjection: ol.proj.get('EPSG:3857')}
      )
    }),
    style: stylefunction2,
  
  })  
  map.addLayer(st)
  st.setVisible(false)

//creating "General" category layer
  var gen= new ol.layer.Vector({
    source: new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(
       filteredGeoJSON_gen, 
        {featureProjection: ol.proj.get('EPSG:3857')}
      )
    }),
    style: stylefunction2,
  
  })  
  map.addLayer(gen)
  gen.setVisible(false)


   
var select = null;
//Selecting option from dropdown (DOM)
var selectElement = document.getElementById('type');

var changeInteraction = function () {
  if (select !== null) {
    map.removeInteraction(select);
  }
  var value = selectElement.value;
  if (value == 'SC') {
    filter_sc();
  } 
  else if (value == 'ST') {
    filter_st();
  }
  else if (value == 'General') {
    filter_gen();
  }
  else if (value == 'All') {
    filter_all();
  }
}

//function based on value for status
function filter_all()
{
  biharlayer.setVisible(true)
  sc.setVisible(false)
  st.setVisible(false)
  gen.setVisible(false)
}

function filter_sc()
{
  biharlayer.setVisible(false)
  sc.setVisible(true)
  st.setVisible(false)
  gen.setVisible(false)
}

function filter_st()
{
  biharlayer.setVisible(false)
  sc.setVisible(false)
  st.setVisible(true)
  gen.setVisible(false)
}
function filter_gen()
{
  biharlayer.setVisible(false)
  sc.setVisible(false)
  st.setVisible(false)
  gen.setVisible(true)
}

  /**
 * onchange callback on the select element.
 */
   selectElement.onchange = changeInteraction;
   changeInteraction()

 })

 

 
  




