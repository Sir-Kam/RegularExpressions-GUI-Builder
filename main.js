/*



*/

const RegexBuilders = [];

class RegexBuilder {
    regexBlockData = [
        {
          "type": "words",
          "content": " "
        },
        {
          "type": "chars",
          "content": "=\""
        },
        {
          "type": "char-range-inverse",
          "content": "\""
        },
        {
          "type": "chars",
          "content": "\""
        },
        {
          "type": "any",
          "content": " "
        },
        {
          "type": "words",
          "content": " "
        },
        {
          "type": "chars",
          "content": "=\""
        },
        {
          "type": "char-range-inverse",
          "content": "\""
        },
        {
          "type": "chars",
          "content": "\""
        }
      ];

    RegexBlocks = {
        "chars": {
            desc: 'characters',
            hasValue: true,
            func: (val) => `${val}`
        },
        "char-range": {
            desc: 'character set',
            hasValue: true,
            func: (val) => `[${val}]{0,}`,
        },
        "char-range-inverse": {
            desc: 'negated set',
            hasValue: true,
            func: (val) => `[^${val}]{0,}`,
        },
        "word": {
            desc: 'word',
            hasValue: false,
            func: (val) => `\\w`,
        },
        "not-word": {
            desc: 'not word',
            hasValue: false,
            func: (val) => `\\W`,
        },
        "words": {
            desc: 'words',
            hasValue: false,
            func: (val) => `\\w+`,
        },
        "not-words": {
            desc: 'not words',
            hasValue: false,
            func: (val) => `\\W+`,
        },
        "digit": {
            desc: 'digit',
            hasValue: false,
            func: (val) => `\\d`,
        },
        "not-digit": {
            desc: 'not digit',
            hasValue: false,
            func: (val) => `\\D`,
        },
        "digits": {
            desc: 'digits',
            hasValue: false,
            func: (val) => `\\d+`,
        },
        "not-digits": {
            desc: 'not digits',
            hasValue: false,
            func: (val) => `\\D+`,
        },
        "any": {
            desc: 'match any',
            hasValue: false,
            func: (val) => `.`,
        },
    };
    RegexBlockColors = {
        "chars": ['83, 131, 202, 85'],
        "char-range": ['223, 219, 35, 85'],
        "char-range-inverse": ['184, 182, 58, 34'],
        "word": ['#d705'],
        "not-word": ['#d702'],
        "words": ['#d705'],
        "not-words": ['#d702'],
        "digit": ['#d705'],
        "not-digit": ['#d702'],
        "digits": ['#d705'],
        "not-digits": ['#d702'],
        "any": ['#92e5']
    };

    RegexColorMapping = {
        "/": 'gray',
        "\\": 'hotpink',
        "[": '#d70',
        "^": '#d70',
        "+": '#58f',
        "*": '#58f',
        "?": '#58f',
        "]": '#d70',
    };
    RegexColorMapping_Wildcard = {
        "\\{\\d,(?:\\d|)\\}": '#58f'
    };

    ExportBlocksToJson() {
        regexBlockData = [];
        [... document.querySelectorAll(`#${this.BuilderId} .editor-area .regex-block`)].forEach(ele => {
            console.log(ele.getElementsByClassName('block-content'));
            regexBlockData.push(
                {
                    'type': ele.getAttribute('type'),
                    'content': ele.getElementsByClassName('block-content')[0].innerHTML
                }
            );
        });
        return regexBlockData;
    };

    ExportBlocksToRegex() {
        return (
            [...document.querySelectorAll(`#${this.BuilderId} .editor-area .regex-block`)].map(ele => {
                return this.RegexBlocks[ele.getAttribute('type')].func(ele.querySelector('.block-content').innerText.replace('\\\\', '\\'));
            })
        );
    };

    ColorRegex(regexArray, flags = 'gi') {
        let finalColored = '<span style="color: gray">/</span>';
        for (let i = 0; i < regexArray.length; i++) {
            var regex = regexArray[i];
            let regexStrArray = regex.split('');
            let regexColor = ``;
            let lastColor = null;
            let strCache = '';
            for (let i = 0; i < regexStrArray.length; i++) {
                let char = regexStrArray[i];
                let color = this.RegexColorMapping[char];
                if (char == ' ') {
                    color = 'hotpink';
                    char = '\\s';
                }
                console.log(i + ' ' + char + ' ' + color);
                if (color != lastColor) {
                    regexColor += `<span${(lastColor ? ` style="color: ${lastColor}"` : '')}>${strCache}</span>`;
                    strCache = char;
                    lastColor = color;
                } else {
                    strCache += char;
                }
            }
            if (strCache != '') {
                for (var [matchStr, colorStr] of Object.entries(this.RegexColorMapping_Wildcard)) {
                    var match = new RegExp(matchStr).test(strCache);
                    if (match) {
                        regexColor += `<span style="color: ${colorStr}">${strCache}</span>`;
                        strCache = '';
                        break;
                    }
                }
            }
            if (strCache != '') {
                regexColor += `<span${(lastColor ? ` style="color: ${lastColor}"` : '')}>${strCache}</span>`;
            }
            finalColored += `<div data-block-id="${i}" class="colored-regex-block-group">${regexColor}</div>`;
        }
        finalColored += `<span style="color: gray">/${flags}</span>`;
        
        return finalColored;
    };

    ShowRegexResults() {
        var docFrag = new DocumentFragment();
        docFrag.innerHTML
        document.querySelector(`#${this.BuilderId} .output-area`).innerHTML =
            this.ColorRegex(this.ExportBlocksToRegex(), 'gi');
        document.querySelectorAll(`#${this.BuilderId} .output-area .colored-regex-block-group`).forEach(regexBlock => {
            regexBlock.onmouseenter = ((e) => {
                var ele = !e.target.className.includes('colored-regex-block-group') ? e.target.parentElement : e.target;
                ele.classList.add('highlighted'); 
                var i = [... ele.parentNode.querySelectorAll('.colored-regex-block-group')].indexOf(ele);
                //console.log(i);
                document.querySelector(`#${this.BuilderId} .editor-area .regex-block:nth-child(${(i + 1) * 2})`).classList.add('highlighted');
            });
            regexBlock.onmouseleave = ((e) => {
                var ele = !e.target.className.includes('colored-regex-block-group') ? e.target.parentElement : e.target;
                ele.classList.remove('highlighted');
                var i = [... ele.parentNode.querySelectorAll('.colored-regex-block-group')].indexOf(ele)
                //console.log(i);
                document.querySelector(`#${this.BuilderId} .editor-area .regex-block:nth-child(${(i + 1) * 2})`).classList.remove('highlighted');
            });
        });
    };

    TestInputAgainstRegex() {
        var inputEle = document.querySelector(`#${this.BuilderId} .testing-input`);
        var reg = this.ExportBlocksToRegex();
        var regexPasses = new RegExp(reg.join("")).test(inputEle.value);
        inputEle.style['border-color'] = (regexPasses ? '#00ff43' : 'inherit');

        document.querySelectorAll(`#${this.BuilderId} .colored-regex-block-group.underline`).forEach(ele =>
            ele.classList.remove('underline', 'good', 'bad')
        );

        if (inputEle.value == '') {
            return;
        }

        if (!regexPasses) {
            var testStr = inputEle.value;
            var tempStr = testStr;
            var regParts = this.ExportBlocksToRegex();
            var partIndex = 0;
            var passed = true;
            for (const part of regParts) {
                //console.log(part);
                var regex = new RegExp(part);
                //console.log(regex);
                var res = regex.exec(tempStr);
                if (res != null && res.length == 1) {
                    var ele = document.querySelector(`#${this.BuilderId} .colored-regex-block-group:nth-of-type(${partIndex + 1})`);
                    ele.classList.remove('underline', 'bad');
                    ele.classList.add('underline', 'good');
                    tempStr = tempStr.substring(res[0].length);
                } else {
                    passed = false;
                    break;
                }
                partIndex++;
            }
            if (!passed) {
                var ele = document.querySelector(`#${this.BuilderId} .colored-regex-block-group:nth-of-type(${partIndex + 1})`);
                ele.classList.remove('underline', 'good');
                ele.classList.add('underline', 'bad');
                //var passedParts = regParts.slice(0,partIndex).join("");
                //console.log(passedParts + regParts[partIndex]);
                //console.log(' '.repeat(passedParts.length) + '^'.repeat(regParts[partIndex].length));
            }
        }
    };

    CurrentDragDropName = '';

    CreateUserRegexBlock(type, content, editor = null) {

        let regexBlock = document.createElement('div');
        regexBlock.classList.add('regex-block');
        regexBlock.setAttribute('type', type);
        regexBlock.setAttribute('no-value', !this.RegexBlocks[type].hasValue)
    
        let regexBlockDesc = document.createElement('div');
        regexBlockDesc.classList.add('block-desc');
        regexBlockDesc.innerText = this.RegexBlocks[type].desc;
    
        let regexBlockContent = document.createElement('div');
        regexBlockContent.classList.add('block-content');
        regexBlockContent.innerText = content;
    
        regexBlockContent.addEventListener('dblclick', (e) => {
            if (!this.RegexBlocks[type].hasValue) return;
            var newContentValue = prompt('Regex block contents:', e.target.innerHTML.replace('&nbsp;', ' '));
            
            newContentValue = newContentValue.replace(' ', '&nbsp;');
            if (newContentValue) {
                e.target.innerHTML = newContentValue;
                this.ShowRegexResults();
            }
        });

        
        let regexBlockdeleter = document.createElement('div');
        regexBlockdeleter.className = 'block-deleter';
        regexBlockdeleter.addEventListener('click', (e) => {
            var eleDel = e.target;
            if (eleDel.className != 'block-deleter') return;
            var ele = eleDel.className != 'regex-block' ? eleDel.parentElement : eleDel;
            if (eleDel.getAttribute('confirm')) {
                ele.nextSibling.remove();
                ele.remove();
                document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
                this.ShowRegexResults();
            } else {
                eleDel.setAttribute('confirm', true);
            }
        });
    
        regexBlock.onmouseenter = ((e) => {
            var ele = !e.target.className.includes('regex-block') ? e.target.parentElement : e.target;
            //console.log(ele);
            ele.classList.add('highlighted');
            var i = (([... ele.parentNode.childNodes].indexOf(ele)) - 1) / 2;
            //console.log(i);
            document.querySelector(`#${this.BuilderId} .colored-regex-block-group:nth-of-type(${i + 1})`).classList.add('highlighted');
        });
        regexBlock.onmouseleave = ((e) => {
            var ele = !e.target.className.includes('regex-block') ? e.target.parentElement : e.target;
            //console.log(ele);
            ele.classList.remove('highlighted');
            var i = (([... ele.parentNode.childNodes].indexOf(ele)) - 1) / 2;
            //console.log(i);
            document.querySelector(`#${this.BuilderId} .colored-regex-block-group:nth-of-type(${i + 1})`).classList.remove('highlighted');
            ele.querySelector('.block-deleter').removeAttribute('confirm');
        });
    
        regexBlock.addEventListener('drop', (e) => {
            e.preventDefault();
            var data = e.dataTransfer.getData("Text");
            if (data != 'delete')
                return;
            var ele = e.target.className != 'regex-block' ? e.target.parentElement : e.target;
            ele.nextSibling.remove();
            ele.remove();
            document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
            this.ShowRegexResults();
        });
        regexBlock.addEventListener('dragover',  (e) => {
            e.preventDefault();
            if (this.CurrentDragDropName != 'delete')
                return;
            var ele = e.target.className != 'regex-block' ? e.target.parentElement : e.target;
            //ele.style.filter = 'saturate(0.5) sepia(0.25)';
            ele.style.opacity = '1';
        });
        regexBlock.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.target.style.filter = null;
            e.target.style.opacity = null;
        });
        regexBlock.addEventListener('dragend', (e) => {
            e.preventDefault();
            e.target.style.opacity = null;
            e.target.style.filter = null;
            document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
        });
    
        regexBlock.appendChild(regexBlockDesc);
        regexBlock.appendChild(regexBlockContent);
        regexBlock.appendChild(regexBlockdeleter);
        //editor.appendChild(regexBlock);
    
        var spacerEle = this.CreateSpacerPlaceholder();
        //editor.appendChild(spacerEle);
        
        var docFrag = new DocumentFragment();
        docFrag.appendChild(regexBlock);
        docFrag.appendChild(spacerEle);
        return docFrag;
    
    };

    CreateSpacerPlaceholder() {
        var spacerEle = document.createElement('div');
        spacerEle.classList.add('block-spacer-selector', 'hidden');
        spacerEle.addEventListener('drop', (e) => {
            e.preventDefault();
            var data = e.dataTransfer.getData("Text");
            e.target.classList.add('hidden');
            console.log(data);
            if (data != 'delete') {
                [...this.CreateUserRegexBlock(data, ' ').childNodes].reverse().forEach(ele => {
                    ele.style['max-width'] = '0px';
                    ele.style['min-width'] = '0px';
                    ele.style['width'] = '0px';
                    e.target.insertAdjacentElement('afterEnd', ele);
                    ele.style['max-width'] = null;
                    ele.style['min-width'] = null;
                    ele.style['width'] = null;
                });
                this.ShowRegexResults();
            }
            document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
        });
        spacerEle.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.CurrentDragDropName == 'delete')
                return;
            e.target.classList.remove('hidden');
        });
        spacerEle.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.target.classList.add('hidden');
        });
        spacerEle.addEventListener('dragend', (e) => {
            e.preventDefault();
            e.target.classList.add('hidden');
            document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
        });
        return spacerEle;
    };

    CreateToolbarRegexBlock(type) {
    
        let blockData = this.RegexBlocks[type];
        let regexBlock = document.createElement('div');
        regexBlock.classList.add('regex-block', 'toolbar-block');
        regexBlock.setAttribute('type', type);
    
        let regexBlockDesc = document.createElement('div');
        regexBlockDesc.classList.add('block-desc');
        regexBlockDesc.innerText = blockData.desc;
    
        regexBlock.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("Text", e.target.getAttribute('type'));
            this.CurrentDragDropName = 'toolbar-regex-block'
            document.documentElement.style.setProperty('--user-regex-block-opacity', '0.3');
            document.documentElement.style.setProperty('--spacer-block-opacity', '0.9');
        });
    
        regexBlock.addEventListener('dragend', (e) => {
            e.preventDefault();
            document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
            document.documentElement.style.setProperty('--spacer-block-opacity', '0.0');
            this.CurrentDragDropName = '';
        });
        
        regexBlock.setAttribute('draggable', true);
    
        regexBlock.appendChild(regexBlockDesc);
        return regexBlock;
    
    };

    CreateToolbarRegexBlocks(ele = null) {
        const toolbar = ele || document.querySelector(`#${this.BuilderId} .toolbar-area`);
        for (let k in this.RegexBlocks) {
            //let block = RegexBlocks[k];
    
            var regexBlock = this.CreateToolbarRegexBlock(k);
            toolbar.appendChild(regexBlock);
        }
    };

    CreateToolbarDeleterBlock() {
        let deleter = document.getElementById('block-delter');
        if (!deleter) {
            deleter = document.createElement('div');
            deleter.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData("Text", 'delete');
                this.CurrentDragDropName = 'delete';
                document.documentElement.style.setProperty('--user-regex-block-opacity', '0.3');
            });
            deleter.addEventListener('dragend', (e) => {
                e.preventDefault();
                document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
                this.CurrentDragDropName = '';
            });
        }
        deleter.setAttribute('draggable', true);
        deleter.id = 'block-deleter';
        return deleter;
    };

    HasSavedBlockData() {
        return (this.regexBlockData && typeof this.regexBlockData === typeof [] && this.regexBlockData.length != 0);
    };

    BuilderId = "";
    CreateBuilder() {
        this.BuilderId = 'regex-builder_' + Date.now();
        if (document.querySelector('#' + this.BuilderId)) {
            this.BuilderId += Math.random().toString();
        }

        const builder = document.createElement('div');
        builder.className = 'regex-builder';
        builder.id = this.BuilderId;

        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar-area';
        //const deleterDiv = CreateToolbarDeleterBlock();
        //toolbar.appendChild(deleterDiv);
        this.CreateToolbarRegexBlocks(toolbar);

        const editor = document.createElement('div');
        editor.className = 'editor-area';
        editor.appendChild(this.CreateSpacerPlaceholder());
        if (this.HasSavedBlockData()) {
            for (let i = 0; i < this.regexBlockData.length; i++) {
                let blockData = this.regexBlockData[i];
                editor.appendChild(this.CreateUserRegexBlock(blockData.type, blockData.content, editor));
            }
        } else {
        }

        const output = document.createElement('div');
        output.className = 'output-area';

        const tester = document.createElement('div');
        tester.className = 'testing-area';
        const test_input = document.createElement('input');
        test_input.className = 'testing-input';
        test_input.spellcheck = false;
        test_input.addEventListener('input', this.TestInputAgainstRegex.bind(this));
        tester.appendChild(test_input)

        builder.appendChild(toolbar);
        builder.appendChild(editor);
        builder.appendChild(output);
        builder.appendChild(tester);

        RegexBuilders.push(builder);

        return builder;
    };

    HexToRGBA(h) {
        let r = 0, g = 0, b = 0, a = 255;
      
        // 3 digits
        if (h.length == 4) {
          r = "0x" + h[1] + h[1];
          g = "0x" + h[2] + h[2];
          b = "0x" + h[3] + h[3];
      
        // 6 digits
        } else if (h.length == 7) {
          r = "0x" + h[1] + h[2];
          g = "0x" + h[3] + h[4];
          b = "0x" + h[5] + h[6];
        }

        if (h.length == 5) {
          r = "0x" + h[1] + h[1];
          g = "0x" + h[2] + h[2];
          b = "0x" + h[3] + h[3];
          a = "0x" + h[4] + h[4];
      
        } else if (h.length == 9) {
          r = "0x" + h[1] + h[2];
          g = "0x" + h[3] + h[4];
          b = "0x" + h[5] + h[6];
          a = "0x" + h[7] + h[8];
        }
        
        return "" + +r + "," + +g + "," + +b + "," + +a + "";
    };

    InsertRegexStyleEle() {
        const sheet = window.document.styleSheets[0];
        for (const [key, colorsData] of Object.entries(this.RegexBlockColors)) {
            const [bg, bc] = colorsData;
            const [rgbaBg, rgbaB] = [(bg.includes('#') ? this.HexToRGBA(bg) : bg), /*(bc.includes('#') ? HexToRGBA(bc) : bc)*/ null];
            console.log(rgbaBg);
            let [r, g, b, a] = rgbaBg.split(',').map(i => i.trim());
            if (a == undefined)
                a = 255;
            sheet.insertRule(
                `
                div [type="${key}"] {
                    --block-bg-accent-color: rgba(${rgbaBg});
                    --block-bg-accent-color-r: ${r};
                    --block-bg-accent-color-g: ${g};
                    --block-bg-accent-color-b: ${b};
                    --block-bg-accent-color-a: ${50};
                }
                `,
                sheet.cssRules.length
            );
        }
    };

    InitBuilder() {
        var scriptele = document.querySelector("script[data-builder]")
        var builder = this.CreateBuilder();
        scriptele.insertAdjacentElement('beforeBegin', builder);
        
        scriptele.remove();

        this.InsertRegexStyleEle();

        if (this.HasSavedBlockData())
            this.ShowRegexResults();
    };

    constructor() {
        this.InitBuilder();
        return this;
    }
};