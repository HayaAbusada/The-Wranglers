import cv2
import pytesseract
from matplotlib import pyplot as plt
import time
import sys
import requests
import webbrowser
import subprocess
from picamera2 import Picamera2, Preview


def GetCropDim(height, width, crop):
    hLow = int(height/crop)
    hHigh = int((crop-1)*height/crop)
    wLow = int(width/crop)
    wHigh = int((crop-1)*width/crop)
   
    return (hLow, hHigh, wLow, wHigh)


def SendPlate(plate):
    data = {"plate":plate}
    response = requests.post("https://wranglers-capstone.onrender.com/data", json=data)


    print(response.status_code)
    response.raise_for_status()
