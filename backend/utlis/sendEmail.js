const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const createTransporter = async () => {
    // If SMTP credentials are provided, use them. Otherwise fall back to ethereal test account.
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // create a test account (ethereal) for development if real SMTP not configured
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

exports.sendConfirmationEmail = async (email, confirmationUrl) => {
    const transporter = await createTransporter();
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Kathithimalai Textile'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Account Confirmation',
        text: `Please confirm your account by clicking the link: ${confirmationUrl}`,
        html: `<p>Please confirm your account by clicking the link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.SMTP_USER === '' && info) {
            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) console.log('Preview URL: %s', preview);
        }
    } catch (err) {
        console.log('sendConfirmationEmail error:', err);
        throw err;
    }
};

exports.sendContactFormEmail = async (formData) => {
    const transporter = await createTransporter();
    const { firstName, lastName, email, phone, countryCode, services, message, rating } = formData;

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Kathithimalai Textile'}" <${process.env.SMTP_USER}>`,
        to: 'jothisankar979@gmail.com',
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        html: `
            <h2>New Contact Inquiry</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${countryCode} ${phone}</p>
            <p><strong>Services Interested:</strong> ${Array.isArray(services) ? services.join(', ') : services}</p>
            <p><strong>Experience Rating:</strong> ${rating} / 5 ⭐</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f4f4f4; padding: 15px; border-radius: 8px;">${message}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log('sendContactFormEmail error:', err);
        throw err;
    }
};

/**
 * Generates an invoice PDF in memory and returns it as a Buffer.
 */
const generateInvoiceBuffer = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const primaryColor = '#e74c3c';
        const textColor = '#333333';
        const lightBg = '#f9f9f9';
        const successBg = '#dff0d8';
        const successText = '#3c763d';

        // Top Red Bar
        doc.rect(50, 45, 510, 15).fill(primaryColor);

        // Header Title
        doc.fillColor(textColor).fontSize(30).font('Helvetica-Bold').text('INVOICE', 50, 80);

        // Date and Invoice No
        doc.fontSize(10).font('Helvetica')
            .text(`DATE: ${new Date(order.date).toLocaleDateString('en-IN')}`, 400, 85, { align: 'right' })
            .text(`INVOICE NO: ${order._id.toString().slice(-6).toUpperCase()}`, 400, 100, { align: 'right' });

        // Logo
        const logoPath = path.join(__dirname, '../../frontend/src/assets/mat_logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 470, 120, { width: 80 });
        }

        // Company Info
        doc.fontSize(10).font('Helvetica').fillColor(textColor)
            .text('MAT Traders', 50, 130)
            .text('123 Textile Avenue', 50, 145)
            .text('Salai Road, Trichy - 620001', 50, 160)
            .text('Phone: +91 98765 43210', 50, 175)
            .text('Email: support@mat.com', 50, 190);

        // Bill To & Ship To
        const topY = 230;
        doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor)
            .text('BILL TO', 50, topY)
            .text('SHIP TO', 300, topY);

        doc.fillColor(textColor).font('Helvetica').fontSize(10);
        doc.text(`${order.address.firstName} ${order.address.lastName}`, 50, topY + 20)
            .text(`${order.address.street}`, 50, topY + 35)
            .text(`${order.address.city}, ${order.address.state} - ${order.address.zipcode}`, 50, topY + 50)
            .text(`Phone: ${order.address.phone}`, 50, topY + 65);
        doc.text(`${order.address.firstName} ${order.address.lastName}`, 300, topY + 20)
            .text(`${order.address.street}`, 300, topY + 35)
            .text(`${order.address.city}, ${order.address.state} - ${order.address.zipcode}`, 300, topY + 50)
            .text(`Phone: ${order.address.phone}`, 300, topY + 65);

        // Table Header
        const tableTop = 350;
        doc.rect(50, tableTop, 510, 20).fill(primaryColor);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
            .text('DESCRIPTION', 60, tableTop + 5)
            .text('QTY', 350, tableTop + 5, { width: 50, align: 'center' })
            .text('UNIT PRICE', 410, tableTop + 5, { width: 70, align: 'center' })
            .text('TOTAL', 490, tableTop + 5, { width: 60, align: 'right' });

        // Table Items
        let currentY = tableTop + 25;
        doc.fillColor(textColor).font('Helvetica');
        order.items.forEach((item, index) => {
            if (index % 2 === 1) {
                doc.rect(50, currentY - 2, 510, 18).fill(lightBg);
                doc.fillColor(textColor);
            }
            doc.text(item.name, 60, currentY)
                .text(item.quantity.toString(), 350, currentY, { width: 50, align: 'center' })
                .text(`Rs.${item.price}`, 410, currentY, { width: 70, align: 'center' })
                .text(`Rs.${item.price * item.quantity}`, 490, currentY, { width: 60, align: 'right' });
            currentY += 20;
        });

        // Summary
        currentY += 20;
        const summaryX = 350;
        const deliveryCharge = 5;
        const subtotal = order.amount - deliveryCharge;
        doc.font('Helvetica').fontSize(10)
            .text('SUBTOTAL', summaryX, currentY)
            .text(`Rs.${subtotal}`, 480, currentY, { width: 70, align: 'right' });
        currentY += 15;
        doc.text('DISCOUNT', summaryX, currentY).text('Rs.0.00', 480, currentY, { width: 70, align: 'right' });
        currentY += 15;
        doc.text('TAX RATE (0%)', summaryX, currentY).text('Rs.0.00', 480, currentY, { width: 70, align: 'right' });
        currentY += 15;
        doc.text('SHIPPING/HANDLING', summaryX, currentY).text(`Rs.${deliveryCharge}.00`, 480, currentY, { width: 70, align: 'right' });
        currentY += 25;

        doc.rect(summaryX - 10, currentY - 5, 220, 25).fill(successBg);
        doc.fillColor(successText).font('Helvetica-Bold').fontSize(12)
            .text('BALANCE DUE', summaryX, currentY)
            .text(`Rs.${order.amount}.00`, 480, currentY, { width: 70, align: 'right' });

        // Footer
        doc.fillColor(textColor).font('Helvetica-Oblique').fontSize(10)
            .text('Thank you for your business!', 50, 700, { align: 'center' });

        // Bottom Red Bar
        doc.rect(50, 750, 510, 15).fill(primaryColor);

        doc.end();
    });
};

/**
 * Sends an order confirmation email with the invoice PDF attached.
 * @param {Object} order - The full order document from MongoDB
 */
exports.sendOrderConfirmationEmail = async (order) => {
    try {
        const transporter = await createTransporter();
        const customerEmail = order.address.email;
        const customerName = `${order.address.firstName} ${order.address.lastName}`;
        const orderId = order._id.toString();
        const orderShortId = orderId.slice(-6).toUpperCase();
        const orderDate = new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const paymentLabel = order.paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : order.paymentMethod === 'upi'
                ? 'UPI Payment'
                : 'Card / Stripe';

        // Build items rows for email
        const itemRows = order.items.map(item => `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#333;">${item.name}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#333;text-align:center;">${item.quantity}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#333;text-align:right;">&#8377;${item.price}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#333;font-weight:600;text-align:right;">&#8377;${item.price * item.quantity}</td>
            </tr>
        `).join('');

        const deliveryCharge = 5;
        const subtotal = order.amount - deliveryCharge;

        const htmlBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Order Confirmation</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:30px 0;">
                <tr><td align="center">
                    <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                        <!-- Header Banner -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#e74c3c 0%,#c0392b 100%);padding:36px 40px;text-align:center;">
                                <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">MAT Traders</h1>
                                <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your order has been placed successfully! 🎉</p>
                            </td>
                        </tr>

                        <!-- Greeting -->
                        <tr>
                            <td style="padding:32px 40px 0;">
                                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Hi ${customerName},</h2>
                                <p style="margin:0;color:#666;font-size:15px;line-height:1.6;">Thank you for shopping with us. We've received your order and it's being processed. A detailed invoice is attached to this email for your records.</p>
                            </td>
                        </tr>

                        <!-- Order Info Card -->
                        <tr>
                            <td style="padding:24px 40px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9f9;border:1px solid #fde8e8;border-radius:10px;overflow:hidden;">
                                    <tr>
                                        <td style="padding:20px 24px;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td width="50%">
                                                        <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Order ID</p>
                                                        <p style="margin:0;font-size:18px;font-weight:700;color:#e74c3c;">#${orderShortId}</p>
                                                    </td>
                                                    <td width="50%" style="text-align:right;">
                                                        <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Order Date</p>
                                                        <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${orderDate}</p>
                                                    </td>
                                                </tr>
                                                <tr><td colspan="2" style="padding-top:16px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td width="50%">
                                                                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Payment Method</p>
                                                                <p style="margin:0;font-size:14px;font-weight:600;color:#333;">${paymentLabel}</p>
                                                            </td>
                                                            <td width="50%" style="text-align:right;">
                                                                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.8px;">Order Status</p>
                                                                <span style="display:inline-block;padding:4px 12px;background:#fff3cd;color:#856404;border-radius:20px;font-size:13px;font-weight:600;">Processing</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td></tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Order Items Table -->
                        <tr>
                            <td style="padding:0 40px 24px;">
                                <h3 style="margin:0 0 14px;color:#1a1a2e;font-size:16px;">Order Summary</h3>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;">
                                    <thead>
                                        <tr style="background:#e74c3c;">
                                            <th style="padding:11px 12px;color:#fff;font-size:12px;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Item</th>
                                            <th style="padding:11px 12px;color:#fff;font-size:12px;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Qty</th>
                                            <th style="padding:11px 12px;color:#fff;font-size:12px;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Price</th>
                                            <th style="padding:11px 12px;color:#fff;font-size:12px;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemRows}
                                    </tbody>
                                    <tfoot>
                                        <tr style="background:#fafafa;">
                                            <td colspan="3" style="padding:10px 12px;font-size:13px;color:#666;text-align:right;">Subtotal</td>
                                            <td style="padding:10px 12px;font-size:13px;color:#333;font-weight:600;text-align:right;">&#8377;${subtotal}</td>
                                        </tr>
                                        <tr style="background:#fafafa;">
                                            <td colspan="3" style="padding:6px 12px;font-size:13px;color:#666;text-align:right;">Delivery Charge</td>
                                            <td style="padding:6px 12px;font-size:13px;color:#333;font-weight:600;text-align:right;">&#8377;${deliveryCharge}</td>
                                        </tr>
                                        <tr style="background:#fef0f0;">
                                            <td colspan="3" style="padding:12px;font-size:15px;font-weight:700;color:#e74c3c;text-align:right;">Grand Total</td>
                                            <td style="padding:12px;font-size:15px;font-weight:700;color:#e74c3c;text-align:right;">&#8377;${order.amount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </td>
                        </tr>

                        <!-- Delivery Address -->
                        <tr>
                            <td style="padding:0 40px 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e8eaf6;border-radius:10px;">
                                    <tr>
                                        <td style="padding:20px 24px;">
                                            <h3 style="margin:0 0 12px;color:#1a1a2e;font-size:15px;">&#128230; Delivery Address</h3>
                                            <p style="margin:0;color:#555;font-size:14px;line-height:1.7;">
                                                ${order.address.firstName} ${order.address.lastName}<br/>
                                                ${order.address.street}<br/>
                                                ${order.address.city}, ${order.address.state} - ${order.address.zipcode}<br/>
                                                ${order.address.country}<br/>
                                                <strong>Phone:</strong> ${order.address.phone}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Tracking Info -->
                        <tr>
                            <td style="padding:0 40px 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
                                    <tr>
                                        <td style="padding:20px 24px;">
                                            <h3 style="margin:0 0 8px;color:#166534;font-size:15px;">&#128205; Order Tracking</h3>
                                            <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">Your order is currently <strong>Processing</strong>. You will receive updates as your order moves through the following stages:</p>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                                                <tr>
                                                    <td style="text-align:center;">
                                                        <div style="display:inline-block;width:34px;height:34px;background:#e74c3c;border-radius:50%;line-height:34px;color:#fff;font-weight:700;font-size:13px;">1</div>
                                                        <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:#e74c3c;">Order Placed</p>
                                                    </td>
                                                    <td style="color:#ccc;font-size:20px;text-align:center;">&#8594;</td>
                                                    <td style="text-align:center;">
                                                        <div style="display:inline-block;width:34px;height:34px;background:#ddd;border-radius:50%;line-height:34px;color:#666;font-weight:700;font-size:13px;">2</div>
                                                        <p style="margin:6px 0 0;font-size:12px;color:#999;">Processing</p>
                                                    </td>
                                                    <td style="color:#ccc;font-size:20px;text-align:center;">&#8594;</td>
                                                    <td style="text-align:center;">
                                                        <div style="display:inline-block;width:34px;height:34px;background:#ddd;border-radius:50%;line-height:34px;color:#666;font-weight:700;font-size:13px;">3</div>
                                                        <p style="margin:6px 0 0;font-size:12px;color:#999;">Shipped</p>
                                                    </td>
                                                    <td style="color:#ccc;font-size:20px;text-align:center;">&#8594;</td>
                                                    <td style="text-align:center;">
                                                        <div style="display:inline-block;width:34px;height:34px;background:#ddd;border-radius:50%;line-height:34px;color:#666;font-weight:700;font-size:13px;">4</div>
                                                        <p style="margin:6px 0 0;font-size:12px;color:#999;">Delivered</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Invoice Note -->
                        <tr>
                            <td style="padding:0 40px 28px;">
                                <p style="margin:0;font-size:13px;color:#888;text-align:center;">&#128206; Your invoice (PDF) is attached to this email. Please keep it for your records.</p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background:#1a1a2e;padding:24px 40px;text-align:center;border-radius:0 0 12px 12px;">
                                <p style="margin:0 0 6px;color:rgba(255,255,255,0.7);font-size:13px;">Questions? Contact us at <a href="mailto:support@mat.com" style="color:#e74c3c;text-decoration:none;">support@mat.com</a></p>
                                <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;">&copy; ${new Date().getFullYear()} MAT Traders. All rights reserved.</p>
                            </td>
                        </tr>

                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `;

        // Generate PDF invoice buffer
        const invoiceBuffer = await generateInvoiceBuffer(order);

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'MAT Traders'}" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `Order Confirmed #${orderShortId} - MAT Traders`,
            html: htmlBody,
            attachments: [
                {
                    filename: `Invoice-${orderShortId}.pdf`,
                    content: invoiceBuffer,
                    contentType: 'application/pdf',
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Order confirmation email sent to ${customerEmail} for order #${orderShortId}`);
    } catch (err) {
        // Non-blocking: log the error but don't fail the order placement
        console.error('sendOrderConfirmationEmail error:', err.message);
    }
};
