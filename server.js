const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Novo dispositivo conectado: ${socket.id}`);

  // Evento: Passageiro cria a sala de licitação (Preço base inicial)
  socket.on('solicitacao_viagem', (dadosLicitacao) => {
    const idLicitacao = dadosLicitacao.id_licitacao;
    socket.join(idLicitacao);
    console.log(`Sala de licitação criada: ${idLicitacao}`);
  });

  // Evento: Kupapata/Motorista envia um lance ou contraproposta
  socket.on('novo_lance', (lanceData) => {
    console.log(`Novo lance recebido para licitação ${lanceData.id_licitacao}: ${lanceData.valor_lance} Kz`);
    
    // Repassa o lance em tempo real para o passageiro na mesma sala
    socket.to(lanceData.id_licitacao).emit('atualizacao_lances', lanceData);
  });

  socket.on('disconnect', () => {
    console.log(`Dispositivo desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
