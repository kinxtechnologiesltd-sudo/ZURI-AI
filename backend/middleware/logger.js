export function requestLogger(
  req,
  res,
  next
) {
  const start = Date.now();

  console.log(
    `\n🟢 ${req.method} ${req.originalUrl}`
  );

  res.on("finish", () => {
    console.log(
      `✅ ${res.statusCode} • ${
        Date.now() - start
      }ms`
    );
  });

  next();
}