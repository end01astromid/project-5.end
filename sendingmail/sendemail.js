const nodemailer = require('nodemailer');

async function sendEmail(to,subject,text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
  try{
    await transporter.sendMail({
    from: `"Node.js App" <${process.env.EMAIL_USER}>`, // от кого письмо
    to, // кому письмо (например, sultan@gmail.com)
    subject, // тема письма ("Регистрация успешна")
    text, // сам текст письма
})
  console.log("Письмо отправлено:", to)
}catch(err){
  console.error("Произошла ошибка при отправке письма:", error);
}
};



module.exports = sendEmail;