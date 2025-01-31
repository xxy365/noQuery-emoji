(function (DOMQuery, window, document) {

    let PLUGIN_NAME = 'emoji',
        VERSION = '0.0.1',
        DEFAULTS = {
            showTab: true,
            animation: 'fade',
            icons: []
        };

    window.emoji_index = 0;

    function Plugin(element, options) {
        this.$content = $(element);
        this.options = options;
        this.index = window.emoji_index;
        switch (options.animation) {
            case 'none':
                this.showFunc = 'show';
                this.hideFunc = 'hide';
                this.toggleFunc = 'toggle';
                break;
            case 'slide':
                this.showFunc = 'slideDown';
                this.hideFunc = 'slideUp';
                this.toggleFunc = 'slideToggle';
                break;
            case 'fade':
                this.showFunc = 'fadeIn';
                this.hideFunc = 'fadeOut';
                this.toggleFunc = 'fadeToggle';
                break;
            default:
                this.showFunc = 'fadeIn';
                this.hideFunc = 'fadeOut';
                this.toggleFunc = 'fadeToggle';
                break;
        }
        this._init();
    }

    Plugin.prototype = {
        _init: function () {
            let that = this;
            let btn = this.options.button;
            let newBtn,
                contentTop,
                contentLeft,
                btnTop,
                btnLeft;
            let ix = that.index;
            if (!btn) {
                newBtn = '<input type="image" class="emoji_btn" id="emoji_btn_' + ix + '" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZBAMAAAA2x5hQAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUxpcfTGAPTGAPTGAPTGAPTGAPTGAPTGAPTGAPTGAPTGAPTGAOfx6yUAAAALdFJOUwAzbVQOoYrzwdwkAoU+0gAAAM1JREFUGNN9kK0PQWEUxl8fM24iCYopwi0muuVuzGyKwATFZpJIU01RUG/RBMnHxfz+Oef9uNM84d1+23nO+zxHKVG2WWupRJkdcAwtpCK0lpbqWE01pB0QayonREMoIp7AawQrWSgGGb4pn6dSeSh68FAVXqHqy3wKrkJiDGDTg3dnp//w+WnwlwIOJauF+C7sXRVfdha4O4oIJfTbtdSxs2uqhs585A0ko8iLTMEcDE1n65A+29pYAlr72nz9dKu7GuNTcsL2fDQzB/wCPVJ69nZGb3gAAAAASUVORK5CYII="/>';
                contentTop = this.$content.offset().top + this.$content.outerHeight() + 10;
                contentLeft = this.$content.offset().left + 2;
                $(newBtn).appendTo('body');
                $('#emoji_btn_' + ix).css({ 'top': contentTop + 'px', 'left': contentLeft + 'px' });
                btn = '#emoji_btn_' + ix;
            }

            let showTab = this.options.showTab;
            let basePath = this.options.basePath;
            let iconsGroup = this.options.icons;
            let groupLength = iconsGroup.length;
            if (groupLength === 0) {
                console.error('表情图路径读取失败');
                return false;
            }

            let emoji_container = '<div class="emoji_container" id="emoji_container_' + ix + '">';
            let emoji_content = '<div class="emoji_content">';
            let emoji_tab = '<div class="emoji_tab" style="' + (groupLength === 1 && !showTab ? 'display:none;' : '') + '"><div class="emoji_tab_prev"></div><div class="emoji_tab_list"><ul>';
            let panel,
                name,
                path,
                maxNum,
                excludeNums,
                file,
                placeholder,
                emoji,
                index,
                notation;
            for (let i = 0; i < groupLength; i++) {
                name = iconsGroup[i].name || 'group' + (i + 1);
                path = basePath + '/' + iconsGroup[i].path;
                maxNum = iconsGroup[i].maxNum;  // 表情最大数
                excludeNums = iconsGroup[i].excludeNums;    // 要排除的
                file = iconsGroup[i].file || '.jpg';
                placeholder = iconsGroup[i].placeholder || '#em' + (i + 1) + '_{alias}#';
                emoji = iconsGroup[i].emoji;    // 表情数据列表 [显示名:文件名]
                index = 0;
                if (!path) {
                    console.error('第 ' + i + ' 组表情未配置图片路径 path');
                    continue;
                }
                panel = '<div id="emoji' + i + '" class="emoji_icons" style="' + (i === 0 ? '' : 'display:none;') + '"><ul>';

                if (emoji) {    // 指定了emoji 数组
                    if (typeof emoji !== 'object') {
                        console.error('第 ' + i + ' 组 emoji 参数设置不正确');
                        break;
                    }
                    maxNum = maxNum || emoji.length;
                    // 循环添加表情
                    for (let tmp in emoji) {
                        // 添加过滤条件
                        if (!emoji.hasOwnProperty(tmp)) continue;
                        index++;

                        if (index > maxNum || (excludeNums && excludeNums.indexOf(index) >= 0)) {
                            continue;  // 排除要排除的表情
                        }

                        notation = placeholder.replace(new RegExp('{alias}', 'gi'), tmp.toString());
                        panel += '<li><a data-emoji_code="' + notation + '" data-index="' + index + '" title="' + tmp + '"><img src="' + path + emoji[tmp] + file + '"/></a></li>';
                    }
                } else {
                    if (!maxNum) {
                        console.error('请指定 ' + i + ' 组表情 maxNum');
                        continue;
                    }

                    for (let j = 1; j <= maxNum; j++) {

                        if (excludeNums && excludeNums.indexOf(j) >= 0) {
                            continue;  // 排除要排除的表情
                        }

                        notation = placeholder.replace(new RegExp('{alias}', 'gi'), j.toString());
                        panel += '<li><a data-emoji_code="' + notation + '" data-index="' + j + '"><img src="' + path + j + file + '"/></a></li>';
                    }
                }


                panel += '</ul></div>';
                emoji_content += panel;
                emoji_tab += '<li data-emoji_tab="emoji' + i + '" class="' + (i === 0 ? 'selected' : '') + '" title="' + name + '">' + name + '</li>';
            }
            emoji_content += '</div>';
            emoji_tab += '</ul></div><div class="emoji_tab_next"></div></div>';
            let emoji_preview = '<div class="emoji_preview"><img/></div>';
            emoji_container += emoji_content;
            emoji_container += emoji_tab;
            emoji_container += emoji_preview;
            $(emoji_container).appendTo('body');
            btnTop = $(btn).offset().top + $(btn).outerHeight() + 5;
            btnLeft = $(btn).offset().left;
            let emoji_id = '#emoji_container_' + ix;
            $(emoji_id).css({ 'top': btnTop + 'px', 'left': btnLeft + 'px' });

            let pageCount = groupLength % 8 === 0 ? parseInt(groupLength / 8) : parseInt(groupLength / 8) + 1;
            let pageIndex = 1;
            $(document).click(function (e) {
                let target = e.target;
                let field = that.$content.elements[0];
                let code,
                    tab,
                    imgSrc,
                    insertHtml;
                if (target === $(btn).elements[0]) {
                    $(emoji_id)[that.toggleFunc]();
                    // that.$content.focus();
                } else if ($(target).parents(emoji_id).length > 0) {
                    code = $(target).data('emoji_code') || $(target).parent().data('emoji_code');
                    tab = $(target).data('emoji_tab');
                    if (code) {
                        if (field.nodeName === 'DIV') {
                            imgSrc = $(emoji_id + ' a[data-emoji_code="' + code + '"] img').attr('src');
                            insertHtml = '<img class="emoji_icon" src="' + imgSrc + '"/>';
                            that._insertAtCursor(field, insertHtml, false);
                        } else {
                            that._insertAtCursor(field, code);
                        }
                        that.hide();
                        that.$content.focus();
                    } else if (tab) {
                        if (!$(target).hasClass('selected')) {
                            $(emoji_id + ' .emoji_icons').hide();
                            $(emoji_id + ' #' + tab).show();
                            $(target).addClass('selected').siblings().removeClass('selected');
                        }
                    } else if ($(target).hasClass('emoji_tab_prev')) {
                        if (pageIndex > 1) {
                            $(emoji_id + ' .emoji_tab_list ul').css('margin-left', ('-503' * (pageIndex - 2)) + 'px');
                            pageIndex--;
                        }

                    } else if ($(target).hasClass('emoji_tab_next')) {
                        if (pageIndex < pageCount) {
                            $(emoji_id + ' .emoji_tab_list ul').css('margin-left', ('-503' * pageIndex) + 'px');
                            pageIndex++;
                        }
                    }
                    // that.$content.focus();
                } else if ($(emoji_id + ':visible').length > 0) {
                    // 如果是显示的，那么就隐藏起来
                    that.hide();
                    that.$content.focus();
                }
            });

            $(emoji_id + ' .emoji_icons a').mouseenter(function () {
                if (($(this).offset().left - $(emoji_id).offset().left) * 2 < $(emoji_id).width()) {
                    $(emoji_id + ' .emoji_preview').css({ 'left': 'auto', 'right': 0 });
                } else {
                    $(emoji_id + ' .emoji_preview').css({ 'left': 0, 'right': 'auto' });
                }
                let src = $(this).find('img').attr('src');
                $(emoji_id + ' .emoji_preview img').attr('src', src).parent().show();
            });

            $(emoji_id + ' .emoji_icons a').mouseleave(function () {
                $(emoji_id + ' .emoji_preview img').removeAttr('src').parent().hide();
            });


        },

        _insertAtCursor: function (field, value, selectPastedContent) {
            let sel, range;
            if (field.nodeName === 'DIV') {
                field.focus();
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        range.deleteContents();
                        let el = document.createElement('div');
                        el.innerHTML = value;
                        let frag = document.createDocumentFragment(), node, lastNode;
                        while ((node = el.firstChild)) {
                            lastNode = frag.appendChild(node);
                        }
                        let firstNode = frag.firstChild;
                        range.insertNode(frag);

                        if (lastNode) {
                            range = range.cloneRange();
                            range.setStartAfter(lastNode);
                            if (selectPastedContent) {
                                range.setStartBefore(firstNode);
                            } else {
                                range.collapse(true);
                            }
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                } else if ((sel = document.selection) && sel.type !== 'Control') {
                    let originalRange = sel.createRange();
                    originalRange.collapse(true);
                    sel.createRange().pasteHTML(html);
                    if (selectPastedContent) {
                        range = sel.createRange();
                        range.setEndPoint('StartToStart', originalRange);
                        range.select();
                    }
                }
            } else {
                if (document.selection) {
                    field.focus();
                    sel = document.selection.createRange();
                    sel.text = value;
                    sel.select();
                }
                else if (field.selectionStart || field.selectionStart === 0) {
                    let startPos = field.selectionStart;
                    let endPos = field.selectionEnd;
                    let restoreTop = field.scrollTop;
                    field.value = field.value.substring(0, startPos) + value + field.value.substring(endPos, field.value.length);
                    if (restoreTop > 0) {
                        field.scrollTop = restoreTop;
                    }
                    field.focus();
                    field.selectionStart = startPos + value.length;
                    field.selectionEnd = startPos + value.length;
                } else {
                    field.value += value;
                    field.focus();
                }
            }

        },

        show: function () {
            $('#emoji_container_' + this.index)[this.showFunc]();
        },

        hide: function () {
            $('#emoji_container_' + this.index)[this.hideFunc]();
        },

        toggle: function () {
            $('#emoji_container_' + this.index)[this.toggleFunc]();
        }
    };

    DOMQuery.prototype.extend(PLUGIN_NAME, function fn(option) {
        return this.each(function () {
            window.emoji_index++;
            let $this = $(this);
            let data_key = 'plugin_' + PLUGIN_NAME + window.emoji_index;
            let data = $this.data(data_key);
            let options = $.extend({}, DEFAULTS, typeof option === 'object' && option);
            if (!data) $this.data(data_key, (data = new Plugin(this, options)));
            if (typeof option === 'string') data[option]();
        });
    });
}(DOMQuery, window, document));

(function (DOMQuery) {
    let PLUGIN_NAME = 'emojiParse',
        VERSION = '0.0.1',
        DEFAULTS = {
            icons: []
        };

    function Plugin(element, options) {
        this.$content = $(element);
        this.options = options;
        this._init();
    }

    Plugin.prototype = {
        _init: function () {
            let that = this;
            let iconsGroup = this.options.icons;
            let basePath = this.options.basePath;
            let groupLength = iconsGroup.length;
            let path,
                file,
                placeholder,
                emoji,
                pattern,
                regexp;
            if (groupLength > 0) {

                for (let i = 0; i < groupLength; i++) {
                    path = basePath + '/' + iconsGroup[i].path;
                    file = iconsGroup[i].file || '.jpg';
                    placeholder = iconsGroup[i].placeholder;
                    placeholder = placeholder.replace('[', '\\[');
                    placeholder = placeholder.replace(']', '\\]');
                    placeholder = placeholder.replace('(', '\\(');
                    placeholder = placeholder.replace(')', '\\)');

                    emoji = iconsGroup[i].emoji;
                    if (!path) {
                        console.error('第 ' + i + ' 组表情未配置图片路径 path');
                        continue;
                    }

                    if (emoji) {

                        if (typeof emoji !== 'object') {
                            console.error('第 ' + i + ' 组 emoji 参数设置不正确');
                            break;
                        }

                        pattern = placeholder.replace(new RegExp('{alias}', 'gi'), '([\\s\\S]+?)');

                        regexp = new RegExp(pattern, 'gm');
                        that.$content.html(that.$content.html().replace(regexp, function ($0, $1) {
                            let n = emoji[$1];
                            if (n) {
                                return '<img class="wp-smiley" src="' + path + n + file + '" title="' + $1 + '" alt="' + $1 + '"/>';
                            } else {
                                return $0;
                            }
                        }));
                    } else {
                        pattern = placeholder.replace(new RegExp('{alias}', 'gi'), '(\\d+?)');
                        that.$content.html(that.$content.html().replace(new RegExp(pattern, 'gm'), '<img class="wp-smiley" src="' + path + '$1' + file + '"/>'));
                    }

                }
            }
        }
    };
    DOMQuery.prototype.extend(PLUGIN_NAME, function fn(option) {
        return this.each(function () {
            let $this = $(this);
            let data = $this.data('plugin_' + PLUGIN_NAME);
            let options = $.extend({}, DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data) $this.data('plugin_' + PLUGIN_NAME, (data = new Plugin(this, options)));
            if (typeof option === 'string') data[option]();
        });
    });


})(DOMQuery);