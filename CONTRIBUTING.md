# Contributing to Anonymous Crime Reporting DApp

Thank you for your interest in contributing to the **Anonymous Crime Reporting & Verification DApp**! We welcome community contributions to help strengthen decentralized privacy, zero-knowledge tooling, machine learning classification, and public safety infrastructure.

---

## 📋 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors regardless of background, gender, sexual orientation, disability, physical appearance, or religion.

- Be respectful, constructive, and collaborative.
- Focus on what is best for the community and users.
- Show empathy towards other contributors.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or v20.x
- **npm**: v9.x or v10.x
- **Python**: v3.10+ (for the Scikit-Learn + FastAPI AI classifier backend)
- **Compact Toolchain**: Version `>= 0.20` (installed via Midnight Compact installer or cloud runner)
- **Lace Wallet Extension**: Midnight-enabled build for browser testing

### 1. Clone the Repository
```bash
git clone https://github.com/gourish02/Anonymous-Crime-Reporting.git
cd Anonymous-Crime-Reporting
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install AI classifier dependencies
pip install -r backend/requirements.txt
```

### 4. Run Locally
```bash
# Terminal 1: Start FastAPI AI service (port 8000)
npm run ai:server
# or: python backend/run.py

# Terminal 2: Start Vite React frontend (port 3000)
npm run dev
```

---

## 🌿 Branching Strategy

We follow standard Git flow:
- `main`: Production-ready, deployed to Preprod testnet and Vercel.
- `feature/<name>`: New features or major enhancements (e.g., `feature/ai-confidence-meter`).
- `fix/<name>`: Bug fixes or security patches (e.g., `fix/wallet-disconnect-cleanup`).
- `docs/<name>`: Documentation improvements (e.g., `docs/circuit-guide`).

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]
```

### Allowed Types:
- `feat`: A new feature (e.g., `feat(classifier): add temperature calibration`)
- `fix`: A bug fix (e.g., `fix(contract): resolve witness parameter syntax`)
- `docs`: Documentation updates (e.g., `docs: add architecture diagrams`)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating test cases
- `ci`: CI/CD workflow changes

---

## 🧪 Testing & Validation

Before submitting a pull request, ensure all tests pass:

```bash
# 1. TypeScript strict type-check
npm run type-check

# 2. ESLint code quality
npm run lint

# 3. Frontend unit tests
npm test

# 4. Scikit-Learn & FastAPI test suite
npm run ai:test
```

All 4 validation checks must pass with zero errors. All GitHub Actions workflows (`CI — Build, Lint & Type-check`, `Deploy Contract to Preprod`, `Deploy to Vercel`) must remain green.

---

## 🚀 Submitting a Pull Request

1. Fork the repository and create your branch from `main`.
2. Ensure all tests and type checks pass cleanly.
3. Commit your changes with descriptive conventional commit messages.
4. Push your branch to your fork.
5. Open a Pull Request targeting `main`.
6. Provide a clear PR description detailing:
   - What changes were made and why.
   - Any relevant issue numbers.
   - Screenshots or verification steps.

---

## 📄 License

By contributing to this repository, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
