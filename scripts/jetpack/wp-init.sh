#!/bin/bash

node /wp-tunnel-init.js&

exec apache2-foreground
