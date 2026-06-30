async function test() {
  try {
    const res = await fetch("https://belajar.nafsflow.com/api/appscript", { method: "POST" });
    const text = await res.text();
    console.log("Response:", text.substring(0, 100));
  } catch(e) {
    console.error(e);
  }
}
test();
