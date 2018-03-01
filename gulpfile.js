var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename      = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del         = require('del'), // Подключаем библиотеку для удаления файлов и папок
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'),
    tinypng = require('gulp-tinypng'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    buffer = require('vinyl-buffer'),
    csso = require('gulp-csso'),
    imagemin = require('gulp-imagemin'),
    merge = require('merge-stream'),
    spritesmith = require('gulp.spritesmith');


var paths = {
    imgForSprites : {
        source : 'img/imgForSprites/*.png',
        output : 'img/'
    }
}


gulp.task('sprite', function () {

    var spriteData = gulp.src(paths.imgForSprites.source).pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
        padding: 20
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.imgForSprites.output));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(gulp.dest(paths.imgForSprites.output));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);

});


gulp.task('compile-sass', function() {
    console.log('we are her');
    return gulp.src('sass/*.scss')
    .pipe(plumber({
        errorHandler: notify.onError(function(error) {
            return {
                title: 'Styles',
                message: error.message
            };
        })}))
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest(''))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('browser-sync', function() {
   browserSync({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: './' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
})

gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('smallimage', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(tinypng('ih-ariE5rz2nf1EGCxUDg6IB0jutVPDK'))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('scripts', function() {
  return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', // Берем jQuer
        'app/libs/simple-scrollbar/dist/simple-scrollbar.js'// Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
})

gulp.task('css-libs', ['compile-sass'], function() {
    return gulp.src('app/css/libs.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('watch', ['browser-sync', 'compile-sass', 'css-libs', 'scripts'], function() {
  gulp.watch('sass/style.scss', ['compile-sass']);
  gulp.watch('*.html', browserSync.reload);
});


gulp.task('build', ['clean', 'smallimage', 'compile-sass', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'app/css/main.css',
        'app/css/libs.min.css'
        ])

    .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest(dist/fonts));

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));

});

gulp.task('default', ['watch']);

gulp.task('clear', function () {
    return cache.clearAll();
})
