/*



*/

const RegexBuilder = (function() {
    let regexBlockData = [
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

    const RegexBlocks = {
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
    const RegexBlockColors = {
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

    const RegexColorMapping = {
        "/": 'gray',
        "\\": 'hotpink',
        "[": '#d70',
        "^": '#d70',
        "+": '#58f',
        "*": '#58f',
        "?": '#58f',
        "]": '#d70',
    };
    const RegexColorMapping_Wildcard = {
        "\\{\\d,(?:\\d|)\\}": '#58f'
    }

    function ExportBlocksToJson() {
        regexBlockData = [];
        [... document.querySelectorAll("#editor-area .regex-block")].forEach(ele => {
            console.log(ele.getElementsByClassName('block-content'));
            regexBlockData.push(
                {
                    'type': ele.getAttribute('type'),
                    'content': ele.getElementsByClassName('block-content')[0].innerHTML
                }
            );
        });
        return regexBlockData;
    }

    function ExportBlocksToRegex() {
        return (
            [...document.querySelectorAll("#editor-area .regex-block")].map(ele => {
                return RegexBlocks[ele.getAttribute('type')].func(ele.querySelector('.block-content').innerText.replace('\\\\', '\\'));
            })
        );
    }

    function ColorRegex(regexArray, flags = 'gi') {
        let finalColored = '<span style="color: gray">/</span>';
        for (let i = 0; i < regexArray.length; i++) {
            var regex = regexArray[i];
            let regexStrArray = regex.split('');
            let regexColor = ``;
            let lastColor = null;
            let strCache = '';
            for (let i = 0; i < regexStrArray.length; i++) {
                let char = regexStrArray[i];
                let color = RegexColorMapping[char];
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
                for (var [matchStr, colorStr] of Object.entries(RegexColorMapping_Wildcard)) {
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
            finalColored += `<div id="block-${i}" class="colored-regex-block-group">${regexColor}</div>`;
        }
        finalColored += `<span style="color: gray">/${flags}</span>`;
            
        return finalColored;
    }

    function ShowRegexResults() {
        var docFrag = new DocumentFragment();
        docFrag.innerHTML
        document.querySelector("#output-area").innerHTML =
            ColorRegex(ExportBlocksToRegex(), 'gi');
        document.querySelectorAll("#output-area .colored-regex-block-group").forEach(regexBlock => {
            regexBlock.onmouseenter = ((e) => {
                var ele = !e.target.className.includes('colored-regex-block-group') ? e.target.parentElement : e.target;
                ele.classList.add('highlighted');
                var i = parseInt(ele.id.replace('block-', ''));
                //console.log(i);
                document.querySelectorAll('#editor-area .regex-block')[i].classList.add('highlighted');
            });
            regexBlock.onmouseleave = ((e) => {
                var ele = !e.target.className.includes('colored-regex-block-group') ? e.target.parentElement : e.target;
                ele.classList.remove('highlighted');
                var i = parseInt(ele.id.replace('block-', ''));
                //console.log(i);
                document.querySelectorAll('#editor-area .regex-block')[i].classList.remove('highlighted');
            });
        });
    }

    function TestInputAgainstRegex() {
        var inputEle = document.querySelector('#testing-input');
        var regexPasses = new RegExp(ExportBlocksToRegex().join("")).test(inputEle.value);
        inputEle.style['border-color'] = (regexPasses ? '#00ff43' : 'inherit');


        document.querySelectorAll('.colored-regex-block-group.underline').forEach(ele =>
            ele.classList.remove('underline', 'good', 'bad')
        );

        if (!regexPasses) {
            var testStr = inputEle.value;
            var tempStr = testStr;
            var regParts = RegexBuilder.Export.BlocksToRegex();
            var partIndex = 0;
            var passed = true;
            for (const part of regParts) {
                //console.log(part);
                var regex = new RegExp(part);
                //console.log(regex);
                var res = regex.exec(tempStr);
                if (res != null && res.length == 1) {
                    document.getElementById(`block-${partIndex}`).classList.add('underline', 'good');
                    tempStr = tempStr.substring(res[0].length);
                } else {
                    passed = false;
                    break;
                }
                partIndex++;
            }
            if (!passed) {
                document.getElementById(`block-${partIndex}`).classList.add('underline', 'bad');
                //var passedParts = regParts.slice(0,partIndex).join("");
                //console.log(passedParts + regParts[partIndex]);
                //console.log(' '.repeat(passedParts.length) + '^'.repeat(regParts[partIndex].length));
            }
        }
    }

    let CurrentDragDropName = '';

    function CreateUserRegexBlock(type, content) {

        let regexBlock = document.createElement('div');
        regexBlock.classList.add('regex-block');
        regexBlock.setAttribute('type', type);
    
        let regexBlockDesc = document.createElement('div');
        regexBlockDesc.classList.add('block-desc');
        regexBlockDesc.innerText = RegexBlocks[type].desc;
    
        let regexBlockContent = document.createElement('div');
        regexBlockContent.classList.add('block-content');
        regexBlockContent.innerText = content;
    
        regexBlockContent.addEventListener('dblclick', (e) => {
            if (!RegexBlocks[type].hasValue) return;
            newContentValue = prompt('Regex block contents:', e.target.innerHTML);
            if (newContentValue) {
                e.target.innerText = newContentValue;
                ShowRegexResults();
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
                ShowRegexResults();
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
            document.getElementById(`block-${i}`).classList.add('highlighted');
        });
        regexBlock.onmouseleave = ((e) => {
            var ele = !e.target.className.includes('regex-block') ? e.target.parentElement : e.target;
            //console.log(ele);
            ele.classList.remove('highlighted');
            var i = (([... ele.parentNode.childNodes].indexOf(ele)) - 1) / 2;
            //console.log(i);
            document.getElementById(`block-${i}`).classList.remove('highlighted');
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
            ShowRegexResults();
        });
        regexBlock.addEventListener('dragover',  (e) => {
            e.preventDefault();
            if (CurrentDragDropName != 'delete')
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
    
        var spacerEle = CreateSpacerPlaceholder();
        //editor.appendChild(spacerEle);
        
        var docFrag = new DocumentFragment();
        docFrag.appendChild(regexBlock);
        docFrag.appendChild(spacerEle);
        return docFrag;
    
    }

    function CreateSpacerPlaceholder() {
        var spacerEle = document.createElement('div');
        spacerEle.classList.add('block-spacer-selector', 'hidden');
        spacerEle.addEventListener('drop', (e) => {
            e.preventDefault();
            var data = e.dataTransfer.getData("Text");
            e.target.classList.add('hidden');
            console.log(data);
            if (data != 'delete') {
                [...CreateUserRegexBlock(data, ' ').childNodes].reverse().forEach(ele => {
                    ele.style['max-width'] = '0px';
                    ele.style['min-width'] = '0px';
                    ele.style['width'] = '0px';
                    e.target.insertAdjacentElement('afterEnd', ele);
                    ele.style['max-width'] = null;
                    ele.style['min-width'] = null;
                    ele.style['width'] = null;
                });
                ShowRegexResults();
            }
            document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
        });
        spacerEle.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (CurrentDragDropName == 'delete')
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
    }

    function CreateToolbarRegexBlock(type) {
    
        let blockData = RegexBlocks[type];
        let regexBlock = document.createElement('div');
        regexBlock.classList.add('regex-block', 'toolbar-block');
        regexBlock.setAttribute('type', type);
    
        let regexBlockDesc = document.createElement('div');
        regexBlockDesc.classList.add('block-desc');
        regexBlockDesc.innerText = blockData.desc;
    
        regexBlock.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("Text", e.target.getAttribute('type'));
            CurrentDragDropName = 'toolbar-regex-block'
            document.documentElement.style.setProperty('--user-regex-block-opacity', '0.3');
            document.documentElement.style.setProperty('--spacer-block-opacity', '0.9');
        });
    
        regexBlock.addEventListener('dragend', (e) => {
            e.preventDefault();
            document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
            document.documentElement.style.setProperty('--spacer-block-opacity', '0.0');
            CurrentDragDropName = '';
        });
        
        regexBlock.setAttribute('draggable', true);
    
        regexBlock.appendChild(regexBlockDesc);
        return regexBlock;
    
    }

    function CreateToolbarRegexBlocks(ele = null) {
        const toolbar = ele || document.getElementById('toolbar-area');
        for (let k in RegexBlocks) {
            //let block = RegexBlocks[k];
    
            var regexBlock = CreateToolbarRegexBlock(k);
            toolbar.appendChild(regexBlock);
        }
    }

    function CreateToolbarDeleterBlock() {
        let deleter = document.getElementById('block-delter');
        if (!deleter) {
            deleter = document.createElement('div');
            deleter.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData("Text", 'delete');
                CurrentDragDropName = 'delete';
                document.documentElement.style.setProperty('--user-regex-block-opacity', '0.3');
            });
            deleter.addEventListener('dragend', (e) => {
                e.preventDefault();
                document.documentElement.style.setProperty('--user-regex-block-opacity', '1');
                CurrentDragDropName = '';
            });
        }
        deleter.setAttribute('draggable', true);
        deleter.id = 'block-deleter';
        return deleter;
    }

    function HasSavedBlockData() {
        return (regexBlockData && typeof regexBlockData === typeof [] && regexBlockData.length != 0);
    }

    function CreateBuilder() {
        const builder = document.createElement('div');
        builder.id = 'regex-builder';

        const toolbar = document.createElement('div');
        toolbar.id = 'toolbar-area';
        const deleterDiv = CreateToolbarDeleterBlock();
        toolbar.appendChild(deleterDiv);
        CreateToolbarRegexBlocks(toolbar);

        const editor = document.createElement('div');
        editor.id = 'editor-area';
        editor.appendChild(CreateSpacerPlaceholder());
        if (HasSavedBlockData()) {
            for (let i = 0; i < regexBlockData.length; i++) {
                let blockData = regexBlockData[i];
                editor.appendChild(CreateUserRegexBlock(blockData.type, blockData.content));
            }
        } else {
        }

        const output = document.createElement('div');
        output.id = 'output-area';

        const tester = document.createElement('div');
        tester.id = 'testing-area';
        const test_input = document.createElement('input');
        test_input.id = 'testing-input';
        test_input.spellcheck = false;
        test_input.addEventListener('input', TestInputAgainstRegex);
        tester.appendChild(test_input)

        builder.appendChild(toolbar);
        builder.appendChild(editor);
        builder.appendChild(output);
        builder.appendChild(tester);

        return builder;
    }

    function HexToRGBA(h) {
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
    }

    function InsertRegexStyleEle() {
        const sheet = window.document.styleSheets[0];
        for (const [key, colorsData] of Object.entries(RegexBlockColors)) {
            const [bg, bc] = colorsData;
            const [rgbaBg, rgbaB] = [(bg.includes('#') ? HexToRGBA(bg) : bg), /*(bc.includes('#') ? HexToRGBA(bc) : bc)*/ null];
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
                    --block-bg-accent-color-a: ${a};
                }
                `,
                sheet.cssRules.length
            );
        }
    }

    function InitBuilder() {
        var scriptele = document.querySelector("script[data-builder]")
        var builder = CreateBuilder();
        scriptele.insertAdjacentElement('beforeBegin', builder);
        
        scriptele.remove();

        InsertRegexStyleEle();

        if (HasSavedBlockData())
            ShowRegexResults();
    }

    return {
        Init: InitBuilder,
        Factory: {
            ToolbarDeleterBlock: CreateToolbarDeleterBlock,
            ToolbarRegexBlock: CreateToolbarRegexBlock,
            ToolbarRegexBlocks: CreateToolbarRegexBlocks,
            UserRegexBlock: CreateUserRegexBlock,
            SpacerPlaceholder: CreateSpacerPlaceholder
        },
        ShowRegexResults: ShowRegexResults,
        GenerateColoredRegex: ColorRegex,
        Export: {
            BlocksToRegex: ExportBlocksToRegex,
            BlocksToJson: ExportBlocksToJson
        },
        RegexBlockDefinitions: RegexBlocks,
        RegexColorMapping: RegexColorMapping,
        RegexColorMapping_Wildcard: RegexColorMapping_Wildcard
    }
}());