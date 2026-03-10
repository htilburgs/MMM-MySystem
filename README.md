# MMM-MySystem

This is a [Magic Mirror²](https://github.com/MichMich/MagicMirror) module for the system information<br/>
I now there are more, but I built a version with a modern look and feel.

<img width="429" height="171" alt="SCR-20260310-qsds" src="https://github.com/user-attachments/assets/be0620cf-94bf-4887-b7f7-8f05e091c47f" />

## Installation
Clone this repository in your modules folder, and install dependencies:
```
cd ~/MagicMirror/modules
git clone https://github.com/htilburgs/MMM-MySystem.git
cd MMM-MySystem
npm install
```

## Update
When you need to update this module:
```
cd ~/MagicMirror/modules/MMM-MySystem
git pull
npm install
```

## Configuration
Go to the MagicMirror/config directory and edit the config.js file. <br/>
Add the module to your modules array in your config.js.
```
{
  module: "MMM-MySystem",
  position: "top_right",
  header: "System Information",
  disabled: false,
  config: {
    showHeader: true,
    showCpuUsage: true,
    showCpuTemp: true,
    showMemory: true,
    showUptime: true,
    showDisk: true,
    showVolume: true,
    showIPeth: true,
    showIPwifi: true,
    tempUnit: "C"
    updateInterval: 10000,
    customCommands: {}
  }
}
```

## Configuration Options

| Option                | Description
|:----------------------|:-------------
|`showHeader`           | Show the header with Hostname, Model and OS Version
|`showCPUusage`         | Show the CPU Usage (%)
|`showCPUtemp`          | Show the CPU Temperature 
|
