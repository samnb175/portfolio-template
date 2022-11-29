const { src, dest, watch, series, parallel } = require('gulp');

/********************************************************
    SASS Plugins
********************************************************/
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const postscss = require('postcss-scss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const purge = require('gulp-purgecss');

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
const args = require('yargs').argv; // environment variables

/********************************************************
    Path variables
********************************************************/
const SassOutputStyle = args.env === 'production' ? 'compressed' : 'expanded';

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
    img: './src/images/**/*',
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
    .pipe(postcss([autoprefixer(),cssnano()], {parser: postscss}))
    // expanded or compressed
    .pipe(sass({outputStyle: SassOutputStyle}).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(path.docs.style))
    .pipe(browserSync.stream());
}

/********************************************************
    Purge UnusedCSS
********************************************************/ 
function purgeCSS() {
  return src(path.docs.style + "*.min.css")
    // .pipe(
    //   rename({
    //     suffix: ".rejected",
    //   })
    // )
    .pipe(
      purge({
        content: [path.docs.html + '**/*.html'],
        // keyframes: true,
        // variables: true,
        // rejected: true,
        // safelist: [
        //   /col-[a-z\-0-9]+/gi,
        //   /alert-[a-z-0-9]+/g,
        //   /navbar-[a-z\-0-9]+/gi, // navbar-expand-(sizes)
        //   /nav-[a-z\-0-9]+/gi, // nav-item, nav-link
        //   /close+/g,
        //   /collaps?(e|ing)+/g,
        // ],
        // whitelistPatterns: [
        //   /-(leave|enter|appear)(|-(to|from|active))$/,
        //   /^(?!(|.*?:)cursor-move).+-move$/,
        //   /^router-link(|-exact)-active$/,
        // ],
      })
    )
    .pipe(dest(path.docs.style));
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
        'node_modules/@glidejs/glide/dist/glide.min.js',
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
  fontawesome()
  return src(path.src.fonts)
    .pipe(dest(path.docs.fonts));
}

/********************************************************
    Copy Fontawesome to docs folder
********************************************************/
function fontawesome() {
  return src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(dest(path.docs.fonts + 'webfonts/'));
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

  watch(path.src.html, series(html, style,/*  purgeCSS, */ cacheBust)).on('change', browserSync.reload);
  watch(path.src.style, series(style,/*  purgeCSS, */ cacheBust));
  watch(path.src.script, series(script, cacheBust));
  watch(path.src.img, series(optimizeImages));
  watch(path.src.fonts, series(fonts));
}

/********************************************************
    Export Tasks
********************************************************/
exports.html = html;
exports.style = style;
exports.purgeCSS = purgeCSS;
exports.script = script;
exports.optimizeImages = optimizeImages;
exports.fonts = fonts;
exports.cacheBust = cacheBust;
exports.clean = clean;
exports.serve = serve;

exports.dev = series(
  parallel(html, style, script, optimizeImages, fonts),
  /* purgeCSS, */
  cacheBust,
  serve
);

exports.prod = series(
  clean,
  parallel(html, style, script, optimizeImages, fonts),
  purgeCSS,
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