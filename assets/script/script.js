$('.ui.dropdown')
    .dropdown()
;

$("form").on("submit",  function(event){
    event.preventDefault();

    var data = $(this).serializeArray().reduce(function(obj, item){
        obj[item.name] = item.value;
        return obj;
    }, {});

    var propz = {
        Tm: Number(data.tmMin),
        concDNA: 200,
        concNa: 50,
        concMg: 0
    };

    var insert = data.insert.toUpperCase();
    var vector5Prime = data.vector5.toUpperCase();
    var vector3Prime = data.vector3.toUpperCase();
    var methodChoice = data.method;
    if (methodChoice == "BS"){
        var calcTm = calcTmBaseStacking;
    };

    var primerFor = primerForSlic(insert, vector5Prime, propz, calcTm);
    var primerRev = primerRevSlic(insert, vector3Prime, propz, calcTm);
    var tmObjFor = calcTm(primerFor.onVector, propz);
    var tmObjRev = calcTm(primerRev.onVector, propz);

    Primers = [
        {
            name: "[Insert] forward primer",
            seq: primerFor.primer,
            onInsert: primerFor.onInsert,
            onVector: primerFor.onVector,
            Tm: roundTwo(tmObjFor.Tm),
            S: roundTwo(tmObjFor.S),
            H: roundTwo(tmObjFor.H),
            cgCont: roundTwo(gcContent(primerFor.primer) * 100)
        },
        {
            name: "[Insert] forward primer",
            seq: primerFor.primer,
            onInsert: primerFor.onInsert,
            onVector: primerFor.onVector,
            Tm: roundTwo(tmObjFor.Tm),
            S: roundTwo(tmObjFor.S),
            H: roundTwo(tmObjFor.H),
            cgCont: roundTwo(gcContent(primerFor.primer) * 100)
        },
        {
            name: "[Insert] forward primer",
            seq: primerFor.primer,
            onInsert: primerFor.onInsert,
            onVector: primerFor.onVector,
            Tm: roundTwo(tmObjFor.Tm),
            S: roundTwo(tmObjFor.S),
            H: roundTwo(tmObjFor.H),
            cgCont: roundTwo(gcContent(primerFor.primer) * 100)
        },
        {
            name: "[Insert] forward primer",
            seq: primerFor.primer,
            onInsert: primerFor.onInsert,
            onVector: primerFor.onVector,
            Tm: roundTwo(tmObjFor.Tm),
            S: roundTwo(tmObjFor.S),
            H: roundTwo(tmObjFor.H),
            cgCont: roundTwo(gcContent(primerFor.primer) * 100)
        }
        ]

    // Forward primer
    var primerFor = primerForSlic(insert, vector5Prime, propz, calcTm);
    var tmObjFor = calcTm(primerFor.onVector, propz);
    var tmFor = roundTwo(tmObjFor.Tm);
    var sFor = roundTwo(tmObjFor.S);
    var hFor = roundTwo(tmObjFor.H);    
    var gcFor = roundTwo(gcContent(primerFor.primer) * 100);

    // Reverse primer
    var primerRev = primerRevSlic(insert, vector3Prime, propz, calcTm);
    var tmObjRev = calcTm(primerRev.onVector, propz);
    var tmRev = roundTwo(tmObjRev.Tm);
    var sRev = roundTwo(tmObjRev.S);
    var hRev = roundTwo(tmObjRev.H);
    var gcRev = roundTwo(gcContent(primerRev.primer) * 100);
    
    // Fill in info field
    $("#primersField").val(">primer_for\n" + primerFor.primer + "\n" + ">primer_rev\n" + primerRev.primer);
    $("#info1 #headerInfo").text("Forward primer");
    $("#info1 #info").html("<p><strong>Tm: </strong>" + tmFor + " °C</p><p><strong>H: </strong>" + hFor + "</p><p><strong>S: </strong>" + sFor + "</p><p><strong>GC-content: </strong>" + gcFor + "%</p>");
    $("#info2 #headerInfo").text("Reverse primer");
    $("#info2 #info").html("<p><strong>Tm: </strong>" + tmRev + " °C</p><p><strong>H: </strong>" + hRev + "</p><p><strong>S: </strong>" + sRev + "</p><p><strong>GC-content: </strong>" + gcRev + "%</p>");

    // Display primer and info field
    $("#primersField").css("display", "block");
    $("#primersInfo").css("display", "block");

    // Scroll the page down
    var dist = $(document).height();
    $('html, body').animate({ scrollTop: dist }, 1000);
});
// <p></p>
// console.log(primerForSlic(insert, vector5Prime, propz, method));
