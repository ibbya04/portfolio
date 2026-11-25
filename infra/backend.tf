# -----------------------------------------------------------------------------
# 1. DynamoDB Table (Serverless NoSQL store for the visitor counter)
# -----------------------------------------------------------------------------
resource "aws_dynamodb_table" "visitor_counter" {
  name         = "${var.project_name}-visitors"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

# -----------------------------------------------------------------------------
# 2. Package Python Lambda code into a zip automatically
# -----------------------------------------------------------------------------
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambda_function.py"
  output_path = "${path.module}/.build/lambda_function.zip"
}

# -----------------------------------------------------------------------------
# 3. CloudWatch Log Group (14-day retention so logs don't grow forever)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.project_name}-visitor-counter"
  retention_in_days = 14
}

# -----------------------------------------------------------------------------
# 4. Least-Privilege IAM Execution Role for Lambda
#    Allows ONLY dynamodb:UpdateItem on this table + writing to this log group
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name               = "${var.project_name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    sid       = "AllowUpdateVisitorCounterItem"
    effect    = "Allow"
    actions   = ["dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.visitor_counter.arn]
  }

  statement {
    sid    = "AllowWriteCloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["${aws_cloudwatch_log_group.lambda.arn}:*"]
  }
}

resource "aws_iam_role_policy" "lambda_permissions" {
  name   = "${var.project_name}-lambda-policy"
  role   = aws_iam_role.lambda_exec.id
  policy = data.aws_iam_policy_document.lambda_permissions.json
}

# -----------------------------------------------------------------------------
# 5. AWS Lambda Function (Python 3.13 on arm64 Graviton)
# -----------------------------------------------------------------------------
resource "aws_lambda_function" "visitor_counter" {
  function_name    = "${var.project_name}-visitor-counter"
  role             = aws_iam_role.lambda_exec.arn
  runtime          = "python3.13"
  handler          = "lambda_function.lambda_handler"
  architectures    = ["arm64"]
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 5
  memory_size      = 128

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitor_counter.name
      COUNTER_ID = "portfolio"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy.lambda_permissions,
  ]
}

# -----------------------------------------------------------------------------
# 6. API Gateway HTTP API (Public HTTPS front door + CORS + Rate Throttling)
# -----------------------------------------------------------------------------
resource "aws_apigatewayv2_api" "visitor_api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://${var.domain_name}",
      "https://www.${var.domain_name}",
      "https://${aws_cloudfront_distribution.frontend.domain_name}",
      "http://localhost:5173",
    ]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.visitor_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.visitor_counter.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post_visits" {
  api_id    = aws_apigatewayv2_api.visitor_api.id
  route_key = "POST /visits"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.visitor_api.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 10
    throttling_rate_limit  = 5
  }
}

# Grant ONLY this API Gateway permission to invoke our Lambda function
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitor_counter.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.visitor_api.execution_arn}/*/*"
}
