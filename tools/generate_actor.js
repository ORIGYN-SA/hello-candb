const { generateTemplateFiles, CaseConverterEnum } = require('generate-template-files');

generateTemplateFiles([
  {
    option: 'Create CanDB Service Actor From Template',
    defaultCase: CaseConverterEnum.PascalCase,
    entry: {
      folderPath: './tools/templates/ServiceActor.mo',
    },
    stringReplacers: ['{{actor_class_name}}' ],
    output: {
      path: './src/{{actor_class_name}}(lowerCase)/{{actor_class_name}}.mo',
      pathAndFileNameDefaultCase: CaseConverterEnum.PascalCase,
    },
    onComplete: (results) => { console.log("results", results) }
  },
  {
    option: 'Create CanDB IndexCanister Actor From Template',
    defaultCase: CaseConverterEnum.PascalCase,
    entry: {
      folderPath: './tools/templates/IndexCanister.mo',
    },
    dynamicReplacers: [{ slot: '{{name}}', slotValue: 'IndexCanister'}],
    output: {
      path: './src/index/IndexCanister.mo',
    },
    onComplete: (results) => { console.log("results", results) }
  },
]);