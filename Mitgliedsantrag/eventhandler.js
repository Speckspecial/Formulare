\begin{insDLJS}[eventHandler]{eventHandler}{JavaScript}
function findOcg(name)
{
    var ocgs = this.getOCGs();
    if (ocgs)
    {
        for (var i = 0; i < ocgs.length; i++)
        {
            if (ocgs[i].name == name)
            {
                return ocgs[i];
            }
        }
    }
    return undefined;
}

function selectMemberType(caller)
{
    var MAXCHILDS = 4;
    var radioMembership = this.getField("radioMitgliedschaft").value;
    var checkFamilyPartner = this.getField("checkPartner").value != "Off";
    var numChilds = this.getField("choiceKinder").value;

    var ocgs = this.getOCGs();
    if (!ocgs) {
        return;
    }

    var ocgAdultDepartment;
    var ocgChild;
    var ocgFamily;
    var ocgPartner;
    var ocgChilds = new Array(MAXCHILDS);

    for (var i = 0; i < ocgs.length; i++)
    {
        if (ocgs[i].name == "AntragstellerAbteilung")
        {
            ocgAdultDepartment = ocgs[i];
        }
        else if (ocgs[i].name == "MeinKind")
        {
            ocgChild = ocgs[i];
        }
        else if (ocgs[i].name == "Familie")
        {
            ocgFamily = ocgs[i];
        }
        else if (ocgs[i].name == "Partner")
        {
            ocgPartner = ocgs[i];
        }
        else
        {
            for (var k = 0; k < MAXCHILDS; ++k)
            {
                var nameChild = "Kind" + k
                if (ocgs[i].name == nameChild)
                {
                    ocgChilds[k] = ocgs[i];
                }
            }
        }
    }

    function changeVisibilityMember(visible, postfix)
    {
        var displayVisible = visible ? display.visible : display.hidden;

        this.getField("txtVorname" + postfix).display = displayVisible;
        this.getField("txtNachname" + postfix).display = displayVisible;
        this.getField("txtGeburtsdatum" + postfix).display = displayVisible;
        this.getField("radioGeschlecht" + postfix).display = displayVisible;
        this.getField("radioAbteilung" + postfix).display = displayVisible;
    }

    function changeVisibilityAdult(visible)
    {
        ocgAdultDepartment.state = visible;

        var displayVisible = visible ? display.visible : display.hidden;
        this.getField("radioAbteilungAntragsteller").display = displayVisible;
    }
    function changeVisibilityChild(visible)
    {
        ocgChild.state = visible;
        changeVisibilityMember(visible, "Kind");
    }
    function changeVisibilityFamily(visible)
    {
        ocgFamily.state = visible;
        ocgAdultDepartment.state = visible;

        var displayVisible = visible ? display.visible : display.hidden;
        this.getField("radioAbteilungAntragsteller").display = displayVisible;
        this.getField("checkPartner").display = displayVisible;
        this.getField("choiceKinder").display = displayVisible;

        var checkBoxVisible = visible;
        if (! checkFamilyPartner)
        {
            checkBoxVisible = false;
        }
        ocgPartner.state = checkBoxVisible;
        changeVisibilityMember(checkBoxVisible, "Partner");

        for (var k = 0; k < numChilds; ++k)
        {
            ocgChilds[k].state = visible;
            changeVisibilityMember(visible, "Kind" + k);
        }
        for (var k = numChilds; k < MAXCHILDS; ++k)
        {
            ocgChilds[k].state = false;
            changeVisibilityMember(false, "Kind" + k);
        }
    }

    if (caller == "memberType")
    {
        radioMembership = event.value;
    }
    else if (caller == "checkPartner")
    {
        checkFamilyPartner = (event.value == "Yes");
    }
    else if (caller == "choiceKinder")
    {
        numChilds = event.value;
    }
    if (!numChilds || numChilds == "" || numChilds[4] == "@")
    {
        numChilds = 0;
    }
    else
    {
        % console.println("numChilds array " + numChilds);
        numChilds = numChilds[12];
    }
    % console.println("radioMembership " + radioMembership);
    % console.println("checkFamilyPartner " + checkFamilyPartner);
    % console.println("numChilds " + numChilds);

    switch (radioMembership[12])
    {
        case "E":
            % console.println("ADULT");
            changeVisibilityChild(false);
            changeVisibilityFamily(false);
            changeVisibilityAdult(true);
            break;
        case "K":
            % console.println("CHILD");
            changeVisibilityAdult(false);
            changeVisibilityFamily(false);
            changeVisibilityChild(true);
            break;
        case "F":
            % console.println("FAMILY");
            changeVisibilityAdult(false);
            changeVisibilityChild(false);
            changeVisibilityFamily(true);
            break;
    }
}

function selectPayor()
{
    if (event.value[12] == "A")
    {
        const fieldNames = [
            "txtVorname", "txtNachname", "txtGeburtsdatum",
            "txtStrasse", "txtHausNr", "txtPLZ", "txtOrt", "txtLand"
        ];
        const dst = "Zahler";
        const src = "Antragsteller";
        for (var k = 0; k < fieldNames.length; ++k)
        {
            const n = fieldNames[k];
            this.getField(n + dst).value = this.getField(n + src).value;
        }
        if (this.getField("txtLandZahler").value == "")
        {
            this.getField("txtLandZahler").value = "Deutschland";
        }
    }
}

function dateChecker(minMonth, maxMonth)
{
    var ocg = findOcg("ocg" + event.target.name);
    if (! ocg)
    {
        return;
    }

    var fieldVal = event.value;

    % console.println("dateChecker " + event.name + " " + fieldVal);

    var hideOcg = (fieldVal == "");
    if (! hideOcg)
    {
        var found = fieldVal.match(/^(\d\d?)\.(\d\d?)(\.\d\d\d\d?|\.|)$/);
        % console.println(found);
        if (found && found.length === 4)
        {
            var curDate = new Date();

            year = found[3].length > 1 ? found[3].slice(1) : curDate.getFullYear();
            month = found[2] - 1;
            day = found[1];
            const wantedDate = new Date(year, month, day);
            % console.println("Wanted " + wantedDate);
            if (wantedDate)
            {
                var minDate = new Date(curDate);
                minDate.setMonth(minDate.getMonth() + minMonth);
                var maxDate = new Date(curDate);
                maxDate.setMonth(maxDate.getMonth() + maxMonth);

                % console.println("Min " + minMonth + " " + minDate);
                % console.println("Max " + maxMonth + " " + maxDate);

                hideOcg = (wantedDate >= minDate && wantedDate <= maxDate);
            }
        }
    }
    ocg.state = !hideOcg;
}

function emailKeystroke()
{
    if (!event.willCommit && event.change != "")
    {
        var newValue = "";
        const checkValue = event.change.toLowerCase();

        for (var i = 0; i < checkValue.length; i++)
        {
            const ev = checkValue[i];
            if (/[a-z0-9._\-+@]/.test(ev))
            {
                newValue += ev;
            }
        }
        event.change = newValue;
    }
}

function emailChecker()
{
    var ocg = findOcg("ocg" + event.target.name);
    if (! ocg)
    {
        return;
    }

    var fieldVal = event.value;
    var hideOcg = (fieldVal == "");
    if (! hideOcg)
    {
        if (fieldVal.indexOf("..") < 0)
        {
            found = fieldVal.match(/^([a-z0-9][a-z0-9._\-+]*)@([a-z0-9][a-z0-9._\-+]*)$/);
            if (found)
            {
                hideOcg = found[2].indexOf(".") >= 0;
            }
        }
    }
    ocg.state = !hideOcg;
}

function phoneKeystroke()
{
    if (!event.willCommit && event.change != "")
    {
        var newValue = "";

        for (var i = 0; i < event.change.length; i++)
        {
            const ev = event.change[i];
            if ("+ 0123456789".indexOf(ev) >= 0)
            {
                newValue += ev;
            }
        }
        event.change = newValue;
    }
}

function phoneChecker()
{
    var ocg = findOcg("ocg" + event.target.name);
    if (! ocg)
    {
        return;
    }

    var fieldVal = event.value;
    var hideOcg = (fieldVal == "");
    if (! hideOcg)
    {
        hideOcg = /^ *[0-9+][0-9 ]+$/.test(fieldVal);
    }
    ocg.state = !hideOcg;
}

function ibanKeystroke()
{
    if (!event.willCommit && event.change != "")
    {
        var newValue = "";
        const checkValue = event.change.toUpperCase();

        for (var i = 0; i < checkValue.length; i++)
        {
            const ev = checkValue[i];
            if (/[A-Z0-9 ]/.test(ev))
            {
                newValue += ev;
            }
        }
        event.change = newValue;
    }
}

function ibanChecker()
{
    var ocg = findOcg("ocg" + event.target.name);
    if (! ocg)
    {
        return;
    }

    var hideOcg = (event.value == "");
    if (! hideOcg)
    {
        var fieldVal = event.value.replace(/ /gm,'');

        const code = fieldVal.match(/^([A-Z][A-Z])(\d\d)([A-Z0-9]+)$/);
        if (code)
        {
            const codeLengths = {
                AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
                BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28,
                EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23,
                GL: 18, GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26,
                IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20,
                LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30, NL: 18,
                NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24,
                SE: 24, SI: 19, SC: 31, SK: 24, SM: 27, ST: 25, SV: 28, TN: 24, TL: 23,
                TR: 26, UA: 29, VA: 22, VG: 24, XK: 20
            };
            if (fieldVal.length == codeLengths[code[1]])
            {
                const digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
                    return letter.charCodeAt(0) - 55;
                });
                
                var checksum = digits.slice(0, 2);
                var fragment;
                for (var offset = 2; offset < digits.length; offset += 7) 
                {
                    fragment = String(checksum) + digits.substring(offset, offset + 7);
                    checksum = parseInt(fragment, 10) \% 97; % skip meaning as Latex comment
                }
                
                hideOcg = (checksum == 1);
            }
        }
    }
    ocg.state = !hideOcg;
}
\end{insDLJS}
