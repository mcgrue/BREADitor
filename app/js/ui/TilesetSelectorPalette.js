import { Map, verifyTileData, verifyMap } from '../../Map.js';
import { modal_error } from './Util.js';
import { Tools } from '../../Tools.js';

var old_map;
var old_layer;

var vsp_mapdata, vsp_tiledata, vsp_map;

var create_dynamic_map = (vspName) => {
  var dynMap = {
    entities: [],
    layers: [{
      MAPED_HIDDEN: false,
      alpha: 1,
      dimensions: {
        X: -1, // TODO: get this from the vsp definition file
        Y: -1  // TODO: calculate this from the vsp definition file and the size of the source image
      },
      name: "Dynamic Tileselector VspMap Layer xTreem 7",
      parallax: {
        X: 1,
        Y: 1
      },
      vsp: vspName
    }],
    name: "The magical dynamically generated vsp map for the tileselector(tm)!",
    notes: [],
    renderstring: "1", // TODO: needs at least one E?
    starting_coordinates: [0,0], // TODO: probably unnecessary
    //tallentitylayer: 1,
    vsp: {},
    zones: []
  };

  dynMap.vsp[vspName] = window.$$$currentMap.mapData.vsp[vspName];

  return dynMap;
};

var create_dynamic_tiledata = (mapdata, layerdata) => {;
  return { tile_data: [0,1,2,3,4,5], zone_data: [] };
};

var create_map = (mapData, tileData, updateLocationFunction, newMap, newLayer ) => {

  return new Map(
      mapData, tileData, updateLocationFunction
  ).ready().then(function(m) {

    var tileSetSize = 0;

    m.vspImages = window.$$$currentMap.vspImages; /// TODO: somewhere something is going wrong here.  FIX.
    
    m.mapData.layers[0].dimensions.X = parseInt(m.vspImages[newLayer.vsp].width / window.$$$currentMap.vspData[newLayer.vsp].tilesize.width);
    m.mapData.layers[0].dimensions.Y = parseInt(m.vspImages[newLayer.vsp].height / window.$$$currentMap.vspData[newLayer.vsp].tilesize.height);

    tileSetSize = m.mapData.layers[0].dimensions.X * m.mapData.layers[0].dimensions.Y;

    /// this overwrites most of create_dynamic_tiledata, which was temporary.
    m.tileData = [[]];
    for (var i = 0; i < tileSetSize; i++) {
      m.tileData[0].push(i);
    }

    m.setCanvas( $('.tileset_selector_canvas') );

    //TODO need to set a channel up to the tile selectors.
    vsp_map = m;

    finalize_process(newMap, newLayer);
  });

};

var finalize_process = (newMap, newLayer) => {

  if( old_map && old_map != newMap ) {
    debugger;
  }

  /// full init
  if( !old_layer && newLayer ) {
    debugger;
  } 

  /// maybe reinit for new layer vsp?
  else if( old_layer && old_layer != newLayer ) {
    debugger;
  }

  old_map = newMap;
  old_layer = newLayer;
};

var initTilesetSelectorWidget = (newMap, newLayer) => {

  if( newLayer ) {
    $(".tileset_selector_canvas_container h3.note").hide();
    $(".tileset_selector_canvas_container canvas").show();
  } else {
    $(".tileset_selector_canvas_container h3.note").show();
    $(".tileset_selector_canvas_container canvas").hide();
  }
  
  if( newLayer ) {
    if( !window.$$$currentMap.vspData[newLayer.vsp] ) {
      throw "current map didnt contain vsp '"+newLayer.vsp+"'.  Only contained: " + Object.keys(window.$$$currentMap.vspData).join(",");
    }

    vsp_mapdata = create_dynamic_map( newLayer.vsp );
    vsp_tiledata = create_dynamic_tiledata( vsp_mapdata, newLayer );
    
    create_map( vsp_mapdata, vsp_tiledata, Tools.updateLocationFunction, newMap, newLayer );
  }
};

export var TilesetSelectorWidget = {
  initTilesetSelectorWidget: initTilesetSelectorWidget
};