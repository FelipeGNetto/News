const nodemailer = require('nodemailer');

const countries = ['br', 'us']; // Lista de códigos de países (US - Estados Unidos, GB - Reino Unido, CA - Canadá, BR - Brasil, etc.)
const apiKey = 'b7eb7f87d7864138a0a79ca85b730f4c';

// Função para fazer a solicitação para um país específico
async function getNewsByCountry(country) {
  const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.articles; // Retorna os artigos de notícias do país especificado
}

// Função para obter notícias de vários países
async function getNewsFromMultipleCountries(countries) {
  const promises = countries.map(country => getNewsByCountry(country));
  const allResults = await Promise.all(promises);
  const combinedResults = allResults.flat(); // Combina os resultados em um único array
  return combinedResults;
}

// Função para enviar um email com as notícias para um destinatário específico
async function enviarEmail(destinatario, noticias) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'felipenettomail@gmail.com', // Coloque seu endereço de email do Gmail aqui
      pass: 'lmjmlkrlyszbhttc', // Coloque sua senha do Gmail aqui (ou utilize uma variável de ambiente para manter sua senha segura)
    },
  });

  const mailOptions = {
    from: 'felipenettomail@gmail.com', // Seu endereço de email do Gmail
    to: destinatario,
    subject: 'Notícias do dia',
    html: formatarNoticiasTexto(noticias), // Usar o conteúdo formatado em HTML no corpo do email
  };

  // Envia o email
  return transporter.sendMail(mailOptions);
}

// Função para formatar o texto das notícias em HTML
function formatarNoticiasTexto(noticias) {
  let texto = '<div style="width: 100%; display: flex; justify-content: center;"><h1 style="font-size: 24px; margin-bottom: 20px;">Notícias do dia</h1></div>';

  noticias.forEach((noticia) => {
    const { title, source, url, urlToImage, publishedAt } = noticia;
    const fonte = source && source.name ? `<strong style="font-size: 16px;">Fonte: </strong>${source.name}` : '';
    const imagem = urlToImage ? `<img src="${urlToImage}" alt="Imagem da notícia" style="max-width: 100%; height: auto; margin-bottom: 10px;">` : '';
    texto += `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px;">${title}</h2>
        <p>${fonte}</p>
        <p style="font-size: 14px;"><strong>URL: </strong><a href="${url}">Link para a notícia</a></p>
        ${imagem}
        <p style="font-size: 12px;">Data da publicação: ${publishedAt}</p>
      </div>
      <hr style="border: 1px solid #ccc; margin: 10px 0;">
    `;
  });

  return texto;
}


// Chamando a função para obter notícias de vários países
getNewsFromMultipleCountries(countries)
  .then(news => {
    console.log('Notícias de vários países:', news);

    const destinatarios = ['fehnetto08@gmail.com', 'felipenetto00@gmail.com'];

    // Função para enviar o email para um destinatário
    function enviarParaDestinatario(destinatario) {
      return new Promise((resolve, reject) => {
        enviarEmail(destinatario, news)
          .then(() => {
            console.log(`Email enviado para ${destinatario}`);
            resolve();
          })
          .catch((error) => {
            console.error(`Erro ao enviar email para ${destinatario}:`, error);
            reject(error);
          });
      });
    }

    // Enviar emails para todos os destinatários com as notícias
    const enviarEmailPromises = destinatarios.map(destinatario => enviarParaDestinatario(destinatario));

    // Aguardar o envio de todos os emails antes de finalizar
    return Promise.all(enviarEmailPromises);
  })
  .then(() => {
    console.log('Todos os emails enviados com sucesso.');
  })
  .catch(error => {
    console.error('Erro ao obter notícias ou enviar emails:', error);
  });
