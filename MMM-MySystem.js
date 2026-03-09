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
      .then((resp) => resp.json())
      .then((json) => {
        self.translations = json;
        self.updateDom();
      })
      .catch((err) => console.error("MMM-MySystem translation load error:", err));
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
      { show: this.config.showVolume, key: "volume", icon: "🔊", label: "Volume" },
    ];

    items.forEach((item) => {
      if (item.show && this.systemData[item.key]) {
        const div = document.createElement("div");
        div.innerHTML = `${item.icon} <strong>${this.translate(item.label)}:</strong> ${this.systemData[item.key]}`;
        wrapper.appendChild(div);
      }
    });

    // ETH/WIFI IP
    if (this.config.showIP && this.systemData.ip) {
      const wrapperIP = document.createElement("div");
      wrapperIP.className = "system-ip";

      const lines = this.systemData.ip.split(" ");
      lines.forEach((part) => {
        const lineDiv = document.createElement("div");
        if (part.startsWith("ETH:")) {
          lineDiv.innerHTML = `🌐 <strong>${this.translate("ETH")}:</strong> ${part.replace("ETH:", "").trim()}`;
        } else if (part.startsWith("WIFI:")) {
          lineDiv.innerHTML = `📶 <strong>${this.translate("WIFI")}:</strong> ${part.replace("WIFI:", "").trim()}`;
        } else {
          lineDiv.innerHTML = part;
        }
        wrapperIP.appendChild(lineDiv);
      });

      wrapper.appendChild(wrapperIP);
    }

    return wrapper;
  },

  getStyles: function() {
    return ["MMM-MySystem.css"];
  },
});
