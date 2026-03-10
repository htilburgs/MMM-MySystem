const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({

  start: function () {
    console.log("MMM-MySystem helper started");
  },

  socketNotificationReceived: function (notification, config) {
    if (notification === "CONFIG") this.config = config;
    if (notification === "UPDATE") this.getSystemData();
  },

  execCmd(cmd) {
    return new Promise(resolve => {
      exec(cmd, (error, stdout) => {
        if (error) resolve(null);
        else resolve(stdout.trim());
      });
    });
  },

  async getSystemData() {
    const data = {};

    // CPU Temp
    let cpuTemp = await this.execCmd("cat /sys/class/thermal/thermal_zone0/temp");
    if (cpuTemp) {
      let temp = parseFloat(cpuTemp) / 1000;
      if (this.config.tempUnit === "F") temp = temp * 9 / 5 + 32;
      data.cpuTemp = temp.toFixed(1) + "°" + this.config.tempUnit;
    }

    // CPU Usage
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

    // IP ETH
    let eth = await this.execCmd("hostname -I | awk '{print $1}'");
    if (eth) data.ethIP = eth;

    // IP WiFi
    let wifi = await this.execCmd("ip -4 addr show wlan0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'");
    if (wifi) data.wifiIP = wifi;

    this.sendSocketNotification("SYSTEM_DATA", data);
  }

});
