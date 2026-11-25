# -----------------------------------------------------------------------------
# 1. Private S3 Bucket (stores our built frontend/dist/ static files)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-${data.aws_caller_identity.current.account_id}"
}

# Block ALL direct public access — visitors must go through CloudFront over HTTPS
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------------------------
# 2. CloudFront Origin Access Control (OAC)
#    Gives CloudFront cryptographic permission to read from our private S3 bucket
# -----------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-s3-oac"
  description                       = "Allows CloudFront to read private S3 portfolio files"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# AWS-managed caching policy ("CachingOptimized")
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

# -----------------------------------------------------------------------------
# 2b. ACM SSL/TLS Certificate in us-east-1 (required by CloudFront)
#     Validated via DNS CNAME records in Cloudflare
# -----------------------------------------------------------------------------
resource "aws_acm_certificate" "frontend" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# 3. CloudFront CDN Distribution (global HTTPS delivery)
# -----------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Portfolio & Cloud Resume Challenge CDN"
  price_class         = "PriceClass_100" # North America & Europe (lowest cost / Free Tier friendly)
  aliases             = var.custom_domain_validated ? [var.domain_name, "www.${var.domain_name}"] : []

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  # Serve index.html cleanly if someone hits a non-existent path instead of raw S3 XML error
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 60
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = !var.custom_domain_validated
    acm_certificate_arn            = var.custom_domain_validated ? aws_acm_certificate.frontend.arn : null
    ssl_support_method             = var.custom_domain_validated ? "sni-only" : null
    minimum_protocol_version       = var.custom_domain_validated ? "TLSv1.2_2021" : "TLSv1"
  }
}

# -----------------------------------------------------------------------------
# 4. S3 Bucket Policy (grants ONLY this CloudFront distribution read access)
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "frontend_s3_policy" {
  statement {
    sid     = "AllowCloudFrontServicePrincipalReadOnly"
    effect  = "Allow"
    actions = ["s3:GetObject"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_s3_policy.json

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
