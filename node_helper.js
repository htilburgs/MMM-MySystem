const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({

  start: function () {
    console.log("MMM-MySystem helper started");
    this.config = null;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      this.getSystemData(); // initial fetch
      setInterval(() => this.getSystemData(), this.config.updateInterval || 10000);
    }
    if (notification === "UPDATE") this.getSystemData();
  },

  execCmd(cmd) {
    return new Promise(resolve => {
      exec(cmd, (err, stdout) => {
        if (err) resolve(null);
        else resolve(stdout.trim());
      });
    });
  },

  async getSystemData() {
    if (!this.config) return;
    const data = {};

    try {
      // Hostname and Pi model, with fallback
      data.hostname = await this.execCmd("hostname") || "Hostname N/A";
      data.model = await this.execCmd("cat /proc/device-tree/model") || "Model N/A";

      // CPU temp
      let cpuTemp = await this.execCmd("cat /sys/class/thermal/thermal_zone0/temp");
      if (cpuTemp) {
        let temp = parseFloat(cpuTemp) / 1000;
        if (this.config.tempUnit === "F") temp = temp * 9/5 + 32;
        data.cpuTemp = temp.toFixed(1) + "°" + (this.config.tempUnit || "C");
      }

      // CPU usage
      let cpuUsage = await this.execCmd("top -bn1 | grep 'Cpu(s)' | awk '{print 100-$8}'");
      if (cpuUsage) data.cpuUsage = parseFloat(cpuUsage).toFixed(1) + "%";

      // Memory %
      let memory = await this.execCmd("free | awk '/Mem/ {printf(\"%.0f\", $3/$2*100)}'");
      if (memory) data.memory = memory + "%";

      // Disk
      let disk = await this.execCmd("df -h / | awk 'NR==2 {print $4 \" (\" $5 \")\"}'");
      if (disk) data.disk = disk;

      // Uptime
      let uptime = await this.execCmd("uptime -p");
      if (uptime) data.uptime = uptime;

      // IPs
      data.ethIP = await this.execCmd("hostname -I | awk '{print $1}'");
      data.wifiIP = await this.execCmd("ip -4 addr show wlan0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'");

    } catch (e) {
      console.error("MMM-MySystem: Error getting system data", e);
    }

    this.sendSocketNotification("SYSTEM_DATA", data);
  }

});
