import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play
import sounddevice as sd
from scipy.io.wavfile import write
import webbrowser
from datetime import datetime
from urllib.parse import quote
import subprocess
from google import genai
import io
import soundfile as sf


load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
elevenLabs =ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)
def speak(text):
   try:
  

     audio=elevenLabs.text_to_speech.convert(
        text=str(text),
        
     
    
     voice_id="JBFqnCBsd6RMkjVDRZzb",
     model_id="eleven_v3",
     
   )
     play(audio)
   except Exception as e:
    print(f"JARVIS(voice failed, showing text only):{text}")
    print("Reason:", e)     
   

       
#speak("hello,i am jarvis !")
#speak("how are you feeling today, sir!")
#speak("what are you doing")


def listen():
   print("JARVIS: I am listening, sir...")
   recording= sd.rec(
      int(5 * 44100),
      samplerate=44100,
      channels=1,
      dtype='int16'

   )
   sd.wait()
   write("voice.wav", 44100, recording)
   print("JARVIS: Voice recorded.")
chat = client.chats.create(model="gemini-3.6-flash")
def brain(text):
   try:
    response = chat.send_message(text)
    return response.text
   except Exception as e:
      print("Reason:, e")
      return"sorry sir, I've hit my thinking limit for now. please try again later"
      
      
      
   
   
   
#listen()
import speech_recognition as sr

def recognize_voice():

   recognizer = sr.Recognizer()
   with sr.AudioFile("voice.wav") as source:
      audio=recognizer.record(source)
   try:
      text =recognizer.recognize_google(audio)
      print("you:", text)
      
      
      
      if "what are you doing" in text.lower():
         speak("I am waiting for you command, sir.")
      elif "hello jarvis" in text.lower():
         speak("Hello sir, how can I help you?")
      elif "open youtube" in text.lower():
         webbrowser.open("https://www.youtube.com")   
         speak("opening youtube, sir.")
      elif "what time is it" in text.lower():
         time=datetime.now().strftime("%I %p")
         speak(f"The time is {time},sir")
      elif "search google for" in text.lower():
         query = text.lower().replace("search google for","").strip()
         url = "https://www.google.com/search?q=" + quote(query)
         webbrowser.open(url)
         speak(f"searching Google for {query}, sir.")
      elif "open calculator" in text.lower():
         subprocess.Popen("calc.exe")
         speak("opening calculator sir")
      elif "open notepad" in text.lower():
         subprocess.Popen("notepad.exe")
         speak("opening notepad sir")   
      elif "open spotify" in text.lower():
         subprocess.Popen("spotify.exe")
         speak("opening spotify sir")   
      elif"what is today's date" in text.lower():
         date= datetime.now().strftime("%B %d, %Y")
         speak(f"Today is {date}, sir.")   
      
         

        
      else:
         response= brain(text)
         print("JARVIS:", response)
         
         speak(response)
            
   except sr.UnknownValueError:
      print("Jarvis: sorry, I couldn't understand.")
   except sr.RequestError:
      print("JARVIS: Speech reconition service is unavailable.")   

if __name__== "__main__":
      recognize_voice()

