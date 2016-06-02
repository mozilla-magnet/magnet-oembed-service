
/**
 * Dependencies
 */

const app = module.exports = require('express')();
const qs = require('querystring');

app.set('view engine', 'ejs');

app.get('/', function(req, res, next) {
  var url = req.query.url;

  // everything breaks if we don't have a url parameter
  if (!url) return next(new Error('requires `url` parameter'));

  res.render('index', {
    url: req.query.url,
    query: qs.stringify(req.query)
  });
});

app.get('/oembed.json', function(req, res) {
  var params = req.query;

  var json = Object.assign({
    type: 'rich',
    width: 300,
    height: 600,
    html: `<iframe border="0" src="${params.url}"/>`
  }, params);

  coerce(json, [
    'width',
    'height',
    'thumbnail_width',
    'thumbnail_height',
    'cache_age'
  ], Number)

  res.json(json);
});

// hit when no route is matched
app.use(function(req, res) {
  res.status(404);
  res.send(`Error 404: "page not found"`);
});

// hit when `next(new Error())`
app.use(function(err, req, res, next) { // eslint-disable-line
  res.status(500);
  res.send(`Error 500: "${err.message}"`);
});

/**
 * Utils
 */

function coerce(object, keys, type) {
  keys.forEach(key => {
    var value = object[key];
    if (value === undefined) return;
    object[key] = type(value);
  });
}
