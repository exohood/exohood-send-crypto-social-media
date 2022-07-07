import del from 'del';
import fs from 'fs';
import makeDir from 'make-dir';
import gulp from 'gulp';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './src/App';
import COUNTRIES from './src/countries';
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins();
const imageminPngquant = require('imagemin-pngquant');
import Polyglot from 'node-polyglot';
import jsonConcat from 'gulp-json-concat';

const clean = () => del(['.tmp', 'dist']);

const imagemin = () => {
  return gulp
    .src('./dist/png/**/*.png')
    .pipe(plugins.cache(plugins.imagemin([imageminPngquant({ quality: '65-80' })])))
    .pipe(gulp.dest('./dist/png'));
};

const svg2png = () => {
  return gulp
    .src('./dist/svg/**/*.svg')
    .pipe(plugins.raster({ format: 'png', scale: 2 }))
    .pipe(plugins.rename({ extname: '.png' }))
    .pipe(gulp.dest('./dist/png'));
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

gulp.task('svg', async () => {
  const mkdirAndWriteFile = async (path, fileName, content) => {
    await makeDir(path);
    await fs.writeFileSync(`${path}${fileName}`, content);
  };

  const build = async (locale, country, messages) => {
    const { translationKey } = country;
    const polyglot = new Polyglot({
      locale,
      phrases: messages[locale],
    });
    const translate = polyglot.t.bind(polyglot);

    const svg = ReactDOMServer.renderToStaticMarkup(
      <App width={620} height={325} translationKey={translationKey} translate={translate} />,
    );

    await mkdirAndWriteFile(`./dist/svg/${locale}/`, `${translationKey}.svg`, svg);
  };

  const messages = await JSON.parse(fs.readFileSync('.tmp/translations/messages.json', 'utf8'));

  await asyncForEach(Object.keys(messages), async locale => {
    await asyncForEach(COUNTRIES, async country => {
      await build(locale, country, messages);
    });
  });
});

const translations = () => {
  return gulp
    .src('./translations/*.json')
    .pipe(
      jsonConcat('messages.json', function(data) {
        return new Buffer(JSON.stringify(data));
      }),
    )
    .pipe(gulp.dest('.tmp/translations/'));
};

const build = gulp.series(clean, translations, 'svg', svg2png, imagemin);

gulp.task('build', build);
gulp.task('default', build);
