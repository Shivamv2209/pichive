from insightface.app import FaceAnalysis
import sys

print("Loading model...", file=sys.stderr)
sys.stderr.flush()

print("Before FaceAnalysis()", file=sys.stderr)
sys.stderr.flush()

app = FaceAnalysis(
    name="buffalo_s",
    root="/opt/render/project/src"
)

print("After FaceAnalysis()", file=sys.stderr)
sys.stderr.flush()

print("Before prepare()", file=sys.stderr)
sys.stderr.flush()

app.prepare(ctx_id=-1)

print("After prepare()", file=sys.stderr)
sys.stderr.flush()