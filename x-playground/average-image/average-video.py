# http://opencvpython.blogspot.de/2012/07/background-extraction-using-running.html

import cv2
import numpy as np
import time

video = cv2.VideoCapture("/Users/tdurand/Downloads/1_prototype_video.mp4")
_,frame = video.read()
avg = np.float32(frame)

while(video.isOpened()):
    _,frame = video.read()
    cv2.accumulateWeighted(frame,avg,0.007)
    res = cv2.convertScaleAbs(avg)
    cv2.imshow('avg1',res)

    k = cv2.waitKey(20)
    if k == 115: # s key
        timestr = time.strftime("%Y%m%d-%H%M%S")
        cv2.imwrite(timestr + ".png", res)
    if k == 27: # ESC key
        break

cv2.destroyAllWindows()
video.release()
