/************************************************************
 * Project:     企业邮二级页面侧边栏锚点定位
 ************************************************************/
;(function($, window, document,undefined) {

    var defaults = {
        threshold:100, //
        prefixH : 0, //预留高度
        floorWrap: undefined, //楼层选项容器
        floorSelector: undefined,  //楼层类名
        speen: 500 //速度
    }
    var floorWrap= undefined, //楼层选项容器
        floorSelector= undefined,  //楼层类名
        idx = 0 ;

    $.fn.lift = function(options) {
        var opts = $.extend({}, defaults, options);
            floorWrap = opts.floorWrap;
            floorSelector = opts.floorSelector;

        var f1 = $(floorSelector).eq(0).offset().top;
        var fs = $(floorWrap).find('.item').size();
        var fss = new Array();
        for (i = 0; i < fs; i++) {
            fss[i] = $(floorSelector).eq(i).offset().top - opts.prefixH;
        }

        $(floorWrap).find('.item').each(function(index){
            $(this).addClass('lift-emit');
            $(this).on('click',function(e){
                e.preventDefault();
                idx = index;
                gotofloor();
            });
        });

        $(window).scroll(function(){
            var currentTOP = $(window).scrollTop();

            if (currentTOP <= f1) {
                $('.lift-emit').removeClass('on').eq(0).addClass('on');
            }else{
                changefl(getFloor(currentTOP + opts.threshold));
            }
        });

        var gotofloor = function() {
            $('.lift-emit').removeClass('on').eq(idx).addClass('on');
            var pos =  $(floorSelector).eq(idx).offset().top - opts.prefixH;// 获取该点到头部的距离
            $("html,body").animate({
                scrollTop : pos
            }, opts.speen);
        }

        function getFloor(fh){
            if(fs==0||fh<=f1){
                return idx = 0;
            }
            if(fh>=fss[fs-1]){
                return idx = fs - 1;
            }
            for (k=1; k<fs;k++) {
                if(fh>=fss[k-1]&&fh<fss[k]){
                    return idx = k-1;
                }
            }
        }
        function changefl(i){
            $('.lift-emit').removeClass('on').eq(idx).addClass('on');
        }
    }
})(jQuery, window, document);
