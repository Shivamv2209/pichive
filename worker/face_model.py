from insightface.app import FaceAnalysis
import os
import contextlib
import sys

with open(os.devnull, "w") as f:
    with contextlib.redirect_stdout(f):
        print("Loading model...", file=sys.stderr)
        sys.stderr.flush()

        app = FaceAnalysis(
            name="buffalo_l",
            root="/opt/render/project/src/models"
        )

        print("Before prepare()", file=sys.stderr)
        sys.stderr.flush()

        app.prepare(ctx_id=-1)

        print("After prepare()", file=sys.stderr)
        sys.stderr.flush()