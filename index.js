var pathPlatform = require('path-platform');

module.exports = function (cwd, opts) {
    if (cwd === undefined) cwd = process.cwd();
    if (!opts) opts = {};
    var platform = opts.platform || process.platform;

    var isWindows = /^win/.test(platform);
    var path = isWindows ? pathPlatform.win32 : pathPlatform;
    var normalize = !isWindows ? path.normalize :
        path.normalize('c:') === 'c:.' ? fixNormalize(path.normalize) :
        path.normalize;
    var sep = isWindows ? /[\\\/]/ : '/';
    var init = isWindows ? '' : '/';
    var pathSep = isWindows ? '\\' : '/';

    var join = function (x, y) {
        var xStr = x && typeof x === 'string';
        var yStr = y && typeof y === 'string';

        if (xStr && yStr) {
            return normalize(x + pathSep + y);
        } else if (yStr) {
            return normalize(y);
        } else if (xStr) {
            return normalize(x);
        } else {
            return '';
        }
    };

    var res = normalize(cwd)
        .split(sep)
        .reduce(function (acc,dir,ix) {
            acc.push(join(acc[ix], dir))
            return acc
        }, [init])
        .slice(1)
        .reverse()
    ;
    if (res[0] === res[1]) return [ res[0] ];
    if (isWindows && /^\\/.test(cwd)) {
        return res.slice(0,-1).map(function (d) {
            var ch = d.charAt(0)
            return ch === '\\' ? d :
              ch === '.' ? '\\' + d.slice(1) :
              '\\' + d
        });
    }
    return res;

    function fixNormalize(fn) {
      return function(p) {
        return fn(p).replace(/:\.$/, ':')
      }
    }
}
