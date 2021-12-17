export class Banner {
    constructor() { this.banners = new Array(); this.Get(); }
    Get() {
        let self = this;
        $.ajax({
            url: '../Aplicaciones2/api/Banner/', cache: !1, type: 'get', dataType: 'json',
            success: function (data) { self.Draw(data); }
        });
    }
    Draw(banners) {
        for (let banner of banners) {
            let ban = $("<div/>");
            ban.addClass('banner-explora');
            ban.attr("data-order", banner.Order);
            ban.css({
                "background": "url(" + banner.Url + ") center center no-repeat",
                "z-index": "99"
            });
            if (banner.Order == 0)
                ban.show();
            $('#bannerRotativo').append(ban);
        }
        if (banners.length > 0) {
            let bClose = $('<div/>');
            bClose.css({
                "position": "absolute",
                "top": 0,
                "right": "30px",
                "font-size": "18px",
                "z-index": 999,
                "width": "25px",
                "height": "25px",
                "cursor": "pointer"
            });
            bClose.addClass('btn-close-banner');
            bClose.html("<i class='fa fa-times'></i>");
            $('#bannerRotativo').append(bClose);
        }
    }
}
