

function manyMarker() {

    var map = L.map('map').setView([48.838565, 2.449264526367], 13);
    L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        subdomains: 'abcd',
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        minZoom: 4,
        maxZoom: 18
    }).addTo(map);

    //マーカー最大個数
    var markersLength = 1000000;

    //Draw a marker
    var loader = new PIXI.loaders.Loader();
    loader.add('marker', '../img/marker-icon.png'); //リソースにmarkerという名で'img/marker-icon.png'を登録
    loader.load(function (loader, resources) {  //リソース(marker)をロードする
        var texture = resources.marker.texture;

        var pixiContainer = new PIXI.Container();
        var innerContainer = new PIXI.particles.ParticleContainer(markersLength, { vertices: true });
        innerContainer.texture = texture;
        innerContainer.baseTexture = texture.baseTexture;
        innerContainer.anchor = { x: 0.5, y: 1 };
        pixiContainer.addChild(innerContainer);

        var firstDraw = true;
        var prevZoom;
        var initialScale;

        var pixiOverlay = L.pixiOverlay(function (utils) { //Leafletでズームやパンを行う度にコールされます。ドラッグ中はコールされない
            var zoom = utils.getMap().getZoom(); //Leafletのズーム率  ex. 0～18
            var container = utils.getContainer();
            var renderer = utils.getRenderer();
            var project = utils.latLngToLayerPoint; //Leaflet座標系LatLngからオーバーレイの座標系に投影されたL.Pointを返す。
            var scale = utils.getScale();
            var invScale = 1 / scale;

            if (firstDraw) {
                var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
                innerContainer.x = origin.x;
                innerContainer.y = origin.y;
                initialScale = invScale / 8;
                innerContainer.localScale = initialScale;
                for (var i = 0; i < markersLength; i++) {
                    var coords = project([getRandom(48.7, 49), getRandom(2.2, 2.8)]);
                    // our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
                    innerContainer.addChild({
                        x: coords.x - origin.x,
                        y: coords.y - origin.y
                    });
                }
            }

            if (firstDraw || prevZoom !== zoom) {
                innerContainer.localScale = zoom < 8 ? 0.1 : initialScale;// 1 / scale;
            }

            firstDraw = false;
            prevZoom = zoom;
            renderer.render(container); //オーバーレイ上にあるオブジェクトの再描画する。
        }, pixiContainer);

        pixiOverlay.addTo(map);
    });



    function getRandom(min, max) {
        return min + Math.random() * (max - min);
    }


}