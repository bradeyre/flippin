/**
 * Email templates for Flippin
 * Fun, witty, and interesting tone throughout
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  // Seller emails
  listingCreated: (listingTitle: string, listingId: string): EmailTemplate => ({
    subject: `🎉 Your listing "${listingTitle}" is live!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Live!</h1>
            <p>Your listing is now on Flippin</p>
          </div>
          <div class="content">
            <p>Hey there, savvy seller! 👋</p>
            <p>Great news: <strong>${listingTitle}</strong> is now live on Flippin and ready to find its new home.</p>
            <p>Here's what happens next:</p>
            <ul>
              <li>📱 Buyers can now see your listing and make offers</li>
              <li>⚡ Instant buyers might make you an offer right away</li>
              <li>💬 You'll get notified when someone shows interest</li>
            </ul>
            <p>Pro tip: The better your photos and description, the faster it sells. You've got this! 🚀</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings/${listingId}" class="button">View Your Listing</a>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Questions? Just reply to this email - we're here to help!
            </p>
          </div>
          <div class="footer">
            <p>Happy selling!<br>The Flippin Team 🎯</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `🎉 You're Live!\n\nYour listing "${listingTitle}" is now live on Flippin!\n\nView it here: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings/${listingId}\n\nHappy selling!\nThe Flippin Team`,
  }),

  offerReceived: (offerAmount: number, listingTitle: string, buyerName: string, offerId: string): EmailTemplate => ({
    subject: `💰 New offer: R${offerAmount.toLocaleString()} on "${listingTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .offer-box { background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .offer-amount { font-size: 36px; font-weight: bold; color: #10b981; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px; }
          .button-secondary { background: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 You've Got an Offer!</h1>
            <p>Someone wants your stuff</p>
          </div>
          <div class="content">
            <p>Hey there! 👋</p>
            <p><strong>${buyerName}</strong> just made an offer on your listing:</p>
            <div class="offer-box">
              <p style="margin: 0; color: #6b7280;">Offer Amount</p>
              <div class="offer-amount">R${offerAmount.toLocaleString()}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280;">for "${listingTitle}"</p>
            </div>
            <p>What do you say? You can accept, reject, or make a counter-offer. The ball's in your court! 🎾</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/offers/${offerId}" class="button">View Offer</a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/offers" class="button button-secondary">All Offers</a>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Offers expire after 48 hours, so don't wait too long!
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `💰 New Offer!\n\n${buyerName} offered R${offerAmount.toLocaleString()} for "${listingTitle}"\n\nView it here: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/offers/${offerId}`,
  }),

  offerAccepted: (offerAmount: number, listingTitle: string, buyerName: string): EmailTemplate => ({
    subject: `✅ Offer accepted! Time to get paid 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🎉 Offer Accepted!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hey superstar! 🌟</p>
          <p>You accepted <strong>${buyerName}'s</strong> offer of <strong>R${offerAmount.toLocaleString()}</strong> for "${listingTitle}". Nice work!</p>
          <p><strong>What's next?</strong></p>
          <ol>
            <li>📦 Pack it up safely (we'll send shipping instructions)</li>
            <li>🚚 Ship it within 48 hours</li>
            <li>💰 Get paid once the buyer confirms delivery</li>
          </ol>
          <p>We'll send you shipping instructions shortly. In the meantime, start packing! 📦</p>
        </div>
      </body>
      </html>
    `,
    text: `🎉 Offer Accepted!\n\nYou accepted ${buyerName}'s offer of R${offerAmount.toLocaleString()} for "${listingTitle}".\n\nNext steps: Pack it up and ship within 48 hours!`,
  }),

  instantOfferReceived: (offerAmount: number, listingTitle: string, buyerName: string, offerId: string): EmailTemplate => ({
    subject: `⚡ Instant offer: R${offerAmount.toLocaleString()} - No waiting!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>⚡ Instant Offer!</h1>
          <p>No waiting around</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hey there! 👋</p>
          <p><strong>${buyerName}</strong> (a verified instant buyer) made you an instant offer:</p>
          <div style="background: white; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #f97316;">R${offerAmount.toLocaleString()}</div>
            <p style="margin: 10px 0 0 0; color: #6b7280;">for "${listingTitle}"</p>
          </div>
          <p><strong>What's an instant offer?</strong> It means they're ready to buy NOW - no haggling, no waiting. Just accept and you're done! 🎯</p>
          <p>This offer expires in 48 hours, so don't sleep on it! 😴</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/offers/${offerId}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">View Offer</a>
        </div>
      </body>
      </html>
    `,
    text: `⚡ Instant Offer!\n\n${buyerName} offered R${offerAmount.toLocaleString()} for "${listingTitle}"\n\nThis is an instant offer - accept now and get paid fast!\n\nView: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/offers/${offerId}`,
  }),

  paymentReceived: (amount: number, listingTitle: string): EmailTemplate => ({
    subject: `💰 Payment received! R${amount.toLocaleString()} is on its way`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>💰 Cha-ching!</h1>
          <p>Payment received</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hey money-maker! 💸</p>
          <p>Great news: We've received payment for <strong>"${listingTitle}"</strong>.</p>
          <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <div style="font-size: 36px; font-weight: bold; color: #10b981;">R${amount.toLocaleString()}</div>
            <p style="margin: 10px 0 0 0; color: #6b7280;">will be paid to your account</p>
          </div>
          <p><strong>What happens next?</strong></p>
          <ol>
            <li>📦 Ship the item (you've got 48 hours)</li>
            <li>✅ Buyer confirms delivery</li>
            <li>💰 Money hits your account (usually within 2-3 business days)</li>
          </ol>
          <p>We'll send you shipping instructions in a separate email. Time to pack! 📦</p>
        </div>
      </body>
      </html>
    `,
    text: `💰 Payment Received!\n\nR${amount.toLocaleString()} for "${listingTitle}"\n\nShip within 48 hours and get paid!`,
  }),

  // Buyer emails
  offerAcceptedBuyer: (offerAmount: number, listingTitle: string, sellerName: string): EmailTemplate => ({
    subject: `🎉 Your offer was accepted! Time to pay`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>🎉 Offer Accepted!</h1>
          <p>${sellerName} said yes!</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hey there, smart shopper! 🛍️</p>
          <p><strong>${sellerName}</strong> accepted your offer of <strong>R${offerAmount.toLocaleString()}</strong> for "${listingTitle}". Nice negotiating! 🎯</p>
          <p><strong>What's next?</strong></p>
          <ol>
            <li>💳 Complete payment (we'll send you instructions)</li>
            <li>📦 Seller ships your item</li>
            <li>📬 You receive it and have 48 hours to inspect</li>
            <li>✅ Confirm it's all good, and you're done!</li>
          </ol>
          <p>We'll send payment instructions shortly. Get ready to unbox! 📦</p>
        </div>
      </body>
      </html>
    `,
    text: `🎉 Offer Accepted!\n\n${sellerName} accepted your offer of R${offerAmount.toLocaleString()} for "${listingTitle}"\n\nComplete payment to proceed!`,
  }),

  itemShipped: (listingTitle: string, trackingNumber: string): EmailTemplate => ({
    subject: `📦 Your item is on its way!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📦 It's Shipping!</h1>
          <p>Your item is on the move</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hey there! 👋</p>
          <p>Great news: <strong>"${listingTitle}"</strong> is on its way to you! 🚚</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${trackingNumber}</code></p>` : ''}
          <p>You can track your package and we'll notify you when it arrives. Then you'll have 48 hours to inspect it before we release payment to the seller.</p>
          <p>Get ready to unbox! 📦✨</p>
        </div>
      </body>
      </html>
    `,
    text: `📦 Item Shipped!\n\n"${listingTitle}" is on its way!${trackingNumber ? `\n\nTracking: ${trackingNumber}` : ''}`,
  }),

  // General
  welcome: (userName: string): EmailTemplate => ({
    subject: `Welcome to Flippin! 🎉 Let's get you started`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Welcome to Flippin! 🎉</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hey ${userName}! 👋</p>
          <p>Welcome to Flippin - where selling your stuff is actually fun (and profitable)! 🚀</p>
          <p><strong>Here's what makes us different:</strong></p>
          <ul>
            <li>🤖 AI does 95% of the work (we're not kidding)</li>
            <li>⚡ Instant offers from verified buyers</li>
            <li>💰 Free listings under R1,000</li>
            <li>🛡️ Protected by escrow (you get paid, they get the goods)</li>
          </ul>
          <p>Ready to sell? Just snap some photos and let our AI do the rest. It's that easy! 📸</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/sell" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">Start Selling</a>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to Flippin, ${userName}!\n\nStart selling: ${process.env.NEXT_PUBLIC_APP_URL}/sell`,
  }),
};

