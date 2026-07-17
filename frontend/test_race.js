const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Audit log timeout")), 1500));
Promise.race([
    Promise.resolve("SQL Success"),
    timeout
]).then(console.log).catch(console.error);

setTimeout(() => console.log("Done waiting"), 2000);
