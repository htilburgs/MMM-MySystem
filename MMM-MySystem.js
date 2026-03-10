Module.register("MMM-MySystem", {
  defaults: {
    showCPU: true,
    showMemory: true,
    showUptime: true,
    showDisk: true,
    showIPeth: true,
    showIPwifi: true,
    osVersion: null,
    tempUnit: "C",
    customCommands: {},
    updateInterval: 10000,
    language: config.language || "en"
  },

  start: function() {
    this.systemData = {};
    this.translations = {};
    this.sendSocketNotification("CONFIG", this.config);
    this.loadTranslations(this.config.language);

    setInterval(() => this.sendSocketNotification("UPDATE"), this.config.updateInterval);
  },

  loadTranslations: function(lang) {
    const self = this;
    fetch(`${this.file("/translations/")}${lang}.json`)
      .then(resp => resp.json())
      .then(json => { self.translations = json; self.updateDom(); })
      .catch(err => console.error("MMM-MySystem translation load error:", err));
  },

  translate: function(key) {
    return this.translations[key] || key;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "SYSTEM_DATA") {
      this.systemData = payload;
      this.updateDom();
    }
  },

  getDom: function() {
    const wrapper = document.createElement("div");
    wrapper.className = "mySystem";

    // Show placeholder while no data
    if (!this.systemData || Object.keys(this.systemData).length === 0) {
      wrapper.innerHTML = this.translate("GATHERING_INFO") || "Gathering information.......";
      return wrapper;
    }

    const items = [
      { show: this.config.showCPU, key: "cpu", icon: "💻", label: "CPU" },
      { show: this.config.showMemory, key: "memory", icon: "🧠", label: "Memory" },
      { show: this.config.showUptime, key: "uptime", icon: "⏱️", label: "Uptime" },
      { show: this.config.showDisk, key: "disk", icon: "💽", label: "Disk" }
    ];

    items.forEach(item => {
      if (item.show && this.systemData[item.key]) {
        const row = document.createElement("div");
        row.className = "system-row";

        const left = document.createElement("div");
        left.className = "system-left";
        left.innerHTML = `${item.icon} ${this.translate(item.label)}`;

        const right = document.createElement("div");
        let value = this.systemData[item.key];
        let statusClass = "";

        // CPU thresholds
        if (item.key === "cpu") {
          const temp = parseFloat(value);
          if (temp >= 80) statusClass = "cpu-hot";
          else if (temp >= 70) statusClass = "cpu-warn";

          // Append CPU usage
          if (this.systemData.cpuUsage) value += " (" + this.systemData.cpuUsage + ")";
        }

        // Memory thresholds
        if (item.key === "memory") {
          const mem = parseFloat(value);
          if (mem >= 90) statusClass = "mem-hot";
          else if (mem >= 80) statusClass = "mem-warn";
        }

        // Disk thresholds
        if (item.key === "disk") {
          const match = value.match(/\((\d+)%\)/);
          if (match) {
            const diskPct = parseInt(match[1]);
            if (diskPct >= 95) statusClass = "disk-hot";
            else if (diskPct >= 85) statusClass = "disk-warn";
          }
        }

        right.className = "system-right " + statusClass;
        right.innerHTML = value;

        row.appendChild(left);
        row.appendChild(right);
        wrapper.appendChild(row);
      }
    });

    // Ethernet
    if (this.config.showIPeth && this.systemData.ethIP && this.systemData.ethIP !== "N/A") {
      const ethRow = document.createElement("div");
      ethRow.className = "system-row";
      const left = document.createElement("div");
      left.className = "system-left";
      left.innerHTML = `🌐 ${this.translate("ETH")}`;
      const right = document.createElement("div");
      right.className = "system-right";
      right.innerHTML = this.systemData.ethIP;
      ethRow.appendChild(left);
      ethRow.appendChild(right);
      wrapper.appendChild(ethRow);
    }

    // WiFi
    if (this.config.showIPwifi && this.systemData.wifiIP && this.systemData.wifiIP !== "N/A") {
      const wifiRow = document.createElement("div");
      wifiRow.className = "system-row";
      const left = document.createElement("div");
      left.className = "system-left";
      left.innerHTML = `📶 ${this.translate("WIFI")}`;
      const right = document.createElement("div");
      right.className = "system-right";
      right.innerHTML = this.systemData.wifiIP;
      wifiRow.appendChild(left);
      wifiRow.appendChild(right);
      wrapper.appendChild(wifiRow);
    }

    return wrapper;
  },

  getStyles: function() {
    return ["MMM-MySystem.css"];
  }
});
