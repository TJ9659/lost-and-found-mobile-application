from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from typing import List, Optional
import torch  # Need this for stacking

app = FastAPI()
model = SentenceTransformer('all-mpnet-base-v2')

# this lives in the server memory as long as the app is running
embedding_cache = {}

class Item(BaseModel):
    id: int
    name: str
    full_text: str
    category: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = []

class SearchRequest(BaseModel):
    query: str
    items: List[Item]

@app.post("/search/nlp-search")
def search(data: SearchRequest):
    # encode the query
    query_embedding = model.encode(data.query, convert_to_tensor=True)
    
    # check cache for item texts
    item_texts = [item.full_text.lower() for item in data.items]
    to_encode = [text for text in item_texts if text not in embedding_cache]
            
    # only encode items not seen before
    if to_encode:
        new_embeddings = model.encode(to_encode, convert_to_tensor=True)
        for text, emb in zip(to_encode, new_embeddings):
            embedding_cache[text] = emb
            
    # uses torch.stack to combine tensors from the cache
    # this turns to a list of vectors
    item_embeddings = torch.stack([embedding_cache[t] for t in item_texts])

    # calculate similarity
    scores = util.cos_sim(query_embedding, item_embeddings)[0]

    results = []
    for i, item in enumerate(data.items):
        score = float(scores[i])
        if score >= 0.5:
            level = "High" if score >= 0.75 else "Mid"
            results.append({
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "building": item.building,
                "floor": item.floor,
                "location": item.location,
                "tags": item.tags,
                "score": round(score, 4),
                "level": level
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:25]