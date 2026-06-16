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
    face_embeddings=[]
    for photo in photos:
        photo_id = photo["photo_id"]
        url = photo["url"]
        img = url_to_image(url)
        faces = app.get(img)
        for i,face in enumerate(faces):
            face_embeddings.append({
                "photo_id":photo_id,
                "face_index":i,
                "embedding":face.embedding.tolist()
            })

    return face_embeddings


try:
    raw_input = sys.stdin.read()

    if not raw_input.strip():
        raise Exception("No input received from Node")

    photos = json.loads(raw_input)

    print("Generating embeddings...", file=sys.stderr)

    result = generate_embeddings(photos)

    print(json.dumps(result), flush=True)

except Exception as e:
    import traceback

    print("PYTHON ERROR:", str(e), file=sys.stderr)
    traceback.print_exc(file=sys.stderr)

    # Send empty JSON so Node doesn't crash on JSON.parse("")
    print("[]", flush=True)

    sys.exit(1)