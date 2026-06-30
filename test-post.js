const url = "https://script.google.com/macros/s/AKfycbxt9uNCBR-f_Bic5HqRGqNtFoEgfqhGwfYsGVDFgpolkziJZP3ar_DBM7uRryWaWzQamQ/exec";
async function test() {
  const res = await fetch(url, { method: "POST", body: JSON.stringify({action: "login", data: {whatsapp: "123", password: "123"}}) });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
test();
