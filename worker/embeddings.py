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

        img = url_to_image(url)

        if img is None:
            print("Image decode failed", file=sys.stderr)
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
    raw_input = sys.stdin.read()

    if not raw_input.strip():
        raise Exception("No input received from Node")

    photos = json.loads(raw_input)

    print("Generating embeddings...", file=sys.stderr)

    result = generate_embeddings(photos)

    print("About to print JSON", file=sys.stderr)
    print(json.dumps(result), flush=True)
    print("JSON printed", file=sys.stderr)

except Exception as e:
    import traceback

    print("PYTHON ERROR:", str(e), file=sys.stderr)
    traceback.print_exc(file=sys.stderr)

    # Send empty JSON so Node doesn't crash on JSON.parse("")
    print("[]", flush=True)

    sys.exit(1)