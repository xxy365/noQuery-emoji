function $(selector) {
    // 如果是 HTML 字符串，创建新元素
    if (typeof selector === 'string' && selector.startsWith('<') && selector.endsWith('>')) {
        try {
            const template = document.createElement('template');
            template.innerHTML = selector.trim(); // 去除空白字符
            return new DOMQuery(template.content.childNodes);
        } catch (error) {
        }
    } else if (selector === document) {
        return new DOMQuery([document]);
    }
    // 否则，按选择器查找元素
    return new DOMQuery(selector);
}
// 静态方法：$.extend
$.extend = function (target, ...sources) {
    if (!target) target = {}; // 如果未提供目标对象，创建一个空对象
    for (const source of sources) {
        if (source && typeof source === 'object') {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    // 如果是深拷贝且属性值是对象，递归合并
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        target[key] = $.extend(target[key] || {}, source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        }
    }
    return target;
};
// 元素可见度
function isVisible(ele) {
    let style = window.getComputedStyle(ele);
    return style.width !== '0' &&
        style.height !== '0' &&
        style.opacity !== '0' &&
        style.display !== 'none' &&
        style.visibility !== 'hidden';
}

class DOMQuery {
    constructor(selector) {
        this.elements = []; // 存储匹配的元素
        this._dataCache = new WeakMap(); // 使用 WeakMap 存储每个元素的缓存数据

        if (typeof selector === 'string') {
            if (selector.includes(':visible')) {
                const baseSelector = selector.replace(':visible', ''); // 去掉 :visible
                const elements = document.querySelectorAll(baseSelector); // 查找基础选择器匹配的元素
                this.elements = Array.from(elements).filter(isVisible); // 过滤出可见的元素
            } else {
                // 普通选择器
                this.elements = Array.from(document.querySelectorAll(selector));
            }
        } else if (selector instanceof Element) {
            this.elements = [selector];
        } else if (selector instanceof NodeList || selector instanceof Array || selector instanceof HTMLCollection) {
            this.elements = Array.from(selector);
        } else {
            this.elements = [];
        }
        // 初始化每个元素的缓存
        this.elements.forEach(element => {
            if (!this._dataCache.has(element)) {
                this._dataCache.set(element, {});
            }
        });
    }

    /**
     * 获取匹配的元素数量
     * @returns {number} 元素的数量
     */
    get length() {
        return this.elements.length;
    }

    /**
 * 获取匹配元素的兄弟节点
 * @param {string} [selector] - 可选的选择器字符串，用于过滤兄弟节点
 * @returns {DOMQuery} 包含兄弟节点的新 DOMQuery 实例
 * @example
 * $('.element').siblings('li'); // 获取所有li类型的兄弟节点
 */
    siblings(selector) {
        const siblings = []; // 存储所有兄弟节点

        // 遍历每个匹配的元素
        this.elements.forEach(element => {
            const parent = element.parentElement; // 获取当前元素的父节点
            if (parent) {
                // 获取父节点的所有子元素，并排除当前元素本身
                const allSiblings = Array.from(parent.children).filter(sibling => sibling !== element);

                if (typeof selector === 'string') {
                    // 如果有选择器，过滤出匹配选择器的兄弟节点
                    allSiblings.forEach(sibling => {
                        if (sibling.matches(selector)) {
                            siblings.push(sibling);
                        }
                    });
                } else {
                    // 如果没有选择器，直接添加所有兄弟节点
                    siblings.push(...allSiblings);
                }
            }
        });

        // 使用 Set 去重，避免重复的兄弟节点
        const uniqueSiblings = [...new Set(siblings)];

        // 返回包装后的新 DOMQuery 实例，支持链式调用
        return new DOMQuery(uniqueSiblings);
    }


    /**
     * 遍历每个匹配的元素并执行回调函数
     * @param {function} callback - 回调函数，接收两个参数：index 和 element
     * @returns {DOMQuery} 当前实例
     */
    each(callback) {
        this.elements.forEach((element, index) => callback.call(element, index, element));
        return this;
    }

    /**
     * 添加类名到每个匹配的元素
     * @param {string} className - 要添加的类名
     * @returns {DOMQuery} 当前实例
     */
    addClass(className) {
        return this.each((index, element) => element.classList.add(className));
    }

    /**
     * 从每个匹配的元素中移除类名
     * @param {string} className - 要移除的类名
     * @returns {DOMQuery} 当前实例
     */
    removeClass(className) {
        return this.each((index, element) => element.classList.remove(className));
    }

    /**
     * 切换每个匹配元素的类名
     * @param {string} className - 要切换的类名
     * @returns {DOMQuery} 当前实例
     */
    toggleClass(className) {
        return this.each((index, element) => element.classList.toggle(className));
    }

    /**
     * 获取或设置每个匹配元素的文本内容
     * @param {string} [content] - 可选，要设置的文本内容
     * @returns {string|DOMQuery} 如果没有提供 content，则返回第一个元素的文本内容；否则返回当前实例
     */
    text(content) {
        if (content === undefined) {
            let element = this.elements[0];
            return element ? element.textContent : '';
        }
        return this.each((index, element) => element.textContent = content);
    }

    /**
     * 获取或设置每个匹配元素的HTML内容
     * @param {string} [content] - 可选，要设置的HTML内容
     * @returns {string|DOMQuery} 如果没有提供 content，则返回第一个元素的HTML内容；否则返回当前实例
     */
    html(content) {
        if (content === undefined) {
            let element = this.elements[0];
            return element ? element.innerHTML : '';
        }
        return this.each((index, element) => element.innerHTML = content);
    }

    /**
     * 获取或设置每个匹配元素的CSS属性
     * @param {string|Object} property - CSS属性名称或对象
     * @param {string} [value] - 可选，CSS属性值
     * @returns {string|DOMQuery} 如果没有提供 value，则返回第一个元素的CSS属性值；否则返回当前实例
     */
    css(property, value) {
        if (value === undefined && typeof property === 'string') {
            let element = this.elements[0];
            return element ? element.style[property] : '';
        }
        if (typeof property === 'object') {
            return this.each((index, element) => {
                for (const key in property) {
                    if (property.hasOwnProperty(key)) {
                        element.style[key] = property[key];
                    }
                }
            });
        }
        return this.each((index, element) => element.style[property] = value);
    }

    /**
     * 绑定事件处理程序到每个匹配的元素
     * @param {string} event - 事件类型
     * @param {function} callback - 事件处理程序
     * @returns {DOMQuery} 当前实例
     */
    on(event, callback) {
        return this.each((index, element) => element.addEventListener(event, callback));
    }

    /**
     * 触发点击事件或绑定点击事件处理程序
     * @param {function} [callback] - 可选，点击事件处理程序
     * @returns {DOMQuery} 当前实例
     */
    click(callback) {
        if (typeof callback === 'function') {
            return this.each((index, element) => element.addEventListener('click', callback));
        } else {
            return this.each((index, element) => element.click());
        }
    }

    /**
     * 解绑事件处理程序
     * @param {string} event - 事件类型
     * @param {function} callback - 事件处理程序
     * @returns {DOMQuery} 当前实例
     */
    off(event, callback) {
        return this.each((index, element) => element.removeEventListener(event, callback));
    }

    /**
     * 查找每个匹配元素的子元素
     * @param {string} selector - 子元素选择器
     * @returns {DOMQuery} 包含匹配子元素的新实例
     */
    find(selector) {
        const foundElements = [];
        this.each((index, element) => {
            foundElements.push(...element.querySelectorAll(selector));
        });
        return new DOMQuery(foundElements);
    }

    /**
     * 获取或设置每个匹配元素的属性
     * @param {string} name - 属性名称
     * @param {string} [value] - 可选，属性值
     * @returns {string|DOMQuery} 如果没有提供 value，则返回第一个元素的属性值；否则返回当前实例
     */
    attr(name, value) {
        if (value === undefined) {
            let element = this.elements[0];
            return element ? element.getAttribute(name) : '';
        }
        return this.each((index, element) => element.setAttribute(name, value));
    }

    /**
     * 移除每个匹配元素的属性
     * @param {string} name - 属性名称
     * @returns {DOMQuery} 当前实例
     */
    removeAttr(name) {
        return this.each((index, element) => element.removeAttribute(name));
    }

    /**
     * 在每个匹配元素之后插入内容
     * @param {string|Element|NodeList|Array|DOMQuery} content - 要插入的内容
     * @returns {DOMQuery} 当前实例
     */
    after(content) {
        return this.each((index, element) => {
            if (typeof content === 'string') {
                element.insertAdjacentHTML('afterend', content);
            } else if (content instanceof Element || content instanceof NodeList || content instanceof Array) {
                const nodes = content instanceof Element ? [content] : Array.from(content);
                nodes.forEach(node => element.parentNode.insertBefore(node, element.nextSibling));
            } else if (content instanceof DOMQuery) {
                content.elements.forEach(node => element.parentNode.insertBefore(node, element.nextSibling));
            }
        });
    }

    /**
     * 隐藏每个匹配元素
     * @returns {DOMQuery} 当前实例
     */
    hide() {
        return this.each((index, element) => element.style.display = 'none');
    }

    /**
     * 显示每个匹配元素
     * @param {string} [display='block'] - 可选，显示方式
     * @returns {DOMQuery} 当前实例
     */
    show(display = 'block') {
        return this.each((index, element) => element.style.display = display);
    }

    /**
     * 渐入效果
     * @param {number} [duration=400] - 动画持续时间（毫秒）
     * @param {function} [callback] - 动画完成后的回调函数
     * @returns {DOMQuery} 当前实例
     */
    fadeIn(duration = 400, callback = undefined) {
        return this.each((index, element) => {
            element.style.opacity = 0;
            element.style.display = 'block';
            element.style.transition = `opacity ${duration}ms`;
            void element.offsetHeight; // 强制重绘
            element.style.opacity = 1;
            setTimeout(() => {
                if (callback) {
                    callback.call(element);
                }
            }, duration);
        });
    }

    /**
     * 渐出效果
     * @param {number} [duration=400] - 动画持续时间（毫秒）
     * @param {function} [callback] - 动画完成后的回调函数
     * @returns {DOMQuery} 当前实例
     */
    fadeOut(duration = 400, callback = undefined) {
        return this.each((index, element) => {
            element.style.transition = `opacity ${duration}ms`;
            element.style.opacity = 0;
            setTimeout(() => {
                element.style.display = 'none';
                if (callback)
                    callback.call(element);
            }, duration);
        });
    }

    /**
     * 获取或设置每个匹配元素的值
     * @param {string} [value] - 可选，要设置的值
     * @returns {string|DOMQuery} 如果没有提供 value，则返回第一个元素的值；否则返回当前实例
     */
    val(value) {
        if (value === undefined) {
            let element = this.elements[0];
            return element ? element.value : '';
        } else {
            return this.each((index, element) => element.value = value);
        }
    }

    /**
     * 在每个匹配元素之前插入内容
     * @param {string|Element|NodeList|Array|DOMQuery} content - 要插入的内容
     * @returns {DOMQuery} 当前实例
     */
    prepend(content) {
        return this.each((index, element) => {
            if (typeof content === 'string') {
                element.insertAdjacentHTML('afterbegin', content);
            } else if (content instanceof Element || content instanceof NodeList || content instanceof Array) {
                const nodes = content instanceof Element ? [content] : Array.from(content);
                nodes.forEach(node => element.insertBefore(node, element.firstChild));
            } else if (content instanceof DOMQuery) {
                content.elements.forEach(node => element.insertBefore(node, element.firstChild));
            }
        });
    }

    /**
     * 绑定鼠标进入事件处理程序
     * @param {function} callback - 事件处理程序
     * @returns {DOMQuery} 当前实例
     */
    mouseenter(callback) {
        return this.on('mouseenter', callback);
    }

    /**
     * 绑定鼠标离开事件处理程序
     * @param {function} callback - 事件处理程序
     * @returns {DOMQuery} 当前实例
     */
    mouseleave(callback) {
        return this.each((index, element) => element.addEventListener('mouseleave', callback));
    }

    /**
     * 获取或设置每个匹配元素的位置
     * @param {Object} [coordinates] - 可选，包含 top 和 left 的对象
     * @returns {Object|DOMQuery} 如果没有提供 coordinates，则返回第一个元素的位置；否则返回当前实例
     */
    offset(coordinates = undefined) {
        if (coordinates === undefined) {
            const element = this.elements[0];
            if (element) {
                const rect = element.getBoundingClientRect();
                return {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX
                };
            }
            return { top: 0, left: 0 };
        } else {
            return this.each((index, element) => {
                element.style.position = 'relative';
                element.style.top = `${coordinates.top}px`;
                element.style.left = `${coordinates.left}px`;
            });
        }
    }

    /**
     * 获取每个匹配元素的外部高度（包括内边距、边框和可选的外边距）
     * @param {boolean} [includeMargin=false] - 是否包括外边距
     * @returns {number|null} 外部高度，如果没有匹配的元素则返回 null
     */
    outerHeight(includeMargin = false) {
        const element = this.elements[0];
        if (element) {
            const height = element.offsetHeight;
            if (includeMargin) {
                const style = window.getComputedStyle(element);
                return height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            }
            return height;
        }
        return null;
    }

    /**
     * 将每个匹配元素追加到目标元素
     * @param {string|Element|NodeList|Array|DOMQuery} target - 目标元素
     * @returns {DOMQuery} 当前实例
     */
    appendTo(target) {
        const $target = $(target);
        return this.each((index, element) => {
            $target.each((i, targetElement) => targetElement.appendChild(element));
        });
    }

    /**
     * 平滑滚动到目标元素
     * @param {string|Element|NodeList|Array|DOMQuery} targetSelector - 目标选择器或元素
     * @param {number} [duration=1000] - 动画持续时间（毫秒）
     * @param {number} [offset=0] - 偏移量
     * @returns {DOMQuery} 当前实例
     */
    scrollTo(targetSelector, duration = 1000, offset = 0) {
        const targetElement = $(targetSelector).elements[0];
        if (!targetElement) return this;

        const start = window.pageYOffset;
        const end = targetElement.getBoundingClientRect().top + start - offset;
        const change = end - start;
        const startTime = performance.now();

        let animateScroll = function (currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            window.scrollTo(0, start + change * progress);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
        return this;
    }

    /**
     * 获取直接父元素或根据选择器过滤父元素
     * @param {string} [selector] - 可选的选择器字符串
     * @returns {DOMQuery} 返回一个新的 DOMQuery 实例，包含匹配的父元素
     */
    parent(selector) {
        const parents = [];

        this.each((index, element) => {
            let parentElement = element.parentElement;

            if (selector) {
                while (parentElement) {
                    if (parentElement.matches(selector)) {
                        parents.push(parentElement);
                        break; // 找到匹配的第一个父元素后退出循环
                    }
                    parentElement = parentElement.parentElement;
                }
            } else {
                parents.push(parentElement);
            }
        });

        return new DOMQuery(parents);
    }

    /**
      * 获取或设置元素的数据 优先从缓存中读取数据，如果缓存中没有，则从 DOM 元素的 data-* 属性中读取数据。
      * @param {string} [key] - 可选，数据键
      * @param {any} [value] - 可选，数据值
      * @returns {any|DOMQuery} 如果没有提供 value，则返回指定键的数据或所有缓存数据；否则返回当前实例
      */
    data(key, value) {
        if (value === undefined) {
            // 获取数据
            const element = this.elements[0];
            if (element) {
                const cache = this._dataCache.get(element);
                if (key === undefined) {
                    // 返回所有缓存数据
                    return cache;
                } else {
                    // 如果缓存中没有数据，则从 DOM 元素的 data-* 属性中读取
                    if (cache[key] === undefined) {
                        const dataAttribute = element.getAttribute(`data-${key}`);
                        if (dataAttribute !== null) {
                            // 将 data-* 属性的值存储到缓存中
                            cache[key] = this._parseDataAttribute(dataAttribute);
                        }
                    }
                    return cache[key];
                }
            }
            return undefined;
        } else {
            // 设置数据
            return this.each((index, element) => {
                const cache = this._dataCache.get(element);
                cache[key] = value; // 更新缓存
            });
        }
    }
    /**
     * 滑动显示匹配的元素
     *
     * @param {number} duration - 动画持续时间（毫秒）
     * @returns {DOMQuery} 当前实例，支持链式调用
     */
    slideDown(duration = 400) {
        this._slide('slideDown', duration);
        return this;
    }

    /**
     * 滑动隐藏匹配的元素
     *
     * @param {number} duration - 动画持续时间（毫秒）
     * @returns {DOMQuery} 当前实例，支持链式调用
     */
    slideUp(duration = 400) {
        this._slide('slideUp', duration);
        return this;
    }

    /**
     * 切换匹配元素的显示状态
     *
     * @param {number} duration - 动画持续时间（毫秒）
     * @returns {DOMQuery} 当前实例，支持链式调用
     */
    slideToggle(duration = 400) {
        this._slide('slideToggle', duration);
        return this;
    }

    /**
      * 内部方法，用于执行滑动动画
      *
      * @param {string} action - 动作类型 ('slideDown', 'slideUp', 'slideToggle')
      * @param {number} duration - 动画持续时间（毫秒）
      */
    _slide(action, duration) {
        this.each((index, element) => {
            const maxHeight = `${element.scrollHeight}px`; // 获取元素的内容高度
            let startTime = null;

            if (action === 'slideDown' || (action === 'slideToggle' && !isVisible(element))) {
                // 滑动显示
                element.style.overflow = 'hidden';
                element.style.maxHeight = '0';
                element.style.display = 'block';

                const startAnimation = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1); // 计算进度（0 到 1 之间）

                    element.style.maxHeight = `${progress * element.scrollHeight}px`;

                    if (progress < 1) {
                        requestAnimationFrame(startAnimation);
                    } else {
                        element.style.maxHeight = ''; // 清除最大高度以便后续操作正常工作
                        element.style.transition = ''; // 清除过渡属性
                        element.style.overflow = ''; // 清除溢出属性
                    }
                };

                requestAnimationFrame(startAnimation);
            } else if (action === 'slideUp' || (action === 'slideToggle' && element.style.display !== 'none')) {
                // 滑动隐藏
                element.style.overflow = 'hidden';
                element.style.maxHeight = `${element.scrollHeight}px`;

                const startAnimation = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.max(1 - (timestamp - startTime) / duration, 0); // 计算进度（从 1 到 0）

                    element.style.maxHeight = `${progress * element.scrollHeight}px`;

                    if (progress > 0) {
                        requestAnimationFrame(startAnimation);
                    } else {
                        element.style.display = 'none';
                        element.style.maxHeight = ''; // 清除最大高度以便后续操作正常工作
                        element.style.transition = ''; // 清除过渡属性
                        element.style.overflow = ''; // 清除溢出属性
                    }
                };

                requestAnimationFrame(startAnimation);
            }
        });
    }
    /**
     * 为匹配的第一个元素设置焦点
     *
     * @returns {DOMQuery} 当前实例，支持链式调用
     */
    focus() {
        if (this.elements.length > 0) {
            this.elements[0].focus(); // 调用原生的 focus 方法
        }
        return this; // 支持链式调用
    }

    /**
     * 解析 data-* 属性的值
     * @param {string} value - data-* 属性的值
     * @returns {any} 解析后的值
     */
    _parseDataAttribute(value) {
        try {
            // 尝试将值解析为 JSON
            return JSON.parse(value);
        } catch (e) {
            // 如果解析失败，则返回原始值
            return value;
        }
    }
    /**
     * 获取每个匹配元素的所有祖先元素（包括直接父元素和更高级别的父元素）
     * 如果提供了选择器，则只返回匹配该选择器的祖先元素。
     *
     * @param {string} [selector] - 可选的选择器字符串，用于过滤祖先元素
     * @returns {DOMQuery} 返回一个新的 DOMQuery 实例，包含匹配的祖先元素
     */
    parents(selector) {
        const parents = []; // 存储所有找到的祖先元素

        // 遍历当前实例中的每一个元素
        this.each((index, element) => {
            let parent = element.parentElement; // 获取当前元素的直接父元素

            // 循环查找每个元素的所有祖先元素
            while (parent) {
                // 如果没有提供选择器，或者当前父元素匹配选择器，则将其加入结果数组
                if (!selector || parent.matches(selector)) {
                    parents.push(parent);
                }
                // 继续向上查找父元素
                parent = parent.parentElement;
            }
        });

        // 返回一个新的 DOMQuery 实例，包含所有找到的祖先元素
        return new DOMQuery(parents);
    }
    /**
     * 检查每个匹配元素是否包含指定的类名
     *
     * @param {string} className - 要检查的类名
     * @returns {boolean} 如果至少有一个匹配的元素包含指定的类名，则返回 true；否则返回 false
     */
    hasClass(className) {
        let found = false;
        this.each((index, element) => {
            if (element.classList.contains(className)) {
                found = true;
                return false; // 使用 return false 来提前退出 each 循环
            }
        });
        return found;
    }

    /**
     * 获取或设置每个匹配元素的宽度
     *
     * @param {number|string} [value] - 可选，要设置的宽度值（可以是数字或带单位的字符串）
     * @returns {number|DOMQuery} 如果没有提供值，则返回第一个匹配元素的宽度；如果提供了值，则返回当前实例
     */
    width(value) {
        if (arguments.length === 0) {
            // 获取第一个匹配元素的宽度
            if (this.elements.length > 0) {
                return this.elements[0].offsetWidth;
            }
            return null;
        } else {
            // 设置所有匹配元素的宽度
            const widthValue = typeof value === 'number' ? `${value}px` : value;
            this.each((index, element) => {
                element.style.width = widthValue;
            });
            return this; // 支持链式调用
        }
    }

    /**
     * 切换每个匹配元素的可见性，通过淡入或淡出的方式
     *
     * @param {number} [duration=400] - 动画持续时间（毫秒）
     * @param {function} [callback] - 动画完成后的回调函数
     * @returns {DOMQuery} 当前实例
     */
    fadeToggle(duration = 400, callback = undefined) {
        return this.each((index, element) => {
            const isHidden = !isVisible(element) || !element.offsetHeight;

            if (isHidden) {
                // 如果元素是隐藏的，则执行淡入操作
                element.style.opacity = 0;
                element.style.display = 'block';
                element.style.transition = `opacity ${duration}ms`;
                void element.offsetHeight; // 强制重绘
                element.style.opacity = 1;

                setTimeout(() => {
                    if (callback) {
                        callback.call(element);
                    }
                }, duration);
            } else {
                // 如果元素是显示的，则执行淡出操作
                element.style.transition = `opacity ${duration}ms`;
                element.style.opacity = 0;

                setTimeout(() => {
                    element.style.display = 'none';
                    if (callback) {
                        callback.call(element);
                    }
                }, duration);
            }
        });
    }
    /**
     * 获取每个匹配元素的父级元素
     * @param {string} [selector] - 可选，过滤父元素的选择器
     * @returns {DOMQuery} 包含匹配父元素的新实例
     */
    static create(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return new DOMQuery(template.content.childNodes.length > 1 ? template.content.childNodes : template.content.firstChild);
    }

}
// 插件扩展机制
DOMQuery.prototype.extend = function (name, fn) {
    DOMQuery.prototype[name] = fn;
};

/**
 * 平滑滚动插件
 * 示例用法
 * $('body').scrollTo('#target', 800, 0); // 平滑滚动到ID为'target'的元素，持续时间为800毫秒，无偏移量
 */
DOMQuery.prototype.extend('scrollTo', function (targetSelector, duration = 1000, offset = 0) {
    const targetElement = $(targetSelector).elements[0];
    if (!targetElement) return this; // 如果没有找到目标元素，直接返回

    const start = window.pageYOffset;
    const end = targetElement.getBoundingClientRect().top + start - offset;
    const change = end - start;
    const startTime = performance.now();

    let animateScroll = function (currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        window.scrollTo(0, start + change * progress);

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    };

    requestAnimationFrame(animateScroll);
    return this;
});