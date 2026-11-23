output "s3_bucket_name" {
  description = "Private S3 bucket hosting the built portfolio files."
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (used to invalidate cache after deploys)."
  value       = aws_cloudfront_distribution.frontend.id
}

output "website_url" {
  description = "Live HTTPS URL for your portfolio site."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}
