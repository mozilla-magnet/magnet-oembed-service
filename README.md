## magnet-oembed-service

Facilitates serverless oembed content.

```
<SERVICE_ENDPOINT>/?url=http%3A%2F%2Fwilsonpage.github.io%2Fmy-page.html&width=300&height=200
```

### Parameters

- `url` - (required) The URL of the HTML content to embed
- `type` - `photo`, `video`, `link`, `rich` (defaults to `rich`)
- `width` - (optional) The ideal width of the component
- `height` - (optional) The ideal hieght of the component
- `html` - HTML content of your embed widget (defaults to `<iframe src="${url}"/>`)
- `author_name` - (optional)
- `provider_name` - (optional)
- `author_url` - (optional)
- `provider_url` - (optional)
- `cache_age` - (optional)
- `thumbnail_url` - (optional)
- `thumbnail_width` - (optional)
- `thumbnail_height` - (optional)

> For more detail read the [oembed spec](http://oembed.com/)
