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
    showDisk: true,
    showUptime: true,
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
|`showHeader`           | Show the header with Hostname, Model and OS Version<br/>Options: `true`/`false` - Default: <b>`true`</b>
|`showCPUusage`         | Show the CPU Usage (%)<br/>Options: `true`/`false` - Default: <b>`true`</b>
|`showCPUtemp`          | Show the CPU Temperature <br/>Options: `true`/`false` - Default: <b>`true`</b>
|`showMemory`           | Show the Free Memory (%)<br/>Options: `true`/`false` - Default: <b>`true`</b>
|`showDisk`             | Show the Free Diskpace<br/>Options: `true`/`false` - Default: <b>`true`</b> 
|`showIPeth`            | Show the IP Address for the Ethernet<br/>Options: `true`/`false` - Default: <b>`true`</b>
|`showIPwifi            | Show the IP Address for the Wifi<br/>Options: `true`/`false` - Default: <b>`true`</b>
|`tempUnit`             | Show the temperature in ˚C or ˚F<br/>Options: `C`/`F` - Default: <b>`C`</b>
|`updateInterval`       | Update interval module in ms<br/>Default: <b>`10000`</b> (10 seconds)

## Versions
#### v1.0.0 (10-03-2026): Initial version)

## License
### The MIT License (MIT)

Copyright © 2026 Harm Tilburgs

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

