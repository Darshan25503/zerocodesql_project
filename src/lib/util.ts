import nodemailer from "nodemailer";

export const randomString = (n: number) => {
    return Math.random()
        .toString(36)
        .substring(2, n + 2);
};
export const EmailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});
