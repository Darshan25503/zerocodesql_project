export const OTP = (otp: string) =>
    `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZeroCodeSQL - OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border: 1px solid #dddddd;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            padding: 10px 0;
            border-bottom: 1px solid #dddddd;
        }

        .header h1 {
            font-size: 24px;
            color: #000000;
            margin: 0;
        }

        .content {
            padding: 20px 0;
            text-align: center;
        }

        .content p {
            font-size: 18px;
            color: #555555;
        }

        .otp {
            display: inline-block;
            background-color: #333333;
            color: #ffffff;
            font-size: 24px;
            padding: 10px 20px;
            border-radius: 5px;
            letter-spacing: 4px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            padding: 10px 0;
            border-top: 1px solid #dddddd;
            font-size: 14px;
            color: #999999;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1><strong>ZeroCodeSQL</strong></h1>
        </div>
        <div class="content">
            <p>Your One-Time Password (OTP) is:</p>
            <div class="otp">${otp}</div>
            <p>Please use this OTP to complete your verification.</p>
        </div>
        <div class="footer">
            <p>If you did not request this OTP, please ignore this email.</p>
        </div>
    </div>
</body>

</html>`;

export const ContactToOwner = (name: string, email: string, subject: string, text: string) =>
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #000;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            font-size: 24px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
        .footer a {
            color: #000;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Contact Us Form Submission</h1>
        </div>
        <hr/>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong>${subject}</p>
        <p><strong>Message:</strong>${text}</p>
        <br/>
        <p>Please review the message and get back to the user at your earliest convenience. If you need any additional information, feel free to reach out to User.</p>
        <hr/>
        <div class="footer">
            <p>&copy; ZeroCodeSQL. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const ContactToClient = (name: string) => `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #000;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            font-size: 24px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
        .footer a {
            color: #000;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Contacting Us!</h1>
        </div>
        <hr/>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to us. We have received your message and appreciate you taking the time to contact us.</p>
        <p>Our team will review your message and get back to you as soon as possible.</p>
        <p>Thank you once again for contacting us. We look forward to assisting you.</p>
        <p>ZeroCodeSQL</p>
        <hr/>
        <div class="footer">
            <p>&copy; ZeroCodeSQL. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
