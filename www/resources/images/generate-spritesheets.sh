#!/bin/sh

echo $1

octave --no-gui --eval "combineSpriteSheets2('$1')"
