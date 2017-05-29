import os
import sys

original  = sys.stdout
original.flush()

unbuffered = os.fdopen(original.fileno(), 'w', 0)

sys.stdout = unbuffered
