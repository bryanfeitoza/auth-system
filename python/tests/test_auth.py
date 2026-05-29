import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)


class TestAuth:
    def test_register(self):
        res = client.post("/api/auth/register", json={
            "name": "Test User",
            "email": "test@test.com",
            "password": "123456"
        })
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "test@test.com"

    def test_register_duplicate(self):
        res = client.post("/api/auth/register", json={
            "name": "Test User",
            "email": "test@test.com",
            "password": "123456"
        })
        assert res.status_code == 409

    def test_register_weak_password(self):
        res = client.post("/api/auth/register", json={
            "name": "Test",
            "email": "weak@test.com",
            "password": "123"
        })
        assert res.status_code == 400

    def test_login(self):
        res = client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "123456"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_invalid(self):
        res = client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "wrong"
        })
        assert res.status_code == 401

    def test_refresh(self):
        login = client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "123456"
        }).json()

        res = client.post("/api/auth/refresh", json={
            "refresh_token": login["refresh_token"]
        })
        assert res.status_code == 200
        assert "access_token" in res.json()
        assert "refresh_token" in res.json()

    def test_refresh_invalid(self):
        res = client.post("/api/auth/refresh", json={
            "refresh_token": "invalid"
        })
        assert res.status_code == 401

    def test_me(self):
        login = client.post("/api/auth/login", json={
            "email": "test@test.com",
            "password": "123456"
        }).json()

        res = client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {login['access_token']}"
        })
        assert res.status_code == 200
        assert res.json()["email"] == "test@test.com"

    def test_me_unauthorized(self):
        res = client.get("/api/auth/me")
        assert res.status_code == 403
