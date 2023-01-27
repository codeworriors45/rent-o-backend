
const forgetPWTemp = (tempLink) => {

    let html = `
    <!DOCTYPE html>
    <html>
        <body style="background-color:#e2e1e0;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
            <h1>You have requested to reset your password</h1>
            <p>Follow this link bellow to verify your account: </p>
            <a href=${tempLink} style="border-radius: 5px; background-color: #00dbb1; color: white; padding: 10px; text-align: center; text-decoration: none; font-size: 14px; margin: 4px 2px; cursor: pointer; display: inline-block;" target="_blank"> Reset Password </a>
            <br />
            <br />
            Or, Copy this link
            <br />
            <a href=${tempLink} target="_blank"> ${tempLink} </a>
            <br />
            <br />
            <p> Thank you for being a part of the Rent-to-Own Realty community. </p>
            <p>Sincerely,</p>
            <img src="https://res.cloudinary.com/dev-algosolver2021/image/upload/v1658845119/renttoown/provinces/1658845119815_f99t6a.png">
        </body>
    </html>
    `
    return html;
}

module.exports = forgetPWTemp;

