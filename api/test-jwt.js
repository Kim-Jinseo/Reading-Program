import { sign, verify } from 'hono/jwt';

const secret = process.env.JWT_SECRET || 'mysecret';

async function test() {
  try {
    const token = await sign({ userId: "123", role: "student" }, secret);
    console.log("Token:", token);
    const decoded = await verify(token, secret, "HS256");
    console.log("Decoded:", decoded);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
