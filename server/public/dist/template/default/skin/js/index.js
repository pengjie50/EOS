function goTop() {
    $('html,body').animate({ 'scrollTop': 0 }, 600);
}
$(function() {
    if (!(/msie [6|7|8|9]/i.test(navigator.userAgent))) {
        new WOW().init();
    };


    $(".sz-kefu .kf1").click(function() {
        $('.sz-kefu .qq').find(".sidebox").stop().animate({ "right": "0" }, 160);
        $(this).find(".sidebox").stop().animate({ "right": "-50px" }, 160);
    });
    $(".sz-kefu .qq .close").click(function() {
        $('.sz-kefu .qq').find(".sidebox").stop().animate({ "right": "-150px" }, 160);
        $('.sz-kefu .kf1').find(".sidebox").stop().animate({ "right": "0" }, 160);
    });
    $(".sz-kefu .kf3").hover(function() {
        $(this).find(".sidebox").stop().animate({ "width": "130px" }, 160);
        $(this).find(".sidebox3").stop().animate({ "width": "200px" }, 160);
    }, function() {
        $(this).find(".sidebox").stop().animate({ "width": "50px" }, 160);
    });
    $('.sz-kefu .kf2').hover(function() {
        $(this).find('.kf_wx').fadeIn();
    }, function() {
        $(this).find('.kf_wx').fadeOut();
    });

    $('.scnum').countUp();
    var banner = new Swiper('.in-banner', {
        speed: 1000,
        loop: true,
        spaceBetween: 0,
        autoplay: { delay: 5000, stopOnLastSlide: false, disableOnInteraction: false, },
        pagination: {
            el: '.main-banner .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.main-banner .next',
            prevEl: '.main-banner .prev',
        }
    });
    $(".homec ul li").hover(function() {
        $(this).addClass("hover").siblings().removeClass('hover')
        //$(this).stop().animate({width:"40%"},500).siblings().stop().animate({width:"20%"},100);
    });
    // $(".homeb .aleft dl").hover(function() {
    //     $(this).addClass("on").siblings("dl").removeClass('on')
    // });
    $(".homed ul li").hover(function() {
        $(this).addClass("on").siblings().removeClass('on')
    });




    // swiper-container-honor
    var swiperMuscle = new Swiper('.swiper-container-muslce', {
        slidesPerView: 5,
        spaceBetween: 7,
        autoplay: true,
        loop: true,
        pagination: {
            el: '.swiper-container-muslce .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-container-muslce .next',
            prevEl: '.swiper-container-muslce .prev',
        },
        breakpoints: {
            1024: {
                slidesPerView: 3,
            },
            768: {
                slidesPerView: 3,
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 5,
            }
        },
    })

    // 鹏丰精密五金-首页产品
    var swiperTabPro = new Swiper('.swiper-container-pro', {
        spaceBetween: 0,
        speed: 500,
        autoHeight: true,
        on: {
            slideChangeTransitionStart: function() {
                $(".in-pro-cate li").eq(this.realIndex).addClass('on').siblings().removeClass('on');
            }
        }
    });
    $(".in-pro-cate li").mouseover(function(e) {
        e.preventDefault()
        $(this).addClass('on').siblings().removeClass('on');
        swiperTabPro.slideTo($(this).index())
    })

    // 鹏丰精密五金-首页优势
    var swiperTabYs = new Swiper('.swiper-container-ys', {
        spaceBetween: 0,
        speed: 500,
        autoHeight: true,
        on: {
            slideChangeTransitionStart: function() {
                $(".ys-cate li").eq(this.realIndex).addClass('on').siblings().removeClass('on');
            }
        }
    });
    $(".ys-cate li").mouseover(function(e) {
        e.preventDefault()
        $(this).addClass('on').siblings().removeClass('on');
        swiperTabYs.slideTo($(this).index())
    })

    // 鹏丰精密五金-首页新闻
    var swiperTabNews = new Swiper('.swiper-container-innews', {
        spaceBetween: 30,
        speed: 500,
        autoHeight: true,
        on: {
            slideChangeTransitionStart: function() {
                $(".in-news-cate li").eq(this.realIndex).addClass('on').siblings().removeClass('on');
            }
        }
    });
    $(".in-news-cate li").mouseover(function(e) {
        e.preventDefault()
        $(this).addClass('on').siblings().removeClass('on');
        swiperTabNews.slideTo($(this).index())
    })


    var swiperTabShili = new Swiper('.swiper-container-baozhang', {
        autoplay: false,
        loop: false,
        speed: 500,
        // spaceBetween: 20,
        on: {
            slideChangeTransitionStart: function() {
                $(".baozhang-tit .on").removeClass('on');
                $(".baozhang-tit li").eq(this.activeIndex).addClass('on');
            }
        },
        navigation: {
            nextEl: '.swiper-container-baozhang .next',
            prevEl: '.swiper-container-baozhang .prev',
        },
    });
    $(".baozhang-tit li").on('mouseover', function(e) {
        e.preventDefault();
        $(".baozhang-tit li.on").removeClass('on');
        $(this).addClass('on');
        swiperTabShili.slideTo($(this).index());
    })

    var swiperOdmpzTit = new Swiper('.swiper-container-odmpztit', {
        autoplay: false,
        speed: 500,
        slidesPerView: 1,
        centeredSlides: true,
        centeredSlidesBounds: true,
        loop: true,
        spaceBetween: 20,
    });
    var swiperOdmpz = new Swiper('.swiper-container-odmpz', {
        controller: {
            control: swiperOdmpzTit
        },
        spaceBetween: 20,
        autoplay: true,
        loop: true,
        speed: 500,
        on: {
            slideChangeTransitionStart: function() {
                $(".baozhang-tit .on").removeClass('on');
                $(".baozhang-tit li").eq(this.activeIndex).addClass('on');
            }
        },
        navigation: {
            nextEl: '.swiper-container-odmpz .next',
            prevEl: '.swiper-container-odmpz .prev',
        },
    });

    // 企业文化切换
    var swiperTabQywh = new Swiper('.swiper-container-qywh', {
        autoplay: false,
        loop: false,
        speed: 500,
        on: {
            slideChangeTransitionStart: function() {
                $(".qywh-tit .on").removeClass('on');
                $(".qywh-tit .item").eq(this.activeIndex).addClass('on');
            }
        }
    });
    $(".qywh-tit .item").on('mouseover', function(e) {
        e.preventDefault();
        $(".qywh-tit .item.on").removeClass('on');
        $(this).addClass('on');
        swiperTabQywh.slideTo($(this).index());
    })

    // 荣誉资质 swiper-container-ryzz
    var swiperRyzz = new Swiper('.swiper-container-ryzz', {
        autoplay: { delay: 4000, stopOnLastSlide: false, disableOnInteraction: false, },
        speed: 500,
        slidesPerView: 4,
        spaceBetween: 25,
        loop: true,
        breakpoints: {
            1024: {
                slidesPerView: 3,
            },
            768: {
                slidesPerView: 3,
            },
            640: {
                slidesPerView: 1,
                spaceBetween: 10,
            }
        },
        navigation: {
            nextEl: '.ryzz .swp-wrap .next',
            prevEl: '.ryzz .swp-wrap .prev',
        },
    });

    // 荣誉资质 swiper-container-hjsb
    var swiperHjsb = new Swiper('.swiper-container-hjsb', {
        autoplay: { delay: 4000, stopOnLastSlide: false, disableOnInteraction: false, },
        speed: 500,
        slidesPerView: 4,
        spaceBetween: 25,
        loop: true,
        breakpoints: {
            1024: {
                slidesPerView: 3,
            },
            768: {
                slidesPerView: 3,
            },
            640: {
                slidesPerView: 1,
                spaceBetween: 10,
            }
        },
        navigation: {
            nextEl: '.hjsb .swp-wrap .next',
            prevEl: '.hjsb .swp-wrap .prev',
        },
    });

    // swiper-container-album
    // swiper-container-big
    var gallerySmall = new Swiper('.swiper-container-album', {
        direction: 'vertical',
        spaceBetween: 10,
        slidesPerView: 'auto',
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        autoplay: false,
        navigation: {
           nextEl: '.album-small .next',
           prevEl: '.album-small .prev',
        }
    });
    var galleryBig = new Swiper('.swiper-container-big', {
        spaceBetween: 0,
        autoplay: false,
        noSwiping: true,
        thumbs: {
            swiper: gallerySmall
        },
        breakpoints: {
            768: {
                pagination: {
                    el: '.swiper-container-big .swiper-pagination',
                    clickable: true,
                },
            },
        }
    });
    $(".swiper-container-album .swiper-slide").click(function(){
        $(this).addClass("on").siblings().removeClass("on");
    })















    




    var swiper_product_caseslide = new Swiper('.swiper-container-caseslide', {
        slidesPerView: 1,
        spaceBetween: 0,
        autoplay: true,
        autoplay: {
            delay: 6000
        },
        loop: true,
        speed: 800,
        pagination: {
            el: '.swiper-container-caseslide .swiper-pagination',
            type: 'fraction',
        },
        navigation: {
            nextEl: '.swiper-container-caseslide .next',
            prevEl: '.swiper-container-caseslide .prev',
        },
    })



    var aboutPicList = new Swiper('.aboutPicList', {
        autoplay: { delay: 4000, stopOnLastSlide: false, disableOnInteraction: false, },
        speed: 400,
        slidesPerView: 2,
        centeredSlides: true,
        centeredSlidesBounds: true,
        loop: true,
        breakpoints: {
            1024: {
                slidesPerView: 3,
            },
            768: {
                slidesPerView: 3,
            },
            640: {
                slidesPerView: 1,
                spaceBetween: 10,
            }
        },
        navigation: {
            nextEl: '.aboutPicList .next',
            prevEl: '.aboutPicList .prev',
        },
    });

    // swiper-container-honor
    var swiper_honor = new Swiper('.swiper-container-honor', {
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: true,
        autoplay: {
            delay: 6000
        },
        loop: true,
        speed: 800,
        pagination: {
            el: '.honor-slide .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.honor-slide .next',
            prevEl: '.honor-slide .prev',
        },
    })
})