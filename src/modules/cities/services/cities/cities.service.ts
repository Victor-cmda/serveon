import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCityDto } from '../../dto/create-city.dto';
import { UpdateCityDto } from '../../dto/update-city.dto';
import { DatabaseService } from 'src/common/database/database.service';
import { City } from '../../entities/city.entity/city.entity';

@Injectable()
export class CitiesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    try {
      // Verificar se o estado existe
      const estadoExiste = await this.databaseService.query(
        'SELECT id FROM dbo.estado WHERE id = $1',
        [createCityDto.estadoId],
      );

      if (estadoExiste.rowCount === 0) {
        throw new NotFoundException(
          `Estado com ID ${createCityDto.estadoId} não encontrado`,
        );
      }

      // Verificar se já existe cidade com o mesmo código IBGE (se fornecido)
      if (createCityDto.codigoIbge) {
        const cidadeExistente = await this.databaseService.query(
          'SELECT id FROM dbo.cidade WHERE codigo_ibge = $1',
          [createCityDto.codigoIbge],
        );

        if (cidadeExistente.rowCount > 0) {
          throw new ConflictException(
            `Cidade com código IBGE ${createCityDto.codigoIbge} já existe`,
          );
        }
      }

      // Verificar se já existe uma cidade com o mesmo nome no mesmo estado
      const cidadeComMesmoNome = await this.databaseService.query(
        'SELECT id FROM dbo.cidade WHERE nome = $1 AND estado_id = $2',
        [createCityDto.nome, createCityDto.estadoId],
      );

      if (cidadeComMesmoNome.rowCount > 0) {
        throw new ConflictException(
          `Cidade com nome ${createCityDto.nome} já existe neste estado`,
        );
      }

      // Inserir a nova cidade
      const resultado = await this.databaseService.query(
        `INSERT INTO dbo.cidade
        (nome, codigo_ibge, estado_id)
        VALUES
        ($1, $2, $3)
        RETURNING *`,
        [
          createCityDto.nome,
          createCityDto.codigoIbge || null,
          createCityDto.estadoId,
        ],
      );

      return this.mapToCityEntity(resultado.rows[0]);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Erro ao criar cidade:', error);
      throw new InternalServerErrorException('Erro ao criar cidade');
    }
  }

  async findAll(): Promise<City[]> {
    try {
      const resultado = await this.databaseService.query(`
        SELECT c.*, e.nome as estado_nome, e.uf, p.nome as pais_nome
        FROM dbo.cidade c
        JOIN dbo.estado e ON c.estado_id = e.id
        JOIN dbo.pais p ON e.pais_id = p.id
        ORDER BY c.nome
      `);

      return resultado.rows.map((row) => this.mapToCityEntity(row));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      throw new InternalServerErrorException('Erro ao buscar cidades');
    }
  }
  async findByEstado(estadoId: number): Promise<City[]> {
    try {
      // Verificar se o estado existe
      const estadoExiste = await this.databaseService.query(
        'SELECT id FROM dbo.estado WHERE id = $1',
        [estadoId],
      );

      if (estadoExiste.rowCount === 0) {
        throw new NotFoundException(`Estado com ID ${estadoId} não encontrado`);
      }

      const resultado = await this.databaseService.query(
        `
        SELECT c.*, e.nome as estado_nome, e.uf, p.nome as pais_nome
        FROM dbo.cidade c
        JOIN dbo.estado e ON c.estado_id = e.id
        JOIN dbo.pais p ON e.pais_id = p.id
        WHERE c.estado_id = $1
        ORDER BY c.nome
      `,
        [estadoId],
      );

      return resultado.rows.map((row) => this.mapToCityEntity(row));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar cidades do estado ${estadoId}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar cidades do estado ${estadoId}`,
      );
    }
  }
  async findOne(id: number): Promise<City> {
    try {
      const resultado = await this.databaseService.query(
        `
        SELECT c.*, e.nome as estado_nome, e.uf, p.nome as pais_nome
        FROM dbo.cidade c
        JOIN dbo.estado e ON c.estado_id = e.id
        JOIN dbo.pais p ON e.pais_id = p.id
        WHERE c.id = $1
      `,
        [id],
      );

      if (resultado.rowCount === 0) {
        throw new NotFoundException(`Cidade com ID ${id} não encontrada`);
      }

      return this.mapToCityEntity(resultado.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar cidade ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar cidade ${id}`);
    }
  }

  async findByIbgeCode(codigoIbge: string): Promise<City> {
    try {
      const resultado = await this.databaseService.query(
        `
        SELECT c.*, e.nome as estado_nome, e.uf, p.nome as pais_nome
        FROM dbo.cidade c
        JOIN dbo.estado e ON c.estado_id = e.id
        JOIN dbo.pais p ON e.pais_id = p.id
        WHERE c.codigo_ibge = $1
      `,
        [codigoIbge],
      );

      if (resultado.rowCount === 0) {
        throw new NotFoundException(
          `Cidade com código IBGE ${codigoIbge} não encontrada`,
        );
      }

      return this.mapToCityEntity(resultado.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(
        `Erro ao buscar cidade com código IBGE ${codigoIbge}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Erro ao buscar cidade com código IBGE ${codigoIbge}`,
      );
    }
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    try {
      // Verificar se a cidade existe
      const cidadeExiste = await this.databaseService.query(
        'SELECT id FROM dbo.cidade WHERE id = $1',
        [id],
      );

      if (cidadeExiste.rowCount === 0) {
        throw new NotFoundException(`Cidade com ID ${id} não encontrada`);
      }

      // Verificar se o estado existe (se fornecido)
      if (updateCityDto.estadoId) {
        const estadoExiste = await this.databaseService.query(
          'SELECT id FROM dbo.estado WHERE id = $1',
          [updateCityDto.estadoId],
        );

        if (estadoExiste.rowCount === 0) {
          throw new NotFoundException(
            `Estado com ID ${updateCityDto.estadoId} não encontrado`,
          );
        }

        // Verificar se já existe uma cidade com o mesmo nome no mesmo estado (se ambos nome e estado forem alterados)
        if (updateCityDto.nome) {
          const cidadeComMesmoNome = await this.databaseService.query(
            'SELECT id FROM dbo.cidade WHERE nome = $1 AND estado_id = $2 AND id != $3',
            [updateCityDto.nome, updateCityDto.estadoId, id],
          );

          if (cidadeComMesmoNome.rowCount > 0) {
            throw new ConflictException(
              `Cidade com nome ${updateCityDto.nome} já existe neste estado`,
            );
          }
        }
      } else if (updateCityDto.nome) {
        // Se apenas o nome for alterado, precisamos verificar se já existe uma cidade com o mesmo nome no estado atual
        const cidadeAtual = await this.databaseService.query(
          'SELECT estado_id FROM dbo.cidade WHERE id = $1',
          [id],
        );

        const estadoId = cidadeAtual.rows[0].estado_id;

        const cidadeComMesmoNome = await this.databaseService.query(
          'SELECT id FROM dbo.cidade WHERE nome = $1 AND estado_id = $2 AND id != $3',
          [updateCityDto.nome, estadoId, id],
        );

        if (cidadeComMesmoNome.rowCount > 0) {
          throw new ConflictException(
            `Cidade com nome ${updateCityDto.nome} já existe neste estado`,
          );
        }
      }

      // Verificar se já existe cidade com o mesmo código IBGE (se fornecido)
      if (updateCityDto.codigoIbge) {
        const cidadeExistente = await this.databaseService.query(
          'SELECT id FROM dbo.cidade WHERE codigo_ibge = $1 AND id != $2',
          [updateCityDto.codigoIbge, id],
        );

        if (cidadeExistente.rowCount > 0) {
          throw new ConflictException(
            `Cidade com código IBGE ${updateCityDto.codigoIbge} já existe`,
          );
        }
      }

      // Construir a consulta de atualização dinamicamente
      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      // Adicionar cada campo do DTO à consulta, se estiver definido
      if (updateCityDto.nome !== undefined) {
        updates.push(`nome = $${paramCounter++}`);
        values.push(updateCityDto.nome);
      }

      if (updateCityDto.codigoIbge !== undefined) {
        updates.push(`codigo_ibge = $${paramCounter++}`);
        values.push(updateCityDto.codigoIbge);
      }

      if (updateCityDto.estadoId !== undefined) {
        updates.push(`estado_id = $${paramCounter++}`);
        values.push(updateCityDto.estadoId);
      }

      // Se não houver campos para atualizar, retornar a cidade atual
      if (updates.length === 0) {
        return this.findOne(id);
      }

      // Adicionar o id aos valores
      values.push(id);

      // Executar a consulta de atualização
      const updateQuery = `
        UPDATE dbo.cidade
        SET ${updates.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `;

      const resultado = await this.databaseService.query(updateQuery, values);

      // Buscar a cidade atualizada com informações de estado e país
      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error(`Erro ao atualizar cidade ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar cidade ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Verificar se a cidade existe
      const cidadeExiste = await this.databaseService.query(
        'SELECT id FROM dbo.cidade WHERE id = $1',
        [id],
      );

      if (cidadeExiste.rowCount === 0) {
        throw new NotFoundException(`Cidade com ID ${id} não encontrada`);
      }

      // Verificar se a cidade está sendo referenciada em outras tabelas
      const emitentes = await this.databaseService.query(
        'SELECT cnpj FROM dbo.emitente WHERE cidade_id = $1 LIMIT 1',
        [id],
      );

      if (emitentes.rowCount > 0) {
        throw new ConflictException(
          `Não é possível excluir a cidade, pois ela está vinculada a emitentes`,
        );
      }

      const destinatarios = await this.databaseService.query(
        'SELECT cnpj_cpf FROM dbo.destinatario WHERE cidade_id = $1 LIMIT 1',
        [id],
      );

      if (destinatarios.rowCount > 0) {
        throw new ConflictException(
          `Não é possível excluir a cidade, pois ela está vinculada a destinatários`,
        );
      }

      const transportadores = await this.databaseService.query(
        'SELECT cnpj_cpf FROM dbo.transportador WHERE cidade_id = $1 LIMIT 1',
        [id],
      );

      if (transportadores.rowCount > 0) {
        throw new ConflictException(
          `Não é possível excluir a cidade, pois ela está vinculada a transportadores`,
        );
      }

      // Excluir a cidade
      await this.databaseService.query('DELETE FROM dbo.cidade WHERE id = $1', [
        id,
      ]);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error(`Erro ao remover cidade ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover cidade ${id}`);
    }
  }

  /**
   * Mapeia um registro do banco de dados para a entidade City
   */
  private mapToCityEntity(dbRecord: any): City {
    const city: City = {
      id: dbRecord.id,
      nome: dbRecord.nome,
      codigoIbge: dbRecord.codigo_ibge,
      estadoId: dbRecord.estado_id,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };

    if (dbRecord.estado_nome) city.estadoNome = dbRecord.estado_nome;
    if (dbRecord.uf) city.uf = dbRecord.uf;
    if (dbRecord.pais_nome) city.paisNome = dbRecord.pais_nome;

    return city;
  }
}
