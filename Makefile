.PHONY: help up down logs ps restart clean db-reset db-backup db-restore

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Inicia todos os serviços do Docker
	docker-compose up -d

down: ## Para todos os serviços do Docker
	docker-compose down

logs: ## Mostra logs de todos os serviços
	docker-compose logs -f

ps: ## Lista status dos serviços
	docker-compose ps

restart: ## Reinicia todos os serviços
	docker-compose restart

clean: ## Para e remove todos os containers e volumes (APAGA DADOS!)
	docker-compose down -v
	@echo "⚠️  Todos os dados foram removidos!"

db-reset: ## Reseta o banco de dados
	docker-compose down -v
	docker-compose up -d postgres
	@echo "✅ Banco de dados resetado!"

db-backup: ## Faz backup do banco de dados
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U postgres serveon > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup criado em backups/"

db-restore: ## Restaura backup do banco (use BACKUP=arquivo.sql)
	@if [ -z "$(BACKUP)" ]; then echo "❌ Use: make db-restore BACKUP=arquivo.sql"; exit 1; fi
	docker-compose exec -T postgres psql -U postgres serveon < $(BACKUP)
	@echo "✅ Backup restaurado!"

db-shell: ## Abre shell do PostgreSQL
	docker-compose exec postgres psql -U postgres -d serveon

install: ## Instala dependências do projeto
	npm install
	cd frontend && npm install

dev: up ## Inicia ambiente de desenvolvimento
	@echo "⏳ Aguardando PostgreSQL iniciar..."
	@sleep 5
	npm run dev

test: ## Executa testes
	npm run test

test-e2e: ## Executa testes E2E
	docker-compose up -d postgres-test
	@sleep 3
	npm run test:e2e
