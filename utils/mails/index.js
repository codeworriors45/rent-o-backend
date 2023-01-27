const nodemailer = require('nodemailer')

// using "nodemailer" this code is not currently used
module.exports.send = (mailDetail) => {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME|| 'testdev5800@gmail.com',
            pass: process.env.MAIL_PASSWORD || 'L11isshit'
        }

        // host: process.env.MAIL_HOST || "smtp.mailtrap.io",
        // port: process.env.MAIL_PORT || 2525,
        // auth: {
        //   user: process.env.MAIL_USER || "0dc93e44af4daa",
        //   pass: process.env.MAIL_PASSWORD || "0d3c0c6adf3876"
        // }
    })

    let senderName = process.env.MAIL_SENDER || "Rent-to-Own Realty"
    let senderMail = process.env.MAIL_ADDRESS || "info@algosolver.com"

    let detail = {
        ...mailDetail,
        from: `"${senderName}" <${senderMail}>`,
    }

    transporter.sendMail(detail, function (error, info) {
        if(error) { 
            console.log(error); 
        }
        else { 
            // console.log(info);
        }
    })

}

const sgMail = require('@sendgrid/mail');
const api_key = process.env.SENDGRID_API_KEY
if (!api_key) {
    console.log("Missing SendGrid Key");
}
sgMail.setApiKey(api_key);

// usning "sendgrid"
module.exports.sendEmail = (mailDetail) => {
    const senderName = process.env.MAIL_SENDER || "Rent-to-Own Realty"
    const senderMail = process.env.MAIL_ADDRESS || "info@algosolver.com"
    const msg = {
        ...mailDetail,
        from: `${senderName} <${senderMail}>`,
    };
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        });
}