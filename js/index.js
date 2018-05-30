
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


//Draw a marker
var loader = new PIXI.loaders.Loader();
loader.add('marker', '../img/marker-icon.png'); //リソースにmarkerという名で'img/marker-icon.png'を登録
loader.load(function (loader, resources) {  //リソース(marker)をロードする
    var markerTexture = resources.marker.texture;
    var markerLatLng = [51.5, -0.09];
    var marker = new PIXI.Sprite(markerTexture);
    marker.anchor.set(0.5, 1); //原点をX:中央 Y:下　に設定

    var pixiContainer = new PIXI.Container();
    pixiContainer.addChild(marker);

    var firstDraw = true;
    var prevZoom;

    var pixiOverlay = L.pixiOverlay(function (utils) { //Leafletでズームやパンを行う度にコールされます。ドラッグ中はコールされない
        var zoom = utils.getMap().getZoom();
        var container = utils.getContainer();
        var renderer = utils.getRenderer();
        var project = utils.latLngToLayerPoint; //Leaflet座標系LatLngからオーバーレイの座標系に投影されたL.Pointを返す。
        var scale = utils.getScale();

        if (firstDraw) {
            var markerCoords = project(markerLatLng); //Leaflet座標系LatLngからオーバーレイの座標系に投影されたL.Pointを返す。
            marker.x = markerCoords.x; //ex. markerLatLng[0] 51.5 → 65503.232
            marker.y = markerCoords.y; //ex. markerLatLng[1] -0.09 → 43589.11367487424
        }

        if (firstDraw || prevZoom !== zoom) { //Leafletのズーム率  ex. 0～18
            marker.scale.set(1 / scale);
        }

        firstDraw = false;
        prevZoom = zoom;
        renderer.render(container); //オーバーレイ上にあるオブジェクトの再描画する。
    }, pixiContainer);

    pixiOverlay.addTo(map);
});

