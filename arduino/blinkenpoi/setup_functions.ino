

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

    WiFiManagerParameter custom_stick_name("stickname", "Stick Label", stick_name, 20);

    //set config save notify callback
    wifiManager.setSaveConfigCallback(saveConfigCallback);

    wifiManager.setAPCallback(configModeCallback);
    wifiManager.addParameter(&custom_stick_name);

  //set static ip
  //wifiManager.setSTAStaticIPConfig(IPAddress(10,0,1,99), IPAddress(10,0,1,1), IPAddress(255,255,255,0));


    //wifiManager.setAPCallback( testcallback );
    //  

   if(animation_running)
   {
    Serial.println("Button shortpressed, no network config now.");
/*
    for(int i=0;i<3;i++)
    {
         displayLoadingPixel(0,0,0,128);
         delay(200);
         displayLoadingPixel(0,0,0,0);
         delay(200);
    }
  */  
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
   displayLoadingPixel(0,0,255,0); 
   delay(1000);
   displayLoadingPixel(0,0,0,0); 
  
   Serial.println(custom_stick_name.getValue());

  //read updated parameters
  //strcpy(custom_stick_name, custom_stick_name.getValue());




  //save the custom parameters to FS
  if (shouldSaveConfig) {
    Serial.println("saving config");
//    DynamicJsonBuffer jsonBuffer;
//    JsonObject& json = jsonBuffer.createObject();
//    json["mqtt_server"] = mqtt_server;
//    json["custom_stick_name"] = custom_stick_name;

    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("failed to open config file for writing");
    }

//    json.printTo(Serial);
//    json.printTo(configFile);
    configFile.close();
    //end save
  }
  

   /*
   while (WiFi.softAPgetStationNum() < 1) { 
     delay(1);
   }
   
   if (WiFi.softAPgetStationNum() == 0 ){                                   // If a station is connected to the ESP SoftAP
    Serial.println("Opened ESP8266 AP");
    displayLoadingPixel(0,255,255,0);
    delay(2000);
    displayLoadingPixel(0,0,0,0);
  }
  // * /
   return;
  
  }


  // we arrive here if no button was pressed during boot


 /*
  starttime=millis();

// add Wi-Fi networks you want to connect to
//TODO: load from config file / json

  wifiMulti.addAP(wificonnect, wificonnectpassword);
//  wifiMulti.addAP("henderl", "bokbok123");
//  wifiMulti.addAP("pewpew", "deadbeefac");
//  wifiMulti.addAP("pewpew_office", "deadbeefac");
//  wifiMulti.addAP("somehotspot_without_password");   

  
  Serial.print("Trying to connect to '");
  Serial.print(wificonnect);
  Serial.print("' using password '");
  Serial.print(wificonnectpassword);
  Serial.println("'");


  
  while ((wifiMulti.run() != WL_CONNECTED && WiFi.softAPgetStationNum() < 1)) {  // Wait for the Wi-Fi to connect
   
    
    
    // skip setup if manual override 
    if(breakable_delay(250))
    {
      Serial.println("Button pressed, aborting setup");
      return;
    }

    displayLoadingPixel(0,0,0,255);
    if(breakable_delay(250))
    {
      Serial.println("Button pressed, aborting setup");
      return;
    }  
    
    displayLoadingPixel(0,0,0,0);    
   
    Serial.print('.');
 
/*
   if((millis()-starttime)> connection_timeout) 
   {   
    Serial.println("\r\nTimeout during network connect. Opening own AP");
    startAP();

    break; 
   }
 // * /
  }



  Serial.println("\r\n");
  
  if(wifiMulti.run() == WL_CONNECTED) {      // If the ESP is connected to an AP
    
    Serial.print("Connected to ");
    Serial.println(WiFi.SSID());             // Tell us what network we're connected to
    Serial.print("IP address:\t");
    Serial.print(WiFi.localIP());            // Send the IP address of the ESP8266 to the computer
    displayLoadingPixel(0,0,255,0);
    delay(2000);
    displayLoadingPixel(0,0,0,0);
  
  }


  */
  Serial.println("\r\n");
}



/*
void startAP()
{

  WiFi.softAP(ssid, password);             // Start the access point
  Serial.print("Access Point '");
  Serial.print(ssid);
  Serial.print("' started with password '");
  Serial.print(password);
  Serial.println("'"); 
delay(1000);
    Serial.print("IP address:\t");
    Serial.println(WiFi.localIP());  
  
}
*/

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
  SPIFFS.begin();                             // Start the SPI Flash File System (SPIFFS)
  Serial.println("SPIFFS started. Contents:");
  {
    Dir dir = SPIFFS.openDir("/");
    while (dir.next()) {                      // List the file system contents
      String fileName = dir.fileName();
      size_t fileSize = dir.fileSize();
      Serial.printf("\tFS File: %s, size: %s\r\n", fileName.c_str(), formatBytes(fileSize).c_str());
      if (fileName.startsWith("/animations/")) total_animations++;

    }
    Serial.printf("\n");


      
  }
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
}

void startServer() { // Start a HTTP server with a file read handler and an upload handler
  server.on("/edit.html",  HTTP_POST, []() {  // If a POST request is sent to the /edit.html address,
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
   button1.attachClick(click1);
   button1.attachLongPressStart(longpress1);
   //button2.attachClick(click2);
}



boolean checkforButtonInterrupt()
{

  
  
  displayLoadingPixel(0,255,0,255); 
  delay(100);

  int  checkbutton=0;
  while(true)
  {
   button1.tick();
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
