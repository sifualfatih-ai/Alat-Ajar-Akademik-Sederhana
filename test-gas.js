const url = "https://script.google.com/macros/s/AKfycbybfM2oVtlyPDVyVyMlEWVjr_TpLqO4yDJjWU6NKeKFjOq9HulGb6btkGHlV-oXHf5tCw/exec";
async function test() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test" })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}
test();
