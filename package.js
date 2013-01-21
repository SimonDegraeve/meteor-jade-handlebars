Package.describe({
  summary: "Write your templates using Handlebars and Jade instead of HTML and Handlebars"
});

var fs            = require('fs');
var path          = require('path');
var jade          = require(path.join(process.env.PACKAGE_DIRS, 'jade-handlebars', 'jade'));
var html_scanner  = require(path.join(process.env.PACKAGE_DIRS, 'jade-handlebars', 'html_scanner'));
var StringScanner = require(path.join(process.env.PACKAGE_DIRS, 'jade-handlebars', 'cjs-string-scanner', 'lib', "StringScanner"));


Package.on_use(function (api) {
  api.use('templating', 'client');
});

Package.register_extension(
  "jade", function(bundle, source_path, serve_path, where) {

    // Variables
    var lines = [];
    var json = [];
    var handlebarsPattern = /\s*(\{\{.*(?!\{\{)\}\})/;

    // Handlebars hack
    // Read the file content and create JSON
    try{
      // Create the string scanner with the .jade file content
      var ss = new StringScanner(fs.readFileSync(source_path, "utf8"));
      ss.reset();
      // Parse the file content until the end
      while(!ss.endOfString()){
        // Scan content per line
        ss.scan(/^(\ *)(.*)\n+/);

        // Get the indentation of the line
        indent = ss.captures()[0].length;
        // Get the content of the line
        value = ss.captures()[1];

        // Variables for json
        var child = [];
        var tags = []

        // Scan the content of the line to find handlebars tags
        ss_line = new StringScanner(value);  
        ss_line.reset();
        while(ss_line.checkUntil(handlebarsPattern)){
          ss_line.scanUntil(handlebarsPattern);
          tags.push({"position": ss_line.pointer()-ss_line.captures()[0].length, "value": ss_line.captures()[0]});
        }
        // End scan
        ss_line.terminate();

        // Create the JSON for the line
        line = {"indent": indent, "content": value, "tags": tags, "child": child};

        // Find arborescence
        // If the line is root
        if(line.indent == 0){
          // Add to the main JSON
          json.push(line);
        }else{
          // Add the child to the parent
          for(var i=lines.length-1; i >= 0; i--){
            if(lines[i].indent < line.indent){
              lines[i].child.push(line);
              break;
            }
          }  
        }  
        lines.push(line);   
      }
      // End scan
      ss.terminate();
    } catch(err) {
      return bundle.error(err.message);
    }

    // Fix indentation
    json = jsonParser(json);

    // JSON to string
    global.contents_tmp = ""; // used in jsonToContents() function
    contents = jsonToContents(json); 
    
    // Jade parser
    var jade_options = { pretty: true };

    jade.render(contents, jade_options, function(err, html){
      if (err) throw err;
      contents = html;
    });

    // From meteor/templating package
    if (where !== "client")
      return;

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

function jsonParser(json) {
  // Number fo indentation
  n = 2;
  // Start the loop
  json.forEach(function(root){
    root.child.forEach(function(child){            
      // If line doesn't have HB tag
      if(root.tags.length < 1){
        child.indent = root.indent+n;
      }
      // If line has HB tag and start with HB tag and not comment
      else if(root.tags.length > 0 && root.tags[0].position == 0 && !root.content.match(/^\/\/\-*.*/)) {
          child.indent = root.indent;
      }
      else if(root.tags.length > 0 && root.tags[0].position != 0 && !root.content.match(/^\/\/\-*.*/)) {
          child.indent = root.indent+n;
      }
      // If child has child, recursive call  
      if(child.child.length > 0)
        jsonParser([child]);
    });
  });
  return json;
}

function jsonToContents(json) {
  for(line in json){
    for(attr in json[line]){
        
      if(attr == "content"){
        global.contents_tmp += Array(json[line].indent+1).join(" ") + json[line][attr] + "\n";
      } 
      else if(attr == "child" && typeof(json[line][attr]) == "object") {
          jsonToContents(json[line][attr]);
      }
    }
  }
  return global.contents_tmp;
}
