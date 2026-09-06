export const DEFAULT_TEMPLATES: Record<string, string> = {
  'welcome': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #16254c; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .header p { color: #D4A76A; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .content { padding: 32px 24px; }
    .title { color: #0f172a; font-size: 20px; margin-top: 0; font-weight: 700; }
    .text { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background: #D4A76A; color: #0d162d; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px; line-height: 1.5; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SPECPART</h1>
      <p>Pièces auto & Lubrifiants</p>
    </div>
    <div class="content">
      <h2 class="title">Bienvenue {{name}} ! 👋</h2>
      <p class="text">
        Votre compte a été créé avec succès sur <strong>specpart.tn</strong>. Vous pouvez dès à présent ajouter vos véhicules à votre garage virtuel, commander vos pièces certifiées et suivre l'état de vos livraisons.
      </p>
      <div class="button-container">
        <a href="{{frontendUrl}}/catalogue" class="button">Explorer le catalogue →</a>
      </div>
      <div class="footer">
        Service client disponible du Lundi au Samedi au <strong>+216 29 294 195</strong>.<br/>
        &copy; {{year}} Specpart. Tous droits réservés.
      </div>
    </div>
  </div>
</body>
</html>`,

  'order-confirmation': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #16254c; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .header p { color: #D4A76A; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .content { padding: 32px 24px; }
    .title { color: #0f172a; font-size: 20px; margin-top: 0; font-weight: 700; }
    .text { color: #475569; font-size: 15px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .table th { background: #f8fafc; padding: 10px 12px; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    .table th.right { text-align: right; }
    .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; }
    .table td.right { text-align: right; font-weight: 600; color: #0f172a; }
    .table .subtext { color: #94a3b8; font-size: 12px; display: block; margin-top: 4px; }
    .table tfoot td { padding: 12px; color: #64748b; font-size: 14px; border-bottom: none; }
    .table tfoot td.right { text-align: right; }
    .table tfoot tr.total td { font-size: 18px; font-weight: 700; color: #16254c; border-top: 2px solid #e2e8f0; }
    .info-box { background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin: 24px 0; font-size: 14px; color: #475569; line-height: 1.6; border: 1px solid #e2e8f0; }
    .info-box strong { color: #1e293b; }
    .info-item { margin-bottom: 8px; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px; line-height: 1.5; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SPECPART</h1>
      <p>Confirmation de commande</p>
    </div>
    <div class="content">
      <h2 class="title">Merci pour votre commande, {{customerName}} ! 👋</h2>
      <p class="text">
        Votre commande <strong>#{{orderRef}}</strong> a bien été enregistrée. Nos équipes logistiques s'occupent de sa préparation avec le plus grand soin.
      </p>

      <table class="table">
        <thead>
          <tr>
            <th>Article</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>
              <strong>{{name}}</strong> {{#if volume}}<span style="color: #64748b; font-size: 12px;">({{volume}})</span>{{/if}}
              <span class="subtext">Qté : {{quantity}} × {{formatPrice unitPrice}} TND</span>
            </td>
            <td class="right">
              {{formatPrice totalLinePrice}} TND
            </td>
          </tr>
          {{/each}}
        </tbody>
        <tfoot>
          <tr>
            <td>Frais de livraison ({{wilaya}})</td>
            <td class="right">{{formatPrice shippingCost}} TND</td>
          </tr>
          <tr class="total">
            <td>Total TTC</td>
            <td class="right">{{formatPrice totalAmount}} TND</td>
          </tr>
        </tfoot>
      </table>

      <div class="info-box">
        <div class="info-item">📍 <strong>Adresse de livraison :</strong> {{city}}, {{wilaya}}</div>
        <div class="info-item">📞 <strong>Téléphone :</strong> {{phone}}</div>
        <div class="info-item">💳 <strong>Paiement :</strong> {{paymentMethod}}</div>
      </div>

      <div class="footer">
        Une question sur votre livraison ? Contactez notre support au <strong>+216 29 294 195</strong>.<br/>
        &copy; {{year}} Specpart. Tous droits réservés.
      </div>
    </div>
  </div>
</body>
</html>`,

  'delivery-notice': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #16a34a; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .header p { color: #dcfce7; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .content { padding: 32px 24px; }
    .title { color: #0f172a; font-size: 20px; margin-top: 0; font-weight: 700; }
    .text { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .info-box { background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin: 24px 0; font-size: 14px; color: #475569; line-height: 1.6; border: 1px solid #e2e8f0; text-align: center; }
    .info-box strong { color: #1e293b; font-size: 18px; display: block; margin-top: 4px; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background: #16254c; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 13px; line-height: 1.5; }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SPECPART</h1>
      <p>Votre commande est en route !</p>
    </div>
    <div class="content">
      <h2 class="title">Bonne nouvelle, {{customerName}} ! 🚚</h2>
      <p class="text">
        Votre commande <strong>#{{orderRef}}</strong> a été expédiée et est actuellement en cours de livraison vers <strong>{{city}}</strong>. 
        Notre transporteur vous contactera très prochainement au <strong>{{phone}}</strong> pour coordonner la remise de votre colis.
      </p>
      
      <div class="info-box">
        Montant à régler à la livraison :
        <strong>{{formatPrice totalAmount}} TND</strong>
      </div>

      <div class="button-container">
        <a href="{{frontendUrl}}/compte/commandes" class="button">Suivre ma commande</a>
      </div>
      <div class="footer">
        En cas de besoin, contactez notre support au <strong>+216 29 294 195</strong>.<br/>
        &copy; {{year}} Specpart. Tous droits réservés.
      </div>
    </div>
  </div>
</body>
</html>`,

  'password-reset': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #16254c; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .content { padding: 32px 24px; }
    .title { color: #0f172a; font-size: 20px; margin-top: 0; font-weight: 700; text-align: center; }
    .text { color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background: #D4A76A; color: #0d162d; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SPECPART</h1>
    </div>
    <div class="content">
      <h2 class="title">Réinitialisation du mot de passe 🔑</h2>
      <p class="text">
        Vous avez demandé la réinitialisation de votre mot de passe pour le compte <strong>{{email}}</strong>.
      </p>
      <div class="button-container">
        <a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a>
      </div>
      <div class="footer">
        Ce lien est sécurisé et expire dans <strong>1 heure</strong>.<br/>
        Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
      </div>
    </div>
  </div>
</body>
</html>`,

  'login-alert': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin:0; padding:20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #dc2626; padding: 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 24px; }
    .title { color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700; }
    .text { color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
    .footer { text-align: left; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Alerte de sécurité</h1>
    </div>
    <div class="content">
      <h2 class="title">Bonjour {{name}},</h2>
      <p class="text">
        Une nouvelle connexion à votre compte Specpart a été enregistrée le <strong>{{time}}</strong>.
      </p>
      <div class="footer">
        Si vous n'êtes pas à l'origine de cette activité, nous vous conseillons de changer votre mot de passe immédiatement ou de contacter notre support.
      </div>
    </div>
  </div>
</body>
</html>`,
};
