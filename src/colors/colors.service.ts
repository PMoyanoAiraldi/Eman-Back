import { InjectRepository } from "@nestjs/typeorm";
import { Colors } from "./colors.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CreateColorDto } from "./dto/create-color.dto";
import { UpdateColorDto } from "./dto/update-color.dto";

@Injectable()
export class ColorsService {
    constructor(
    @InjectRepository(Colors)
        private readonly colorsRepository: Repository<Colors>,
    ) {}

    async create(createColorDto: CreateColorDto): Promise<Colors> {
        const existing = await this.colorsRepository.findOne({ 
            where: { hex: createColorDto.hex } 
        });
        if (existing) throw new BadRequestException('Ese color ya existe');

        const color = this.colorsRepository.create(createColorDto);
        return await this.colorsRepository.save(color);
    }

    async findAll(): Promise<Colors[]> {
        return await this.colorsRepository.find();
    }

    async getColor(id: string): Promise<Colors>{
        const color = await this.colorsRepository.findOne({ where: { id } });
            if (!color) {
                throw new NotFoundException(`Color con ID ${id} no encontrado`);
            }
            return color;
        }

    async getAllColorsActive(): Promise<Colors[]> {
        return await this.colorsRepository.find({
            where: { state: true },
            order: { name: 'ASC' }
        });
    }

    async getColorActive(id: string): Promise<Colors> {
        const color = await this.colorsRepository.findOne({ where: { id } });
            if (!color || !color.state) {
                throw new NotFoundException(`Color con ID ${id} no encontrado`);
            }
            return color;
    }

    async update(id: string, updateColorDto: UpdateColorDto): Promise<Colors> {
        const color = await this.colorsRepository.findOne({ where: { id } });
        if (!color) throw new NotFoundException('Color no encontrado');

        if (updateColorDto.hex) {
            const existing = await this.colorsRepository.findOne({ 
                where: { hex: updateColorDto.hex } 
            });
        if (existing && existing.id !== id) throw new BadRequestException('Ese hex ya existe');
    }

        Object.assign(color, updateColorDto);
        return await this.colorsRepository.save(color);
    }

    async updateState(id: string, state: boolean): Promise<Colors> {
                const color = await this.getColor(id);
                color.state = state;
                return this.colorsRepository.save(color);
            }

    async remove(id: string): Promise<void> {
        const color = await this.colorsRepository.findOne({ where: { id } });
        if (!color) throw new NotFoundException('Color no encontrado');

        await this.colorsRepository.remove(color);
    }
}