# Cloud Resume Challenge & Portfolio (AWS)

A personal portfolio and serverless cloud resume built following the [AWS Cloud Resume Challenge](https://cloudresumechallenge.dev/docs/the-challenge/aws/).

- **Live Site:** https://dd2cjuvwfp75y.cloudfront.net
- **Write-Up:** [docs/blog-post.md](docs/blog-post.md)

## Architecture

- **Frontend (`frontend/`)**: Vite + Tailwind CSS static site stored in a **private Amazon S3** bucket (`eu-north-1`) and served globally over HTTPS via **Amazon CloudFront** with Origin Access Control (OAC).
- **Backend (`backend/`)**: Python 3.13 (`arm64`) **AWS Lambda** function behind **Amazon API Gateway (HTTP API)** with strict CORS and rate throttling, atomically incrementing a visitor counter in **Amazon DynamoDB** (`PAY_PER_REQUEST`). Tested locally with `pytest` + `moto`.
- **Infrastructure as Code (`infra/`)**: 100% provisioned with **Terraform**, using an encrypted, versioned **S3 remote state backend** with native S3 state locking (`use_lockfile = true`).
- **CI/CD (`.github/workflows/`)**: Path-filtered **GitHub Actions** pipelines authenticating via **AWS OIDC** (zero static AWS keys) with separate least-privilege IAM roles for frontend and backend deployments.

## Project Structure

```text
├── frontend/                  # Vite + Tailwind portfolio & resume site
├── backend/                   # Python Lambda handler + pytest/moto unit tests
├── infra/                     # Terraform IaC (frontend, backend, OIDC CI/CD)
├── .github/workflows/         # Automated CI/CD pipelines
└── docs/blog-post.md          # Project write-up & lessons learned
```

## Local Development

### Frontend
```bash
cd frontend
cp .env.example .env.local   # set VITE_VISITOR_API_URL
npm install
npm run dev
```

### Backend Unit Tests
```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/pytest -v
```

### Infrastructure
```bash
cd infra
terraform init
terraform plan
```
