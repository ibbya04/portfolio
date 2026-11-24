# Building My First Cloud Portfolio: The AWS Cloud Resume Challenge

Coming into this project, I had zero hands-on experience with AWS or cloud infrastructure. I wanted to build a real portfolio site while actually learning how modern cloud apps are architected, secured, and deployed—so I worked through the [AWS Cloud Resume Challenge](https://cloudresumechallenge.dev/docs/the-challenge/aws/) step by step.

**Live site:** https://dd2cjuvwfp75y.cloudfront.net  
**Source code:** https://github.com/ibbya04/portfolio

---

## What I Built

Instead of clicking around the AWS Console manually, I defined the entire stack as code using **Terraform** and automated deployments with **GitHub Actions**:

- **Static Frontend (Vite + Tailwind CSS → S3 + CloudFront):** Compiled static assets live in a **private Amazon S3 bucket** (all public access blocked) and are served globally over HTTPS by **Amazon CloudFront** using Origin Access Control (OAC).
- **Serverless Visitor Counter (API Gateway + Python Lambda + DynamoDB):** Loading the page triggers a `POST /visits` call to an **HTTP API Gateway** (with strict CORS and rate throttling), which invokes a **Python 3.13 Lambda** function that atomically increments a counter in **DynamoDB**.
- **Automated Testing (`pytest` + `moto`):** Backend unit tests mock DynamoDB locally so every change is verified in ~1 second without touching real AWS resources.
- **Zero-Secret CI/CD (GitHub Actions + AWS OIDC):** Pushing to `main` automatically runs tests, applies Terraform using a shared **remote S3 state bucket**, syncs frontend builds to S3, and invalidates the CloudFront cache—authenticating via short-lived **AWS OIDC** tokens with separate least-privilege IAM roles (zero static AWS keys stored in GitHub).

---

## Two Real-World Roadblocks That Taught Me the Most

1. **Hitting a Service Control Policy (SCP) with `AdministratorAccess`:**  
   My very first `terraform apply` failed with `AccessDenied` on `s3:CreateBucket` even though my IAM user had `AdministratorAccess`. It turned out my AWS starter workspace enforced an Organization SCP pinning regional resources to `eu-north-1`. Seeing an explicit SCP deny override local admin permissions made AWS's policy evaluation model click immediately.

2. **Debugging GitHub OIDC with AWS CloudTrail:**  
   When my GitHub Actions workflows first ran, both failed on `sts:AssumeRoleWithWebIdentity`. Pulling the event from **AWS CloudTrail** revealed that GitHub's OIDC `sub` claim included immutable numeric owner and repository IDs (`repo:owner@id/repo@id:ref:refs/heads/main`). Updating my IAM trust policy in Terraform fixed both pipelines right away.

---

## What's Next & Potential Improvements

This setup is live, automated, and runs on AWS Free Tier ($0 idle), and there are a few clear upgrades I plan to tackle next:

- **Custom Domain & Modern TLS:** Connect a custom domain via Route 53 + ACM SSL and enforce `TLSv1.2_2021` on CloudFront.
- **HTTP Security Headers:** Attach a CloudFront Response Headers Policy (`HSTS`, `Content-Security-Policy`, `X-Frame-Options`).
- **Stricter CI/CD Separation:** Split CI and CD into distinct jobs/workflows with GitHub Branch Protection rules requiring checks to pass before merging to `main`.
- **Automated IaC Security Scanning:** Add Trivy or Checkov to CI to catch Terraform misconfigurations before `apply`.
- **AWS Certification:** Build on this hands-on foundation to sit the **AWS Certified Cloud Practitioner (CLF-C02)** exam.
