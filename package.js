Package.describe({
  summary: "Write your templates using Handlebars and Jade instead of HTML and Handlebars"
});

var jade = require('jade');
var fs = require('fs');
var path = require('path');

Package.register_extension(
  "jade", function(bundle, source_path, serve_path, where) {

    var contents;
    var options = { pretty: true };

    jade.renderFile(source_path, options, function(err, html) {
      if (err)
        bundle.error(err);
      // Used to create the HTML File
      //filename = source_path + '.html';
      //fs.writeFileSync(filename, new Buffer(html));
      contents = html;
    });


    // From meteor/templating package
    if (where !== "client")
      return;

    var html_scanner = require(path.join('..', '..', 'packages', 'templating', 'html_scanner.js'));
    var results = html_scanner.scan(contents.toString('utf8'), source_path);

    if (results.head)
      bundle.add_resource({
        type: "head",
        data: results.head,
        where: where
      });

    if (results.body)
      bundle.add_resource({
        type: "body",
        data: results.body,
        where: where
      });

    if (results.js) {
      var path_part = path.dirname(serve_path);
      if (path_part === '.')
        path_part = '';
      if (path_part.length && path_part !== path.sep)
        path_part = path_part + path.sep;
      var ext = path.extname(source_path);
      var basename = path.basename(serve_path, ext);
      serve_path = path_part + "template." + basename + ".js";

      bundle.add_resource({
        type: "js",
        path: serve_path,
        data: new Buffer(results.js),
        source_file: source_path,
        where: where
      });
    }
  }
);

