const { src, dest, watch, series, parallel } = require('gulp');

/********************************************************
    SASS Plugins
********************************************************/
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

/********************************************************
    Javascript Plugins
********************************************************/
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');

/********************************************************
    Misc Plugins
********************************************************/
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const rename = require("gulp-rename");
const replace = require('gulp-replace');
const imagemin = require('gulp-imagemin');
const del = require('del');

/********************************************************
    Path variables
********************************************************/
const destFolder = './docs';
const path = {
  docs: {
    html: `${destFolder}/`,
    img: `${destFolder}/images/`,
    style: `${destFolder}/css/`,
    script: `${destFolder}/js/`,
    cachebust: `${destFolder}/`,
    fonts: `${destFolder}/fonts/`
  },
  src: {
    html: './src/**/*.html',
    img: './src/images/**/*.*',
    style: './src/scss/**/*.scss',
    script: './src/js/**/*.js',
    cachebust: `${destFolder}/**/*.html`,
    fonts: './src/fonts/**/*.*'
  },
  files: {
    script: ['script.js'],
  },
  folder: {
    script: './src/js/',
  },
  clean: `${destFolder}`
}

/********************************************************
    Copy HTML Files
    from src folder to docs folder
********************************************************/
function html() {
  return src(path.src.html).pipe(dest(path.docs.html));
}

/********************************************************
    Cache Busting
********************************************************/
function cacheBust() {
  return src(path.src.cachebust)
    .pipe(replace(/cache_bust=\d+/g, 'cache_bust=' + new Date().getTime()))
    .pipe(dest(path.docs.cachebust));
}

/********************************************************
    Compile SASS to CSS
********************************************************/
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

/********************************************************
    Bundle script
********************************************************/
function script(done) {
  path.files.script.map(entry => {
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

/********************************************************
    Copy Fonts to docs folder
********************************************************/
function fonts() {
  return src(path.src.fonts)
    .pipe(dest(path.docs.fonts));
}

/********************************************************
    Optimize images
********************************************************/
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

/********************************************************
    Clean task - delete docs folder
********************************************************/
async function clean() {
  const deletedFilePaths = await del(path.clean);
 
  console.log('Deleted files:\n', deletedFilePaths.join('\n'));
}

/********************************************************
    Watching files
********************************************************/
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

/********************************************************
    Export Tasks
********************************************************/
exports.html = html;
exports.style = style;
exports.script = script;
exports.optimizeImages = optimizeImages;
exports.fonts = fonts;
exports.cacheBust = cacheBust;
exports.clean = clean;
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

/**
 * Running the project command:
 * For development: npm run dev
 * For production: npm run prod
 * 
 * Running each task individually, example optimizing the images.
 * Command: gulp optimizeImages
 * 
 * To delete destination folder(docs).
 * Command: npm run clean
 */