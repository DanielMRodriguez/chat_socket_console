const { Server } = require('net');
const END = 'END';
const host = '0.0.0.0';

const connections = new Map();

const error = (message) => {
  console.error(message);
  process.exit(1);
};

const sendMessage = (message, origin) => {
  for (const socket of connections.keys()) {
    if (socket !== origin) {
      socket.write(message);
    }
  }
};

function listen(port) {
  const server = new Server();

  server.on('connection', (socket) => {
    const remoteSoket = `${socket.remoteAddress}:${socket.remotePort}`;

    console.log(`new Connection from ${remoteSoket}`);
    socket.setEncoding('utf-8');

    socket.on('data', (message) => {
      if (!connections.has(socket)) {
        console.log(`Username ${message} set for connection -> ${remoteSoket}`);
        connections.set(socket, message);
      } else if (message == END) {
        connections.delete(socket);
        socket.end();
      } else {
        //enviar el mesane al resto de clientes
        for (const user of connections.values()) {
          console.log(user);
        }
        const fullMessage = `[${connections.get(socket)}]: ${message}`;
        console.log(`${remoteSoket} -> ${fullMessage}`);
        sendMessage(fullMessage, socket);
      }
    });

    socket.on('close', () => {
      connections.delete(socket);
      console.log(`connection width ${remoteSoket} is closed`);
    });

    socket.on('error', (err) => error('an error ocurr' + err.message));
  });

  server.listen({ port, host }, () => {
    console.log(`listening on ${port}`);
  });

  server.on('error', (err) => error(err.message));
}

const main = () => {
  if (process.argv.length !== 3) {
    error(`Usage: node [file] port`);
  }

  let port = process.argv[2];
  if (isNaN(port)) {
    error(`Invalid PORT ${port}`);
  }

  port = Number(port);
  listen(port);
};

if (require.main === module) {
  main();
}
