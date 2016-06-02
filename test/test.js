
/**
 * Dependencies
 */

var request = require('supertest');
var cheerio = require('cheerio');
var assert = require('assert');
var app = require('../app');
var url = require('url');

/**
 * Locals
 */

var TEST_URL = 'https://wilsonpage.github.io/amazing.html?id=123';
var TEST_URL_ENCODED = encodeURIComponent(TEST_URL);

describe('magnet-oembed-service', function() {
  describe('html', function() {
    beforeEach(function(done) {
      request(app)
        .get(`/?url=${TEST_URL_ENCODED}&width=300&height=300`)
        .expect('Content-Type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          this.$ = cheerio.load(res.text);
          done();
        });
    });

    describe('link[type="application/json+oembed"]', function() {
      beforeEach(function() {
        this.oembed = this.$('link[rel="alternate"][type="application/json+oembed"]');
      });

      it('exists', function() {
        assert(this.oembed.length == 1);
      });

      describe('href', function() {
        beforeEach(function() {
          this.href = this.oembed.attr('href');
          this.url = url.parse(this.href, true);
        });

        it('points to the oembed', function() {
          assert(this.href.startsWith('oembed.json'));
        });

        it('contains all query params', function() {
          assert.equal(this.url.query.width, '300');
          assert.equal(this.url.query.height, '300');
        });

        describe('json response', function() {
          beforeEach(function(done) {
            request(app)
              .get('/' + this.url.href)
              .expect(200)
              .end((err, res) => {
                if (err) throw err;
                this.body = res.body;
                done();
              });
          });

          describe('html', function() {
            beforeEach(function() {
              this.$ = cheerio.load(this.body.html);
            });

            describe('iframe', function() {
              beforeEach(function() {
                this.iframe = this.$('iframe')
              });

              it('exists', function() {
                assert.equal(this.iframe.length, 1);
              });

              it('has the correct `src`', function() {
                assert.equal(this.iframe.attr('src'), TEST_URL);
              });

              it('content is flush', function() {
                assert.equal(this.iframe.attr('border'), '0');
              });
            });
          });
        });
      });
    });

    describe('redirect', function() {
      beforeEach(function() {
        this.tag = this.$('meta[http-equiv="refresh"]');
      });

      it('exists', function() {
        assert.equal(this.tag.length, 1);
      });

      it('points to final url', function() {
        var content = this.tag.attr('content');
        assert.equal(content, `0;url=${TEST_URL}`);
      });
    });
  });
});
