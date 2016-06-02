
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
  var json = Object.assign({}, req.query);
  json.html = `<iframe border="0" src="${json.url}"/>`;
  res.json(json);
});
