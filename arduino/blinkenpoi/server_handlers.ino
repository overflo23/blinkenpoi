void handleNotFound(){ // if the requested file or page doesn't exist, return a 404 not found error
  if(!handleFileRead(server.uri())){          // check if the file exists in the flash memory (SPIFFS), if so, send it
    server.send(404, "text/plain", "404: File Not Found");
  }
}

bool handleFileRead(String path) { // send the right file to the client (if it exists)
  Serial.println("handleFileRead: " + path);

  // DISPLAY ANIMATIONS
  if (path.startsWith("/run/"))
  {
   String load_anim = "/animations/" + path.substring(5);
   Serial.print("Trying to load animation: "); 
   Serial.println(load_anim); 


   // whatever happens later 200 or 404.. we want to let the client know CORS
   server.sendHeader("Access-Control-Allow-Origin","*");
           
   // we should load/display a new animation
   if(load_animation(load_anim))
   {
     server.send(200, "text/plain", "OK");
     return true;
   }
   else
   {
    
     // results in 404 ..
     return false;
   }    
  }


  // receive list of animations
  if (path.startsWith("/get_animations"))
  {
    String anim_list=get_anim_json();

     server.sendHeader("Access-Control-Allow-Origin","*");
     server.send(200, "application/javascript", anim_list);

     return true;
  
  }






  // receive information about poi
  if (path.startsWith("/get_info"))
  {
    String info_str="{ \"version\":"+SW_VERSION+", \"name\":\""+STICK_NAME+"\", \"ip\":\""+WiFi.localIP().toString()+"\", \"wlan\":\"WLAN\", \"wlan\":\"PASSWD\",\"animations\": "+get_anim_json()+" }";

     server.sendHeader("Access-Control-Allow-Origin","*");
     server.send(200, "application/javascript", info_str);

     return true;
  
  }














  
  
  if (path.endsWith("/")) path += "index.html";          // If a folder is requested, send the index file
  String contentType = getContentType(path);             // Get the MIME type
  String pathWithGz = path + ".gz";
  if (SPIFFS.exists(pathWithGz) || SPIFFS.exists(path)) { // If the file exists, either as a compressed archive, or normal
    if (SPIFFS.exists(pathWithGz))                         // If there's a compressed version available
      path += ".gz";                                         // Use the compressed verion
    File file = SPIFFS.open(path, "r");                    // Open the file
    size_t sent = server.streamFile(file, contentType);    // Send it to the client
    file.close();                                          // Close the file again
    Serial.println(String("\tSent file: ") + path);
    return true;
  }
  Serial.println(String("\tFile Not Found: ") + path);   // If the file doesn't exist, return false
  return false;
}

void handleFileUpload(){ // upload a new file to the SPIFFS
  HTTPUpload& upload = server.upload();
  String path;
  if(upload.status == UPLOAD_FILE_START){
    path = upload.filename;
    path = "/animations/"+path;
    if(SPIFFS.exists(path))                      // version of that file must be deleted (if it exists)
    {
         SPIFFS.remove(path);
    }
    Serial.print("handleFileUpload Name: "); Serial.println(path);
    fsUploadFile = SPIFFS.open(path, "w");            // Open the file for writing in SPIFFS (create if it doesn't exist)
    path = String();
  } else if(upload.status == UPLOAD_FILE_WRITE){
    if(fsUploadFile)
      fsUploadFile.write(upload.buf, upload.currentSize); // Write the received bytes to the file
  } else if(upload.status == UPLOAD_FILE_END){
    if(fsUploadFile) {                                    // If the file was successfully created
      fsUploadFile.close();                               // Close the file again
      Serial.print("handleFileUpload Size: "); Serial.println(upload.totalSize);
      server.sendHeader("Location","/success.html");      // Redirect the client to the success page
      server.send(303);
    } else {
      server.send(500, "text/plain", "500: couldn't create file");
    }
  }
}





String get_anim_json()
{

    String anim_list="{ ";
    
    Dir dir = SPIFFS.openDir("/animations/");
    while (dir.next()) {                      // List the file system contents
      String fileName = dir.fileName();
      size_t fileSize = dir.fileSize();
      
      anim_list+="\"";    
      anim_list+=fileName.substring(12).c_str();
      anim_list+="\":\""+    String(fileSize) +"\", "; 
    }
    anim_list+=" \"EOF\":\"0\" }";
    return anim_list;
  
}







/*
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) { // When a WebSocket message is received
  switch (type) {
    case WStype_DISCONNECTED:             // if the websocket is disconnected
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED: {              // if a new websocket connection is established
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
//        rainbow = false;                  // Turn rainbow off when a new connection is established
      }
      break;
    case WStype_TEXT:                     // if new text data is received
      Serial.printf("[%u] get Text: %s\n", num, payload);

     
  //    if (payload[0] == '#') {            // we get RGB data
  //      uint32_t rgb = (uint32_t) strtol((const char *) &payload[1], NULL, 16);   // decode rgb data
  //      int r = ((rgb >> 20) & 0x3FF);                     // 10 bits per color, so R: bits 20-29
  //      int g = ((rgb >> 10) & 0x3FF);                     // G: bits 10-19
  //      int b =          rgb & 0x3FF;                      // B: bits  0-9
  //    } else if (payload[0] == 'R') {                      // the browser sends an R when the rainbow effect is enabled
  //      rainbow = true;
  //    } else if (payload[0] == 'N') {                      // the browser sends an N when the rainbow effect is disabled
  //      rainbow = false;
  //    }
      
      
      break;
  }
}

*/
