const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const fs = require("fs");

module.exports = NodeHelper.create({
  start: function() {
    console.log("MMM-MySystem helper started...");
    this.config = {};

    // Auto-detect OS version if not manually set
    const self = this;
    fs.readFile("/etc/os-release", "utf8", (err, data) => {
      if (!err && data) {
        if (!self.config.osVersion) {
          if (data.includes("bookworm")) {
            self.config.osVersion = "Bookworm";
            console.log("MMM-MySystem: Detected OS version Bookworm");
          } else if (data.includes("trixie")) {
            self.config.osVersion = "Trixie";
            console.log("MMM-MySystem: Detected OS version Trixie");
          } else {
            self.config.osVersion = "Trixie";
            console.log("MMM-MySystem: OS version not recognized, defaulting to Trixie");
          }
        }
      }
    });
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
    }

    if (notification === "UPDATE") {
      this.getSystemData();
    }
  },

  getSystemData: function() {
    const self = this;
    let data = {};

    const cmd = (key, defaultCmd) => self.config.customCommands[key] || defaultCmd;

    const execCmd = (command) =>
      new Promise((resolve) => {
        exec(command, (err, stdout) => resolve(err ? null : stdout.trim()));
      });

    const commands = [];

    // CPU Temperature
    if (this.config.showCPU) {
      let cpuCmd =
        this.config.osVersion === "Trixie"
          ? "cat /sys/class/thermal/thermal_zone0/temp"
          : "sensors | grep 'Package id 0:' | awk '{print $4}'";
      cpuCmd = cmd("cpu", cpuCmd);
      commands.push(
        execCmd(cpuCmd).then((res) => {
          if (res) {
            let temp = parseFloat(res) / (res > 1000 ? 1000 : 1);
            if (self.config.tempUnit === "F") temp = temp * 9 / 5 + 32;
            data.cpu = temp.toFixed(1) + "°" + self.config.tempUnit;
          }
        })
      );
    }

 
  // Free Memory in %
  if (this.config.showMemory) {
    // Command returns available and total memory in kB, then calculates percentage
    let memCmd = "free | awk '/^Mem/ {printf \"%.0f\", $7/$2*100}'";
    memCmd = cmd("memory", memCmd);
    commands.push(execCmd(memCmd).then((res) => {
    if (res) data.memory = res + "%";
  }));
}

    // Uptime
    if (this.config.showUptime) {
      let uptimeCmd = "uptime -p";
      uptimeCmd = cmd("uptime", uptimeCmd);
      commands.push(execCmd(uptimeCmd).then((res) => { if (res) data.uptime = res; }));
    }

    // Disk Space
    if (this.config.showDisk) {
      let diskCmd = "df -h / | awk 'NR==2 {print $4}'";
      diskCmd = cmd("disk", diskCmd);
      commands.push(execCmd(diskCmd).then((res) => { if (res) data.disk = res; }));
    }

    // Volume
    if (this.config.showVolume) {
      let volCmd = "amixer get Master | grep -o '[0-9]*%' | head -1";
      volCmd = cmd("volume", volCmd);
      commands.push(execCmd(volCmd).then((res) => { if (res) data.volume = res; }));
    }

    // IP Address (ETH/WiFi)
    if (this.config.showIP) {
      let ipCmd =
        "ip -4 addr show eth0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}' && ip -4 addr show wlan0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'";
      ipCmd = cmd("ip", ipCmd);
      commands.push(
        execCmd(ipCmd).then((res) => {
          if (res) {
            const lines = res.split("\n");
            let ipStr = "";
            if (lines[0]) ipStr += `ETH: ${lines[0]} `;
            if (lines[1]) ipStr += `WIFI: ${lines[1]}`;
            data.ip = ipStr.trim() || "N/A";
          }
        })
      );
    }

    // Execute all commands in parallel
    Promise.all(commands).then(() => self.sendSocketNotification("SYSTEM_DATA", data));
  },
});
