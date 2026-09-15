import serial
import time

print("Opening COM6...")
try:
    s = serial.Serial('COM6', 115200, timeout=10)
    print("Opened successfully! Listening for 15 seconds...")
    start_time = time.time()
    while time.time() - start_time < 15:
        line = s.readline()
        if line:
            print("RAW BYTES:", repr(line))
        else:
            pass # Timeout reached
    s.close()
    print("Done listening.")
except Exception as e:
    print("Error:", e)
