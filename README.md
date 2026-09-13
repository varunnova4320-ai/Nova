# ??? MeshCentral

<div align="center">

**A full-featured, open-source, web-based remote computer management platform.**

[![Version](https://img.shields.io/badge/version-1.2.5-blue.svg)](https://github.com/Ylianst/MeshCentral)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![GitHub Issues](https://img.shields.io/github/issues/Ylianst/MeshCentral)](https://github.com/Ylianst/MeshCentral/issues)

[Website](https://meshcentral.com) � [Documentation](https://ylianst.github.io/MeshCentral/) � [YouTube](https://www.youtube.com/channel/UCJWz607A8EVlkilzcrb-GKg/videos) � [Discord](https://discord.gg/8wHC6ASWAc)

</div>

---

## ?? Table of Contents

- [About](#-about)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Docker Support](#-docker-support)
- [Project Structure](#-project-structure)
- [Dependencies](#-dependencies)
- [Documentation](#-documentation)
- [Video Tutorials](#-video-tutorials)
- [Community](#-community)
- [Feedback & Issues](#-feedback--issues)
- [License](#-license)

---

## ?? About

**MeshCentral** is a full computer management web application. Run your own web server to remotely manage and control computers � whether they are on a local network or anywhere on the internet.

Once your server is running:
1. Create a **device group**
2. Download and install the **MeshAgent** on each computer
3. Within minutes, devices appear in your web dashboard � ready for remote control

MeshCentral includes **full web-based remote desktop, terminal, and file management** with no additional software needed on the admin side.

---

## ? Features

| Feature | Description |
|---|---|
| ??? Remote Desktop (KVM) | Full browser-based remote desktop for Windows, Linux, and macOS |
| ??? Remote Terminal | Web-based SSH/shell terminal access |
| ?? Remote File Access | Browse, upload, download, and manage files remotely |
| ?? Two-Factor Authentication | TOTP-based 2FA support |
| ?? Intel AMT Support | Full Intel Active Management Technology integration |
| ?? MQTT Broker | Built-in MQTT broker for IoT device communication |
| ?? Relay Server | WebSocket relay for agent-browser communication |
| ??? WebAuthn Support | Hardware security key (FIDO2) authentication |
| ?? Email Notifications | Configurable email alert system |
| ?? SMS Notifications | SMS messaging support |
| ?? Multi-Domain | Host multiple isolated domains on a single server |
| ?? Plugin System | Extensible plugin architecture |
| ?? Docker Support | Official Docker deployment support |
| ?? Let's Encrypt | Built-in automatic TLS certificate management |
| ?? CrowdSec | Integrated CrowdSec security bouncer |

---

## ? Prerequisites

- **Node.js** `>= 20.0.0`
- **npm** (bundled with Node.js)
- A **domain name** (for production deployments with TLS)
- Ports **80** and **443** accessible (or custom ports)

---

## ?? Installation

### Option 1: Install via npm (Recommended)

```bash
npm install -g meshcentral
meshcentral
```

### Option 2: Clone from GitHub

```bash
git clone https://github.com/Ylianst/MeshCentral.git
cd MeshCentral
npm install
node meshcentral.js
```

### Option 3: Windows Service

MeshCentral can be installed as a Windows service:

```bash
node meshcentral.js --install
```

To uninstall:

```bash
node meshcentral.js --uninstall
```

---

## ?? Configuration

MeshCentral uses a JSON configuration file. On first run, a default config will be created at `meshcentral-data/config.json`. You can start from the provided samples:

- [`sample-config.json`](./sample-config.json) � minimal setup
- [`sample-config-advanced.json`](./sample-config-advanced.json) � all available options
- [`meshcentral-config-schema.json`](./meshcentral-config-schema.json) � full schema reference

### Basic Configuration Example

```json
{
  "settings": {
    "cert": "myserver.mydomain.com",
    "port": 443,
    "redirPort": 80
  },
  "domains": {
    "": {
      "title": "My MeshCentral Server",
      "newAccounts": true,
      "userNameIsEmail": true
    }
  }
}
```

### Key Configuration Options

| Option | Description |
|---|---|
| `settings.cert` | Your server domain name |
| `settings.port` | HTTPS port (default: `443`) |
| `settings.redirPort` | HTTP redirect port (default: `80`) |
| `settings.WANonly` | Enable WAN-only mode |
| `settings.LANonly` | Enable LAN-only mode |
| `settings.sessionKey` | Session encryption key |
| `domains.*.title` | Web UI title |
| `domains.*.newAccounts` | Allow new user registrations |

### Let's Encrypt TLS

```json
{
  "letsencrypt": {
    "email": "your@email.com",
    "names": "myserver.mydomain.com",
    "production": true
  }
}
```

---

## ?? Docker Support

MeshCentral supports Docker deployment via the `docker/` directory.

```bash
cd docker
docker-compose up -d
```

See the [Docker documentation](https://ylianst.github.io/MeshCentral/meshcentral/docker/) for full setup details including volume configuration and environment variables.

---

## ?? Project Structure

```
MeshCentral/
+-- meshcentral.js            # Main entry point / server orchestrator
+-- webserver.js              # Main HTTPS web server
+-- meshagent.js              # Agent connection handler
+-- meshuser.js               # User management & API
+-- meshrelay.js              # WebSocket relay server
+-- db.js                     # Database abstraction layer
+-- certoperations.js         # TLS certificate management
+-- amtmanager.js             # Intel AMT device manager
+-- pluginHandler.js          # Plugin system
+-- apprelays.js              # Application relay services
+-- meshmail.js               # Email notification system
+-- meshsms.js                # SMS notification system
+-- letsencrypt.js            # Let's Encrypt integration
+-- webauthn.js               # WebAuthn / FIDO2 support
+-- crowdsec.js               # CrowdSec security integration
+-- mqttbroker.js             # MQTT broker
+-- mpsserver.js              # Intel AMT CIRA server
+-- multiserver.js            # Multi-server/cluster support
+-- agents/                   # Pre-built agent binaries
+-- public/                   # Static web assets (JS, CSS, images)
+-- views/                    # Handlebars HTML templates
+-- emails/                   # Email templates
+-- translate/                # Localization / translation files
+-- docker/                   # Docker deployment files
+-- docs/                     # Documentation
+-- amt/                      # Intel AMT utilities
+-- rdp/                      # RDP protocol support modules
```

---

## ?? Dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | 4.22.2 | Web framework |
| `ws` | 8.21.1 | WebSocket server |
| `@seald-io/nedb` | 4.1.2 | Embedded database |
| `node-forge` | 1.4.0 | TLS / cryptography |
| `otplib` | 13.4.1 | TOTP two-factor authentication |
| `express-handlebars` | 7.1.3 | HTML templating engine |
| `archiver` | 7.0.1 | File archiving and backup |
| `cbor` | 5.2.0 | WebAuthn CBOR encoding |
| `compression` | 1.8.1 | HTTP response compression |
| `cookie-session` | 2.1.1 | Session management |
| `minimist` | 1.2.8 | CLI argument parsing |
| `ua-parser-js` | 1.0.40 | User agent detection |
| `ipcheck` | 0.1.0 | IP address validation |
| `yauzl` | 2.10.0 | ZIP file extraction |
| `@zip.js/zip.js` | 2.8.26 | ZIP archive support |
| `multiparty` | 4.3.0 | Multipart form handling |

---

## ?? Documentation

| Resource | Description |
|---|---|
| [Full Online Docs](https://ylianst.github.io/MeshCentral/) | Searchable docs: config, databases, TLS, SSO, plugins, and more |
| [Design & Architecture Guide](https://meshcentral.com/docs/MeshCentral2DesignArchitecture.pdf) | Internals: certificates, WebRTC, agent handshake |
| [User's Guide](https://meshcentral.com/docs/MeshCentral2UserGuide.pdf) | End-user feature walkthrough |
| [Installation Guide](https://meshcentral.com/docs/MeshCentral2InstallGuide.pdf) | Step-by-step setup for all platforms |

---

## ?? Video Tutorials

All tutorials are on the [MeshCentral YouTube Channel](https://www.youtube.com/channel/UCJWz607A8EVlkilzcrb-GKg/videos).

**Getting Started**

[![Installation](https://img.youtube.com/vi/GsQbWZmRRAU/mqdefault.jpg)](https://www.youtube.com/watch?v=GsQbWZmRRAU)  
?? *Installing MeshCentral on Windows, Linux, and macOS*

[![Basic Usage](https://img.youtube.com/vi/D9Q7M7PdTg0/mqdefault.jpg)](https://www.youtube.com/watch?v=D9Q7M7PdTg0)  
?? *Basic usage � agent install, remote desktop, terminal & file access*

**Advanced Topics**

[![2FA](https://img.youtube.com/vi/luLZKcma9l0/mqdefault.jpg)](https://www.youtube.com/watch?v=luLZKcma9l0)  
?? *Setting up Two-Factor Authentication*

[![NGINX Reverse Proxy](https://img.youtube.com/vi/YSmiLyKSX2I/mqdefault.jpg)](https://www.youtube.com/watch?v=YSmiLyKSX2I)  
?? *MeshCentral with NGINX Reverse Proxy*

[![Android Agent](https://img.youtube.com/vi/wi1HYdW00Bk/mqdefault.jpg)](https://www.youtube.com/watch?v=wi1HYdW00Bk)  
?? *Installing and using the Android agent*

[![Router / TCP Mapping](https://img.youtube.com/vi/BubeVRmbCRM/mqdefault.jpg)](https://www.youtube.com/watch?v=BubeVRmbCRM)  
?? *Using MeshCentral Router for TCP port mapping*

---

## ?? Community

| Platform | Link |
|---|---|
| ?? Website | [meshcentral.com](https://meshcentral.com) |
| ?? YouTube | [MeshCentral Channel](https://www.youtube.com/channel/UCJWz607A8EVlkilzcrb-GKg/videos) |
| ?? Reddit | [r/MeshCentral](https://www.reddit.com/r/MeshCentral/) |
| ?? Blog | [meshcentral2.blogspot.com](https://meshcentral2.blogspot.com/) |
| ?? LinkedIn | [MeshCentral Group](https://www.linkedin.com/groups/13067101/) |
| ?? Discord | [discord.gg/8wHC6ASWAc](https://discord.gg/8wHC6ASWAc) |
| ?? Telegram | [t.me/meshcentral](https://t.me/meshcentral) |
| ?? Monthly Meetings | [Community Meetings Info](https://github.com/Ylianst/MeshCentral/wiki/Community-Monthly-Meetings) |
| ?? Meeting Recordings | [Watch Past Meetings](https://videos.evoludata.com/w/p/tUnLpw6z1LCASuATa7wnCo) |

---

## ?? Feedback & Issues

Found a bug or have a suggestion? Please [open an issue](https://github.com/Ylianst/MeshCentral/issues/).

When reporting a bug, include:

- [ ] MeshCentral version (`node meshcentral.js --version`)
- [ ] Operating system and version
- [ ] Node.js version (`node --version`)
- [ ] Steps to reproduce
- [ ] Observed vs. expected behavior
- [ ] Any error logs

### Related Project Issues

| Project | Link |
|---|---|
| MeshAgent | [github.com/Ylianst/MeshAgent/issues](https://github.com/Ylianst/MeshAgent/issues) |
| MeshRouter | [github.com/Ylianst/MeshCentralRouter/issues](https://github.com/Ylianst/MeshCentralRouter/issues) |

---

## ?? License

This software is licensed under the **[Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)**.

```
Copyright (c) Intel Corporation 2018�2024
Author: Ylian Saint-Hilaire <ylianst@gmail.com>
```

---

<div align="center">
Made with ?? by <a href="https://github.com/Ylianst">Ylian Saint-Hilaire</a> and the MeshCentral Community
</div>
