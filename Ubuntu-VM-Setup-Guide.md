# 💻 Running Ubuntu on a Virtual Machine
- This setup outlines the necessary steps for setting up a Ubuntu Virtual Machine that is to be used as a host machine for flashing Jetpack onto TX2. Please read this guide carefully, as there are a few caveats to watch out for.

## 📋 Requirements
- **A Ubuntu ISO file**. Please ensure that the ISO file is for a version of Ubuntu that is **greater than 16.04 and less than 20.04**. At the time of writing(July 2021), Ubuntu 16.04 has reached end of life, and Jetpack is currently not supported for Ubuntu 20.04. The recommended version of the Ubuntu ISO to download is 18.04. You can find the link for it [here](https://releases.ubuntu.com/18.04.5/)
- **Dedicated Software to run virtual machines**. While there are many options available, the one that we **strongly** recommend is **VMWare Workstation Player**. You can download it from [here](https://www.vmware.com/go/getplayer-win). We recommend this version because it has the ability to read USB ports, which is something that other virtual machine softwares(e.g VirtualBox) do not support. 

## 🛠 Setting up a virtual machine running Ubuntu 
- For this guide, I will describe the procedure to set up a VM running Ubuntu 18.04 using **VMWare Workstation Player**. For other virtual machine softwares, the process should be relatively similar.
- The steps to this setup are as follows:
  1. Ensure that **VMWare Workstation Player** is downloaded and installed on your computer, and that you have downloaded The ISO file for Ubuntu 18.04. You can find the link for the ISO file [here](https://releases.ubuntu.com/18.04.5/)
  2. Launch  **VMWare Workstation Player**, and click on the *Create a New Virtual Machine* option.
  3. In the wizard, it will ask you to locate you Guest OS. Click the *installer from disc image* option, and locate the ISO file that you have downloaded.
  4. Then you will be prompted to fill in your credentials for the Ubuntu VM. Fill these in appropriately
  5. Then next pagw wil prompt you toselect a name for your Virtual Machine
  6. The next page will ask you set a disk capacity for your VM. We recommend **at least 100GB** to be sure that the setup has enough storage to install the necessary files. You are also presented with an option to either:
    - Store the virtual disk as a single file 
    - Split the virtual disk into multiple files(*We recommend this option*)
  7. You will then be prompted with a summary of your selected options. Ensure that the options are setup to your accordance, and click Finish.

### ℹ️ Setting up your VM to be full screen(Required, VMWare Workstation Player)
- This step is required; if you skip this step, you will not be able to see half your screen!
- By default, when you try to make your VM full screen, it will only expand center the screen, and the screen will be not as large as should be. In order to solve this issue, you must install VMWare tools on your Virtual Machine. Please read [this](https://kb.vmware.com/s/article/1022525) tutorial, which describes how to install VMWare tools on your virtual machine
