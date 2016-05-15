var $ = require('jquery');
var sprintf = require("sprintf-js").sprintf;

var zoomFn = function(map, e, zoomout) {
    var mouseX = map.camera[0] + e.clientX * map.camera[2];
    var mouseY = map.camera[1] + e.clientY * map.camera[2];
    if (!zoomout) {
        map.camera[2] = Math.max(map.camera[2] / 2, 0.125);
    } else {
        map.camera[2] = Math.min(map.camera[2] * 2, 16);
    }
    map.camera[0] = mouseX - (e.clientX * map.camera[2]);
    map.camera[1] = mouseY - (e.clientY * map.camera[2]);
};

// function to be renamed (and probably changed) later.
var grue_zoom = function(zoomout, evt) {
    // if no event, fake it and center on current view.
    if( !evt ) {
        evt = {};
        evt.clientX = window.$$$currentMap.renderContainer.width() / 2;
        evt.clientY = window.$$$currentMap.renderContainer.height() / 2;
    }

    zoomFn( window.$$$currentMap, evt, zoomout );
}

var toolLogic = {

    "DRAG" : {
        "dragging": false,
        "last_mouse": [0,0],

        "mousedown": function(map, e) {
            toolLogic.DRAG.dragging = true;
            window.$MAP_WINDOW.draggable('disable');
            toolLogic.DRAG.last_mouse = [ e.clientX, e.clientY ];
        },
        "mousemove": function(map, e) {
            if( toolLogic.DRAG.dragging ) {
                map.camera[0] += (toolLogic.DRAG.last_mouse[0] - e.clientX) * map.camera[2];
                map.camera[1] += (toolLogic.DRAG.last_mouse[1] - e.clientY) * map.camera[2];
                toolLogic.DRAG.last_mouse = [ e.clientX, e.clientY ];
            }
        },
        "mouseup": function(map, e) {
            toolLogic.DRAG.dragging = false;
            map.updateLocationFn(map);
            window.$MAP_WINDOW.draggable('enable');
        }

        /*,
        "mousewheel": function(map, e) {
            zoomFn(map, e, e.originalEvent.deltaY < 0);
        }*/
    },

    "EYEDROPPER" : {
        "mousedown": function(map, e) {
            if( !window.selected_layer ) {
                console.log("You havent selected a layer yet.");
                return;
            }

            if( !(e.button === 0 || e.button === 2) ) {
                console.log("Unknown eyedropper button: we know left/right (0/2), got: '"+e.button+"'.");
                return;
            }

            var oX, oY, tX, tY, tIdx, selector;
            var mapOffsetX = map.camera[0];
            var mapOffsetY= map.camera[1];
            var mouseOffsetX = e.offsetX;
            var mouseOffsetY = e.offsetY;

            oX = mapOffsetX + mouseOffsetX;
            oY = mapOffsetY + mouseOffsetY;

            tX = parseInt(oX/16);
            tY = parseInt(oY/16);

            tIdx = map.getTile(tX,tY,window.selected_layer.map_tileData_idx)

            window.$CURRENT_SELECTED_TILES[e.button] = tIdx;
            $("#info-selected-tiles").text(
                window.$CURRENT_SELECTED_TILES[0] +
                ","+
                window.$CURRENT_SELECTED_TILES[2]
            );

            if( e.button === 2 ) {
                selector = "#right-palette";
            } else {
                selector = "#left-palette";
            }

            setTileSelectorUI( selector, tIdx, map );

            //map.dragging = true;
            //window.$MAP_WINDOW.draggable('disable');
            //map.lastMouse = [ e.clientX, e.clientY ];
        },
        "mouseup": function(map, e) {
            console.log("EYEDROPPER->mouseup: NOTHING");
        },
        "mousemove": function(map, e) {
            console.log("EYEDROPPER->mousemove: NOTHING");
        }
    },

    "DRAW" : {
        "mousedown": function(map, e) {
            if( !window.selected_layer ) {
                console.log("You havent selected a layer yet.");
                return;
            }

            if( !(e.button === 0 || e.button === 2) ) {
                console.log("Unknown draw button: we know left/right (0/2), got: '"+e.button+"'.");
                return;
            }

            window.foo = true;

            var oX, oY, tX, tY, tIdx, selector;
            var mapOffsetX = map.camera[0];
            var mapOffsetY= map.camera[1];
            var mouseOffsetX = e.offsetX;
            var mouseOffsetY = e.offsetY;

            oX = mapOffsetX + mouseOffsetX;
            oY = mapOffsetY + mouseOffsetY;

            tX = parseInt(oX/16);
            tY = parseInt(oY/16);

            map.setTile(
                tX,tY,
                window.selected_layer.map_tileData_idx,
                window.$CURRENT_SELECTED_TILES[e.button]
            );
        },
        "mouseup": function(map, e) {
            console.log("EYEDROPPER->mouseup: NOTHING");
        },

        /// todo this doesn't seem to drag correctly for rightmouse...
        /// todo this doesn't perform correctly if you move the mouse too quickly.  Should keep track of position-1, draw a line between points, and change all those on this layer?
        "mousemove": function(map, e) {

            /// if there's one button pressed and it's the left or right button...
            if( e.buttons === 1 && (e.button===0 || e.button===2) ) {

                // TODO this duplicates work. if it's costly, check before everything.  I doubt it'll matter.
                toolLogic["DRAW"]["mousedown"](map, e); // let's be lazy.
            }
        }
    }
};

var tools = function( action, map, evt ) {
    var mode = window.TOOLMODE;

    if( toolLogic.hasOwnProperty(mode) && toolLogic[mode].hasOwnProperty(action) ) {
        toolLogic[mode][action](map, evt);
    } else {
        console.log( sprintf("No action '%s' for mode '%s'", action, mode) );
    }
};

function initToolsToMapContainer( renderContainer ) {

    renderContainer.on('mousedown', function(e) {
        tools( 'mousedown', window.$$$currentMap, e );
    });
    renderContainer.on('mousemove', function(e) {
        tools( 'mousemove', window.$$$currentMap, e );
    });
    renderContainer.on('mouseup', function(e) {
        tools( 'mouseup', window.$$$currentMap, e );
    });
    renderContainer.on('mousewheel', function(e) {
        tools( 'mousewheel', window.$$$currentMap, e );
    });
}

initToolsToMapContainer( $('.map_canvas') );

$("#btn-tool-drag").click( function(e) {
    $("#tool-title").text("Drag");
    window.TOOLMODE = "DRAG";
} );

$("#btn-tool-eyedropper").click( function(e) {
    $("#tool-title").text("Eyedropper");
    window.TOOLMODE = "EYEDROPPER";
} );

$("#btn-tool-draw").click( function(e) {
    $("#tool-title").text("Draw");
    window.TOOLMODE = "DRAW";
} );

var updateZoomText = function() {

    var txt = (100 / window.$$$currentMap.camera[2]) + "%";

    $("#info-zoom").text(txt);
};

$("#btn-tool-zoomin").click( function(e) {
    grue_zoom(false);
    updateZoomText();
} );

$("#btn-tool-zoomout").click( function(e) {
    grue_zoom(true);
    updateZoomText();
} );

$("#btn-tool-drag").click();

$('.map-palette').mouseup( function() {

    var key = 'map-'+ window.$$$currentMap.mapData.name;
    var $m = $(this);

    localStorage[key] = 'yes';

    localStorage[key+'-width'] = $m.width();
    localStorage[key+'-height'] = $m.height();
    localStorage[key+'-top'] = $m.css('top');
    localStorage[key+'-left'] = $m.css('left');
} );


function initializeTileSelectorsForMap(imageFile) {
    $("#left-palette").removeAttr('style');
    $("#right-palette").removeAttr('style');

    $('#left-palette').css('background-image', 'url(' + imageFile + ')');
    $('#right-palette').css('background-image', 'url(' + imageFile + ')');

    $('#left-palette').css('background-position', '0px 0px');
    $('#right-palette').css('background-position', '0px 0px');

    $('#left-palette').css('background-size', '2000%');
    $('#right-palette').css('background-size', '2000%');
}

var _last_map = null;
function setTileSelectorUI( whichOne, vspIDX, map ) {
  if( _last_map != map ) {
    initializeTileSelectorsForMap(map.vspData.source_image);
    _last_map = map;
  }

  var loc = map.getVSPTileLocation(vspIDX);
  $(whichOne).css('background-position', '-'+(loc.x*2)+'px -'+(loc.y*2)+'px'); //(offset *2)
}

$('#btn-add-tree').on('click', (e) => {
    window.TOOLMODE = 'TREE';
    window.$$$currentMap.entityPreview = {
        location: { tx: 0, ty: 0 },
        animation: "Idle Down",
        filename: "chrs_json/object_tree2.json"
    };

    toolLogic.TREE = {
        mousemove: (map, evt) => {
            var mapOffsetX = map.camera[0];
            var mapOffsetY= map.camera[1];
            var mouseOffsetX = evt.offsetX;
            var mouseOffsetY = evt.offsetY;
            var tilesize = map.vspData[window.selected_layer.layer.vsp].tilesize;

            map.entityPreview.location.tx = Math.floor((mapOffsetX + (mouseOffsetX * map.camera[2])) / tilesize.width);
            map.entityPreview.location.ty = Math.floor((mapOffsetY + (mouseOffsetY * map.camera[2])) / tilesize.height);
        },
        mouseup: (map, evt) => {
            map.entityPreview = null;
            window.TOOLMODE = 'DRAG';
        },
        mousedown: () => {},
        moousewheel: () => {}
    }
});

export var Tools = {};