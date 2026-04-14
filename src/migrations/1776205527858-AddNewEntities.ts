import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewEntities1776205527858 implements MigrationInterface {
    name = 'AddNewEntities1776205527858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying(255), "isPrimary" boolean NOT NULL DEFAULT false, "order" integer NOT NULL, "state" boolean NOT NULL DEFAULT true, "productId" uuid, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_sizes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stock" integer NOT NULL, "productId" uuid, "sizeId" uuid, CONSTRAINT "PK_19c3d021f81c5b1ff367bad6164" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "price" numeric(10,2) NOT NULL, "state" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "brandId" uuid, "categoryId" uuid, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "orderId" uuid, "productId" uuid, "sizeId" uuid, CONSTRAINT "PK_0afbab1fa98e2fb0be8e74f6b38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('tarjeta_credito', 'tarjeta_debito', 'transferencia')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pendiente', 'aprobado', 'rechazado', 'reembolsado')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" "public"."payments_method_enum" NOT NULL DEFAULT 'tarjeta_credito', "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pendiente', "amount" numeric(10,2) NOT NULL, "installments" integer NOT NULL, "installmentsAmount" numeric(10,2) NOT NULL, "transactionId" character varying(255), "paidAt" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_shippingtype_enum" AS ENUM('coordinado', 'correo_argentino')`);
        await queryRunner.query(`CREATE TYPE "public"."order_state_enum" AS ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "total" numeric(10,2) NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "country" character varying(255) NOT NULL DEFAULT 'Argentina', "zipCode" integer NOT NULL, "shippingType" "public"."order_shippingtype_enum" NOT NULL DEFAULT 'correo_argentino', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "state" "public"."order_state_enum" NOT NULL DEFAULT 'pendiente', "discountAmount" numeric(10,2), "userId" uuid, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "installment_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "installments" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "validFrom" date NOT NULL, "validTo" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e6ea6dce1f29e86c29209c80f70" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_7af50639264735c79e918af6089" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_sizes" ADD CONSTRAINT "FK_699f5366c2ebf46a77589bd225e" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_sizes" ADD CONSTRAINT "FK_ee25631fb0c1390f8e038989138" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_detail" ADD CONSTRAINT "FK_88850b85b38a8a2ded17a1f5369" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_detail" ADD CONSTRAINT "FK_a3647bd11aed3cf968c9ce9b835" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_detail" ADD CONSTRAINT "FK_b402c1367fc588223b2b821348d" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`);
        await queryRunner.query(`ALTER TABLE "order_detail" DROP CONSTRAINT "FK_b402c1367fc588223b2b821348d"`);
        await queryRunner.query(`ALTER TABLE "order_detail" DROP CONSTRAINT "FK_a3647bd11aed3cf968c9ce9b835"`);
        await queryRunner.query(`ALTER TABLE "order_detail" DROP CONSTRAINT "FK_88850b85b38a8a2ded17a1f5369"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df"`);
        await queryRunner.query(`ALTER TABLE "product_sizes" DROP CONSTRAINT "FK_ee25631fb0c1390f8e038989138"`);
        await queryRunner.query(`ALTER TABLE "product_sizes" DROP CONSTRAINT "FK_699f5366c2ebf46a77589bd225e"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_7af50639264735c79e918af6089"`);
        await queryRunner.query(`DROP TABLE "installment_config"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_shippingtype_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`DROP TABLE "order_detail"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "product_sizes"`);
        await queryRunner.query(`DROP TABLE "images"`);
    }

}
