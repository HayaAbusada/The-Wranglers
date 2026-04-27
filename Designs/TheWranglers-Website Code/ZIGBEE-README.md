# How to setup zigbee environment

Install serial driver CP210x for Windows
Install usbipd for Windows

# Open Command Prompt, and run  
usbipd list

Locate the BUSID of the usb device and then run  
usbipd attach --wsl --busid BUSID

Ensure the usb device is attached by running  
usbipd list  
again

# Open WSL, and check the usb device is being read by running
lsusb

Install zigbee2mqtt by running  
sudo mkdir /opt/zigbee2mqtt  
sudo chown -R ${USER}: /opt/zigbee2mqtt  
git clone --depth 1 https://github.com/Koenkk/zigbee2mqtt.git /opt/zigbee2mqtt  
cd /opt/zigbee2mqtt  
pnpm install --frozen-lockfile  

Install mosquitto by running  
sudo apt-get update  
sudo apt-get install mosquitto mosquitto-clients  

Start mosquttio by running  
sudo mosquitto -d  

Also run  
sudo apt remove brltty  

Then, run  
ls -l /dev/tty*  

If /dev/ttyUSB0 is visible, skip this step. If not, run  
lsmod | grep cp210x  
sudo modprobe cp210x  
/dev/ttyUSB0 should be visible now  

If permission denied error for /dev/ttyUSB0, run  
sudo chmod 666 /dev/ttyUSB0  

If encountering HOST_FATAL_ERROR when running pnpm start, run  
nano data/configuration.yaml  
and change the serial port to /dev/ttyUSB0  

To start Zigbee2MQTT, run  
cd /opt/zigbee2mqtt  
pnpm start  
