from insightface.app import FaceAnalysis
import os
import contextlib

with open(os.devnull,"w") as f:
    with contextlib.redirect_stdout(f):
        app = FaceAnalysis(name='buffalo_l')
        app.prepare(ctx_id=-1)