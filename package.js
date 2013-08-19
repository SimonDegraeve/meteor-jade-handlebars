Package.describe({
  summary: "Write your templates using Handlebars and Jade instead of HTML and Handlebars"
});

Package._transitional_registerBuildPlugin({
  name: "compileJade",
  use: ["handlebars"],
  sources: [
    "plugin/compile-jade.js"
  ]
});