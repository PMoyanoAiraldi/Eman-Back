// email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Order } from '../order/order.entity'; 

@Injectable()
export class EmailService {
    private readonly resend: Resend;
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendPaymentConfirmation(order: Order) {
        if (!order.guestEmail) {
            this.logger.warn(`Orden ${order.id} sin email, no se puede enviar confirmación`);
            return;
        }
        console.log('📧 Intentando enviar mail a:', order.guestEmail)
        try {
            const response = await this.resend.emails.send({
                from: 'Eman <onboarding@resend.dev>', 
                to: order.guestEmail,
                subject: `¡Tu pedido #${order.id.slice(0, 8)} fue confirmado!`,
                html: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                        <h2 style="color: #C9A84C;">¡Gracias por tu compra, ${order.guestName}!</h2>
                        <p>Tu pago fue aprobado y ya estamos preparando tu pedido.</p>
                        <p><strong>Número de orden:</strong> ${order.id}</p>
                        <p><strong>Total:</strong> $${Number(order.total).toLocaleString('es-AR')}</p>
                        <p>Te avisaremos por este mismo medio cuando tu pedido sea despachado.</p>
                    </div>
                `,
            });

            if (response.error) {
                this.logger.error(`Resend rechazó el envío para orden ${order.id}: ${JSON.stringify(response.error)}`);
                return;
            }

            this.logger.log(`Email de confirmación enviado para orden ${order.id}`);
        } catch (error) {
            // Importante: un fallo de email NO debe frenar el flujo del webhook
            this.logger.error(`Error enviando email de confirmación para orden ${order.id}`, error);
        }
    }

    

async sendDispatchNotification(order: Order) {
    if (!order.guestEmail) {
        this.logger.warn(`Orden ${order.id} sin email, no se puede enviar notificación de despacho`);
        return;
    }

    try {
        const response = await this.resend.emails.send({
            from: 'Eman <onboarding@resend.dev>',
            to: order.guestEmail,
            subject: `¡Tu pedido #${order.id.slice(0, 8)} fue despachado!`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">¡Tu pedido está en camino, ${order.guestName}!</h2>
                    <p>Ya despachamos tu pedido por Correo Argentino.</p>
                    <p><strong>Número de orden:</strong> ${order.id}</p>
                    <p>Vas a recibirlo en la dirección que indicaste al momento de la compra.</p>
                </div>
            `,
        });

        if (response.error) {
            this.logger.error(`Resend rechazó el envío de despacho para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }

        this.logger.log(`Email de despacho enviado para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando email de despacho para orden ${order.id}`, error);
    }
}
}