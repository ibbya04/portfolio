"""Unit tests for the visitor counter Lambda using moto to mock DynamoDB locally."""

import json
import sys
from pathlib import Path

import boto3
import pytest
from moto import mock_aws

# Allow importing lambda_function from backend/ regardless of working directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import lambda_function  # noqa: E402

TEST_TABLE_NAME = "test-visitor-counter"
TEST_REGION = "eu-north-1"


@pytest.fixture
def dynamodb_table(monkeypatch):
    """Spin up an in-memory fake DynamoDB table for each test."""
    monkeypatch.setenv("TABLE_NAME", TEST_TABLE_NAME)
    monkeypatch.setenv("AWS_REGION", TEST_REGION)
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")

    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name=TEST_REGION)
        table = dynamodb.create_table(
            TableName=TEST_TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        table.wait_until_exists()
        yield table


def test_first_visit_initializes_counter_to_one(dynamodb_table):
    response = lambda_function.lambda_handler(event={}, context=None)

    assert response["statusCode"] == 200
    assert response["headers"]["Content-Type"] == "application/json"
    body = json.loads(response["body"])
    assert body == {"visits": 1}


def test_subsequent_visits_increment_atomically(dynamodb_table):
    counts = []
    for _ in range(3):
        res = lambda_function.lambda_handler(event={}, context=None)
        assert res["statusCode"] == 200
        counts.append(json.loads(res["body"])["visits"])

    assert counts == [1, 2, 3]

    # Verify the actual item persisted inside the mocked DynamoDB table
    item = dynamodb_table.get_item(Key={"id": "portfolio"})["Item"]
    assert int(item["visits"]) == 3


def test_missing_table_env_returns_500(monkeypatch):
    monkeypatch.delenv("TABLE_NAME", raising=False)

    response = lambda_function.lambda_handler(event={}, context=None)

    assert response["statusCode"] == 500
    assert "error" in json.loads(response["body"])
