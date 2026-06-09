from face_model import app
import cv2
import numpy as np
from numpy import dot
from numpy.linalg import norm
import sys
import json

def cosine_similarity(a,b):
    return dot(a,b)/(norm(a)*norm(b)) 

def final_send(face_embeddings,embedding):
    total = set()
    threshold = 0.6
    for f in face_embeddings:
        emb = f["embedding"]
        sim = cosine_similarity(emb,embedding)
        if sim >= threshold:
            total.add(f["photo_id"])
        elif sim > 0.5 and sim <threshold:
            total.add(f["photo_id"])

    return list(total)

def buffer_to_image(image_bytes):
    arr = np.frombuffer(image_bytes,np.uint8)
    return cv2.imdecode(arr,cv2.IMREAD_COLOR)

def generate_selfie_embeddings(selfie_bytes):
    img = buffer_to_image(selfie_bytes)
    face = app.get(img)

    if len(face)==0:
        return None
    
    return face[0].embedding.tolist()


data = json.loads(sys.stdin.read())

selfie_bytes = bytes(data["selfie"])
face_embedding = data["face_embeddings"]

embedding = generate_selfie_embeddings(selfie_bytes)

if embedding is None:
    print(json.dumps([]))
    sys.exit()

result = final_send(face_embedding,embedding)
print(json.dumps(result));
