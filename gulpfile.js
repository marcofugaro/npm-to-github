import gulp from 'gulp'
import webpackStream from 'webpack-stream'
import named from 'vinyl-named'
import del from 'del'
import changed from 'gulp-changed'
import sass from 'gulp-sass'
import moduleImporter from 'sass-module-importer'
import notify from 'gulp-notify'
import jeditor from 'gulp-json-editor'
import addSrc from 'gulp-add-src'
import gulpif from 'gulp-if'
import io from 'socket.io'

const WEBSOCKET_PORT = 8080
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

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
    .pipe(gulpif(!IS_PRODUCTION, addSrc('utils/autoreload.js')))
    .pipe(named())
    .pipe(webpackStream(webpackConfig))
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
    .pipe(gulpif(!IS_PRODUCTION, jeditor(addAutoreloadScript)))
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
  const triggerFileChange = (done) => {
    socket.emit('file changed')
    done()
  }

  gulp.watch('src/**/*.js', gulp.series(scripts, triggerFileChange))
  gulp.watch('src/**/*.scss', gulp.series(styles, triggerFileChange))
  gulp.watch(paths.manifest, gulp.series(manifest, triggerFileChange))
  gulp.watch(paths.images, gulp.series(images, triggerFileChange))
  gulp.watch(paths.markup, gulp.series(markup, triggerFileChange))
}

gulp.task('default', gulp.series(clean, gulp.parallel(scripts, styles, markup, images, manifest)))

gulp.task('dev', gulp.series('default', watch))
