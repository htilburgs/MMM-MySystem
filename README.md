# MMM-MySystem

<img width="429" height="171" alt="SCR-20260310-qsds" src="https://github.com/user-attachments/assets/be0620cf-94bf-4887-b7f7-8f05e091c47f" />

## Installation
```
cd ~/MagicMirror/modules
git clone https://github.com/htilburgs/MMM-MySystem.git
cd MMM-MySystem
npm install
```

## Update
```
cd ~/MagicMirror/modules/MMM-MySystem
git pull
npm install
```

## Configuration
```
{
  module: "MMM-MySystem",
  position: "top_right",
  config: {
    showCpuUsage: true,
    showCPU: true,
    showMemory: true,
    showUptime: true,
    showDisk: true,
    showVolume: true,
    showIPeth: true,
    showIPwifi: true,
    tempUnit: "C"
    updateInterval: 10000,
    language: "en",
    customCommands: {}
  }
}
```
