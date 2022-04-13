const { src, dest, watch, series, parallel } = require('gulp');

// Sass Plugins
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');

// Javascript Plugins
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');

// Misc
const browserSync = require('browser-sync').create();
const rename = require("gulp-rename");
const replace = require('gulp-replace');
const imagemin = require('gulp-imagemin');
const del = require('del');

const path = {
  docs: {
    html: './docs/',
    img: './docs/images/',
    style: './docs/css/',
    script: './docs/js/',
    cachebust: './docs/',
    fonts: './docs/fonts/'
  },
  src: {
    html: './src/**/*.html',
    img: './src/images/**/*.*',
    style: './src/scss/**/*.scss',
    script: './src/js/**/*.js',
    cachebust: './docs/**/*.html',
    fonts: './src/fonts/**/*.*'
  },
  files: {
    script: ['script.js'],
  },
  folder: {
    script: './src/js/',
  },
  clean: './docs'
}

/* Copy Files */
function html() {
  return src(path.src.html).pipe(dest(path.docs.html));
}

/* Cache Busting */
function cacheBust() {
  return src(path.src.cachebust)
    .pipe(replace(/cache_bust=\d+/g, 'cache_bust=' + new Date().getTime()))
    .pipe(dest(path.docs.cachebust));
}

/* Compile sass to css */
function style() {
  return src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(postcss([autoprefixer(),cssnano()]))
    // expanded or compressed
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(path.docs.style))
    .pipe(browserSync.stream());
}

/* Bundle script */
function script(done) {
  path.files.script.map(function(entry) {
    return browserify({
      entries: [
        'node_modules/@popperjs/core/dist/umd/popper.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
        path.folder.script + entry
      ]
    })
    .transform("babelify", {presets: ["@babel/preset-env"]})
    .bundle().on('error', function(err){
      console.log(err.message);
      // end this stream
      this.emit('end');
    })
    .pipe(source(entry))
    .pipe(rename({extname: '.min.js'}))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(dest(path.docs.script))
  });
  browserSync.reload();
  done();
}

/* Fonts */
function fonts() {
  return src(path.src.fonts)
    .pipe(dest(path.docs.fonts));
}

/* Optimize images */
function optimizeImages() {
  return src(path.src.img) // path to image source
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest(path.docs.img)); // output ready files
}

/* Clean task */
async function clean() {
  const deletedFilePaths = await del(path.clean);
 
  console.log('Deleted files:\n', deletedFilePaths.join('\n'));
}

/* Watching files */
function serve() {
  browserSync.init({
    server:  {
      baseDir: "./docs",
    },
    notify: false
  });

  watch(path.src.html, series(html, cacheBust)).on('change', browserSync.reload);
  watch(path.src.style, series(style, cacheBust));
  watch(path.src.script, series(script, cacheBust));
  watch(path.src.img, series(optimizeImages));
  watch(path.src.fonts, series(fonts));
}

/* Export Tasks */
exports.cacheBust = cacheBust;
exports.html = html;
exports.style = style;
exports.script = script;
exports.fonts = fonts;
exports.clean = clean;
exports.optimizeImages = optimizeImages;
exports.serve = serve;

exports.build = series(
  parallel(html, style, script, optimizeImages, fonts),
  cacheBust,
  serve
);

exports.prod = series(
  clean,
  parallel(html, style, script, optimizeImages, fonts),
  cacheBust
);

/* exports.default = series(
  clean,
  parallel(html, style, script, optimizeImages, fonts),
  cacheBust,
  serve
); */

/**
 * Running the project commande:
 * dev: "gulp build"
 * prod: "gulp prod"
 * 
 * Running each task individually,
 * example optimizing the images.
 * Commande: "gulp optimizeImages"
 */

/**
 * commandes to build: npm run build
 * commandes to prod: npm run prod
 */