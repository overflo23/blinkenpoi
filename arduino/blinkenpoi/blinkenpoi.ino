#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
//#include <ArduinoOTA.h>
#include <ESP8266WebServer.h>

#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager
#include <ArduinoJson.h>          //https://github.com/bblanchon/ArduinoJson

#include <ESP8266mDNS.h>
#include <FS.h>
#include <ArduinoJson.h>
#include <Adafruit_DotStar.h>
#include <SPI.h>         

#include "OneButton.h"



String SW_VERSION="0.9";

// TODO
/*
 *  captive portal ?
 *  webseite bauen mit einem formular fuer setup  config.html
 *  formular bekommt daten ueber json / websocket
 *  felder
 *   - device name (lowercase 8 chars a-z/1-0/_-)
 *   - wlan to join
 *   - wlan passwort
 * 
 * resourcen
 *  - get config parameters
 * 
 */


ESP8266WiFiMulti wifiMulti;       // Create an instance of the ESP8266WiFiMulti class, called 'wifiMulti'

ESP8266WebServer server(80);       // Create a webserver object that listens for HTTP request on port 80
//WebSocketsServer webSocket(81);    // create a websocket server on port 81

File fsUploadFile;                 // a File variable to temporarily store the received file

const char *ssid = "Blinkenpoi"; // The name of the Wi-Fi network that will be created
const char *password = "";   // The password required to connect to it, leave blank for an open network



String STICK_NAME="No. 1";


// TODO load from config file
const char *wificonnect = "pewpew"; // The name of the Wi-Fi network that will be created
const char *wificonnectpassword = "deadbeefac";   // The password required to connect to it, leave blank for an open network
int const connection_timeout = 60000; // 60s timeout, after which we open our own access point


/*
const char *OTAName = "Blinkenpoi";           // A name and a password for the OTA service
const char *OTAPassword = "blinky123";
*/

const char* mdnsName = "blinkenpoi"; // Domain name for the mDNS responder




//   das ist alles scheisse.
//  neue button belegung evaluieren



// button2 is brken because the wemos D1 has a strong pulldown resistor that can not be overridden with internal_pullup on D8 / GPIO15
// valid pinout for PCB rev. 3.0
//const int button1_pin=2; // D4
//const int button2_pin=15; // D8

// valid pinout for PCB rev. 1.0
const int button1_pin=12; // D6
//const int button2_pin=15; // D8



OneButton button1(button1_pin, true);
//OneButton button2(button2_pin, false);



/// global vars, no touchy
int animation_running=0;
int total_animations=0;

// set true if button is pressed during pink phase
boolean reset_config = false;


// for wifimanager 
boolean shouldSaveConfig = false;
char stick_name[20] = "Peter";



void setup() {

  Serial.begin(115200);        // Start the Serial communication to send messages to the computer
  delay(10);
  Serial.println("\r\n");

  

  startPixel();

  startButtons();
  
  startSPIFFS();               // Start the SPIFFS and list all contents

  checkforButtonInterrupt(); // see if button is pressed.
  
  startWiFi();                 // Start a Wi-Fi access point, and try to connect to some given access points. Then wait for either an AP or STA connection
  
 // startOTA();                  // Start the OTA service
  

  startMDNS();                 // Start the mDNS responder

  startServer();               // Start a HTTP server with a file read handler and an upload handler


}




void loop() {

  checkButtons();

  server.handleClient();                      // run the http server
  
  //ArduinoOTA.handle();                        // listen for OTA events
  
  showAnimation();
  

}
