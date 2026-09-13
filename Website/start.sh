#!/bin/bash
echo "=== DeviceNex Starting ==="

# MeshCentral stores data at /meshcentral-data
mkdir -p /meshcentral-data

echo "Copying base config..."
cp -f /app/meshcentral-default-config.json /meshcentral-data/config.json

# Safely inject SMTP if Environment Variables are provided in Dokploy
if [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASS" ]; then
    echo "Injecting secure SMTP configuration..."
    node -e "
        const fs = require('fs');
        let config = JSON.parse(fs.readFileSync('/meshcentral-data/config.json'));
        config.smtp = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || 465),
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            tls: true
        };
        fs.writeFileSync('/meshcentral-data/config.json', JSON.stringify(config, null, 2));
    "
fi

echo "Starting MeshCentral..."
cd /app
exec node meshcentral.js
