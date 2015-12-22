var R = require('ramda');

ace.define("ace/mode/dynamic_leiden_plus_behaviour",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"], function(acequire, exports, module) {
"use strict";

var oop = acequire("ace/lib/oop");
var Behaviour = acequire("ace/mode/behaviour").Behaviour;
var TokenIterator = acequire("ace/token_iterator").TokenIterator;
var lang = acequire("ace/lib/lang");

function is(token, type) {
    return token.type.lastIndexOf(type + ".xml") > -1;
}

var DynamicLeidenPlusBehaviour = function () {

    this.add("autoclosing", "insertion", function (state, action, editor, session, text) {

        if (text == '=') {
            var position = editor.getCursorPosition();
            var iterator = new TokenIterator(session, position.row, position.column);
            var token = iterator.getCurrentToken() || iterator.stepBackward();
            //if (!token || !(is(token, "tag-name") || is(token, "tag-whitespace") || is(token, "attribute-name") || is(token, "attribute-equals") || is(token, "attribute-value")))
            //    return;
            //if (is(token, "reference.attribute-value"))
            //    return;
            //if (is(token, "attribute-value")) {
            //    var firstChar = token.value.charAt(0);
            //    if (firstChar == '"' || firstChar == "'") {
            //        var lastChar = token.value.charAt(token.value.length - 1);
            //        var tokenEnd = iterator.getCurrentTokenColumn() + token.value.length;
            //        if (tokenEnd > position.column || tokenEnd == position.column && firstChar != lastChar)
            //            return;
            //    }
           // }
            //while (!is(token, "tag-name")) {
            //    token = iterator.stepBackward();
            //}

            var tokenRow = iterator.getCurrentTokenRow();
            var tokenColumn = iterator.getCurrentTokenColumn();
            //if (is(iterator.stepBackward(), "end-tag-open"))
            //    return;

            var element = token.value;
            if (tokenRow == position.row)
                element = element.substring(0, position.column - tokenColumn);

            if (this.voidElements.hasOwnProperty(element.toLowerCase()))
                 return;

            return {
               text: "=" + "=>",
               selection: [1, 1]
            };
        }
    });

    this.add("autoindent", "insertion", function (state, action, editor, session, text) {
        if (text == "\n") {
            var cursor = editor.getCursorPosition();
            var line = session.getLine(cursor.row);
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();

            if (token && token.type.indexOf("tag-close") !== -1) {
                if (token.value == "/>")
                    return;
                while (token && token.type.indexOf("tag-name") === -1) {
                    token = iterator.stepBackward();
                }

                if (!token) {
                    return;
                }

                var tag = token.value;
                var row = iterator.getCurrentTokenRow();
                token = iterator.stepBackward();
                if (!token || token.type.indexOf("end-tag") !== -1) {
                    return;
                }

                if (this.voidElements && !this.voidElements[tag]) {
                    var nextToken = session.getTokenAt(cursor.row, cursor.column+1);
                    var line = session.getLine(row);
                    var nextIndent = this.$getIndent(line);
                    var indent = nextIndent + session.getTabString();

                    if (nextToken && nextToken.value === "</") {
                        return {
                            text: "\n" + indent + "\n" + nextIndent,
                            selection: [1, indent.length, 1, indent.length]
                        };
                    } else {
                        return {
                            text: "\n" + indent
                        };
                    }
                }
            }
        }
    });

};

oop.inherits(DynamicLeidenPlusBehaviour, Behaviour);

exports.DynamicLeidenPlusBehaviour = DynamicLeidenPlusBehaviour;
});

