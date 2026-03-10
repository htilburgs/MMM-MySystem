Module.register("MMM-MySystem", {

  defaults: {
    showHeader: true,         // Show or hide header
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
    language: "en",
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
  },

  start: function () {
    this.systemData = {};
    this.sendSocketNotification("CONFIG", this.config);
    setInterval(() => this.sendSocketNotification("UPDATE"), this.config.updateInterval);
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

    // --- Header: two rows ---
    if (this.config.showHeader) {
      // Row 1: Hostname / system name
      const headerRow1 = document.createElement("div");
      headerRow1.className = "system-header";
      const left1 = document.createElement("div");
      left1.className = "system-left";
      left1.innerHTML = this.systemData.hostname || "Hostname N/A";
      headerRow1.appendChild(left1);
      wrapper.appendChild(headerRow1);

      // Row 2: Pi model (left) | OS version (right)
      const headerRow2 = document.createElement("div");
      headerRow2.className = "system-header";
      const left2 = document.createElement("div");
      left2.className = "system-left";
      left2.innerHTML = this.systemData.model || "Model N/A";

      const right2 = document.createElement("div");
      right2.className = "system-right";
      right2.innerHTML = this.config.osVersion || "OS N/A";

      headerRow2.appendChild(left2);
      headerRow2.appendChild(right2);
      wrapper.appendChild(headerRow2);
    }

    // --- System items ---
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

      // --- Status colors ---
      if (item.key === "cpuTemp") {
        const temp = parseFloat(value || 0);
        if (temp >= 80) statusClass = "cpu-hot";
        else if (temp >= 70) statusClass = "cpu-warn";
      }
      if (item.key === "cpuUsage") {
        const cpu = parseFloat(value || 0);
        if (cpu >= 95) statusClass = "cpuusage-hot";
        else if (cpu >= 85) statusClass = "cpuusage-warn2";
        else if (cpu >= 70) statusClass = "cpuusage-warn";
      }
      if (item.key === "memory") {
        const mem = parseFloat(value || 0);
        if (mem >= 90) statusClass = "mem-hot";
        else if (mem >= 80) statusClass = "mem-warn";
      }
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

    // --- IPs ---
    if (this.config.showIPeth && this.systemData.ethIP) {
      const row = document.createElement("div");
      row.className = "system-row";
      row.innerHTML = `<div class="system-left">🌐 ${this.translate("ETH")}</div>
                       <div class="system-right">${this.systemData.ethIP}</div>`;
      wrapper.appendChild(row);
    }

    if (this.config.showIPwifi && this.systemData.wifiIP) {
      const row = document.createElement("div");
      row.className = "system-row";
      row.innerHTML = `<div class="system-left">📶 ${this.translate("WIFI")}</div>
                       <div class="system-right">${this.systemData.wifiIP}</div>`;
      wrapper.appendChild(row);
    }

    return wrapper;
  }

});
