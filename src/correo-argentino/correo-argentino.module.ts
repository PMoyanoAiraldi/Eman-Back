import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CorreoArgentinoService } from './correo-argentino.service';


@Module({
    imports: [HttpModule.register({ timeout: 8000 })],
    providers: [CorreoArgentinoService],
    exports: [CorreoArgentinoService],
})
export class CorreoArgentinoModule {}