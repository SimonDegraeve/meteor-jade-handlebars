Package.describe({
  summary: "Write your templates using Handlebars and Jade instead of HTML and Handlebars"
});

Package._transitional_registerBuildPlugin({
  name: "jade-handlebars",
  use: ["handlebars"],
  sources: [
    "plugin/html_scanner.js",
    "plugin/compile-jade.js"
  ],
  npmDependencies: {"jade": "0.27.7", "StringScanner": "0.0.3"}
});
