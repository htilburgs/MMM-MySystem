Module.register("MMM-MySystem", {

  defaults: {
    showCpuUsage: true,
    showCPU: true,
    showMemory: true,
    showDisk: true,
    showUptime: true,
    showIPeth: true,
    showIPwifi: true,

    tempUnit: "C",
    osVersion: "Bookworm",
    updateInterval: 10000,
    language: "en",      // optional override of MM language
    customCommands: {}
  },

  getStyles: function() {
    return ["MMM-MySystem.css"];
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      nl: "translations/nl.json",
      de: "translations/de.json",
      fr: "translations/fr.json"
    };
    
  start: function () {
    this.systemData = {};
    this.sendSocketNotification("CONFIG", this.config);

    // Start periodic updates
    setInterval(() => { this.sendSocketNotification("UPDATE"); }, this.config.updateInterval);
  },

  translate: function(key) {
    // MagicMirror automatically loads translations via getTranslations()
    if (this.translations && this.translations[key]) return this.translations[key];
    return key; // fallback to key name if missing
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

    if (!this.systemData || Object.keys(this.systemData).length === 0) {
      wrapper.innerHTML = this.translate("GATHERING_INFO");
      return wrapper;
    }

    const items = [
      { show: this.config.showCpuUsage, key: "cpuUsage", icon: "⚙️", label: "CPU_USAGE" },
      { show: this.config.showCPU, key: "cpuTemp", icon: "🌡️", label: "CPU_TEMP" },
      { show: this.config.showMemory, key: "memory", icon: "🧠", label: "Memory" },
      { show: this.config.showDisk, key: "disk", icon: "💽", label: "Disk" },
      { show: this.config.showUptime, key: "uptime", icon: "⏱️", label: "Uptime" }
    ];

    items.forEach(item => {
      if (!item.show || !this.systemData[item.key]) return;

      const row = document.createElement("div");
      row.className = "system-row";

      const left = document.createElement("div");
      left.className = "system-left";
      left.innerHTML = `${item.icon} ${this.translate(item.label)}`;

      const right = document.createElement("div");
      right.className = "system-right";

      let value = this.systemData[item.key] || "N/A";
      let statusClass = "";

      // CPU Temp color
      if (item.key === "cpuTemp") {
        const temp = parseFloat(value || 0);
        if (temp >= 80) statusClass = "cpu-hot";
        else if (temp >= 70) statusClass = "cpu-warn";
      }

      // CPU Usage color
      if (item.key === "cpuUsage") {
        const cpu = parseFloat(value || 0);
        if (cpu >= 95) statusClass = "cpuusage-hot";
        else if (cpu >= 85) statusClass = "cpuusage-warn2";
        else if (cpu >= 70) statusClass = "cpuusage-warn";
      }

      // Memory color
      if (item.key === "memory") {
        const mem = parseFloat(value || 0);
        if (mem >= 90) statusClass = "mem-hot";
        else if (mem >= 80) statusClass = "mem-warn";
      }

      // Disk color
      if (item.key === "disk") {
        const match = value.match(/\((\d+)%\)/);
        if (match) {
          const diskPct = parseInt(match[1]);
          if (diskPct >= 95) statusClass = "disk-hot";
          else if (diskPct >= 85) statusClass = "disk-warn";
        }
      }

      right.className += " " + statusClass;
      right.innerHTML = value;

      row.appendChild(left);
      row.appendChild(right);
      wrapper.appendChild(row);
    });

    // Ethernet IP
    if (this.config.showIPeth && this.systemData.ethIP) {
      const row = document.createElement("div");
      row.className = "system-row";
      row.innerHTML = `<div class="system-left">🌐 ${this.translate("ETH")}</div>
                       <div class="system-right">${this.systemData.ethIP}</div>`;
      wrapper.appendChild(row);
    }

    // WiFi IP
    if (this.config.showIPwifi && this.systemData.wifiIP) {
      const row = document.createElement("div");
      row.className = "system-row";
      row.innerHTML = `<div class="system-left">📶 ${this.translate("WIFI")}</div>
                       <div class="system-right">${this.systemData.wifiIP}</div>`;
      wrapper.appendChild(row);
    }

    return wrapper;
  },
  }

});
