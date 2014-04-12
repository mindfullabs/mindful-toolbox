
function grabMouse(d, cb, onUp) {
    d.on('mousedown', function (e) {
        e.preventDefault()
        cb([e.pageX, e.pageY])

        var oldMove = document.onmousemove
        document.onmousemove = function (e) {
            cb([e.pageX, e.pageY])
        }
        
        var oldUp = document.onmouseup
        document.onmouseup = function (e) {
            if (onUp) onUp()
            document.onmousemove = oldMove
            document.onmouseup = oldUp
        }
    })
    d.on('touchstart', function (e) {
        e.preventDefault()
        cb([e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY])

        var oldMove = document.ontouchmove
        document.ontouchmove = function (e) {
            e.preventDefault()
            cb([e.touches[0].pageX, e.touches[0].pageY])
        }

        var oldEnd = document.ontouchend;
        var oldCancel = document.ontouchcancel
        document.ontouchend = document.ontouchcancel = function (e) {
            if (onUp) onUp()
            document.ontouchmove = oldMove
            document.ontouchend = oldEnd
            document.ontouchcancel = oldCancel
        }
    })
}

function grabMouseRelative(d, cb, onUp) {
    var lastPos = null
    grabMouse(d, function (pos) {
        if (lastPos) cb(sub(pos, lastPos))
        lastPos = pos
    }, function () {
        lastPos = null
        if (onUp) onUp()
    })
}

function getStartOfDay(time) {
    var t = new Date(time || _.time())
    t.setHours(0)
    t.setMinutes(0)
    t.setSeconds(0)
    t.setMilliseconds(0)
    return t.getTime()
}

var tau = Math.PI * 2

function zeros(n) {
    var sum = []
    for (var i = 0; i < n; i++)
        sum.push(0)
    return sum
}

function sum(x) {
    var sum = 0
    for (var i = 0; i < x.length; i++)
        sum += x[i]
    return sum
}

function op(x, y, op) {
    var sum = []
    var n = (x instanceof Array) ? x.length : y.length
    for (var i = 0; i < n; i++) {
        sum.push(op(
            (x instanceof Array) ? x[i] : x,
            (y instanceof Array) ? y[i] : y))
    }
    return sum
}

function sub(x, y) {
    return op(x, y, function (x, y) { return x - y })
}

function add(x, y) {
    return op(x, y, function (x, y) { return x + y })
}

function mul(x, y) {
    return op(x, y, function (x, y) { return x * y })
}

function div(x, y) {
    return op(x, y, function (x, y) { return x / y })
}

function dot(x, y) {
    return sum(mul(x, y))
}

function distSq(x) {
    return dot(x, x)
}
magSq = distSq

function dist(x) {
    return Math.sqrt(distSq(x))
}
mag = dist

function norm(x) {
    return div(x, dist(x))
}

function comparator(f, desc) {
    return function (a, b) {
        if (f) {
            a = f(a)
            b = f(b)
        }
        if (a < b) return desc ? 1 : -1
        if (a > b) return desc ? -1 : 1
        return 0
    }
}

function drawShareButtons(message, url, cb) {
    var d = $('<div/>')

    var shares = [
        {
            type : 'facebook',
            img : 'facebook_grey.png',
            url : createFacebookShareLink(url, '', message, '')
        },
        {
            type : 'twitter',
            img : 'twitter_grey.png',
            url : createTwitterShareLink(message + ' ' + url)
        },
        {
            type : 'google+',
            img : 'google_plus_grey.png',
            url : createGooglePlusShareLink(url)
        }
    ]

    _.each(shares, function (share, i) {
        d.append($('<img style="cursor:pointer;' + (i < shares.length - 1 ? 'margin-right:10px' : '') + '"/>').attr('src', share.img).click(function () {
            cb(share.type)
            window.open(share.url, 'share url', 'height=400,width=500,resizable=yes')
        }))
    })

    return d
}

function createFacebookShareLink(url, img, title, summary) {
    return 'http://www.facebook.com/sharer/sharer.php?s=100&p[url]=' + _.escapeUrl(url) + '&p[images][0]=' + _.escapeUrl(img) + '&p[title]=' + _.escapeUrl(title) + '&p[summary]=' + _.escapeUrl(summary)
}

function createTwitterShareLink(tweet) {
    return 'http://twitter.com/home?status=' + _.escapeUrl(tweet)
}

function createGooglePlusShareLink(url) {
    return 'https://plus.google.com/share?url=' + _.escapeUrl(url)
}

function splitSizeHelper2(size) {
    if (size == null) return ""
    if (size <= 1) return Math.round(100 * size) + '%'
    return size + 'px'
}

function splitHorzMedian(aSize, bSize, a, b, median, fill) {
    if (fill === undefined) fill = true
    aSize = _.splitSizeHelper('width', aSize)
    bSize = _.splitSizeHelper('width', bSize)
    mSize = splitSizeHelper2(median)
    var t = $('<table ' + (fill ? 'style="width:100%;height:100%"' : '') + '><tr valign="top"><td class="a" ' + aSize + '></td><td width="' + mSize + '"><div style="width:' + mSize + '"/></td><td class="b" ' + bSize + '></td></tr></table>')
    // don't do this:
    // t.find('.a').append(a)
    // t.find('.b').append(b)
    var _a = t.find('.a')
    var _b = t.find('.b')
    _a.append(a)
    _b.append(b)
    return t
}

function grid(rows) {
    var t = []
    t.push('<table style="width:100%;height:100%">')
    _.each(rows, function (row, y) {
        t.push('<tr height="33.33%">')
        _.each(row, function (cell, x) {
            var c = 'x' + x + 'y' + y
            t.push('<td class="' + c + '" width="33.33%"/>')
        })
        t.push('</tr>')
    })
    t.push('</table>')
    t = $(t.join(''))

    _.each(rows, function (row, y) {
        _.each(row, function (cell, x) {
            var c = 'x' + x + 'y' + y
            t.find('.' + c).append(cell)
        })
    })

    return t
}

function center(me) {
    var t = $('<table style="width:100%;height:100%"><tr><td valign="center" align="center"></td></tr></table>')
    t.find('td').append(me)
    return t
}

$.fn.myAppend = function (args) {
    for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i]
        if (a instanceof Array)
            $.fn.myAppend.apply(this, a)
        else
            this.append(a)
    }
    return this
}

function cssMap(s) {
    var m = {}
    if (s) {
        _.each(s.split(';'), function (s) {
            var a = s.split(':')
            if (a[0])
                m[_.trim(a[0])] = _.trim(a[1])
        })
    }
    return m
}

$.fn.myCss = function (s) {
    return this.css(cssMap(s))
}

$.fn.myHover = function (s, that) {
    var that = that || this
    var m = cssMap(s)
    var old = _.map(m, function (v, k) {
        return that.css(k)
    })
    this.hover(function () {
        that.css(m)
    }, function () {
        that.css(old)
    })
    return this
}

$.fn.addLabel = function (d) {
    if (typeof(d) == "string") d = $('<span/>').text(d)
        
    var id = _.randomString(10, /[a-z]/)
    this.attr('id', id)
    this.after($('<label for="' + id + '"/>').append(d))
    return this
}


function rotate(me, amount) {
    var s = 'rotate(' + amount + 'deg)'
    me.css({
        '-ms-transform' : s,
        '-moz-transform' : s,
        '-webkit-transform' : s,
        '-o-transform' : s
    })
    return me
}

jQuery.fn.extend({
    rotate : function (amount) {
        return this.each(function () {
            rotate($(this), amount)
        })
    },
    enabled : function (yes) {
        if (yes === undefined)
            return !$(this[0]).attr('disabled')
        return this.each(function () {
            if (yes) $(this).removeAttr('disabled')
            else $(this).attr('disabled', 'disabled')
        })
    },
    inDom : function () {
        return $.contains(document.documentElement, this[0])
    }
})

jQuery.fn.extend({
    rotate : function (amount) {
        return this.each(function () {
            rotate($(this), amount)
        })
    }
})

function createThrobber() {
    var d = $('<span/>')
    var anim = [
        '|---',
        '-|--',
        '--|-',
        '---|',
        '--|-',
        '-|--'
    ]
    var start = _.time()
    var i = setInterval(function () {
        if ($.contains(document.documentElement, d[0])) {
            var t = (_.time() - start) / 1000
            t *= 3
            d.text(anim[Math.floor(t % anim.length)])
        } else clearInterval(i)
    }, 30)
    return d
}
