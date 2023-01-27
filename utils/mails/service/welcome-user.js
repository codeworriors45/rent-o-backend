const mailer = require('..');
const WelcomeTemplate = require('../template/welcome');

const WelcomeUserMail = (to, link, user) => {

    const data = WelcomeTemplate(link, user);
    if(!to) return

    let mailDetail = {
        to: to,
        subject: "Welcome to Rent-to-Own Realty",
        html: `${data}`,
    };

    mailer.sendEmail(mailDetail);

}

module.exports = WelcomeUserMail;