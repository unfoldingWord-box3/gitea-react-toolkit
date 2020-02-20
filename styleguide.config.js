const path = require('path');
const upperFirst = require('lodash/upperFirst');
const camelCase = require('lodash/camelCase');
const {
  name, version, repository,
} = require('./package.json');
const { styles, theme } = require('./styleguide.styles');

const pathComponents = path.join(__dirname, 'src/components/');
const sections = [
  {
    name: 'README',
    content: 'README.md',
  },
  {
    name: 'Application Bar ',
    content: path.join(pathComponents, 'application-bar', '_readme.md'),
    components: [
      'ApplicationBar',
      'DrawerMenu',
      'RepositoryMenu',
      'UserMenu',
    ].map(componentName =>
      path.join(pathComponents, 'application-bar', `${componentName}.js`)
    ),
  },
  {
    name: 'Authentication ',
    content: path.join(pathComponents, 'authentication', '_readme.md'),
    components: [
      'withAuthentication',
      'Authentication',
      'LoginForm',
    ].map(componentName =>
      path.join(pathComponents, 'authentication', `${componentName}.js`)
    ),
  },
  {
    name: 'File CRUD',
    content: path.join(pathComponents, 'file', '_readme.md'),
    sections: [
      {
        name: 'Create',
        content: path.join(pathComponents, 'file', '_create.md'),
      },
      {
        name: 'Read',
        content: path.join(pathComponents, 'file', '_read.md'),
      },
      {
        name: 'Update',
        content: path.join(pathComponents, 'file', '_update.md'),
      },
      {
        name: 'Delete',
        content: path.join(pathComponents, 'file', '_delete.md'),
      },
    ],
  },
  {
    name: 'Repositories ',
    content: path.join(pathComponents, 'repositories', '_readme.md'),
    components: [
      'Repositories',
      'Search',
      'SearchForm',
    ].map(componentName =>
      path.join(pathComponents, 'repositories', `${componentName}.js`)
    ),
  },
  {
    name: 'Repository ',
    content: path.join(pathComponents, 'repository', '_readme.md'),
    components: [
      'Repository',
      'withRepository',
    ].map(componentName =>
      path.join(pathComponents, 'repository', `${componentName}.js`)
    ),
  },
];

module.exports = {
  title: `${upperFirst(camelCase(name))} v${version}`,
  ribbon: {
    url: repository.url,
    text: 'View on GitHub',
  },
  styles,
  theme,
  getComponentPathLine: (componentPath) => {
    const file = componentPath.split('/').pop();
    const component = file.split('.').shift();
    const componentName = upperFirst(camelCase(component));
    return `import { ${componentName} } from "${name}";`;
  },
  usageMode: 'expand',
  exampleMode: 'expand',
  pagePerSection: true,
  sections,
  components: 'src/components/**/[A-Z]*.js',
  moduleAliases: { 'gitea-react-toolkit': path.resolve(__dirname, 'src') },
  version,
  webpackConfig: require( 'react-scripts/config/webpack.config' ),
  // webpackConfig: {
  //   devtool: 'source-map',
  //   module: {
  //     rules: [
  //       {
  //         test: /\.js$/,
  //         exclude: /node_modules/,
  //         loader: 'babel-loader',
  //       },
  //       {
  //         test: /\.css$/,
  //         loader: 'style-loader!css-loader',
  //       },
  //     ],
  //   },
  // },
  // propsParser: require('react-docgen-typescript').withCustomConfig(
  //   './tsconfig.json'
  // ).parse,
};

