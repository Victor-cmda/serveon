import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se cliente já existe
        const existingCustomer = await client.query(
          'SELECT id FROM dbo.cliente WHERE cnpj_cpf = $1',
          [createCustomerDto.cnpjCpf],
        );
        if (existingCustomer.rowCount > 0) {
          throw new ConflictException(
            `Cliente com CNPJ/CPF ${createCustomerDto.cnpjCpf} já existe`,
          );
        }

        // Inserir o novo cliente (ID será gerado automaticamente)
        const result = await client.query(
          `INSERT INTO dbo.cliente
            (cliente, apelido, cnpj_cpf, tipo, is_estrangeiro, tipo_documento, razao_social, 
            nome_fantasia, inscricao_estadual, 
            endereco, numero, complemento, bairro, 
            cidade_id, cep, telefone, email, is_destinatario, condicao_pagamento_id, 
            nacionalidade_id, limite_credito, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          RETURNING *`,
          [
            createCustomerDto.cliente,
            createCustomerDto.apelido || null,
            createCustomerDto.cnpjCpf,
            createCustomerDto.tipo,
            createCustomerDto.isEstrangeiro || false,
            createCustomerDto.tipoDocumento,
            createCustomerDto.razaoSocial,
            createCustomerDto.nomeFantasia || null,
            createCustomerDto.inscricaoEstadual || null,
            createCustomerDto.endereco || null,
            createCustomerDto.numero || null,
            createCustomerDto.complemento || null,
            createCustomerDto.bairro || null,
            createCustomerDto.cidadeId || null,
            createCustomerDto.cep || null,
            createCustomerDto.telefone || null,
            createCustomerDto.email || null,
            createCustomerDto.isDestinatario !== undefined
              ? createCustomerDto.isDestinatario
              : true,
            createCustomerDto.condicaoPagamentoId || null,
            createCustomerDto.nacionalidadeId || null,
            createCustomerDto.limiteCredito || null,
            createCustomerDto.ativo !== undefined
              ? createCustomerDto.ativo
              : true,
          ],
        );
        // Se o cliente é também destinatário, adiciona na tabela de destinatários
        if (createCustomerDto.isDestinatario !== false) {
          await client.query(
            `INSERT INTO dbo.destinatario
              (cliente_id, cnpj_cpf, tipo, is_estrangeiro, tipo_documento, razao_social, 
              nome_fantasia, inscricao_estadual, 
              endereco, numero, complemento, bairro, 
              cidade_id, cep, telefone, email, ativo)
            VALUES
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
              result.rows[0].id,
              createCustomerDto.cnpjCpf,
              createCustomerDto.tipo,
              createCustomerDto.isEstrangeiro || false,
              createCustomerDto.tipoDocumento,
              createCustomerDto.razaoSocial,
              createCustomerDto.nomeFantasia || null,
              createCustomerDto.inscricaoEstadual || null,
              createCustomerDto.endereco || null,
              createCustomerDto.numero || null,
              createCustomerDto.complemento || null,
              createCustomerDto.bairro || null,
              createCustomerDto.cidadeId || null,
              createCustomerDto.cep || null,
              createCustomerDto.telefone || null,
              createCustomerDto.email || null,
              createCustomerDto.ativo !== undefined
                ? createCustomerDto.ativo
                : true,
            ],
          );
        }
        // Se tiver destinatários associados, criar relações
        if (
          createCustomerDto.destinatariosIds &&
          createCustomerDto.destinatariosIds.length > 0
        ) {
          for (const destinatarioId of createCustomerDto.destinatariosIds) {
            // Verificar se o destinatário existe
            const destExists = await client.query(
              'SELECT id FROM dbo.destinatario WHERE id = $1',
              [destinatarioId],
            );

            if (destExists.rowCount === 0) {
              throw new BadRequestException(
                `Destinatário com ID ${destinatarioId} não existe`,
              );
            }

            // Criar relação cliente-destinatário
            await client.query(
              `INSERT INTO dbo.cliente_destinatario (cliente_id, destinatario_id)
              VALUES ($1, $2)`,
              [result.rows[0].id, destinatarioId],
            );
          }
        }

        await client.query('COMMIT');

        // Buscar dados completos do cliente para retornar
        return this.findOne(result.rows[0].id);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao criar cliente:', error);
      throw new InternalServerErrorException('Erro ao criar cliente');
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT c.*, cidade.nome as cidade_nome, estado.nome as estado_nome, estado.uf,
               c.is_destinatario, cp.nome as condicao_pagamento_nome
        FROM dbo.cliente c
        LEFT JOIN dbo.cidade ON c.cidade_id = cidade.id
        LEFT JOIN dbo.estado ON cidade.estado_id = estado.id
        LEFT JOIN dbo.condicao_pagamento cp ON c.condicao_pagamento_id = cp.id
        ORDER BY c.razao_social
      `);

      const clients = await Promise.all(
        result.rows.map(async (row) => {
          const clientEntity = this.mapToCustomerEntity(row);

          // Buscar destinatários associados
          if (!row.is_destinatario) {
            const destinatarios = await this.databaseService.query(
              `
              SELECT destinatario_id 
              FROM dbo.cliente_destinatario 
              WHERE cliente_id = $1
            `,
              [row.id],
            );

            if (destinatarios.rowCount > 0) {
              // Como destinatariosIds não existe na entity, vamos adicionar como propriedade dinâmica
              (clientEntity as any).destinatariosIds = destinatarios.rows.map(
                (d) => d.destinatario_id,
              );
            }
          }

          return clientEntity;
        }),
      );

      return clients;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw new InternalServerErrorException('Erro ao buscar clientes');
    }
  }
  async findOne(id: number): Promise<Customer> {
    try {
      const result = await this.databaseService.query(
        `
        SELECT c.*, cidade.nome as cidade_nome, estado.nome as estado_nome, estado.uf,
               c.is_destinatario, cp.nome as condicao_pagamento_nome
        FROM dbo.cliente c
        LEFT JOIN dbo.cidade ON c.cidade_id = cidade.id
        LEFT JOIN dbo.estado ON cidade.estado_id = estado.id
        LEFT JOIN dbo.condicao_pagamento cp ON c.condicao_pagamento_id = cp.id
        WHERE c.id = $1
      `,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
      }

      const clientEntity = this.mapToCustomerEntity(result.rows[0]);

      // Buscar destinatários associados se não for destinatário
      if (!result.rows[0].is_destinatario) {
        const destinatarios = await this.databaseService.query(
          `
          SELECT destinatario_id 
          FROM dbo.cliente_destinatario 
          WHERE cliente_id = $1
        `,
          [result.rows[0].id],
        );

        if (destinatarios.rowCount > 0) {
          (clientEntity as any).destinatariosIds = destinatarios.rows.map(
            (d) => d.destinatario_id,
          );
        }
      }

      return clientEntity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar cliente`);
    }
  }

  async findByDocument(cnpjCpf: string): Promise<Customer> {
    try {
      const result = await this.databaseService.query(
        `
        SELECT c.*, cidade.nome as cidade_nome, estado.nome as estado_nome, estado.uf,
               c.is_destinatario, cp.nome as condicao_pagamento_nome
        FROM dbo.cliente c
        LEFT JOIN dbo.cidade ON c.cidade_id = cidade.id
        LEFT JOIN dbo.estado ON cidade.estado_id = estado.id
        LEFT JOIN dbo.condicao_pagamento cp ON c.condicao_pagamento_id = cp.id
        WHERE c.cnpj_cpf = $1
      `,
        [cnpjCpf],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(
          `Cliente com CNPJ/CPF ${cnpjCpf} não encontrado`,
        );
      }

      const clientEntity = this.mapToCustomerEntity(result.rows[0]);

      // Buscar destinatários associados se não for destinatário
      if (!result.rows[0].is_destinatario) {
        const destinatarios = await this.databaseService.query(
          `
          SELECT destinatario_id 
          FROM dbo.cliente_destinatario 
          WHERE cliente_id = $1
        `,
          [result.rows[0].id],
        );

        if (destinatarios.rowCount > 0) {
          (clientEntity as any).destinatariosIds = destinatarios.rows.map(
            (d) => d.destinatario_id,
          );
        }
      }

      return clientEntity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar cliente por CNPJ/CPF ${cnpjCpf}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar cliente por CNPJ/CPF`,
      );
    }
  }
  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Buscar cliente atual para verificar alterações
        const clienteResult = await client.query(
          'SELECT * FROM dbo.cliente WHERE id = $1',
          [id],
        );

        if (clienteResult.rowCount === 0) {
          throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
        }

        const clienteAtual = clienteResult.rows[0];
        const clienteId = clienteAtual.id;

        // Construir query de atualização
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (updateCustomerDto.cliente !== undefined) {
          updates.push(`cliente = $${paramCounter++}`);
          values.push(updateCustomerDto.cliente);
        }

        if (updateCustomerDto.apelido !== undefined) {
          updates.push(`apelido = $${paramCounter++}`);
          values.push(updateCustomerDto.apelido);
        }

        if (updateCustomerDto.tipo !== undefined) {
          updates.push(`tipo = $${paramCounter++}`);
          values.push(updateCustomerDto.tipo);
        }

        if (updateCustomerDto.isEstrangeiro !== undefined) {
          updates.push(`is_estrangeiro = $${paramCounter++}`);
          values.push(updateCustomerDto.isEstrangeiro);
        }

        if (updateCustomerDto.tipoDocumento !== undefined) {
          updates.push(`tipo_documento = $${paramCounter++}`);
          values.push(updateCustomerDto.tipoDocumento);
        }

        if (updateCustomerDto.razaoSocial !== undefined) {
          updates.push(`razao_social = $${paramCounter++}`);
          values.push(updateCustomerDto.razaoSocial);
        }

        if (updateCustomerDto.nomeFantasia !== undefined) {
          updates.push(`nome_fantasia = $${paramCounter++}`);
          values.push(updateCustomerDto.nomeFantasia);
        }

        if (updateCustomerDto.inscricaoEstadual !== undefined) {
          updates.push(`inscricao_estadual = $${paramCounter++}`);
          values.push(updateCustomerDto.inscricaoEstadual);
        }

        if (updateCustomerDto.endereco !== undefined) {
          updates.push(`endereco = $${paramCounter++}`);
          values.push(updateCustomerDto.endereco);
        }

        if (updateCustomerDto.numero !== undefined) {
          updates.push(`numero = $${paramCounter++}`);
          values.push(updateCustomerDto.numero);
        }

        if (updateCustomerDto.complemento !== undefined) {
          updates.push(`complemento = $${paramCounter++}`);
          values.push(updateCustomerDto.complemento);
        }

        if (updateCustomerDto.bairro !== undefined) {
          updates.push(`bairro = $${paramCounter++}`);
          values.push(updateCustomerDto.bairro);
        }

        if (updateCustomerDto.cidadeId !== undefined) {
          updates.push(`cidade_id = $${paramCounter++}`);
          values.push(updateCustomerDto.cidadeId);
        }

        if (updateCustomerDto.cep !== undefined) {
          updates.push(`cep = $${paramCounter++}`);
          values.push(updateCustomerDto.cep);
        }

        if (updateCustomerDto.telefone !== undefined) {
          updates.push(`telefone = $${paramCounter++}`);
          values.push(updateCustomerDto.telefone);
        }

        if (updateCustomerDto.email !== undefined) {
          updates.push(`email = $${paramCounter++}`);
          values.push(updateCustomerDto.email);
        }

        if (updateCustomerDto.ativo !== undefined) {
          updates.push(`ativo = $${paramCounter++}`);
          values.push(updateCustomerDto.ativo);
        }

        if (updateCustomerDto.isDestinatario !== undefined) {
          updates.push(`is_destinatario = $${paramCounter++}`);
          values.push(updateCustomerDto.isDestinatario);
        }

        if (updateCustomerDto.condicaoPagamentoId !== undefined) {
          updates.push(`condicao_pagamento_id = $${paramCounter++}`);
          values.push(updateCustomerDto.condicaoPagamentoId);
        }

        if (updateCustomerDto.nacionalidadeId !== undefined) {
          updates.push(`nacionalidade_id = $${paramCounter++}`);
          values.push(updateCustomerDto.nacionalidadeId);
        }

        if (updateCustomerDto.limiteCredito !== undefined) {
          updates.push(`limite_credito = $${paramCounter++}`);
          values.push(updateCustomerDto.limiteCredito);
        }

        if (updates.length > 0) {
          values.push(clienteId);

          const updateQuery = `
            UPDATE dbo.cliente
            SET ${updates.join(', ')}
            WHERE id = $${paramCounter}
          `;

          await client.query(updateQuery, values);

          // Atualizar também o registro de destinatário se o cliente for destinatário
          if (clienteAtual.is_destinatario) {
            // Verificar se o destinatário existe para este cliente
            const destinatarioResult = await client.query(
              'SELECT id FROM dbo.destinatario WHERE cliente_id = $1',
              [clienteId],
            );

            if (destinatarioResult.rowCount > 0) {
              const destinatarioId = destinatarioResult.rows[0].id;

              // Resetar para novo update
              const destUpdates: string[] = [];
              const destValues: any[] = [];
              paramCounter = 1;

              // Adicionar os mesmos campos ao update do destinatário
              if (updateCustomerDto.tipo !== undefined) {
                destUpdates.push(`tipo = $${paramCounter++}`);
                destValues.push(updateCustomerDto.tipo);
              }

              if (updateCustomerDto.isEstrangeiro !== undefined) {
                destUpdates.push(`is_estrangeiro = $${paramCounter++}`);
                destValues.push(updateCustomerDto.isEstrangeiro);
              }

              if (updateCustomerDto.tipoDocumento !== undefined) {
                destUpdates.push(`tipo_documento = $${paramCounter++}`);
                destValues.push(updateCustomerDto.tipoDocumento);
              }

              if (updateCustomerDto.razaoSocial !== undefined) {
                destUpdates.push(`razao_social = $${paramCounter++}`);
                destValues.push(updateCustomerDto.razaoSocial);
              }

              if (updateCustomerDto.nomeFantasia !== undefined) {
                destUpdates.push(`nome_fantasia = $${paramCounter++}`);
                destValues.push(updateCustomerDto.nomeFantasia);
              }

              if (updateCustomerDto.inscricaoEstadual !== undefined) {
                destUpdates.push(`inscricao_estadual = $${paramCounter++}`);
                destValues.push(updateCustomerDto.inscricaoEstadual);
              }

              if (updateCustomerDto.endereco !== undefined) {
                destUpdates.push(`endereco = $${paramCounter++}`);
                destValues.push(updateCustomerDto.endereco);
              }

              if (updateCustomerDto.numero !== undefined) {
                destUpdates.push(`numero = $${paramCounter++}`);
                destValues.push(updateCustomerDto.numero);
              }

              if (updateCustomerDto.complemento !== undefined) {
                destUpdates.push(`complemento = $${paramCounter++}`);
                destValues.push(updateCustomerDto.complemento);
              }

              if (updateCustomerDto.bairro !== undefined) {
                destUpdates.push(`bairro = $${paramCounter++}`);
                destValues.push(updateCustomerDto.bairro);
              }

              if (updateCustomerDto.cidadeId !== undefined) {
                destUpdates.push(`cidade_id = $${paramCounter++}`);
                destValues.push(updateCustomerDto.cidadeId);
              }

              if (updateCustomerDto.cep !== undefined) {
                destUpdates.push(`cep = $${paramCounter++}`);
                destValues.push(updateCustomerDto.cep);
              }

              if (updateCustomerDto.telefone !== undefined) {
                destUpdates.push(`telefone = $${paramCounter++}`);
                destValues.push(updateCustomerDto.telefone);
              }

              if (updateCustomerDto.email !== undefined) {
                destUpdates.push(`email = $${paramCounter++}`);
                destValues.push(updateCustomerDto.email);
              }

              if (updateCustomerDto.ativo !== undefined) {
                destUpdates.push(`ativo = $${paramCounter++}`);
                destValues.push(updateCustomerDto.ativo);
              }

              if (destUpdates.length > 0) {
                destValues.push(destinatarioId);

                const destUpdateQuery = `
                  UPDATE dbo.destinatario
                  SET ${destUpdates.join(', ')}
                  WHERE id = $${paramCounter}
                `;

                await client.query(destUpdateQuery, destValues);
              }
            }
          }
        }

        // Atualizar relacionamentos de destinatários se necessário
        if (updateCustomerDto.destinatariosIds) {
          // Remover relacionamentos existentes
          await client.query(
            'DELETE FROM dbo.cliente_destinatario WHERE cliente_id = $1',
            [clienteId],
          );

          // Adicionar novos relacionamentos
          for (const destinatarioId of updateCustomerDto.destinatariosIds) {
            // Verificar se o destinatário existe
            const destExists = await client.query(
              'SELECT id FROM dbo.destinatario WHERE id = $1',
              [destinatarioId],
            );

            if (destExists.rowCount === 0) {
              throw new BadRequestException(
                `Destinatário com ID ${destinatarioId} não existe`,
              );
            }

            // Criar relação cliente-destinatário
            await client.query(
              `INSERT INTO dbo.cliente_destinatario (cliente_id, destinatario_id)
              VALUES ($1, $2)`,
              [clienteId, destinatarioId],
            );
          }
        }

        await client.query('COMMIT');

        // Buscar cliente atualizado
        return this.findOne(clienteId);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar cliente`);
    }
  }
  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Buscar cliente por ID
        const clienteResult = await client.query(
          'SELECT * FROM dbo.cliente WHERE id = $1',
          [id],
        );

        if (clienteResult.rowCount === 0) {
          throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
        }

        const clienteId = clienteResult.rows[0].id;

        // Verificar se há referências a este cliente
        const hasReferences = await client.query(
          'SELECT id FROM dbo.nfe WHERE cliente_id = $1 LIMIT 1',
          [clienteId],
        );

        if (hasReferences.rowCount > 0) {
          // Se há referências, apenas inativa
          await client.query(
            'UPDATE dbo.cliente SET ativo = false WHERE id = $1',
            [clienteId],
          );

          // Se for destinatário, inativa na tabela de destinatários também
          if (clienteResult.rows[0].is_destinatario) {
            await client.query(
              'UPDATE dbo.destinatario SET ativo = false WHERE cliente_id = $1',
              [clienteId],
            );
          }
        } else {
          // Remover relacionamentos
          await client.query(
            'DELETE FROM dbo.cliente_destinatario WHERE cliente_id = $1',
            [clienteId],
          );

          // Se for destinatário, remover o registro de destinatário associado
          if (clienteResult.rows[0].is_destinatario) {
            await client.query(
              'DELETE FROM dbo.destinatario WHERE cliente_id = $1',
              [clienteId],
            );
          }

          // Remover o cliente
          await client.query('DELETE FROM dbo.cliente WHERE id = $1', [
            clienteId,
          ]);
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao remover cliente ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover cliente`);
    }
  }

  private mapToCustomerEntity(dbRecord: any): Customer {
    const customer: Customer = {
      id: dbRecord.id,
      cliente: dbRecord.cliente,
      apelido: dbRecord.apelido,
      cnpjCpf: dbRecord.cnpj_cpf,
      tipo: dbRecord.tipo as 'F' | 'J',
      razaoSocial: dbRecord.razao_social,
      nomeFantasia: dbRecord.nome_fantasia,
      inscricaoEstadual: dbRecord.inscricao_estadual,
      endereco: dbRecord.endereco,
      numero: dbRecord.numero,
      complemento: dbRecord.complemento,
      bairro: dbRecord.bairro,
      cidadeId: dbRecord.cidade_id,
      cidadeNome: dbRecord.cidade_nome,
      cep: dbRecord.cep,
      telefone: dbRecord.telefone,
      email: dbRecord.email,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      isEstrangeiro: dbRecord.is_estrangeiro || false,
      paisId: dbRecord.pais_id || null,
      estadoId: dbRecord.estado_id || null,
      isDestinatario: dbRecord.is_destinatario || false,
      nacionalidadeId: dbRecord.nacionalidade_id || null,
      limiteCredito: dbRecord.limite_credito
        ? parseFloat(dbRecord.limite_credito) % 1 === 0
          ? parseInt(dbRecord.limite_credito)
          : parseFloat(dbRecord.limite_credito)
        : undefined,
    };

    // Campos opcionais que podem não existir na entity base
    if (dbRecord.estado_nome && (customer as any).estadoNome !== undefined) (customer as any).estadoNome = dbRecord.estado_nome;
    if (dbRecord.uf && (customer as any).uf !== undefined) (customer as any).uf = dbRecord.uf;
    if (dbRecord.tipo_documento)
      customer.tipoDocumento = dbRecord.tipo_documento;
    if (dbRecord.condicao_pagamento_id)
      customer.condicaoPagamentoId = dbRecord.condicao_pagamento_id;
    if (dbRecord.condicao_pagamento_nome && (customer as any).condicaoPagamentoNome !== undefined)
      (customer as any).condicaoPagamentoNome = dbRecord.condicao_pagamento_nome;

    return customer;
  }
}
