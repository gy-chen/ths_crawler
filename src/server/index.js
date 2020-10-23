const cluster = require("cluster");
const app = require("./app");

function start() {
  if (cluster.isMaster) {
    cluster.on("message", (worker, message) => {
      switch (message) {
        case "reload":
          console.log("reload");
          worker.kill();
          cluster.fork();
          break;
      }
    });

    cluster.fork();
  }

  if (cluster.isWorker) {
    app.listen(4413, () => {
      console.log("server started");
    });
  }
}

start();
