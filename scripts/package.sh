#!/bin/bash

rm -rf pkg

yarn pkg -t node14-win-x64 -o pkg/win/blaseball-feed.exe dist/cli.js
yarn pkg -t node14-macos-x64 -o pkg/macos/blaseball-feed dist/cli.js
yarn pkg -t node14-linux-x64 -o pkg/linux/blaseball-feed dist/cli.js

chmod +x pkg/linux/blaseball-feed
chmod +x pkg/macos/blaseball-feed

tar -czf pkg/blaseball-feed-linux-amd64.tgz pkg/linux/blaseball-feed
tar -czf pkg/blaseball-feed-macos-amd64.tgz pkg/macos/blaseball-feed
zip pkg/blaseball-feed-win-amd64.zip pkg/win/blaseball-feed.exe
