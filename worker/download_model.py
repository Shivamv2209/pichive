from insightface.app import FaceAnalysis

print("Downloading buffalo_l model...")

app = FaceAnalysis(
    name="buffalo_l",
    root="/opt/render/project/src/models"
)

app.prepare(ctx_id=-1)

print("Model downloaded successfully!")