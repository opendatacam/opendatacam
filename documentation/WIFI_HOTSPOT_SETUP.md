## Make machine / hotspot accessible via WIFI

### On Ubuntu 18.04 via UI:

#### 1. Open network manager

![step-networkconnections](https://user-images.githubusercontent.com/533590/60503905-eae46000-9cc0-11e9-8b0e-e5a1d7f7c922.png)

#### 2. Create a wifi connection

![step2-wifi](https://user-images.githubusercontent.com/533590/60503906-eae46000-9cc0-11e9-8648-3ccb2ebb880a.png)

#### 3. Configure as a hotspot

You can name the wifi as you like, and you need to select "Hotspot" for the Mode.

![step3-hotspotnane](https://user-images.githubusercontent.com/533590/60503909-eae46000-9cc0-11e9-83df-48a4a57b3799.png)

#### 3.a Set a wifi password (optional)

In the Wi-fi security tab, you can setup an password to protect your jetson from being accessed by others.

#### 4. Set auto-connect

In the "General" tab, you need to check "Automatically connect to this network when it is available" so it will start the wifi hotspot on boot.

![step4-autoconnect](https://user-images.githubusercontent.com/533590/60503910-eb7cf680-9cc0-11e9-8f97-e317fbfe8e39.png)

#### 5. Reboot

After rebooting your device, you should be able to connect it via the wifi hotspot and access OpenDataCam if started.

#### 6. Get IP adress of Wifi hotpot

Click on the network icon on the top right > Connection Information

![connectioninformatio](https://user-images.githubusercontent.com/533590/60710337-bf58b400-9f12-11e9-8056-987f0b5ea583.png)


### Via command line

This was tested on the Jetson Nano Developer Kit SD Card Image (JP 4.4 released on 2020/07/07).
But it should work on any Linux distribution with [NetworkManager](https://en.wikipedia.org/wiki/NetworkManager) and [`nmcli`](https://developer.gnome.org/NetworkManager/stable/nmcli.html) installed.

To create an hotspot or ad-hoc WiFi network execute the following command

```
nmcli device wifi hotspot ifname wlan0 ssid <SSID> password <PASS>
```

This will create a hotspot with SSID `<SSID>`.
The hotspot will remain available until the device reboots or the hotspot is closed manually.
If the hotspot should be automatically created on boot execute the following command after creating the hotspot

```
nmcli con modify Hotspot connection.autoconnect true
```

### ⁉️ Troubleshooting

1.Wifi-Hotspot doesn't show up on other devices
--> go to /etc/modprobe.d/bcmdhd.conf and add the line: options bcmdhd op_mode=2
--> reboot your device



