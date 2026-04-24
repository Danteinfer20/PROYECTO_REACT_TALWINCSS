<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Manifiesto Popayán Cultural</title>
</head>
<body style="background-color: #0A0A0C; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #111113; border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 20px; overflow: hidden;">
        
        <tr>
            <td style="padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <h1 style="color: #a855f7; margin: 0; font-size: 28px; font-style: italic; font-weight: bold; text-transform: uppercase;">Popayán Cultural</h1>
                <p style="color: #888888; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px;">Corte de Curaduría</p>
            </td>
        </tr>

        <tr>
            <td style="padding: 40px;">
                <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6;">Estimado/a <strong>{{ $user->name }}</strong>,</p>
                
                <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                    Este documento sirve como comprobante legal de tu postulación al Taller Creativo y tu aceptación formal de nuestras políticas operativas. Tu expediente ha sido radicado el <strong>{{ now()->format('d/m/Y H:i') }}</strong>.
                </p>

                <div style="background-color: #0A0A0C; border-left: 4px solid #a855f7; padding: 20px; margin: 30px 0; border-radius: 0 10px 10px 0;">
                    <h3 style="color: #ffffff; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">El Pacto de Responsabilidad</h3>
                    <p style="color: #a3a3a3; font-size: 13px; line-height: 1.6; margin-bottom: 10px;">
                        <strong>1. Autoría:</strong> Garantizo que todas las obras y productos registrados son de mi autoría intelectual o tengo los derechos legales para su comercialización.
                    </p>
                    <p style="color: #a3a3a3; font-size: 13px; line-height: 1.6; margin-bottom: 10px;">
                        <strong>2. Patrimonio:</strong> Me comprometo a preservar el respeto, la ética y los valores patrimoniales de Popayán en cada publicación y evento organizado.
                    </p>
                    <p style="color: #a3a3a3; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
                        <strong>3. Sanciones:</strong> Entiendo que la Corte de Curaduría se reserva el derecho de suspender mi cuenta si la información proporcionada es falsa o viola los lineamientos de la comunidad.
                    </p>
                </div>

                <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                    El Administrador está revisando tu trayectoria. Te notificaremos por este mismo medio en cuanto se emita un veredicto.
                </p>
            </td>
        </tr>

        <tr>
            <td style="background-color: #050506; padding: 20px; text-align: center;">
                <p style="color: #555555; font-size: 10px; margin: 0; letter-spacing: 1px; text-transform: uppercase;">Este es un correo generado automáticamente. No respondas a esta dirección.</p>
            </td>
        </tr>
    </table>

</body>
</html>