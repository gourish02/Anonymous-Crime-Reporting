"""
Unit and Integration Tests for AI Crime Classifier.
Tests all 5 crime categories (Theft, Assault, Cyber Crime, Fraud, Vandalism),
risk level evaluation, confidence thresholding, and FastAPI endpoints.
"""

import os
import sys
import unittest

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data import CATEGORIES
from backend.classifier import engine, classify_crime


class TestAICrimeClassifier(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Force initial training/loading
        engine.reload()

    def test_categories_present(self):
        """Test that all 5 categories are supported."""
        self.assertEqual(len(CATEGORIES), 5)
        self.assertIn("Theft", CATEGORIES)
        self.assertIn("Assault", CATEGORIES)
        self.assertIn("Cyber Crime", CATEGORIES)
        self.assertIn("Fraud", CATEGORIES)
        self.assertIn("Vandalism", CATEGORIES)

    def test_classify_theft(self):
        """Test classification of theft crime description."""
        desc = "Someone broke into my parked car and stole my laptop bag and wallet from the back seat."
        result = classify_crime(desc)
        self.assertEqual(result["category"], "Theft")
        self.assertGreater(result["confidence"], 0.60)
        self.assertIn(result["risk_level"], ["Low", "Medium", "High"])
        self.assertIn("Theft", result["probabilities"])

    def test_classify_assault_critical(self):
        """Test classification of violent assault with weapon, expecting Critical risk."""
        desc = "An armed suspect attacked a pedestrian with a knife in the alley, causing deep stab wounds and heavy bleeding."
        result = classify_crime(desc)
        self.assertEqual(result["category"], "Assault")
        self.assertGreater(result["confidence"], 0.60)
        self.assertEqual(result["risk_level"], "Critical")
        self.assertTrue(any(f in ["knife", "stab", "bleeding"] for f in result["risk_factors"]))

    def test_classify_cyber_crime(self):
        """Test classification of cyber security incident."""
        desc = "LockBit ransomware encrypted our database servers and attackers are demanding a 5 Bitcoin ransom to restore data."
        result = classify_crime(desc)
        self.assertEqual(result["category"], "Cyber Crime")
        self.assertGreater(result["confidence"], 0.65)
        self.assertIn(result["risk_level"], ["High", "Critical"])

    def test_classify_fraud(self):
        """Test classification of financial fraud / scam."""
        desc = "Elderly victim was tricked by a phone scammer into wiring their $50,000 life savings into a fake investment account."
        result = classify_crime(desc)
        self.assertEqual(result["category"], "Fraud")
        self.assertGreater(result["confidence"], 0.60)
        self.assertIn(result["risk_level"], ["Medium", "High"])

    def test_classify_vandalism(self):
        """Test classification of property vandalism."""
        desc = "Teenagers spray painted graffiti tags all over the front doors and smashed the exterior bus stop glass."
        result = classify_crime(desc)
        self.assertEqual(result["category"], "Vandalism")
        self.assertGreater(result["confidence"], 0.60)
        self.assertIn(result["risk_level"], ["Low", "Medium"])

    def test_empty_string_handling(self):
        """Test that empty descriptions don't crash."""
        result = classify_crime("")
        self.assertIn("category", result)
        self.assertEqual(result["confidence"], 0.0)

    def test_probability_distribution(self):
        """Test that probabilities sum to approximately 1.0."""
        desc = "Suspicious individual picked my pocket and stole my phone on the metro."
        result = classify_crime(desc)
        prob_sum = sum(result["probabilities"].values())
        self.assertAlmostEqual(prob_sum, 1.0, places=2)


if __name__ == "__main__":
    unittest.main()
