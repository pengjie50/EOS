jQuery('img').on('mousedown', function(e) { e.preventDefault() })
$(function() {
    $(".loader").fadeOut();
    $(".arc-con table").wrap("<div class='tbsc'>")
    $('.toSearch').click(function(e) {
        $(".serpc").fadeIn();
    });
    $('.topser .close').click(function() {
        $(".serpc").fadeOut()
    })
    $('.toSearch2').click(function(e) {
        $(".sermob").fadeIn();
        $('html').removeClass('drawerMenu-open');
        $('.mobNav').slideUp();
    });
    $('.sermob .close').click(function() {
        $(".sermob").fadeOut()
    })
})

$(window).scroll(function() {
    $(".serpc").fadeOut();
    $(".sermob").fadeOut();
    var scrollPos = $(window).scrollTop();
    if (scrollPos > 0) {
        $("body").addClass("scrolling");
    } else {
        $("body").removeClass("scrolling");
    }
    if (scrollPos > 200) {
        $(".navbar").addClass("show");
    } else {
        $(".navbar").removeClass("show");
    }
    if (scrollPos > 600) {
        $(".rightFix").fadeIn();
    } else {
        $(".rightFix").fadeOut();
    }

});
$(function() {
    var scrollPos = $(window).scrollTop();
    if (scrollPos > 0) {
        $("body").addClass("scrolling");
    } else {
        $("body").removeClass("scrolling");
    }
})



$(".hd-nav-btn .navbtn").click(function(e) {
    e.stopPropagation();
    $(this).parent().toggleClass('on');
    return false;
})
$("body").click(function(e) {
    var target = $(e.target);
    if (target.closest(".hd-nav-btn").length != 0) return;
    $(".hd-nav-btn").removeClass('on');
})



$(".navp i").each(function() {
    $(this).click(function() {
        $(this).parent().parent().siblings().find('.subNavm').slideUp();
        $(this).parent().parent().siblings().removeClass('on');
        $(this).parent().parent().toggleClass('on');
        $(this).parent().next().slideToggle();

    })
})




$(".menu-btn").click(function() {
    $('html').toggleClass('drawerMenu-open');
    $('.mobNav').slideToggle();
    $(".sermob").fadeOut()
})


$(".totop").click(function() {
    $('body,html').animate({ scrollTop: 0 }, 500);
    return false;
});

$(".footer .fta .aright dl dd").each(function() {
    $(this).hover(function() {
        var index = $(this).index();
        console.log(index)
        $(this).addClass('on').siblings('dd').removeClass('on')
        $(".footer .fta .aleft .map").eq(index - 1).show().siblings().hide()
    })
})