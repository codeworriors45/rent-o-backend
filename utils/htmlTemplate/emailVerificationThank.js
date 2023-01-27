const emailVerifyhtml = (firstName, lastName) => {
    let html = `
        <html>
            <body style="background-color:#e2e1e0;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
                <h2> Hello ${firstName} ${lastName} </h2>
                <p> Thank you for verifying you email. </p>
            </body>

        </html>
    `

    return html;
}


module.exports = emailVerifyhtml;