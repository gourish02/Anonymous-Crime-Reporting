# 📸 Application Interface & UI Showcase

Visual preview of the **CrimeShield: Anonymous Crime Reporting & Verification DApp** and its integrated **AI Crime Classifier**.

---

## 1. Landing Page & Live Network Telemetry
The dashboard greets users with real-time statistics, zero-knowledge mathematical privacy claims, and direct action triggers.

![CrimeShield Dashboard](screenshots/dashboard_home.jpg)

**Key Highlights:**
- Live on-chain counters for Total Reports, ZK-Verified Reports, and Critical Severity incidents.
- Cryptographic claim banner: *"Report verified without revealing reporter identity"*.
- Lace Wallet status pill and instant network switcher (`preprod` / `devnet`).

---

## 2. Crime Report Submission with Embedded AI Assistant
A streamlined form equipped with local zero-knowledge witness generation and Scikit-Learn ML assistance.

![Submit Report Form with AI Assistant](screenshots/submit_report.jpg)

**Key Highlights:**
- Crime Category selector across all 5 classes (`Theft`, `Assault`, `Cyber Crime`, `Fraud`, `Vandalism`).
- Private fields (Incident Description and Location) are hashed client-side inside the browser witness before proof generation.
- Real-time **AI Crime Classifier Assistant**: predicts crime category, displays calibrated confidence, and assesses risk level.
- 1-click **"Apply Category"** button.

---

## 3. Zero-Knowledge On-Chain Verification
The verification screen proves that a legitimate crime report exists on the Midnight blockchain without disclosing who reported it.

![Zero-Knowledge Report Verification](screenshots/verification_screen.jpg)

**Key Highlights:**
- Verified on-chain checkmark badge.
- Cryptographic proof metadata: proof size (1,480 bytes), generation latency (1,820 ms), and transaction hash.
- Observable privacy behavior: validates data integrity while keeping reporter identity completely hidden.

---

## 4. AI Crime Classifier & Risk Assessment Lab
Dedicated machine learning laboratory to benchmark, analyze, and inspect multi-class predictions.

![AI Crime Classifier & Risk Assessment Lab](screenshots/ai_classifier_lab.jpg)

**Key Highlights:**
- Real-time status indicator showing FastAPI backend connection and Scikit-Learn version.
- Quick benchmark scenario buttons (Car Break-in, Armed Assault, Enterprise Ransomware, Elderly Wire Scam, Vandalism).
- Multi-class probability distribution progress bars.
- Evaluated risk levels (`Low`, `Medium`, `High`, `Critical`) with threat keyword extraction.
- Direct bridge to submit the analyzed incident as an anonymous on-chain report.
