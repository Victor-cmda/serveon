import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmployeesModule } from './modules/employees/employees.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DatabaseModule } from './common/database/database.module';
import { CountriesModule } from './modules/countries/countries.module';
import { StatesModule } from './modules/states/states.module';
import { CitiesModule } from './modules/cities/cities.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { PaymentTermsModule } from './modules/payment-terms/payment-terms.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PositionsModule } from './modules/positions/positions.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,
    }),
    DatabaseModule,
    EmployeesModule,
    CustomersModule,
    CountriesModule,
    StatesModule,
    CitiesModule,
    PaymentMethodsModule,
    PaymentTermsModule,
    SuppliersModule,
    DepartmentsModule,
    PositionsModule,
    ProductsModule,
  ],
})
export class AppModule { }