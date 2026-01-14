.PHONY: install start stop dev dev-client dev-server db-start db-stop db-reset db-status build typecheck lint lint-fix generate-types clean help

# Default target
help:
	@echo "Vantage Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make start            Start all services (db, server, client)"
	@echo "  make stop             Stop all services"
	@echo "  make dev              Alias for start"
	@echo "  make dev-client       Start only the Vite dev server"
	@echo "  make dev-server       Start only the Fastify server"
	@echo ""
	@echo "Database:"
	@echo "  make db-start         Start Supabase (requires Docker)"
	@echo "  make db-stop          Stop Supabase"
	@echo "  make db-reset         Reset database and apply migrations"
	@echo "  make db-status        Show Supabase status"
	@echo ""
	@echo "Build & Quality:"
	@echo "  make build            Build client and server"
	@echo "  make typecheck        Run TypeScript type checking"
	@echo "  make lint             Run ESLint"
	@echo "  make lint-fix         Run ESLint with auto-fix"
	@echo "  make generate-types   Generate API and DB types"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            Remove build artifacts"

# Install dependencies for both client and server
install:
	npm install
	cd server && npm install

# Start all services (runs in background, use make stop to stop)
start: db-start
	@echo "Starting server..."
	cd server && npm run dev &
	@echo "Starting client..."
	npm run dev

# Stop all services
stop:
	@echo "Stopping client and server..."
	-pkill -f "vite" 2>/dev/null || true
	-pkill -f "tsx watch" 2>/dev/null || true
	@echo "Stopping Supabase..."
	npx supabase stop

# Alias for start
dev: start

# Start only the Vite frontend
dev-client:
	npm run dev

# Start only the Fastify server
dev-server:
	cd server && npm run dev

# Database commands
db-start:
	@echo "Starting Supabase..."
	npx supabase start

db-stop:
	npx supabase stop

db-reset:
	npx supabase db reset

db-status:
	npx supabase status

# Build both client and server
build:
	npm run build
	cd server && npm run build

# Type checking
typecheck:
	npm run typecheck
	cd server && npm run typecheck

# Linting
lint:
	npm run lint
	cd server && npm run lint

lint-fix:
	npm run lint:fix
	cd server && npm run lint:fix

# Generate types (server must be running for API types)
generate-types:
	npm run server:generate-types
	npm run db:generate-types

# Clean build artifacts
clean:
	rm -rf dist
	rm -rf server/dist
	rm -rf node_modules/.vite