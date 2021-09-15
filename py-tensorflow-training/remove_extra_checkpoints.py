import glob
import os

files = glob.glob("ckpt-*.*")
files.sort(key=os.path.getmtime)

def file_to_key(filename):
    return filename.split(".")[0]

keys = [file_to_key(f) for f in files]

for f in files:
    if file_to_key(f) == keys[0]:
        # Always keep first file
        continue
    
    if file_to_key(f) == keys[-1]:
        # Always keep last file
        continue
    
    if "0." in f:
        # Keep ones that end in 0
        continue

    tt = ["ckpt-" + str(n) + "." for n in [1, 2, 3, 4, 5, 6, 7, 8, 9]]
    tt = [ff in f for ff in tt]
    if True in tt:
        # Just keep everything < 10
        continue

    print("rm " + f)