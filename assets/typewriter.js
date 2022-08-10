"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
//default settings
var typewriterSettings = {
    writeDelay: 80,
    deleteDelay: 40,
    holdOnceWritten: 1000,
    holdOnceDeleted: 300,
    stopAfterOnce: false
};
var TypewriterProps = /** @class */ (function () {
    function TypewriterProps(selector, phrases, settings) {
        var _this = this;
        this.phrasesLength = 0;
        this.currentPhrase = 0;
        this.updateCurrentPhrase = function () {
            _this.currentPhrase === _this.phrasesLength - 1
                ? _this.resetPhrases()
                : _this.nextPhrase();
        };
        this.resetPhrases = function () {
            _this.currentPhrase = 0;
        };
        this.nextPhrase = function () {
            _this.currentPhrase++;
        };
        this.settings = __assign({}, typewriterSettings, (settings || {}));
        this.element = document.querySelector(selector);
        this.phrases = phrases;
        this.phrasesLength = phrases.length;
    }
    return TypewriterProps;
}());
var TypeWriter = /** @class */ (function (_super) {
    __extends(TypeWriter, _super);
    function TypeWriter(selector, phrases, settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this, selector, phrases, settings) || this;
        _this.write = function () {
            _this.element.setAttribute("placeholder", "");
            _this.phrases[_this.currentPhrase].split("").forEach(function (letter, index) {
                setTimeout(function () {
                    _this.element.setAttribute("placeholder", _this.element.getAttribute("placeholder") + letter);
                    if (index === _this.phrases[_this.currentPhrase].length - 1) {
                        setTimeout(function () {
                            _this.remove();
                        }, _this.settings.holdOnceWritten);
                    }
                }, _this.settings.writeDelay * index);
            });
        };
        _this.remove = function () {
            var currentWrittenPhrase = _this.phrases[_this.currentPhrase];
            var _loop_1 = function (letterIndex) {
                setTimeout(function () {
                    _this.element.setAttribute("placeholder", _this.element.getAttribute("placeholder").slice(0, -1));
                    if (letterIndex === currentWrittenPhrase.length - 1) {
                        setTimeout(function () {
                            _this.newPhrase();
                        }, _this.settings.holdOnceDeleted);
                    }
                }, _this.settings.deleteDelay * letterIndex);
            };
            for (var letterIndex = 0; letterIndex < currentWrittenPhrase.length; letterIndex++) {
                _loop_1(letterIndex);
            }
        };
        _this.newPhrase = function () {
            _this.currentPhrase++;
            if (_this.currentPhrase === _this.phrases.length) {
                _this.currentPhrase = 0;
                if (_this.settings.stopAfterOnce) {
                    _this.element.setAttribute("placeholder", _this.phrases[0]);
                    return;
                }
            }
            _this.write();
        };
        _this.write();
        return _this;
    }
    return TypeWriter;
}(TypewriterProps));
