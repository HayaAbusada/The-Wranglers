from functions import *


if __name__ == '__main__':


  """
  OEM Parameters
  0 - Legacy
  1 - LSTM Only
  2 - Combined Legacy & LSTM
  3 - Default
  """


  """
  PSM Parameters
  0 - Orientation and scrpt detection only
  1 - Automatic page segmentation with OCR
  2 - Automatic ppage segmentation without OCR
  3 - Fully automatic page segmentation (defualt)
  4 - Assume single clumn of text
  5 - Assume single vertical block of text
  6 - Assume single unimform block of text
  7 - Treat image as a single line of text
  8 - Treat image as a single word
  9 - Treat image as a single word in a circle
  10 - Treat image as a single character
  11 - Sparse text detection
  12 - Sparse text with orientation detection
  13 - raw line (no layout analysis)
  """


  # Parameters


  """
  subprocess.Popen([
    "chromium",
    "--kiosk",
    "--noerrdialogs",
    "--disable-infobars",
    "--disable-session-crashed-bubble",
    "https://thewranglers.onrender.com/display"
  ])
  """
 
  picam2 = Picamera2()
  picam2.configure(picam2.create_preview_configuration())
  size = picam2.camera_properties['PixelArraySize']
  width, height = size
  hLow, hHigh, wLow, wHigh = GetCropDim(height, width, 3)
  picam2.set_controls({
    "ScalerCrop": (wLow, hLow, wHigh-wLow, hHigh-hLow),
    "Brightness": 0,
    "Contrast": 2.0,
  })
  picam2.start()


  detector = cv2.QRCodeDetector()


  config = ('-l eng --oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
  prev = ""
  while True:
    time.sleep(0.1)
    img = picam2.capture_array()
    qrStart = time.perf_counter()
    data, points, _ = detector.detectAndDecode(img)
    """
    if points is not None:
      if len(points[0]) == 4:
        print("DETECTED")
        # get low and high points for bbox
        wLow = points[0][0][0]
        hLow = points[0][0][1]
        wHigh = points[0][0][0]
        hHigh = points[0][0][1]
        for p in points[0]:
          if p[0] < wLow:
            wLow = p[0]
          if p[0] > wHigh:
            wHigh = p[0]
          if p[1] < hLow:
            hLow = p[1]
          if p[1] > hHigh:
            hHigh = p[1]


        for h in range(int(hLow), int(hHigh)+1):
          for w in range(int(wLow), int(wHigh)+1):
            ma = max(img[h][w][0], img[h][w][1], img[h][w][2])
            mi = min(img[h][w][0], img[h][w][1], img[h][w][2])
            if ma-mi < 10:
              img[h][w] = (0, 0, 0, 255)
            else:
              img[h][w] = (255, 255, 255, 255)
        data, points, _ = detector.detectAndDecode(img)
    """
    cv2.imwrite("plate.jpg", img)
    if data:
      print("QR code discovered in "+str(round(time.perf_counter()-qrStart, 2))+" seconds")
      print("QR Data:", data)
      if prev != data:
        SendPlate(data)
        prev = data
      continue
    print("No QR code discovered in "+str(round(time.perf_counter()-qrStart, 2))+" seconds")
    continue
    print("Running license plate discovery...")
    # make ultra contrast image to help license plate recognition
    preStart = time.perf_counter()
    cropped = PreProcess(img, height, width, 3)
    print("Pre-processing complete in "+str(round(time.perf_counter()-preStart, 2))+" seconds")


    dataStart = time.perf_counter()
    data = pytesseract.image_to_data(cropped, config=config, output_type = pytesseract.Output.DICT)


    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


    print("Data processing done in "+str(round(time.perf_counter()-dataStart, 2))+" seconds")


    SendPlate()
