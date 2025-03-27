# Guia de Implantação do Projeto Serveon

Este guia contém as instruções para implantar o sistema Serveon em um ambiente de produção.

## 1. Implantação do Banco de Dados (Render)

1. Crie uma conta em [render.com](https://render.com)
2. Escolha "New" e selecione "PostgreSQL"
3. Configure seu banco:
   - Nome: `serveon-db`
   - Usuário e senha: Use os gerados automaticamente ou defina seus próprios
   - Região: Selecione a mais próxima
4. Uma vez criado, obtenha as informações de conexão (host, usuário, senha, nome do banco)
5. Use o script `deploy-db.sql` para inicializar o banco através da interface SQL do Render

## 2. Implantação do Backend (Render)

1. No Render:
   - Escolha "New" e selecione "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - Nome: `serveon-api`
     - Região: A mesma do banco de dados
     - Branch: `main`
     - Runtime: `Node`
     - Build Command: `yarn install && yarn build`
     - Start Command: `yarn start:prod`
   
   - Em "Environment Variables", adicione todas as variáveis do arquivo `.env`:
     ```
     DB_HOST=<host-do-banco-de-dados>
     DB_PORT=5432
     DB_USERNAME=<usuario>
     DB_PASSWORD=<senha>
     DB_DATABASE=<nome-do-banco>
     PORT=3000
     ```
   
   - Clique em "Create Web Service"

## 3. Implantação do Frontend (Vercel)

1. Na Vercel:
   - Crie uma conta em [vercel.com](https://vercel.com)
   - Escolha "New Project" e selecione seu repositório
   - Configure:
     - Root Directory: `frontend`
   
   - Em "Environment Variables", adicione:
     ```
     VITE_API_URL=<url-do-backend-render>/api
     ```
   
   - Clique em "Deploy"

## 4. Verificação

1. Quando todas as implantações estiverem concluídas, acesse o frontend pela URL fornecida pela Vercel
2. Verifique se todas as funcionalidades estão operando corretamente
3. Se houver problemas de conexão com o backend, verifique os logs no Render