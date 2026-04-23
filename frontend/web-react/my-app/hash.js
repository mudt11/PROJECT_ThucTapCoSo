import bcrypt from "bcryptjs";

const password = "2005"; // mật khẩu bạn muốn đặt
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword);
