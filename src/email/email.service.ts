import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Order } from '../order/order.entity'; 

const FROM_EMAIL = 'Eman <onboarding@resend.dev>'; // cambiar a info@eman.com.ar cuando lo declare en resend

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
                from: FROM_EMAIL, 
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

    if (!order.trackingNumber) {
        this.logger.warn(`Orden ${order.id} marcada como enviada sin número de seguimiento, no se envía notificación`);
        return;
    }

    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: order.guestEmail,
            subject: `¡Tu pedido #${order.id.slice(0, 8)} fue despachado!`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">¡Tu pedido está en camino, ${order.guestName}!</h2>
                    <p>Ya despachamos tu pedido por Correo Argentino.</p>
                    <p><strong>Número de orden:</strong> ${order.id}</p>
                    <p><strong>Número de seguimiento:</strong> ${order.trackingNumber}</p>
                    <p>Podés rastrear tu pedido en el <a href="https://www.correoargentino.com.ar/formularios/e-commerce" style="color: #C9A84C;">sitio de Correo Argentino</a> con ese número.</p>
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

async sendPasswordResetEmail(email: string, resetUrl: string) {
    console.log('📧 Intentando enviar mail de reset a:', email)
    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Recuperá tu contraseña',
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Recuperá tu contraseña</h2>
                    <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste vos, hacé clic en el siguiente botón:</p>
                    <p style="text-align: center; margin: 24px 0;">
                        <a href="${resetUrl}" style="background: #C9A84C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Restablecer contraseña
                        </a>
                    </p>
                    <p>Este link vence en 30 minutos. Si no solicitaste este cambio, podés ignorar este correo.</p>
                </div>
            `,
        });

        if (response.error) {
            this.logger.error(`Resend rechazó el envío de reset para ${email}: ${JSON.stringify(response.error)}`);
            return;
        }

        this.logger.log(`Email de reset de contraseña enviado a ${email}`);
    } catch (error) {
        this.logger.error(`Error enviando email de reset a ${email}`, error);
    }
}


async sendAdminOrderReadyToShip(order: Order) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        this.logger.warn('ADMIN_EMAIL no configurado, no se puede avisar a Andrea');
        return;
    }

    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `Pedido #${order.id.slice(0, 8)} aprobado tras revisión — preparar envío`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Pago aprobado tras revisión de Mercado Pago</h2>
                    <p>El pedido <strong>#${order.id.slice(0, 8)}</strong> de ${order.guestName} había quedado en revisión antifraude y ahora se aprobó.</p>
                    <p><strong>Total:</strong> $${Number(order.total).toLocaleString('es-AR')}</p>
                    <p>Ya podés generar la etiqueta y preparar el paquete para este pedido.</p>
                </div>
            `,
        });

        if (response.error) {
            this.logger.error(`Resend rechazó el aviso de aprobación tardía para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }

        this.logger.log(`Aviso de aprobación tardía enviado a Andrea para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando aviso de aprobación tardía para orden ${order.id}`, error);
    }
}

async sendAdminOrderRejectedAfterReview(order: Order) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        this.logger.warn('ADMIN_EMAIL no configurado, no se puede avisar a Andrea');
        return;
    }

    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `Pedido #${order.id.slice(0, 8)} rechazado tras revisión`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Pago rechazado tras revisión de Mercado Pago</h2>
                    <p>El pedido <strong>#${order.id.slice(0, 8)}</strong> de ${order.guestName} había quedado en revisión antifraude y finalmente se rechazó.</p>
                    <p>No hace falta que hagas nada — el stock ya se repuso automáticamente.</p>
                </div>
            `,
        });

        if (response.error) {
            this.logger.error(`Resend rechazó el aviso de rechazo tardío para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }

        this.logger.log(`Aviso de rechazo tardío enviado a Andrea para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando aviso de rechazo tardío para orden ${order.id}`, error);
    }
}

async sendAdminLatePaymentAlert(order: Order, mpPaymentId: string) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        this.logger.warn('ADMIN_EMAIL no configurado, no se puede avisar a Andrea');
        return;
    }

    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `⚠️ Pedido #${order.id.slice(0, 8)} aprobado después de haber sido cancelado — revisar a mano`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Atención: pago aprobado sobre un pedido ya cancelado</h2>
                    <p>El pedido <strong>#${order.id.slice(0, 8)}</strong> de ${order.guestName} había sido cancelado automáticamente (y su stock ya fue repuesto), pero Mercado Pago acaba de confirmar el pago como aprobado.</p>
                    <p><strong>Total:</strong> $${Number(order.total).toLocaleString('es-AR')}</p>
                    <p><strong>ID de pago en Mercado Pago:</strong> ${mpPaymentId}</p>
                    <p>Buscá ese ID en tu cuenta de Mercado Pago (Actividad) para confirmar que el dinero efectivamente ingresó antes de decidir qué hacer.</p>
                    <p>Revisá si todavía hay stock disponible para cubrir este pedido, o si hay que contactar al cliente para coordinar un reembolso.</p>
                </div>
            `,
        });
        if (response.error) {
            this.logger.error(`Resend rechazó la alerta de pago tardío para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }

        this.logger.log(`Alerta de pago tardío enviada a Andrea para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando alerta de pago tardío para orden ${order.id}`, error);
    }
}

async sendPaymentUnderReview(order: Order) {
    if (!order.guestEmail) {
        this.logger.warn(`Orden ${order.id} sin email, no se puede avisar que está en revisión`);
        return;
    }
    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: order.guestEmail,
            subject: `Tu pedido #${order.id.slice(0, 8)} está siendo revisado`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Estamos revisando tu pago</h2>
                    <p>Hola ${order.guestName}, tu pago para el pedido <strong>#${order.id.slice(0, 8)}</strong> está en revisión por Mercado Pago.</p>
                    <p>No vamos a preparar tu pedido hasta que el pago se confirme. Te avisamos por este medio en cuanto tengamos una respuesta.</p>
                </div>
            `,
        });
        if (response.error) {
            this.logger.error(`Resend rechazó el aviso de revisión para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }
        this.logger.log(`Aviso de revisión enviado al cliente para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando aviso de revisión para orden ${order.id}`, error);
    }
}

async sendPaymentRejection(order: Order) {
    if (!order.guestEmail) {
        this.logger.warn(`Orden ${order.id} sin email, no se puede enviar aviso de rechazo`);
        return;
    }
    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: order.guestEmail,
            subject: `Tu pago para el pedido #${order.id.slice(0, 8)} no pudo procesarse`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">No pudimos procesar tu pago</h2>
                    <p>Hola ${order.guestName}, tu pago para el pedido <strong>#${order.id.slice(0, 8)}</strong> no fue aprobado.</p>
                    <p>No te preocupes, no se te realizó ningún cobro. Podés volver a intentar la compra cuando quieras.</p>
                </div>
            `,
        });
        if (response.error) {
            this.logger.error(`Resend rechazó el aviso de rechazo para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }
        this.logger.log(`Aviso de rechazo enviado al cliente para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando aviso de rechazo para orden ${order.id}`, error);
    }
}

async sendAdminReviewTimeoutAlert(order: Order) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        this.logger.warn('ADMIN_EMAIL no configurado, no se puede avisar a Andrea');
        return;
    }
    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `Pedido #${order.id.slice(0, 8)} cancelado por demora en la revisión de MP`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Pedido cancelado por vencimiento de revisión</h2>
                    <p>El pedido <strong>#${order.id.slice(0, 8)}</strong> de ${order.guestName} llevaba demasiado tiempo en revisión de Mercado Pago y se canceló automáticamente.</p>
                    <p>El stock ya fue repuesto. Si Mercado Pago aprueba el pago más adelante, te vamos a avisar aparte para que decidas qué hacer.</p>
                </div>
            `,
        });
        if (response.error) {
            this.logger.error(`Resend rechazó la alerta de vencimiento de revisión para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }
        this.logger.log(`Alerta de vencimiento de revisión enviada a Andrea para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando alerta de vencimiento de revisión para orden ${order.id}`, error);
    }
}


async sendPaymentTimeoutNotice(order: Order) {
    if (!order.guestEmail) {
        this.logger.warn(`Orden ${order.id} sin email, no se puede enviar aviso de vencimiento`);
        return;
    }
    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: order.guestEmail,
            subject: `Tu pedido #${order.id.slice(0, 8)} fue cancelado`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Tu pedido fue cancelado</h2>
                    <p>Hola ${order.guestName}, la revisión de tu pago tardó más de lo esperado y cancelamos el pedido <strong>#${order.id.slice(0, 8)}</strong>.</p>
                    <p>Si Mercado Pago termina confirmando tu pago más adelante, nos vamos a poner en contacto con vos directamente. Si no, no se te realizó ningún cobro.</p>
                </div>
            `,
        });
        if (response.error) {
            this.logger.error(`Resend rechazó el aviso de vencimiento para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }
        this.logger.log(`Aviso de vencimiento enviado al cliente para orden ${order.id}`);
    } catch (error) {
        this.logger.error(`Error enviando aviso de vencimiento para orden ${order.id}`, error);
    }

}

async sendPaymentApprovedNeedsContact(order: Order) {
    if (!order.guestEmail) {
        this.logger.warn(`Orden ${order.id} sin email, no se puede avisar del pago tardío`);
        return;
    }
    try {
        const response = await this.resend.emails.send({
            from: FROM_EMAIL,
            to: order.guestEmail,
            subject: `Tu pago del pedido #${order.id.slice(0, 8)} fue confirmado — te contactamos en breve`,
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #C9A84C;">Recibimos tu pago</h2>
                    <p>Hola ${order.guestName}, confirmamos que tu pago del pedido <strong>#${order.id.slice(0, 8)}</strong> fue aprobado.</p>
                    <p>Como la confirmación tardó más de lo habitual, necesitamos verificar la disponibilidad de tu pedido antes de despacharlo. Nos vamos a comunicar con vos a la brevedad.</p>
                </div>
            `,
        });
        if (response.error) {
            this.logger.error(`Resend rechazó el aviso de pago tardío para orden ${order.id}: ${JSON.stringify(response.error)}`);
            return;
        }
        this.logger.log(`Aviso de pago tardío enviado al cliente para orden ${order.id}`);
        } catch (error) {
            this.logger.error(`Error enviando aviso de pago tardío para orden ${order.id}`, error);
        }
}


}