import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';

export const publicVerifyCard = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.query;

  try {
    if (!studentId) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vérification Carte - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; text-align: center; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .valid { color: #388e3c; background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .expired { color: #f57c00; background: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Vérification Carte - BOVANN</h1>
                <div class="error">
                    <h2>Erreur</h2>
                    <p>ID étudiant manquant dans la requête.</p>
                </div>
            </div>
        </body>
        </html>
      `);
    }

    // Récupérer l'étudiant avec ses paiements ACTUELS
    const student = await prisma.student.findUnique({
      where: { id: studentId as string },
      include: {
        payments: {
          where: {
            status: 'VALID'
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!student) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vérification Carte - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; text-align: center; }
                .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Vérification Carte - BOVANN</h1>
                <div class="error">
                    <h2>Étudiant non trouvé</h2>
                    <p>Aucun étudiant correspondant à cet identifiant.</p>
                </div>
            </div>
        </body>
        </html>
      `);
    }

    const now = new Date();
    
    // Trouver le paiement valide le plus récent
    const validPayment = student.payments.find(payment => 
      payment.status === 'VALID' && 
      payment.validFrom <= now && 
      payment.validUntil >= now
    );

    // Vérifier si l'étudiant a au moins un paiement valide
    const hasValidPayment = !!validPayment;
    const totalPayments = student.payments.length;
    const totalAmount = student.payments.reduce((sum, payment) => sum + payment.amount, 0);

    let statusClass = 'error';
    let statusText = 'NON VALIDE';
    let statusMessage = 'Aucun paiement valide trouvé';

    if (hasValidPayment && validPayment) {
      statusClass = 'valid';
      statusText = 'VALIDE';
      statusMessage = `Carte active - Valide jusqu'au ${validPayment.validUntil.toLocaleDateString('fr-FR')}`;
    } else if (student.payments.length > 0) {
      statusClass = 'expired';
      statusText = 'EXPIRÉ';
      statusMessage = 'Aucun paiement actif trouvé';
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vérification Carte - ${student.firstName} ${student.lastName}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="refresh" content="30"> <!-- Actualisation automatique toutes les 30 secondes -->
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
            .status { padding: 30px; border-radius: 10px; margin: 20px 0; text-align: center; font-size: 1.2em; }
            .valid { color: #388e3c; background: #e8f5e8; border: 2px solid #388e3c; }
            .expired { color: #f57c00; background: #fff3e0; border: 2px solid #f57c00; }
            .error { color: #d32f2f; background: #ffebee; border: 2px solid #d32f2f; }
            .student-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .payment-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            h1 { color: #333; text-align: center; }
            .last-update { text-align: center; color: #666; font-size: 0.9em; margin-top: 20px; }
            .refresh-notice { text-align: center; color: #999; font-size: 0.8em; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Vérification Carte - BOVANN</h1>
            
            <div class="student-info">
                <h2>${student.firstName} ${student.lastName}</h2>
                <p><strong>Institution:</strong> ${student.institution}</p>
                <p><strong>Niveau:</strong> ${student.studyLevel}</p>
                <p><strong>Filière:</strong> ${student.domain}</p>
            </div>

            <div class="status ${statusClass}">
                <h2>Statut: ${statusText}</h2>
                <p>${statusMessage}</p>
            </div>

            ${hasValidPayment && validPayment ? `
            <div class="payment-info">
                <h3>Dernier Paiement Valide</h3>
                <p><strong>Montant:</strong> ${validPayment.amount.toLocaleString()} FCFA</p>
                <p><strong>Validité:</strong> ${validPayment.validFrom.toLocaleDateString('fr-FR')} - ${validPayment.validUntil.toLocaleDateString('fr-FR')}</p>
            </div>
            ` : ''}

            <div class="student-info">
                <h3>Résumé des Paiements</h3>
                <p><strong>Total des paiements:</strong> ${totalAmount.toLocaleString()} FCFA</p>
                <p><strong>Nombre de transactions:</strong> ${totalPayments}</p>
                <p><strong>Paiements valides:</strong> ${student.payments.filter(p => p.status === 'VALID').length}</p>
            </div>

            <div class="last-update">
                <p>Dernière vérification: ${new Date().toLocaleString('fr-FR')}</p>
                <div class="refresh-notice">Cette page s'actualise automatiquement toutes les 30 secondes</div>
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(html);

  } catch (err) {
    console.error('Erreur vérification publique:', err);
    return res.status(500).send('Erreur interne du serveur');
  }
};