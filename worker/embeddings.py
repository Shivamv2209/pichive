from face_model import app
import cv2
import numpy as np
import requests
import sys
import json


def url_to_image(url):
    response = requests.get(url)
    response.raise_for_status()
    arr = np.frombuffer(response.content,np.uint8)
    return cv2.imdecode(arr,cv2.IMREAD_COLOR)

def generate_embeddings(photos):
    face_embeddings = []

    for photo in photos:
        photo_id = photo["photo_id"]
        url = photo["url"]

        print(f"Processing photo {photo_id}", file=sys.stderr)

        print("Downloading image...", file=sys.stderr)
        sys.stderr.flush()

        img = url_to_image(url)

        print("Image downloaded", file=sys.stderr)
        sys.stderr.flush()

        if img is None:
            print("Image decode failed", file=sys.stderr)
            sys.stderr.flush()
            continue

        print("Image loaded successfully", file=sys.stderr)
        print("Before app.get()", file=sys.stderr)

        faces = app.get(img)

        print("After app.get()", file=sys.stderr)
        print(f"Faces found: {len(faces)}", file=sys.stderr)

        for i, face in enumerate(faces):
            face_embeddings.append({
                "photo_id": photo_id,
                "face_index": i,
                "embedding": face.embedding.tolist()
            })

    print("Finished generate_embeddings()", file=sys.stderr)

    return face_embeddings


try:
    print("Python started", file=sys.stderr)
    sys.stderr.flush()

    raw_input = sys.stdin.read()

    print("Input received", file=sys.stderr)
    sys.stderr.flush()

    photos = json.loads(raw_input)

    print(f"Photos count = {len(photos)}", file=sys.stderr)
    sys.stderr.flush()

    print("Generating embeddings...", file=sys.stderr)
    sys.stderr.flush()

    result = generate_embeddings(photos)

    print("About to output JSON", file=sys.stderr)
    sys.stderr.flush()

    print(json.dumps(result), flush=True)

    print("JSON output complete", file=sys.stderr)
    sys.stderr.flush()

except Exception as e:

    import traceback

    print("PYTHON ERROR:", str(e), file=sys.stderr)
    traceback.print_exc(file=sys.stderr)

    print("[]", flush=True)

    sys.exit(1)