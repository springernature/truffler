
# Color helpers
C_CYAN=\x1b[34;01m
C_RESET=\x1b[0m

# Group targets
all: deps lint test
ci: lint test

# Install dependencies
deps:
	@echo "$(C_CYAN)> installing dependencies$(C_RESET)"
	@npm install

# Lint JavaScript
lint: jshint jscs

# Run JSHint
jshint:
	@echo "$(C_CYAN)> linting javascript$(C_RESET)"
	@./node_modules/.bin/jshint .

# Run JavaScript Code Style
jscs:
	@echo "$(C_CYAN)> checking javascript code style$(C_RESET)"
	@./node_modules/.bin/jscs .

# Run all tests
test: test-coverage test-integration

# Run unit tests
test-unit:
	@echo "$(C_CYAN)> running unit tests$(C_RESET)"
	@./node_modules/.bin/mocha ./test/unit --timeout 800 --slow 25 --reporter spec --colors --recursive

# Run unit tests with coverage
test-coverage:
	@echo "$(C_CYAN)> running unit tests with coverage$(C_RESET)"
	@./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- ./test/unit --timeout 800 --slow 25 --reporter spec --recursive
	@./node_modules/.bin/istanbul check-coverage --statement 90 --branch 90 --function 90

# Run integration tests
test-integration:
	@echo "$(C_CYAN)> running integration tests$(C_RESET)"
	@./node_modules/.bin/mocha ./test/integration --timeout 30000 --slow 100 --reporter spec --colors --recursive

.PHONY: test
