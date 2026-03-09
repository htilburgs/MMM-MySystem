Module.register("MMM-MySystem", {
  defaults: {
    showCPU: true,
    showMemory: true,
    showUptime: true,
    showDisk: true,
    showVolume: true,
    showIP: true,
    osVersion: null, // auto-detect if null
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
      { show: this.config.showCPU, key: "cpu", icon: "🖥️", label: "CPU" },
      { show: this.config.showMemory, key: "memory", icon: "💾", label: "Memory" },
      { show: this.config.showUptime, key: "uptime", icon: "⏱️", label: "Uptime" },
      { show: this.config.showDisk, key: "disk", icon: "🗄️", label: "Disk" },
      { show: this.config.showVolume, key: "volume", icon: "🔊", label: "Volume" }
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

    // ETH/WIFI IP
    if (this.config.showIP && this.systemData.ip) {
      const lines = this.systemData.ip.split(" ");
      lines.forEach(part => {
        const row = document.createElement("div");
        row.className = "system-row";

        const left = document.createElement("div");
        left.className = "system-left";

        const right = document.createElement("div");
        right.className = "system-right";

        if (part.startsWith("ETH:")) {
          left.innerHTML = `🌐 ${this.translate("ETH")}`;
          right.innerHTML = part.replace("ETH:", "").trim();
        } else if (part.startsWith("WIFI:")) {
          left.innerHTML = `📶 ${this.translate("WIFI")}`;
          right.innerHTML = part.replace("WIFI:", "").trim();
        }

        row.appendChild(left);
        row.appendChild(right);
        wrapper.appendChild(row);
      });
    }

    return wrapper;
  },

  getStyles: function() {
    return ["MMM-MySystem.css"];
  }
});
