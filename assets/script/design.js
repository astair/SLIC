// ToDo !
function molWeight(seq){

}

// Done
function calcTmBasic(seq, propz){
    var gcCount = 0;
    var atCount = 0;
    seq.split("").forEach(function(base){
        if (base === "G" || base === "C"){
            gcCount += 1;
        } else if (base === "A" || base === "T"){
            atCount += 1;
        }
    });
    if (seq.length < 14){
        Tm = 2 * atCount + 4 * gcCount;
    } else {
        Tm = 64.9 + 41 * (gcCount - 16.4) / (gcCount + atCount);
    };
    return {Tm: Tm}
};

function gcContent(seq){
    var gcCount = 0;
    seq.split("").forEach(function(base){
        if (base === "G" || base === "C"){
            gcCount += 1;
        }
    });
    return gcCount / seq.length;
};

function extendToTm(seq, propz, method){
    var tm = propz.Tm;
    if (method(seq, propz).Tm < tm){
        return;
    };
    var targetTm = 0;
    var hi = 1;
    var targetSeq = seq.substr(0, hi);
    while (method(targetSeq, propz).Tm < tm) {
        targetSeq = seq.substr(0, hi);
        hi ++;
    };

    return targetSeq;
};

function primerBasic(seq, propz, method){
    primerFor = extendToTm(seq, propz, method);
    primerRev = extendToTm(reverseComplement(seq), propz, method);
    primers = {
        for: primerFor,
        rev: primerRev
    };
    return primers;
};

function primerForSlic(seqz, propz, method, overhang="vector"){
    l = propz.overhangLength;
    switch (overhang){
        case "vector":
            var onInsert = seqz.ins.substr(-l, l);
            var onVector = extendToTm(seqz.vec5, propz, method);
            var primer = onInsert + onVector;
            break;
        case "insert":
            var onInsert = extendToTm(seqz.ins, propz, method);
            var onVector = seqz.vec3.substr(-l, l);
            var primer = onVector + onInsert;
            break;            
    }; 
    var result = {
        full: primer,
        onVector: onVector,
        onInsert: onInsert
    };
    return result;
};

function primerRevSlic(seqz, propz, method, overhang="vector"){
    l = propz.overhangLength;
    switch (overhang){
        case "vector":
            var onInsert = reverseComplement(seqz.ins.substr(0, l));
            var revVec = reverseComplement(seqz.vec3)
            var onVector = extendToTm(revVec, propz, method);
            var primer = onInsert + onVector;
            break;
        case "insert":
            var revIns = reverseComplement(seqz.ins)
            var onInsert = extendToTm(revIns, propz, method);
            var onVector = reverseComplement(seqz.vec5.substr(0, l));
            var primer = onVector + onInsert;
            break;            
    }; 
    var result = {
        full: primer,
        onVector: onVector,
        onInsert: onInsert
    };
    return result;
};


function reverseComplement(seq){
    var compBase = {
        "A" : "T",
        "T" : "A",
        "G" : "C",
        "C" : "G"
    };
    var compSeq = [];
    seq = seq.split("")
    seq.forEach(function(base){
        compSeq.push(compBase[base])
    });

    return compSeq.reverse().join("");
};

function calcTmBaseStacking(seq, propz){

    var concDNA = propz.concDNA;
    var concNa = propz.concNa;
    var concMg = propz.concMg;

    var s = 0;
    var h = 0;

    var enthalpyTable = {
        "AA": -7.9,
        "AC": -8.4,
        "AG": -7.8,
        "AT": -7.2,
        "CA": -8.5,
        "CC": -8.0,
        "CG": -10.6,
        "CT": -7.8,
        "GA": -8.2,
        "GC": -9.8,
        "GG": -8.0,
        "GT": -8.4,
        "TA": -7.2,
        "TC": -8.2,
        "TG": -8.5,
        "TT": -7.9
    };

    var entropyTable = {
        "AA": -22.2,
        "AC": -22.4,
        "AG": -21.0,
        "AT": -20.4,
        "CA": -22.7,
        "CC": -19.9,
        "CG": -27.2,
        "CT": -21.0,
        "GA": -22.2,
        "GC": -24.4,
        "GG": -19.9,
        "GT": -22.4,
        "TA": -21.3,
        "TC": -22.2,
        "TG": -22.7,
        "TT": -22.2
    };

    // Effect on entropy by salt correction; von Ahsen et al 1999;
    // Increase of stability due to presence of Mg;
    var saltEffect = (concNa / 1000) + ((concMg / 1000) * 140);
    s += 0.368 * (seq.length - 1) * Math.log(saltEffect);

    // Terminal corrections. Santalucia 1998;
    var firstNuc = seq.charAt(0);
    if (firstNuc ==="G" || firstNuc === "C"){
        h += 0.1; 
        s += -2.8;
    };
    if (firstNuc === "A" || firstNuc === "T"){
        h += 2.3; 
        s += 4.1;
    };

    var lastNuc = seq.charAt(seq.length - 1);
    if (lastNuc === "G" || lastNuc === "C"){
        h += 0.1; 
        s += -2.8;
    };
    if (lastNuc === "A" || lastNuc === "T"){
        h += 2.3; 
        s += 4.1;
    };

    for(var i = 0; i < seq.length - 1; i++){
        var subSeq = seq.substr(i, 2);
        h += enthalpyTable[subSeq];
        s += entropyTable[subSeq];
    };

    tm = ((1000 * h) / (s + (1.987 * Math.log(concDNA / 2000000000)))) - 273.15;

    values = {
        S: s,
        H: h,
        Tm: tm
    };
    return values
};

function roundTwo(num){
    return Math.round((num + 0.00001) * 100) / 100;
};

function roundThree(num){
    return Math.round((num + 0.00001) * 1000) / 1000;
};

// String.format helper function for filling in  the info 
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
};



