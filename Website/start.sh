#!/bin/bash
echo "=== DeviceNex Starting ==="

# MeshCentral stores data at /meshcentral-data (one level up from /app)
mkdir -p /meshcentral-data

echo "Copying config..."
cp -f /app/meshcentral-default-config.json /meshcentral-data/config.json

echo "Config applied:"
cat /meshcentral-data/config.json

echo "Starting MeshCentral..."
cd /app
exec node meshcentral.js
