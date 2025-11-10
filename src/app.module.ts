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
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { UnitMeasuresModule } from './modules/unit-measures/unit-measures.module';
import { EmployeeFunctionsModule } from './modules/employee-functions/employee-functions.module';
import { TransportersModule } from './modules/transporters/transporters.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { SalesModule } from './modules/sales/sales.module';
import { AccountsPayableModule } from './modules/accounts-payable/accounts-payable.module';

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
    CategoriesModule,
    BrandsModule,
    UnitMeasuresModule,
    EmployeeFunctionsModule,
    TransportersModule,
    VehiclesModule,
    PurchasesModule,
    SalesModule,
    AccountsPayableModule,
  ],
})
export class AppModule {}
