
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

/**
 * Tests
 */

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

    describe('missing url parameter', function() {
      beforeEach(function(done) {
        request(app)
          .get('/')
          .end((err, res) => {
            this.res = res;
            done();
          });
      });

      it('has a 500 status-code', function() {
        assert.equal(this.res.statusCode, 500);
      });

      it('has a message in response body', function() {
        assert.equal(this.res.text, 'Error 500: "requires `url` parameter"');
      });
    });

    describe('complex', function() {
      beforeEach(function(done) {
        this.url = 'https://www.google.co.uk/maps/place/Mozilla/@51.5103676,-0.1292982,17z/data=!3m1!4b1!4m5!3m4!1s0x487604cddabe1063:0x1c87a03dc31daa0e!8m2!3d51.5103676!4d-0.1271095?hl=en';

        this.html = '<html style="height:100%"><body style="height:100%;margin:0"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1552563495684!2d-0.12929818422990874!3d51.51036757963562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604cddabe1063%3A0x1c87a03dc31daa0e!2sMozilla!5e0!3m2!1sen!2suk!4v1464883733950" style="border:0;width:100%;height:100%" allowfullscreen="" frameborder="0"/></body>';

        var params = `url=${encodeURIComponent(this.url)}&html=${encodeURIComponent(this.html)}`;

        request(app)
          .get(`/?${params}`)
          .end((err, res) => {
            if (err) throw err;
            this.$ = cheerio.load(res.text);
            done();
          });
      });

      it('has correct redirect', function() {
        var tag = this.$('meta[http-equiv="refresh"]');
        assert.equal(tag.attr('content'), `0;url=${this.url}`)
      });

      describe('oembed json', function() {
        beforeEach(function(done) {
          var ombedUrl = this.$('link[type="application/json+oembed"]');

          request(app)
            .get('/' + ombedUrl.attr('href'))
            .end((err, res) => {
              if (err) throw err;
              this.body = res.body;
              done();
            });
        });

        it('url is correct', function() {
          assert.equal(this.body.url, this.url);
        });

        it('html is correct', function() {
          assert.equal(this.body.html, this.html);
        });
      });
    });
  });

  describe('json', function() {
    describe('defaults', function() {
      beforeEach(function(done) {
        request(app)
          .get(`/oembed.json?url=${TEST_URL_ENCODED}`)
          .end((err, res) => {
            if (err) throw err;
            this.body = res.body;
            done();
          });
      });

      describe('type', function() {
        it('defaults to "rich"', function() {
          assert.equal(this.body.type, 'rich');
        });
      });

      describe('width', function() {
        it('defaults to 300', function() {
          assert.equal(this.body.width, 300);
        });
      });

      describe('height', function() {
        it('defaults to 600', function() {
          assert.equal(this.body.height, 600);
        });
      });
    });

    describe('numbers', function() {
      beforeEach(function(done) {
        request(app)
          .get(`/oembed.json?url=${TEST_URL_ENCODED}&width=300&height=600&thumbnail_width=300&thumbnail_height=600&cache_age=30`)
          .end((err, res) => {
            if (err) throw err;
            this.body = res.body;
            done();
          });
      });

      it('are typeof Number', function() {
        assert.strictEqual(this.body.width, 300);
        assert.strictEqual(this.body.height, 600);
        assert.strictEqual(this.body.thumbnail_height, 600);
        assert.strictEqual(this.body.thumbnail_width, 300);
        assert.strictEqual(this.body.cache_age, 30);
      });
    });

    describe('html', function() {
      describe('defined', function() {
        beforeEach(function(done) {
          var html = encodeURIComponent('<h1>hello</h1>');
          request(app)
            .get(`/oembed.json?url=${TEST_URL_ENCODED}&html=${html}`)
            .end((err, res) => {
              if (err) throw err;
              this.body = res.body;
              this.$ = cheerio.load(this.body.html);
              done();
            });
        });

        it('uses `html` when given', function() {
          assert.equal(this.$('h1').html(), 'hello');
        });
      });

      describe('undefined', function() {
        beforeEach(function(done) {
          request(app)
            .get(`/oembed.json?url=${TEST_URL_ENCODED}`)
            .end((err, res) => {
              if (err) throw err;
              this.body = res.body;
              this.$ = cheerio.load(this.body.html);
              done();
            });
        });

        it('defaults to `<frame>`', function() {
          var iframe = this.$('iframe');
          assert.equal(iframe.attr('src'), TEST_URL);
        });
      });
    });
  });

  describe('404', function() {
    beforeEach(function(done) {
      request(app)
        .get('/unknown-page')
        .end((err, res) => {
          this.res = res;
          done();
        });
    });

    it('has 404 status code', function() {
      assert.strictEqual(this.res.statusCode, 404);
    });

    it('has a message body', function() {
      assert.equal(this.res.text, 'Error 404: "page not found"');
    });
  });
});
