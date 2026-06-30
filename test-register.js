const url = "http://localhost:3000/api/appscript";
async function test() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", data: { nama: "test", whatsapp: "12345", email: "test@test.com", namasekolah: "test", password: "test" } })
    });
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}
test();
