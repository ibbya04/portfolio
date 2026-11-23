# Cloud Resume Challenge & Portfolio (AWS)

A personal portfolio and cloud-hosted resume built following the [AWS Cloud Resume Challenge](https://cloudresumechallenge.dev/docs/the-challenge/aws/).

## Architecture (Built Phase-by-Phase)

- **Frontend (`frontend/`)**: Vite + Tailwind CSS static site hosted on **Amazon S3** and served globally over HTTPS via **Amazon CloudFront**.
- **Backend (`backend/`)**: Python **AWS Lambda** function behind **Amazon API Gateway** storing visitor counts in **Amazon DynamoDB**, tested with `pytest`.
- **Infrastructure (`infra/`)**: Provisioned as code with **Terraform**.
- **CI/CD (`.github/workflows/`)**: Automated testing and deployments via **GitHub Actions**.

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Build static files (what gets uploaded to S3):

```bash
cd frontend
npm run build
```
