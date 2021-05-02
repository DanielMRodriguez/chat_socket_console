const { Socket } = require('net');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const END = 'END';

const connect = (host, port) => {
  console.log(`Contecting to ${host}:${port}`);
  const socket = new Socket();
  socket.connect({ host, port });
  socket.setEncoding('utf-8');

  socket.on('connect', () => {
    console.log('Connected succesfuly');
    readline.question('Choose your username: ', (username) => {
      socket.write(username);
      console.log(`Type any message to send it, type ${END} to finish`);
    });

    readline.on('line', (message) => {
      if (message == END) {
        socket.end();
        console.log('Disconnected');
      } else {
        socket.write(message);
      }
    });
    socket.on('data', (data) => {
      console.log(data);
    });

    process.on('beforeExit', () => {
      socket.end();
    });

    socket.on('close', () => process.exit(0));
  });

  socket.on('error', (err) => error(err.message));
};

const error = (message) => {
  console.error(message);
  process.exit(1);
};

const main = () => {
  if (process.argv.length !== 4) {
    error(`Usage: node [file] host port`);
  }

  let [, , host, port] = process.argv;

  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }

  port = Number(port);

  connect(host, port);
  console.log(`${host}:${port}`);
};

if (require.main === module) {
  main();
}
