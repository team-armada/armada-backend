exports.handler = function (event, context, callback) {
  const fs = require('fs');

  fs.mkdir(`/mnt/efs/${event.directory}`, { recursive: true }, err => {
    callback(null, {
      statusCode: 200,
      'content-type': 'text/html',
      body: (err || 'ok').toString(),
    });
  });
};
