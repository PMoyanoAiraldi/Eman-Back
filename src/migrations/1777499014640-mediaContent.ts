import { MigrationInterface, QueryRunner } from "typeorm";

export class MediaContent1777499014640 implements MigrationInterface {
    name = 'MediaContent1777499014640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."media_content_type_enum" AS ENUM('hero', 'banner', 'category', 'featured')`);
        await queryRunner.query(`CREATE TYPE "public"."media_content_section_enum" AS ENUM('home', 'about', 'collection')`);
        await queryRunner.query(`CREATE TABLE "media_content" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying(255) NOT NULL, "type" "public"."media_content_type_enum" NOT NULL, "section" "public"."media_content_section_enum", "altText" character varying(150), "order" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e1b77d89a30ff178b01b481cc5c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "media_content"`);
        await queryRunner.query(`DROP TYPE "public"."media_content_section_enum"`);
        await queryRunner.query(`DROP TYPE "public"."media_content_type_enum"`);
    }

}
