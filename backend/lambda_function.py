"""AWS Lambda function for the portfolio visitor counter."""

import json
import logging
import os
from typing import Any

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def _get_table():
    """Return the DynamoDB Table resource configured via environment variables."""
    table_name = os.environ["TABLE_NAME"]
    region = os.environ.get("AWS_REGION", "eu-north-1")
    dynamodb = boto3.resource("dynamodb", region_name=region)
    return dynamodb.Table(table_name)


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """Atomically increment the portfolio visitor count in DynamoDB and return it."""
    counter_id = os.environ.get("COUNTER_ID", "portfolio")

    try:
        table = _get_table()
        response = table.update_item(
            Key={"id": counter_id},
            UpdateExpression="ADD visits :inc",
            ExpressionAttributeValues={":inc": 1},
            ReturnValues="UPDATED_NEW",
        )
        # DynamoDB returns numbers as Decimal; cast to int so json.dumps() works cleanly.
        visits = int(response["Attributes"]["visits"])

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"visits": visits}),
        }
    except KeyError as err:
        logger.error("Missing required environment variable: %s", err)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Server misconfiguration"}),
        }
    except ClientError as err:
        logger.exception("DynamoDB error updating visitor count: %s", err)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Failed to update visitor count"}),
        }
