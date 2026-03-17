import "dotenv/config";
import { createApp } from "./app";

const port = process.env.PORT || 4000;

const app = createApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API escuchando en http://localhost:${port}`);
});

