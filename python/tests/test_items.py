import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)


class TestItems:
    @pytest.fixture(autouse=True)
    def setup(self):
        res = client.post("/api/auth/register", json={
            "name": "Item User",
            "email": "items@test.com",
            "password": "123456"
        })
        self.access_token = res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.access_token}"}

    def test_create_item(self):
        res = client.post("/api/items", json={
            "title": "Test Item",
            "description": "A test item"
        }, headers=self.headers)
        assert res.status_code == 201
        assert res.json()["title"] == "Test Item"
        return res.json()["id"]

    def test_list_items_paginated(self):
        self.test_create_item()
        res = client.get("/api/items?page=1&limit=10", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        assert "data" in data
        assert "total" in data
        assert "total_pages" in data

    def test_get_item(self):
        item_id = self.test_create_item()
        res = client.get(f"/api/items/{item_id}", headers=self.headers)
        assert res.status_code == 200
        assert res.json()["id"] == item_id

    def test_update_item(self):
        item_id = self.test_create_item()
        res = client.put(f"/api/items/{item_id}", json={
            "title": "Updated",
            "status": "completed"
        }, headers=self.headers)
        assert res.status_code == 200
        assert res.json()["title"] == "Updated"
        assert res.json()["status"] == "completed"

    def test_delete_item(self):
        item_id = self.test_create_item()
        res = client.delete(f"/api/items/{item_id}", headers=self.headers)
        assert res.status_code == 200

        res = client.get(f"/api/items/{item_id}", headers=self.headers)
        assert res.status_code == 404
