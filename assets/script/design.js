console.log(calcTmBaseStacking("CCCAAATTTGGG"))
console.log(reverseComplement("GGGAATGCTTTG"))


// ToDo !
function primerFor(seq, vector5Prime, tm){
    
}

function primerRev(seq, vector3Prime, tm){

}

function extendToTm(seq){

}


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

function gcContent(seq){

}

function molWeight(seq){

}

function calcTmBasic(seq){
   
}


// Done

function calcTmBaseStacking(seq, concDNA=200, concNa=50, concMg=0){
    
    var s = 0;
    var h = 0;

    console.log(s, h)

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

    console.log(s)

    // Terminal corrections. Santalucia 1998;
    var firstNuc = seq.charAt(0);
    if (firstNuc =="G" || firstNuc == "C"){
        h += 0.1; 
        s += -2.8;
    };
    if (firstNuc == "A" || firstNuc == "T"){
        h += 2.3; 
        s += 4.1;
    };

    var lastNuc = seq.charAt(seq.length - 1);
    if (lastNuc == "G" || lastNuc == "C"){
        h += 0.1; 
        s += -2.8;
    };
    if (lastNuc == "A" || lastNuc == "T"){
        h += 2.3; 
        s += 4.1;
    };

    console.log(s, h)

    for(var i = 0; i < seq.length - 1; i++){
        var subSeq = seq.substr(i, 2);
        console.log(subSeq)
        h += enthalpyTable[subSeq];
        s += entropyTable[subSeq];
    };

    console.log(s, h)

    tm = ((1000 * h) / (s + (1.987 * Math.log(concDNA / 2000000000)))) - 273.15;

    values = {
        S: s,
        H: h,
        Tm: tm
    };

    return values
}



