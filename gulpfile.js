import gulp from 'gulp'
import webpack from 'webpack-stream'
import named from 'vinyl-named'
import del from 'del'
import changed from 'gulp-changed'
import sass from 'gulp-sass'
import moduleImporter from 'sass-module-importer'
import notify from 'gulp-notify'
import jeditor from 'gulp-json-editor'
import addSrc from 'gulp-add-src'
import io from 'socket.io'

const WEBSOCKET_PORT = 8080

const paths = {
  scripts: [
    'src/options.js',
    'src/content.js',
    'src/background.js',
    'src/popup.js',
  ],

  styles: [
    'src/options.scss',
    'src/popup.scss',
  ],

  images: 'src/images/**/*',

  manifest: 'src/manifest.json',

  markup: [
    'src/options.html',
    'src/popup.html',
  ],
}

const webpackConfig = {
  output: {
    filename: '[name].js',
  },
  module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
		],
	},
  // plugins: [
  //   new webpack.optimize.ModuleConcatenationPlugin(),
  // ],
  resolve: {
    modules: ['node_modules', 'src'],
  },
}


function addAutoreloadScript(manifestJson) {
  const hasScripts = manifestJson.background && manifestJson.background.scripts

  return {
    ...manifestJson,
    background: {
      ...manifestJson.background,
      scripts: [ 'autoreload.js', ...(hasScripts ? manifestJson.background.scripts : []) ],
    },
  }
}

function scripts() {
  return gulp.src(paths.scripts, { allowEmpty: true })
    .pipe(addSrc('utils/autoreload.js')) // TODO add gulpIF
    .pipe(named())
    .pipe(webpack(webpackConfig))
    .on('error', notify.onError({
      title: 'Error compiling scripts!',
      message: 'Error compiling scripts!',
    }))
    .pipe(gulp.dest('build'))
}

function images() {
  return gulp.src(paths.images)
    .pipe(changed('build/images'))
    .pipe(gulp.dest('build/images'))
}

function markup() {
  return gulp.src(paths.markup, { allowEmpty: true })
    .pipe(changed('build'))
    .pipe(gulp.dest('build'))
}

function manifest() {
  return gulp.src(paths.manifest)
    .pipe(changed('build'))
    .pipe(jeditor(addAutoreloadScript)) // TODO add gulpIf
    .pipe(gulp.dest('build'))
}

function styles() {
  return gulp.src(paths.styles, { allowEmpty: true })
    .pipe(sass({
      outputStyle: 'expanded',
      importer: moduleImporter(),
      includePaths: 'node_modules/',
    }))
    .on('error', notify.onError({
      title: 'Error compiling styles!',
      message: '\n<%= error.messageOriginal %>\non line (<%= error.line %>:<%= error.column %>) of <%= error.relativePath %>',
    }))
    .pipe(gulp.dest('build'))
}

function clean() {
  return del(['build'])
}

function watch() {
  const socket = io.listen(WEBSOCKET_PORT)
  const triggerFileChange = () => socket.emit('file changed')

  gulp.watch('src/**/*.js', scripts, triggerFileChange)
  gulp.watch('src/**/*.scss', styles, triggerFileChange)
  gulp.watch(paths.manifest, manifest, triggerFileChange)
  gulp.watch(paths.images, images, triggerFileChange)
  gulp.watch(paths.markup, markup, triggerFileChange)
}

gulp.task('default', gulp.series(clean, gulp.parallel(scripts, styles, markup, images, manifest)))

gulp.task('dev', gulp.series('default', watch))
