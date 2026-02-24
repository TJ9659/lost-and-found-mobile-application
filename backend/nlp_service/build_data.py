from sentence_transformers import SentenceTransformer
import json

# Sample items (you can load from DB later)
items = [
    {"id": 1, "title": "Blue outerwear", "desc": "Found near KB103"},
    {"id": 2, "title": "Black hoodie", "desc": "Left in library level 2"},
    {"id": 3, "title": "Red backpack", "desc": "Seen at cafeteria"},
]

model = SentenceTransformer("all-MiniLM-L6-v2")

# Compute embeddings
for item in items:
    full_text = f"{item['title']} {item['desc']}"
    item['embedding'] = model.encode(full_text).tolist()

# Save to file
with open("data.json", "w") as f:
    json.dump(items, f)
