import json
import os
from typing import List, Any, Dict, Optional
from pathlib import Path

class JSONStore:
    def __init__ (self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)

    def _get_file_path(self, collection: str) -> Path:
        return self.data_dir / f"{collection}.json"
    
    def _read_collection(self, collection: str) -> List[Dict[str, Any]]:
        file_path = self._get_file_path(collection)
        if not file_path.exists():
            return []
        
        try:
            with open(file_path, 'r') as f:
                content = f.read().strip()
                if not content:
                    return []
                return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from {collection}.json: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error reading {collection}.json: {e}")
            return []
        
    def _write_collection(self, collection: str, data: List[Dict[str, Any]]) -> None:
        file_path = self._get_file_path(collection)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

    def find_all(self, collection: str) -> List[Dict[str, Any]]:
        return self._read_collection(collection)
    
    def find_one(self, collection: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = self._read_collection(collection)
        for item in items:
            if all(item.get(k) == v for k, v in query.items()):
                return item
        return None
    
    def insert_one(self, collection: str, document: Dict[str, Any]) -> Dict[str, Any]:
        items = self._read_collection(collection)
        items.append(document)
        self._write_collection(collection, items)
        return document
    
    def update_one(self, collection: str, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        items = self._read_collection(collection)
        for i, item in enumerate(items):
            if all(item.get(k) == v for k, v in query.items()):
                items[i].update(update)
                self._write_collection(collection, items)
                return True
        return False
    
    def delete_one(self, collection: str, query: Dict[str, Any]) -> bool:
        items = self._read_collection(collection)
        for i, item in enumerate(items):
            if all(item.get(k) == v for k, v in query.items()):
                items.pop(i)
                self._write_collection(collection, items)
                return True
        return False