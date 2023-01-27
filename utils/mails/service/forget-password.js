const mailer = require('..');
const forgetPasswordTemplate = require('../template/forgetPassword');
const forgetPWTemp = require('../template/forgetPWTemp');

const forgetPasswordMail = (to, tempLink) => {

    console.log('link', tempLink);
    const data = forgetPWTemp(tempLink);
    if(!to) return

    let mailDetail = {
        to: to,
        subject: "Password reset",
        html: `${data}`,
    };

    mailer.sendEmail(mailDetail);

}

module.exports = forgetPasswordMail;