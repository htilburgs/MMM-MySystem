Module.register("MMM-MySystem", {
  defaults: {
    showCPU: true,
    showMemory: true,
    showUptime: true,
    showDisk: true,
    showVolume: true,
    showIP: true,
    osVersion: null, // auto-detect
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

    setInterval(() => {
      this.sendSocketNotification("UPDATE");
    }, this.config.updateInterval);
  },

  loadTranslations: function(lang) {
    const self = this;
    fetch(`${this.file("/translations/")}${lang}.json`)
      .then(resp => resp.json())
      .then(json => {
        self.translations = json;
        self.updateDom();
      })
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
        right.className = "system-right";
        right.innerHTML = this.systemData[item.key];

        row.appendChild(left);
        row.appendChild(right);
        wrapper.appendChild(row);
      }
    });

    // ETH/WiFi IP
    if (this.config.showIP) {
      if (this.systemData.ethIP) {
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

      if (this.systemData.wifiIP) {
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
    }

    return wrapper;
  },

  getStyles: function() {
    return ["MMM-MySystem.css"];
  }
});
