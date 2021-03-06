
function manyMarker() {


    var map = L.map('map').setView([48.838565, 2.449264526367], 13);
    L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        subdomains: 'abcd',
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        minZoom: 4,
        maxZoom: 18
    }).addTo(map);


    // this is used to simulate leaflet zoom animation timing: リーフレットのズームアニメーションのタイミングをシミュレートするために使用されます。
    var easing = BezierEasing(0, 0, 0.25, 1);

    function getRandom(min, max) {
        return min + Math.random() * (max - min);
    }

    var markersLength = 1000000;
    var loader = new PIXI.loaders.Loader();
    loader.add('marker', 'img/marker-icon.png');
    document.addEventListener("DOMContentLoaded", function () {
        loader.load(function (loader, resources) {
            var texture = resources.marker.texture;

            var zoomChangeTs = null;
            var pixiContainer = new PIXI.Container();
            var innerContainer = new PIXI.particles.ParticleContainer(markersLength, { vertices: true });
            // add properties for our patched particleRenderer:
            innerContainer.texture = texture;
            innerContainer.baseTexture = texture.baseTexture;
            innerContainer.anchor = { x: 0.5, y: 1 };

            pixiContainer.addChild(innerContainer);
            var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            var initialScale;


            var pixiLayer = L.pixiOverlay(function (utils, event) {
                var zoom = utils.getMap().getZoom();
                var container = utils.getContainer();
                var renderer = utils.getRenderer();
                var project = utils.latLngToLayerPoint;
                var getScale = utils.getScale;
                var invScale = 1 / getScale();


                if (event.type === 'add') {
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

                if (event.type === 'zoomanim') {
                    var targetZoom = event.zoom;
                    if (targetZoom >= 16 || zoom >= 16) {
                        zoomChangeTs = 0;
                        var targetScale = targetZoom >= 16 ? 1 / getScale(event.zoom) : initialScale;
                        innerContainer.currentScale = innerContainer.localScale;
                        innerContainer.targetScale = targetScale;
                    }
                    return;
                }

                if (event.type === 'redraw') {
                    var delta = event.delta;
                    if (zoomChangeTs !== null) {
                        var duration = 17;
                        zoomChangeTs += delta;
                        var lambda = zoomChangeTs / duration;
                        if (lambda > 1) {
                            lambda = 1;
                            zoomChangeTs = null;
                        }
                        lambda = easing(lambda);
                        innerContainer.localScale = innerContainer.currentScale + lambda * (innerContainer.targetScale - innerContainer.currentScale);
                    } else { return; }
                }

                renderer.render(container);
            }, pixiContainer, {
                    doubleBuffering: doubleBuffering,
                    destroyInteractionManager: true
                });

            pixiLayer.addTo(map);




            var ticker = new PIXI.ticker.Ticker();
            ticker.add(function (delta) {
                pixiLayer.redraw({ type: 'redraw', delta: delta });
            });
            map.on('zoomstart', function () {
                ticker.start();
            });
            map.on('zoomend', function () {
                ticker.stop();
            });
            map.on('zoomanim', pixiLayer.redraw, pixiLayer);
        });
    });


}

