# http://opencvpython.blogspot.de/2012/07/background-extraction-using-running.html

import cv2
import numpy as np

cam = cv2.VideoCapture(0)
_,frame = cam.read()
avg = np.float32(frame)

while(1):
    _,frame = cam.read()
    cv2.accumulateWeighted(frame,avg,0.01)
    res = cv2.convertScaleAbs(avg)
    cv2.imshow('avg1',res)

    k = cv2.waitKey(20)
    if k == 27: # ESC key
        break

cv2.destroyAllWindows()
cam.release()
