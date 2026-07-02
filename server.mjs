import express from 'express';
import 'dotenv/config';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error('API_KEY não encontrada no arquivo .env');
  process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/weather', async (req, res) => {
  const { city } = req.query;

  if (!city || !city.trim()) {
    return res.status(400).json({ error: 'O nome da cidade é obrigatório.' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}&lang=pt_br`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'Cidade não encontrada. Verifique o nome e tente novamente.' });
      }
      return res.status(error.response.status).json({ error: 'Erro ao buscar dados do clima.' });
    }
    res.status(500).json({ error: 'Erro de conexão com o servidor meteorológico.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
