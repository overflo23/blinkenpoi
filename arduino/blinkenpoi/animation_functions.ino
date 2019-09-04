#define NUMPIXELS 50 // Number of LEDs in strip

Adafruit_DotStar strip(NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_BGR);
File animation_file ;

int animation_loaded=0;


boolean load_animation(String filename)
{
  Serial.print("Trying to load: ");
  Serial.println(filename);
  animation_file.close();
  animation_file = SPIFFS.open(filename, "r"); 
  if (!animation_file) {
    Serial.println("FAILED to open file :(");
    animation_loaded=0; 
    return false;
  }
    
  animation_file.seek(0); 
  animation_loaded=1;  
  return true;
}

boolean load_animation(int filenum)
{
  Serial.print("Trying to load anim #");
  Serial.println(filenum);
  animation_file.close();
  if(animation_running==0)
  {
    //Serial.println("animation_running=0");
    animation_loaded=0;
    leds_all_off();
    return true;
  }
  
  Dir dir = SPIFFS.openDir("/animations/");
  int counter=0;
    while (dir.next()) {                      // List the file system contents
      counter++;
      String fileName = dir.fileName();
      if(counter==animation_running) return load_animation(fileName.c_str());
    }
}





int getByte()
{



  signed int data = animation_file.read();
  
  if(data==-1) 
  {

    animation_file.seek(0);
    data = animation_file.read();
 //   Serial.println("seek(0)");
  }
   
  //    Serial.print("pos: ");
  //  Serial.println(animation_file.position());

    
  return data;
}

void showAnimation()
{
  if(!animation_loaded) return;

  for(int i=0;i<25;i++)
  {
   int r= getByte();
   int g= getByte();
   int b= getByte();
   
      

    // anim data is flipped.. the javascript was too complicated at some point and i didnt care anymore :)
    strip.setPixelColor(24-i,r,g,b);
    // mirror on other side
    strip.setPixelColor(25+i,r,g,b);
  }
  strip.show();

}


void leds_all_off()
{
  for(int i=0;i<50;i++)
  {
    strip.setPixelColor(i,0,0,0);
  }
  strip.show();

}
