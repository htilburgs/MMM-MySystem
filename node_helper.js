const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const fs = require("fs");

module.exports = NodeHelper.create({
  start: function() {
    console.log("MMM-MySystem helper started...");
    this.config = {};
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      if (!this.config.customCommands) this.config.customCommands = {};
    }
    if (notification === "UPDATE") this.getSystemData();
  },

  getSystemData: function() {
    const self = this;
    if (!this.config) return;

    let data = {};
    const execCmd = (command) =>
      new Promise((resolve) => exec(command, (err, stdout) => resolve(err ? null : stdout.trim())));

    const cmd = (key, defaultCmd) => {
      if (!self.config.customCommands) self.config.customCommands = {};
      return self.config.customCommands[key] || defaultCmd;
    };

    const commands = [];

    // -----------------
    // CPU Temperature
    // -----------------
    if (this.config.showCPU) {
      let cpuTempCmd =
        this.config.osVersion === "Trixie"
          ? "cat /sys/class/thermal/thermal_zone0/temp"
          : "sensors | grep 'Package id 0:' | awk '{print $4}'";
      cpuTempCmd = cmd("cpu", cpuTempCmd);
      commands.push(
        execCmd(cpuTempCmd).then((res) => {
          if (res) {
            let temp = parseFloat(res) / (res > 1000 ? 1000 : 1);
            if (self.config.tempUnit === "F") temp = temp * 9 / 5 + 32;
            data.cpu = temp.toFixed(1) + "°" + self.config.tempUnit;
          }
        })
      );

      // -----------------
      // CPU Usage %
      // -----------------
      const cpuUsageCmd = cmd(
        "cpu_usage",
        "grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'"
      );
      commands.push(
        execCmd(cpuUsageCmd).then((res) => {
          if (res) data.cpuUsage = parseFloat(res).toFixed(1) + "%";
        })
      );
    }

    // -----------------
    // Memory %
    // -----------------
    if (this.config.showMemory) {
      let memCmd = "free | awk '/^Mem/ {printf \"%.0f\", $7/$2*100}'";
      memCmd = cmd("memory", memCmd);
      commands.push(execCmd(memCmd).then((res) => { if (res) data.memory = res + "%"; }));
    }

    // -----------------
    // Uptime
    // -----------------
    if (this.config.showUptime) {
      let uptimeCmd = "uptime -p";
      uptimeCmd = cmd("uptime", uptimeCmd);
      commands.push(execCmd(uptimeCmd).then((res) => { if (res) data.uptime = res; }));
    }

    // -----------------
    // Disk
    // -----------------
    if (this.config.showDisk) {
      let diskCmd = "df -h / | awk 'NR==2 {print $4 \" (\" $5 \")\"}'";
      diskCmd = cmd("disk", diskCmd);
      commands.push(execCmd(diskCmd).then((res) => { data.disk = res ? res : "N/A"; }));
    }

    // -----------------
    // IP Addresses
    // -----------------
    const getIP = (iface) => `ip -4 addr show ${iface} 2>/dev/null | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}' || echo ""`;

    if (this.config.showIPeth) {
      let ethCmd = cmd("ip_eth", getIP("eth0"));
      commands.push(execCmd(ethCmd).then((res) => { data.ethIP = res && res.trim() ? res.trim() : "N/A"; }));
    }

    if (this.config.showIPwifi) {
      let wifiCmd = cmd("ip_wifi", getIP("wlan0"));
      commands.push(execCmd(wifiCmd).then((res) => { data.wifiIP = res && res.trim() ? res.trim() : "N/A"; }));
    }

    Promise.all(commands).then(() => self.sendSocketNotification("SYSTEM_DATA", data));
  }
});
