# DEPRECATED - Red Badger Blog Template for Squarespace

This project is officially deprecated. All functionality has been moved to Hubspot.

Minimalistic Red Badger branded template. Universal. Works with and without JavaScript on the client.

## Setup

```
npm install
make start
```

## Advanced use

Start squarespace local server with options:
```
npm run dev -- --auto-reload
```

You can view all the options with the command:
```npm run help```


## Supported post elements

All Squarespace block elements are tested and should work as expected. You will need JS enabled client for some of the interactive elements.

## Amplitude Tracking
Amplitude is an analytics tool. Currently this squarespace site is using the production Amplitude apiKey in local development as squarespace does not allow for configuration for this. This could be improved upon in the future.

If you plan on adding more event tracking to Amplitude then please change the apiKey you are using in local development to the Amplitude development project `d246f18b3c6f5dd21660ba24e1af2919` (this is exposed in the website html and can be public) found in `site.region` where the Amplitude instance is initiated `amplitude.getInstance().init(<APIKEY HERE>);`.

For access to Amplitude contact Andrew Cumine, Dominik Piatek, James Muldoon, or Nathalie Goepel.

## Deployment

Squarespace provides us with git endpoint. Deployment is happening by pushing current master branch to that endpoint.
You can now deploy to squarespace using BadgerBot. Run `@badgerbot2 blog` in Slack: #internal-projects. Badgerbot uses the `hello@red-badger.com` squarespace account to deploy.

`@badgerbot2 blog deploy` to deploy

There is currently no staging environment.
