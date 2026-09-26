"""
Integration tests for FastAPI REST API endpoints.
Tests /api/classify, /api/categories, /api/health, /api/stats, and error handling.
"""

import os
import sys
import unittest
from fastapi.testclient import TestClient

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app


class TestFastAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        """Test root / endpoint."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("classify", data["endpoints"])

    def test_health_endpoint(self):
        """Test /api/health endpoint."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])
        self.assertEqual(len(data["categories"]), 5)

    def test_categories_endpoint(self):
        """Test /api/categories endpoint returns all 5 categories."""
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for cat in ["Theft", "Assault", "Cyber Crime", "Fraud", "Vandalism"]:
            self.assertIn(cat, data)
            self.assertIn("icon", data[cat])
            self.assertIn("base_risk", data[cat])

    def test_classify_endpoint_valid(self):
        """Test /api/classify with realistic description."""
        payload = {
            "description": "Someone shattered my car side window and stole my laptop backpack, passport, and wallet from the back seat."
        }
        response = self.client.post("/api/classify", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["category"], "Theft")
        self.assertIn(data["risk_level"], ["Low", "Medium", "High"])
        self.assertGreater(data["confidence"], 0.60)
        self.assertIn("probabilities", data)
        self.assertEqual(len(data["probabilities"]), 5)
        self.assertIn("explanation", data)

    def test_classify_endpoint_cyber(self):
        """Test /api/classify with cyber crime description."""
        payload = {
            "description": "Our SQL database was hacked via an injection attack and sensitive user emails were dumped online."
        }
        response = self.client.post("/api/classify", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["category"], "Cyber Crime")
        self.assertGreater(data["confidence"], 0.60)

    def test_classify_endpoint_invalid_short(self):
        """Test validation error when description is too short."""
        response = self.client.post("/api/classify", json={"description": "ab"})
        self.assertEqual(response.status_code, 422)  # Unprocessable Entity (Pydantic validation)

    def test_stats_endpoint(self):
        """Test /api/stats endpoint."""
        response = self.client.get("/api/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("metrics", data)
        self.assertIn("accuracy", data["metrics"])


if __name__ == "__main__":
    unittest.main()
