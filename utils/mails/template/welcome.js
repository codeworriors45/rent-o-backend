const WelcomeTemplate = (link, user) => {
    let html = `
        <html>
            <body style="background-color:#e2e1e0;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
                <h2> Hello ${user}, </h2>

                <p>Follow this link bellow to verify your account: </p>

                <a href="${link}"> ${link} </a>
                <br/>
                <br/>
                <p> Thank you for being a part of the Rent-to-Own Realty community. </p>
                <p>Sincerely,</p>
                <img src="https://res.cloudinary.com/dev-algosolver2021/image/upload/v1658845119/renttoown/provinces/1658845119815_f99t6a.png">
            </body>

        </html>
    `;

    return html;
};

module.exports = WelcomeTemplate;
