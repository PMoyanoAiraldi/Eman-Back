import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CorreoArgentinoService } from './correo-argentino.service';
import { ShippingController } from './shipping.controller';

@Module({
    imports: [HttpModule],
    controllers: [ShippingController],
    providers: [CorreoArgentinoService],
    exports: [CorreoArgentinoService],
})
export class CorreoArgentinoModule {}