import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateCompanySettingsDto } from '../dto/update-company-settings.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { CompanySettings } from '../entities/company-settings.entity';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async get(): Promise<CompanySettings> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(`
          SELECT * FROM dbo.configuracoes_empresa
          ORDER BY id DESC
          LIMIT 1
        `);

        if (result.rowCount === 0) {
          // Se não existir, retornar configurações vazias
          return this.getDefaultSettings();
        }

        return this.mapDatabaseToEntity(result.rows[0]);
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao buscar configurações',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async update(updateDto: UpdateCompanySettingsDto): Promise<CompanySettings> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se já existe uma configuração
        const existingConfig = await client.query(
          'SELECT id FROM dbo.configuracoes_empresa ORDER BY id DESC LIMIT 1',
        );

        let result;

        if (existingConfig.rowCount === 0) {
          // Criar nova configuração
          result = await client.query(
            `INSERT INTO dbo.configuracoes_empresa (
              razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
              endereco, numero, complemento, bairro, cidade, estado, cep,
              telefone, email, website, logo_base64, regime_tributario, observacoes_fiscais
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *`,
            [
              updateDto.razaoSocial,
              updateDto.nomeFantasia,
              updateDto.cnpj,
              updateDto.inscricaoEstadual || null,
              updateDto.inscricaoMunicipal || null,
              updateDto.endereco,
              updateDto.numero,
              updateDto.complemento || null,
              updateDto.bairro,
              updateDto.cidade,
              updateDto.estado,
              updateDto.cep,
              updateDto.telefone,
              updateDto.email,
              updateDto.website || null,
              updateDto.logoBase64 || null,
              updateDto.regimeTributario,
              updateDto.observacoesFiscais || null,
            ],
          );
        } else {
          // Atualizar configuração existente
          const updateFields: string[] = [];
          const updateValues: any[] = [];
          let paramCounter = 1;

          if (updateDto.razaoSocial !== undefined) {
            updateFields.push(`razao_social = $${paramCounter}`);
            updateValues.push(updateDto.razaoSocial);
            paramCounter++;
          }

          if (updateDto.nomeFantasia !== undefined) {
            updateFields.push(`nome_fantasia = $${paramCounter}`);
            updateValues.push(updateDto.nomeFantasia);
            paramCounter++;
          }

          if (updateDto.cnpj !== undefined) {
            updateFields.push(`cnpj = $${paramCounter}`);
            updateValues.push(updateDto.cnpj);
            paramCounter++;
          }

          if (updateDto.inscricaoEstadual !== undefined) {
            updateFields.push(`inscricao_estadual = $${paramCounter}`);
            updateValues.push(updateDto.inscricaoEstadual);
            paramCounter++;
          }

          if (updateDto.inscricaoMunicipal !== undefined) {
            updateFields.push(`inscricao_municipal = $${paramCounter}`);
            updateValues.push(updateDto.inscricaoMunicipal);
            paramCounter++;
          }

          if (updateDto.endereco !== undefined) {
            updateFields.push(`endereco = $${paramCounter}`);
            updateValues.push(updateDto.endereco);
            paramCounter++;
          }

          if (updateDto.numero !== undefined) {
            updateFields.push(`numero = $${paramCounter}`);
            updateValues.push(updateDto.numero);
            paramCounter++;
          }

          if (updateDto.complemento !== undefined) {
            updateFields.push(`complemento = $${paramCounter}`);
            updateValues.push(updateDto.complemento);
            paramCounter++;
          }

          if (updateDto.bairro !== undefined) {
            updateFields.push(`bairro = $${paramCounter}`);
            updateValues.push(updateDto.bairro);
            paramCounter++;
          }

          if (updateDto.cidade !== undefined) {
            updateFields.push(`cidade = $${paramCounter}`);
            updateValues.push(updateDto.cidade);
            paramCounter++;
          }

          if (updateDto.estado !== undefined) {
            updateFields.push(`estado = $${paramCounter}`);
            updateValues.push(updateDto.estado);
            paramCounter++;
          }

          if (updateDto.cep !== undefined) {
            updateFields.push(`cep = $${paramCounter}`);
            updateValues.push(updateDto.cep);
            paramCounter++;
          }

          if (updateDto.telefone !== undefined) {
            updateFields.push(`telefone = $${paramCounter}`);
            updateValues.push(updateDto.telefone);
            paramCounter++;
          }

          if (updateDto.email !== undefined) {
            updateFields.push(`email = $${paramCounter}`);
            updateValues.push(updateDto.email);
            paramCounter++;
          }

          if (updateDto.website !== undefined) {
            updateFields.push(`website = $${paramCounter}`);
            updateValues.push(updateDto.website);
            paramCounter++;
          }

          if (updateDto.logoBase64 !== undefined) {
            updateFields.push(`logo_base64 = $${paramCounter}`);
            updateValues.push(updateDto.logoBase64);
            paramCounter++;
          }

          if (updateDto.regimeTributario !== undefined) {
            updateFields.push(`regime_tributario = $${paramCounter}`);
            updateValues.push(updateDto.regimeTributario);
            paramCounter++;
          }

          if (updateDto.observacoesFiscais !== undefined) {
            updateFields.push(`observacoes_fiscais = $${paramCounter}`);
            updateValues.push(updateDto.observacoesFiscais);
            paramCounter++;
          }

          if (updateFields.length === 0) {
            throw new BadRequestException(
              'Nenhum campo válido fornecido para atualização',
            );
          }

          updateValues.push(existingConfig.rows[0].id);

          const updateQuery = `
            UPDATE dbo.configuracoes_empresa 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
          `;

          result = await client.query(updateQuery, updateValues);
        }

        await client.query('COMMIT');

        const updatedSettings = result.rows[0];
        return this.mapDatabaseToEntity(updatedSettings);
      } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof BadRequestException) {
          throw error;
        }

        console.error('Erro ao atualizar configurações:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao atualizar configurações',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  private mapDatabaseToEntity(row: any): CompanySettings {
    return {
      id: row.id,
      razaoSocial: row.razao_social,
      nomeFantasia: row.nome_fantasia,
      cnpj: row.cnpj,
      inscricaoEstadual: row.inscricao_estadual,
      inscricaoMunicipal: row.inscricao_municipal,
      endereco: row.endereco,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cidade: row.cidade,
      estado: row.estado,
      cep: row.cep,
      telefone: row.telefone,
      email: row.email,
      website: row.website,
      logoBase64: row.logo_base64,
      regimeTributario: row.regime_tributario,
      observacoesFiscais: row.observacoes_fiscais,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }

  private getDefaultSettings(): CompanySettings {
    return {
      id: 0,
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      website: '',
      logoBase64: '',
      regimeTributario: 'SIMPLES_NACIONAL' as any,
      observacoesFiscais: '',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
