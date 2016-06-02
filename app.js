
/**
 * Dependencies
 */

const app = module.exports = require('express')();
const qs = require('querystring');

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index', {
    url: req.query.url,
    query: qs.stringify(req.query)
  });
});

app.get('/oembed.json', function(req, res) {
  var params = req.query;

  if (params.height) {
    params.height = Number(params.height);
  }

  if (params.width) {
    params.width = Number(params.width);
  }

  var json = Object.assign({
    type: 'rich',
    html: `<iframe border="0" src="${params.url}"/>`
  }, params);

  res.json(json);
});
