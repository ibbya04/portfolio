output "s3_bucket_name" {
  description = "Private S3 bucket hosting the built portfolio files."
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (used to invalidate cache after deploys)."
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (CNAME target in Cloudflare DNS)."
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "website_url" {
  description = "Live HTTPS URL for your portfolio site."
  value       = var.custom_domain_validated ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "acm_dns_validation_records" {
  description = "DNS CNAME records to add in Cloudflare (DNS only / grey cloud) to validate the ACM HTTPS certificate."
  value = [
    for dvo in aws_acm_certificate.frontend.domain_validation_options : {
      domain = dvo.domain_name
      name   = trimsuffix(dvo.resource_record_name, ".")
      type   = dvo.resource_record_type
      value  = trimsuffix(dvo.resource_record_value, ".")
    }
  ]
}

output "dynamodb_table_name" {
  description = "DynamoDB table storing the visitor count."
  value       = aws_dynamodb_table.visitor_counter.name
}

output "visitor_api_url" {
  description = "POST endpoint to increment and fetch the live visitor count."
  value       = "${aws_apigatewayv2_api.visitor_api.api_endpoint}/visits"
}

output "github_frontend_deploy_role_arn" {
  description = "IAM Role ARN assumed by GitHub Actions via OIDC for frontend deployments."
  value       = aws_iam_role.github_frontend_deploy.arn
}

output "github_backend_deploy_role_arn" {
  description = "IAM Role ARN assumed by GitHub Actions via OIDC for backend/Terraform deployments."
  value       = aws_iam_role.github_backend_deploy.arn
}
