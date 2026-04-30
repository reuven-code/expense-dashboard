# Makefile for Barber Agent - Telegram Bot Testing

.PHONY: help test-bot test-setup test-local test-deployed test-security clean

help:
	@echo "🧪 Barber Agent - Telegram Bot Testing"
	@echo ""
	@echo "Available commands:"
	@echo "  make test-bot        - Quick bot connectivity test"
	@echo "  make test-setup      - Full setup and webhook configuration"
	@echo "  make test-local      - Test locally with Firebase emulator"
	@echo "  make test-deployed   - Test after Firebase deployment"
	@echo "  make test-security   - Test security features"
	@echo "  make test-all        - Run all tests"
	@echo "  make clean          - Clean test data"
	@echo ""

test-bot:
	@echo "🧪 Running bot connectivity test..."
	@bash scripts/test-telegram-bot.sh

test-setup:
	@echo "🔧 Running full setup with webhook..."
	@bash scripts/setup-telegram-webhook.sh

test-local:
	@echo "🚀 Starting local testing environment..."
	@echo ""
	@echo "1. Starting Firebase emulator..."
	@firebase emulators:start --only functions &
	@EMULATOR_PID=$$!
	@sleep 5
	@echo ""
	@echo "2. Running tests..."
	@bash scripts/test-telegram-bot.sh
	@echo ""
	@echo "3. To test webhook, start ngrok in another terminal:"
	@echo "   ngrok http 5001"
	@kill $$EMULATOR_PID

test-deployed:
	@echo "🌐 Testing deployed Firebase functions..."
	@echo "Checking Cloud Scheduler..."
	@gcloud scheduler jobs list --filter="name:dailyReportJob" || echo "Job not found"
	@echo ""
	@echo "Checking webhook..."
	@curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | jq '.result.url'

test-security:
	@echo "🔐 Testing security features..."
	@echo ""
	@echo "Test 1: Unauthorized access"
	@curl -s -X POST "http://localhost:5001/barber-agent-prod/us-central1/telegramBotWebhook" \
		-H "Content-Type: application/json" \
		-d '{
			"message": {
				"chat": {"id": 999999999},
				"from": {"id": 999999999},
				"text": "/status"
			}
		}' | jq '.error // "No error (check response)"'
	@echo ""
	@echo "Test 2: Invalid bot token"
	@curl -s "https://api.telegram.org/bot/INVALID/getMe" | jq '.error_code // "No error"'

test-all: test-bot test-local test-security
	@echo "✅ All tests completed!"

clean:
	@echo "🧹 Cleaning test data..."
	@firebase firestore:delete shops/test-shop-001 --yes || true
	@firebase firestore:delete error_logs/test-error-001 --yes || true
	@echo "✅ Test data cleaned"

# Development commands
dev-functions:
	@echo "Starting Cloud Functions emulator..."
	@firebase emulators:start --only functions

dev-logs:
	@echo "Watching Firebase logs..."
	@firebase functions:log

deploy-functions:
	@echo "Deploying Cloud Functions..."
	@firebase deploy --only functions
	@echo ""
	@echo "Next: bash scripts/setup-telegram-webhook.sh"
