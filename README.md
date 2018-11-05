# Fluxcloud Webhook Monitor

(Forked from: https://github.com/stripe/stripe-webhook-monitor)

`fluxcloud-webhook-monitor` is a real-time monitor for webhooks that provides a live feeds and graph of recent events from [Fluxcloud](https://github.com/justinbarrick/fluxcloud).

Webhooks are powerful: you can subscribe to these notifications and programmatically react to them in real-time.

## Getting started

### Requirements
You'll need to have Node v7.6+ installed, which includes support for `async` / `await`.

### Set up the monitor
Clone the project repository, and create a configuration for your account:

```
cp config.sample.js config.js
```

### Start receiving changes

To start the monitor:

```
npm install
npm start
```

### Local testing

```
curl -X POST http://localhost:4001 -H "Content-Type: application/json" -d @example_hook.json
```


## Credits

- Original Code: [Michael Glukhovsky](https://twitter.com/mglukhovsky)
- Icons: [Ionicons](http://ionicons.com/)
