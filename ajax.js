(function () {
    var isUndefined = function (data) {
        return data === void 0;
    };
    /**
     * ajax执行逻辑
     * @param {Object} options 参数列表
     */
    var ajax = function (options) {
        if (!tools.getType(options, 'Object')) {
            throw new TypeError('参数类型错误');
        }
        // ajax 第一步 获取ajax对象
        var xhr = tools.getXHR();

        var isGET = /^(get|head|delete)$/ig.test(options.method);
        if (options.data) {
            options.data = tools.encodeToURIString(options.data, isGET);
        }
        if (isGET) {
            options.url = tools.padStringToURL(options.url, options.data);
        }
        if (options.cache === false) {
            var random = Math.random();
            options.url = tools.padStringToURL(options.url, '_=' + random);
        }
        xhr.open(options.method, options.url, options.async);
        if (xhr.setRequestHeader && tools.getType(options.headers, 'Object')) {
            for (var n in options.headers) {
                if (!options.headers.hasOwnProperty(n)) continue;
                xhr.setRequestHeader(n, options.headers[n]);
            }
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (/^2\d{2}$/.test(xhr.status)) {
                    var responseText = xhr.responseText;
                    if (responseText && /json/ig.test(options.dataType)) {
                        try {
                            responseText = tools.JSONParse(responseText);
                        } catch (ex) {
                            options.error(ex);
                            return;
                        }
                    }
                    options.success(responseText);
                } else if (/^(4|5)\d{2}$/.test(xhr.status)) {
                    options.error(xhr.status);
                }
            }
        };
        xhr.send(options.data);
        return xhr;
    };
    var tools = {
        /**
         * 获取ajax对象
         */
        getXHR: (function () {
            var list = [function () {
                return new XMLHttpRequest();
            }, function () {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }, function () {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function () {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }];
            var xhr = null;
            while (xhr = list.shift()) {
                try {
                    xhr();
                    break;
                } catch (ex) {
                    xhr = null;
                    continue;
                }
            }
            if (xhr === null) {
                throw new Error('当前浏览器不支持ajax功能')
            }
            return xhr;
        })(),
        /**
         * 判断是否为指定类型
         * @param {*} data 需要判断类型的参数
         * @param {string} type 数据类型
         * @return {boolean} 参数是否为指定类型
         */
        getType: function (data, type) {
            return Object.prototype.toString.call(data) === '[object ' + type + ']';
        },
        /**
         * 把一个对象格式化为URIString格式
         * @param {*} data 需要格式化的参数
         * @return {string} 格式化完毕得到的字符串
         */
        encodeToURIString: function (data, encodeZH) {
            if (!data) {
                return '';
            }
            if (tools.getType(data, 'String')) {
                return data;
            }
            var arr = [];
            for (var n in data) {
                if (!data.hasOwnProperty(n)) continue;
                if (encodeZH) {
                    arr.push(encodeURIComponent(n) + '=' + encodeURIComponent(data[n]));
                } else {
                    arr.push(n + '=' + data[n]);
                }
            }
            return arr.join('&');
        },
        /**
         * 往url中拼接字符串
         * @param {string} url url
         * @param {*} param 需要往url后面拼接的参数
         * @return {string} 拼接完毕之后的url
         */
        padStringToURL: function (url, param) {
            if (!param) {
                return url;
            }
            var data = tools.encodeToURIString(param);
            var hasSearch = /\?/.test(url);
            return url + (hasSearch ? '&' : '?') + data;
        },
        /**
         * 把一段json字符串格式化为json对象
         * @param {string} jsonString 需要格式化的json字符串
         * @return {Object} 格式化得到的json对象
         */
        JSONParse: function (jsonString) {
            if (tools.getType(jsonString, 'Object')) {
                return jsonString;
            }
            if (window.JSON) {
                return JSON.parse(jsonString);
            }
            return eval('(' + jsonString + ')');
        }
    };
    this.ajax = ajax;
})();