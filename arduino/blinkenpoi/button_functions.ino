boolean checkButtons()
{

  button1.tick();
//  button2.tick();

  if(!digitalRead(button1_pin)) return true;
 
  return false;
  
}





void click1() {
  Serial.println("Button 1 click.");
  animation_running++;
  if(animation_running>total_animations) animation_running=0;
  load_animation(animation_running);
} 
