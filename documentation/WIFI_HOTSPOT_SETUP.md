## Make machine accessible via WIFI

### On Ubuntu 18.04 via UI:

#### 1. Open network manager

![step-networkconnections](https://user-images.githubusercontent.com/533590/60503905-eae46000-9cc0-11e9-8b0e-e5a1d7f7c922.png)

#### 2. Create a wifi connection

![step2-wifi](https://user-images.githubusercontent.com/533590/60503906-eae46000-9cc0-11e9-8648-3ccb2ebb880a.png)

#### 3. Configure as a hotspot

You can name the wifi as you like, and you need to select "Hotspot" for the Mode.

![step3-hotspotnane](https://user-images.githubusercontent.com/533590/60503909-eae46000-9cc0-11e9-83df-48a4a57b3799.png)

#### 4. Set auto-connect

In the "General" tab, you need to check "Automatically connect to this network when it is available" so it will start the wifi hotspot on boot.

![step4-autoconnect](https://user-images.githubusercontent.com/533590/60503910-eb7cf680-9cc0-11e9-8f97-e317fbfe8e39.png)

#### 5. Reboot

After rebooting your device, you should be able to connect it via the wifi hotspot and access Opendatacam if started.

### On Ubuntu 18.04 via command line

We accept pull request for this 😁