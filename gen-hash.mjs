import { hashPassword, verifyPassword } from "better-auth/crypto";
const h = await hashPassword("ruvicode-test-123");
console.log(h);
try { console.log("orderA(h,pw):", await verifyPassword(h, "ruvicode-test-123")); } catch (e) { console.log("orderA err"); }
try { console.log("orderB(pw,h):", await verifyPassword("ruvicode-test-123", h)); } catch (e) { console.log("orderB err"); }
