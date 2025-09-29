import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';

export const publicVerifyCard = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.query;

  try {
    if (!studentId) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vérification d'accès - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .error { 
                    color: #d32f2f; 
                    border-left: 4px solid #d32f2f;
                    padding-left: 15px;
                }
                .success { 
                    color: #388e3c; 
                    border-left: 4px solid #388e3c;
                    padding-left: 15px;
                }
                h1 { margin-bottom: 20px; color: #333; }
                .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Vérification d'accès - BOVANN</h1>
                <div class="error">
                    <h2>Erreur</h2>
                    <p>ID étudiant manquant dans le QR code.</p>
                </div>
            </div>
        </body>
        </html>
      `);
    }

    // Trouver l'étudiant avec ses paiements validés
    const student = await prisma.student.findUnique({
      where: { id: studentId as string },
      include: {
        payments: {
          where: { 
            status: 'VALID'
          },
          orderBy: { validUntil: 'desc' }
        }
      }
    });

    if (!student) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vérification d'accès - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .error { 
                    color: #d32f2f; 
                    border-left: 4px solid #d32f2f;
                    padding-left: 15px;
                }
                .success { 
                    color: #388e3c; 
                    border-left: 4px solid #388e3c;
                    padding-left: 15px;
                }
                h1 { margin-bottom: 20px; color: #333; }
                .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Vérification d'accès - BOVANN</h1>
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
    const hasValidPayment = student.payments.length > 0;
    const latestPayment = student.payments[0];

    if (!hasValidPayment) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vérification d'accès - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .error { 
                    color: #d32f2f; 
                    border-left: 4px solid #d32f2f;
                    padding-left: 15px;
                }
                .success { 
                    color: #388e3c; 
                    border-left: 4px solid #388e3c;
                    padding-left: 15px;
                }
                h1 { margin-bottom: 20px; color: #333; }
                .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Vérification d'accès - BOVANN</h1>
                <div class="error">
                    <h2>ACCÈS REFUSÉ</h2>
                    <div class="info">
                        <h3>${student.firstName} ${student.lastName}</h3>
                        <p>${student.institution}</p>
                    </div>
                    <p><strong>Raison:</strong> Aucun paiement valide</p>
                </div>
            </div>
        </body>
        </html>
      `);
    }

    // Vérifier si le paiement est encore valide
    const isValid = latestPayment.validUntil >= now && latestPayment.validFrom <= now;

    if (isValid) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vérification d'accès - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .error { 
                    color: #d32f2f; 
                    border-left: 4px solid #d32f2f;
                    padding-left: 15px;
                }
                .success { 
                    color: #388e3c; 
                    border-left: 4px solid #388e3c;
                    padding-left: 15px;
                }
                h1 { margin-bottom: 20px; color: #333; }
                .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Vérification d'accès - BOVANN</h1>
                <div class="success">
                    <h2>ACCÈS AUTORISÉ</h2>
                    <div class="info">
                        <h3>${student.firstName} ${student.lastName}</h3>
                        <p>${student.institution}</p>
                        <p><strong>Montant payé:</strong> ${latestPayment.amount} FCFA</p>
                        <p><strong>Valide jusqu'au:</strong> ${latestPayment.validUntil.toLocaleDateString('fr-FR')}</p>
                    </div>
                    <p><strong>Statut:</strong> Accès autorisé</p>
                </div>
            </div>
        </body>
        </html>
      `);
    } else {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vérification d'accès - BOVANN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                .error { 
                    color: #d32f2f; 
                    border-left: 4px solid #d32f2f;
                    padding-left: 15px;
                }
                .success { 
                    color: #388e3c; 
                    border-left: 4px solid #388e3c;
                    padding-left: 15px;
                }
                h1 { margin-bottom: 20px; color: #333; }
                .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Vérification d'accès - BOVANN</h1>
                <div class="error">
                    <h2>PAIEMENT EXPIRÉ</h2>
                    <div class="info">
                        <h3>${student.firstName} ${student.lastName}</h3>
                        <p>${student.institution}</p>
                        <p><strong>Dernier paiement:</strong> ${latestPayment.amount} FCFA</p>
                        <p><strong>Expiré depuis le:</strong> ${latestPayment.validUntil.toLocaleDateString('fr-FR')}</p>
                    </div>
                    <p><strong>Raison:</strong> Période de validité expirée</p>
                </div>
            </div>
        </body>
        </html>
      `);
    }

  } catch (err) {
    console.error('Erreur vérification publique:', err);
    return res.status(500).send('Erreur interne du serveur');
  }
};