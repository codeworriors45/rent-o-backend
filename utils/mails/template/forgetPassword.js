const forgetPasswordTemplate = ({ link }) => {

    let html = 
    `
        <html>
            <body style="background-color:#e2e1e0;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
                <h2>Hello! please click on this link to reset password.</h2>
                <a src="${link}">${link}</a>
            </body>

        </html>
    `

    return html;
}

module.exports = forgetPasswordTemplate;