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
    photos = json.loads(sys.stdin.read())
except Exception as e:
    print(e, file=sys.stderr)
    sys.exit(1)

print("Generating embeddings...",file=sys.stderr)

result = generate_embeddings(photos)
print(json.dumps(result),flush=True)