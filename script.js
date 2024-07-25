var C = 0.5, NS_URI = 'http://www.w3.org/2000/svg', CUBIC_N = 3, DURATION = 120, N_LAYERS = 7,
    N_POLY = 6, PALETTE = [[255, 22, 12], [255, 255, 255]], items = [], n, timeline = [], a, off;
var createItem = function (parent, layer) {
    var pos, ani;
    pos = document.createElementNS(NS_URI, 'g');
    ani = document.createElementNS(NS_URI, 'path');
    ani.setAttribute('d', timeline[0].d);
    ani.setAttribute('fill', timeline[0].rgb);
    pos.appendChild(ani);
    parent.appendChild(pos);
    items.push({ 'ani': ani, 'layer': layer });
    return pos;
};
var createDistribution = function (container, bri) {
    var bri = bri || 100, alpha, be, lri, le, lrc, beta, de, d, gamma, x, y, layer = N_LAYERS, frag, pos;
    frag = document.createDocumentFragment();
    alpha = 2 * Math.PI / N_POLY;
    be = 2 * bri * Math.tan(0.5 * alpha);
    while (layer--) {
        if (layer) {
            lri = layer * bri;
            le = layer * be;
            lrc = lri / Math.cos(0.5 * alpha);
            for (var i = 0; i < N_POLY; i++) {
                beta = (i - 0.5) * alpha + 0.5 * Math.PI;
                for (var j = 0; j < layer; j++) {
                    de = (0.5 * layer - j) * be;
                    d = Math.hypot(lri, de);
                    gamma = beta + 0.5 * alpha + Math.atan(de / lri);
                    x = d * Math.cos(gamma);
                    y = d * Math.sin(gamma);
                    pos = createItem(frag, layer);
                    pos.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
                }
            }
        }
        else createItem(frag, 0);
    }
    container.appendChild(frag);
};
var getHeartPoints = function (d) {
    var points = [], rp = 0.25 * d, dv = 0.75 * d, kp = C * rp, xo = 2 * rp, kh = -rp - kp, kl = xo + kp;
    points = [[0, -rp], [kp, kh], [xo - kp, kh], [xo, -rp], [kl, kp - rp], [kl, rp - kp], [xo, rp],
    [0, dv], [0, dv], [-xo, rp], [-kl, rp - kp], [-kl, kp - rp], [-xo, -rp], [kp - xo, kh], [-kp, kh], [0, -rp]];
    return points;
};
var getTimeline = function (keypoints, duration) {
    var tl = [], n_curves = 5, pre = ['M'], np, k, k1, d, rgb, x, y;
    for (var i = 0; i < n_curves; i++) {
        for (var j = 0; j < CUBIC_N; j++) { pre.push(j ? ',' : 'C'); }
    }
    np = pre.length;
    for (var i = 0; i <= duration; i++) {
        k = i / duration;
        k1 = 1 - k;
        d = '';
        rgb = [];
        for (var j = 0; j < np; j++) {
            x = k1 * keypoints[0][j][0];
            y = k1 * keypoints[0][j][1];
            d += pre[j] + Math.round(x) + ' ' + Math.round(y);
        }
        for (var j = 0; j < 3; j++) { rgb.push(Math.round(k1 * PALETTE[0][j] + k * PALETTE[1][j])); }
        tl.push({ 'd': d + 'z', 'rgb': 'rgb(' + rgb + ')' });
    }
    return tl;
};
var ani = function (t) {
    var t_rel, d, fy, y, j, k, alpha;
    for (var i = 0; i < n; i++) {
        t_rel = (t - items[i].layer * off + DURATION) % DURATION;
        d = 4 * t_rel / DURATION;
        fy = d * Math.PI;
        y = -Math.round(a * Math.sin(fy));
        if (y <= 0) {
            j = 1 - Math.cos(fy);
            k = Math.floor(d / 2);
            alpha = Math.round(j * 90) + k * 180;
            j = ~~((k * 1 + 0.5 * j * Math.pow(-1, k)) * 0.25 * DURATION);
            items[i].ani.setAttribute('transform', 'translate(0 ' + y + ') rotate(' + alpha + ')');
            items[i].ani.setAttribute('d', timeline[j].d);
            items[i].ani.setAttribute('fill', timeline[j].rgb);
        }
    }
    requestAnimationFrame(ani.bind(this, ++t));
};
(function init() {
    var svg, s, w, h, hdiag, bri, d;
    svg = document.querySelector('svg');
    s = getComputedStyle(svg);
    w = ~~s.width.split('px')[0];
    h = ~~s.height.split('px')[0];
    svg.setAttribute('viewBox', [-w, -h, 2 * w, 2 * h]);
    hdiag = Math.hypot(w, h);
    bri = hdiag / (N_LAYERS - 0.5)
    a = d = 0.5 * bri;
    timeline = getTimeline([getHeartPoints(d)], 0.25 * DURATION);
    createDistribution(svg, bri);
    n = items.length;
    off = Math.round(0.25 * DURATION / (0.5 * N_LAYERS));
    ani(0);
})();