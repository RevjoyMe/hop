#!/bin/bash

/usr/local/bin/gws -port=4665 -method=POST -path=/postreceive -secret=$WEBHOOK_SECRET -command=$(pwd)/webhook_postreceive.sh
