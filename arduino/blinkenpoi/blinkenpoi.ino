#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// Install the libraries with arduino library manager in Tools/Manage libraries


#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager
#include <ArduinoJson.h>          //https://github.com/bblanchon/ArduinoJson
                                   // NEEDS v5.x !! >6.x will fail to compile
#include <ESP8266mDNS.h>
#include <FS.h>
#include <Adafruit_DotStar.h>
#include <SPI.h>         

#include "OneButton.h"





/*
 * 
 * 
 * 
 * 
 *   What is going on in here?
 * 
 *  This is the firmware running on the Blinkenpoi 
 *  Documentation: 
 *   https://metalab.at/wiki/Blinkenpoi
 * 
 * 
 *   PLEASE READ THIS!
 *   This is a rather complex setup and you need to install various libraries, some at a specific version.
 *   Please read the information provided here;
 *   https://github.com/overflo23/blinkenpoi/wiki/Building-the-Firmware
 *   
 * 
 *  First time turn on:
 * 
 *  When you turn on the blinkenpoi checks its internally ROM if it is already configured for a specific wlan.
 *  If it is configured it will try to connect to it, if it fails it opens its own acces point for configuration
 *  Once connected to the accesspoint you should be welcomed by a captive portal.
 *  If this fails the poi is accessable at 192.168.4.1
 * 
 *  After configuration it saves the stick name and network credentials if it was successfully connecting.
 *  Success is indicted by a green led.
 * 
 *  --
 *  
 *  Normal operation:
 *  Turn on the stick, it shines a pink led for ~ 2 seconds.
 *  This can be interrupted by a short press of the button.
 *  If you interrupt now the network is NOT configured and the stick is available offline and you can cycle trough the animations on the stick with the button.
 *  
 *  If you press the button during the pink phase and keep it pressed or ~1.5 seconds you activate a configuration RESET.
 *  The first led will blink red 3 times and the saved wifi information is deleted and an access point is opened for configuration.
 *  
 *  Once the stick operates it waits for a trigger on the weninterface.
 *  Animation playback is triggered by an HTTP request.
 *  for example: http://10.0.0.42/run/rgb1.tek 
 * 
 *  Of course you can override the animation playback with the button at any time.
 * 
 *   My code is CC0 Public domain, (ab)use at will. 
 *   But some libraries use GPL or other licenses which apply.
 *   
 */





// These are the internal pin numbers used to drive the leds.
// if C and D are swapped on your ledstrip just swap these two numbers
#define DATAPIN    14
#define CLOCKPIN   13




// button1 is borken because the wemos D1 has a strong pulldown resistor that can not be overridden with internal_pullup on D8 / GPIO15
// well. fuck.
// so it is a one-button interface than :(
// kann man so machen ist dann halt scheisse.

// valid pinout for PCB rev. 3.0
const int button2_pin=2; // D4

// valid pinout for PCB rev. 1.0
//const int button1_pin=12; // D6







String SW_VERSION="0.9";


ESP8266WebServer server(80);       // Create a webserver object that listens for HTTP request on port 80

File fsUploadFile;                 // a File variable to temporarily store the received file



const char *ssid = "Blinkenpoi"; // The name of the Wi-Fi network that will be created

String STICK_NAME="No. 1";


const char* mdnsName = "blinkenpoi"; // Domain name for the mDNS responder



//  TODO: neue button belegung evaluieren / too late for CCCamp 2019 :(

OneButton button2(button2_pin, true);
//OneButton button1(button1_pin, false);



/// global vars, no touchy
int animation_running=0;
int total_animations=0;

// set true if button is pressed during pink phase
boolean reset_config = false;


// for wifimanager 
boolean shouldSaveConfig = false;
char custom_stick_name_str[20] = "";


void setup() {

  Serial.begin(115200);        // Start the Serial communication to send messages to the computer
  delay(10);
  Serial.println("\r\n");

  

  startPixel();

  startButtons();
  
  startSPIFFS();               // Start the SPIFFS and list all contents

  checkforButtonInterrupt(); // see if button is pressed.
  
  startWiFi();                 // Start a Wi-Fi access point, and try to connect to some given access points. Then wait for either an AP or STA connection
  
  startMDNS();                 // Start the mDNS responder

  startServer();               // Start a HTTP server with a file read handler and an upload handler


}




void loop() {

  checkButtons();
  MDNS.update();
  server.handleClient();                      // run the http server
  showAnimation();
  

}
