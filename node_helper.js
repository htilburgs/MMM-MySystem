const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const fs = require("fs");

module.exports = NodeHelper.create({
  start: function() {
    console.log("MMM-MySystem helper started...");
    this.config = {};

    // Auto-detect OS version
    const self = this;
    fs.readFile("/etc/os-release", "utf8", (err, data) => {
      if (!err && data && !self.config.osVersion) {
        if (data.includes("bookworm")) self.config.osVersion = "Bookworm";
        else if (data.includes("trixie")) self.config.osVersion = "Trixie";
        else self.config.osVersion = "Trixie";
      }
    });
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG") this.config = payload;
    if (notification === "UPDATE") this.getSystemData();
  },

  getSystemData: function() {
    const self = this;
    let data = {};
    const cmd = (key, defaultCmd) => self.config.customCommands[key] || defaultCmd;

    const execCmd = (command) =>
      new Promise((resolve) => exec(command, (err, stdout) => resolve(err ? null : stdout.trim())));

    const commands = [];

    // CPU Temperature
    if (this.config.showCPU) {
      let cpuCmd = this.config.osVersion === "Trixie"
        ? "cat /sys/class/thermal/thermal_zone0/temp"
        : "sensors | grep 'Package id 0:' | awk '{print $4}'";
      cpuCmd = cmd("cpu", cpuCmd);
      commands.push(execCmd(cpuCmd).then(res => {
        if (res) {
          let temp = parseFloat(res) / (res > 1000 ? 1000 : 1);
          if (self.config.tempUnit === "F") temp = temp * 9 / 5 + 32;
          data.cpu = temp.toFixed(1) + "°" + self.config.tempUnit;
        }
      }));
    }

    // Memory %
    if (this.config.showMemory) {
      let memCmd = "free | awk '/^Mem/ {printf \"%.0f\", $7/$2*100}'";
      memCmd = cmd("memory", memCmd);
      commands.push(execCmd(memCmd).then(res => { if (res) data.memory = res + "%"; }));
    }

    // Uptime
    if (this.config.showUptime) {
      let uptimeCmd = "uptime -p";
      uptimeCmd = cmd("uptime", uptimeCmd);
      commands.push(execCmd(uptimeCmd).then(res => { if (res) data.uptime = res; }));
    }

    // Disk – only free space of root partition
    if (this.config.showDisk) {
      let diskCmd = "df -h / | awk 'NR==2 {print $4 \" (\" $5 \")\"}'";
      diskCmd = cmd("disk", diskCmd);
      commands.push(execCmd(diskCmd).then(res => {
        if (res) data.disk = res;
        else data.disk = "N/A";
      }));
    }

    // IP Address (ETH/WiFi)
    if (this.config.showIP) {
      const getIP = iface => `ip -4 addr show ${iface} 2>/dev/null | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}' || echo ""`;
      const ethCmd = cmd("ip_eth", getIP("eth0"));
      const wifiCmd = cmd("ip_wifi", getIP("wlan0"));

      commands.push(execCmd(ethCmd).then(res => { data.ethIP = res ? res.trim() : "N/A"; }));
      commands.push(execCmd(wifiCmd).then(res => { data.wifiIP = res ? res.trim() : "N/A"; }));
    }

    // Execute all commands in parallel
    Promise.all(commands).then(() => {
      if (this.config.showIP) {
        let ipStr = "";
        if (data.ethIP) ipStr += `ETH: ${data.ethIP} `;
        if (data.wifiIP) ipStr += `WIFI: ${data.wifiIP}`;
        data.ip = ipStr.trim();
      }
      self.sendSocketNotification("SYSTEM_DATA", data);
    });
  }
});
