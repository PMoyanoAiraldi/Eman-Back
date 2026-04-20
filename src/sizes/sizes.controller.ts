import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { SizesService } from "./sizes.service";
import { ResponseZiseDto } from "./dto/response-size.dto";
import { CreateSizeDto } from "./dto/create-size.dto";
import { Sizes } from "./sizes.entity";
import { UpdateSizeDto } from "./dto/update-size.dto";
import { UpdateSizeStateDto } from "./dto/update-sizeState.dto";

@ApiTags('Sizes')
@Controller("sizes")
export class SizesController {
    constructor(
        private readonly sizesService: SizesService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo talle' })
    @ApiResponse({ status: 201, description: 'Talle creado', type: ResponseZiseDto })
    @ApiResponse({ status: 400, description: 'El talle ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para crear el talle',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
            }
        }
    })
    async create(@Body() createSizeDto: CreateSizeDto): Promise<ResponseZiseDto> {
        const newSize = await this.sizesService.createSize(createSizeDto);
            return newSize;
    }
        
    @Get()
    @ApiOperation({ summary: 'Obtener todos los talles activos' })
    async findAll() {
        return this.sizesService.getAllSizesActive(); // Solo activas
    }
        
    @Get('all')
    @ApiOperation({ summary: 'Listar todos los talles (activos e inactivos)' })
    @ApiResponse({ status: 200, description: 'Lista de talles', type: [Sizes] })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async findAllForAdmin(): Promise<Sizes[]> {
        return this.sizesService.getAllSizes();
    }
        
    @Get(':id/actives')
    @ApiOperation({ summary: 'Obtener un talle activo por ID' })
    @ApiResponse({ status: 200, description: 'Talle encontrado', type: Sizes })
    @ApiResponse({ status: 404, description: 'Talle no encontrado' })
    async findOneActive(@Param('id') id: string): Promise<Sizes> {
        return this.sizesService.getSizeActive(id);
    }
        
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un talle por ID' })
    @ApiResponse({ status: 200, description: 'Talle encontrado', type: Sizes })
    @ApiResponse({ status: 404, description: 'Talle no encontrado' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async findOne(@Param('id') id: string): Promise<Sizes> {
        return this.sizesService.getSize(id);
    }
        
    //  @Get(':marcaId/products')
    // @ApiOperation({ summary: 'Obtener productos por marca' })
    // @ApiResponse({ status: 200, description: 'Productos obtenidos', type: [Products] })
    // @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    // async findProductsByMarca(@Param('marcaId') marcaId: string) {
    //     return this.marcaService.findProductByMarca(marcaId);
    // }
        
    @Put(':id')
    @ApiOperation({ summary: 'Modificar un talle' })
    @ApiResponse({ status: 200, description: 'Talle modificado', type: UpdateSizeDto })
    @ApiResponse({ status: 404, description: 'Talle no encontrado' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar el talle',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateSizeDto: UpdateSizeDto): Promise<Sizes> {
        return this.sizesService.updateSize(id, updateSizeDto);
    }
        
    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado del talle (activar/desactivar) - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async updateState(
        @Param('id') id: string,
        @Body() updateStateSizeDto: UpdateSizeStateDto
    ) {
        return this.sizesService.updateState(id, updateStateSizeDto.state);
    }
}
