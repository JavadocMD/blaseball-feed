# blaseball-feed

A CLI utility for following blaseball event feeds.

## Usage

By default, this client follows live game updates for your selected team and prints them to the console. This of course can be useful for all sorts of things.

On Linux, for example, you can pipe output to `espeak-ng` (probably available in your distro's package manager) to speak aloud the blaseball updates for your favorite team:

```
$ ./blaseball-feed --team "Mexico City Wild Wings" | espeak-ng -v en-us -s 125
```

Robotic and terrifying!
