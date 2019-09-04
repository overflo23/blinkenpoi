

uint32_t starttime=0;

void startWiFi() { // Start a Wi-Fi access point, and try to connect to some given access points. Then wait for either an AP or STA connection



    //WiFiManager
    //Local intialization. Once its business is done, there is no need to keep it around

    WiFiManager wifiManager;


    
    if(reset_config)
    {
        Serial.println("wifiManager.resetSettings()");
        wifiManager.resetSettings();
        //TODO delete config.json here

        for(int i=0;i<3;i++)
        {
         displayLoadingPixel(0,255,0,0);
         delay(200);
         displayLoadingPixel(0,0,0,0);
         delay(200);
        }
        
        ESP.reset();
        delay(5000);
    }

  
  // displayLoadingPixel(0,255,0,0); 
  // delay(1000);

    WiFiManagerParameter custom_stick_name("stickname", "Stick Label", custom_stick_name_str, 20);

    //set config save notify callback
    wifiManager.setSaveConfigCallback(saveConfigCallback);

    wifiManager.setAPCallback(configModeCallback);
    wifiManager.addParameter(&custom_stick_name);

    //set static ip
    //wifiManager.setSTAStaticIPConfig(IPAddress(10,0,1,99), IPAddress(10,0,1,1), IPAddress(255,255,255,0));



   if(animation_running)
   {
    Serial.println("Button shortpressed, no network config now.");  
    return;
   }
  displayLoadingPixel(0,128,128,128); 



  
  //if (!wifiManager.startConfigPortal(ssid)) {
  if (!wifiManager.autoConnect(ssid)) {
    Serial.println("!!! Failed to open AP\n reset!");
    delay(1000);
    //reset and try again, or maybe put it to deep sleep
    ESP.reset();
    delay(5000);
  }
  


  //if you get here you have connected to the WiFi
  Serial.println("connected to WiFi! hooray!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP().toString());
  
   displayLoadingPixel(0,0,255,0); 
   delay(1000);
   displayLoadingPixel(0,0,0,0); 
  
   Serial.println(custom_stick_name.getValue());








  //read updated parameters
  strcpy(custom_stick_name_str, custom_stick_name.getValue());

  //save the custom parameters to FS
  if (shouldSaveConfig) {
    Serial.println("saving config");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
//    json["mqtt_server"] = mqtt_server;
    json["custom_stick_name"] = custom_stick_name_str;

    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("failed to open config file for writing");
    }

    json.printTo(Serial);
    json.printTo(configFile);
    configFile.close();
    //end save
  }
  





  Serial.println("\r\n");
}




void displayLoadingPixel(int num, int r,int g,int b)
{

  strip.setPixelColor(num,r,g,b);
  strip.setPixelColor(49-num,r,g,b);
  strip.show();

}

















/*
void startOTA() { // Start the OTA service
  ArduinoOTA.setHostname(OTAName);
  ArduinoOTA.setPassword(OTAPassword);

  ArduinoOTA.onStart([]() {
    Serial.println("Start");

  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\r\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();
  Serial.println("OTA ready\r\n");
}
*/

void startSPIFFS() { // Start the SPIFFS and list all contents

  // read config file
    if (SPIFFS.begin()) 
    {
 
     Serial.println("SPIFFS started. Contents:");
     {
      Dir dir = SPIFFS.openDir("/");
      while (dir.next()) 
      {                      // List the file system contents
       String fileName = dir.fileName();
       size_t fileSize = dir.fileSize();
       Serial.printf("\tFS File: %s, size: %s\r\n", fileName.c_str(), formatBytes(fileSize).c_str());
       if (fileName.startsWith("/animations/")) total_animations++;
      }
      Serial.printf("\n");
     }
    
     if (SPIFFS.exists("/config.json")) 
     {
      //file exists, reading and loading
      Serial.println("reading config file");
      File configFile = SPIFFS.open("/config.json", "r");
      if (configFile) {
        Serial.println("opened config file");
        size_t size = configFile.size();
        // Allocate a buffer to store contents of the file.
        std::unique_ptr<char[]> buf(new char[size]);

        configFile.readBytes(buf.get(), size);
        DynamicJsonBuffer jsonBuffer;
        JsonObject& json = jsonBuffer.parseObject(buf.get());
        json.printTo(Serial);
        if (json.success()) {
          Serial.println("\nparsed json");

          strcpy(custom_stick_name_str, json["custom_stick_name"]);


        } else {
          Serial.println("failed to load json config");
        }
      }
    }
  } else {
    Serial.println("failed to mount FS");
  }
  //end read




  
}


/*
void startWebSocket() { // Start a WebSocket server
  webSocket.begin();                          // start the websocket server
  webSocket.onEvent(webSocketEvent);          // if there's an incomming websocket message, go to function 'webSocketEvent'
  Serial.println("WebSocket server started.");
}
*/


void startMDNS() { // Start the mDNS responder
  MDNS.begin(mdnsName);                        // start the multicast domain name server
  Serial.print("mDNS responder started: http://");
  Serial.print(mdnsName);
  Serial.println(".local");

  MDNS.addService("http", "tcp", 80);
  
}

void startServer() { // Start a HTTP server with a file read handler and an upload handler
    server.on("/edit.html",  HTTP_POST, []() {  // If a POST request is sent to the /edit.html address,
    Serial.println("UPLOAD");
    server.sendHeader("Access-Control-Allow-Origin","*");

    server.send(200, "text/plain", ""); 
    
  }, handleFileUpload);                       // go to 'handleFileUpload'

  server.onNotFound(handleNotFound);          // if someone requests any other file or page, go to function 'handleNotFound'
                                              // and check if the file exist
  server.begin();                             // start the HTTP server
  Serial.println("HTTP server started.");
}








void startPixel()
{
  strip.begin(); // Initialize pins for output
  strip.show();  // Turn all LEDs off ASAP
  
  //load_animation("/animations/rgb1.tek");
  //load_animation("/animations/test.tek");


}




void startButtons()
{
 // run during boot once

  //onebuttion setup
   button2.attachClick(click2);
   button2.attachLongPressStart(longpress2);
   //button2.attachClick(click2);
}



boolean checkforButtonInterrupt()
{

  
  
  displayLoadingPixel(0,255,0,255); 
  delay(100);

  int  checkbutton=0;
  while(true)
  {
   button2.tick();
   if(animation_running || reset_config) 
   { 
    Serial.println("time for a break.");
    return false;
   }
   
    /*
   if(!digitalRead(button1_pin))
   {
    Serial.println("Button pressed during boot -> reset config");
    reset_config = true;
    return true;
   }
   */
   delay(1);
   checkbutton++;
   if(checkbutton>2100) return false;
   
  }

  return false;
}



//gets called when WiFiManager enters configuration mode
void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("Entered config mode");
  displayLoadingPixel(0,255,255,0);
}



void saveConfigCallback () {
  Serial.println("Should save config");
  shouldSaveConfig = true;
}
