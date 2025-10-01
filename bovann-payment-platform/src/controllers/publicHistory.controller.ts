import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';

export const getStudentHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.params;

  try {
    if (!studentId) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Historique des paiements - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
                .error { color: #d32f2f; border-left: 4px solid #d32f2f; padding: 15px; margin: 10px 0; }
                .success { color: #388e3c; border-left: 4px solid #388e3c; padding: 15px; margin: 10px 0; }
                h1 { color: #333; text-align: center; }
                .student-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .payment { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .payment.valid { border-left: 4px solid #388e3c; }
                .payment.expired { border-left: 4px solid #ff9800; }
                .payment.pending { border-left: 4px solid #2196f3; }
                .total { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 1.2em; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Historique des paiements - BOVANN</h1>
                <div class="error">
                    <h2>Erreur</h2>
                    <p>ID étudiant manquant.</p>
                </div>
            </div>
        </body>
        </html>
      `);
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!student) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Historique des paiements - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
                .error { color: #d32f2f; border-left: 4px solid #d32f2f; padding: 15px; margin: 10px 0; }
                h1 { color: #333; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Historique des paiements - BOVANN</h1>
                <div class="error">
                    <h2>Étudiant non trouvé</h2>
                    <p>Aucun étudiant correspondant à cet identifiant.</p>
                </div>
            </div>
        </body>
        </html>
      `);
    }

    const totalAmount = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const now = new Date();

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Historique des paiements - ${student.firstName} ${student.lastName}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
            .student-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .payment { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .payment.valid { border-left: 4px solid #388e3c; }
            .payment.expired { border-left: 4px solid #ff9800; }
            .payment.pending { border-left: 4px solid #2196f3; }
            .total { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 1.2em; }
            h1 { color: #333; text-align: center; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-size: 0.8em; }
            .status-valid { background: #388e3c; }
            .status-expired { background: #f44336; }
            .status-pending { background: #ff9800; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Historique des paiements - BOVANN</h1>
            
            <div class="student-info">
                <h2>${student.firstName} ${student.lastName}</h2>
                <p><strong>Institution:</strong> ${student.institution}</p>
                <p><strong>Niveau:</strong> ${student.studyLevel}</p>
                <p><strong>Filière:</strong> ${student.domain}</p>
            </div>

            <div class="total">
                <h3>Total des paiements: ${totalAmount.toLocaleString()} FCFA</h3>
                <p>Nombre de transactions: ${student.payments.length}</p>
            </div>
    `;

    if (student.payments.length === 0) {
      html += `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>Aucun paiement enregistré</h3>
            </div>
      `;
    } else {
      html += `<h3>Détail des paiements:</h3>`;
      
      student.payments.forEach((payment, index) => {
        const isActive = payment.status === 'VALID' && 
                        payment.validUntil >= now && 
                        payment.validFrom <= now;
        
        const statusClass = isActive ? 'valid' : 
                          payment.status === 'EXPIRED' ? 'expired' : 'pending';
        
        const statusText = isActive ? 'ACTIF' : 
                          payment.status === 'EXPIRED' ? 'EXPIRÉ' : 'EN ATTENTE';
        
        const statusColor = isActive ? 'status-valid' : 
                           payment.status === 'EXPIRED' ? 'status-expired' : 'status-pending';

        // CORRECTION: Utiliser l'ID du paiement comme référence
        const reference = `PAY-${payment.id.substring(0, 8).toUpperCase()}`;

        html += `
            <div class="payment ${statusClass}">
                <div style="display: flex; justify-content: between; align-items: center;">
                    <div style="flex: 1;">
                        <strong>${payment.amount.toLocaleString()} FCFA</strong>
                        <br>
                        <small>Référence: ${reference}</small>
                    </div>
                    <span class="status ${statusColor}">${statusText}</span>
                </div>
                <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <div>Validité: ${payment.validFrom.toLocaleDateString('fr-FR')} - ${payment.validUntil.toLocaleDateString('fr-FR')}</div>
                    <div>Créé le: ${payment.createdAt.toLocaleDateString('fr-FR')}</div>
                </div>
            </div>
        `;
      });
    }

    html += `
        </div>
    </body>
    </html>
    `;

    res.send(html);

  } catch (err) {
    console.error('Erreur historique etudiant:', err);
    return res.status(500).send('Erreur interne du serveur');
  }
};