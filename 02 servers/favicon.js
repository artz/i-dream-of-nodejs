/*
 * Node.js Favicon Service
 *
 * APPROACH
 * Taking advantage of Node's asynchronous nature, we fire off two
 * requests: one for the root favicon and one for the HTML where we parse
 * for the preferred location of the favicon.  If we don't find the favicon
 * URL in the source, we use the one at the root of the domain.
 *
 * USAGE
 * <server>/<domain or url>
 *
 * EXAMPLE
 * http://localhost:8080/www.aol.com
 *
 */
var http = require('http'),
  https = require('https'),
  url = require('url'),
  fs = require('fs'),

  defaultFavicon;

// Create the favicons directory.
if (!fs.exists(__dirname + '/favicons/')) {
  fs.mkdir(__dirname + '/favicons/');
}

// Keep default favicon in memory.
fs.readFile(__dirname + '/default.ico', function (err, favicon) {
  if (!err) {
    defaultFavicon = favicon;
  } else {
    console.log('Warning: Could not find default favicon in ' + __dirname + '/default.ico');
  }
});

// Downloads a favicon from a given URL
function getFavicon(url, callback) {
  var protocol;
  if (/https:\/\//.test(url)) {
    protocol = https;
  } else {
    protocol = http;
  }
  protocol.get(url, function (res) {

    var favicon,
      chunks = [],
      length = 0;

    if (res.statusCode === 200) {
      res.on('data', function (chunk) {
        chunks.push(chunk);
        length += chunk.length;
      }).on('end', function () {
        favicon = Buffer.concat(chunks, length);
        callback(favicon);
      });
    } else if (res.statusCode === 301 || res.statusCode === 302) {
      // Fetch the favicon at the given location.
      // console.log("Redirecting to: " + res.headers['location']);
      getFavicon(res.headers['location'], callback);
    } else {
      // console.log("Favicon not found: " + url);
      callback(); // undefined
    }
  }).on('error', function (err) {
    console.log(err.message);
  });
}

function saveFavicon(filename, favicon) {
  fs.writeFile(__dirname + '/favicons/' + filename, favicon, function (err) {
    if (err) {
      console.log('Error saving favicon: ' + filename);
      console.log(err.message);
    }
  });
}

function getHTML(url, callback) {
  var protocol;
  if (/https:\/\//.test(url)) {
    protocol = https;
  } else {
    protocol = http;
  }
  protocol.get(url, function (res) {

    var html,
      chunks = [],
      length = 0;

    res.setEncoding('utf-8');
    if (res.statusCode === 200) {
      res.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', function () {
        html = chunks.join('');
        callback(html);
      });
    } else if (res.statusCode === 301 || res.statusCode === 302) {
      // console.log("Redirecting to: " + res.headers['location']);
      getHTML(res.headers['location'], callback);
    } else {
      callback(); // undefined
    }
  }).on('error', function (err) {
    console.log(err.message);
  });
}

function parseFaviconURL(html, root) {
  var link_re = /<link ([^>]*)>/gi,
    rel_re  = /rel=["'][^"']*icon[^"']*["']/i,
    href_re = /href=["']([^"']*)["']/i,
    match, ico_match, faviconURL;

  while (match = link_re.exec(html)) {
    if (rel_re.test(match[1]) && (ico_match = href_re.exec(match[1]))) {
      faviconURL = ico_match[1];
      if (faviconURL[0] === '/') {
        faviconURL = root + faviconURL;
      }
      break;
    }
  }
  return faviconURL;
}

// Initialize HTTP server.
http.globalAgent.maxSockets = Number.MAX_VALUE;
http.createServer(function (request, response) {

  // Parse the request URL to identify the root.
  var root = request.url.substr(1),
    host,

    rootFavicon,
    htmlFavicon,

    // These variables help us know when both
    // requests have returned and we can complete
    // the request.
    returned = 0,
    expected = 2,
    done = function () {
      returned += 1;
      var favicon;
      if (returned === expected) {
        // If we have an html favicon, let's use that.
        if (htmlFavicon) {
          favicon = htmlFavicon;
        // If not, use the root favicon.
        } else if (rootFavicon) {
          favicon = rootFavicon;
        // Otherwise, fall back to the default.
        } else {
          favicon = defaultFavicon;
        }
        response.writeHead(200, {'Content-Type': 'image/x-icon'});
        response.end(favicon);
        saveFavicon(host + '.ico', favicon);
      }
    };


  if (!/http[s]*:\/\//.test(root)) {
    root = 'http://' + root;
  }
  root = url.parse(root),
  host = root.host;
  root = root.protocol + '//' + host;

  // See if we have the favicon in our cache.
  fs.stat(__dirname + '/favicons/' + host + '.ico', function (err, stats) {

    // If we have stats on the file, see if we need to refresh if
    // greater than our time limit.
    if (stats) {
      var expires = 24 * 60 * 60 * 1000, // One day in milliseconds.
        isExpired = new Date() - stats.mtime > expires;
    }

    // If there's an error, or the file has expired,
    // we need to fetch the favicon.
    if (err || isExpired) {
      // Try fetching the icon from the root of the domain.
      getFavicon(root + '/favicon.ico', function (favicon) {
        // If we got one, save it to disk and return it.
        if (favicon) {
          rootFavicon = favicon;
        }
        console.log("Root favicon found for " + root);
        done();
      });

      // Try fetching the HTML and parsing it for the favicon.
      getHTML(root, function (html) {
        // If we have HTML, parse out the favicon link.
        if (html) {
          var faviconURL = parseFaviconURL(html, root);
          // If we have a favicon URL, try to get it.
          if (faviconURL) {
            console.log('Found favicon in HTML: ' + faviconURL);
            getFavicon(faviconURL, function (favicon) {
              htmlFavicon = favicon;
              done();
            });
          } else {
            console.log('Favicon not downloaded: ' + root);
            done();
          }
        } else {
          console.log('No HTML returned: ' + root);
          done();
        }
      });
    } else {
      // console.log(host + '.ico file stats: ', stats);
      fs.readFile(__dirname + '/favicons/' + host + '.ico', function (err, favicon) {
        if (!err) {
          response.writeHead(200, {'Content-Type': 'image/x-icon'});
          response.end(favicon);
        } else {
          console.log('Error reading ' + host + '.ico');
          console.log(err.message);
          response.end();
        }
      });
    }
  });

}).listen(8080);

console.log('Favicon HTTP server running on port 8080');
