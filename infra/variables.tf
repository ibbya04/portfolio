variable "aws_region" {
  description = "AWS region for resources (pinned to this AWS project's home region)."
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Short prefix used to name AWS resources consistently."
  type        = string
  default     = "cloud-resume-portfolio"
}

variable "github_repository" {
  description = "GitHub owner/repo allowed to assume AWS deploy roles via OIDC."
  type        = string
  default     = "ibbya04/portfolio"
}
