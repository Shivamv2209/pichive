from insightface.app import FaceAnalysis

print("Downloading buffalo_s model...")

app = FaceAnalysis(
    name="buffalo_s",
    root="/opt/render/project/src"
)

app.prepare(ctx_id=-1)

print("Model downloaded successfully!")