import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    });
    const errors = await validate(object);

    if (errors.length > 0) {
      console.log('=== VALIDATION ERRORS ===');
      console.log('Total errors:', errors.length);
      
      const printError = (error: any, level = 0) => {
        const indent = '  '.repeat(level);
        console.log(`${indent}Property: ${error.property}`);
        console.log(`${indent}Value:`, error.value);
        console.log(`${indent}Constraints:`, error.constraints);
        
        if (error.children && error.children.length > 0) {
          console.log(`${indent}Children (${error.children.length}):`);
          error.children.forEach((child: any, idx: number) => {
            console.log(`${indent}  --- Child ${idx + 1} ---`);
            printError(child, level + 2);
          });
        }
      };
      
      errors.forEach((error, index) => {
        console.log(`\n=== Error ${index + 1} ===`);
        printError(error);
      });
      
      const collectMessages = (error: any): string[] => {
        const messages: string[] = [];
        
        if (error.constraints) {
          messages.push(...Object.values(error.constraints).map(String));
        }
        
        if (error.children && error.children.length > 0) {
          error.children.forEach((child: any) => {
            const childMessages = collectMessages(child);
            messages.push(...childMessages.map(msg => `${error.property}.${child.property}: ${msg}`));
          });
        }
        
        return messages;
      };
      
      const messages: string[] = [];
      errors.forEach((error) => {
        messages.push(...collectMessages(error));
      });

      throw new BadRequestException({
        message: 'Erro de validação',
        errors: messages,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
