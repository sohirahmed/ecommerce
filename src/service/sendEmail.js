
import nodemailer from "nodemailer";

export const sendEmail =async (to, subject,html,attachments=[])=>{

const transporter = nodemailer.createTransport({

    service:"gmail",
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD,
    },
});

const info = await transporter.sendMail({
    from: `"SohirA7med " <${process.env.emailSender}>`, 
    to:to ? to:"saraali1@gmail.com" , 
    subject: subject ? subject:"Hello" ,  
    html: html ? html:"hello world? ",
    attachments
});

// console.log( info);
if(info.accepted.length){
    return true
}
return false;

}

