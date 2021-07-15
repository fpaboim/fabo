import nodemailer from 'nodemailer'

const sendEmail = async (email, subject, text) => {
try {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    secureConnection: false, // use SSL
    service: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls:{
        ciphers:'SSLv3'
    }
  });

  await transporter.sendMail({
    from: "noreply@"+process.env.DOMAIN,
    to: email,
    subject: subject,
    text: text,
  });

  console.log("email sent sucessfully");
} catch (error) {
    console.log(error, "email not sent");
  }
};

export default sendEmail
