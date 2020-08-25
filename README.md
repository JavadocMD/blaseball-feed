# blaseball-feed

A CLI utility for following blaseball event feeds.

## Usage

By default, this client follows live game updates for your selected team and prints them to the console. This of course can be useful for all sorts of things.

On Linux, for example, you can pipe output to `espeak-ng` (probably available in your distro's package manager) to speak aloud the blaseball updates for your favorite team:

```
$ ./blaseball-feed --team "Mexico City Wild Wings" | espeak-ng -v en-us -s 125
```

Robotic and terrifying!

But you can also use it to replay recorded history by feeding in a file containing game event data (one JSON event object per line). If I had such a file in a gzip archive, I could unzip it and pipe it in via standard input:

```
$ gunzip -c ./data.json.gz | ./blaseball-feed -st "Mexico City Wild Wings"
```
