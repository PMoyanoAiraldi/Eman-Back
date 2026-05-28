import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ColorsService } from "./colors.service";
import { ResponseColorDto } from "./dto/response-color.dto";
import { CreateColorDto } from "./dto/create-color.dto";
import { Colors } from "./colors.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";
import { UpdateColorDto } from "./dto/update-color.dto";
import { UpdateStateColorDto } from "./dto/update-state.dto";

@ApiTags('Colors')
@Controller("colors")
export class ColorsController {
    constructor(
        private readonly colorsService: ColorsService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo color' })
    @ApiResponse({ status: 201, description: 'Color creado', type: ResponseColorDto })
    @ApiResponse({ status: 400, description: 'El color ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para crear el color',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                hex: { type: 'string' }
            }
        }
    })
    async create(@Body() createColorDto: CreateColorDto): Promise<ResponseColorDto> {
        const newColor = await this.colorsService.create(createColorDto);
            return newColor;
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los colores activos' })
    async findAll() {
        return this.colorsService.getAllColorsActive(); // Solo activas
    }

    @Get('all')
    @ApiOperation({ summary: 'Listar todos los colores (activos e inactivos)' })
    @ApiResponse({ status: 200, description: 'Lista de colores', type: [Colors] })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async findAllForAdmin(): Promise<Colors[]> {
        return this.colorsService.findAll();
    }

    @Get(':id/actives')
    @ApiOperation({ summary: 'Obtener un color activo por ID' })
    @ApiResponse({ status: 200, description: 'Color encontrado', type: Colors })
    @ApiResponse({ status: 404, description: 'Color no encontrado' })
    async findOneActive(@Param('id') id: string): Promise<Colors> {
        return this.colorsService.getColorActive(id);
    }
            
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un color por ID' })
    @ApiResponse({ status: 200, description: 'Color encontrado', type: Colors })
    @ApiResponse({ status: 404, description: 'Color no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async findOne(@Param('id') id: string): Promise<Colors> {
        return this.colorsService.getColor(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Modificar un color' })
    @ApiResponse({ status: 200, description: 'Color modificado', type: UpdateColorDto })
    @ApiResponse({ status: 404, description: 'Color no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar el color',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                hex: { type: 'string' }
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateColorDto: UpdateColorDto): Promise<Colors> {
        return this.colorsService.update(id, updateColorDto);
    }
            
    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado del color (activar/desactivar) - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async updateState(
        @Param('id') id: string,
        @Body() updateStateColorDto: UpdateStateColorDto
    ) {
        return this.colorsService.updateState(id, updateStateColorDto.state);
    }

}